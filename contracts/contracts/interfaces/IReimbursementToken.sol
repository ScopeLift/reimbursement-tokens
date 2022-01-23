// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts-v4/interfaces/draft-IERC2612.sol";
import "@openzeppelin/contracts-v4/interfaces/IERC20.sol";

interface IReimbursementToken is IERC20, IERC20Permit {
  /// @notice Unix time at which redemption of tokens for underlying is possible
  function maturity() external returns (uint256);

  /// @notice Treasury asset that is returned on redemption
  function underlying() external returns (address);
}
