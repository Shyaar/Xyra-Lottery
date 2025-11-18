// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../strategy/IStrategy.sol";
import "./tokenVault.sol"; // To restrict calls to the vault

contract MockStrategy is IStrategy {
    using SafeERC20 for IERC20;

    IERC20 public immutable asset;
    address public immutable vault;

    uint256 public totalManaged;

    constructor(IERC20 _asset, address _vault) {
        asset = _asset;
        vault = _vault;
    }

    modifier onlyVault() {
        require(msg.sender == vault, "Not vault");
        _;
    }

    /// @notice Deposit funds from vault into strategy
    function deposit(uint256 amount) external override onlyVault {
        asset.safeTransferFrom(vault, address(this), amount);
        totalManaged += amount;
    }

    /// @notice Withdraw funds back to vault
    function withdraw(uint256 amount) external override onlyVault returns (uint256) {
        uint256 withdrawable = amount > totalManaged ? totalManaged : amount;

        totalManaged -= withdrawable;
        asset.safeTransfer(vault, withdrawable);

        return withdrawable;
    }

    /// @notice Simulate yield by increasing totalManaged by +1%
    function harvest() external override onlyVault returns (uint256) {
        uint256 simulatedYield = (totalManaged * 1) / 100; // +1%

        totalManaged += simulatedYield;
        return simulatedYield;
    }

    /// @notice How much the strategy currently “manages”
    function estimatedTotalAssets() external view override returns (uint256) {
        return totalManaged;
    }
}
