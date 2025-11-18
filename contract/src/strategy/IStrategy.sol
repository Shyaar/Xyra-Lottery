// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IStrategy {
    /// @notice Deposits underlying asset into the strategy
    /// @param amount Amount of asset to deposit
    function deposit(uint256 amount) external;

    /// @notice Withdraws up to `amount` of asset from the strategy to the vault
    /// @param amount Requested amount to withdraw
    /// @return withdrawn actual amount withdrawn and returned to vault
    function withdraw(uint256 amount) external returns (uint256 withdrawn);

    /// @notice Harvest rewards and send them (or converted assets) back to the vault
    /// @return harvestedAmount amount of asset harvested and returned to vault
    function harvest() external returns (uint256 harvestedAmount);

    /// @notice View how much asset this strategy holds (or is entitled to)
    function estimatedTotalAssets() external view returns (uint256);
}