// IDGAF Bridge - Simple Version (using ethers v5 from CDN)
const CONTRACTS = {
  l1: {
    bridge: '0x006a5044781F97475390F33E3E1c903e393fcc3d',
    token: '0x87deEb3696Ec069d5460C389cc78925df50d7777',
    chainId: 143,
    chainName: 'Monad',
    rpc: 'https://rpc1.monad.xyz'
  },
  l2: {
    bridge: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    token: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    chainId: 10144,
    chainName: 'IDGAF Chain',
    rpc: 'http://localhost:8546'
  }
};

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
  "function symbol() view returns (string)"
];

let currentDirection = 'l1-to-l2';
let provider = null;
let signer = null;
let userAddress = null;

// Wait for ethereum provider to be available
function waitForEthereum() {
  return new Promise((resolve, reject) => {
    // Check immediately - try multiple ways
    if (window.ethereum) {
      console.log('Ethereum provider found immediately');
      resolve(window.ethereum);
      return;
    }
    
    // Also check window.web3 for older versions
    if (window.web3 && window.web3.currentProvider) {
      console.log('Found web3 provider');
      resolve(window.web3.currentProvider);
      return;
    }

    // Check multiple times with increasing intervals
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds total (50 * 100ms)
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      // Check window.ethereum
      if (window.ethereum) {
        console.log('Ethereum provider found!', window.ethereum);
        clearInterval(checkInterval);
        resolve(window.ethereum);
        return;
      }
      
      // Check window.web3
      if (window.web3 && window.web3.currentProvider) {
        console.log('Web3 provider found!');
        clearInterval(checkInterval);
        resolve(window.web3.currentProvider);
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.error('Ethereum provider not found after', maxAttempts, 'attempts');
        console.error('window.ethereum:', window.ethereum);
        console.error('window.web3:', window.web3);
        clearInterval(checkInterval);
        reject(new Error('MetaMask not detected'));
      }
    }, 100);

    // Listen for ethereum injection event
    window.addEventListener('ethereum#initialized', () => {
      console.log('Ethereum initialized event received');
      clearInterval(checkInterval);
      if (window.ethereum) {
        resolve(window.ethereum);
      }
    }, { once: true });
    
    // Also listen for general message events (some wallets use this)
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'ETHEREUM_PROVIDER_SUCCESS') {
        console.log('Ethereum provider message received');
        clearInterval(checkInterval);
        if (window.ethereum) {
          resolve(window.ethereum);
        }
      }
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing app...');
  console.log('Initial window.ethereum:', window.ethereum);
  
  setupEventListeners();
  
  // Check if ethereum is available (don't fail if not available yet)
  try {
    const ethereum = await waitForEthereum();
    if (ethereum) {
      console.log('Ethereum provider available on load');
      await checkWalletConnection();
    } else {
      console.log('Ethereum provider not yet available, will retry on connect');
    }
  } catch (error) {
    console.log('Ethereum provider not yet available:', error.message);
    // Don't show error, user can still try to connect
  }
});

function setupEventListeners() {
  // Connect wallet
  document.getElementById('connectBtn').addEventListener('click', connectWallet);

  // Direction selector
  document.querySelectorAll('.direction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.direction-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDirection = btn.dataset.direction;
      updateInfoBox();
      updateBalance();
    });
  });

  // Bridge button
  document.getElementById('bridgeBtn').addEventListener('click', executeBridge);

  // Max button
  document.getElementById('maxBtn').addEventListener('click', setMaxAmount);
}

async function checkWalletConnection() {
  try {
    // Quick check first
    if (!window.ethereum) {
      const ethereum = await waitForEthereum();
      if (ethereum) {
        window.ethereum = ethereum;
      } else {
        return; // Not available yet
      }
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      await setupProvider();
      userAddress = accounts[0];
      updateWalletUI();
      await updateBalance();
    }
  } catch (error) {
    // Ethereum provider not available yet, will retry on connect
    console.log('Ethereum provider not available:', error);
  }
}

