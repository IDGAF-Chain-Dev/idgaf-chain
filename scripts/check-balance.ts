import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await ethers.provider.getBalance(address);
  
  console.log("Account:", address);
  console.log("Balance:", ethers.formatEther(balance), "MON");
  console.log("Balance (Wei):", balance.toString());
  
  if (balance === 0n) {
    console.log("\n⚠️  Warning: Account balance is 0. You need MON tokens to deploy contracts.");
    console.log("Please fund this account with MON tokens to proceed with deployment.");
  } else {
    console.log("\n✓ Account has sufficient balance for deployment.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

