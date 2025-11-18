// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface ILotteryManager {
    function receiveRandomness(uint256 requestId, uint256 randomness) external;
}

contract MockRandomifier {
    uint256 private counter;

    event RandomRequested(uint256 indexed requestId);
    event RandomDelivered(uint256 indexed requestId, uint256 random);

    /// @notice called by LotteryManager.closeRound()
    function requestRandomness() external returns (uint256 requestId) {
        requestId = counter++;
        emit RandomRequested(requestId);

        // generate simple pseudo-random number
        uint256 random = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, requestId))
        );

        // immediately call back to LotteryManager
        ILotteryManager(msg.sender).receiveRandomness(requestId, random);

        emit RandomDelivered(requestId, random);
    }
}
