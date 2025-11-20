// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../strategy/IStrategy.sol";

contract MockStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable ASSET;
    address public immutable VAULT;

    uint256 public totalManaged;

    event Deposited(uint256 amount);
    event Withdrawn(uint256 requested, uint256 actual);
    event Harvested(uint256 yieldAmount);

    constructor(IERC20 _asset, address _vault) {
        require(address(_asset) != address(0), "Asset cannot be zero");
        require(_vault != address(0), "Vault cannot be zero");

        ASSET = _asset;
        VAULT = _vault;
    }

    modifier onlyVault() {
        require(msg.sender == VAULT, "Not vault");
        _;
    }

    /// @notice Deposit funds from vault into strategy
    function deposit(uint256 amount) external override onlyVault {
        require(amount > 0, "Amount > 0");
        ASSET.safeTransferFrom(VAULT, address(this), amount);
        totalManaged += amount;
        emit Deposited(amount);
    }

    /// @notice Withdraw funds back to vault
    function withdraw(uint256 amount) external override onlyVault returns (uint256) {
        uint256 withdrawable = amount > totalManaged ? totalManaged : amount;

        totalManaged -= withdrawable;
        ASSET.safeTransfer(VAULT, withdrawable);

        emit Withdrawn(amount, withdrawable);
        return withdrawable;
    }

    /// @notice Simulate yield by increasing totalManaged by +1%
    function harvest() external override onlyVault returns (uint256) {
        uint256 simulatedYield = (totalManaged * 1) / 100; // +1%
        totalManaged += simulatedYield;
        emit Harvested(simulatedYield);
        return simulatedYield;
    }

    /// @notice How much the strategy currently manages
    function estimatedTotalAssets() external view override returns (uint256) {
        return totalManaged;
    }
}
