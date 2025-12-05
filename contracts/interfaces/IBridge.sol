// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IBridge
 * @dev Interface for bridge contracts
 */
interface IBridge {
    function deposit(uint256 amount) external;
    function withdraw(address user, uint256 amount, bytes32 withdrawalId) external;
}

