import { ethers } from "hardhat";
import { ReimbursementToken } from "../../typechain";
import { ReimbursementToken__factory } from "../../typechain/factories/ReimbursementToken__factory";
import { DeployDetail } from "./helpers";

export const deployReimbursementToken = async (
  context: Record<string, DeployDetail>,
  ...args: Parameters<ReimbursementToken__factory["deploy"]>
) => {
  const tokenFactory = <ReimbursementToken__factory>await ethers.getContractFactory("ReimbursementToken");
  const reimbursementToken = <ReimbursementToken>await tokenFactory.deploy(...args);
  console.log("ReimbursementToken deploying: ", reimbursementToken.deployTransaction.hash);
  await reimbursementToken.deployed();
  context.ReimbursementToken = {
    address: reimbursementToken.address,
    constructorArgs: args,
  };
  console.log("ReimbursementToken deployed to: ", reimbursementToken.address);
  return reimbursementToken;
};
