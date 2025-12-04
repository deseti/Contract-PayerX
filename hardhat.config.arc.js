import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/**
 * Hardhat configuration for ARC Network deployment
 * 
 * Setup:
 * 1. Copy .env.example to .env
 * 2. Add your PRIVATE_KEY to .env
 * 3. Get testnet USDC from https://faucet.circle.com
 * 4. Deploy: npx hardhat run scripts/deploy-arc.js --network arc-testnet
 */

/** @type import('hardhat/config').HardhatUserConfig */
export default {
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
    // ARC Testnet configuration
    "arc-testnet": {
      url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 160000000000, // 160 Gwei minimum (in wei)
      gas: 10000000, // 10M gas limit
    },
    
    // Local Hardhat network for testing
    hardhat: {
      chainId: 31337,
      // Optionally fork ARC Testnet for local development
      // forking: {
      //   url: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
      //   enabled: process.env.FORKING === "true",
      // },
    },
  },
  
  // Etherscan verification (if ARC adds block explorer API support)
  etherscan: {
    apiKey: {
      "arc-testnet": process.env.ARCSCAN_API_KEY || "no-api-key-needed",
    },
    customChains: [
      {
        network: "arc-testnet",
        chainId: 5042002,
        urls: {
          apiURL: "https://testnet.arcscan.app/api",
          browserURL: "https://testnet.arcscan.app",
        },
      },
    ],
  },
  
  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "USDC", // ARC uses USDC for gas
  },
  
  // Contract verification paths
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
