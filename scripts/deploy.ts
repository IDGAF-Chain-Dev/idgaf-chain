import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

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
  console.log("IDGAFChainBridge deployed to:", idgafChainBridgeAddress);

  // Set bridge in token contract
  console.log("\nSetting bridge in IDGAFTokenL2...");
  await idgafTokenL2.setBridge(idgafChainBridgeAddress);
  console.log("Bridge set successfully");

  // Deploy IDGAF Bridge (L1 on Monad)
  console.log("\nDeploying IDGAFBridge (L1)...");
  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const idgafBridge = await IDGAFBridge.deploy(deployer.address);
  await idgafBridge.waitForDeployment();
  const idgafBridgeAddress = await idgafBridge.getAddress();
  console.log("IDGAFBridge (L1) deployed to:", idgafBridgeAddress);

  // Set Monad bridge in L2 bridge
  console.log("\nSetting Monad bridge in IDGAFChainBridge...");
  await idgafChainBridge.setMonadBridge(idgafBridgeAddress);
  console.log("Monad bridge set successfully");

  // Save deployment addresses
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      idgafTokenL2: idgafTokenL2Address,
      idgafChainBridge: idgafChainBridgeAddress,
      idgafBridgeL1: idgafBridgeAddress,
    },
    idgafTokenL1: "0x87deEb3696Ec069d5460C389cc78925df50d7777",
    timestamp: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  const networkName = (await ethers.provider.getNetwork()).name;
  const deploymentFile = path.join(deploymentPath, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", networkName);
  console.log("Deployer:", deployer.address);
  console.log("\nContracts:");
  console.log("  IDGAFTokenL2:", idgafTokenL2Address);
  console.log("  IDGAFChainBridge (L2):", idgafChainBridgeAddress);
  console.log("  IDGAFBridge (L1):", idgafBridgeAddress);
  console.log("  IDGAF Token (L1):", "0x87deEb3696Ec069d5460C389cc78925df50d7777");
  console.log("\nDeployment info saved to:", deploymentFile);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

