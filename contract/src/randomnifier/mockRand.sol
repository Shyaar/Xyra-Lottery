// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface ILotteryManager {
    function receiveRandomness(uint256 requestId, uint256 randomness) external;
}

/// @notice Simple mock for testing LotteryManager randomness
contract MockRandomifier {
    uint256 private counter;

    event RandomRequested(uint256 indexed requestId);
    event RandomDelivered(uint256 indexed requestId, uint256 random);

    /// @notice Called by LotteryManager.closeRound() to request randomness
    /// @dev Immediately calls back LotteryManager.receiveRandomness for testing
    function requestRandomness() external returns (uint256 requestId) {
        requestId = counter++;
        emit RandomRequested(requestId);

        // Generate pseudo-random number (for demo/testing only)
        uint256 random = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, requestId))
        );

        // Immediately callback to LotteryManager
        ILotteryManager(msg.sender).receiveRandomness(requestId, random);

        emit RandomDelivered(requestId, random);
    }
}
