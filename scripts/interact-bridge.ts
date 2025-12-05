import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * @dev Example script for interacting with the bridge
 * This demonstrates how to deposit and withdraw tokens
 */

async function main() {
  const networkName = process.env.NETWORK || "hardhat";
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("Deployment file not found. Please deploy contracts first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const [user] = await ethers.getSigners();

  console.log("Using account:", user.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(user.address)), "ETH\n");

  // Connect to contracts
  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const l1Bridge = IDGAFBridge.attach(deployment.contracts.idgafBridgeL1);

  const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
  const l2Bridge = IDGAFChainBridge.attach(deployment.contracts.idgafChainBridge);

  const IDGAFTokenL2 = await ethers.getContractFactory("IDGAFTokenL2");
  const l2Token = IDGAFTokenL2.attach(deployment.contracts.idgafTokenL2);

  // Example: Check bridge balances
  console.log("=== Bridge Status ===");
  const l1BridgeBalance = await l1Bridge.getBridgeBalance();
  console.log("L1 Bridge Balance:", ethers.formatEther(l1BridgeBalance), "IDGAF");

  const l2TokenSupply = await l2Token.totalSupply();
  console.log("L2 Token Total Supply:", ethers.formatEther(l2TokenSupply), "IDGAF");

  // Example: Deposit (L1 → L2)
  console.log("\n=== Example: Deposit from L1 to L2 ===");
  console.log("To deposit tokens:");
  console.log("1. Approve IDGAF token to L1 bridge");
  console.log("2. Call l1Bridge.deposit(amount)");
  console.log("3. Wait for relayer to process on L2");

  // Example: Withdraw (L2 → L1)
  console.log("\n=== Example: Withdraw from L2 to L1 ===");
  console.log("To withdraw tokens:");
  console.log("1. Call l2Bridge.initiateWithdrawal(amount)");
  console.log("2. Wait for relayer to process on L1");

  // Check user balances
  console.log("\n=== User Balances ===");
  try {
    const l2Balance = await l2Token.balanceOf(user.address);
    console.log("L2 Token Balance:", ethers.formatEther(l2Balance), "IDGAF");
  } catch (error) {
    console.log("Could not fetch L2 balance (may not be on L2 network)");
  }

  console.log("\n=== Bridge Addresses ===");
  console.log("L1 Bridge:", deployment.contracts.idgafBridgeL1);
  console.log("L2 Bridge:", deployment.contracts.idgafChainBridge);
  console.log("L2 Token:", deployment.contracts.idgafTokenL2);
  console.log("L1 Token:", deployment.idgafTokenL1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

