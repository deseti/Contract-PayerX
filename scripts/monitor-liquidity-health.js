import hre from "hardhat";

/**
 * Advanced liquidity health monitoring script
 * Check sync status, utilization rate, and provide alerts
 * 
 * Usage:
 * npx hardhat run scripts/monitor-liquidity-health.js --network arc-testnet
 */

async function main() {
    const ADAPTER_ADDRESS = "0x177030FBa1dE345F99C91ccCf4Db615E8016f75D";
    const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
    const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

    // Threshold settings
    const THRESHOLDS = {
        critical: 20,   // < 20% = critical
        warning: 40,    // < 40% = warning
        healthy: 60,    // > 60% = healthy
        utilization_low: 50,    // < 50% utilization = unused funds
        utilization_high: 95,   // > 95% utilization = risk depleted
    };

    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  Liquidity Health Monitor                          ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    const adapter = await hre.ethers.getContractAt("StableFXAdapter", ADAPTER_ADDRESS);
    const usdc = await hre.ethers.getContractAt("IERC20", USDC_ADDRESS);
    const eurc = await hre.ethers.getContractAt("IERC20", EURC_ADDRESS);

    // Get data
    const usdcBalance = await usdc.balanceOf(ADAPTER_ADDRESS);
    const eurcBalance = await eurc.balanceOf(ADAPTER_ADDRESS);
    const usdcMapping = await adapter.getLiquidity(USDC_ADDRESS);
    const eurcMapping = await adapter.getLiquidity(EURC_ADDRESS);

    const tokens = [
        {
            name: "USDC",
            address: USDC_ADDRESS,
            balance: usdcBalance,
            mapping: usdcMapping,
            decimals: 6,
        },
        {
            name: "EURC",
            address: EURC_ADDRESS,
            balance: eurcBalance,
            mapping: eurcMapping,
            decimals: 6,
        }
    ];

    // Analysis
    console.log("📊 Status Liquidity:");
    console.log("=".repeat(70));

    let overallHealth = "HEALTHY";
    let alerts = [];

    for (const token of tokens) {
        const balanceFloat = parseFloat(hre.ethers.formatUnits(token.balance, token.decimals));
        const mappingFloat = parseFloat(hre.ethers.formatUnits(token.mapping, token.decimals));
        const gap = balanceFloat - mappingFloat;
        const utilization = balanceFloat > 0 ? (mappingFloat / balanceFloat) * 100 : 0;
        const gapPercent = balanceFloat > 0 ? (gap / balanceFloat) * 100 : 0;

        console.log(`\n${token.name}:`);
        console.log("─".repeat(70));
        console.log(`  Balance (real):       ${balanceFloat.toFixed(6)} ${token.name}`);
        console.log(`  Mapping (tracked):    ${mappingFloat.toFixed(6)} ${token.name}`);
        console.log(`  Gap (untracked):      ${gap.toFixed(6)} ${token.name} (${gapPercent.toFixed(1)}%)`);
        console.log(`  Utilization Rate:     ${utilization.toFixed(1)}%`);

        // Status
        let status = "🟢 HEALTHY";
        let syncStatus = "🟢 SYNCED";
        let recommendations = [];

        // Check sync status
        if (Math.abs(gap) > 0.01) {  // Tolerance 0.01 token
            syncStatus = "⚠️  NOT SYNCED";
            if (gap > 0) {
                recommendations.push(`${gap.toFixed(2)} ${token.name} untracked (${gapPercent.toFixed(1)}% of balance)`);
            }
        }

        // Check mapping level
        if (mappingFloat < balanceFloat * 0.2) {
            status = "🔴 CRITICAL";
            overallHealth = "CRITICAL";
            alerts.push(`${token.name}: Mapping CRITICAL (< 20% of balance)`);
            recommendations.push(`URGENT: Add ${token.name} liquidity mapping immediately!`);
        } else if (mappingFloat < balanceFloat * 0.4) {
            status = "🟡 WARNING";
            if (overallHealth !== "CRITICAL") overallHealth = "WARNING";
            alerts.push(`${token.name}: Mapping LOW (< 40% of balance)`);
            recommendations.push(`Consider adding ${token.name} liquidity mapping`);
        }

        // Check utilization
        if (utilization < THRESHOLDS.utilization_low) {
            recommendations.push(`Low utilization (${utilization.toFixed(1)}%) - many tokens idle`);
        } else if (utilization > THRESHOLDS.utilization_high) {
            status = "🟡 WARNING";
            recommendations.push(`High utilization (${utilization.toFixed(1)}%) - almost no buffer!`);
        }

        console.log(`  Sync Status:          ${syncStatus}`);
        console.log(`  Health Status:        ${status}`);

        if (recommendations.length > 0) {
            console.log(`\n  💡 Rekomendasi:`);
            recommendations.forEach(rec => {
                console.log(`     • ${rec}`);
            });
        }
    }

    // Overall summary
    console.log("\n" + "=".repeat(70));
    console.log("📋 RINGKASAN:");
    console.log("=".repeat(70));

    let healthIcon = "🟢";
    if (overallHealth === "CRITICAL") healthIcon = "🔴";
    else if (overallHealth === "WARNING") healthIcon = "🟡";

    console.log(`\n  Overall Health: ${healthIcon} ${overallHealth}`);

    if (alerts.length > 0) {
        console.log("\n  ⚠️  ALERTS:");
        alerts.forEach(alert => {
            console.log(`     • ${alert}`);
        });
    } else {
        console.log("\n  ✅ No alerts - system running smoothly!");
    }

    // Capacity analysis
    console.log("\n" + "=".repeat(70));
    console.log("📈 ANALISIS KAPASITAS:");
    console.log("=".repeat(70));

    const usdcMappingFloat = parseFloat(hre.ethers.formatUnits(usdcMapping, 6));
    const eurcMappingFloat = parseFloat(hre.ethers.formatUnits(eurcMapping, 6));
    const exchangeRate = 1.16;

    // How many swaps can be handled?
    const avgTxSize = 5;  // Assume avg 5 tokens per tx

    const canHandleEurcToUsdc = Math.floor(usdcMappingFloat / (avgTxSize * exchangeRate));
    const canHandleUsdcToEurc = Math.floor(eurcMappingFloat / (avgTxSize / exchangeRate));

    console.log(`\n  With current liquidity mapping:`);
    console.log(`     • Can handle ~${canHandleEurcToUsdc} EURC→USDC transactions (@${avgTxSize} EURC each)`);
    console.log(`     • Can handle ~${canHandleUsdcToEurc} USDC→EURC transactions (@${avgTxSize} USDC each)`);

    // Recommendations based on capacity
    console.log("\n" + "=".repeat(70));
    console.log("🎯 ACTION ITEMS:");
    console.log("=".repeat(70));

    if (overallHealth === "CRITICAL") {
        console.log("\n  🔴 CRITICAL - Action Required NOW:");
        console.log("     1. Run: npx hardhat run scripts/add-usdc-liquidity.js");
        console.log("     2. Or allocate more: npx hardhat run scripts/allocate-initial-liquidity.js");
        console.log("     3. Check why mapping is very low");
    } else if (overallHealth === "WARNING") {
        console.log("\n  🟡 WARNING - Action Recommended:");
        console.log("     1. Consider topping up liquidity in 1-2 days");
        console.log("     2. Monitor more frequently");
        console.log("     3. Prepare reserve for top-up");
    } else {
        console.log("\n  🟢 HEALTHY - Continue Monitoring:");
        console.log("     1. Check status at least once per day");
        console.log("     2. Prepare reserve for emergency");
        console.log("     3. Set up automated monitoring if possible");
    }

    console.log("\n  📝 General Tips:");
    console.log("     • Target: Keep utilization 60-80%");
    console.log("     • Reserve: Always keep 20-30% buffer in wallet");
    console.log("     • Monitor: Run this script daily");
    console.log("     • Rebalance: If net flow is too imbalanced");

    console.log("\n" + "=".repeat(70));
    console.log(`⏰ Last checked: ${new Date().toLocaleString()}`);
    console.log("=".repeat(70) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
