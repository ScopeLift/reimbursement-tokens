pragma solidity >=0.5.0 <0.8.0;
import "./interfaces/IReimbursementOracle.sol";
import "./lib/OracleLibrary.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UniV3ReimbursementOracle is IReimbursementOracle {
  IUniswapV3Pool public pool;
  uint32 public period;
  uint128 public quoteAmount;

  /*
    - Ask for in constructor: base token, quote token, period, amountIn/quote amount
*/
  constructor(
    IUniswapV3Pool _pool,
    uint32 _period,
    uint128 _quoteAmount
  ) {
    pool = _pool;
    period = _period;
    quoteAmount = _quoteAmount;
  }

  /**
   * @notice Convert a number stored in decimals precision to WAD precision, where decimals
   * must be less than or equal to 18
   */
  function toWad(uint256 amount, uint256 decimals) internal pure returns (uint256) {
    return amount * 10**(18 - decimals);
  }

  function getOracleQuote(address _baseToken, address _quoteToken) external view override returns (uint256) {
    int24 timeWeightedAverageTick = OracleLibrary.consult(address(pool), period);
    return
      toWad(
        OracleLibrary.getQuoteAtTick(timeWeightedAverageTick, quoteAmount, _baseToken, _quoteToken),
        ERC20(_quoteToken).decimals()
      );
  }
}
