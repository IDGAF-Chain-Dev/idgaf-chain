import { ethers } from "hardhat";

async function main() {
  console.log("Testing RPC connections...\n");

  // Test Monad RPC
  const monadRpc = process.env.MONAD_RPC_URL || "https://rpc1.monad.xyz";
  console.log(`Testing Monad RPC: ${monadRpc}`);
  try {
    const monadProvider = new ethers.JsonRpcProvider(monadRpc);
    const monadChainId = await monadProvider.getNetwork();
    console.log(`✓ Monad connected! Chain ID: ${monadChainId.chainId}`);
    const blockNumber = await monadProvider.getBlockNumber();
    console.log(`  Current block: ${blockNumber}`);
  } catch (error: any) {
    console.log(`✗ Monad connection failed: ${error.message}`);
  }

  console.log("\n");

  // Test IDGAF Chain RPC
  const idgafRpc = process.env.IDGAF_RPC_URL || "https://rpc.idgaf.chain";
  console.log(`Testing IDGAF Chain RPC: ${idgafRpc}`);
  try {
    const idgafProvider = new ethers.JsonRpcProvider(idgafRpc);
    const idgafChainId = await idgafProvider.getNetwork();
    console.log(`✓ IDGAF Chain connected! Chain ID: ${idgafChainId.chainId}`);
    const blockNumber = await idgafProvider.getBlockNumber();
    console.log(`  Current block: ${blockNumber}`);
  } catch (error: any) {
    console.log(`✗ IDGAF Chain connection failed: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

