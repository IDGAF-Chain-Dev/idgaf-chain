import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * L2 (IDGAF Chain)에만 컨트랙트 배포
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying L2 contracts to IDGAF Chain...");
  console.log("Deploying with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Read L1 deployment to get L1 bridge address
  const networkName = process.env.NETWORK || "idgaf";
  const l1DeploymentFile = path.join(__dirname, "../deployments", "monad-l1.json");
  
  let l1BridgeAddress = "0x0000000000000000000000000000000000000000";
  if (fs.existsSync(l1DeploymentFile)) {
    const l1Deployment = JSON.parse(fs.readFileSync(l1DeploymentFile, "utf-8"));
    l1BridgeAddress = l1Deployment.contracts.idgafBridgeL1;
    console.log("Found L1 bridge address:", l1BridgeAddress);
  } else {
    console.log("⚠️  L1 deployment file not found. Using placeholder address.");
    console.log("   Please update the L1 bridge address after deployment.");
  }

  // Deploy IDGAF Token L2
  console.log("\nDeploying IDGAFTokenL2...");
  const IDGAFTokenL2 = await ethers.getContractFactory("IDGAFTokenL2");
  const idgafTokenL2 = await IDGAFTokenL2.deploy(deployer.address);
  await idgafTokenL2.waitForDeployment();
  const idgafTokenL2Address = await idgafTokenL2.getAddress();
  console.log("IDGAFTokenL2 deployed to:", idgafTokenL2Address);

  // Deploy IDGAF Chain Bridge (L2)
  console.log("\nDeploying IDGAFChainBridge...");
  const IDGAFChainBridge = await ethers.getContractFactory("IDGAFChainBridge");
  const idgafChainBridge = await IDGAFChainBridge.deploy(idgafTokenL2Address, deployer.address);
  await idgafChainBridge.waitForDeployment();
  const idgafChainBridgeAddress = await idgafChainBridge.getAddress();
  console.log("IDGAFChainBridge (L2) deployed to:", idgafChainBridgeAddress);

  // Set bridge in token contract
  console.log("\nSetting bridge in IDGAFTokenL2...");
  await idgafTokenL2.setBridge(idgafChainBridgeAddress);
  console.log("Bridge set successfully");

  // Set Monad bridge in L2 bridge
  console.log("\nSetting Monad bridge in IDGAFChainBridge...");
  await idgafChainBridge.setMonadBridge(l1BridgeAddress);
  console.log("Monad bridge set successfully");

  // Save deployment addresses
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      idgafTokenL2: idgafTokenL2Address,
      idgafChainBridge: idgafChainBridgeAddress,
    },
    l1Bridge: l1BridgeAddress,
    timestamp: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  const currentNetwork = (await ethers.provider.getNetwork()).name;
  const deploymentFile = path.join(deploymentPath, `${currentNetwork}-l2.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== L2 Deployment Summary ===");
  console.log("Network:", currentNetwork);
  console.log("Deployer:", deployer.address);
  console.log("\nContracts:");
  console.log("  IDGAFTokenL2:", idgafTokenL2Address);
  console.log("  IDGAFChainBridge (L2):", idgafChainBridgeAddress);
  console.log("  L1 Bridge:", l1BridgeAddress);
  console.log("\nDeployment info saved to:", deploymentFile);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

