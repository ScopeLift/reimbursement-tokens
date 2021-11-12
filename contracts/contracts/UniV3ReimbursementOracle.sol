pragma solidity >=0.8.7;
import "./interfaces/IReimbursementOracle.sol";

contract UniV3ReimbursementOracle is IReimbursementOracle {
/*
    - Ask for in constructor: base token, quote token, period, amountIn/quote amount
*/
    constructor () {
        
    }

    function getOracleQuote(address _baseToken, address _quoteToken) override external view returns (uint256) {
        return 0;
    }

}
