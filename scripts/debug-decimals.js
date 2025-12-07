import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const USDC = process.env.ARC_USDC;

    console.log("Checking USDC Token Details on ARC Testnet");
    console.log("=" .repeat(60));
    console.log();

    const usdcABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() external view returns (uint8)",
        "function symbol() external view returns (string)"
    ];
    const usdc = new hre.ethers.Contract(USDC, usdcABI, hre.ethers.provider);

    // Get token info
    const decimals = await usdc.decimals();
    const symbol = await usdc.symbol();

    console.log("Token: " + symbol);
    console.log("Decimals: " + decimals);
    console.log("Contract: " + USDC);
    console.log();

    // Account balance
    const accountBalance = await usdc.balanceOf(deployer.address);
    console.log("Account Balance (Raw): " + accountBalance.toString());
    console.log("Account Balance (Formatted with " + decimals + " decimals): " + hre.ethers.formatUnits(accountBalance, decimals));
    console.log();

    // Adapter balance
    const ADAPTER_ADDRESS = process.env.STABLEFX_ADAPTER_ADDRESS;
    const adapterBalance = await usdc.balanceOf(ADAPTER_ADDRESS);
    console.log("Adapter Balance (Raw): " + adapterBalance.toString());
    console.log("Adapter Balance (Formatted with " + decimals + " decimals): " + hre.ethers.formatUnits(adapterBalance, decimals));
    console.log();

    console.log("=" .repeat(60));
    console.log("COMPARISON WITH EXPLORER:");
    console.log("=" .repeat(60));
    console.log("Your account shows in explorer: 6.37232489 USDC");
    console.log("Script shows: " + hre.ethers.formatUnits(accountBalance, decimals) + " USDC");
    console.log();
    console.log("Adapter shows in explorer: 6.632409 USDC");
    console.log("Script shows: " + hre.ethers.formatUnits(adapterBalance, decimals) + " USDC");
}

main().catch(console.error);
