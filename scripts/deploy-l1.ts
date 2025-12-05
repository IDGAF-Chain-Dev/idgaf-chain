import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * L1 (Monad)에만 브리지 배포
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying L1 contracts to Monad...");
  console.log("Deploying with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MON\n");

  // Deploy L1 Bridge only
  console.log("Deploying IDGAFBridge (L1)...");
  const IDGAFBridge = await ethers.getContractFactory("IDGAFBridge");
  const idgafBridge = await IDGAFBridge.deploy(deployer.address);
  await idgafBridge.waitForDeployment();
  const idgafBridgeAddress = await idgafBridge.getAddress();
  console.log("IDGAFBridge (L1) deployed to:", idgafBridgeAddress);

  // Save deployment addresses
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
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
  const deploymentFile = path.join(deploymentPath, `${networkName}-l1.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=== L1 Deployment Summary ===");
  console.log("Network:", networkName);
  console.log("Deployer:", deployer.address);
  console.log("IDGAFBridge (L1):", idgafBridgeAddress);
  console.log("IDGAF Token (L1):", "0x87deEb3696Ec069d5460C389cc78925df50d7777");
  console.log("\nDeployment info saved to:", deploymentFile);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

