import { ethers } from "hardhat";
import { ReimbursementPool } from "../typechain";
import { ReimbursementPool__factory } from "../typechain/factories/ReimbursementPool__factory";

export const deployReimbursementPool = async (...args: Parameters<ReimbursementPool__factory["deploy"]>) => {
  const poolFactory = <ReimbursementPool__factory>await ethers.getContractFactory("ReimbursementPool");
  const reimbursementPool = <ReimbursementPool>await poolFactory.deploy(...args);
  await reimbursementPool.deployed();
  console.log("Contract deployed to: ", reimbursementPool.address);
  return reimbursementPool;
};
