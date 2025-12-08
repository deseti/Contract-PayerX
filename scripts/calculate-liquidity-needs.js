import hre from "hardhat";

/**
 * Script to calculate liquidity requirements based on transaction volume
 * 
 * Usage:
 * npx hardhat run scripts/calculate-liquidity-needs.js --network arc-testnet
 */

async function main() {
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  Liquidity Requirements Calculator                 ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    // ============================================
    // INPUT: Estimated daily transaction volume
    // ============================================
    const DAILY_TRANSACTIONS = {
        // Estimate: how many user swaps per day?
        eurc_to_usdc: 10,  // 10 EURC -> USDC transactions per day
        usdc_to_eurc: 10,  // 10 USDC -> EURC transactions per day
        
        // Estimate: average amount per transaction
        avg_eurc_per_tx: 5,   // average 5 EURC per transaction
        avg_usdc_per_tx: 5,   // average 5 USDC per transaction
    };

    const EXCHANGE_RATE = 1.16;  // 1 EUR = 1.16 USD
    const SAFETY_BUFFER = 1.5;   // 50% safety buffer
    const DAYS_TO_COVER = 7;     // How many days to cover without top-up
    // ============================================

    console.log("📊 Calculation Assumptions:");
    console.log("─".repeat(55));
    console.log(`  • EURC->USDC transactions per day: ${DAILY_TRANSACTIONS.eurc_to_usdc}`);
    console.log(`  • USDC->EURC transactions per day: ${DAILY_TRANSACTIONS.usdc_to_eurc}`);
    console.log(`  • Average EURC per transaction: ${DAILY_TRANSACTIONS.avg_eurc_per_tx} EURC`);
    console.log(`  • Average USDC per transaction: ${DAILY_TRANSACTIONS.avg_usdc_per_tx} USDC`);
    console.log(`  • Exchange rate: 1 EUR = ${EXCHANGE_RATE} USD`);
    console.log(`  • Safety buffer: ${(SAFETY_BUFFER - 1) * 100}%`);
    console.log(`  • Target coverage: ${DAYS_TO_COVER} days`);

    // ===================================
    // Calculate Requirements
    // ===================================
    console.log("\n💡 Liquidity Requirements Calculation:");
    console.log("─".repeat(55));

    // Daily volume
    const daily_eurc_in = DAILY_TRANSACTIONS.eurc_to_usdc * DAILY_TRANSACTIONS.avg_eurc_per_tx;
    const daily_usdc_out_for_eurc = daily_eurc_in * EXCHANGE_RATE;
    
    const daily_usdc_in = DAILY_TRANSACTIONS.usdc_to_eurc * DAILY_TRANSACTIONS.avg_usdc_per_tx;
    const daily_eurc_out_for_usdc = daily_usdc_in / EXCHANGE_RATE;

    console.log("\n📈 Daily Transaction Volume:");
    console.log(`  EURC->USDC: ${daily_eurc_in} EURC in, ${daily_usdc_out_for_eurc.toFixed(2)} USDC out`);
    console.log(`  USDC->EURC: ${daily_usdc_in} USDC in, ${daily_eurc_out_for_usdc.toFixed(2)} EURC out`);

    // Net flow per day
    const net_eurc_flow = daily_eurc_in - daily_eurc_out_for_usdc;
    const net_usdc_flow = daily_usdc_in - daily_usdc_out_for_eurc;

    console.log("\n📊 Daily Net Flow:");
    console.log(`  EURC: ${net_eurc_flow > 0 ? '+' : ''}${net_eurc_flow.toFixed(2)} EURC (${net_eurc_flow > 0 ? 'increasing' : 'decreasing'})`);
    console.log(`  USDC: ${net_usdc_flow > 0 ? '+' : ''}${net_usdc_flow.toFixed(2)} USDC (${net_usdc_flow > 0 ? 'increasing' : 'decreasing'})`);

    // Requirements for N days
    const eurc_needed = Math.max(
        daily_eurc_out_for_usdc * DAYS_TO_COVER,  // For USDC->EURC swaps
        daily_eurc_in * DAYS_TO_COVER              // For buffer
    );
    
    const usdc_needed = Math.max(
        daily_usdc_out_for_eurc * DAYS_TO_COVER,  // For EURC->USDC swaps
        daily_usdc_in * DAYS_TO_COVER              // For buffer
    );

    const eurc_with_buffer = eurc_needed * SAFETY_BUFFER;
    const usdc_with_buffer = usdc_needed * SAFETY_BUFFER;

    console.log(`\n💰 Liquidity Requirements for ${DAYS_TO_COVER} Days:`);
    console.log(`  EURC: ${eurc_needed.toFixed(2)} EURC (minimum)`);
    console.log(`  USDC: ${usdc_needed.toFixed(2)} USDC (minimum)`);

    console.log(`\n🛡️  With Safety Buffer ${(SAFETY_BUFFER - 1) * 100}%:`);
    console.log(`  EURC: ${eurc_with_buffer.toFixed(2)} EURC (recommended)`);
    console.log(`  USDC: ${usdc_with_buffer.toFixed(2)} USDC (recommended)`);

    // ===================================
    // Allocation Recommendations
    // ===================================
    console.log("\n" + "=".repeat(55));
    console.log("📋 ALLOCATION RECOMMENDATIONS:");
    console.log("=".repeat(55));

    const usdc_to_allocate = Math.ceil(usdc_with_buffer / 100) * 100;  // Round up to 100
    const eurc_to_allocate = Math.ceil(eurc_with_buffer / 100) * 100;

    console.log("\n✅ If you have 1000 USDC + 1000 EURC:");
    console.log("\n  Scenario 1: CONSERVATIVE (Most Safe)");
    console.log("  ─────────────────────────────────────");
    console.log("    Allocate to adapter:");
    console.log("      • 800 USDC -> adapter (80%)");
    console.log("      • 800 EURC -> adapter (80%)");
    console.log("    Keep in wallet:");
    console.log("      • 200 USDC reserve (20%)");
    console.log("      • 200 EURC reserve (20%)");
    console.log("    Best for: High volume, safety first");

    console.log("\n  Scenario 2: BALANCED (Recommended)");
    console.log("  ─────────────────────────────────────");
    console.log("    Allocate to adapter:");
    console.log("      • 700 USDC -> adapter (70%)");
    console.log("      • 700 EURC -> adapter (70%)");
    console.log("    Keep in wallet:");
    console.log("      • 300 USDC reserve (30%)");
    console.log("      • 300 EURC reserve (30%)");
    console.log("    Best for: Medium volume, balanced risk");

    console.log("\n  Scenario 3: EFFICIENT (More Efficient)");
    console.log("  ─────────────────────────────────────");
    console.log("    Allocate to adapter:");
    console.log(`      • ${usdc_to_allocate} USDC -> adapter`);
    console.log(`      • ${eurc_to_allocate} EURC -> adapter`);
    console.log("    Keep in wallet:");
    console.log(`      • ${1000 - usdc_to_allocate} USDC reserve`);
    console.log(`      • ${1000 - eurc_to_allocate} EURC reserve`);
    console.log(`    Best for: Volume = ${DAILY_TRANSACTIONS.eurc_to_usdc + DAILY_TRANSACTIONS.usdc_to_eurc} tx/day`);

    // ===================================
    // Capacity Calculation
    // ===================================
    console.log("\n" + "=".repeat(55));
    console.log("📊 SYSTEM CAPACITY WITH 700/700 ALLOCATION:");
    console.log("=".repeat(55));

    const allocated_usdc = 700;
    const allocated_eurc = 700;

    // How many swaps can be handled?
    const max_eurc_to_usdc_txs = Math.floor(allocated_usdc / (DAILY_TRANSACTIONS.avg_eurc_per_tx * EXCHANGE_RATE));
    const max_usdc_to_eurc_txs = Math.floor(allocated_eurc / (DAILY_TRANSACTIONS.avg_usdc_per_tx / EXCHANGE_RATE));

    console.log(`\nWith liquidity ${allocated_usdc} USDC + ${allocated_eurc} EURC:`);
    console.log(`  • Can handle ~${max_eurc_to_usdc_txs} EURC->USDC transactions (${DAILY_TRANSACTIONS.avg_eurc_per_tx} EURC each)`);
    console.log(`  • Can handle ~${max_usdc_to_eurc_txs} USDC->EURC transactions (${DAILY_TRANSACTIONS.avg_usdc_per_tx} USDC each)`);
    console.log(`  • Sufficient for ~${Math.floor(max_eurc_to_usdc_txs / DAILY_TRANSACTIONS.eurc_to_usdc)} days of operation without top-up`);

    // ===================================
    // Tips Monitoring
    // ===================================
    console.log("\n" + "=".repeat(55));
    console.log("💡 MONITORING & MAINTENANCE TIPS:");
    console.log("=".repeat(55));
    console.log("\n1. Check liquidity daily:");
    console.log("   npx hardhat run scripts/check-liquidity-mapping.js --network arc-testnet");
    
    console.log("\n2. Top-up if liquidity < 30% of initial allocation:");
    console.log("   • USDC < 210 -> add liquidity");
    console.log("   • EURC < 210 -> add liquidity");

    console.log("\n3. Rebalance if net flow is too imbalanced:");
    console.log("   • If USDC keeps increasing, EURC decreasing -> internal swap");
    console.log("   • If EURC keeps increasing, USDC decreasing -> internal swap");

    console.log("\n4. Set alert thresholds:");
    console.log("   • Warning: < 40% liquidity remaining");
    console.log("   • Critical: < 20% liquidity remaining");

    console.log("\n" + "=".repeat(55));
    console.log("✅ Use allocate-initial-liquidity.js script");
    console.log("   to start allocation now!");
    console.log("=".repeat(55) + "\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
