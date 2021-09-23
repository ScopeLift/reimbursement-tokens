// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "./IReimbursementToken.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

/**
 * @notice A ReimbursementToken is an asset provided by protocols to users in response to a loss of funds.
 * It represents a claim on collateral and treasury tokens that have or will be provided by a protocol.
 * The reimbursement token may be exchanged for collateral and or treasury tokens on a specified maturity date.
 * Before the maturity date, the tokens may be bought and sold freely. The market price of a ReimbursementToken
 * should logically reflect the market's confidence in a protocol's ability to provide the collateral and/or
 * treasury tokens by the maturity date, along with some time preference discount.
 */
contract ReimbursementToken is IReimbursementToken, ERC20Permit {
  /// @notice Unix time at which redemption of tokens for underlying is possible
  uint256 public immutable override maturity;

  /// @notice Treasury asset that is returned on redemption
  address public immutable override underlying;

  /**
   * @param _name Name for the ERC20 token
   * @param _symbol Symbol for the ERC20 token
   * @param _maturity Unix time at which redemption of tokens for underlying is possible
   * @param _underlying Treasury asset that is returned on redemption
   * @param _supply Total supply of the ERC20 token which will be minted at deploy
   * @param _receiver Receiving address of the total supply that will be minted at deploy
   */
  constructor(
    string memory _name,
    string memory _symbol,
    uint256 _maturity,
    address _underlying,
    uint256 _supply,
    address _receiver
  ) ERC20Permit(_name) ERC20(_name, _symbol) {
    require(_maturity > block.timestamp, "ReimbursementToken: Maturity date must be in future");
    require(_supply > 0, "ReimbursementToken: Supply must be greater than 0");
    require(ERC20(_underlying).totalSupply() > 0, "ReimbursementToken: Underlying supply must be greater than 0");
    maturity = _maturity;
    underlying = _underlying;
    _mint(_receiver, _supply);
  }
}