async function connectWallet() {
  console.log('Connect wallet button clicked');
  console.log('window.ethereum:', window.ethereum);
  console.log('typeof window.ethereum:', typeof window.ethereum);
  console.log('window.location.protocol:', window.location.protocol);
  
  // Check if running from file:// protocol
  if (window.location.protocol === 'file:') {
    showStatus('error', 'Please use a local web server. Run: python -m http.server 8000 or npx serve');
    console.error('Running from file:// protocol - MetaMask may not work properly');
    return;
  }
  
  // Check for ethereum provider - try multiple methods
  let ethereum = null;
  
  // Method 1: Direct check
  if (window.ethereum) {
    console.log('Found window.ethereum immediately');
    ethereum = window.ethereum;
  }
  // Method 2: Check web3
  else if (window.web3 && window.web3.currentProvider) {
    console.log('Found window.web3.currentProvider');
    ethereum = window.web3.currentProvider;
  }
  // Method 3: Wait for injection
  else {
    console.log('Waiting for ethereum provider...');
    try {
      ethereum = await waitForEthereum();
      console.log('Ethereum provider received:', ethereum);
    } catch (error) {
      console.error('Failed to get ethereum provider:', error);
      showStatus('error', 'MetaMask is not detected. Please make sure MetaMask is installed and enabled. <a href="https://metamask.io" target="_blank">Install MetaMask</a>');
      return;
    }
  }

  if (!ethereum) {
    console.error('Ethereum provider is null');
    showStatus('error', 'MetaMask is not detected. Please refresh the page and try again.');
    return;
  }

  // Check if it's MetaMask specifically
  let isMetaMask = ethereum.isMetaMask;
  console.log('isMetaMask (direct):', isMetaMask);
  
  // Handle multiple providers (EIP-6963)
  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    console.log('Multiple providers detected:', ethereum.providers.length);
    const metaMaskProvider = ethereum.providers.find(p => p.isMetaMask);
    if (metaMaskProvider) {
      console.log('Found MetaMask in providers array');
      ethereum = metaMaskProvider;
      isMetaMask = true;
    }
  }

  // If still not MetaMask, try to use it anyway (might be another compatible wallet)
  if (!isMetaMask) {
    console.warn('MetaMask not detected, but using available provider');
  }

  try {
    console.log('Requesting accounts from provider...');
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log('Accounts received:', accounts);
    
    // Update window.ethereum reference
    window.ethereum = ethereum;
    
    await setupProvider();
    userAddress = accounts[0];
    updateWalletUI();
    showStatus('success', 'Wallet connected successfully!');
    await updateBalance();
  } catch (error) {
    console.error('Error connecting wallet:', error);
    if (error.code === 4001) {
      showStatus('error', 'Please connect your wallet in MetaMask.');
    } else if (error.code === -32002) {
      showStatus('error', 'A connection request is already pending. Please check MetaMask.');
    } else {
      showStatus('error', 'Failed to connect wallet: ' + (error.message || error.toString()));
    }
  }
}

async function setupProvider() {
  if (!window.ethereum) {
    throw new Error('Ethereum provider not available');
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  const network = await provider.getNetwork();
}

function updateWalletUI() {
  if (userAddress) {
    const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    document.getElementById('walletAddress').textContent = shortAddress;
    document.getElementById('connectBtn').textContent = 'Connected';
    document.getElementById('connectBtn').disabled = true;
  }
}

async function updateBalance() {
  if (!userAddress || !currentDirection) return;

  try {
    const config = currentDirection === 'l1-to-l2' ? CONTRACTS.l1 : CONTRACTS.l2;
    await switchNetwork(config.chainId);

    const tokenContract = new ethers.Contract(config.token, ERC20_ABI, signer);
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();

    document.getElementById('tokenBalance').textContent = 
      `${ethers.utils.formatUnits(balance, decimals)} ${symbol}`;
  } catch (error) {
    console.error('Error updating balance:', error);
    document.getElementById('tokenBalance').textContent = 'Failed to load';
  }
}

async function switchNetwork(chainId) {
  const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (parseInt(currentChainId, 16) === chainId) return;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    await setupProvider();
  } catch (switchError) {
    if (switchError.code === 4902) {
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
      await setupProvider();
    } else {
      throw switchError;
    }
  }
}

