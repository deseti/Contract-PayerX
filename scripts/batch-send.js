import hre from "hardhat";

/**
 * Batch send tokens to multiple recipients simultaneously
 * 
 * Usage:
 * Set RECIPIENTS and AMOUNTS arrays, then run:
 * npx hardhat run scripts/batch-send.js --network arc-testnet
 */

async function main() {
    const TOKEN_ADDRESS = "0x3600000000000000000000000000000000000000"; // USDC
    
    // Recipients and amounts
    const RECIPIENTS = [
        "0x48d3eF068e43a7ce548d929Ae5af0F2134487c62",
        "0xa871d14AdBa4eacbD1fd63F5BD13fE0D80198b65",
        "0x32F251fc36A1174901124589EAC2d4E391816F69",
        "0xDBD909c86F8e76055EafAE373290410B0952D0b4"
    ];
    
    const AMOUNT_PER_RECIPIENT = "5"; // 5 USDC each
    
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  Batch Send - Multiple Recipients                  ║");
    console.log("╚════════════════════════════════════════════════════╝\n");
    
    const [sender] = await hre.ethers.getSigners();
    console.log(`👤 Sender: ${sender.address}`);
    console.log(`💰 Amount per recipient: ${AMOUNT_PER_RECIPIENT} USDC`);
    console.log(`📊 Total recipients: ${RECIPIENTS.length}`);
    console.log(`💸 Total amount: ${parseFloat(AMOUNT_PER_RECIPIENT) * RECIPIENTS.length} USDC\n`);
    
    // Get token contract
    const token = await hre.ethers.getContractAt("IERC20", TOKEN_ADDRESS);
    const decimals = 6; // USDC decimals
    
    // Check balance
    const balance = await token.balanceOf(sender.address);
    const totalNeeded = hre.ethers.parseUnits(AMOUNT_PER_RECIPIENT, decimals) * BigInt(RECIPIENTS.length);
    
    console.log(`Current balance: ${hre.ethers.formatUnits(balance, decimals)} USDC`);
    console.log(`Total needed: ${hre.ethers.formatUnits(totalNeeded, decimals)} USDC\n`);
    
    if (balance < totalNeeded) {
        console.log("❌ Insufficient balance!");
        process.exit(1);
    }
    
    console.log("📤 Sending to all recipients in batch...\n");
    
    // Send transfers in sequence (to avoid nonce conflicts)
    const amount = hre.ethers.parseUnits(AMOUNT_PER_RECIPIENT, decimals);
    const txs = [];
    
    for (let i = 0; i < RECIPIENTS.length; i++) {
        const recipient = RECIPIENTS[i];
        console.log(`  [${i + 1}/${RECIPIENTS.length}] Sending to ${recipient}...`);
        const tx = await token.transfer(recipient, amount);
        await tx.wait();
        txs.push(tx);
        console.log(`  ✅ [${i + 1}/${RECIPIENTS.length}] Success - Tx: ${tx.hash}`);
        console.log(`     View: https://testnet.arcscan.app/tx/${tx.hash}\n`);
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL TRANSFERS COMPLETED!");
    console.log("=".repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   • Recipients: ${RECIPIENTS.length}`);
    console.log(`   • Amount each: ${AMOUNT_PER_RECIPIENT} USDC`);
    console.log(`   • Total sent: ${parseFloat(AMOUNT_PER_RECIPIENT) * RECIPIENTS.length} USDC`);
    console.log(`\n🔗 Transactions:`);
    txs.forEach((tx, i) => {
        console.log(`   ${i + 1}. ${RECIPIENTS[i].substring(0, 10)}... - ${tx.hash}`);
    });
    console.log("\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
