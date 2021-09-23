// External imports
import { ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

// Internal imports
import { ReimbursementToken } from "../typechain/ReimbursementToken";
import { MockToken } from "../typechain/MockToken";
import { deployMockToken, deployRiToken } from "./utils";

// Conevenience variables
const { loadFixture } = waffle;
const { parseUnits } = ethers.utils;

// Test inputs
const tokenName = "Reimbursement Token";
const tokenSymbol = "RIT";
const maturityDate = 2000000000; // Unix timestamp far in the future
const tokenSupply = parseUnits("1000000", 18);
const mintReceiver = ethers.Wallet.createRandom().address;

describe("ReimbursementToken", () => {
  let deployer: SignerWithAddress;
  let token: ReimbursementToken;
  let mockToken: MockToken;

  before(async () => {
    [deployer] = await ethers.getSigners();
  });

  async function setup() {
    const mockToken = await deployMockToken(deployer);
    await mockToken.mint(deployer.address, tokenSupply);

    const token = await deployRiToken(deployer, [
      tokenName,
      tokenSymbol,
      maturityDate,
      mockToken.address,
      tokenSupply,
      mintReceiver,
    ]);

    return { mockToken, token };
  }

  beforeEach(async () => {
    const deployment = await loadFixture(setup);
    token = deployment.token;
    mockToken = deployment.mockToken;
  });

  it("should see the deployed token contract with the correct configuration", async () => {
    const name = await token.name();
    const maturity = await token.maturity();
    const underlying = await token.underlying();
    const symbol = await token.symbol();
    const supply = await token.totalSupply();

    expect(name).to.equal(tokenName);
    expect(maturity).to.equal(maturityDate);
    expect(underlying).to.equal(mockToken.address);
    expect(symbol).to.equal(tokenSymbol);
    expect(supply).to.equal(tokenSupply);
  });

  it("should mint the token supply to the supplied receiver", async () => {
    const receiverBalance = await token.balanceOf(mintReceiver);
    expect(receiverBalance).to.equal(tokenSupply);
  });

  it("should fail to deploy with a maturity date in the past", async () => {
    await expect(
      deployRiToken(deployer, [tokenName, tokenSymbol, 0, mockToken.address, tokenSupply, mintReceiver]),
    ).to.be.revertedWith("ReimbursementToken: Maturity date must be in future");
  });

  it("should fail to deploy with a supply of zero", async () => {
    await expect(
      deployRiToken(deployer, [tokenName, tokenSymbol, maturityDate, mockToken.address, "0", mintReceiver]),
    ).to.be.revertedWith("ReimbursementToken: Supply must be greater than 0");
  });

  it("should fail to deploy with an underlying token that has no supply", async () => {
    const badToken = await deployMockToken(deployer);

    await expect(
      deployRiToken(deployer, [tokenName, tokenSymbol, maturityDate, badToken.address, tokenSupply, mintReceiver]),
    ).to.be.revertedWith("ReimbursementToken: Underlying supply must be greater than 0");
  });

  it("should fail to deploy with an underlying that is not a token", async () => {
    const notToken = ethers.Wallet.createRandom();

    await expect(
      deployRiToken(deployer, [tokenName, tokenSymbol, maturityDate, notToken.address, tokenSupply, mintReceiver]),
    ).to.be.reverted;
  });
});
