// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/vaults/tokenVault.sol";
import "../src/vaults/mockStrategy.sol";
import "../src/lottery/lotteryManager.sol";
import "../src/randomnifier/mockRand.sol";



contract Deploy is Script {

    // --- Base mainnet addresses ---
    // Base Mainnet WETH address (canonical L2 WETH)
    address constant BASE_WETH = 0x4200000000000000000000000000000000000006;

    function run() external {


        vm.startBroadcast();
        // ---------------------------------------------------------
        // 1. Deploy the VAULT (ERC4626)
        // ---------------------------------------------------------
        TokenVault vault = new TokenVault(
            IERC20(BASE_WETH), 
            "Xyra Yield Vault",
            "XYRA-V"
        );

        // ---------------------------------------------------------
        // 2. Deploy Strategy (Mock for now)
        // ---------------------------------------------------------
        MockStrategy strategy = new MockStrategy(
            IERC20(BASE_WETH),
            address(vault)
        );

        // Set strategy on vault
        vault.setStrategy(IStrategy(address(strategy)));

        // ---------------------------------------------------------
        // 3. Deploy the Randomifier
        // ---------------------------------------------------------
        MockRandomifier randomifier = new MockRandomifier();

        // ---------------------------------------------------------
        // 4. Deploy LotteryManager
        // ---------------------------------------------------------
        LotteryManager lottery = new LotteryManager(
            IWETH(BASE_WETH),
            vault
        );

        // Link randomifier
        lottery.setRandomifier(address(randomifier));

        

        // ---------------------------------------------------------
        // 5. Ownership Setup
        // ---------------------------------------------------------
        // Make vault owner the deployer by default (Done in constructor)
        // Make lottery owner the deployer (Done in constructor)

        vm.stopBroadcast();

        // ---------------------------------------------------------
        // LOG OUTPUT
        // ---------------------------------------------------------
        console.log("=== Deployment Complete ===");
        console.log("Vault:          ", address(vault));
        console.log("Strategy:       ", address(strategy));
        console.log("Randomifier:    ", address(randomifier));
        console.log("LotteryManager: ", address(lottery));
        console.log("===========================");
    }
}
