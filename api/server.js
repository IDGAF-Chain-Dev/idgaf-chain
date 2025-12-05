const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// Load contract addresses
const loadDeployments = () => {
  const l1File = path.join(__dirname, '../deployments/monad-l1.json');
  const l2File = path.join(__dirname, '../deployments/hardhat-l2.json');
  
  const l1 = fs.existsSync(l1File) ? JSON.parse(fs.readFileSync(l1File, 'utf-8')) : null;
  const l2 = fs.existsSync(l2File) ? JSON.parse(fs.readFileSync(l2File, 'utf-8')) : null;
  
  return { l1, l2 };
};

const deployments = loadDeployments();

// Contract ABIs (simplified)
const BRIDGE_ABI = [
  "function getBridgeBalance() view returns (uint256)",
  "function bridgeOperators(address) view returns (bool)",
  "event Deposit(address indexed user, uint256 amount, bytes32 indexed depositId, uint256 timestamp)",
  "event Withdrawal(address indexed user, uint256 amount, bytes32 indexed withdrawalId, uint256 timestamp)"
];

const L2_BRIDGE_ABI = [
  "function monadBridge() view returns (address)",
  "function owner() view returns (address)",
  "event DepositProcessed(address indexed user, uint256 amount, bytes32 indexed depositId, uint256 timestamp)",
  "event WithdrawalInitiated(address indexed user, uint256 amount, bytes32 indexed withdrawalId, uint256 timestamp)"
];

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// Initialize providers
const getProvider = (network) => {
  if (network === 'l1') {
    const rpc = process.env.MONAD_RPC_URL || 'https://rpc1.monad.xyz';
    return new ethers.JsonRpcProvider(rpc);
  } else {
    const rpc = process.env.IDGAF_RPC_URL || 'http://localhost:8546';
    return new ethers.JsonRpcProvider(rpc);
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get bridge status
app.get('/api/status', async (req, res) => {
  try {
    const status = {
      l1: {
        bridge: deployments.l1?.contracts?.idgafBridgeL1 || null,
        token: deployments.l1?.idgafTokenL1 || null,
        connected: false,
        balance: '0'
      },
      l2: {
        bridge: deployments.l2?.contracts?.idgafChainBridge || null,
        token: deployments.l2?.contracts?.idgafTokenL2 || null,
        connected: false,
        supply: '0'
      },
      connections: {
        l1ToL2: false,
        l2ToToken: false
      }
    };

    // Check L1 bridge
    if (status.l1.bridge) {
      try {
        const provider = getProvider('l1');
        const contract = new ethers.Contract(status.l1.bridge, BRIDGE_ABI, provider);
        const balance = await contract.getBridgeBalance();
        status.l1.balance = ethers.formatEther(balance);
        status.l1.connected = true;
      } catch (error) {
        console.error('L1 bridge error:', error.message);
      }
    }

    // Check L2 bridge
    if (status.l2.bridge) {
      try {
        const provider = getProvider('l2');
        const contract = new ethers.Contract(status.l2.bridge, L2_BRIDGE_ABI, provider);
        const monadBridge = await contract.monadBridge();
        status.connections.l1ToL2 = monadBridge.toLowerCase() === status.l1.bridge?.toLowerCase();
        status.l2.connected = true;
      } catch (error) {
        console.error('L2 bridge error:', error.message);
      }
    }

    // Check L2 token
    if (status.l2.token) {
      try {
        const provider = getProvider('l2');
        const contract = new ethers.Contract(status.l2.token, ERC20_ABI, provider);
        const supply = await contract.totalSupply();
        status.l2.supply = ethers.formatEther(supply);
      } catch (error) {
        console.error('L2 token error:', error.message);
      }
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bridge statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalVolume: '0',
      l1Balance: '0',
      l2Supply: '0',
      lastUpdated: new Date().toISOString()
    };

    // Get L1 balance
    if (deployments.l1?.contracts?.idgafBridgeL1) {
      try {
        const provider = getProvider('l1');
        const contract = new ethers.Contract(
          deployments.l1.contracts.idgafBridgeL1,
          BRIDGE_ABI,
          provider
        );
        const balance = await contract.getBridgeBalance();
        stats.l1Balance = ethers.formatEther(balance);
      } catch (error) {
        console.error('Error getting L1 balance:', error.message);
      }
    }

    // Get L2 supply
    if (deployments.l2?.contracts?.idgafTokenL2) {
      try {
        const provider = getProvider('l2');
        const contract = new ethers.Contract(
          deployments.l2.contracts.idgafTokenL2,
          ERC20_ABI,
          provider
        );
        const supply = await contract.totalSupply();
        stats.l2Supply = ethers.formatEther(supply);
      } catch (error) {
        console.error('Error getting L2 supply:', error.message);
      }
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contract addresses
app.get('/api/contracts', (req, res) => {
  res.json({
    l1: {
      bridge: deployments.l1?.contracts?.idgafBridgeL1 || null,
      token: deployments.l1?.idgafTokenL1 || null
    },
    l2: {
      bridge: deployments.l2?.contracts?.idgafChainBridge || null,
      token: deployments.l2?.contracts?.idgafTokenL2 || null
    }
  });
});

// Get transaction history (placeholder - would need database in production)
app.get('/api/transactions', (req, res) => {
  res.json({
    deposits: [],
    withdrawals: [],
    message: 'Transaction history requires database integration'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 IDGAF Bridge API Server running on http://localhost:${PORT}`);
  console.log(`📊 Status endpoint: http://localhost:${PORT}/api/status`);
  console.log(`📈 Stats endpoint: http://localhost:${PORT}/api/stats`);
});

