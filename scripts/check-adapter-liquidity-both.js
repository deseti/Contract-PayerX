import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const ADAPTER_ADDRESS = process.env.STABLEFX_ADAPTER_ADDRESS;
    const EURC = process.env.ARC_EURC;
    const USDC = process.env.ARC_USDC;

    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║  Check Adapter Liquidity                                       ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    const tokenABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() external view returns (uint8)"
    ];

    // Check USDC
    const usdc = new hre.ethers.Contract(USDC, tokenABI, hre.ethers.provider);
    const usdcBalance = await usdc.balanceOf(ADAPTER_ADDRESS);
    const usdcDecimals = await usdc.decimals();
    const usdcFormatted = hre.ethers.formatUnits(usdcBalance, usdcDecimals);

    // Check EURC
    const eurc = new hre.ethers.Contract(EURC, tokenABI, hre.ethers.provider);
    const eurcBalance = await eurc.balanceOf(ADAPTER_ADDRESS);
    const eurcDecimals = await eurc.decimals();
    const eurcFormatted = hre.ethers.formatUnits(eurcBalance, eurcDecimals);

    console.log("Adapter: " + ADAPTER_ADDRESS);
    console.log();
    console.log("USDC Balance: " + usdcFormatted + " USDC");
    console.log("EURC Balance: " + eurcFormatted + " EURC");
    console.log();
    console.log("Analysis:");
    console.log("  EURC → USDC swaps need USDC in adapter: " + usdcFormatted + " available");
    console.log("  USDC → EURC swaps need EURC in adapter: " + eurcFormatted + " available");
    console.log();
    console.log("View in explorer: https://testnet.arcscan.app/address/" + ADAPTER_ADDRESS);
}

main().catch(console.error);
