import { ethers } from "hardhat";
import { MockOracle__factory } from "../typechain/factories/MockOracle__factory";
type DeployRecord = {
  address: string;
  constructorArgs?: unknown[];
};

export const deployMockOracle = async (
  context: Record<string, DeployRecord>,
  ...args: Parameters<MockOracle__factory["deploy"]>
) => {
  const contract = await ethers
    .getContractFactory("MockOracle")
    .then((factory: MockOracle__factory) => factory.deploy(...args));
  await contract.deployed();
  context.MockOracle = {
    address: contract.address,
    constructorArgs: args,
  };
  console.log(`MockOracle deployed to: ${contract.address}`);
  return contract;
};
