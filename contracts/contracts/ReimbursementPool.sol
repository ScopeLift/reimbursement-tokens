// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "./IReimbursementToken.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
 * @notice A ReimbursementPool manages the mechanics of paying out the coupon bond of its associated
 * ReimbursementToken. It manages the collateral and treasury balances, and ensures token holders are
 * paid back their debt in full (if funds are available) or to the maximum extent possible (if there is
 * a shortfall) at maturity. The bond issuer may also reclaim any *excess* capital after maturity.
 */
contract ReimbursementPool {
  // ======================================= State variables =======================================

  /// @notice The Reimbursement Token associated with this pool
  IReimbursementToken public immutable riToken;

  /// @notice The treasury token, i.e. the Reimbursement Token's "underlying", in which token holders are paid
  IERC20 public immutable treasuryToken;

  /// @notice An optional collateral token, used to compensate holders in the case of treasury shortfall
  IERC20 public immutable collateralToken;

  /// @notice Unix time at which redemption of tokens for treasury/collateral tokens is possible
  uint256 public immutable maturity;

  /// @notice The maximum rate at which Reimbursement Tokens will be exchanged for treasury tokens at maturity
  uint256 public immutable targetExchangeRate;

  /**
   * @param _riToken The Reimbursement Token associated with this pool
   * @param _collateralToken An optional collateral token, used to compensate holders in the case of treasury shortfall;
   * should be the zero address if no collateral token will be used.
   * @param _targetExchangeRate The maximum rate at which Reimbursement Tokens will be exchanged for treasury tokens
   * at maturity
   */
  constructor(
    IReimbursementToken _riToken,
    IERC20 _collateralToken,
    uint256 _targetExchangeRate
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

    require(_riToken.maturity() > block.timestamp, "ReimbursementPool: Token maturity must be in the future");

    require(_targetExchangeRate > 0, "ReimbursementPool: Target exchange rate must be non-zero");

    riToken = _riToken;
    treasuryToken = IERC20(_riToken.underlying());
    collateralToken = IERC20(_collateralToken);
    maturity = _riToken.maturity();
    targetExchangeRate = _targetExchangeRate;
  }
}
