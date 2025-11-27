// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../strategy/IStrategy.sol";

contract TokenVault is ERC4626, ReentrancyGuard, Ownable {
    IStrategy public strategy;
    bool public strategyPaused;
    bool public harvesting;
    bool public withdrawn;

    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);
    event StrategyPaused(address indexed by, bool paused);
    event EarnedToStrategy(uint256 amount);
    event WithdrawnFromStrategy(uint256 requested, uint256 actual);
    event Harvested(uint256 amount);

    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_
    ) ERC4626(asset_) ERC20(name_, symbol_) Ownable(msg.sender) {
        strategyPaused = false;
    }

    /* ========================= VIEWS ========================= */
    function totalAssets() public view override returns (uint256) {
        uint256 localBalance = IERC20(asset()).balanceOf(address(this));
        uint256 stratAssets = 0;

        if (address(strategy) != address(0)) {
            try strategy.estimatedTotalAssets() returns (uint256 s) {
                stratAssets = s;
            } catch {
                stratAssets = 0;
            }
        }

        return localBalance + stratAssets;
    }

    /* ========================= OWNER STRATEGY MANAGEMENT ========================= */
    function setStrategy(IStrategy _strategy) external onlyOwner {
        address old = address(strategy);
        strategy = _strategy;
        emit StrategyUpdated(old, address(_strategy));
    }

    function setStrategyPaused(bool _paused) external onlyOwner {
        strategyPaused = _paused;
        emit StrategyPaused(msg.sender, _paused);
    }

    /* ========================= STRATEGY INTERACTIONS ========================= */

    /// @notice send the ENTIRE VAULT BALANCE into the strategy and harvest
    function earnAndHarvest() external onlyOwner nonReentrant {
        require(!strategyPaused, "Strategy paused");
        require(address(strategy) != address(0), "No strategy set");

        IERC20 token = IERC20(asset());
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No assets to earn");

        // Approve & deposit
        _safeApprove(token, address(strategy), 0);
        _safeApprove(token, address(strategy), balance);
        strategy.deposit(balance);

        emit EarnedToStrategy(balance);

        // Harvest
        harvesting = true;
        uint256 harvested = strategy.harvest();
        emit Harvested(harvested);
    }

    function withdrawFromStrategy(uint256 amount) 
        external 
        nonReentrant 
        onlyOwner 
        returns (uint256) 
    {
        require(address(strategy) != address(0), "No strategy set");

        withdrawn = true;

        IERC20 token = IERC20(asset());
        uint256 balBefore = token.balanceOf(address(this));

        strategy.withdraw(amount);

        uint256 balAfter = token.balanceOf(address(this));
        uint256 received = balAfter - balBefore;

        emit WithdrawnFromStrategy(amount, received);
        return received;
    }

    function harvest() external nonReentrant returns (uint256) {
        require(address(strategy) != address(0), "No strategy set");

        harvesting = true;

        uint256 harvested = strategy.harvest();
        emit Harvested(harvested);
        return harvested;
    }

    /* ========================= FLAGS RESET ========================= */
    function resetFlags() external onlyOwner {
        harvesting = false;
        withdrawn = false;
    }

    /* ========================= SAFETY / RECOVERY ========================= */
    function recoverERC20(IERC20 token, address to, uint256 amount) external onlyOwner {
        require(address(token) != address(asset()), "Cannot recover vault asset");
        _safeTransfer(token, to, amount);
    }

    function emergencyWithdrawAllFromStrategy() 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(address(strategy) != address(0), "No strategy set");
        
        uint256 requested = type(uint256).max;
        uint256 actual = strategy.withdraw(requested);

        emit WithdrawnFromStrategy(requested, actual);
    }

    /* ========================= INTERNAL HELPERS ========================= */
    function _safeApprove(IERC20 token, address spender, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.approve.selector, spender, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Approve failed");
    }

    function _safeTransfer(IERC20 token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transfer.selector, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }
}
