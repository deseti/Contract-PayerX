import hre from "hardhat";
const { ethers } = hre;
import fs from 'fs';
import path from 'path';

/**
 * Script to fund MockFXEngine with REAL ARC tokens
 * 
 * Usage:
 * 1. Deploy contracts first with: npx hardhat run scripts/deploy-arc.js --network arc-testnet
 * 2. Get USDC/EURC from: https://faucet.circle.com
 * 3. Run this script: npx hardhat run scripts/fund-fxengine.js --network arc-testnet
 */

// ARC Testnet Contract Addresses
const ARC_CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
};

async function main() {
  console.log("💰 Funding MockFXEngine with REAL ARC tokens...\n");

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
  const fxEngineAddress = deploymentInfo.contracts.MockFXEngine;
  
  console.log("🎯 MockFXEngine address:", fxEngineAddress, "\n");

  // Get token contracts (REAL ARC tokens) - use getContractAt instead
  const IERC20_ABI = ["function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)", "function approve(address,uint256) returns (bool)"];
  const usdc = await ethers.getContractAt(IERC20_ABI, ARC_CONTRACTS.USDC);
  const eurc = await ethers.getContractAt(IERC20_ABI, ARC_CONTRACTS.EURC);
  const usyc = await ethers.getContractAt(IERC20_ABI, ARC_CONTRACTS.USYC);

  // Check balances
  console.log("💼 Your token balances:");
  const usdcBalance = await usdc.balanceOf(deployer.address);
  const eurcBalance = await eurc.balanceOf(deployer.address);
  const usycBalance = await usyc.balanceOf(deployer.address);
  
  console.log("   USDC:", ethers.formatUnits(usdcBalance, 6));
  console.log("   EURC:", ethers.formatUnits(eurcBalance, 6));
  console.log("   USYC:", ethers.formatUnits(usycBalance, 6), "\n");

  // Amount to transfer (customize as needed)
  const fundAmount = ethers.parseUnits("1000", 6); // 1000 tokens each

  // Transfer USDC
  if (usdcBalance >= fundAmount) {
    console.log("📤 Transferring 1000 USDC to FX Engine...");
    const tx1 = await usdc.transfer(fxEngineAddress, fundAmount);
    await tx1.wait();
    console.log("✅ USDC transferred");
  } else {
    console.log("⚠️  Insufficient USDC balance (need 1000, have", ethers.formatUnits(usdcBalance, 6), ")");
  }

  // Transfer EURC
  if (eurcBalance >= fundAmount) {
    console.log("📤 Transferring 1000 EURC to FX Engine...");
    const tx2 = await eurc.transfer(fxEngineAddress, fundAmount);
    await tx2.wait();
    console.log("✅ EURC transferred");
  } else {
    console.log("⚠️  Insufficient EURC balance (need 1000, have", ethers.formatUnits(eurcBalance, 6), ")");
  }

  // Transfer USYC
  if (usycBalance >= fundAmount) {
    console.log("📤 Transferring 1000 USYC to FX Engine...");
    const tx3 = await usyc.transfer(fxEngineAddress, fundAmount);
    await tx3.wait();
    console.log("✅ USYC transferred");
  } else {
    console.log("⚠️  Insufficient USYC balance (need 1000, have", ethers.formatUnits(usycBalance, 6), ")");
  }

  console.log("\n═══════════════════════════════════════════════");
  console.log("🎉 Funding Complete!");
  console.log("═══════════════════════════════════════════════");
  console.log("FX Engine now has liquidity and ready to swap!");
  console.log("\n📝 Next: Test with routeAndPay function");
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Funding failed:", error);
    process.exit(1);
  });
