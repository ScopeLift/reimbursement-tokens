import { ethers } from "hardhat";
import { UniV3ReimbursementOracle__factory } from "../../typechain/factories/UniV3ReimbursementOracle__factory";
type DeployRecord = {
  address: string;
  constructorArgs?: unknown[];
};

export const deployUniV3ReimbursementOracle = async (
  context: Record<string, DeployRecord>,
  ...args: Parameters<UniV3ReimbursementOracle__factory["deploy"]>
) => {
  const contract = await ethers
    .getContractFactory("UniV3ReimbursementOracle")
    .then((factory: UniV3ReimbursementOracle__factory) => factory.deploy(...args));
  console.log("UniV3ReimbursementOracle deploying: ", contract.deployTransaction.hash);
  await contract.deployed();
  context.UniV3ReimbursementOracle = {
    address: contract.address,
    constructorArgs: args,
  };
  console.log(`UniV3ReimbursementOracle deployed to: ${contract.address}`);
  return contract;
};
