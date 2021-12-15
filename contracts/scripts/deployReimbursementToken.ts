import { ethers } from "hardhat";
import { ReimbursementToken } from "../typechain/ReimbursementToken";
import { ReimbursementToken__factory } from "../typechain/factories/ReimbursementToken__factory";
import { DeployRecord } from "./helpers";

export const deployReimbursementToken = async (
  context: Record<string, DeployRecord>,
  ...args: Parameters<ReimbursementToken__factory["deploy"]>
) => {
  const tokenFactory = <ReimbursementToken__factory>await ethers.getContractFactory("ReimbursementToken");
  const reimbursementToken = <ReimbursementToken>await tokenFactory.deploy(...args);
  await reimbursementToken.deployed();
  context.ReimbursementToken = {
    address: reimbursementToken.address,
    constructorArgs: args,
  };
  console.log("ReimbursementToken deployed to: ", reimbursementToken.address);
  return reimbursementToken;
};
