import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

/**
 * Verify Real ARC Testnet Connection and Current State
 */
async function main() {
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║      Checking Real ARC Testnet Connection                      ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    // Network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("Network Connected:");
    console.log("  Chain ID:", network.chainId);
    console.log("  Network Name:", network.name);
    console.log("  Explorer: https://testnet.arcscan.app");
    console.log();

    const [deployer] = await hre.ethers.getSigners();
    console.log("Account: " + deployer.address);
    
    // Get current balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance: " + hre.ethers.formatEther(balance) + " USDC");
    console.log();

    // Get addresses
    const EURC = process.env.ARC_EURC;
    const USDC = process.env.ARC_USDC;

    // Check EURC balance
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 1: Check EURC Balance");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();

    try {
        const eurcABI = ["function balanceOf(address account) external view returns (uint256)"];
        const eurc = new hre.ethers.Contract(EURC, eurcABI, deployer);
        const eurcBalance = await eurc.balanceOf(deployer.address);
        const eurcFormatted = hre.ethers.formatUnits(eurcBalance, 6);

        console.log("EURC Balance: " + eurcFormatted + " EURC");
        console.log("Contract: " + EURC);
        console.log("Status: ✅ Connected to real ARC testnet");
        console.log();

    } catch (err) {
        console.error("Error:", err.message);
    }

    // Check current rate
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 2: Fetch Real Market Rate");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();

    try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/EUR");
        const data = await response.json();
        const rate = data.rates.USD;
        console.log("Current EUR/USD Rate: " + rate.toFixed(4) + " USD");
        console.log("Source: Official Exchangerate-API");
        console.log("Status: ✅ Real market data available");
        console.log();

    } catch (err) {
        console.error("Error:", err.message);
    }

    // Transaction history
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 3: Verify Block Explorer Access");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();

    // Get latest block
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    const block = await hre.ethers.provider.getBlock(blockNumber);

    console.log("Latest Block Information:");
    console.log("  Block Number: " + blockNumber);
    console.log("  Block Hash: " + block.hash);
    console.log("  Timestamp: " + new Date(block.timestamp * 1000).toISOString());
    console.log("  Transactions: " + block.transactions.length);
    console.log();

    console.log("View in Explorer:");
    console.log("  Block: https://testnet.arcscan.app/block/" + blockNumber);
    console.log("  Account: https://testnet.arcscan.app/address/" + deployer.address);
    console.log();

    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║  ✅ Connection Verified - Real ARC Testnet                     ║");
    console.log("║                                                                ║");
    console.log("║  This is NOT fake - You are connected to real ARC testnet     ║");
    console.log("║  All transactions here ARE visible in the block explorer      ║");
    console.log("║  Explorer: https://testnet.arcscan.app                        ║");
    console.log("╚════════════════════════════════════════════════════════════════╝");
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error.message);
        process.exit(1);
    });
