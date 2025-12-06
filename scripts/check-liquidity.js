import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

/**
 * Check and display adapter liquidity status
 */
async function main() {
    console.log("📊 Checking StableFXAdapter Liquidity Status...\n");

    // Get addresses
    const ADAPTER_ADDRESS = process.env.STABLEFX_ADAPTER_ADDRESS;
    const USDC = process.env.ARC_USDC;
    const EURC = process.env.ARC_EURC;
    const USYC = process.env.ARC_USYC;

    console.log("📍 Adapter:", ADAPTER_ADDRESS);
    console.log();

    // Get contract instances
    const adapter = await hre.ethers.getContractAt("StableFXAdapter", ADAPTER_ADDRESS);

    // Check liquidity
    console.log("💧 Current Adapter Liquidity:");
    const usdcLiquidity = await adapter.getLiquidity(USDC);
    const eurcLiquidity = await adapter.getLiquidity(EURC);
    const usycLiquidity = await adapter.getLiquidity(USYC);
    
    console.log("   USDC:", hre.ethers.formatUnits(usdcLiquidity, 6));
    console.log("   EURC:", hre.ethers.formatUnits(eurcLiquidity, 6));
    console.log("   USYC:", hre.ethers.formatUnits(usycLiquidity, 6));
    console.log();

    console.log("💡 Liquidity Status:");
    if (usdcLiquidity < hre.ethers.parseUnits("3", 6)) {
        console.log("   ⚠️  USDC liquidity low - need more for large payments");
    } else {
        console.log("   ✅ USDC liquidity sufficient");
    }
    
    if (eurcLiquidity < hre.ethers.parseUnits("3", 6)) {
        console.log("   ⚠️  EURC liquidity low");
    } else {
        console.log("   ✅ EURC liquidity sufficient");
    }
    
    if (usycLiquidity === 0n) {
        console.log("   ⚠️  USYC liquidity empty");
    } else {
        console.log("   ✅ USYC liquidity available");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Check failed:");
        console.error(error);
        process.exit(1);
    });