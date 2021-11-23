# Reimbursement Tokens

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
