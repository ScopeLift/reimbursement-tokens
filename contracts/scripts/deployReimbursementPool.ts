import { ethers } from "hardhat";
import { ReimbursementPool } from "../typechain";
import { ReimbursementPool__factory } from "../typechain/factories/ReimbursementPool__factory";
import { DeployRecord } from "./helpers";

export const deployReimbursementPool = async (
  context: Record<string, DeployRecord>,
  ...args: Parameters<ReimbursementPool__factory["deploy"]>
) => {
  const poolFactory = <ReimbursementPool__factory>await ethers.getContractFactory("ReimbursementPool");
  const reimbursementPool = <ReimbursementPool>await poolFactory.deploy(...args);
  await reimbursementPool.deployed();
  context.ReimbursementPool = {
    address: reimbursementPool.address,
    constructorArgs: args,
  };
  console.log("ReimbursementPool deployed to: ", reimbursementPool.address);
  return reimbursementPool;
};
