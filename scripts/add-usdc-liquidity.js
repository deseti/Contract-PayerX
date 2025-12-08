import hre from "hardhat";

async function main() {
    const ADAPTER_ADDRESS = "0x177030FBa1dE345F99C91ccCf4Db615E8016f75D";
    const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

    const [signer] = await hre.ethers.getSigners();
    console.log(`Using signer: ${signer.address}`);

    // Get contracts
    const adapter = await hre.ethers.getContractAt("StableFXAdapter", ADAPTER_ADDRESS);
    const usdc = await hre.ethers.getContractAt("IERC20", USDC_ADDRESS);

    // Check current state
    const currentLiquidity = await adapter.getLiquidity(USDC_ADDRESS);
    const actualBalance = await usdc.balanceOf(ADAPTER_ADDRESS);
    const signerBalance = await usdc.balanceOf(signer.address);

    console.log("\n=== Current State ===");
    console.log(`Adapter USDC liquidity[]: ${hre.ethers.formatUnits(currentLiquidity, 6)} USDC`);
    console.log(`Adapter actual balance: ${hre.ethers.formatUnits(actualBalance, 6)} USDC`);
    console.log(`Gap (untracked): ${hre.ethers.formatUnits(actualBalance - currentLiquidity, 6)} USDC`);
    console.log(`Your USDC balance: ${hre.ethers.formatUnits(signerBalance, 6)} USDC`);

    // Add 5 USDC to liquidity mapping
    const amountToAdd = hre.ethers.parseUnits("5", 6);
    
    console.log("\n=== Adding 5 USDC to liquidity mapping ===");
    
    // Approve adapter to spend USDC
    console.log("Approving USDC...");
    const approveTx = await usdc.approve(ADAPTER_ADDRESS, amountToAdd);
    await approveTx.wait();
    console.log(`Approved: ${approveTx.hash}`);

    // Add liquidity
    console.log("Adding liquidity...");
    const addTx = await adapter.addLiquidity(USDC_ADDRESS, amountToAdd);
    await addTx.wait();
    console.log(`✅ Added liquidity: ${addTx.hash}`);

    // Check new state
    const newLiquidity = await adapter.getLiquidity(USDC_ADDRESS);
    const newBalance = await usdc.balanceOf(ADAPTER_ADDRESS);

    console.log("\n=== New State ===");
    console.log(`Adapter USDC liquidity[]: ${hre.ethers.formatUnits(newLiquidity, 6)} USDC`);
    console.log(`Adapter actual balance: ${hre.ethers.formatUnits(newBalance, 6)} USDC`);
    console.log(`Improvement: +${hre.ethers.formatUnits(newLiquidity - currentLiquidity, 6)} USDC in mapping`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
