import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  // Solidity version we are using for the PayerX contract
  solidity: "0.8.20",
  // Default network configuration (we will use the built-in Hardhat Network for testing)
  networks: {
    hardhat: {
      // You can add ARC Testnet configuration here later
    }
  }
};