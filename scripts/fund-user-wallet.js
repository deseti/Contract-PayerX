import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

/**
 * Fund user wallet with USDC and EURC before payment test
 */
async function main() {
    console.log("💰 Funding User Wallet...\n");

    const [deployer] = await hre.ethers.getSigners();
    const USER_WALLET = "0x75b0b8EFb946e2892Bc650311D28DEFfbe015Ea9";
    
    console.log("📝 Deployer:", deployer.address);
    console.log("📍 User Wallet:", USER_WALLET);
    console.log();

    // Get addresses
    const EURC = process.env.ARC_EURC;
    const USDC = process.env.ARC_USDC;

    // Get deployer balance
    const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Deployer balance:", hre.ethers.formatEther(deployerBalance), "ETH");
    console.log();

    // Send ETH to user for gas
    console.log("Sending ETH to user for gas fees...");
    const ethTx = await deployer.sendTransaction({
        to: USER_WALLET,
        value: hre.ethers.parseEther("1.0")
    });
    const ethReceipt = await ethTx.wait();
    console.log("✅ ETH sent at block", ethReceipt.blockNumber);
    console.log("   Tx:", ethTx.hash);
    console.log();

    // Send USDC to user
    console.log("Sending USDC to user...");
    const usdcABI = [
        "function transfer(address to, uint256 amount) external returns (bool)"
    ];
    
    const usdc = new hre.ethers.Contract(USDC, usdcABI, deployer);
    const usdcAmount = hre.ethers.parseUnits("100", 18);
    
    const usdcTx = await usdc.transfer(USER_WALLET, usdcAmount);
    const usdcReceipt = await usdcTx.wait();
    console.log("✅ USDC sent at block", usdcReceipt.blockNumber);
    console.log("   Amount:", hre.ethers.formatUnits(usdcAmount, 18), "USDC");
    console.log("   Tx:", usdcTx.hash);
    console.log();

    // Send EURC to user
    console.log("Sending EURC to user...");
    const eurcABI = [
        "function transfer(address to, uint256 amount) external returns (bool)"
    ];
    
    const eurc = new hre.ethers.Contract(EURC, eurcABI, deployer);
    const eurcAmount = hre.ethers.parseUnits("10", 6);
    
    const eurcTx = await eurc.transfer(USER_WALLET, eurcAmount);
    const eurcReceipt = await eurcTx.wait();
    console.log("✅ EURC sent at block", eurcReceipt.blockNumber);
    console.log("   Amount:", hre.ethers.formatUnits(eurcAmount, 6), "EURC");
    console.log("   Tx:", eurcTx.hash);
    console.log();

    console.log("✅ User wallet funded successfully!");
    console.log();
    console.log("Ready to execute payment flow.");
    console.log("Run: node scripts/full-payment-simple.js");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
