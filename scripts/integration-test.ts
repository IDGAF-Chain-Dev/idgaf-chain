import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Integration Test - Full Bridge Flow
 * Tests the complete L1 <-> L2 bridge functionality
 */

interface DeploymentInfo {
  contracts: {
    idgafBridgeL1?: string;
    idgafChainBridge?: string;
    idgafTokenL2?: string;
  };
  l1Bridge?: string;
}

async function main() {
  console.log("🧪 Starting Integration Test\n");
  console.log("=" .repeat(50));

  // Load deployments
  const l1Deployment = loadDeployment("monad-l1.json");
  const l2Deployment = loadDeployment("hardhat-l2.json");

  if (!l1Deployment || !l2Deployment) {
    console.error("❌ Deployment files not found");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log("Test Account:", await signer.getAddress());
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(await signer.getAddress())), "ETH\n");

  // Connect to contracts
  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const l1Bridge = IDGAFBridge.attach(l1Deployment.contracts.idgafBridgeL1!);

  const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
  const l2Bridge = IDGAFChainBridge.attach(l2Deployment.contracts.idgafChainBridge!);

  const IDGAFTokenL2 = await ethers.getContractFactory("IDGAFTokenL2");
  const l2Token = IDGAFTokenL2.attach(l2Deployment.contracts.idgafTokenL2!);

  console.log("📋 Contract Addresses:");
  console.log("  L1 Bridge:", l1Deployment.contracts.idgafBridgeL1);
  console.log("  L2 Bridge:", l2Deployment.contracts.idgafChainBridge);
  console.log("  L2 Token:", l2Deployment.contracts.idgafTokenL2);
  console.log("");

  // Test 1: Check contract connections
  console.log("Test 1: Contract Connections");
  try {
    const l1BridgeBalance = await l1Bridge.getBridgeBalance();
    console.log("  ✅ L1 Bridge accessible");
    console.log("  L1 Bridge Balance:", ethers.formatEther(l1BridgeBalance), "IDGAF");

    const l2TokenSupply = await l2Token.totalSupply();
    console.log("  ✅ L2 Token accessible");
    console.log("  L2 Token Supply:", ethers.formatEther(l2TokenSupply), "IDGAF");

    const l2BridgeOwner = await l2Bridge.owner();
    console.log("  ✅ L2 Bridge accessible");
    console.log("  L2 Bridge Owner:", l2BridgeOwner);
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("Test 2: L1 → L2 Deposit Flow\n");

  // Test 2: Simulate L1 deposit
  const testAmount = ethers.parseEther("100");
  const depositId = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256", "uint256"],
      [await signer.getAddress(), testAmount, Date.now()]
    )
  );

  console.log("Step 1: Processing deposit on L2...");
  try {
    const tx = await l2Bridge.connect(signer).processDeposit(
      await signer.getAddress(),
      testAmount,
      depositId
    );
    await tx.wait();
    console.log("  ✅ Deposit processed");
    console.log("  Transaction:", tx.hash);

    const l2Balance = await l2Token.balanceOf(await signer.getAddress());
    console.log("  L2 Balance:", ethers.formatEther(l2Balance), "IDGAF");
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("Test 3: L2 → L1 Withdrawal Flow\n");

  // Test 3: Simulate L2 withdrawal
  const withdrawAmount = ethers.parseEther("50");
  console.log("Step 1: Initiating withdrawal on L2...");
  try {
    const tx = await l2Bridge.connect(signer).initiateWithdrawal(withdrawAmount);
    const receipt = await tx.wait();
    console.log("  ✅ Withdrawal initiated");
    console.log("  Transaction:", tx.hash);

    // Find withdrawal event
    const withdrawalEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = l2Bridge.interface.parseLog(log);
        return parsed?.name === "WithdrawalInitiated";
      } catch {
        return false;
      }
    });

    if (withdrawalEvent) {
      const parsed = l2Bridge.interface.parseLog(withdrawalEvent);
      const withdrawalId = parsed?.args[2];
      console.log("  Withdrawal ID:", withdrawalId);
    }

    const newL2Balance = await l2Token.balanceOf(await signer.getAddress());
    console.log("  New L2 Balance:", ethers.formatEther(newL2Balance), "IDGAF");
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("Test 4: Bridge Configuration\n");

  // Test 4: Check bridge configuration
  try {
    const l2MonadBridge = await l2Bridge.monadBridge();
    console.log("  L2 → L1 Bridge Connection:");
    console.log("    Expected:", l1Deployment.contracts.idgafBridgeL1);
    console.log("    Actual:", l2MonadBridge);
    console.log("    Status:", 
      l2MonadBridge.toLowerCase() === l1Deployment.contracts.idgafBridgeL1!.toLowerCase() 
        ? "✅ Connected" 
        : "❌ Mismatch"
    );

    const l2TokenBridge = await l2Token.bridge();
    console.log("\n  L2 Token → Bridge Connection:");
    console.log("    Expected:", l2Deployment.contracts.idgafChainBridge);
    console.log("    Actual:", l2TokenBridge);
    console.log("    Status:", 
      l2TokenBridge.toLowerCase() === l2Deployment.contracts.idgafChainBridge!.toLowerCase() 
        ? "✅ Connected" 
        : "❌ Mismatch"
    );
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Integration Test Complete!\n");
}

function loadDeployment(filename: string): DeploymentInfo | null {
  const filePath = path.join(__dirname, "../deployments", filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

