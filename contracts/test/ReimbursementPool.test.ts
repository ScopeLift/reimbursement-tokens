// External imports
import { artifacts, ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

// Internal imports
import { ReimbursementToken, MockToken, ReimbursementPool } from "../typechain/";
import { deployMockToken, deployRiToken } from "./utils";

// Conevenience variables
const { deployContract, loadFixture } = waffle;
const { parseUnits } = ethers.utils;

// Test inputs
const tokenName = "Reimbursement Token";
const tokenSymbol = "RIT";
const maturityDate = 2000000000; // Unix timestamp far in the future
const riTokenSupply = parseUnits("1000000", 18);
const treasuryTokenSupply = parseUnits("1000000", 18);
const collateralTokenSupply = parseUnits("1000000", 18);
const mintReceiver = ethers.Wallet.createRandom().address;
const maturityExchangeRate = parseUnits("1", 18);

export const deployPool = (deployer: SignerWithAddress, params: Array<any>) => {
  const artifact = artifacts.readArtifactSync("ReimbursementPool");
  return deployContract(deployer, artifact, params) as Promise<ReimbursementPool>;
};

describe("ReimbursementToken", () => {
  let deployer: SignerWithAddress;
  let riToken: ReimbursementToken;
  let riPool: ReimbursementPool;
  let treasuryToken: MockToken;
  let collateralToken: MockToken;

  before(async () => {
    [deployer] = await ethers.getSigners();
  });

  async function setup() {
    const treasuryToken = (await deployMockToken(deployer)) as MockToken;
    await treasuryToken.mint(deployer.address, treasuryTokenSupply);

    const riToken = (await deployRiToken(deployer, [
      tokenName,
      tokenSymbol,
      maturityDate,
      treasuryToken.address,
      riTokenSupply,
      mintReceiver,
    ])) as ReimbursementToken;

    const collateralToken = (await deployMockToken(deployer)) as MockToken;
    await collateralToken.mint(deployer.address, collateralTokenSupply);

    const riPool = await deployPool(deployer, [riToken.address, collateralToken.address, maturityExchangeRate]);

    return { treasuryToken, riToken, collateralToken, riPool };
  }

  beforeEach(async () => {
    ({ treasuryToken, riToken, collateralToken, riPool } = await loadFixture(setup));
  });

  describe('deployment and setup', () => {
    it('should set the deployed pool contract with the correct configuration', async () => {
      expect(await riPool.riToken()).to.equal(riToken.address);
      expect(await riPool.treasuryToken()).to.equal(treasuryToken.address);
      expect(await riPool.collateralToken()).to.equal(collateralToken.address);
      expect(await riPool.maturityDate()).to.equal(maturityDate);
      expect(await riPool.maturityExchangeRate()).to.equal(maturityExchangeRate);
    });
  });
});
