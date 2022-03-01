/**
 * @dev WARNING: The constructor args are parsed naively here and this parsing
 * will not work for boolean types. To resolve, you could map the args, transforming
 * "true" or "false" to the corresponding boolean value.
 */

import { task } from "hardhat/config";

task("deploy-single", "Deploy single part of system")
  .addParam("name", "The name of the artifact to deploy")
  .addVariadicPositionalParam("args")
  .setAction(async (taskArgs: { name: string; args: any[] }, hre) => {
    if (taskArgs.args.find(arg => ("" + arg).match(/^(true|false)$/i))) throw new Error("booleans not supported");
    const { ethers, network } = hre;
    const contract = await ethers.getContractFactory(taskArgs.name);
    const tx = await contract.deploy(...taskArgs.args);
    console.log(`${taskArgs.name} deploying on ${network.name}:  ${tx.deployTransaction.hash}...`);
    await tx.deployed();
    console.log(`${taskArgs.name} deployed: ${tx.address}`);
  });
