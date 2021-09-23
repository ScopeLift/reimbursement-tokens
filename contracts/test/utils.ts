import { artifacts, waffle } from "hardhat";
import { Signer, BigNumberish } from "ethers";
import { ReimbursementToken, MockToken } from "../typechain/";
const { deployContract } = waffle;

export const deployRiToken = (deployer: Signer, params: Array<any>): Promise<ReimbursementToken> => {
  const artifact = artifacts.readArtifactSync("ReimbursementToken");
  return deployContract(deployer, artifact, params) as Promise<ReimbursementToken>;
};

export const deployMockToken = (
  deployer: Signer,
  name: string = "MockToken",
  symbol: string = "MOCK",
  decimals: BigNumberish = 18,
): Promise<MockToken> => {
  const artifact = artifacts.readArtifactSync("MockToken");
  return deployContract(deployer, artifact, [name, symbol, decimals]) as Promise<MockToken>;
};
