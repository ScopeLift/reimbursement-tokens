// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

import "../interfaces/IReimbursementOracle.sol";

contract MockOracle is IReimbursementOracle {
  uint256 public quote;

  constructor(uint256 _quote) {
    quote = _quote;
  }

  function setQuote(uint256 _quote) public {
    quote = _quote;
  }

  function getOracleQuote(address _baseToken, address _quoteToken) public view override returns (uint256) {
    (_baseToken, _quoteToken); // silence warnings
    return quote;
  }
}
