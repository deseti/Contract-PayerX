import hre from "hardhat";

/**
 * Add USDC liquidity to StableFXAdapter
 * This transfers USDC from your wallet to the adapter and updates the liquidity mapping
 */

async function main() {
    const ADAPTER_ADDRESS = "0x177030FBa1dE345F99C91ccCf4Db615E8016f75D";
    const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
    const AMOUNT = "65"; // 65 USDC (~50% of wallet balance)
    
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  Add USDC Liquidity to StableFXAdapter             ║");
    console.log("╚════════════════════════════════════════════════════╝\n");
    
    const [owner] = await hre.ethers.getSigners();
    console.log(`👤 Owner: ${owner.address}`);
    console.log(`💰 Amount: ${AMOUNT} USDC\n`);
    
    // Get contracts
    const adapterAbi = [
        "function addLiquidity(address token, uint256 amount) external",
        "function getLiquidity(address token) external view returns (uint256)"
    ];
    const adapter = await hre.ethers.getContractAt(adapterAbi, ADAPTER_ADDRESS);
    const usdc = await hre.ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    // Check balance
    const balance = await usdc.balanceOf(owner.address);
    const amount = hre.ethers.parseUnits(AMOUNT, 6);
    
    console.log(`Current USDC balance: ${hre.ethers.formatUnits(balance, 6)} USDC`);
    console.log(`Amount to add: ${AMOUNT} USDC\n`);
    
    if (balance < amount) {
        console.log("❌ Insufficient USDC balance!");
        process.exit(1);
    }
    
    // Step 1: Approve adapter to spend USDC
    console.log("📝 Step 1: Approving USDC to adapter...");
    const approveTx = await usdc.approve(ADAPTER_ADDRESS, amount);
    await approveTx.wait();
    console.log(`✅ Approved ${AMOUNT} USDC to adapter`);
    console.log(`   Tx: ${approveTx.hash}\n`);
    
    // Step 2: Add to liquidity (this will do transferFrom)
    console.log("📊 Step 2: Adding to liquidity mapping...");
    const addLiqTx = await adapter.addLiquidity(USDC_ADDRESS, amount);
    await addLiqTx.wait();
    console.log(`✅ Added ${AMOUNT} USDC to liquidity mapping`);
    console.log(`   Tx: ${addLiqTx.hash}\n`);
    
    // Verify
    console.log("🔍 Verifying liquidity...");
    const newAdapterBalance = await usdc.balanceOf(ADAPTER_ADDRESS);
    console.log(`Adapter USDC balance: ${hre.ethers.formatUnits(newAdapterBalance, 6)} USDC`);
    
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║  ✅ SUCCESS - USDC Liquidity Added                 ║");
    console.log("╚════════════════════════════════════════════════════╝");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
