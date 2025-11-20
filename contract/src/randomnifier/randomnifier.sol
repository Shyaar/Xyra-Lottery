// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/*
 Randomifier.sol — Chainlink VRF v2 wrapper
 - Requests randomness from Chainlink VRF V2
 - Forwards randomness to a configured consumer contract (LotteryManager)
 - Only an authorized requester (lottery manager) can call requestRandomness()
 - Owner can set requester, subscriptionId, keyHash, etc.
*/

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ILotteryManagerCallback {
    function receiveRandomness(uint256 requestId, uint256 randomness) external;
}

contract Randomifier is VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface COORDINATOR;

    // Chainlink VRF params — set in constructor or via setters
    uint64 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit;
    uint16 public requestConfirmations;

    address public requester; // address allowed to request randomness (e.g., LotteryManager)
    address public consumerCallback; // LotteryManager contract

    event RandomRequested(uint256 requestId, address indexed by);
    event RandomFulfilled(uint256 requestId, uint256 randomness);

    constructor(
        address vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) VRFConsumerBaseV2(vrfCoordinator) Ownable(msg.sender) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
    }

    /// @notice Set the single allowed requester (e.g., your LotteryManager)
    function setRequester(address _requester) external onlyOwner {
        requester = _requester;
    }

    /// @notice Set the consumer callback address (lottery manager)
    function setConsumerCallback(address _consumer) external onlyOwner {
        consumerCallback = _consumer;
    }

    /// @notice Owner can tweak VRF params if needed
    function setVRFParams(
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) external onlyOwner {
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
    }

    /// @notice Called by authorized requester to ask for random words
    function requestRandomness() external returns (uint256 requestId) {
        require(msg.sender == requester, "Not authorized");
        require(consumerCallback != address(0), "No consumer callback set");

        // Request a single random word
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1
        );

        emit RandomRequested(requestId, msg.sender);
        return requestId;
    }

    /// @notice Chainlink VRF callback
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 randomness = randomWords.length > 0 ? randomWords[0] : 0;
        emit RandomFulfilled(requestId, randomness);

        // forward to consumer
        if (consumerCallback != address(0)) {
            ILotteryManagerCallback(consumerCallback).receiveRandomness(requestId, randomness);
        }
    }
}




