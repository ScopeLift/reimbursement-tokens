import { ethers } from "hardhat";
import { deployMockToken } from "./deployMockToken";
import { deployMockOracle } from "./deployMockOracle";
import { deployReimbursementPool } from "./deployReimbursementPool";
import { deployReimbursementToken } from "./deployReimbursementToken";
import { record, DeployRecord } from "./helpers";

async function main() {
  const deployContext: Record<string, DeployRecord> = {};
  try {
    const signers = await ethers.getSigners();
    const usdc = await deployMockToken(deployContext, "USDC", "USDC", 6);
    await usdc.mint(signers[0].address, 1000000000000);
    const riToken = await deployReimbursementToken(
      deployContext,
      "my token",
      "TOK",
      10000000000,
      usdc.address,
      1000000,
      signers[0].address,
    );
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
