import { ethers, network } from "hardhat";
import { deployReimbursementPool } from "./deploy/deployReimbursementPool";
import { deployReimbursementToken } from "./deploy/deployReimbursementToken";
import { deployMerkleDistributor } from "./deploy/deployMerkleDistributor";
import { deployUniV3ReimbursementOracle } from "./deploy/deployUniV3ReimbursementOracle";
import { record, DeployDetail, isValidNetwork } from "./deploy/helpers";
import { config as chainConfig } from "./deployConfig";

async function main() {
  if (!isValidNetwork(chainConfig, network.name)) throw new Error(`No network config for network ${network.name}`);
  const config = chainConfig[network.name];
  const deployContext: Record<string, DeployDetail> = {};
  try {
    const signers = await ethers.getSigners();
    const riToken = await deployReimbursementToken(
      deployContext,
      config.riToken.name,
      config.riToken.symbol,
      config.riToken.maturity,
      config.riToken.treasuryToken,
      config.riToken.supply,
      signers[0].address,
    );
    const distributor = await deployMerkleDistributor(deployContext, riToken.address, config.merkleRoot);
    const transfer = await riToken.transfer(distributor.address, config.riToken.supply);
    console.log(`Transferring riToken supply to merkle distributor:  ${transfer.hash}`);
    await transfer.wait();
    console.log(`Transfer completed.`);
    const oracle = config.oracle
      ? await deployUniV3ReimbursementOracle(deployContext, config.oracle.uniV3Pool, config.oracle.twapPeriod)
      : undefined;

    await deployReimbursementPool(
      deployContext,
      riToken.address,
      config.riPool.collateralToken || ethers.constants.AddressZero,
      oracle ? oracle.address : ethers.constants.AddressZero,
      config.riPool.targetExchangeRate,
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
