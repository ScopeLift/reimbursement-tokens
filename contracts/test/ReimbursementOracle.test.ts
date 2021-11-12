// External imports
import { ethers, waffle } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
const { deployContract } = waffle;
import IUniswapV3PoolArtifact from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import UniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
// Internal imports
import { UniV3ReimbursementOracle } from "../typechain/";
import { deployReimbursementOracle, deployMockToken } from "./utils";
import { Contract } from "@ethersproject/contracts";

// Conevenience variables
const { loadFixture } = waffle;
const { AddressZero } = ethers.constants;
const { parseUnits } = ethers.utils;
const treasuryTokenDecimals = 6;
const treasuryTokenSupply = parseUnits("1000000000", treasuryTokenDecimals); // 1 billion
const collateralTokenDecimals = 8;
const collateralTokenSupply = parseUnits("21000000", collateralTokenDecimals); // 21 million

const deployUniV3Factory = (signer: SignerWithAddress) => {
  return deployContract(signer, UniswapV3Factory, []);
};

// const deployUniV3Pool = (signer: SignerWithAddress) => {
//   return deployContract(signer, IUniswapV3PoolArtifact);
// };

describe.only("ReimbursementOracle", () => {
  let deployer: SignerWithAddress; // contract deployer & default account
  let oracle: UniV3ReimbursementOracle;
  let pool: Contract;

  before(async () => {
    [deployer] = await ethers.getSigners();
  });

  async function setup() {
    const treasuryToken = await deployMockToken(deployer, "Stable Coin", "STAB", treasuryTokenDecimals);
    await treasuryToken.mint(deployer.address, treasuryTokenSupply);
    const collateralToken = await deployMockToken(deployer, "Governance Token", "GOV", collateralTokenDecimals);
    await collateralToken.mint(deployer.address, collateralTokenSupply);
    const UniV3Factory = await deployUniV3Factory(deployer);
    const poolDeploy = await UniV3Factory.connect(deployer)
      .createPool(treasuryToken.address, collateralToken.address, 500)
      .then((tx: any) => tx.wait());
    const pool = await ethers.getContractAt(IUniswapV3PoolArtifact.abi, poolDeploy.events[0].args.pool, deployer);
    const oracle = await deployReimbursementOracle(deployer, []);
    return { pool, oracle };
  }

  beforeEach(async () => {
    ({ pool, oracle } = await loadFixture(setup));
  });

  describe("deployment and setup", () => {
    it("should be an oracle", async () => {
      const quote = await oracle.getOracleQuote(AddressZero, AddressZero);
      expect(quote).to.eq(0);
      console.log(pool.address);
      const token0 = await pool.token0();
      console.log(token0);
    });
  });
});
