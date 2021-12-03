import { ethers } from "hardhat";
import { MockOracle__factory, MockToken__factory } from "../typechain";
import { deployReimbursementPool } from "./deployReimbursementPool";
import { deployReimbursementToken } from "./deployReimbursementToken";

export const deployAll = async () => {
  const signers = await ethers.getSigners();
  const usdc = await ethers
    .getContractFactory("MockToken")
    .then((factory: MockToken__factory) => factory.deploy("USDC", "USDC", 6));
  await usdc.mint(signers[0].address, 1000000000000);
  const riToken = await deployReimbursementToken(
    "my token",
    "TOK",
    10000000000,
    usdc.address,
    1000000,
    signers[0].address,
  );
  const oracle = await ethers
    .getContractFactory("MockOracle")
    .then((factory: MockOracle__factory) => factory.deploy(10000));
  await deployReimbursementPool(riToken.address, usdc.address, oracle.address, 10000000, signers[0].address);
};

deployAll()
  .then(process.exit(0))
  .catch(e => console.log(e));
