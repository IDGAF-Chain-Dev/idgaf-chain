// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IDGAFTokenL2.sol";

/**
 * @title IDGAFChainBridge
 * @dev Bridge contract on IDGAF Chain (L2) side
 * Handles minting/burning of L2 tokens based on deposits/withdrawals
 */
contract IDGAFChainBridge is ReentrancyGuard, Ownable {
    IDGAFTokenL2 public idgafToken;
    
    // Monad L1 bridge address
    address public monadBridge;
    
    // Processed transactions
    mapping(bytes32 => bool) public processedDeposits;
    mapping(bytes32 => bool) public processedWithdrawals;
    
    // Events
    event DepositProcessed(
        address indexed user,
        uint256 amount,
        bytes32 indexed depositId,
        uint256 timestamp
    );

    event WithdrawalInitiated(
        address indexed user,
        uint256 amount,
        bytes32 indexed withdrawalId,
        uint256 timestamp
    );

    event MonadBridgeUpdated(address indexed oldBridge, address indexed newBridge);

    modifier onlyMonadBridge() {
        require(msg.sender == monadBridge, "IDGAFChainBridge: only Monad bridge can call");
        _;
    }

    constructor(
        address _idgafToken,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_idgafToken != address(0), "IDGAFChainBridge: invalid token address");
        idgafToken = IDGAFTokenL2(_idgafToken);
    }

    /**
     * @dev Process deposit from Monad (called by operator/relayer)
     * @param user Address to receive L2 tokens
     * @param amount Amount of tokens
     * @param depositId Unique deposit identifier from L1
     */
    function processDeposit(
        address user,
        uint256 amount,
        bytes32 depositId
    ) external onlyOwner nonReentrant {
        require(user != address(0), "IDGAFChainBridge: invalid user address");
        require(amount > 0, "IDGAFChainBridge: amount must be greater than 0");
        require(!processedDeposits[depositId], "IDGAFChainBridge: deposit already processed");
        
        processedDeposits[depositId] = true;
        
        // Mint L2 tokens to user
        idgafToken.mint(user, amount);
        
        emit DepositProcessed(user, amount, depositId, block.timestamp);
    }

    /**
     * @dev Initiate withdrawal to Monad
     * @param amount Amount of tokens to withdraw
     */
    function initiateWithdrawal(uint256 amount) external nonReentrant {
        require(amount > 0, "IDGAFChainBridge: amount must be greater than 0");
        require(idgafToken.balanceOf(msg.sender) >= amount, "IDGAFChainBridge: insufficient balance");
        
        // Burn L2 tokens
        idgafToken.burn(msg.sender, amount);
        
        // Generate withdrawal ID
        bytes32 withdrawalId = keccak256(
            abi.encodePacked(msg.sender, amount, block.timestamp, block.number)
        );
        
        require(!processedWithdrawals[withdrawalId], "IDGAFChainBridge: withdrawal ID collision");
        processedWithdrawals[withdrawalId] = true;
        
        emit WithdrawalInitiated(msg.sender, amount, withdrawalId, block.timestamp);
    }

    /**
     * @dev Set Monad bridge address
     * @param _monadBridge Address of the bridge on Monad
     */
    function setMonadBridge(address _monadBridge) external onlyOwner {
        require(_monadBridge != address(0), "IDGAFChainBridge: invalid bridge address");
        address oldBridge = monadBridge;
        monadBridge = _monadBridge;
        emit MonadBridgeUpdated(oldBridge, _monadBridge);
    }
}

