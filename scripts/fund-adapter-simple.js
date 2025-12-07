import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

/**
 * Fund StableFXAdapter with USDC liquidity - SIMPLE VERSION
 */
async function main() {
    console.log("💧 Funding StableFXAdapter with USDC liquidity...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Funding with account:", deployer.address);

    // Get addresses from .env
    const ADAPTER_ADDRESS = process.env.STABLEFX_ADAPTER_ADDRESS;
    const USDC = process.env.ARC_USDC; // 0x3600000000000000000000000000000000000000 (native)
    
    if (!ADAPTER_ADDRESS) {
        console.error("❌ STABLEFX_ADAPTER_ADDRESS not found in .env");
        process.exit(1);
    }

    console.log("📍 Adapter:", ADAPTER_ADDRESS);
    console.log("📍 USDC:", USDC);
    console.log();

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const balanceFormatted = hre.ethers.formatUnits(balance, 18);
    console.log("💰 Wallet balance:", balanceFormatted, "USDC (native)");
    console.log();

    // Amount to fund: 10 USDC (with 18 decimals for native USDC)
    const fundAmount = hre.ethers.parseUnits("10", 18);
    console.log("💰 Amount to fund:", hre.ethers.formatUnits(fundAmount, 18), "USDC");
    console.log();

    // Since USDC is native (0x3600...), we need to treat it specially
    // Native tokens are transferred directly
    console.log("Step 1: Approve USDC to Adapter");
    console.log("(Since this is native token, approval might not be needed)");
    console.log();

    try {
        // For native USDC, try to approve directly
        const usdcABI = [
            "function approve(address spender, uint256 amount) public returns (bool)",
            "function transfer(address to, uint256 amount) public returns (bool)"
        ];
        
        const usdc = new hre.ethers.Contract(USDC, usdcABI, deployer);
        
        console.log("Attempting direct transfer to adapter...");
        const tx = await usdc.transfer(ADAPTER_ADDRESS, fundAmount);
        const receipt = await tx.wait();
        
        console.log("✅ Transfer successful!");
        console.log("   Tx:", tx.hash);
        console.log("   Block:", receipt.blockNumber);
        console.log();

        // Call addLiquidity on adapter
        console.log("Step 2: Notify Adapter of added liquidity");
        const adapterABI = [
            "function getLiquidity(address token) external view returns (uint256)"
        ];
        
        const adapter = new hre.ethers.Contract(ADAPTER_ADDRESS, adapterABI, deployer);
        
        // Check current liquidity
        try {
            const currentLiquidity = await adapter.getLiquidity(USDC);
            console.log("✅ Current USDC liquidity in adapter:", 
                hre.ethers.formatUnits(currentLiquidity, 18), "USDC");
        } catch (err) {
            console.log("⚠️  Could not query current liquidity (contract may not implement it)");
        }
        
        console.log();
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ SUCCESS: Liquidity added to adapter!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log();
        console.log("Ready to execute payment with real market rates!");
        
    } catch (err) {
        console.error("❌ Funding failed:", err.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
