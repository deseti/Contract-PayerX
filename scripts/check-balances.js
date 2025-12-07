import hre from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const EURC = process.env.ARC_EURC;
    const USDC = process.env.ARC_USDC;

    console.log("Account: " + deployer.address);
    console.log();

    // Get USDC balance
    const usdcABI = ["function balanceOf(address account) external view returns (uint256)", "function decimals() external view returns (uint8)"];
    const usdc = new hre.ethers.Contract(USDC, usdcABI, hre.ethers.provider);
    
    const usdcBalance = await usdc.balanceOf(deployer.address);
    console.log("USDC Balance: " + hre.ethers.formatUnits(usdcBalance, 18) + " (raw: " + usdcBalance.toString() + ")");

    // Get EURC balance
    const eurc = new hre.ethers.Contract(EURC, usdcABI, hre.ethers.provider);
    const eurcBalance = await eurc.balanceOf(deployer.address);
    const eurcDecimals = await eurc.decimals();
    console.log("EURC Balance: " + hre.ethers.formatUnits(eurcBalance, eurcDecimals) + " (raw: " + eurcBalance.toString() + ")");
}

main().catch(console.error);
