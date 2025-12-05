import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * L1 브리지에 오퍼레이터 설정
 */
async function main() {
  const networkName = process.env.NETWORK || "monad";
  const deploymentFile = path.join(__dirname, "../deployments", `${networkName}-l1.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("L1 deployment file not found:", deploymentFile);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
  const [signer] = await ethers.getSigners();

  console.log("Setting up bridge operator...");
  console.log("Network:", networkName);
  console.log("Signer:", await signer.getAddress());
  console.log("L1 Bridge:", deployment.contracts.idgafBridgeL1);
  console.log("\n");

  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const l1Bridge = IDGAFBridge.attach(deployment.contracts.idgafBridgeL1);

  // Check if already an operator
  const isOperator = await l1Bridge.bridgeOperators(await signer.getAddress());
  if (isOperator) {
    console.log("✅ Signer is already a bridge operator");
    return;
  }

  // Set as operator (requires owner)
  console.log("Setting signer as bridge operator...");
  try {
    const tx = await l1Bridge.connect(signer).setBridgeOperator(await signer.getAddress(), true);
    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ Bridge operator set successfully!");
  } catch (error: any) {
    if (error.message.includes("OwnableUnauthorizedAccount")) {
      console.log("❌ Error: Signer is not the bridge owner");
      console.log("   Please use the owner account to set operators");
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

