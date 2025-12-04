import hre from "hardhat";
const { ethers } = hre;
import fs from 'fs';
import path from 'path';

/**
 * Script to test a payment with REAL ARC tokens
 * 
 * Usage:
 * npx hardhat run scripts/test-payment.js --network arc-testnet
 */

// ARC Testnet Contract Addresses
const ARC_CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
};

async function main() {
  console.log("🧪 Testing PayerX with REAL ARC tokens...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Load deployment info
  const deploymentsDir = path.join(process.cwd(), 'deployments');
  const deploymentPath = path.join(deploymentsDir, 'arc-testnet.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found!");
    console.log("Please run deploy-arc.js first\n");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const payerXAddress = deploymentInfo.contracts.PayerX;
  const fxEngineAddress = deploymentInfo.contracts.MockFXEngine;
  
  console.log("🎯 PayerX address:", payerXAddress);
  console.log("🎯 FX Engine address:", fxEngineAddress, "\n");

  // Get contracts
  const PayerX = await ethers.getContractFactory("PayerX");
  const payerX = PayerX.attach(payerXAddress);
  
  const IERC20 = await ethers.getContractFactory("IERC20");
  const eurc = IERC20.attach(ARC_CONTRACTS.EURC);
  const usdc = IERC20.attach(ARC_CONTRACTS.USDC);

  // Check balances BEFORE
  console.log("💼 Balances BEFORE payment:");
  const eurcBalanceBefore = await eurc.balanceOf(deployer.address);
  const usdcBalanceBefore = await usdc.balanceOf(deployer.address);
  console.log("   EURC:", ethers.formatUnits(eurcBalanceBefore, 6));
  console.log("   USDC:", ethers.formatUnits(usdcBalanceBefore, 6), "\n");

  // Payment parameters
  const amountIn = ethers.parseUnits("10", 6); // Send 10 EURC
  const minAmountOut = ethers.parseUnits("10", 6); // Expect at least 10 USDC (1:1 rate minimum)
  const recipient = deployer.address; // Send to yourself for testing

  console.log("📤 Payment details:");
  console.log("   From:      ", deployer.address);
  console.log("   To:        ", recipient);
  console.log("   Token In:  ", "EURC");
  console.log("   Token Out: ", "USDC");
  console.log("   Amount In: ", ethers.formatUnits(amountIn, 6), "EURC");
  console.log("   Min Out:   ", ethers.formatUnits(minAmountOut, 6), "USDC\n");

  // Step 1: Approve PayerX to spend EURC
  console.log("✍️  Approving PayerX to spend EURC...");
  const approveTx = await eurc.approve(payerXAddress, amountIn);
  await approveTx.wait();
  console.log("✅ Approved\n");

  // Step 2: Execute payment
  console.log("⚡ Executing routeAndPay...");
  try {
    const tx = await payerX.routeAndPay(
      ARC_CONTRACTS.EURC,
      ARC_CONTRACTS.USDC,
      amountIn,
      minAmountOut,
      recipient
    );
    
    const receipt = await tx.wait();
    console.log("✅ Payment successful!");
    console.log("   Tx hash:", receipt.hash);
    console.log("   Gas used:", receipt.gasUsed.toString(), "\n");

    // Parse events
    const event = receipt.logs.find(log => {
      try {
        return payerX.interface.parseLog(log).name === 'PaymentRouted';
      } catch (e) {
        return false;
      }
    });

    if (event) {
      const parsed = payerX.interface.parseLog(event);
      console.log("📊 Payment details from event:");
      console.log("   Amount In:  ", ethers.formatUnits(parsed.args.amountIn, 6), "EURC");
      console.log("   Amount Out: ", ethers.formatUnits(parsed.args.amountOut, 6), "USDC");
      console.log("   Fee Amount: ", ethers.formatUnits(parsed.args.feeAmount, 6), "EURC\n");
    }

  } catch (error) {
    console.error("❌ Payment failed:", error.message);
    process.exit(1);
  }

  // Check balances AFTER
  console.log("💼 Balances AFTER payment:");
  const eurcBalanceAfter = await eurc.balanceOf(deployer.address);
  const usdcBalanceAfter = await usdc.balanceOf(deployer.address);
  console.log("   EURC:", ethers.formatUnits(eurcBalanceAfter, 6));
  console.log("   USDC:", ethers.formatUnits(usdcBalanceAfter, 6), "\n");

  // Calculate changes
  const eurcChange = eurcBalanceBefore - eurcBalanceAfter;
  const usdcChange = usdcBalanceAfter - usdcBalanceBefore;
  
  console.log("📈 Changes:");
  console.log("   EURC spent: ", ethers.formatUnits(eurcChange, 6));
  console.log("   USDC gained:", ethers.formatUnits(usdcChange, 6), "\n");

  console.log("═══════════════════════════════════════════════");
  console.log("🎉 Test Complete!");
  console.log("═══════════════════════════════════════════════");
  console.log("PayerX works perfectly with REAL ARC tokens! 🚀");
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
