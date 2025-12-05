// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title IDGAFTokenL2
 * @dev L2 representation of IDGAF token on IDGAF Chain
 * This token is minted when tokens are deposited from Monad and burned when withdrawn
 */
contract IDGAFTokenL2 is ERC20, Ownable, Pausable {
    // Bridge contract address (only bridge can mint/burn)
    address public bridge;

    // Events
    event BridgeUpdated(address indexed oldBridge, address indexed newBridge);
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    modifier onlyBridge() {
        require(msg.sender == bridge, "IDGAFTokenL2: only bridge can call");
        _;
    }

    constructor(address initialOwner) ERC20("IDGAF Token", "IDGAF") Ownable(initialOwner) {
        // Initial supply is 0, tokens are minted when deposited from L1
    }

    /**
     * @dev Set the bridge contract address
     * @param _bridge Address of the bridge contract
     */
    function setBridge(address _bridge) external onlyOwner {
        require(_bridge != address(0), "IDGAFTokenL2: invalid bridge address");
        address oldBridge = bridge;
        bridge = _bridge;
        emit BridgeUpdated(oldBridge, _bridge);
    }

    /**
     * @dev Mint tokens (called by bridge when depositing from L1)
     * @param to Address to receive tokens
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyBridge whenNotPaused {
        require(to != address(0), "IDGAFTokenL2: cannot mint to zero address");
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @dev Burn tokens (called by bridge when withdrawing to L1)
     * @param from Address to burn tokens from
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) external onlyBridge whenNotPaused {
        require(from != address(0), "IDGAFTokenL2: cannot burn from zero address");
        _burn(from, amount);
        emit Burned(from, amount);
    }

    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override transfer to check pause status
     */
    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}

