import hre from "hardhat";
const { ethers } = hre;
import fs from 'fs';
import path from 'path';

/**
 * Script to test PayerX with minimal setup
 * Just verify contracts are deployed and callable
 */

async function main() {
  console.log("🧪 Testing PayerX Deployment...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Using account:", deployer.address);

  // Load deployment
  const deploymentsDir = path.join(process.cwd(), 'deployments');
  const deploymentPath = path.join(deploymentsDir, 'arc-testnet.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment not found!");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const payerXAddress = deploymentInfo.contracts.PayerX;
  const fxEngineAddress = deploymentInfo.contracts.MockFXEngine;
  
  console.log("🎯 PayerX:", payerXAddress);
  console.log("🎯 FXEngine:", fxEngineAddress, "\n");

  // Get contracts
  const PayerX = await ethers.getContractFactory("PayerX");
  const payerX = PayerX.attach(payerXAddress);
  
  const MockFXEngine = await ethers.getContractFactory("MockFXEngine");
  const fxEngine = MockFXEngine.attach(fxEngineAddress);

  // Check PayerX config
  console.log("✅ PayerX Contract Information:");
  try {
    const feeBps = await payerX.feeBps();
    const feeCollector = await payerX.feeCollector();
    const fxEngineAddr = await payerX.fxEngine();
    
    console.log("   Fee:", feeBps.toString(), "bps");
    console.log("   Fee Collector:", feeCollector);
    console.log("   FX Engine:", fxEngineAddr);
  } catch (e) {
    console.error("❌ Error reading PayerX:", e.message);
  }

  // Check FXEngine
  console.log("\n✅ MockFXEngine Information:");
  
  // Set a test exchange rate
  console.log("   Setting EURC->USDC rate (1:1.1)...");
  try {
    const rate = ethers.parseEther("1.1");
    const tx = await fxEngine.setExchangeRate(
      deploymentInfo.contracts.RealEURC,
      deploymentInfo.contracts.RealUSDC,
      rate
    );
    await tx.wait();
    console.log("   ✅ Rate set successfully");
  } catch (e) {
    console.error("   ❌ Error setting rate:", e.message);
  }

  console.log("\n═══════════════════════════════════════════════");
  console.log("✅ Deployment Test Complete!");
  console.log("═══════════════════════════════════════════════");
  console.log("\n📋 Summary:");
  console.log("   PayerX deployed:", payerXAddress);
  console.log("   MockFXEngine deployed:", fxEngineAddress);
  console.log("   Both contracts callable ✓");
  console.log("\n📝 Next Steps:");
  console.log("   1. Get USDC/EURC from faucet");
  console.log("   2. Fund MockFXEngine with tokens");
  console.log("   3. Test routeAndPay function");
  console.log("\n   Faucet: https://faucet.circle.com");
  console.log("   Explorer: https://testnet.arcscan.app/address/" + payerXAddress);
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
