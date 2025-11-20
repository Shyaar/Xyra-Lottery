// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/registry/UserRegistry.sol";

contract DeployUserRegistry is Script {
    function run() external returns (UserRegistry) {
        vm.startBroadcast();
        UserRegistry userRegistry = new UserRegistry();
        vm.stopBroadcast();
        console.log("UserRegistry deployed to:", address(userRegistry));
        return userRegistry;
    }
}
