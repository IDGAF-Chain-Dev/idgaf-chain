import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Check Bridge Status
 * Displays current status of all bridge components
 */

async function main() {
  console.log("🔍 Checking Bridge Status\n");
  console.log("=".repeat(60));

  // Load deployments
  const l1File = path.join(__dirname, "../deployments/monad-l1.json");
  const l2File = path.join(__dirname, "../deployments/hardhat-l2.json");

  if (!fs.existsSync(l1File) || !fs.existsSync(l2File)) {
    console.error("❌ Deployment files not found");
    process.exit(1);
  }

  const l1Deployment = JSON.parse(fs.readFileSync(l1File, "utf-8"));
  const l2Deployment = JSON.parse(fs.readFileSync(l2File, "utf-8"));

  const [signer] = await ethers.getSigners();

  console.log("\n📊 L1 Bridge Status (Monad)");
  console.log("-".repeat(60));
  try {
    const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
    const l1Bridge = IDGAFBridge.attach(l1Deployment.contracts.idgafBridgeL1);

    const bridgeBalance = await l1Bridge.getBridgeBalance();
    const isOperator = await l1Bridge.bridgeOperators(await signer.getAddress());

    console.log("  Address:", l1Deployment.contracts.idgafBridgeL1);
    console.log("  Balance:", ethers.formatEther(bridgeBalance), "IDGAF");
    console.log("  Signer is Operator:", isOperator ? "✅ Yes" : "❌ No");
    console.log("  IDGAF Token:", l1Deployment.idgafTokenL1);
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n📊 L2 Bridge Status (IDGAF Chain)");
  console.log("-".repeat(60));
  try {
    const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
    const l2Bridge = IDGAFChainBridge.attach(l2Deployment.contracts.idgafChainBridge);

    const IDGAFTokenL2 = await ethers.getContractFactory("IDGAFTokenL2");
    const l2Token = IDGAFTokenL2.attach(l2Deployment.contracts.idgafTokenL2);

    const monadBridge = await l2Bridge.monadBridge();
    const owner = await l2Bridge.owner();
    const tokenSupply = await l2Token.totalSupply();
    const tokenBridge = await l2Token.bridge();

    console.log("  Bridge Address:", l2Deployment.contracts.idgafChainBridge);
    console.log("  Owner:", owner);
    console.log("  Connected L1 Bridge:", monadBridge);
    console.log("  Token Address:", l2Deployment.contracts.idgafTokenL2);
    console.log("  Token Supply:", ethers.formatEther(tokenSupply), "IDGAF");
    console.log("  Token Bridge:", tokenBridge);
    console.log("  Bridge Connection:", 
      tokenBridge.toLowerCase() === l2Deployment.contracts.idgafChainBridge.toLowerCase() 
        ? "✅ Connected" 
        : "❌ Mismatch"
    );
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n🔗 Bridge Connections");
  console.log("-".repeat(60));
  try {
    const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
    const l2Bridge = IDGAFChainBridge.attach(l2Deployment.contracts.idgafChainBridge);

    const l1BridgeAddress = l1Deployment.contracts.idgafBridgeL1;
    const l2MonadBridge = await l2Bridge.monadBridge();

    console.log("  L1 ↔ L2 Connection:");
    console.log("    L1 Bridge:", l1BridgeAddress);
    console.log("    L2 expects:", l2MonadBridge);
    console.log("    Status:", 
      l1BridgeAddress.toLowerCase() === l2MonadBridge.toLowerCase() 
        ? "✅ Connected" 
        : "❌ Not Connected"
    );
  } catch (error: any) {
    console.log("  ❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Status Check Complete\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

