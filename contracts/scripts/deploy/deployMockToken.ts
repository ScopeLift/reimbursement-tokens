import { ethers } from "hardhat";
import { MockToken__factory } from "../../typechain/factories/MockToken__factory";
import { DeployDetail } from "./helpers";

export const deployMockToken = async (
  context: Record<string, DeployDetail>,
  ...args: Parameters<MockToken__factory["deploy"]>
) => {
  const contract = await ethers
    .getContractFactory("MockToken")
    .then((factory: MockToken__factory) => factory.deploy(...args));
  const tokenSymbol = args[1];
  context[tokenSymbol] = {
    address: contract.address,
    constructorArgs: args,
  };
  await contract.deployed();
  console.log(`${tokenSymbol}Token deployed to: ${contract.address}`);
  return contract;
};
