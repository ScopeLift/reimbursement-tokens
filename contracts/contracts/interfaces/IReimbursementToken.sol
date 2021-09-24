// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/interfaces/draft-IERC2612.sol";

interface IReimbursementToken is IERC2612 {
  /// @notice Unix time at which redemption of tokens for underlying is possible
  function maturity() external returns (uint256);

  /// @notice Treasury asset that is returned on redemption
  function underlying() external returns (address);
}
