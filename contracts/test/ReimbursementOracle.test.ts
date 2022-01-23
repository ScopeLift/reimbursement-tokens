// External imports
import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

// Internal imports
import { UniV3ReimbursementOracle, MockToken } from "../typechain/";
import { deployReimbursementOracle, getNow, toWad } from "./utils";
import { deployTokens, UniV3 } from "./setup";

// Conevenience variables
const { loadFixture } = waffle;

describe.only("ReimbursementOracle", () => {
  let deployer: SignerWithAddress; // contract deployer & default account
  let oracle: UniV3ReimbursementOracle;
  let treasuryToken: MockToken;
  let collateralToken: MockToken;

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
      amount0: tokenUnit.treasury(3),
      amount1: tokenUnit.collateral(4),
    });
    await uni.addLiquidity({
      fee: 3000,
      token0Address: treasuryToken.address,
      token1Address: collateralToken.address,
      amount0: tokenUnit.treasury(3e7),
      amount1: tokenUnit.collateral(4e7),
    });
    const oracle = await deployReimbursementOracle(deployer, [pool.address, 1, tokenUnit.treasury(1)]);
    const now = await getNow(ethers.provider);
    await ethers.provider.send("evm_setNextBlockTimestamp", [now + 4000]);
    return { pool, oracle, treasuryToken, collateralToken };
  }

  beforeEach(async () => {
    ({ oracle, treasuryToken, collateralToken } = await loadFixture(setup));
  });

  describe("deployment and setup", () => {
    it("should be an oracle", async () => {
      const quote = await oracle.getOracleQuote(collateralToken.address, treasuryToken.address);
      expect(quote).to.eq(toWad("75", 4));
    });
  });
});