function updateInfoBox() {
  const infoBox = document.getElementById('infoBox');
  if (currentDirection === 'l1-to-l2') {
    infoBox.innerHTML = '<strong>ℹ️ Info:</strong> Transfer IDGAF tokens from Monad to IDGAF Chain.';
  } else {
    infoBox.innerHTML = '<strong>ℹ️ Info:</strong> Transfer IDGAF tokens from IDGAF Chain to Monad.';
  }
}

async function setMaxAmount() {
  if (!userAddress) return;
  
  try {
    const config = currentDirection === 'l1-to-l2' ? CONTRACTS.l1 : CONTRACTS.l2;
    await switchNetwork(config.chainId);
    
    const tokenContract = new ethers.Contract(config.token, ERC20_ABI, signer);
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    
    document.getElementById('amount').value = ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    showStatus('error', 'Failed to load balance: ' + error.message);
  }
}

async function executeBridge() {
  if (!userAddress) {
    showStatus('error', 'Please connect your wallet first.');
    return;
  }

  const amount = document.getElementById('amount').value;
  if (!amount || parseFloat(amount) <= 0) {
    showStatus('error', 'Please enter a valid amount.');
    return;
  }

  try {
    const config = currentDirection === 'l1-to-l2' ? CONTRACTS.l1 : CONTRACTS.l2;
    await switchNetwork(config.chainId);

    showStatus('info', 'Preparing transaction...');

    if (currentDirection === 'l1-to-l2') {
      await depositToL1(amount, config);
    } else {
      await withdrawFromL2(amount, config);
    }
  } catch (error) {
    showStatus('error', 'Error: ' + error.message);
    console.error('Bridge error:', error);
  }
}

async function depositToL1(amount, config) {
  try {
    const tokenContract = new ethers.Contract(config.token, ERC20_ABI, signer);
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount, decimals);
    const balance = await tokenContract.balanceOf(userAddress);

    if (balance.lt(amountWei)) {
      showStatus('error', 'Insufficient balance.');
      return;
    }

    const bridgeContract = new ethers.Contract(config.bridge, BRIDGE_ABI, signer);
    const allowance = await tokenContract.allowance(userAddress, config.bridge);

    if (allowance.lt(amountWei)) {
      showStatus('info', 'Token approval required. Please confirm the approval transaction...');
      const approveTx = await tokenContract.approve(config.bridge, amountWei);
      await approveTx.wait();
      showStatus('info', 'Approval completed. Depositing...');
    }

    showStatus('info', 'Sending deposit transaction...');
    const tx = await bridgeContract.deposit(amountWei);
    showStatus('info', `Transaction: ${tx.hash}. Confirming...`);

    const receipt = await tx.wait();
    showStatus('success', `✅ ${amount} IDGAF tokens deposited to bridge! Please wait for the relayer to process.`);

    await updateBalance();
    document.getElementById('amount').value = '';
  } catch (error) {
    if (error.message.includes('user rejected') || error.code === 4001) {
      showStatus('error', 'Transaction cancelled.');
    } else {
      throw error;
    }
  }
}

async function withdrawFromL2(amount, config) {
  try {
    const tokenContract = new ethers.Contract(config.token, ERC20_ABI, signer);
    const decimals = await tokenContract.decimals();
    const amountWei = ethers.utils.parseUnits(amount, decimals);
    const balance = await tokenContract.balanceOf(userAddress);

    if (balance.lt(amountWei)) {
      showStatus('error', 'Insufficient balance.');
      return;
    }

    showStatus('info', 'Sending withdrawal transaction...');
    const bridgeContract = new ethers.Contract(config.bridge, BRIDGE_ABI, signer);
    const tx = await bridgeContract.initiateWithdrawal(amountWei);
    showStatus('info', `Transaction: ${tx.hash}. Confirming...`);

    const receipt = await tx.wait();
    showStatus('success', `✅ ${amount} IDGAF token withdrawal requested! Please wait for the relayer to process.`);

    await updateBalance();
    document.getElementById('amount').value = '';
  } catch (error) {
    if (error.message.includes('user rejected') || error.code === 4001) {
      showStatus('error', 'Transaction cancelled.');
    } else {
      throw error;
    }
  }
}

function showStatus(type, message) {
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

