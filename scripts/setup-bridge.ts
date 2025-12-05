import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const networkName = process.env.NETWORK || "hardhat";
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("Deployment file not found:", deploymentFile);
    console.error("Please run deploy.ts first");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const [deployer] = await ethers.getSigners();

  console.log("Setting up bridge connections...");
  console.log("Using deployer:", deployer.address);

  // Connect to L2 bridge
  const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
  const l2Bridge = IDGAFChainBridge.attach(deployment.contracts.idgafChainBridge);

  // Connect to L1 bridge
  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const l1Bridge = IDGAFBridge.attach(deployment.contracts.idgafBridgeL1);

  // Verify connections
  console.log("\nVerifying bridge setup...");
  const l2MonadBridge = await l2Bridge.monadBridge();
  const l1BridgeAddress = deployment.contracts.idgafBridgeL1;

  if (l2MonadBridge.toLowerCase() === l1BridgeAddress.toLowerCase()) {
    console.log("✓ Bridge connections verified");
  } else {
    console.log("⚠ Bridge addresses don't match");
    console.log("  L2 expects:", l2MonadBridge);
    console.log("  L1 address:", l1BridgeAddress);
  }

  // Check token bridge connection
  const IDGAFTokenL2 = await ethers.getContractFactory("IDGAFTokenL2");
  const l2Token = IDGAFTokenL2.attach(deployment.contracts.idgafTokenL2);
  const tokenBridge = await l2Token.bridge();

  if (tokenBridge.toLowerCase() === deployment.contracts.idgafChainBridge.toLowerCase()) {
    console.log("✓ Token bridge connection verified");
  } else {
    console.log("⚠ Token bridge addresses don't match");
  }

  console.log("\n=== Bridge Setup Complete ===");
  console.log("L1 Bridge:", deployment.contracts.idgafBridgeL1);
  console.log("L2 Bridge:", deployment.contracts.idgafChainBridge);
  console.log("L2 Token:", deployment.contracts.idgafTokenL2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

