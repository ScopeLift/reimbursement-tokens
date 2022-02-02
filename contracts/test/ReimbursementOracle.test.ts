// External imports
import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

// Internal imports
import { deployReimbursementOracle, fastForward, getNow, isApproximate, toWad } from "./utils";
import { deployTokens, UniV3 } from "./setup";
import { IUniswapV3Pool, MockToken } from "../typechain";

// Conevenience variables
const { loadFixture } = waffle;
const { AddressZero } = ethers.constants;

describe("ReimbursementOracle", () => {
  let deployer: SignerWithAddress; // contract deployer & default account
  let treasuryToken: MockToken;
  let collateralToken: MockToken;
  let pool: IUniswapV3Pool;
  let tokenUnit: Record<string, any>;

  before(async () => {
    [deployer] = await ethers.getSigners();
  });

  async function setup() {
    const { treasuryToken, collateralToken, weth, tokenUnit } = await deployTokens(deployer);
    const uni = new UniV3(weth.address, deployer);
    await uni.deployAll();
    const pool = await uni.createPool({
      fee: 3000,
      token0Address: treasuryToken.address,
      token1Address: collateralToken.address,
      amount0: tokenUnit.treasury(1),
      amount1: tokenUnit.collateral(4),
    });
    await uni.addLiquidity({
      fee: 3000,
      token0Address: treasuryToken.address,
      token1Address: collateralToken.address,
      amount0: tokenUnit.treasury(1e7),
      amount1: tokenUnit.collateral(4e7),
    });
    const now = await getNow();
    await ethers.provider.send("evm_setNextBlockTimestamp", [now + 300]);
    return { pool, treasuryToken, collateralToken, tokenUnit };
  }

  beforeEach(async () => {
    ({ treasuryToken, collateralToken, pool, tokenUnit } = await loadFixture(setup));
  });

  describe("Uniswap v3 oracle implementation", () => {
    it("gets exchange rate", async () => {
      const oracle = await deployReimbursementOracle(deployer, [
        pool.address,
        10, // 10 seconds ago
      ]);
      // "give me 1 collateral token expressed as a treasury token"
      const quote = await oracle.getOracleQuote(collateralToken.address, treasuryToken.address);
      // The amount of treasuryToken received for 1 collateralToken, expressed as a WAD
      expect(isApproximate(quote, toWad(tokenUnit.treasury(".25"), await treasuryToken.decimals()))).to.be.true; // aka "price of 1 collateralToken is .25 treasuryToken"
    });

    it("reverts if price not old enough", async () => {
      const oracle = await deployReimbursementOracle(deployer, [
        pool.address,
        600, // 10 minutes
      ]);
      await expect(oracle.getOracleQuote(collateralToken.address, treasuryToken.address)).to.be.revertedWith("OLD");
      // then succeeds...
      await fastForward(600);
      const quote = await oracle.getOracleQuote(collateralToken.address, treasuryToken.address);
      expect(isApproximate(quote, toWad(tokenUnit.treasury(".25"), await treasuryToken.decimals()))).to.be.true;
    });

    it("reverts if no pool address supplied", async () => {
      await expect(
        deployReimbursementOracle(deployer, [
          AddressZero,
          600, // 10 minutes
        ]),
      ).to.be.revertedWith("pool");
    });

    it("reverts if no period is supplied", async () => {
      await expect(deployReimbursementOracle(deployer, [pool.address, 0])).to.be.revertedWith("period");
    });

    it("reverts on quotes for wrong token addresses", async () => {
      const oracle = await deployReimbursementOracle(deployer, [
        pool.address,
        10, // 10 seconds ago
      ]);
      const problemToken = ethers.Wallet.createRandom();
      await expect(oracle.getOracleQuote(problemToken.address, treasuryToken.address)).to.be.revertedWith(
        "oracle token",
      );
      await expect(oracle.getOracleQuote(collateralToken.address, problemToken.address)).to.be.revertedWith(
        "oracle token",
      );
    });

    it("gives reciprocal when token0 and token1 are switched", async () => {
      const oracle = await deployReimbursementOracle(deployer, [
        pool.address,
        10, // 10 seconds ago
      ]);
      const quote = await oracle.getOracleQuote(treasuryToken.address, collateralToken.address);
      expect(isApproximate(quote, toWad(tokenUnit.collateral("4"), await collateralToken.decimals()))).to.be.true;
    });
  });
});
