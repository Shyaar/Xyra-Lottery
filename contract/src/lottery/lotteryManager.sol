// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../vaults/tokenVault.sol";
import "../strategy/IStrategy.sol";

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface IRandomifier {
    function requestRandomness() external returns (uint256);
}

contract LotteryManager is ReentrancyGuard, Ownable {
    IWETH public immutable WETH;
    TokenVault public immutable vault;
    IERC20 public immutable asset;      // underlying asset (WETH)
    IERC20 public immutable vaultShare; // vault shares token (ERC20)

    bool public roundActive;
    uint256 public roundId;
    uint256 public roundEndTimestamp;

    address[] public entries;
    mapping(address => uint256) public sharesOf;
    mapping(address => bool) public principalClaimed;

    uint256 public totalPrincipal;
    uint256 public prizeAmountRedeemed;
    uint256 public prizeSharesRedeemed;

    address public randomifier;
    uint256 public pendingRequestId;
    bool public awaitingRandomness;

    address public winner;
    bool public prizeClaimed;

    event RoundStarted(uint256 indexed roundId, uint256 endTimestamp);
    event TicketBought(address indexed buyer, uint256 ethAmount, uint256 sharesReceived);
    event RandomnessRequested(uint256 requestId);
    event RoundClosed(uint256 indexed roundId, address indexed winner, uint256 prizeAmount);
    event PrizeRedeemed(uint256 indexed roundId, uint256 sharesRedeemed, uint256 amountRedeemed);
    event PrincipalClaimed(address indexed user, uint256 amount);
    event PrizeClaimed(address indexed winner, uint256 amount);

    modifier onlyActive() {
        require(roundActive, "Round not active");
        _;
    }

    modifier onlyEnded() {
        require(!roundActive && roundEndTimestamp != 0 && !awaitingRandomness, "Round not ended/awaiting");
        _;
    }

    modifier onlyRandomifier() {
        require(msg.sender == randomifier, "Only randomifier");
        _;
    }

    constructor(IWETH _weth, TokenVault _vault) Ownable(msg.sender) {
        WETH = _weth;
        vault = _vault;
        asset = IERC20(address(_weth));
        vaultShare = IERC20(address(_vault));
        roundActive = false;
        roundId = 0;
    }

    function setRandomifier(address _randomifier) external onlyOwner {
        randomifier = _randomifier;
    }

    function startRound(uint256 durationSeconds) external onlyOwner {
        require(!roundActive, "Round already active");
        require(durationSeconds > 0, "duration>0");
        require(winner == address(0) && !prizeClaimed, "previous not cleaned");

        roundActive = true;
        roundId += 1;
        roundEndTimestamp = block.timestamp + durationSeconds;

        emit RoundStarted(roundId, roundEndTimestamp);
    }

    function buyTicket() external payable nonReentrant onlyActive {
        require(msg.value > 0, "Must send ETH");

        // Wrap ETH -> WETH
        WETH.deposit{value: msg.value}();

        // Approve vault using low-level call
        (bool approved, ) = address(WETH).call(
            abi.encodeWithSelector(IWETH.approve.selector, address(vault), msg.value)
        );
        require(approved, "Approve failed");

        // Snapshot shares before deposit
        uint256 sharesBefore = vaultShare.balanceOf(address(this));

        // Deposit into vault
        vault.deposit(msg.value, address(this));

        uint256 sharesAfter = vaultShare.balanceOf(address(this));
        uint256 sharesReceived = sharesAfter - sharesBefore;
        require(sharesReceived > 0, "No shares minted");

        sharesOf[msg.sender] += sharesReceived;
        totalPrincipal += msg.value;
        entries.push(msg.sender);

        emit TicketBought(msg.sender, msg.value, sharesReceived);
    }

    function closeRound() external nonReentrant onlyActive {
        require(block.timestamp >= roundEndTimestamp, "Round not yet ended");

        roundActive = false;

        require(randomifier != address(0), "Randomifier not set");
        uint256 reqId = IRandomifier(randomifier).requestRandomness();
        pendingRequestId = reqId;
        awaitingRandomness = true;

        emit RandomnessRequested(reqId);
    }

    function receiveRandomness(uint256 requestId, uint256 randomness) external onlyRandomifier nonReentrant {
        require(awaitingRandomness, "No randomness pending");
        require(requestId == pendingRequestId, "Bad request id");

        _pickWinnerAndRedeemPrize(randomness);

        awaitingRandomness = false;
        pendingRequestId = 0;

        emit RoundClosed(roundId, winner, prizeAmountRedeemed);
    }

    function _pickWinnerAndRedeemPrize(uint256 randomness) internal {
        uint256 totalAssets = vault.totalAssets();
        uint256 prizeAmount = totalAssets > totalPrincipal ? totalAssets - totalPrincipal : 0;

        address picked = address(0);
        if (entries.length > 0 && randomness != 0) {
            picked = entries[randomness % entries.length];
        } else if (entries.length > 0) {
            picked = entries[0];
        }

        winner = picked;

        if (prizeAmount > 0) {
            uint256 sharesNeeded = vault.convertToShares(prizeAmount);
            if (sharesNeeded == 0) sharesNeeded = 1;

            uint256 balanceBefore = asset.balanceOf(address(this));
            vault.redeem(sharesNeeded, address(this), address(this));
            uint256 balanceAfter = asset.balanceOf(address(this));
            uint256 amountRedeemed = balanceAfter - balanceBefore;

            prizeSharesRedeemed = sharesNeeded;
            prizeAmountRedeemed = amountRedeemed;

            emit PrizeRedeemed(roundId, sharesNeeded, amountRedeemed);
        } else {
            prizeSharesRedeemed = 0;
            prizeAmountRedeemed = 0;
            emit PrizeRedeemed(roundId, 0, 0);
        }
    }

    function claimPrincipal() external nonReentrant onlyEnded {
        uint256 shares = sharesOf[msg.sender];
        require(shares > 0, "No principal");
        require(!principalClaimed[msg.sender], "Already claimed");

        principalClaimed[msg.sender] = true;
        sharesOf[msg.sender] = 0;

        uint256 balanceBefore = asset.balanceOf(address(this));
        vault.redeem(shares, address(this), address(this));
        uint256 balanceAfter = asset.balanceOf(address(this));
        uint256 amountReceived = balanceAfter - balanceBefore;

        if (amountReceived > 0) {
            WETH.withdraw(amountReceived);
            (bool sent, ) = payable(msg.sender).call{value: amountReceived}("");
            require(sent, "ETH transfer failed");
        }

        emit PrincipalClaimed(msg.sender, amountReceived);
    }

    function claimPrize() external nonReentrant onlyEnded {
        require(msg.sender == winner, "Not winner");
        require(!prizeClaimed, "Prize already claimed");
        require(prizeAmountRedeemed > 0, "No prize to claim");

        prizeClaimed = true;

        uint256 amount = prizeAmountRedeemed;

        WETH.withdraw(amount);
        (bool sent, ) = payable(winner).call{value: amount}("");
        require(sent, "ETH transfer failed");

        emit PrizeClaimed(winner, amount);
    }

    function entryCount() external view returns (uint256) {
        return entries.length;
    }

    function expectedRefund(address user) external view returns (uint256) {
        uint256 shares = sharesOf[user];
        if (shares == 0) return 0;
        return vault.convertToAssets(shares);
    }

    function resetRoundState() external onlyOwner {
        require(!roundActive, "Round active");

        delete entries;

        winner = address(0);
        prizeClaimed = false;
        prizeAmountRedeemed = 0;
        prizeSharesRedeemed = 0;
        totalPrincipal = 0;
        roundEndTimestamp = 0;
        awaitingRandomness = false;
        pendingRequestId = 0;
    }

    receive() external payable {}
}
