import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 10144,
      port: 8546,
    },
    monad: {
      url: process.env.MONAD_RPC_URL || "http://localhost:8545",
      chainId: parseInt(process.env.MONAD_CHAIN_ID || "143"),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    idgaf: {
      url: process.env.IDGAF_RPC_URL || "https://rpc.idgaf.chain",
      chainId: parseInt(process.env.IDGAF_CHAIN_ID || "10144"),
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://localhost:8546",
      chainId: 10144,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;

