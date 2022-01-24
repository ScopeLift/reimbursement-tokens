import { ethers } from "hardhat";
import {
  abi as FACTORY_ABI,
  bytecode as FACTORY_BYTECODE,
} from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import {
  abi as POSITION_MANAGER_ABI,
  bytecode as POSITION_MANAGER_BYTECODE,
} from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import { abi as POOL_ABI } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { encodeSqrtRatioX96, FeeAmount, nearestUsableTick, TickMath, TICK_SPACINGS } from "@uniswap/v3-sdk";
import { deployMockToken, unit } from "./utils";

import {
  NonfungiblePositionManager,
  SwapRouter,
  SwapRouter__factory,
  IUniswapV3Factory,
  ERC20__factory,
  MockToken__factory,
  IUniswapV3Pool,
} from "../typechain";

export const deployTokens = async (deployer: SignerWithAddress) => {
  const treasuryTokenDecimals = 6;
  const treasuryTokenInitialSupply = ethers.utils.parseUnits("1000000000", treasuryTokenDecimals); // 1 billion
  const collateralTokenDecimals = 8;
  const collateralTokenInitialSupply = ethers.utils.parseUnits("21000000", collateralTokenDecimals); // 21 million
  const treasuryToken = await deployMockToken(deployer, "Stable Coin", "STAB", treasuryTokenDecimals);
  await treasuryToken.mint(deployer.address, treasuryTokenInitialSupply);
  const collateralToken = await deployMockToken(deployer, "Governance Token", "GOV", collateralTokenDecimals);
  await collateralToken.mint(deployer.address, collateralTokenInitialSupply);
  const weth = await deployMockToken(deployer, "Wrapped ETH", "WETH", 18);
  // create helper methods to format token units
  const tokenUnit = {
    treasury: unit(treasuryTokenDecimals),
    collateral: unit(collateralTokenDecimals),
    weth: unit(18),
  };
  return { treasuryToken, collateralToken, weth, tokenUnit };
};

export class UniV3 {
  public readonly weth: string;
  public declare readonly deployer: SignerWithAddress;
  public declare uniswapV3Factory: IUniswapV3Factory;
  public declare nonfungiblePositionManager: NonfungiblePositionManager;
  public declare swapRouter: SwapRouter;

  constructor(weth: string, deployer: SignerWithAddress) {
    this.deployer = deployer;
    this.weth = weth;
  }

  async deployUniswapV3Factory() {
    const UniswapV3FactoryFactory = new ethers.ContractFactory(FACTORY_ABI, FACTORY_BYTECODE, this.deployer);
    this.uniswapV3Factory = <IUniswapV3Factory>await UniswapV3FactoryFactory.deploy();
    return this.uniswapV3Factory;
  }

  async deploySwapRouter() {
    if (this.uniswapV3Factory == null) {
      throw new Error("UniswapV3Factory is not deployed.");
    }
    const SwapRouter = new SwapRouter__factory(this.deployer);
    this.swapRouter = await SwapRouter.deploy(this.uniswapV3Factory?.address, this.weth);
    return this.swapRouter;
  }

  async deployNonfungiblePositionManager() {
    if (this.uniswapV3Factory == null) {
      throw new Error("UniswapV3Factory is not deployed.");
    }
    const nonfungibleTokenPositionDescriptorAddress = ethers.constants.AddressZero;
    const contract = new ethers.ContractFactory(POSITION_MANAGER_ABI, POSITION_MANAGER_BYTECODE, this.deployer);
    this.nonfungiblePositionManager = <NonfungiblePositionManager>(
      await contract.deploy(this.uniswapV3Factory.address, this.weth, nonfungibleTokenPositionDescriptorAddress)
    );
    return this.nonfungiblePositionManager;
  }

  async deployAll() {
    const factory = await this.deployUniswapV3Factory();
    const swapRouter = await this.deploySwapRouter();
    const nonfungiblePositionManager = await this.deployNonfungiblePositionManager();
    return { factory, swapRouter, nonfungiblePositionManager };
  }

  async createPool({
    token0Address,
    token1Address,
    fee,
    amount0,
    amount1,
  }: {
    token0Address: string;
    token1Address: string;
    fee: FeeAmount;
    amount0: string | number;
    amount1: string | number;
  }) {
    const isToken0Token0 = token0Address < token1Address;
    const [amt0, amt1, token0, token1] = isToken0Token0
      ? [
          amount0,
          amount1,
          await ERC20__factory.connect(token0Address, this.deployer),
          await ERC20__factory.connect(token1Address, this.deployer),
        ]
      : [
          amount1,
          amount0,
          await ERC20__factory.connect(token1Address, this.deployer),
          await ERC20__factory.connect(token0Address, this.deployer),
        ];
    const ratio = encodeSqrtRatioX96(amt1, amt0);
    await this.nonfungiblePositionManager.createAndInitializePoolIfNecessary(
      token0.address,
      token1.address,
      fee,
      ratio.toString(),
    );
    const poolAddress = await this.uniswapV3Factory.getPool(token0.address, token1.address, fee);
    const pool = <IUniswapV3Pool>await ethers.getContractAt(POOL_ABI, poolAddress);
    return pool;
  }

  async addLiquidity({
    token0Address,
    token1Address,
    fee,
    amount0,
    amount1,
  }: {
    token0Address: string;
    token1Address: string;
    fee: FeeAmount;
    amount0: string | number;
    amount1: string | number;
  }) {
    const isToken0Token0 = token0Address < token1Address;
    const [amt0, amt1, token0, token1] = isToken0Token0
      ? [
          amount0,
          amount1,
          await MockToken__factory.connect(token0Address, this.deployer),
          await MockToken__factory.connect(token1Address, this.deployer),
        ]
      : [
          amount1,
          amount0,
          await MockToken__factory.connect(token1Address, this.deployer),
          await MockToken__factory.connect(token0Address, this.deployer),
        ];
    const ratio = encodeSqrtRatioX96(amt1, amt0);
    const tick = TickMath.getTickAtSqrtRatio(ratio);
    const tickSpacing = TICK_SPACINGS[fee];
    await token0.approve(this.nonfungiblePositionManager.address, amt0);
    await token1.approve(this.nonfungiblePositionManager.address, amt1);

    if ((await token0.balanceOf(this.deployer.address)).lt(amt0)) await token0.mint(this.deployer.address, amt0);
    if ((await token1.balanceOf(this.deployer.address)).lt(amt1)) await token1.mint(this.deployer.address, amt1);

    return this.nonfungiblePositionManager.mint({
      token0: token0.address,
      token1: token1.address,
      fee,
      tickLower: nearestUsableTick(tick, tickSpacing) - tickSpacing,
      tickUpper: nearestUsableTick(tick, tickSpacing) + tickSpacing,
      amount0Desired: amt0,
      amount1Desired: amt1,
      amount0Min: 0,
      amount1Min: 0,
      recipient: this.deployer.address,
      deadline: Math.ceil(Date.now() / 1000) + 60,
    });
  }
}
