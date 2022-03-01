# Reimbursement Tokens

### High level system overview

A Reimbursement Token is an asset provided by protocols to users in response to a loss of funds. It represents a claim on collateral and treasury tokens that have or will be provided by a protocol. The reimbursement token may be exchanged for treasury and or collateral tokens on a specified maturity date. Before the maturity date, the tokens may be bought and sold freely. The market price of a Reimbursement Token. It should logically reflect the market's confidence in a protocol's ability to provide the collateral and/or treasury tokens by the maturity date, along with some time preference discount.

A Reimbursement Pool manages the mechanics of paying out the redemption value of its associated Reimbursement Token. It manages the treasury and collateral balances, and ensures token holders are paid back their debt in full (if funds are available) or to the maximum extent possible (if there is a shortfall) at maturity. The bond issuer may also reclaim any _excess_ capital after maturity.

A Reimbursement Token must denominate a treasury token for which it will be redeemed upon maturity. Additionally, the Reimbursement Pool can optionally specify a collateral token. If there is a shortfall of treasury token at maturity, the pool's collateral token balance will then be used to make up the shortfall. An oracle implementation should be used to value the collateral token in terms of the treasury token. Any suitable oracle implementation that conforms to [IReimbursementOracle](/contracts/contracts/interfaces/IReimbursementOracle.sol) can be used; for convenience a [Uniswap v3 oracle implementation](/contracts/contracts/UniV3ReimbursementOracle.sol) is already provided.

For more information on contract components and the role they serve, see [contracts/README.md](/contracts/README.md).

The repository has two packages:

1. `/contracts` for the Reimbursement Token smart contracts
2. `/app` for the Reimbursement Token frontend

### Prerequisites

We recommend install [volta](https://volta.sh) to ensure that the project runs with the correct node/yarn versions.

### Install

To install:

```sh
# cwd: ./
yarn
cp app/.env.example app/.env
nano app/.env # provide correct env values
cp contracts/.env.example contracts/.env
nano contracts/.env # provide correct env values
```

### Run tests

```sh
# cwd: ./
yarn test
```

### Run system in dev

```sh
# cwd: ./
yarn dev
```
