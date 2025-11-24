// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../vaults/tokenVault.sol";
import "../strategy/IStrategy.sol";
import {LotteryErrors} from "../lib/errors/lotteryErrors.sol";
import {LotteryEvents} from "../lib/events/lotteryEvents.sol";

interface IRandomifier {
    function requestRandomness() external returns (uint256);
}

contract LotteryManager is ReentrancyGuard, Ownable {
    IERC20 public immutable USDC;        // underlying ERC-20 token (USDC)
    TokenVault public immutable VAULT;
    IERC20 public immutable VAULT_SHARE; // Vault shares token (ERC20)

    // Round state
    bool public roundActive;
    uint256 public roundId;
    uint256 public roundEndTimestamp;

    // Principal / prize accounting
    uint256 public totalPrincipal;
    uint256 public prizeAmountRedeemed;
    uint256 public prizeSharesRedeemed;

    // Randomness
    address public randomifier;
    uint256 public pendingRequestId;
    bool public awaitingRandomness;

    // Winner tracking
    address public winner;
    bool public prizeClaimed;

    // Entries & shares
    address[] public entries;
    mapping(address => uint256) public sharesOf;
    mapping(address => bool) public principalClaimed;

    // Ticket tracking
    struct Ticket {
        uint256 ticketId;
        uint256 roundEndTimestamp;
        uint256 principal;
        address owner;
    }

    uint256 public nextTicketId = 1;
    mapping(address => uint256[]) public userTickets;
    mapping(uint256 => Ticket) public tickets;

    // Scheduling (auto-start / auto-close)
    uint256 public roundDuration;      // seconds (owner configurable)
    uint256 public cooldownPeriod;     // seconds between rounds (owner configurable)
    uint256 public nextRoundStartTime; // earliest timestamp when keeper can start next round

    // -------------------------------
    // Modifiers
    // -------------------------------
    modifier onlyActive() {
        if (!roundActive) revert LotteryErrors.RoundNotActive();
        _;
    }

    modifier onlyEnded() {
        if (roundActive || roundEndTimestamp == 0 || awaitingRandomness)
            revert LotteryErrors.RoundNotEndedOrAwaiting();
        _;
    }

    modifier onlyRandomifier() {
        if (msg.sender != randomifier) revert LotteryErrors.OnlyRandomifier();
        _;
    }

    // -------------------------------
    // Constructor
    // -------------------------------
    constructor(IERC20 _usdc, TokenVault _vault) Ownable(msg.sender) {
        if (address(_usdc) == address(0)) revert LotteryErrors.ZeroAddress();
        if (address(_vault) == address(0)) revert LotteryErrors.ZeroAddress();

        USDC = _usdc;
        VAULT = _vault;
        VAULT_SHARE = IERC20(address(_vault));

        roundActive = false;
        roundId = 0;

        // Defaults: 2 minutes round, 1 minute cooldown
        roundDuration = 2 * 60;
        cooldownPeriod = 1 * 60;
        nextRoundStartTime = block.timestamp; // allow immediate start by keeper if desired
    }

    // -------------------------------
    // Owner Functions
    // -------------------------------
    function setRandomifier(address _randomifier) external onlyOwner {
        randomifier = _randomifier;
    }

    // Owner-facing manual start (keeps previous behavior for owner)
    function startRound(uint256 durationSeconds) external onlyOwner {
        _startRound(durationSeconds);
    }

    // Owner manual close (keeps previous behavior for owner)
    function closeRound() external onlyOwner {
        _closeRound();
    }

    function resetRoundState() external onlyOwner {
        if (roundActive) revert LotteryErrors.RoundActive();

        delete entries;

        winner = address(0);
        prizeClaimed = false;
        prizeAmountRedeemed = 0;
        prizeSharesRedeemed = 0;
        totalPrincipal = 0;
        roundEndTimestamp = 0;
        awaitingRandomness = false;
        pendingRequestId = 0;

        // Reset tickets
        nextTicketId = 1;
    }

    // Owner can update roundDuration at any time
    function setRoundDuration(uint256 _seconds) external onlyOwner {
        if (_seconds == 0) revert LotteryErrors.InvalidDuration();
        roundDuration = _seconds;
        emit LotteryEvents.RoundDurationUpdated(_seconds);
    }

    // Owner can update cooldown between rounds
    function setCooldownPeriod(uint256 _seconds) external onlyOwner {
        cooldownPeriod = _seconds;
        emit LotteryEvents.CooldownUpdated(_seconds);
    }

    // -------------------------------
    // Keeper-friendly view helpers
    // -------------------------------
    // Keeper (or anyone) can call these to know when to run performStart/performClose
    function shouldStartRound() public view returns (bool) {
        if (roundActive) return false;
        if (awaitingRandomness) return false;
        // ensure previous round cleared
        if (winner != address(0) || prizeClaimed) return false;
        return block.timestamp >= nextRoundStartTime;
    }

    function shouldCloseRound() public view returns (bool) {
        if (!roundActive) return false;
        if (block.timestamp < roundEndTimestamp) return false;
        return true;
    }

    // Keeper-executable functions (public). They are guarded by should* checks,
    // meaning callers can't incorrectly start/close unless criteria are met.
    function performStart() external {
        if (!shouldStartRound()) revert LotteryErrors.CannotStart();
        _startRound(roundDuration);
    }

    function performClose() external {
        if (!shouldCloseRound()) revert LotteryErrors.CannotClose();
        _closeRound();
    }

    // -------------------------------
    // Internal start/close implementations
    // -------------------------------
    function _startRound(uint256 durationSeconds) internal {
        if (roundActive) revert LotteryErrors.RoundActive();
        if (durationSeconds == 0) revert LotteryErrors.InvalidDuration();
        if (winner != address(0) || prizeClaimed)
            revert LotteryErrors.PreviousRoundNotCleaned();

        roundActive = true;
        roundId += 1;
        roundEndTimestamp = block.timestamp + durationSeconds;

        emit LotteryEvents.RoundStarted(roundId, roundEndTimestamp);
    }

    function _closeRound() internal {
        if (!roundActive) revert LotteryErrors.RoundNotActive();
        if (block.timestamp < roundEndTimestamp)
            revert LotteryErrors.RoundNotEnded();

        // deactivate round and request randomness
        roundActive = false;

        if (randomifier == address(0)) revert LotteryErrors.RandomifierNotSet();
        awaitingRandomness = true;
        
        uint256 reqId = IRandomifier(randomifier).requestRandomness();
        pendingRequestId = reqId;

        emit LotteryEvents.RandomnessRequested(reqId);
    }

    // -------------------------------
    // Ticket & Lottery Functions (ERC-20 USDC flow)
    // -------------------------------
    // User must approve this contract to spend USDC before calling buyTicket
    function buyTicket(uint256 amount) external nonReentrant onlyActive {
        if (amount == 0) revert LotteryErrors.MustSendUSDC();

        // Transfer USDC from user to contract
        bool ok = USDC.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert LotteryErrors.ERC20TransferFailed();

        // Approve vault then deposit - assuming TokenVault expects underlying transferred or pulls via transferFrom.
        // Approve is a safe fallback to support vaults that use transferFrom internally.
        // (If your vault expects tokens to be already transferred, this is still fine.)
        USDC.approve(address(VAULT), amount);

        uint256 sharesBefore = VAULT_SHARE.balanceOf(address(this));
        VAULT.deposit(amount, address(this));
        uint256 sharesAfter = VAULT_SHARE.balanceOf(address(this));
        uint256 sharesReceived = sharesAfter - sharesBefore;
        if (sharesReceived == 0) revert LotteryErrors.NoSharesMinted();

        sharesOf[msg.sender] += sharesReceived;
        totalPrincipal += amount;
        entries.push(msg.sender);

        // --- Ticket Tracking ---
        uint256 ticketId = nextTicketId++;
        Ticket memory newTicket = Ticket({
            ticketId: ticketId,
            roundEndTimestamp: roundEndTimestamp,
            principal: amount,
            owner: msg.sender
        });

        tickets[ticketId] = newTicket;
        userTickets[msg.sender].push(ticketId);

        emit LotteryEvents.TicketBought(msg.sender, amount, sharesReceived);
    }


    function receiveRandomness(uint256 requestId, uint256 randomness)
        external
        onlyRandomifier
        nonReentrant
    {
        if (!awaitingRandomness) revert LotteryErrors.NoRandomnessPending();
        if (requestId != pendingRequestId) revert LotteryErrors.BadRequestId();

        _pickWinnerAndRedeemPrize(randomness);

        awaitingRandomness = false;
        pendingRequestId = 0;

        // Schedule next round start after cooldown
        nextRoundStartTime = block.timestamp + cooldownPeriod;

        emit LotteryEvents.RoundClosed(roundId, winner, prizeAmountRedeemed);
    }

    function _pickWinnerAndRedeemPrize(uint256 randomness) internal {
        uint256 totalAssets = VAULT.totalAssets();
        uint256 prizeAmount = totalAssets > totalPrincipal
            ? totalAssets - totalPrincipal
            : 0;

        address picked = address(0);
        if (entries.length > 0) {
            picked = randomness != 0
                ? entries[randomness % entries.length]
                : entries[0];
        }

        winner = picked;

        if (prizeAmount > 0) {
            uint256 sharesNeeded = VAULT.convertToShares(prizeAmount);
            if (sharesNeeded == 0) sharesNeeded = 1;

            uint256 balanceBefore = USDC.balanceOf(address(this));
            VAULT.redeem(sharesNeeded, address(this), address(this));
            uint256 balanceAfter = USDC.balanceOf(address(this));
            prizeAmountRedeemed = balanceAfter - balanceBefore;
            prizeSharesRedeemed = sharesNeeded;

            emit LotteryEvents.PrizeRedeemed(
                roundId,
                sharesNeeded,
                prizeAmountRedeemed
            );
        } else {
            prizeAmountRedeemed = 0;
            prizeSharesRedeemed = 0;
            emit LotteryEvents.PrizeRedeemed(roundId, 0, 0);
        }
    }

    // -------------------------------
    // Claims (payouts in USDC)
    // -------------------------------
    function claimPrincipal() external nonReentrant onlyEnded {
        uint256 shares = sharesOf[msg.sender];
        if (shares == 0) revert LotteryErrors.NoPrincipal();
        if (principalClaimed[msg.sender]) revert LotteryErrors.AlreadyClaimed();

        principalClaimed[msg.sender] = true;
        sharesOf[msg.sender] = 0;

        uint256 balanceBefore = USDC.balanceOf(address(this));
        VAULT.redeem(shares, address(this), address(this));
        uint256 balanceAfter = USDC.balanceOf(address(this));
        uint256 amountReceived = balanceAfter - balanceBefore;

        if (amountReceived > 0) {
            bool sent = USDC.transfer(msg.sender, amountReceived);
            if (!sent) revert LotteryErrors.ERC20TransferFailed();
        }

        emit LotteryEvents.PrincipalClaimed(msg.sender, amountReceived);
    }

    function claimPrize() external nonReentrant onlyEnded {
        if (msg.sender != winner) revert LotteryErrors.NotWinner();
        if (prizeClaimed) revert LotteryErrors.PrizeAlreadyClaimed();
        if (prizeAmountRedeemed == 0) revert LotteryErrors.NoPrizeToClaim();

        prizeClaimed = true;

        bool sent = USDC.transfer(winner, prizeAmountRedeemed);
        if (!sent) revert LotteryErrors.ERC20TransferFailed();

        emit LotteryEvents.PrizeClaimed(winner, prizeAmountRedeemed);
    }

    // -------------------------------
    // Views
    // -------------------------------
    function entryCount() external view returns (uint256) {
        return entries.length;
    }

    function expectedRefund(address user) external view returns (uint256) {
        uint256 shares = sharesOf[user];
        return shares == 0 ? 0 : VAULT.convertToAssets(shares);
    }

    function getUserTickets(address user) external view returns (Ticket[] memory) {
        uint256[] memory ids = userTickets[user];
        Ticket[] memory userTicketList = new Ticket[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            userTicketList[i] = tickets[ids[i]];
        }
        return userTicketList;
    }

    function getTicketById(uint256 ticketId) external view returns (Ticket memory) {
        return tickets[ticketId];
    }
}
