# Reimbursement Token Contracts

Template forked from [Paul Berg's Solidity template](https://github.com/paulrberg/solidity-template)

## Contract Components

### [ReimbursementToken.sol](./contracts/ReimbursementToken.sol)

Token contract for a Reimbursement Token. Key parameters like `maturity` and `underlying` must be passed to the constructor, but the MerkleDistributor and ReimbursementPool will do most of the work from here.

### [MerkleDistributor.sol](./contracts/MerkleDistributor.sol)

Contract that can be used to dispense reimbursement tokens to affected users. A merkle root representing the distribution amounts should be provided to [deployConfig.ts](./scripts/deployConfig.ts).

### [ReimbursementPool.sol](./contracts/ReimbursementPool.sol)

ReimbursementPool is responsible for collecting funds in the denominated treasury token and optional collateral token. Upon maturity, it determines whether there is a shortfall or surplus and splits funds accordingly, with leftover funds claimable by pool owner.

### [UniV3ReimbursementOracle.sol](./contracts/UniV3ReimbursementOracle.sol)

If a reimbursement pool specifies an optional collateral token, an oracle implementation should also be provided. UniV3ReimbursementOracle is a simple implementation that will get the collateral token price in terms of the treasury token using the corresponding Uniswap v3 pool.

When choosing a Uniswap v3 pool, there are a couple things related to pool liquidity that should be considered. Please choose the pool at the fee tier that has the most liquidity. This simple oracle implementation only looks at the ticks/prices of one pool. Furthermore, the purpose of a reimbursement pool's collateral token is to make up for a shortfall in the treasury token. This is only meaningful if users receiving this collateral token receive a value equivalent to their share of the shortfall. Token pairs with limited liquidity may be incongruent with the reimbursement pool design's spirit.

Another oracle implementation can be used instead of UniV3ReimbursementOracle. Simply create a contract that implements [IReimbursementOracle](./contracts/interfaces/IReimbursementOracle.sol), and revise [deployProd.ts](./scripts/deployProd.ts) to deploy your oracle implementation instead of what's provided.

## Usage

### Pre Requisites

Before running any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic as an environment
variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Production Deploy

Ensure that `MNEMONIC` and `INFURA_API_KEY` are set in [.env](/contracts/.env). Deploy configuration is done via the [deployConfig.ts](/contracts/scripts/deployConfig.ts) file. Ensure this file includes an entry for your network of choice, and be sure to adjust the configuration values according to your preferences.

```sh
$ yarn deploy --network rospten
```

### Single Contract Deploy

Use if you want to deploy a small part of the system

```sh
$ yarn deploy:single --network ropsten --name MockOracle 100000
```

## Syntax Highlighting

If you use VSCode, you can enjoy syntax highlighting for your Solidity code via the
[vscode-solidity](https://github.com/juanfranblanco/vscode-solidity) extension. The recommended approach to set the
compiler version is to add the following fields to your VSCode user settings:

```json
{
  "solidity.compileUsingRemoteVersion": "v0.8.4+commit.c7e474f2",
  "solidity.defaultCompiler": "remote"
}
```

Where of course `v0.8.4+commit.c7e474f2` can be replaced with any other version.
