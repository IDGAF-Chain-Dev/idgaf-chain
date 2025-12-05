import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * @dev Example relayer script for processing deposits and withdrawals
 * This is a simplified example - production relayers should include:
 * - Event listening from L1
 * - Signature verification
 * - Rate limiting
 * - Error handling and retries
 */

async function processDeposits() {
  const networkName = process.env.NETWORK || "hardhat";
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("Deployment file not found");
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const [relayer] = await ethers.getSigners();

  console.log("Relayer address:", relayer.address);

  // Connect to L1 bridge
  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const l1Bridge = IDGAFBridge.attach(deployment.contracts.idgafBridgeL1);

  // Connect to L2 bridge
  const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
  const l2Bridge = IDGAFChainBridge.attach(deployment.contracts.idgafChainBridge);

  // Listen for Deposit events on L1
  console.log("Listening for Deposit events on L1...");
  
  // In production, you would use event filters:
  // const filter = l1Bridge.filters.Deposit();
  // l1Bridge.on(filter, async (user, amount, depositId, timestamp, event) => {
  //   console.log("New deposit detected:", { user, amount, depositId });
  //   await processDeposit(user, amount, depositId);
  // });

  console.log("\nExample: Processing a deposit");
  console.log("In production, this would be triggered by L1 events");
}

async function processDeposit(user: string, amount: bigint, depositId: string) {
  const networkName = process.env.NETWORK || "hardhat";
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));

  const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
  const l2Bridge = IDGAFChainBridge.attach(deployment.contracts.idgafChainBridge);
  const [relayer] = await ethers.getSigners();

  try {
    const tx = await l2Bridge.connect(relayer).processDeposit(user, amount, depositId);
    await tx.wait();
    console.log("✓ Deposit processed:", depositId);
  } catch (error) {
    console.error("✗ Failed to process deposit:", error);
  }
}

async function processWithdrawals() {
  const networkName = process.env.NETWORK || "hardhat";
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("Deployment file not found");
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const [relayer] = await ethers.getSigners();

  // Connect to L2 bridge
  const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
  const l2Bridge = IDGAFChainBridge.attach(deployment.contracts.idgafChainBridge);

  // Connect to L1 bridge
  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const l1Bridge = IDGAFBridge.attach(deployment.contracts.idgafBridgeL1);

  console.log("Listening for WithdrawalInitiated events on L2...");
  
  // In production, you would use event filters:
  // const filter = l2Bridge.filters.WithdrawalInitiated();
  // l2Bridge.on(filter, async (user, amount, withdrawalId, timestamp, event) => {
  //   console.log("New withdrawal detected:", { user, amount, withdrawalId });
  //   await processWithdrawal(user, amount, withdrawalId);
  // });

  console.log("\nExample: Processing a withdrawal");
  console.log("In production, this would be triggered by L2 events");
}

async function processWithdrawal(user: string, amount: bigint, withdrawalId: string) {
  const networkName = process.env.NETWORK || "hardhat";
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));

  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const l1Bridge = IDGAFBridge.attach(deployment.contracts.idgafBridgeL1);
  const [relayer] = await ethers.getSigners();

  // Check if relayer is an operator
  const isOperator = await l1Bridge.bridgeOperators(relayer.address);
  if (!isOperator) {
    console.error("Relayer is not a bridge operator");
    return;
  }

  try {
    const tx = await l1Bridge.connect(relayer).withdraw(user, amount, withdrawalId);
    await tx.wait();
    console.log("✓ Withdrawal processed:", withdrawalId);
  } catch (error) {
    console.error("✗ Failed to process withdrawal:", error);
  }
}

// Main function
async function main() {
  console.log("=== IDGAF Bridge Relayer Example ===\n");
  await processDeposits();
  await processWithdrawals();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

