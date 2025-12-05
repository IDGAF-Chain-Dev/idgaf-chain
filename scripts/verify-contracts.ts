import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const networkName = process.env.NETWORK || "hardhat";
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("Deployment file not found:", deploymentFile);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));

  console.log("Verifying contract configurations...\n");

  // Verify L2 Token
  const IDGAFTokenL2 = await ethers.getContractFactory("IDGAFTokenL2");
  const l2Token = IDGAFTokenL2.attach(deployment.contracts.idgafTokenL2);
  
  const tokenBridge = await l2Token.bridge();
  console.log("✓ IDGAFTokenL2");
  console.log("  Address:", deployment.contracts.idgafTokenL2);
  console.log("  Bridge:", tokenBridge);
  console.log("  Expected Bridge:", deployment.contracts.idgafChainBridge);
  console.log("  Match:", tokenBridge.toLowerCase() === deployment.contracts.idgafChainBridge.toLowerCase() ? "✓" : "✗");

  // Verify L2 Bridge
  const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
  const l2Bridge = IDGAFChainBridge.attach(deployment.contracts.idgafChainBridge);
  
  const monadBridge = await l2Bridge.monadBridge();
  console.log("\n✓ IDGAFChainBridge");
  console.log("  Address:", deployment.contracts.idgafChainBridge);
  console.log("  Monad Bridge:", monadBridge);
  console.log("  Expected Monad Bridge:", deployment.contracts.idgafBridgeL1);
  console.log("  Match:", monadBridge.toLowerCase() === deployment.contracts.idgafBridgeL1.toLowerCase() ? "✓" : "✗");

  // Verify L1 Bridge
  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const l1Bridge = IDGAFBridge.attach(deployment.contracts.idgafBridgeL1);
  
  const idgafTokenL1 = await l1Bridge.IDGAF_TOKEN();
  console.log("\n✓ IDGAFBridge (L1)");
  console.log("  Address:", deployment.contracts.idgafBridgeL1);
  console.log("  IDGAF Token:", idgafTokenL1);
  console.log("  Expected Token:", deployment.idgafTokenL1);
  console.log("  Match:", idgafTokenL1.toLowerCase() === deployment.idgafTokenL1.toLowerCase() ? "✓" : "✗");

  console.log("\n=== Verification Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

