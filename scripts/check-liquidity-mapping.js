import hre from "hardhat";

async function main() {
    const ADAPTER_ADDRESS = "0x177030FBa1dE345F99C91ccCf4Db615E8016f75D";
    const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
    const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

    // Get adapter contract
    const StableFXAdapter = await hre.ethers.getContractFactory("StableFXAdapter");
    const adapter = StableFXAdapter.attach(ADAPTER_ADDRESS);

    // Check internal liquidity mapping
    const usdcLiquidity = await adapter.getLiquidity(USDC_ADDRESS);
    const eurcLiquidity = await adapter.getLiquidity(EURC_ADDRESS);

    console.log("\n=== StableFXAdapter Internal Liquidity Mapping ===");
    console.log(`USDC liquidity[]: ${hre.ethers.formatUnits(usdcLiquidity, 6)} USDC`);
    console.log(`EURC liquidity[]: ${hre.ethers.formatUnits(eurcLiquidity, 6)} EURC`);

    // Also check actual token balances
    const usdc = await hre.ethers.getContractAt("IERC20", USDC_ADDRESS);
    const eurc = await hre.ethers.getContractAt("IERC20", EURC_ADDRESS);

    const usdcBalance = await usdc.balanceOf(ADAPTER_ADDRESS);
    const eurcBalance = await eurc.balanceOf(ADAPTER_ADDRESS);

    console.log("\n=== Actual Token Balances ===");
    console.log(`USDC balance: ${hre.ethers.formatUnits(usdcBalance, 6)} USDC`);
    console.log(`EURC balance: ${hre.ethers.formatUnits(eurcBalance, 6)} EURC`);

    console.log("\n=== Comparison ===");
    console.log(`USDC - Mapping vs Balance: ${hre.ethers.formatUnits(usdcLiquidity, 6)} vs ${hre.ethers.formatUnits(usdcBalance, 6)}`);
    console.log(`EURC - Mapping vs Balance: ${hre.ethers.formatUnits(eurcLiquidity, 6)} vs ${hre.ethers.formatUnits(eurcBalance, 6)}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
