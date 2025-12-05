// IDGAF Bridge Frontend - Main Application
import { ethers } from 'ethers';

// Contract addresses from deployments
const CONTRACTS = {
  l1: {
    bridge: '0x006a5044781F97475390F33E3E1c903e393fcc3d',
    token: '0x87deEb3696Ec069d5460C389cc78925df50d7777',
    rpc: 'https://rpc1.monad.xyz',
    chainId: 143,
    chainName: 'Monad'
  },
  l2: {
    bridge: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    token: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    rpc: 'http://localhost:8546',
    chainId: 10144,
    chainName: 'IDGAF Chain'
  }
};

// Contract ABIs (simplified)
const BRIDGE_ABI = [
  "function deposit(uint256 amount)",
  "function initiateWithdrawal(uint256 amount)",
  "event Deposit(address indexed user, uint256 amount, bytes32 indexed depositId, uint256 timestamp)",
  "event WithdrawalInitiated(address indexed user, uint256 amount, bytes32 indexed withdrawalId, uint256 timestamp)"
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

class BridgeApp {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.userAddress = null;
    this.currentNetwork = null;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.waitForEthereum();
    await this.checkWalletConnection();
  }

  waitForEthereum() {
    return new Promise((resolve, reject) => {
      if (window.ethereum) {
        resolve(window.ethereum);
      } else {
        // Listen for ethereum injection
        window.addEventListener('ethereum#initialized', () => {
          resolve(window.ethereum);
        }, { once: true });
        
        // Timeout after 3 seconds
        setTimeout(() => {
          if (window.ethereum) {
            resolve(window.ethereum);
          } else {
            // Don't reject, just resolve with null
            resolve(null);
          }
        }, 3000);
      }
    });
  }

  setupEventListeners() {
    // Connect wallet button
    document.getElementById('connectBtn').addEventListener('click', () => this.connectWallet());

    // Direction selector
    document.querySelectorAll('.direction-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.direction-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentDirection = btn.dataset.direction;
        this.updateInfoBox();
        this.updateBalance();
      });
    });

    // Bridge button
    document.getElementById('bridgeBtn').addEventListener('click', () => this.executeBridge());

    // Max button
    document.getElementById('maxBtn')?.addEventListener('click', () => this.setMaxAmount());
  }

  async checkWalletConnection() {
    try {
      const ethereum = await this.waitForEthereum();
      if (!ethereum) return;
      
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        window.ethereum = ethereum;
        await this.setupProvider();
        this.userAddress = accounts[0];
        this.updateWalletUI();
        await this.updateBalance();
      }
    } catch (error) {
      console.error('Error checking wallet:', error);
    }
  }

  async connectWallet() {
    // Check for ethereum provider
    let ethereum = await this.waitForEthereum();
    
    if (!ethereum) {
      this.showStatus('error', 'MetaMask is not installed. Please install MetaMask from https://metamask.io');
      return;
    }

    // Check if it's MetaMask specifically
    const isMetaMask = ethereum.isMetaMask || (ethereum.providers && ethereum.providers.find(p => p.isMetaMask));
    
    if (!isMetaMask && !ethereum.isMetaMask) {
      // If multiple providers, try to find MetaMask
      if (ethereum.providers) {
        const metaMaskProvider = ethereum.providers.find(p => p.isMetaMask);
        if (metaMaskProvider) {
          ethereum = metaMaskProvider;
        }
      }
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      // Update window.ethereum reference
      window.ethereum = ethereum;
      
      await this.setupProvider();
      this.userAddress = accounts[0];
      this.updateWalletUI();
      this.showStatus('success', 'Wallet connected successfully!');
      await this.updateBalance();
    } catch (error) {
      if (error.code === 4001) {
        this.showStatus('error', 'Please connect your wallet in MetaMask.');
      } else {
        this.showStatus('error', 'Failed to connect wallet: ' + error.message);
      }
    }
  }

  async setupProvider() {
    if (!window.ethereum) {
      throw new Error('Ethereum provider not available');
    }
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    const network = await this.provider.getNetwork();
    this.currentNetwork = Number(network.chainId);
  }

  updateWalletUI() {
    if (this.userAddress) {
      const shortAddress = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
      document.getElementById('walletAddress').textContent = shortAddress;
      document.getElementById('connectBtn').textContent = 'Connected';
      document.getElementById('connectBtn').disabled = true;
    }
  }

  async updateBalance() {
    if (!this.userAddress || !this.currentDirection) return;

    try {
      const config = this.currentDirection === 'l1-to-l2' ? CONTRACTS.l1 : CONTRACTS.l2;
      
      // Switch network if needed
      await this.switchNetwork(config.chainId);

      const tokenContract = new ethers.Contract(config.token, ERC20_ABI, this.signer);
      const balance = await tokenContract.balanceOf(this.userAddress);
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();

      const balanceElement = document.getElementById('tokenBalance');
      if (balanceElement) {
        balanceElement.textContent = `${ethers.formatUnits(balance, decimals)} ${symbol}`;
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  }

  async switchNetwork(chainId) {
    if (this.currentNetwork === chainId) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      await this.setupProvider();
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Chain doesn't exist, add it
        const config = chainId === CONTRACTS.l1.chainId ? CONTRACTS.l1 : CONTRACTS.l2;
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${chainId.toString(16)}`,
            chainName: config.chainName,
            nativeCurrency: {
              name: 'IDGAF',
              symbol: 'IDGAF',
              decimals: 18
            },
            rpcUrls: [config.rpc]
          }],
        });
        await this.setupProvider();
      } else {
        throw switchError;
      }
    }
  }

  updateInfoBox() {
    const infoBox = document.getElementById('infoBox');
    if (this.currentDirection === 'l1-to-l2') {
      infoBox.innerHTML = '<strong>ℹ️ Info:</strong> Transfer IDGAF tokens from Monad to IDGAF Chain.';
    } else {
      infoBox.innerHTML = '<strong>ℹ️ Info:</strong> Transfer IDGAF tokens from IDGAF Chain to Monad.';
    }
  }

  async setMaxAmount() {
    if (!this.userAddress) return;
    
    try {
      const config = this.currentDirection === 'l1-to-l2' ? CONTRACTS.l1 : CONTRACTS.l2;
      await this.switchNetwork(config.chainId);
      
      const tokenContract = new ethers.Contract(config.token, ERC20_ABI, this.signer);
      const balance = await tokenContract.balanceOf(this.userAddress);
      const decimals = await tokenContract.decimals();
      
      document.getElementById('amount').value = ethers.formatUnits(balance, decimals);
    } catch (error) {
      this.showStatus('error', 'Failed to load balance: ' + error.message);
    }
  }

  async executeBridge() {
    if (!this.userAddress) {
      this.showStatus('error', 'Please connect your wallet first.');
      return;
    }

    const amount = document.getElementById('amount').value;
    if (!amount || parseFloat(amount) <= 0) {
      this.showStatus('error', 'Please enter a valid amount.');
      return;
    }

    try {
      const config = this.currentDirection === 'l1-to-l2' ? CONTRACTS.l1 : CONTRACTS.l2;
      await this.switchNetwork(config.chainId);

      this.showStatus('info', 'Preparing transaction...');

      if (this.currentDirection === 'l1-to-l2') {
        await this.depositToL1(amount, config);
      } else {
        await this.withdrawFromL2(amount, config);
      }
    } catch (error) {
      this.showStatus('error', 'Error: ' + error.message);
      console.error('Bridge error:', error);
    }
  }

  async depositToL1(amount, config) {
    try {
      // Check token balance
      const tokenContract = new ethers.Contract(config.token, ERC20_ABI, this.signer);
      const decimals = await tokenContract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);
      const balance = await tokenContract.balanceOf(this.userAddress);

      if (balance < amountWei) {
        this.showStatus('error', 'Insufficient balance.');
        return;
      }

      // Check allowance
      const bridgeContract = new ethers.Contract(config.bridge, BRIDGE_ABI, this.signer);
      const allowance = await tokenContract.allowance(this.userAddress, config.bridge);

      if (allowance < amountWei) {
        this.showStatus('info', 'Token approval required. Please confirm the approval transaction...');
        const approveTx = await tokenContract.approve(config.bridge, amountWei);
        await approveTx.wait();
        this.showStatus('info', 'Approval completed. Depositing...');
      }

      // Execute deposit
      this.showStatus('info', 'Sending deposit transaction...');
      const tx = await bridgeContract.deposit(amountWei);
      this.showStatus('info', `Transaction: ${tx.hash}. Confirming...`);

      const receipt = await tx.wait();
      this.showStatus('success', `✅ ${amount} IDGAF tokens deposited to bridge! Please wait for the relayer to process.`);

      // Update balance
      await this.updateBalance();
      document.getElementById('amount').value = '';
    } catch (error) {
      if (error.message.includes('user rejected')) {
        this.showStatus('error', 'Transaction cancelled.');
      } else {
        throw error;
      }
    }
  }

  async withdrawFromL2(amount, config) {
    try {
      // Check token balance
      const tokenContract = new ethers.Contract(config.token, ERC20_ABI, this.signer);
      const decimals = await tokenContract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);
      const balance = await tokenContract.balanceOf(this.userAddress);

      if (balance < amountWei) {
        this.showStatus('error', 'Insufficient balance.');
        return;
      }

      // Execute withdrawal
      this.showStatus('info', 'Sending withdrawal transaction...');
      const bridgeContract = new ethers.Contract(config.bridge, BRIDGE_ABI, this.signer);
      const tx = await bridgeContract.initiateWithdrawal(amountWei);
      this.showStatus('info', `Transaction: ${tx.hash}. Confirming...`);

      const receipt = await tx.wait();
      this.showStatus('success', `✅ ${amount} IDGAF token withdrawal requested! Please wait for the relayer to process.`);

      // Update balance
      await this.updateBalance();
      document.getElementById('amount').value = '';
    } catch (error) {
      if (error.message.includes('user rejected')) {
        this.showStatus('error', 'Transaction cancelled.');
      } else {
        throw error;
      }
    }
  }

  showStatus(type, message) {
    const status = document.getElementById('status');
    status.className = `status ${type}`;
    status.textContent = message;
    status.style.display = 'block';

    if (type !== 'info') {
      setTimeout(() => {
        status.style.display = 'none';
      }, 10000);
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    window.bridgeApp = new BridgeApp();
    await window.bridgeApp.init();
  });
} else {
  window.bridgeApp = new BridgeApp();
  window.bridgeApp.init();
}

