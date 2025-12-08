import hre from "hardhat";

/**
 * Script to allocate initial liquidity to StableFXAdapter
 * 
 * Usage:
 * 1. Set the amount to allocate below
 * 2. npx hardhat run scripts/allocate-initial-liquidity.js --network arc-testnet
 */

async function main() {
    const ADAPTER_ADDRESS = "0x177030FBa1dE345F99C91ccCf4Db615E8016f75D";
    const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
    const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

    // ============================================
    // SETTING: Change amounts as needed
    // ============================================
    const USDC_TO_ALLOCATE = "700";  // 700 USDC
    const EURC_TO_ALLOCATE = "700";  // 700 EURC
    // ============================================

    const [deployer] = await hre.ethers.getSigners();
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  Initial Liquidity Allocation to StableFXAdapter  ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    console.log("👤 Owner/Dev Account:", deployer.address);
    console.log("📍 Adapter Address:", ADAPTER_ADDRESS);
    console.log("\n" + "=".repeat(55));

    // Get contracts
    const adapter = await hre.ethers.getContractAt("StableFXAdapter", ADAPTER_ADDRESS);
    const usdc = await hre.ethers.getContractAt("IERC20", USDC_ADDRESS);
    const eurc = await hre.ethers.getContractAt("IERC20", EURC_ADDRESS);

    // ===================================
    // Step 1: Check Your Wallet Balance
    // ===================================
    console.log("\n📊 Step 1: Check Your Wallet Balance");
    console.log("─".repeat(55));

    const usdcBalanceWallet = await usdc.balanceOf(deployer.address);
    const eurcBalanceWallet = await eurc.balanceOf(deployer.address);

    console.log(`USDC in your wallet: ${hre.ethers.formatUnits(usdcBalanceWallet, 6)} USDC`);
    console.log(`EURC in your wallet: ${hre.ethers.formatUnits(eurcBalanceWallet, 6)} EURC`);

    // Validate sufficient balance
    const usdcAmount = hre.ethers.parseUnits(USDC_TO_ALLOCATE, 6);
    const eurcAmount = hre.ethers.parseUnits(EURC_TO_ALLOCATE, 6);

    if (usdcBalanceWallet < usdcAmount) {
        console.log("\n❌ ERROR: Insufficient USDC in wallet!");
        console.log(`   Required: ${USDC_TO_ALLOCATE} USDC`);
        console.log(`   Available: ${hre.ethers.formatUnits(usdcBalanceWallet, 6)} USDC`);
        process.exit(1);
    }

    if (eurcBalanceWallet < eurcAmount) {
        console.log("\n❌ ERROR: Insufficient EURC in wallet!");
        console.log(`   Required: ${EURC_TO_ALLOCATE} EURC`);
        console.log(`   Available: ${hre.ethers.formatUnits(eurcBalanceWallet, 6)} EURC`);
        process.exit(1);
    }

    console.log("\n✅ Sufficient balance for allocation!");

    // ===================================
    // Step 2: Check Current Adapter Status
    // ===================================
    console.log("\n📊 Step 2: Check Adapter Status Before Allocation");
    console.log("─".repeat(55));

    const usdcLiquidityBefore = await adapter.getLiquidity(USDC_ADDRESS);
    const eurcLiquidityBefore = await adapter.getLiquidity(EURC_ADDRESS);
    const usdcBalanceBefore = await usdc.balanceOf(ADAPTER_ADDRESS);
    const eurcBalanceBefore = await eurc.balanceOf(ADAPTER_ADDRESS);

    console.log("\nAdapter BEFORE allocation:");
    console.log("  USDC:");
    console.log(`    Balance real: ${hre.ethers.formatUnits(usdcBalanceBefore, 6)} USDC`);
    console.log(`    Mapping: ${hre.ethers.formatUnits(usdcLiquidityBefore, 6)} USDC`);
    console.log("  EURC:");
    console.log(`    Balance real: ${hre.ethers.formatUnits(eurcBalanceBefore, 6)} EURC`);
    console.log(`    Mapping: ${hre.ethers.formatUnits(eurcLiquidityBefore, 6)} EURC`);

    // ===================================
    // Step 3: Alokasi USDC
    // ===================================
    console.log("\n💰 Step 3: Allocate USDC to Adapter");
    console.log("─".repeat(55));
    console.log(`Allocating ${USDC_TO_ALLOCATE} USDC...`);

    // Approve USDC
    console.log("\n  → Approve USDC...");
    const approveUSDCTx = await usdc.approve(ADAPTER_ADDRESS, usdcAmount);
    await approveUSDCTx.wait();
    console.log(`     ✅ Approved: ${approveUSDCTx.hash}`);

    // Add liquidity USDC
    console.log("\n  → Add liquidity USDC...");
    const addUSDCTx = await adapter.addLiquidity(USDC_ADDRESS, usdcAmount);
    await addUSDCTx.wait();
    console.log(`     ✅ Added: ${addUSDCTx.hash}`);
    console.log(`     View: https://testnet.arcscan.app/tx/${addUSDCTx.hash}`);

    // ===================================
    // Step 4: Alokasi EURC
    // ===================================
    console.log("\n💰 Step 4: Allocate EURC to Adapter");
    console.log("─".repeat(55));
    console.log(`Allocating ${EURC_TO_ALLOCATE} EURC...`);

    // Approve EURC
    console.log("\n  → Approve EURC...");
    const approveEURCTx = await eurc.approve(ADAPTER_ADDRESS, eurcAmount);
    await approveEURCTx.wait();
    console.log(`     ✅ Approved: ${approveEURCTx.hash}`);

    // Add liquidity EURC
    console.log("\n  → Add liquidity EURC...");
    const addEURCTx = await adapter.addLiquidity(EURC_ADDRESS, eurcAmount);
    await addEURCTx.wait();
    console.log(`     ✅ Added: ${addEURCTx.hash}`);
    console.log(`     View: https://testnet.arcscan.app/tx/${addEURCTx.hash}`);

    // ===================================
    // Step 5: Verifikasi Hasil
    // ===================================
    console.log("\n📊 Step 5: Verify Allocation Results");
    console.log("─".repeat(55));

    const usdcLiquidityAfter = await adapter.getLiquidity(USDC_ADDRESS);
    const eurcLiquidityAfter = await adapter.getLiquidity(EURC_ADDRESS);
    const usdcBalanceAfter = await usdc.balanceOf(ADAPTER_ADDRESS);
    const eurcBalanceAfter = await eurc.balanceOf(ADAPTER_ADDRESS);
    const usdcBalanceWalletAfter = await usdc.balanceOf(deployer.address);
    const eurcBalanceWalletAfter = await eurc.balanceOf(deployer.address);

    console.log("\n✅ Adapter AFTER allocation:");
    console.log("  USDC:");
    console.log(`    Balance real: ${hre.ethers.formatUnits(usdcBalanceAfter, 6)} USDC (+${hre.ethers.formatUnits(usdcBalanceAfter - usdcBalanceBefore, 6)})`);
    console.log(`    Mapping: ${hre.ethers.formatUnits(usdcLiquidityAfter, 6)} USDC (+${hre.ethers.formatUnits(usdcLiquidityAfter - usdcLiquidityBefore, 6)})`);
    console.log("  EURC:");
    console.log(`    Balance real: ${hre.ethers.formatUnits(eurcBalanceAfter, 6)} EURC (+${hre.ethers.formatUnits(eurcBalanceAfter - eurcBalanceBefore, 6)})`);
    console.log(`    Mapping: ${hre.ethers.formatUnits(eurcLiquidityAfter, 6)} EURC (+${hre.ethers.formatUnits(eurcLiquidityAfter - eurcLiquidityBefore, 6)})`);

    console.log("\n✅ Your Wallet AFTER allocation:");
    console.log(`  USDC: ${hre.ethers.formatUnits(usdcBalanceWalletAfter, 6)} USDC (remaining)`);
    console.log(`  EURC: ${hre.ethers.formatUnits(eurcBalanceWalletAfter, 6)} EURC (remaining)`);

    // Check synchronization
    console.log("\n🔍 Synchronization Check:");
    const usdcSynced = usdcBalanceAfter === usdcLiquidityAfter;
    const eurcSynced = eurcBalanceAfter === eurcLiquidityAfter;

    if (usdcSynced && eurcSynced) {
        console.log("  ✅ PERFECT! Balance and Mapping 100% SYNCED for both tokens!");
    } else {
        console.log("  ⚠️  Gap detected between balance and mapping:");
        if (!usdcSynced) {
            const gap = usdcBalanceAfter - usdcLiquidityAfter;
            console.log(`    USDC gap: ${hre.ethers.formatUnits(gap, 6)} USDC (untracked)`);
        }
        if (!eurcSynced) {
            const gap = eurcBalanceAfter - eurcLiquidityAfter;
            console.log(`    EURC gap: ${hre.ethers.formatUnits(gap, 6)} EURC (untracked)`);
        }
    }

    // ===================================
    // Summary
    // ===================================
    console.log("\n" + "=".repeat(55));
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  ✅ LIQUIDITY ALLOCATION SUCCESSFUL!               ║");
    console.log("╚════════════════════════════════════════════════════╝");
    console.log("\n📝 Summary:");
    console.log(`   • Allocated: ${USDC_TO_ALLOCATE} USDC + ${EURC_TO_ALLOCATE} EURC`);
    console.log(`   • Total USDC liquidity: ${hre.ethers.formatUnits(usdcLiquidityAfter, 6)} USDC`);
    console.log(`   • Total EURC liquidity: ${hre.ethers.formatUnits(eurcLiquidityAfter, 6)} EURC`);
    console.log(`   • Remaining in wallet: ${hre.ethers.formatUnits(usdcBalanceWalletAfter, 6)} USDC, ${hre.ethers.formatUnits(eurcBalanceWalletAfter, 6)} EURC`);
    console.log("\n✅ System READY for users to perform swap transactions!");
    console.log("✅ Balance and Mapping SYNCED!");
    console.log("\n📌 Next steps:");
    console.log("   1. Test swap with: npx hardhat run scripts/universal-payment.js");
    console.log("   2. Monitor liquidity with: npx hardhat run scripts/check-liquidity-mapping.js");
    console.log("   3. Add liquidity anytime with: npx hardhat run scripts/add-usdc-liquidity.js");
    console.log("\n" + "=".repeat(55));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ ERROR:", error);
        process.exit(1);
    });
