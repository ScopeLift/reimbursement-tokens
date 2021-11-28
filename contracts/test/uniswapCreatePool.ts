import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { encodeSqrtRatioX96, FeeAmount, TICK_SPACINGS } from "@uniswap/v3-sdk";
import {
  IERC20Metadata__factory,
  NonfungiblePositionManager__factory,
  SwapRouter__factory,
  UniswapV3Factory__factory,
  UniswapV3Pool__factory,
  ERC20__factory,
} from "../typechain";

export const createPool = async (args: {
  fee: number;
  amount0: number;
  amount1: number;
  contract: string;
  deployer: SignerWithAddress;
  token0: string;
  token1: string;
}) => {
  const fee: FeeAmount = args.fee;
  const ratio = encodeSqrtRatioX96(args.amount1, args.amount0);

  const nfpManager = await NonfungiblePositionManager__factory.connect(args.contract, args.deployer);

  console.log(nfpManager.address);
  const token0 = await ERC20__factory.connect(args.token0, args.deployer);
  const token1 = await ERC20__factory.connect(args.token1, args.deployer);
  const symbol0 = await token0.symbol();
  const symbol1 = await token1.symbol();

  console.log(`Create pool ${symbol0}/${symbol1}`);
  console.log(ratio.toString());
  await nfpManager.createAndInitializePoolIfNecessary(args.token0, args.token1, fee, ratio.toString());
  console.log("ok");
  const factory = await UniswapV3Factory__factory.connect(await nfpManager.factory(), args.deployer);
  const poolAddress = await factory.getPool(args.token0, args.token1, fee);
  console.log(poolAddress + "\n");

  return poolAddress;
};
