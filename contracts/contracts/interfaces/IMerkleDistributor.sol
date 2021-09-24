// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.7;

/// @notice Allows anyone to claim a token if they exist in a merkle root.
interface IMerkleDistributor {
    /// @notice Returns the address of the token distributed by this contract.
    function token() external view returns (address);
    /// @notice Returns the merkle root of the merkle tree containing account balances available to claim.
    function merkleRoot() external view returns (bytes32);
    /// @notice Returns true if the index has been marked claimed.
    function isClaimed(uint256 index) external view returns (bool);
    /// @notice Claim the given amount of the token to the given address. Reverts if the inputs are invalid.
    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external;

    /// @notice This event is triggered whenever a call to #claim succeeds.
    event Claimed(uint256 index, address account, uint256 amount);
}
