import { artifacts, waffle, ethers } from "hardhat";
import { Signer, BigNumberish, BigNumber } from "ethers";
import { ReimbursementToken, MockToken, UniV3ReimbursementOracle } from "../typechain/";
import { parseUnits } from "@ethersproject/units";
const { deployContract } = waffle;

export const getNow = async () => (await ethers.provider.getBlock("latest")).timestamp;

export const fastForward = async (seconds: number): Promise<void> => {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
};

export const deployRiToken = (deployer: Signer, params: Array<any>): Promise<ReimbursementToken> => {
  const artifact = artifacts.readArtifactSync("ReimbursementToken");
  return deployContract(deployer, artifact, params) as Promise<ReimbursementToken>;
};

export const deployReimbursementOracle = (deployer: Signer, params: Array<any>): Promise<UniV3ReimbursementOracle> => {
  const artifact = artifacts.readArtifactSync("UniV3ReimbursementOracle");
  return deployContract(deployer, artifact, params) as Promise<UniV3ReimbursementOracle>;
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

export const isApproximate = (number1: BigNumber, number2: BigNumber, precision: number = 4) => {
  if (number1.eq(number2)) return true;
  const margin = 1 / 10 ** precision;
  return Math.abs(+number1 / +number2 - 1) < margin;
};

/**
 * @notice Helper function to create an easy interface for our most common units' bignumber conversions.
 * When an interface for a unit is created via this function, a function is returned that when called
 * will make a string bignumber for whatever number is passed to the function. The function also has a property `bn`,
 * another function that when called will convert the string representation to a BigNumber object.
 * @param precision
 */
export const unit = (precision: number) => {
  const disallowDecimal = (val: number | string) => {
    if (typeof val === "number" && val.toString().includes(".")) throw "please supply a string instead";
    return val;
  };
  /**
   * Converts number to proper precision for this unit.
   * @param val Can supply a number, but if a decimal, must supply a string.
   * @return BigNumber with unit-appropriate precision
   */
  const fn = (val: number | string) => parseUnits(disallowDecimal(val).toString(), precision).toString();
  /**
   * Converts number to proper precision for this unit.
   * @param {string | number} val Can supply a number, but if a decimal, must supply a string.
   * @return {ethers.BigNumber} BigNumber with unit-appropriate precision
   */
  fn.bn = (val: number | string) => BigNumber.from(fn(val));
  return fn;
};

const ray = unit(27);
const wad = unit(18);
const usdc = unit(6);
const eth = unit(18);
export const units = { ray, wad, usdc, eth };

const wadDecimals = BigNumber.from(18);

export const toWad = (amount: BigNumberish, decimals: BigNumberish): BigNumber => {
  if (wadDecimals.lt(decimals)) {
    throw new Error("Decimals cannot be greater than WAD decimals");
  }

  return BigNumber.from(10).pow(wadDecimals.sub(decimals)).mul(amount);
};

export const wmul = (x: BigNumber, y: BigNumber): BigNumber => {
  return x.mul(y).div(wad(1));
};

export const wdiv = (x: BigNumber, y: BigNumber): BigNumber => {
  return x.mul(wad(1)).div(y);
};
