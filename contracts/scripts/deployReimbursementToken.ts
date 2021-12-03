import { ethers } from "hardhat";
import { ReimbursementToken } from "../typechain/ReimbursementToken";
import { ReimbursementToken__factory } from "../typechain/factories/ReimbursementToken__factory";

export const deployReimbursementToken = async (...args: Parameters<ReimbursementToken__factory["deploy"]>) => {
  const tokenFactory = <ReimbursementToken__factory>await ethers.getContractFactory("ReimbursementToken");
  const reimbursementToken = <ReimbursementToken>await tokenFactory.deploy(...args);
  await reimbursementToken.deployed();
  console.log("Contract deployed to: ", reimbursementToken.address);
  return reimbursementToken;
};
