import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { TransactionDatabase, DepositRecord, WithdrawalRecord } from "./database";

dotenv.config();

/**
 * IDGAF Bridge Relayer
 * L1과 L2 간 이벤트를 모니터링하고 자동으로 입출금을 처리합니다.
 */

interface DeploymentInfo {
  contracts: {
    idgafBridgeL1?: string;
    idgafChainBridge?: string;
    idgafTokenL2?: string;
  };
  l1Bridge?: string;
}

class BridgeRelayer {
  private l1Provider: ethers.JsonRpcProvider;
  private l2Provider: ethers.JsonRpcProvider;
  private l1Signer: ethers.Wallet;
  private l2Signer: ethers.Wallet;
  private l1Bridge: ethers.Contract;
  private l2Bridge: ethers.Contract;
  private isRunning: boolean = false;

  constructor() {
    // L1 Provider (Monad)
    const l1RpcUrl = process.env.MONAD_RPC_URL || "https://rpc1.monad.xyz";
    this.l1Provider = new ethers.JsonRpcProvider(l1RpcUrl);

    // L2 Provider (IDGAF Chain)
    const l2RpcUrl = process.env.IDGAF_RPC_URL || "http://localhost:8546";
    this.l2Provider = new ethers.JsonRpcProvider(l2RpcUrl);

    // Signers
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY environment variable is required");
    }
    this.l1Signer = new ethers.Wallet(privateKey, this.l1Provider);
    this.l2Signer = new ethers.Wallet(privateKey, this.l2Provider);

    // Load deployment addresses
    const deployments = this.loadDeployments();
    
    if (!deployments.contracts.idgafBridgeL1) {
      throw new Error("L1 bridge address not found in deployments");
    }
    if (!deployments.contracts.idgafChainBridge) {
      throw new Error("L2 bridge address not found in deployments");
    }

    // Initialize contracts
    const l1BridgeAbi = [
      "event Deposit(address indexed user, uint256 amount, bytes32 indexed depositId, uint256 timestamp)",
      "function withdraw(address user, uint256 amount, bytes32 withdrawalId)",
      "function bridgeOperators(address) view returns (bool)"
    ];

    const l2BridgeAbi = [
      "event WithdrawalInitiated(address indexed user, uint256 amount, bytes32 indexed withdrawalId, uint256 timestamp)",
      "function processDeposit(address user, uint256 amount, bytes32 depositId)",
      "function owner() view returns (address)"
    ];

    this.l1Bridge = new ethers.Contract(
      deployments.contracts.idgafBridgeL1!,
      l1BridgeAbi,
      this.l1Signer
    );

    this.l2Bridge = new ethers.Contract(
      deployments.contracts.idgafChainBridge!,
      l2BridgeAbi,
      this.l2Signer
    );

