import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

/**
 * Update exchange rates in StableFXAdapter
 */
async function main() {
    console.log("🔄 Updating StableFXAdapter exchange rates...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Updating with account:", deployer.address);

    // Get addresses
    const ADAPTER_ADDRESS = process.env.STABLEFX_ADAPTER_ADDRESS;
    const USDC = process.env.ARC_USDC;
    const EURC = process.env.ARC_EURC;
    const USYC = process.env.ARC_USYC;

    console.log("📍 Updating rates for adapter:", ADAPTER_ADDRESS);
    console.log();

    // Get adapter contract
    const adapter = await hre.ethers.getContractAt("StableFXAdapter", ADAPTER_ADDRESS);

    // Current market rates (December 2025)
    const EUR_TO_USD_RATE = hre.ethers.parseUnits("1.09", 18); // 1 EURC = 1.09 USDC
    const USD_TO_EUR_RATE = hre.ethers.parseUnits("0.917", 18); // 1 USDC = 0.917 EURC
    const USDC_TO_USYC_RATE = hre.ethers.parseUnits("1.0", 18);
    const USYC_TO_USDC_RATE = hre.ethers.parseUnits("1.0", 18);
    const EUR_TO_USYC_RATE = EUR_TO_USD_RATE;
    const USYC_TO_EUR_RATE = USD_TO_EUR_RATE;

    console.log("📈 Updating exchange rates with current market data...");

    // Update EURC <-> USDC rates
    console.log("   Setting EURC -> USDC rate: 1.09");
    let tx = await adapter.setExchangeRate(EURC, USDC, EUR_TO_USD_RATE);
    await tx.wait();
    
    console.log("   Setting USDC -> EURC rate: 0.917");
    tx = await adapter.setExchangeRate(USDC, EURC, USD_TO_EUR_RATE);
    await tx.wait();

    // Update USDC <-> USYC rates
    console.log("   Setting USDC -> USYC rate: 1.0");
    tx = await adapter.setExchangeRate(USDC, USYC, USDC_TO_USYC_RATE);
    await tx.wait();
    
    console.log("   Setting USYC -> USDC rate: 1.0");
    tx = await adapter.setExchangeRate(USYC, USDC, USYC_TO_USDC_RATE);
    await tx.wait();

    // Update EURC <-> USYC rates
    console.log("   Setting EURC -> USYC rate: 1.09");
    tx = await adapter.setExchangeRate(EURC, USYC, EUR_TO_USYC_RATE);
    await tx.wait();
    
    console.log("   Setting USYC -> EURC rate: 0.917");
    tx = await adapter.setExchangeRate(USYC, EURC, USYC_TO_EUR_RATE);
    await tx.wait();

    console.log("\n✅ All exchange rates updated successfully!");
    console.log();
    console.log("📊 Current Market Rates:");
    console.log("   1 EURC = 1.09 USDC");
    console.log("   1 USDC = 0.917 EURC");
    console.log("   1 USDC = 1.0 USYC");
    console.log("   1 USYC = 1.0 USDC");
    console.log();
    console.log("⏰ Rates are fresh and valid for 5 minutes");
    console.log();
    console.log("💡 Now you can run payment tests:");
    console.log("   npx hardhat run scripts/test-external-payment.js --network arc-testnet");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Rate update failed:");
        console.error(error);
        process.exit(1);
    });