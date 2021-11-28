import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { encodeSqrtRatioX96, FeeAmount, nearestUsableTick, TickMath, TICK_SPACINGS } from "@uniswap/v3-sdk";
import { ERC20__factory, NonfungiblePositionManager__factory } from "../typechain";

export const addLiquidity = async (args: {
  contract: string;
  token0: string;
  token1: string;
  fee: 500 | 3000 | 10000;
  amount0: number;
  amount1: number;
  amount0min: number;
  amount1min: number;
  deadline: string;
  signer: SignerWithAddress;
}) => {
  const fee: FeeAmount = args.fee;
  const ratio = encodeSqrtRatioX96(args.amount1, args.amount0);
  const tick = TickMath.getTickAtSqrtRatio(ratio);
  const tickSpacing = TICK_SPACINGS[fee];
  const deadline = Math.ceil(Date.now() / 1000) + 60 * parseInt(args.deadline, 10);
  const nfpManager = await NonfungiblePositionManager__factory.connect(args.contract, args.signer);
  console.log(`uniswap:add-liquidity > nfpManager: ${nfpManager.address}`);
  const token0 = await ERC20__factory.connect(args.token0, args.signer);
  const token1 = await ERC20__factory.connect(args.token1, args.signer);

  console.log("Approve spender to transfer money");
  await token0.approve(nfpManager.address, args.amount0);
  await token1.approve(nfpManager.address, args.amount1);

  console.log("Add liquidity");
  const mintParams = {
    token0: args.token0,
    token1: args.token1,
    fee,
    tickLower: nearestUsableTick(tick, tickSpacing) - tickSpacing,
    tickUpper: nearestUsableTick(tick, tickSpacing) + tickSpacing,
    amount0Desired: args.amount0,
    amount1Desired: args.amount1,
    amount0Min: args.amount0min,
    amount1Min: args.amount1min,
    recipient: args.signer.address,
    deadline,
  };
  console.log("params:", mintParams);
  return nfpManager.mint(mintParams);
};
