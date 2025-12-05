import { ethers } from "hardhat";

/**
 * IDGAF Chain 로컬 노드 시작 스크립트
 * 이 스크립트는 Hardhat 노드를 IDGAF Chain 설정으로 시작합니다
 */
async function main() {
  console.log("Starting IDGAF Chain local node...");
  console.log("This will start a local Hardhat node configured for IDGAF Chain");
  console.log("\nTo start the node, run in a separate terminal:");
  console.log("  npx hardhat node --port 8546 --chain-id 10144");
  console.log("\nOr use the npm script:");
  console.log("  npm run node:idgaf");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

