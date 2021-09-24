// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
  uint8 decimalsStorage;

  constructor(
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) ERC20(_name, _symbol) {
    decimalsStorage = _decimals;
  }

  function mint(address _receiver, uint256 _amount) public {
    _mint(_receiver, _amount);
  }

  function decimals() public view virtual override returns (uint8) {
    return decimalsStorage;
  }
}
