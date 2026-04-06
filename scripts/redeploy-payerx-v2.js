import hre from "hardhat";

/**
 * Redeploy PayerX with batchRouteAndPay, reconnect to existing StableFXAdapter,
 * re-fund adapter liquidity, and re-whitelist tokens.
 */
async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const ADAPTER = "0xd39d4e6e15000fb6039C491BEBfaf93dC9048F9F";
    const EURC    = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
    const USDC    = "0x3600000000000000000000000000000000000000";
    const USYC    = "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C";

    console.log("🚀 Re-deploying PayerX (v2 - with Batch Payout)...");
    console.log("   Account:", deployer.address);

    // Deploy new PayerX pointing to existing StableFXAdapter
    const PayerX = await hre.ethers.getContractFactory("PayerX");
    const payerx = await PayerX.deploy(ADAPTER, deployer.address, 10); // 10 bps fee
    await payerx.waitForDeployment();
    const newAddress = await payerx.getAddress();

    console.log("✅ PayerX v2 deployed to:", newAddress);

    // Whitelist tokens
    console.log("⚙️  Whitelisting tokens...");
    await payerx.batchSetTokenWhitelist([USDC, EURC, USYC], true).then(t => t.wait());
    await payerx.setWhitelistEnabled(true).then(t => t.wait());
    console.log("   ✅ USDC, EURC, USYC whitelisted");

    // Verify connection
    const engineAddr = await payerx.fxEngine();
    console.log("   FXEngine:", engineAddr);
    console.log("   Fee:", (await payerx.feeBps()).toString(), "bps");

    console.log("\n📋 IMPORTANT: Update your .env with:");
    console.log(`   PAYERX_ADDRESS=${newAddress}`);
    console.log("\n🎉 PayerX v2 is live with batchRouteAndPay!");
}

main().catch(console.error);
