import hre from "hardhat";

/**
 * Get EURC from Circle testnet faucet or mint EURC tokens
 * Then add to adapter liquidity
 */

async function main() {
    const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
    const ADAPTER_ADDRESS = "0x177030FBa1dE345F99C91ccCf4Db615E8016f75D";
    
    console.log("╔════════════════════════════════════════════════════╗");
    console.log("║  Get EURC and Add to Adapter Liquidity             ║");
    console.log("╚════════════════════════════════════════════════════╝\n");
    
    const [owner] = await hre.ethers.getSigners();
    console.log(`👤 Owner: ${owner.address}\n`);
    
    // Check if EURC has a mint function (for testnet)
    const eurcAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function mint(address to, uint256 amount) external",
        "function approve(address spender, uint256 amount) external returns (bool)"
    ];
    
    const eurc = await hre.ethers.getContractAt(eurcAbi, EURC_ADDRESS);
    
    // Try to mint 50 EURC
    const amount = hre.ethers.parseUnits("50", 6);
    
    console.log("💰 Attempting to mint 50 EURC...\n");
    
    try {
        const mintTx = await eurc.mint(owner.address, amount);
        await mintTx.wait();
        console.log(`✅ Minted 50 EURC`);
        console.log(`   Tx: ${mintTx.hash}\n`);
        
        // Check balance
        const balance = await eurc.balanceOf(owner.address);
        console.log(`📊 EURC Balance: ${hre.ethers.formatUnits(balance, 6)} EURC\n`);
        
        // Add to adapter liquidity
        console.log("📊 Adding EURC to adapter liquidity...");
        const adapterAbi = [
            "function addLiquidity(address token, uint256 amount) external"
        ];
        const adapter = await hre.ethers.getContractAt(adapterAbi, ADAPTER_ADDRESS);
        
        // Approve
        const approveTx = await eurc.approve(ADAPTER_ADDRESS, amount);
        await approveTx.wait();
        console.log(`✅ Approved adapter to spend EURC`);
        
        // Add liquidity
        const addLiqTx = await adapter.addLiquidity(EURC_ADDRESS, amount);
        await addLiqTx.wait();
        console.log(`✅ Added 50 EURC to adapter liquidity`);
        console.log(`   Tx: ${addLiqTx.hash}\n`);
        
        console.log("╔════════════════════════════════════════════════════╗");
        console.log("║  ✅ SUCCESS - EURC Added to Adapter                ║");
        console.log("╚════════════════════════════════════════════════════╝");
        
    } catch (error) {
        console.log("❌ Cannot mint EURC (not available on this testnet)");
        console.log("\nAlternative solutions:");
        console.log("1. Get EURC from Circle testnet faucet");
        console.log("2. Bridge EURC from another network");
        console.log("3. Contact ARC testnet support for EURC tokens\n");
        console.log("Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
