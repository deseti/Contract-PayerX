import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

/**
 * Migrate PayerX to use StableFXAdapter
 * This updates the FXEngine address in PayerX to point to the new adapter
 */
async function main() {
    console.log("🔄 Migrating PayerX to StableFXAdapter...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Migrating with account:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "USDC\n");

    // Get addresses from .env
    const PAYERX_ADDRESS = process.env.PAYERX_ADDRESS;
    const OLD_FXENGINE_ADDRESS = process.env.MOCKFXENGINE_ADDRESS; // MockFXEngine
    const NEW_FXENGINE_ADDRESS = process.env.STABLEFX_ADAPTER_ADDRESS;

    if (!PAYERX_ADDRESS) {
        console.error("❌ PAYERX_ADDRESS not found in .env");
        process.exit(1);
    }

    if (!NEW_FXENGINE_ADDRESS) {
        console.error("❌ STABLEFX_ADAPTER_ADDRESS not found in .env");
        console.log("   Deploy the adapter first using: node scripts/deploy-stablefx-adapter.js");
        process.exit(1);
    }

    console.log("📍 Contract Addresses:");
    console.log("   PayerX:", PAYERX_ADDRESS);
    console.log("   Old FXEngine (Mock):", OLD_FXENGINE_ADDRESS);
    console.log("   New FXEngine (StableFX):", NEW_FXENGINE_ADDRESS);
    console.log();

    // Get PayerX contract
    const payerx = await hre.ethers.getContractAt("PayerX", PAYERX_ADDRESS);

    // Check current FXEngine
    const currentFXEngine = await payerx.fxEngine();
    console.log("🔍 Current FXEngine:", currentFXEngine);
    console.log();

    // Check if already updated
    if (currentFXEngine.toLowerCase() === NEW_FXENGINE_ADDRESS.toLowerCase()) {
        console.log("✅ PayerX is already using StableFXAdapter!");
        console.log("   No migration needed.");
        process.exit(0);
    }

    // Update FXEngine
    console.log("🔄 Updating PayerX FXEngine...");
    console.log("   From:", currentFXEngine);
    console.log("   To:", NEW_FXENGINE_ADDRESS);
    console.log();

    const tx = await payerx.updateFXEngine(NEW_FXENGINE_ADDRESS);
    console.log("⏳ Transaction submitted:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    console.log();

    // Verify the update
    const newFXEngine = await payerx.fxEngine();
    console.log("🔍 Verification:");
    console.log("   New FXEngine:", newFXEngine);
    console.log("   Expected:", NEW_FXENGINE_ADDRESS);
    console.log();

    if (newFXEngine.toLowerCase() === NEW_FXENGINE_ADDRESS.toLowerCase()) {
        console.log("✅ Migration successful!");
        console.log();
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📊 PayerX is now using REAL market rates via StableFXAdapter");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log();
        console.log("🎯 Key Changes:");
        console.log("   ✓ FXEngine: MockFXEngine → StableFXAdapter");
        console.log("   ✓ Rates: Hardcoded → Real-time market rates");
        console.log("   ✓ Infrastructure: Test → Circle's official StableFX");
        console.log();
        console.log("💡 Next Steps:");
        console.log("1. Test payment flows with real rates:");
        console.log("   node scripts/test-stablefx-payment.js");
        console.log();
        console.log("2. Compare old vs new rates:");
        console.log("   - Old (Mock): 1 EURC = 1.1 USDC");
        console.log("   - New (Real): 1 EURC = 1.09 USDC (market rate)");
        console.log();
        console.log("3. Monitor transactions on ArcScan:");
        console.log(`   https://testnet.arcscan.app/address/${PAYERX_ADDRESS}`);
        console.log();
        console.log("ℹ️  The old MockFXEngine is still deployed but no longer used.");
        console.log("   You can decommission it or keep it for testing purposes.");
    } else {
        console.error("❌ Migration verification failed!");
        console.error("   Expected:", NEW_FXENGINE_ADDRESS);
        console.error("   Got:", newFXEngine);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Migration failed:");
        console.error(error);
        process.exit(1);
    });
