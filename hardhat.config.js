import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  // Solidity version we are using for the PayerX contract
  solidity: "0.8.20",
  // Network configurations
  networks: {
    hardhat: {
      // Local development network
    },
    "arc-testnet": {
      url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.ARC_TESTNET_CHAIN_ID) || 5042002,
      gasPrice: parseInt(process.env.ARC_TESTNET_GAS_PRICE) || 160000000000,
      gas: parseInt(process.env.ARC_TESTNET_GAS_LIMIT) || 10000000
    }
  }
};