import hre from "hardhat";

/**
 * Withdraw excess USDC from adapter (the 100 USDC that's not in liquidity mapping)
 * Then we can properly add it back using addLiquidity
 */

async function main() {
    const ADAPTER_ADDRESS = "0x177030FBa1dE345F99C91ccCf4Db615E8016f75D";
    const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
    const AMOUNT = "108.5"; // Withdraw the excess
    
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  Withdraw Excess USDC from Adapter                 ║");
    console.log("╚════════════════════════════════════════════════════╝\n");
    
    const [owner] = await hre.ethers.getSigners();
    
    // Get contracts
    const adapterAbi = [
        "function emergencyWithdraw(address token, uint256 amount) external"
    ];
    const adapter = await hre.ethers.getContractAt(adapterAbi, ADAPTER_ADDRESS);
    const usdc = await hre.ethers.getContractAt("IERC20", USDC_ADDRESS);
    
    const amount = hre.ethers.parseUnits(AMOUNT, 6);
    
    console.log(`Withdrawing ${AMOUNT} USDC from adapter...\n`);
    
    const tx = await adapter.emergencyWithdraw(USDC_ADDRESS, amount);
    await tx.wait();
    
    console.log(`✅ Withdrawn ${AMOUNT} USDC`);
    console.log(`   Tx: ${tx.hash}\n`);
    
    // Check balances
    const walletBalance = await usdc.balanceOf(owner.address);
    const adapterBalance = await usdc.balanceOf(ADAPTER_ADDRESS);
    
    console.log("📊 Updated Balances:");
    console.log(`   Wallet: ${hre.ethers.formatUnits(walletBalance, 6)} USDC`);
    console.log(`   Adapter: ${hre.ethers.formatUnits(adapterBalance, 6)} USDC\n`);
    
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  ✅ SUCCESS - Excess Withdrawn                     ║");
    console.log("╚════════════════════════════════════════════════════╝");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
