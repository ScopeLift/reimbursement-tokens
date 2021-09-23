// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "./IReimbursementToken.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract ReimbursementPool {
  IReimbursementToken public immutable riToken;
  IERC20 public immutable treasuryToken;
  IERC20 public immutable collateralToken;
  uint256 public immutable maturityDate;
  uint256 public immutable maturityExchangeRate;

  constructor(
    IReimbursementToken _riToken,
    IERC20 _collateralToken,
    uint256 _maturityExchangeRate
  ) {
    require(
      IERC20(_riToken.underlying()).totalSupply() > 0,
      "ReimbursementPool: Treasury Token must have non-zero supply"
    );

    if (address(_collateralToken) != address(0)) {
      require(
        IERC20(_collateralToken).totalSupply() > 0,
        "ReimbursementPool: Collateral Token must have non-zero supply"
      );
    }

    require(
      _riToken.maturity() > block.timestamp,
      "ReimbursementPool: Token maturity must be in the future"
    );

    require(_maturityExchangeRate > 0, "ReimbursementPool: Maturity exchange rate must be non-zero");

    riToken = _riToken;
    treasuryToken = IERC20(_riToken.underlying());
    collateralToken = IERC20(_collateralToken);
    maturityDate = _riToken.maturity();
    maturityExchangeRate = _maturityExchangeRate;
  }
}
