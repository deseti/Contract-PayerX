import hre from "hardhat";

async function main() {
    console.log("Updating Exchange Rates (Refresh 5m limit)...");
    const adapterAddress = "0xd39d4e6e15000fb6039C491BEBfaf93dC9048F9F";
    const adapter = await hre.ethers.getContractAt("StableFXAdapter", adapterAddress);
    
    const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
    const USDC = "0x3600000000000000000000000000000000000000";
    const USYC = "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C";
    
    const rate1 = hre.ethers.parseUnits("1.09", 18); // EURC -> USDC
    const rate2 = hre.ethers.parseUnits("0.917", 18); // USDC -> EURC
    const rate1to1 = hre.ethers.parseUnits("1.0", 18);
    
    await adapter.setExchangeRate(EURC, USDC, rate1).then(t => t.wait());
    await adapter.setExchangeRate(USDC, EURC, rate2).then(t => t.wait());
    await adapter.setExchangeRate(USDC, USYC, rate1to1).then(t => t.wait());
    await adapter.setExchangeRate(USYC, USDC, rate1to1).then(t => t.wait());
    console.log("✅ Rates are fresh!");
}
main().catch(console.error);
