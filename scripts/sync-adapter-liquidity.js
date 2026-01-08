import hre from "hardhat";

/**
 * Sync adapter liquidity mapping with actual balance
 * Adds the untracked balance to the liquidity mapping
 */

async function main() {
    const ADAPTER_ADDRESS = "0x177030FBa1dE345F99C91ccCf4Db615E8016f75D";
    const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
    const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
    
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  Sync Adapter Liquidity Mapping                     ║");
    console.log("╚════════════════════════════════════════════════════╝\n");
    
    const [owner] = await hre.ethers.getSigners();
    
    // Get contracts
    const adapterAbi = [
        "function getLiquidity(address token) external view returns (uint256)",
        "function syncLiquidity(address token) external"
    ];
    const adapter = await hre.ethers.getContractAt(adapterAbi, ADAPTER_ADDRESS);
    const usdc = await hre.ethers.getContractAt("IERC20", USDC_ADDRESS);
    const eurc = await hre.ethers.getContractAt("IERC20", EURC_ADDRESS);
    
    // Check USDC
    console.log("=== USDC ===");
    const usdcBalance = await usdc.balanceOf(ADAPTER_ADDRESS);
    const usdcLiquidity = await adapter.getLiquidity(USDC_ADDRESS);
    console.log(`Balance: ${hre.ethers.formatUnits(usdcBalance, 6)} USDC`);
    console.log(`Liquidity mapping: ${hre.ethers.formatUnits(usdcLiquidity, 6)} USDC`);
    console.log(`Gap: ${hre.ethers.formatUnits(usdcBalance - usdcLiquidity, 6)} USDC\n`);
    
    if (usdcBalance > usdcLiquidity) {
        console.log("📊 Syncing USDC liquidity...");
        const tx = await adapter.syncLiquidity(USDC_ADDRESS);
        await tx.wait();
        console.log(`✅ USDC liquidity synced`);
        console.log(`   Tx: ${tx.hash}\n`);
    }
    
    // Check EURC
    console.log("=== EURC ===");
    const eurcBalance = await eurc.balanceOf(ADAPTER_ADDRESS);
    const eurcLiquidity = await adapter.getLiquidity(EURC_ADDRESS);
    console.log(`Balance: ${hre.ethers.formatUnits(eurcBalance, 6)} EURC`);
    console.log(`Liquidity mapping: ${hre.ethers.formatUnits(eurcLiquidity, 6)} EURC`);
    console.log(`Gap: ${hre.ethers.formatUnits(eurcBalance - eurcLiquidity, 6)} EURC\n`);
    
    if (eurcBalance > eurcLiquidity) {
        console.log("📊 Syncing EURC liquidity...");
        const tx = await adapter.syncLiquidity(EURC_ADDRESS);
        await tx.wait();
        console.log(`✅ EURC liquidity synced`);
        console.log(`   Tx: ${tx.hash}\n`);
    }
    
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  ✅ SUCCESS - Liquidity Synced                     ║");
    console.log("╚════════════════════════════════════════════════════╝");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
