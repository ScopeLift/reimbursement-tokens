// External imports
import { ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

// Internal imports
import { UniV3ReimbursementOracle } from "../typechain/";
import { deployReimbursementOracle } from "./utils";

// Conevenience variables
const { loadFixture } = waffle;
const { AddressZero } = ethers.constants;

describe.only("ReimbursementOracle", () => {
  let deployer: SignerWithAddress; // contract deployer & default account
  let oracle: UniV3ReimbursementOracle;

  before(async () => {
    [deployer] = await ethers.getSigners();
  });

  async function setup() {
    // create treasury token and mint to deployer
    const oracle = await deployReimbursementOracle(deployer, []);
    return { oracle };
  }

  beforeEach(async () => {
    ({ oracle } = await loadFixture(setup));
  });

  describe("deployment and setup", () => {
    it("should be an oracle", async () => {
      const quote = await oracle.getOracleQuote(AddressZero, AddressZero);
      expect(quote).to.eq(0);
    });
  });
});
