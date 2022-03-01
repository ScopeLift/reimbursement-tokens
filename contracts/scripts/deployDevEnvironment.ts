import { ethers } from "hardhat";
import { deployMockToken } from "./deploy/deployMockToken";
import { deployMockOracle } from "./deploy/deployMockOracle";
import { deployReimbursementPool } from "./deploy/deployReimbursementPool";
import { deployReimbursementToken } from "./deploy/deployReimbursementToken";
import { deployMerkleDistributor } from "./deploy/deployMerkleDistributor";
import { record, DeployDetail } from "./deploy/helpers";

async function main() {
  const deployContext: Record<string, DeployDetail> = {};
  try {
    const signers = await ethers.getSigners();
    const usdc = await deployMockToken(deployContext, "USDC", "USDC", 6);
    await usdc.mint(signers[0].address, 1000000000000);
    const supply = ethers.utils.parseUnits("1000000", 18);
    const riToken = await deployReimbursementToken(
      deployContext,
      "my token",
      "TOK",
      10000000000,
      usdc.address,
      supply,
      signers[0].address,
    );
    // Change to your merkle root
    const merkleRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const distributor = await deployMerkleDistributor(deployContext, riToken.address, merkleRoot);
    const transfer = await riToken.transfer(distributor.address, supply);
    console.log(`Transferring riToken supply to merkle distributor:  ${transfer.hash}`);
    const oracle = await deployMockOracle(deployContext, 100000);
    await deployReimbursementPool(
      deployContext,
      riToken.address,
      usdc.address,
      oracle.address,
      10000000,
      signers[0].address,
    );
    await record(deployContext);
  } catch (e) {
    await record(deployContext);
    throw e;
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
