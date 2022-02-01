// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;
import "./interfaces/IReimbursementOracle.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UniV3ReimbursementOracle is IReimbursementOracle {
  /// @notice The pool from which to calculate exchange rate
  IUniswapV3Pool public immutable pool;

  /// @notice The period (in seconds) over which to calculate a mean exchange rate
  uint32 public immutable period;

  constructor(IUniswapV3Pool _pool, uint32 _period) {
    require(_period != 0, "period");
    require(address(_pool) != address(0), "pool");
    pool = _pool;
    period = _period;
  }

  /**
   * @notice Convert a number stored in decimals precision to WAD precision, where decimals
   * must be less than or equal to 18
   */
  function toWad(uint256 amount, uint256 decimals) internal pure returns (uint256) {
    return amount * 10**(18 - decimals);
  }

  /**
   * @notice We use this function to get the value of 1 collateralToken in treasuryToken.
   * We first query the pool and calculate the arithmetic mean over the period `period`. Then we
   * convert the tick price to an exchange rate and return it as a WAD.
   * Example: collateralToken is ETH and treasuryToken is USDC. Let's say 1 ETH = 5000 USDC.
   * Then this function will return WAD(5000) or 5000 * 10^18
   * @param _baseToken The collateral token address
   * @param _quoteToken The treasury token address
   * @return The amount of treasuryToken received for 1 collateralToken, expressed as a WAD
   */
  function getOracleQuote(address _baseToken, address _quoteToken) external view override returns (uint256) {
    // require(pool.token0() == _baseToken || pool.token0() == _quoteToken, "token0");
    // require(pool.token1() == _baseToken || pool.token1() == _quoteToken, "token1");
    (int24 timeWeightedAverageTick, ) = OracleLibrary.consult(address(pool), period);
    return
      toWad(
        OracleLibrary.getQuoteAtTick(
          timeWeightedAverageTick,
          uint128(10**ERC20(_baseToken).decimals()),
          _baseToken,
          _quoteToken
        ),
        ERC20(_quoteToken).decimals()
      );
  }
}
