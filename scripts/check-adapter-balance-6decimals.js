import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║  Debug: Check Adapter Liquidity After Funding                 ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    const ADAPTER_ADDRESS = process.env.STABLEFX_ADAPTER_ADDRESS;
    const USDC = process.env.ARC_USDC;

    const usdcABI = ["function balanceOf(address account) external view returns (uint256)"];
    const usdc = new hre.ethers.Contract(USDC, usdcABI, hre.ethers.provider);

    const balance = await usdc.balanceOf(ADAPTER_ADDRESS);
    const balanceFormatted = hre.ethers.formatUnits(balance, 6);

    console.log("Adapter: " + ADAPTER_ADDRESS);
    console.log();
    console.log("USDC Balance (raw): " + balance.toString());
    console.log("USDC Balance (6 decimals): " + balanceFormatted + " USDC");
    console.log();

    // For 1 EURC at 1.16 rate
    console.log("For 1 EURC payment (at 1.16 rate):");
    console.log("  Needed: 1.16 USDC");
    console.log("  Available: " + balanceFormatted + " USDC");
    
    const needed = hre.ethers.parseUnits("1.16", 6);
    if (balance >= needed) {
        console.log("  ✅ SUFFICIENT");
    } else {
        const deficit = needed - balance;
        console.log("  ❌ INSUFFICIENT - Missing " + hre.ethers.formatUnits(deficit, 6) + " USDC");
    }
}

main().catch(console.error);
