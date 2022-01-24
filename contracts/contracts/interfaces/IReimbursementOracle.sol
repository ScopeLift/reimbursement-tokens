// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

/**
 * @notice Interface a Reimbursement Oracle must conform to. These Oracles are used to provide a
 * price for the collateral token as a WAD, denominated in the treasury token, at the time of maturity.
 * This is used as the exchange rate to determine the amount of Collateral Tokens that Reimbursement Token
 * holders are entitled to in the instance of a treasury shortfall.
 */
interface IReimbursementOracle {
  /**
   * @param _baseToken The token for which a quote is being requested
   * @param _quoteToken The token in which the "price" is quoted
   * @return The amount of _quoteToken received for 1 _baseToken, expressed as a WAD
   */
  function getOracleQuote(address _baseToken, address _quoteToken) external view returns (uint256);
}
