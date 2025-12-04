import hre from "hardhat";
const { ethers } = hre;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ═══════════════════════════════════════════════════════
// TEST PAYERX WITH AVAILABLE BALANCE
// ═══════════════════════════════════════════════════════

const ARC_RPC = "https://rpc.testnet.arc.network";
const DEPLOYER = "0x75b0b8EFb946e2892Bc650311D28DEFfbe015Ea9";

const ARC_CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
};

const DEPLOYMENT_INFO = {
  PayerX: "0x570b3d069b3350C54Ec5E78E8b2c2677ddb38C0C",
  MockFXEngine: "0xF1B0a3F0BE7dAB9f7107c028faC881291734D6de",
};

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("🧪 TESTING PAYERX WITH AVAILABLE BALANCE");
  console.log("═══════════════════════════════════════════════\n");

  // Create provider
  const provider = new ethers.JsonRpcProvider(ARC_RPC);
  
  // Get private key from environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey === "") {
    console.error("❌ Error: PRIVATE_KEY not set in .env file");
    console.log("Please add your private key to .env file");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("📝 Account:", wallet.address);
  console.log("🔐 Network: ARC Testnet\n");

  // Get token contracts
  const IERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address,uint256) returns (bool)",
    "function approve(address,uint256) returns (bool)",
    "function allowance(address,address) view returns (uint256)"
  ];

  const usdc = new ethers.Contract(ARC_CONTRACTS.USDC, IERC20_ABI, wallet);
  const eurc = new ethers.Contract(ARC_CONTRACTS.EURC, IERC20_ABI, wallet);
  const usyc = new ethers.Contract(ARC_CONTRACTS.USYC, IERC20_ABI, wallet);

  // ═══════════════════════════════════════════════════════
  // 1️⃣ CHECK CURRENT BALANCES
  // ═══════════════════════════════════════════════════════
  console.log("1️⃣  CHECKING BALANCES");
  console.log("─────────────────────\n");

  const usdcBalance = await usdc.balanceOf(wallet.address);
  const eurcBalance = await eurc.balanceOf(wallet.address);
  const usycBalance = await usyc.balanceOf(wallet.address);

  const usdcAmount = parseFloat(ethers.formatUnits(usdcBalance, 6));
  const eurcAmount = parseFloat(ethers.formatUnits(eurcBalance, 6));
  const usycAmount = parseFloat(ethers.formatUnits(usycBalance, 6));

  console.log("💼 Your balances:");
  console.log(`   USDC: ${usdcAmount.toFixed(6)} ✓`);
  console.log(`   EURC: ${eurcAmount.toFixed(6)} ✓`);
  console.log(`   USYC: ${usycAmount.toFixed(6)} ${usycAmount === 0 ? "❌" : "✓"}\n`);

  // ═══════════════════════════════════════════════════════
  // 2️⃣ FUND FXENGINE WITH AVAILABLE BALANCE
  // ═══════════════════════════════════════════════════════
  console.log("2️⃣  FUNDING FXENGINE");
  console.log("────────────────────\n");

  const fxEngineAddress = DEPLOYMENT_INFO.MockFXEngine;

  // Calculate amounts - use 50% of actual balance to leave buffer
  // Using BigInt directly from balances
  const usdcToFund = usdcBalance / 2n;  // 50% of USDC
  const eurcToFund = eurcBalance / 2n;  // 50% of EURC
  const usycToFund = usycBalance / 2n;  // 50% of USYC

  console.log("📤 Funding amounts (80% of balance):");
  console.log(`   USDC: ${ethers.formatUnits(usdcToFund, 6)}`);
  console.log(`   EURC: ${ethers.formatUnits(eurcToFund, 6)}`);
  if (usycAmount > 0) {
    console.log(`   USYC: ${ethers.formatUnits(usycToFund, 6)}`);
  }
  console.log();

  // Fund USDC
  if (usdcAmount > 0.1) {
    console.log("📮 Transferring USDC to FXEngine...");
    try {
      const tx1 = await usdc.transfer(fxEngineAddress, usdcToFund);
      const receipt1 = await tx1.wait();
      console.log(`✅ USDC transferred - Gas: ${receipt1.gasUsed.toString()}\n`);
    } catch (err) {
      console.log(`❌ USDC transfer failed: ${err.message}\n`);
    }
  }

  // Fund EURC
  if (eurcAmount > 0.1) {
    console.log("📮 Transferring EURC to FXEngine...");
    try {
      const tx2 = await eurc.transfer(fxEngineAddress, eurcToFund);
      const receipt2 = await tx2.wait();
      console.log(`✅ EURC transferred - Gas: ${receipt2.gasUsed.toString()}\n`);
    } catch (err) {
      console.log(`❌ EURC transfer failed: ${err.message}\n`);
    }
  }

  // Fund USYC
  if (usycAmount > 0.1) {
    console.log("📮 Transferring USYC to FXEngine...");
    try {
      const tx3 = await usyc.transfer(fxEngineAddress, usycToFund);
      const receipt3 = await tx3.wait();
      console.log(`✅ USYC transferred - Gas: ${receipt3.gasUsed.toString()}\n`);
    } catch (err) {
      console.log(`❌ USYC transfer failed: ${err.message}\n`);
    }
  }

  // ═══════════════════════════════════════════════════════
  // 3️⃣ TEST PAYMENT FLOW
  // ═══════════════════════════════════════════════════════
  console.log("3️⃣  TESTING PAYMENT FLOW");
  console.log("────────────────────────\n");

  // Get PayerX contract
  const PayerX_ABI = [
    "function routeAndPay(address,address,uint256,uint256,address) external returns (uint256)",
    "event PaymentRouted(address indexed sender, address indexed recipient, address indexed tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 feeAmount)"
  ];

  const payerX = new ethers.Contract(DEPLOYMENT_INFO.PayerX, PayerX_ABI, wallet);

  // Get remaining balance after funding
  const eurcBalanceAfterFunding = await eurc.balanceOf(wallet.address);
  const eurcAfterAmount = parseFloat(ethers.formatUnits(eurcBalanceAfterFunding, 6));

  if (eurcAfterAmount >= 0.1) {
    // Use 50% of remaining balance for payment test
    const paymentAmount = eurcBalanceAfterFunding / 2n;
    const minExpected = (eurcBalanceAfterFunding / 2n) * 90n / 100n; // 90% of expected (10% slippage buffer)

    console.log("📤 Payment parameters:");
    console.log(`   Token In:  EURC`);
    console.log(`   Token Out: USDC`);
    console.log(`   Amount In: ${ethers.formatUnits(paymentAmount, 6)} EURC`);
    console.log(`   Min Out:   ${ethers.formatUnits(minExpected, 6)} USDC\n`);

    console.log("⚡ Executing routeAndPay...");
    try {
      // Approve first
      console.log("✍️  Approving PayerX...");
      const approveTx = await eurc.approve(DEPLOYMENT_INFO.PayerX, paymentAmount);
      await approveTx.wait();
      console.log("✅ Approved\n");

      // Execute payment
      const tx = await payerX.routeAndPay(
        ARC_CONTRACTS.EURC,
        ARC_CONTRACTS.USDC,
        paymentAmount,
        minExpected,
        wallet.address
      );

      const receipt = await tx.wait();
      console.log(`✅ Payment successful!`);
      console.log(`   Tx Hash: ${receipt.hash}`);
      console.log(`   Gas Used: ${receipt.gasUsed.toString()}\n`);

      // Check new balances
      const eurcAfter = await eurc.balanceOf(wallet.address);
      const usdcAfter = await usdc.balanceOf(wallet.address);

      console.log("💼 Balances after payment:");
      console.log(`   EURC: ${ethers.formatUnits(eurcAfter, 6)}`);
      console.log(`   USDC: ${ethers.formatUnits(usdcAfter, 6)}\n`);

      const eurcSpent = ethers.formatUnits(eurcBalanceAfterFunding - eurcAfter, 6);
      const usdcGained = ethers.formatUnits(usdcAfter - await usdc.balanceOf(wallet.address), 6);

      console.log("📊 Transaction Results:");
      console.log(`   EURC spent: ${eurcSpent}`);
      console.log(`   USDC received: ${ethers.formatUnits(usdcAfter - (await usdc.balanceOf(wallet.address)), 6)}\n`);

    } catch (err) {
      console.log(`❌ Payment failed: ${err.message}\n`);
    }
  } else {
    console.log("⚠️  Not enough EURC remaining for payment test\n");
  }

  // ═══════════════════════════════════════════════════════
  // 4️⃣ FINAL SUMMARY
  // ═══════════════════════════════════════════════════════
  console.log("═══════════════════════════════════════════════");
  console.log("4️⃣  FINAL SUMMARY");
  console.log("═══════════════════════════════════════════════\n");

  const finalUSDC = await usdc.balanceOf(wallet.address);
  const finalEURC = await eurc.balanceOf(wallet.address);
  const finalUSYC = await usyc.balanceOf(wallet.address);

  const fxEngineUSDC = await usdc.balanceOf(fxEngineAddress);
  const fxEngineEURC = await eurc.balanceOf(fxEngineAddress);
  const fxEngineUSYC = await usyc.balanceOf(fxEngineAddress);

  console.log("👤 Your final balances:");
  console.log(`   USDC: ${ethers.formatUnits(finalUSDC, 6)}`);
  console.log(`   EURC: ${ethers.formatUnits(finalEURC, 6)}`);
  console.log(`   USYC: ${ethers.formatUnits(finalUSYC, 6)}\n`);

  console.log("🏦 FXEngine liquidity:");
  console.log(`   USDC: ${ethers.formatUnits(fxEngineUSDC, 6)}`);
  console.log(`   EURC: ${ethers.formatUnits(fxEngineEURC, 6)}`);
  console.log(`   USYC: ${ethers.formatUnits(fxEngineUSYC, 6)}\n`);

  console.log("═══════════════════════════════════════════════");
  console.log("✅ TEST COMPLETE!");
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
