// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./interfaces/IMerkleDistributor.sol";

/// @notice Distributes a token via Merkle proof claims against a Merkle root set on deploy
contract MerkleDistributor is IMerkleDistributor {
    address public immutable override token;
    bytes32 public immutable override merkleRoot;

    /// @dev This is a packed array of booleans to track claims
    mapping(uint256 => uint256) private claimedBitMap;

    /**
     * @param token_ The address of the ERC20 token this contract will distribute
     * @param merkleRoot_ The Merkle tree root
     */
    constructor(address token_, bytes32 merkleRoot_) {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    /**
     * @notice View method that specifies whether the account at a given index has claimed their
     * distribution yet
     * @param index Position in claimedBitMap of receiving accounts used to generate the Merkle Tree
     */
    function isClaimed(uint256 index) public view override returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    }

    /**
     * @notice Distributes unclaimed tokens to an account given a valid Merkle proof
     * and marks the claim as completed
     * @param index Position in the claimedBitMap of receiving account
     * @param account Ethereum address that has the right to claim at this index
     * @param amount Specific amount the account at this index has the right to claim
     * @param merkleProof Generated Merkle proof for this index, account, and amount
     */
    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof) external override {
        require(!isClaimed(index), 'MerkleDistributor: Drop already claimed.');

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, node), 'MerkleDistributor: Invalid proof.');

        // Mark it claimed and send the token.
        _setClaimed(index);
        require(IERC20(token).transfer(account, amount), 'MerkleDistributor: Transfer failed.');

        emit Claimed(index, account, amount);
    }
}
