import { task } from "hardhat/config";
// import { ethers, network } from "hardhat";

task("deploy-single", "Deploy single part of system")
  .addParam("name", "The name of the artifact to deploy")
  .addVariadicPositionalParam("args")
  .setAction(async (taskArgs: { name: string; args: any[] }, hre) => {
    const { ethers, network } = hre;
    const contract = await ethers.getContractFactory(taskArgs.name);
    const tx = await contract.deploy(...taskArgs.args);
    console.log(`${taskArgs.name} deploying on ${network.name} @ ${tx.deployTransaction.hash}...`);
    await tx.deployed();
    console.log(`${taskArgs.name} deployed: ${tx.address}`);
  });
