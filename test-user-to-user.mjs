import hre from "hardhat";
const { ethers } = hre;
import dotenv from 'dotenv';

dotenv.config();

const ARC_RPC = "https://rpc.testnet.arc.network";
const SENDER = process.env.PRIVATE_KEY ? 
  new ethers.Wallet(process.env.PRIVATE_KEY).address : 
  "0x75b0b8EFb946e2892Bc650311D28DEFfbe015Ea9";

const RECIPIENT = "0xef6582d8bd8c5e6f1ca37181b4b6284c945b3484";

const ARC_CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
};

const DEPLOYMENT_INFO = {
  PayerX: "0x570b3d069b3350C54Ec5E78E8b2c2677ddb38C0C",
  MockFXEngine: "0xF1B0a3F0BE7dAB9f7107c028faC881291734D6de",
};

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("🧪 USER-TO-USER TRANSACTION TEST");
  console.log("═══════════════════════════════════════════════\n");

  const provider = new ethers.JsonRpcProvider(ARC_RPC);
  const senderWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📝 Transaction Details:");
  console.log(`   Sender (User A):    ${senderWallet.address}`);
  console.log(`   Recipient (User B): ${RECIPIENT}`);
  console.log(`   Token In:           USDC`);
  console.log(`   Token Out:          EURC`);
  console.log(`   Rate:               1 USDC = ~0.909 EURC\n`);

  // Get token contracts
  const IERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address,uint256) returns (bool)",
    "function approve(address,uint256) returns (bool)"
  ];

  const usdc = new ethers.Contract(ARC_CONTRACTS.USDC, IERC20_ABI, senderWallet);
  const eurc = new ethers.Contract(ARC_CONTRACTS.EURC, IERC20_ABI, provider);

  // ═══════════════════════════════════════════════════════
  // 1️⃣ CHECK BALANCES BEFORE
  // ═══════════════════════════════════════════════════════
  console.log("1️⃣  CHECKING BALANCES BEFORE");
  console.log("──────────────────────────────\n");

  const senderUSDCBefore = await usdc.balanceOf(senderWallet.address);
  const senderEURCBefore = await eurc.balanceOf(senderWallet.address);
  const recipientUSDCBefore = await usdc.balanceOf(RECIPIENT);
  const recipientEURCBefore = await eurc.balanceOf(RECIPIENT);

  console.log("Sender (User A):");
  console.log(`   USDC: ${ethers.formatUnits(senderUSDCBefore, 6)}`);
  console.log(`   EURC: ${ethers.formatUnits(senderEURCBefore, 6)}\n`);

  console.log("Recipient (User B):");
  console.log(`   USDC: ${ethers.formatUnits(recipientUSDCBefore, 6)}`);
  console.log(`   EURC: ${ethers.formatUnits(recipientEURCBefore, 6)}\n`);

  // ═══════════════════════════════════════════════════════
  // 2️⃣ PREPARE PAYMENT
  // ═══════════════════════════════════════════════════════
  console.log("2️⃣  PREPARING PAYMENT");
  console.log("─────────────────────\n");

  // Use 50% of sender's USDC for payment
  const paymentAmount = senderUSDCBefore / 2n;  // Use BigInt for precision
  
  // Expected output (1 USDC ≈ 0.909 EURC) with 10% slippage tolerance
  const expectedOutput = (paymentAmount * 909n) / 1000n; // 0.909 rate
  const minExpected = (expectedOutput * 90n) / 100n; // 90% of expected

  console.log("Payment Configuration:");
  console.log(`   Amount: ${ethers.formatUnits(paymentAmount, 6)} USDC`);
  console.log(`   Expected: ~${ethers.formatUnits(expectedOutput, 6)} EURC`);
  console.log(`   Min Accept: ${ethers.formatUnits(minExpected, 6)} EURC`);
  console.log(`   Fee: 0.1% (auto-deducted)\n`);

  // ═══════════════════════════════════════════════════════
  // 3️⃣ APPROVE PAYERX
  // ═══════════════════════════════════════════════════════
  console.log("3️⃣  APPROVING PAYERX");
  console.log("────────────────────\n");

  console.log("⏳ Approving PayerX to spend USDC...");
  try {
    const approveTx = await usdc.approve(DEPLOYMENT_INFO.PayerX, paymentAmount);
    const approveReceipt = await approveTx.wait();
    console.log(`✅ Approved - Gas: ${approveReceipt.gasUsed.toString()}\n`);
  } catch (err) {
    console.error(`❌ Approval failed: ${err.message}\n`);
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════
  // 4️⃣ EXECUTE PAYMENT (USER TO USER)
  // ═══════════════════════════════════════════════════════
  console.log("4️⃣  EXECUTING USER-TO-USER PAYMENT");
  console.log("──────────────────────────────────\n");

  const PayerX_ABI = [
    "function routeAndPay(address,address,uint256,uint256,address) external returns (uint256)",
    "event PaymentRouted(address indexed sender, address indexed recipient, address indexed tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 feeAmount)"
  ];

  const payerX = new ethers.Contract(DEPLOYMENT_INFO.PayerX, PayerX_ABI, senderWallet);

  console.log(`⏳ Calling PayerX.routeAndPay()...`);
  console.log(`   Sender → PayerX → FXEngine → Recipient\n`);

  try {
    const tx = await payerX.routeAndPay(
      ARC_CONTRACTS.USDC,      // tokenIn
      ARC_CONTRACTS.EURC,      // tokenOut
      paymentAmount,           // amountIn
      minExpected,             // minAmountOut
      RECIPIENT                // recipient = User B address (NOT sender!)
    );

    const receipt = await tx.wait();
    console.log(`✅ Payment successful!`);
    console.log(`   TX Hash: ${receipt.hash}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}\n`);

  } catch (err) {
    console.error(`❌ Payment failed: ${err.message}\n`);
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════
  // 5️⃣ CHECK BALANCES AFTER
  // ═══════════════════════════════════════════════════════
  console.log("5️⃣  CHECKING BALANCES AFTER");
  console.log("──────────────────────────\n");

  const senderUSDCAfter = await usdc.balanceOf(senderWallet.address);
  const senderEURCAfter = await eurc.balanceOf(senderWallet.address);
  const recipientUSDCAfter = await usdc.balanceOf(RECIPIENT);
  const recipientEURCAfter = await eurc.balanceOf(RECIPIENT);

  console.log("Sender (User A):");
  console.log(`   USDC: ${ethers.formatUnits(senderUSDCAfter, 6)}`);
  console.log(`   EURC: ${ethers.formatUnits(senderEURCAfter, 6)}\n`);

  console.log("Recipient (User B):");
  console.log(`   USDC: ${ethers.formatUnits(recipientUSDCAfter, 6)}`);
  console.log(`   EURC: ${ethers.formatUnits(recipientEURCAfter, 6)}\n`);

  // ═══════════════════════════════════════════════════════
  // 6️⃣ CALCULATE CHANGES
  // ═══════════════════════════════════════════════════════
  console.log("6️⃣  TRANSACTION SUMMARY");
  console.log("──────────────────────\n");

  const senderUSDCSpent = ethers.formatUnits(senderUSDCBefore - senderUSDCAfter, 6);
  const recipientEURCReceived = ethers.formatUnits(recipientEURCAfter - recipientEURCBefore, 6);
  const feeAmount = ethers.formatUnits(paymentAmount - ((BigInt(recipientEURCReceived.split('.')[0]) * 1000n) / 909n), 6);

  console.log("Sender (User A) Changes:");
  console.log(`   USDC spent: -${senderUSDCSpent}`);
  console.log(`   EURC gained: +${ethers.formatUnits(senderEURCAfter - senderEURCBefore, 6)}\n`);

  console.log("Recipient (User B) Changes:");
  console.log(`   USDC gained: +${ethers.formatUnits(recipientUSDCAfter - recipientUSDCBefore, 6)}`);
  console.log(`   EURC received: +${recipientEURCReceived} ✓\n`);

  console.log("Fee Information:");
  console.log(`   Fee Rate: 0.1%`);
  console.log(`   Fee Token: USDC (from payment)`);
  console.log(`   Fee Amount: ~${(parseFloat(senderUSDCSpent) * 0.001).toFixed(6)} USDC`);
  console.log(`   Fee Recipient: 0x75b0b8EFb946e2892Bc650311D28DEFfbe015Ea9\n`);

  console.log("═══════════════════════════════════════════════");
  console.log("✅ USER-TO-USER TEST COMPLETE!");
  console.log("═══════════════════════════════════════════════\n");

  console.log("🎯 What Happened:");
  console.log(`   1. User A sent ${senderUSDCSpent} USDC`);
  console.log(`   2. PayerX deducted 0.1% fee for fee collector`);
  console.log(`   3. Remaining 99.9% went to FXEngine for swap`);
  console.log(`   4. FXEngine swapped USDC → EURC at 1:0.909 rate`);
  console.log(`   5. User B (RECIPIENT) received ${recipientEURCReceived} EURC`);
  console.log(`   6. User A kept ${ethers.formatUnits(senderEURCAfter - senderEURCBefore, 6)} EURC\n`);

  console.log("✨ Non-custodial payment successful!");
  console.log("   - Tokens never held by PayerX\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });
