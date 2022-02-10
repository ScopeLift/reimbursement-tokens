import { BigNumberish } from "ethers";
import { units } from "../test/utils";

export const config: Record<string, deployConfig> = {
  ropsten: {
    riToken: {
      name: "Test Reimbursement Token",
      symbol: "TRT",
      // riToken has 18 decimals, so we use wad to set total supply
      // Here, supply is 1,000,000 riTokens
      supply: units.wad(1000000),
      // Token that underlies the reimbursement token
      // Here, Ropsten DAI
      treasuryToken: "0xaD6D458402F60fD3Bd25163575031ACDce07538D",
      // How long to wait before maturation / reimbursement calc finalization
      // Here, 1 hour in the future
      maturity: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    // Merkle root for distributor contract
    merkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
    riPool: {
      // targeting 1 reimbursement token = 3 underlying treasury tokens
      targetExchangeRate: units.wad(3),
      // Optional collateral token to collect and, if shortfall on maturity, distribute
      // Here, Ropsten WETH
      collateralToken: "0xc778417E063141139Fce010982780140Aa0cD5Ab", // WETH
    },
    // Oracle config: only necessary if collateralToken set in riPool
    oracle: {
      // Ropsten DAI / WETH pool with fee 0.3%
      // see getPool @ https://ropsten.etherscan.io/address/0x1F98431c8aD98523631AE4a59f267346ea31F984#readContract
      uniV3Pool: "0x40FDe2952a0674a3E77707Af270af09800657293",
      // Specifies the interval in seconds that the oracle's TWAP should calculate the mean over
      // Used to value collateral token in terms of treasury token if collateral token needs to be distributed
      // here, 600 seconds or 10 min
      twapPeriod: 600,
    },
  },
};

export type deployConfig = {
  riToken: {
    name: string;
    symbol: string;
    supply: BigNumberish;
    treasuryToken: string;
    maturity: number;
  };
  merkleRoot?: string;
  oracle?: {
    uniV3Pool: string;
    twapPeriod: number;
  };
  riPool: {
    targetExchangeRate: BigNumberish;
    collateralToken?: string;
  };
};
