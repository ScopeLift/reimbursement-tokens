// External imports
import { artifacts, ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";

// Internal imports
import { ReimbursementToken, MerkleDistributor } from "../typechain";
import { deployMockToken, deployRiToken } from "./utils";
import { BalanceTree } from "./merkle-distributor/balance-tree";

// Conevenience variables
const { deployContract, loadFixture } = waffle;
const { parseUnits } = ethers.utils;

// Test inputs
const tokenName = "Reimbursement Token";
const tokenSymbol = "RIT";
const maturityDate = 2000000000; // Unix timestamp far in the future
const tokenSupply = parseUnits("1000000", 18);

// Constants
const ZERO_BYTES32 = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const deployDistributor = (deployer: SignerWithAddress, params: Array<any>): Promise<MerkleDistributor> => {
  const artifact = artifacts.readArtifactSync("MerkleDistributor");
  return deployContract(deployer, artifact, params) as Promise<MerkleDistributor>;
};

describe("MerkleDistributor", () => {
  let deployer: SignerWithAddress;
  let user0: SignerWithAddress;
  let user1: SignerWithAddress;
  let token: ReimbursementToken;
  let distributor: MerkleDistributor;

  before(async () => {
    [deployer, user0, user1] = await ethers.getSigners();
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
      deployer.address,
    ]);

    return { mockToken, token };
  }

  beforeEach(async () => {
    ({ token } = await loadFixture(setup));
  });

  it("should properly deploy the distributor with the ritoken", async () => {
    distributor = await deployDistributor(deployer, [token.address, ZERO_BYTES32]);

    const distributorToken = await distributor.token();
    const merkleRoot = await distributor.merkleRoot();

    expect(distributorToken).to.equal(token.address);
    expect(merkleRoot).to.equal(ZERO_BYTES32);
  });

  it("should allow claims of the ritoken using merkle proofs", async () => {
    const amount0 = parseUnits("100", 18);
    const amount1 = parseUnits("101", 18);

    // Generate Merkle tree with two leaves
    const tree = new BalanceTree([
      { account: user0.address, amount: amount0 },
      { account: user1.address, amount: amount1 },
    ]);

    // Deploy distributor with appropriate Merkle root
    distributor = await deployDistributor(deployer, [token.address, tree.getHexRoot()]);

    // Transfer ritoken supply to distributor (a deploy script would do the same)
    await token.transfer(distributor.address, tokenSupply);

    // Generate Merkle proofs required for claiming
    const proof0 = tree.getProof(0, user0.address, amount0);
    const proof1 = tree.getProof(1, user1.address, amount1);

    // Execute claims using Merkle proofs
    await expect(distributor.claim(0, user0.address, amount0, proof0))
      .to.emit(distributor, "Claimed")
      .withArgs(0, user0.address, amount0);
    await expect(distributor.claim(1, user1.address, amount1, proof1))
      .to.emit(distributor, "Claimed")
      .withArgs(1, user1.address, amount1);

    // Verify expected balances
    expect(await token.balanceOf(user0.address)).to.equal(amount0);
    expect(await token.balanceOf(user1.address)).to.equal(amount1);
    expect(await token.balanceOf(distributor.address)).to.equal(tokenSupply.sub(amount0).sub(amount1));

    // Verify a proof can not be reused after claim
    await expect(distributor.claim(0, user0.address, amount0, proof0)).to.be.revertedWith(
      "MerkleDistributor: Drop already claimed.",
    );
  });
});