    // Initialize database
    this.database = new TransactionDatabase();
  }

  private loadDeployments(): DeploymentInfo {
    const l1File = path.join(__dirname, "../deployments/monad-l1.json");
    const l2File = path.join(__dirname, "../deployments/hardhat-l2.json");

    const l1Deployment = fs.existsSync(l1File)
      ? JSON.parse(fs.readFileSync(l1File, "utf-8"))
      : {};
    const l2Deployment = fs.existsSync(l2File)
      ? JSON.parse(fs.readFileSync(l2File, "utf-8"))
      : {};

    return {
      contracts: {
        idgafBridgeL1: l1Deployment.contracts?.idgafBridgeL1,
        idgafChainBridge: l2Deployment.contracts?.idgafChainBridge,
        idgafTokenL2: l2Deployment.contracts?.idgafTokenL2,
      },
      l1Bridge: l2Deployment.l1Bridge,
    };
  }

  async start() {
    console.log("🚀 Starting IDGAF Bridge Relayer...");
    console.log("L1 Bridge:", await this.l1Bridge.getAddress());
    console.log("L2 Bridge:", await this.l2Bridge.getAddress());
    console.log("L1 Signer:", await this.l1Signer.getAddress());
    console.log("L2 Signer:", await this.l2Signer.getAddress());
    console.log("\n");

    // Check permissions
    await this.checkPermissions();

    this.isRunning = true;

    // Start monitoring
    this.monitorL1Deposits();
    this.monitorL2Withdrawals();

    console.log("✅ Relayer is running. Monitoring events...\n");

    // Print stats periodically
    setInterval(async () => {
      const stats = await this.database.getStats();
      console.log("\n📊 Bridge Statistics:");
      console.log("  Total Deposits:", stats.totalDeposits);
      console.log("  Total Withdrawals:", stats.totalWithdrawals);
      console.log("  Pending Deposits:", stats.pendingDeposits);
      console.log("  Pending Withdrawals:", stats.pendingWithdrawals);
      console.log("  Total Volume:", ethers.formatEther(stats.totalVolume), "IDGAF\n");
    }, 60000); // Every minute
  }

  private async checkPermissions() {
    // Check L1 operator status
    const isL1Operator = await this.l1Bridge.bridgeOperators(
      await this.l1Signer.getAddress()
    );
    if (!isL1Operator) {
      console.log("⚠️  Warning: L1 signer is not a bridge operator");
      console.log("   Run: l1Bridge.setBridgeOperator(signerAddress, true)");
    }

    // Check L2 owner status
    const l2Owner = await this.l2Bridge.owner();
    const l2SignerAddress = await this.l2Signer.getAddress();
    if (l2Owner.toLowerCase() !== l2SignerAddress.toLowerCase()) {
      console.log("⚠️  Warning: L2 signer is not the bridge owner");
    }
  }

  private monitorL1Deposits() {
    console.log("📡 Monitoring L1 Deposit events...");

    this.l1Bridge.on(
      "Deposit",
      async (user: string, amount: bigint, depositId: string, timestamp: bigint, event: any) => {
        console.log("\n🔔 New L1 Deposit detected:");
        console.log("  User:", user);
        console.log("  Amount:", ethers.formatEther(amount), "IDGAF");
        console.log("  Deposit ID:", depositId);
        console.log("  Timestamp:", new Date(Number(timestamp) * 1000).toISOString());
        console.log("  L1 TX Hash:", event.transactionHash);

        try {
          await this.processL1Deposit(user, amount, depositId, event.transactionHash);
        } catch (error: any) {
          console.error("❌ Error processing L1 deposit:", error.message);
        }
      }
    );
  }

  private monitorL2Withdrawals() {
    console.log("📡 Monitoring L2 Withdrawal events...");

    this.l2Bridge.on(
      "WithdrawalInitiated",
      async (user: string, amount: bigint, withdrawalId: string, timestamp: bigint, event: any) => {
        console.log("\n🔔 New L2 Withdrawal detected:");
        console.log("  User:", user);
        console.log("  Amount:", ethers.formatEther(amount), "IDGAF");
        console.log("  Withdrawal ID:", withdrawalId);
        console.log("  Timestamp:", new Date(Number(timestamp) * 1000).toISOString());
        console.log("  L2 TX Hash:", event.transactionHash);

        try {
          await this.processL2Withdrawal(user, amount, withdrawalId, event.transactionHash);
        } catch (error: any) {
          console.error("❌ Error processing L2 withdrawal:", error.message);
        }
      }
    );
  }

  private async processL1Deposit(user: string, amount: bigint, depositId: string, l1TxHash?: string) {
    console.log("🔄 Processing L1 deposit on L2...");

    // Save to database
    const depositRecord: DepositRecord = {
      depositId,
      userAddress: user,
      amount: amount.toString(),
      l1TxHash,
      status: 'pending',
      createdAt: new Date(),
    };
    await this.database.saveDeposit(depositRecord);

    try {
      const tx = await this.l2Bridge.processDeposit(user, amount, depositId);
      console.log("  Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("  ✅ Deposit processed successfully!");
      console.log("  Block:", receipt.blockNumber);
      
      // Update database
      await this.database.updateDepositStatus(depositId, 'processed', tx.hash);
    } catch (error: any) {
      if (error.message.includes("already processed")) {
        console.log("  ⚠️  Deposit already processed, skipping...");
        await this.database.updateDepositStatus(depositId, 'processed');
      } else {
        await this.database.updateDepositStatus(depositId, 'failed');
        throw error;
      }
    }
  }

  private async processL2Withdrawal(user: string, amount: bigint, withdrawalId: string, l2TxHash?: string) {
    console.log("🔄 Processing L2 withdrawal on L1...");

    // Save to database
    const withdrawalRecord: WithdrawalRecord = {
      withdrawalId,
      userAddress: user,
      amount: amount.toString(),
      l2TxHash,
      status: 'pending',
      createdAt: new Date(),
    };
    await this.database.saveWithdrawal(withdrawalRecord);

    try {
      const tx = await this.l1Bridge.withdraw(user, amount, withdrawalId);
      console.log("  Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("  ✅ Withdrawal processed successfully!");
      console.log("  Block:", receipt.blockNumber);
      
      // Update database
      await this.database.updateWithdrawalStatus(withdrawalId, 'processed', tx.hash);
    } catch (error: any) {
      if (error.message.includes("already processed")) {
        console.log("  ⚠️  Withdrawal already processed, skipping...");
        await this.database.updateWithdrawalStatus(withdrawalId, 'processed');
      } else if (error.message.includes("not an operator")) {
        console.log("  ❌ Error: Signer is not a bridge operator");
        await this.database.updateWithdrawalStatus(withdrawalId, 'failed');
      } else {
        await this.database.updateWithdrawalStatus(withdrawalId, 'failed');
        throw error;
      }
    }
  }

  stop() {
    this.isRunning = false;
    this.l1Bridge.removeAllListeners();
    this.l2Bridge.removeAllListeners();
    console.log("🛑 Relayer stopped");
  }
}

// Main execution
async function main() {
  const relayer = new BridgeRelayer();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down relayer...");
    relayer.stop();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Shutting down relayer...");
    relayer.stop();
    process.exit(0);
  });

  await relayer.start();

  // Keep process alive
  setInterval(() => {
    // Heartbeat
  }, 60000);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { BridgeRelayer };

