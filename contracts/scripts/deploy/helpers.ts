import { writeFile } from "fs/promises";
import { network } from "hardhat";

export type DeployDetail = {
  address: string;
  constructorArgs?: unknown[];
};

export const record = async (deployment: Record<string, DeployDetail>): Promise<void> => {
  console.log(`Saving deployment record to contracts/deploys/${network.name}.json`);
  await writeFile(`./deploys/${network.name}.json`, JSON.stringify(deployment, null, 2));
  console.log(`Deployment record saved!`);
};

export const isValidNetwork = (
  config: Record<string, any>,
  networkName: string,
): networkName is keyof typeof config => {
  return Object.keys(config).includes(networkName);
};
