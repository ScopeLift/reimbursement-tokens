import { ethers } from "hardhat";
import { MerkleDistributor__factory } from "../../typechain/factories/MerkleDistributor__factory";
import { DeployDetail } from "./helpers";

export const deployMerkleDistributor = async (
  context: Record<string, DeployDetail>,
  ...args: Parameters<MerkleDistributor__factory["deploy"]>
) => {
  const factory = <MerkleDistributor__factory>await ethers.getContractFactory("MerkleDistributor");
  const contract = await factory.deploy(...args);
  console.log("MerkleDistributor deploying: ", contract.deployTransaction.hash);
  await contract.deployed();
  context.MerkleDistributor = {
    address: contract.address,
    constructorArgs: args,
  };
  console.log("MerkleDistributor deployed to: ", contract.address);
  return contract;
};
