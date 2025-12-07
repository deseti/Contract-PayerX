import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

/**
 * Complete Payment Flow with Liquidity Management
 * 1. Update real rate
 * 2. Add liquidity to adapter
 * 3. Execute payment
 */
async function main() {
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║  Complete Payment Flow with Real Rates and Liquidity Management ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Account:", deployer.address);
    console.log();

    // Get addresses from .env
    const PAYERX_ADDRESS = process.env.PAYERX_ADDRESS;
    const ADAPTER_ADDRESS = process.env.STABLEFX_ADAPTER_ADDRESS;
    const EURC = process.env.ARC_EURC;
    const USDC = process.env.ARC_USDC;
    const USER_WALLET = "0x75b0b8EFb946e2892Bc650311D28DEFfbe015Ea9";

    console.log("📍 Contract Addresses:");
    console.log("   PayerX:", PAYERX_ADDRESS);
    console.log("   Adapter:", ADAPTER_ADDRESS);
    console.log("   EURC:", EURC);
    console.log("   USDC:", USDC);
    console.log("   User:", USER_WALLET);
    console.log();

    // Get contract instances
    const adapterABI = [
        "function setExchangeRate(address tokenIn, address tokenOut, uint256 rate) external",
        "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address to) external returns (uint256)",
        "function addLiquidity(address token, uint256 amount) external",
        "function liquidity(address token) external view returns (uint256)",
        "function getExchangeRate(address tokenIn, address tokenOut) external view returns (uint256)"
    ];

    const payerxABI = [
        "function routeAndPay(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address recipient) external",
        "function fxEngine() external view returns (address)"
    ];

    const erc20ABI = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function balanceOf(address account) external view returns (uint256)",
        "function transfer(address to, uint256 amount) external returns (bool)",
        "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
    ];

    const adapter = new hre.ethers.Contract(ADAPTER_ADDRESS, adapterABI, deployer);
    const payerx = new hre.ethers.Contract(PAYERX_ADDRESS, payerxABI, deployer);
    const eurc = new hre.ethers.Contract(EURC, erc20ABI, deployer);
    const usdc = new hre.ethers.Contract(USDC, erc20ABI, deployer);

    // ============================================================
    // Step 1: Update Real Market Rate
    // ============================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 1: Update Real Market Rate");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();

    try {
        console.log("🔄 Fetching real EUR/USD from Exchangerate-API...");
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/EUR");
        const data = await response.json();
        const realRate = data.rates.USD;
        console.log("✅ Real rate: 1 EUR = " + realRate.toFixed(4) + " USD");
        console.log();

        const rateInWei = hre.ethers.parseUnits(realRate.toFixed(4), 18);
        console.log("Setting rate on adapter...");
        const rateTx = await adapter.setExchangeRate(EURC, USDC, rateInWei);
        const rateReceipt = await rateTx.wait();
        console.log("✅ Rate updated at block", rateReceipt.blockNumber);
        console.log("   Tx:", rateTx.hash);
        console.log();
    } catch (err) {
        console.error("❌ Failed to update rate:", err.message);
        process.exit(1);
    }

    // ============================================================
    // Step 2: Check and Add Liquidity
    // ============================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 2: Manage Liquidity");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();

    try {
        // Check current liquidity
        console.log("Checking current adapter liquidity...");
        try {
            const currentLiquidity = await adapter.liquidity(USDC);
            console.log("✅ Current USDC liquidity:", hre.ethers.formatUnits(currentLiquidity, 18));
        } catch (err) {
            console.log("⚠️  Could not query liquidity mapping");
        }
        console.log();

        // Get deployer USDC balance
        const deployerBalance = await usdc.balanceOf(deployer.address);
        console.log("💰 Deployer USDC balance:", hre.ethers.formatUnits(deployerBalance, 18));
        console.log();

        // Add liquidity if needed
        if (deployerBalance > hre.ethers.parseUnits("5", 18)) {
            const fundAmount = hre.ethers.parseUnits("20", 18);
            console.log("Adding liquidity to adapter:", hre.ethers.formatUnits(fundAmount, 18), "USDC");
            
            // Approve adapter
            const approveTx = await usdc.approve(ADAPTER_ADDRESS, fundAmount);
            await approveTx.wait();
            console.log("✅ Approved");
            
            // Add liquidity
            const addLiqTx = await adapter.addLiquidity(USDC, fundAmount);
            const addLiqReceipt = await addLiqTx.wait();
            console.log("✅ Liquidity added at block", addLiqReceipt.blockNumber);
            console.log("   Tx:", addLiqTx.hash);
        } else {
            console.log("⚠️  Insufficient USDC balance to add liquidity");
        }
        console.log();
    } catch (err) {
        console.error("❌ Liquidity management failed:", err.message);
    }

    // ============================================================
    // Step 3: Impersonate user and execute payment
    // ============================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 3: Execute Payment from User Wallet");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log();

    try {
        // Impersonate user
        console.log("Impersonating user wallet:", USER_WALLET);
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [USER_WALLET],
        });
        
        const userSigner = await hre.ethers.getSigner(USER_WALLET);
        console.log("✅ User wallet ready");
        console.log();

        // Get user balances
        console.log("Checking user balances...");
        const userEURC = await eurc.balanceOf(USER_WALLET);
        const userUSDC = await usdc.balanceOf(USER_WALLET);
        console.log("   EURC:", hre.ethers.formatUnits(userEURC, 6));
        console.log("   USDC:", hre.ethers.formatUnits(userUSDC, 18));
        console.log();

        // Approve PayerX
        const paymentAmount = hre.ethers.parseUnits("1", 6); // 1 EURC
        console.log("Approving PayerX to spend EURC...");
        const userEurc = eurc.connect(userSigner);
        const approveTx = await userEurc.approve(PAYERX_ADDRESS, paymentAmount);
        const approveReceipt = await approveTx.wait();
        console.log("✅ Approved at block", approveReceipt.blockNumber);
        console.log("   Tx:", approveTx.hash);
        console.log();

        // Execute payment
        console.log("Executing payment...");
        const minOutput = hre.ethers.parseUnits("1.1", 18); // With slippage
        const userPayerx = payerx.connect(userSigner);
        
        const paymentTx = await userPayerx.routeAndPay(
            EURC,
            USDC,
            paymentAmount,
            minOutput,
            USER_WALLET
        );
        
        const paymentReceipt = await paymentTx.wait();
        console.log("✅ Payment executed at block", paymentReceipt.blockNumber);
        console.log("   Tx:", paymentTx.hash);
        console.log();

        // Check final balances
        console.log("Checking final balances...");
        const finalEURC = await eurc.balanceOf(USER_WALLET);
        const finalUSDC = await usdc.balanceOf(USER_WALLET);
        console.log("   EURC:", hre.ethers.formatUnits(finalEURC, 6), "(was " + hre.ethers.formatUnits(userEURC, 6) + ")");
        console.log("   USDC:", hre.ethers.formatUnits(finalUSDC, 18), "(was " + hre.ethers.formatUnits(userUSDC, 18) + ")");
        console.log();

        console.log("╔════════════════════════════════════════════════════════════════╗");
        console.log("║  ✅ PAYMENT SUCCESSFUL WITH REAL MARKET RATES!                ║");
        console.log("╚════════════════════════════════════════════════════════════════╝");
        console.log();
        console.log("📊 Summary:");
        console.log("  Input: 1 EURC");
        console.log("  Output: ~1.16 USDC (from real market data)");
        console.log("  Rate Source: Official Exchangerate-API");
        console.log();

    } catch (err) {
        console.error("❌ Payment execution failed:");
        console.error(err.message);
        if (err.data) {
            console.error("Data:", err.data);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
