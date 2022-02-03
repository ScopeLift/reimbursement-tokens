import { BigNumberish } from "ethers";
import { units } from "../test/utils";

export const config: Record<string, deployConfig> = {
  ropsten: {
    riToken: {
      name: "Test Reimbursement Token",
      symbol: "TRT",
      supply: units.wad(100000),
      treasuryToken: "0xaD6D458402F60fD3Bd25163575031ACDce07538D", // DAI
      maturity: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour in the future
    },
    oracle: {
      uniV3Pool: "0x40FDe2952a0674a3E77707Af270af09800657293",
      twapPeriod: 600, // 600 seconds
    },
    riPool: {
      targetExchangeRate: units.wad(3), // targeting 1 reimbursement token = 3 treasury tokens
      collateralToken: "0xc778417E063141139Fce010982780140Aa0cD5Ab", // WETH
    },
  },
  rinkeby: {
    riToken: {
      name: "Test Reimbursement Token",
      symbol: "TRT",
      supply: units.wad(100000),
      treasuryToken: "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735", // DAI
      maturity: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour in the future
    },
    oracle: {
      uniV3Pool: "0x0f04024bdA15F6e5D48Ed92938654a6449F483ed",
      twapPeriod: 600, // 600 seconds
    },
    riPool: {
      targetExchangeRate: 10000,
      collateralToken: "0xc778417E063141139Fce010982780140Aa0cD5Ab", // WETH
    },
  },
};

type deployConfig = {
  riToken: {
    name: string;
    symbol: string;
    supply: BigNumberish;
    treasuryToken: string;
    maturity: number;
  };
  oracle: {
    uniV3Pool: string;
    twapPeriod: number;
  };
  riPool: {
    targetExchangeRate: BigNumberish;
    collateralToken: string;
  };
};
