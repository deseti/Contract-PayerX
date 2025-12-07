import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║  Check StableFXAdapter Liquidity                              ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    const ADAPTER_ADDRESS = process.env.STABLEFX_ADAPTER_ADDRESS;
    const USDC = process.env.ARC_USDC;

    console.log("Adapter: " + ADAPTER_ADDRESS);
    console.log("USDC Token: " + USDC);
    console.log();

    // Get USDC balance of adapter
    const usdcABI = ["function balanceOf(address account) external view returns (uint256)"];
    const provider = hre.ethers.provider;
    const usdc = new hre.ethers.Contract(USDC, usdcABI, provider);

    const balance = await usdc.balanceOf(ADAPTER_ADDRESS);
    const balanceFormatted = hre.ethers.formatUnits(balance, 18);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Adapter USDC Balance:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Raw: " + balance.toString());
    console.log("Formatted: " + balanceFormatted + " USDC");
    console.log();

    // For 1 EURC at 1.16 rate, we need 1.16 USDC
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("For 1 EURC → USDC (at 1.16 rate):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Required: 1.16 USDC");
    console.log("Available: " + balanceFormatted + " USDC");
    
    const needed = hre.ethers.parseUnits("1.16", 18);
    if (balance >= needed) {
        console.log("✅ SUFFICIENT - Can process 1 EURC");
    } else {
        const deficit = needed - balance;
        console.log("❌ INSUFFICIENT - Missing " + hre.ethers.formatUnits(deficit, 18) + " USDC");
    }
    console.log();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error.message);
        process.exit(1);
    });
