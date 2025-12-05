// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IDGAFBridge
 * @dev Bridge contract for transferring IDGAF tokens between Monad (L1) and IDGAF Chain (L2)
 */
contract IDGAFBridge is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // IDGAF Token address on Monad
    address public constant IDGAF_TOKEN = 0x87deEb3696Ec069d5460C389cc78925df50d7777;

    // Bridge state
    mapping(bytes32 => bool) public processedDeposits;
    mapping(bytes32 => bool) public processedWithdrawals;
    
    // Events
    event Deposit(
        address indexed user,
        uint256 amount,
        bytes32 indexed depositId,
        uint256 timestamp
    );

    event Withdrawal(
        address indexed user,
        uint256 amount,
        bytes32 indexed withdrawalId,
        uint256 timestamp
    );

    event BridgeOperatorUpdated(address indexed operator, bool enabled);

    // Bridge operators (for L2 validation)
    mapping(address => bool) public bridgeOperators;

    modifier onlyOperator() {
        require(bridgeOperators[msg.sender], "IDGAFBridge: not an operator");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        bridgeOperators[msg.sender] = true;
    }

    /**
     * @dev Deposit IDGAF tokens from Monad to IDGAF Chain
     * @param amount Amount of tokens to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "IDGAFBridge: amount must be greater than 0");
        
        IERC20 token = IERC20(IDGAF_TOKEN);
        require(token.balanceOf(msg.sender) >= amount, "IDGAFBridge: insufficient balance");
        
        // Transfer tokens from user to bridge
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        // Generate deposit ID
        bytes32 depositId = keccak256(
            abi.encodePacked(msg.sender, amount, block.timestamp, block.number)
        );
        
        require(!processedDeposits[depositId], "IDGAFBridge: deposit already processed");
        processedDeposits[depositId] = true;
        
        emit Deposit(msg.sender, amount, depositId, block.timestamp);
    }

    /**
     * @dev Withdraw IDGAF tokens from IDGAF Chain to Monad (called by operator)
     * @param user Address to receive tokens
     * @param amount Amount of tokens to withdraw
     * @param withdrawalId Unique withdrawal identifier
     */
    function withdraw(
        address user,
        uint256 amount,
        bytes32 withdrawalId
    ) external onlyOperator nonReentrant {
        require(user != address(0), "IDGAFBridge: invalid user address");
        require(amount > 0, "IDGAFBridge: amount must be greater than 0");
        require(!processedWithdrawals[withdrawalId], "IDGAFBridge: withdrawal already processed");
        
        IERC20 token = IERC20(IDGAF_TOKEN);
        require(token.balanceOf(address(this)) >= amount, "IDGAFBridge: insufficient bridge balance");
        
        processedWithdrawals[withdrawalId] = true;
        
        // Transfer tokens to user
        token.safeTransfer(user, amount);
        
        emit Withdrawal(user, amount, withdrawalId, block.timestamp);
    }

    /**
     * @dev Set bridge operator status
     * @param operator Address of the operator
     * @param enabled Whether the operator is enabled
     */
    function setBridgeOperator(address operator, bool enabled) external onlyOwner {
        require(operator != address(0), "IDGAFBridge: invalid operator address");
        bridgeOperators[operator] = enabled;
        emit BridgeOperatorUpdated(operator, enabled);
    }

    /**
     * @dev Get bridge balance
     */
    function getBridgeBalance() external view returns (uint256) {
        return IERC20(IDGAF_TOKEN).balanceOf(address(this));
    }
}

