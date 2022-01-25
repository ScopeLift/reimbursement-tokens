// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
import "./interfaces/IReimbursementOracle.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UniV3ReimbursementOracle is IReimbursementOracle {
  IUniswapV3Pool public immutable pool;
  uint32 public immutable period;
  uint128 public immutable baseAmount;

  constructor(
    IUniswapV3Pool _pool,
    uint32 _period,
    uint128 _baseAmount
  ) {
    require(_baseAmount != 0, "baseAmount");
    require(_period != 0, "period");
    require(address(_pool) != address(0), "pool");
    pool = _pool;
    period = _period;
    baseAmount = _baseAmount;
  }

  /**
   * @notice Convert a number stored in decimals precision to WAD precision, where decimals
   * must be less than or equal to 18
   */
  function toWad(uint256 amount, uint256 decimals) internal pure returns (uint256) {
    return amount * 10**(18 - decimals);
  }

  /**
   * @param _baseToken The token for which a quote is being requested
   * @param _quoteToken The token in which the "price" is quoted
   * @return The amount of _quoteToken received for 1 _baseToken, expressed as a WAD
   */
  function getOracleQuote(address _baseToken, address _quoteToken) external view override returns (uint256) {
    (int24 timeWeightedAverageTick, ) = OracleLibrary.consult(address(pool), period);
    return
      toWad(
        OracleLibrary.getQuoteAtTick(timeWeightedAverageTick, baseAmount, _baseToken, _quoteToken),
        ERC20(_quoteToken).decimals()
      );
  }
}
