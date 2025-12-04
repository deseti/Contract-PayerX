import hre from "hardhat";
const { ethers } = hre;
import dotenv from 'dotenv';

dotenv.config();

const ARC_RPC = "https://rpc.testnet.arc.network";
const FX_ENGINE = "0xF1B0a3F0BE7dAB9f7107c028faC881291734D6de";

const ARC_CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
};

async function main() {
  const provider = new ethers.JsonRpcProvider(ARC_RPC);
  const IERC20_ABI = ["function balanceOf(address) view returns (uint256)"];

  console.log(" VERIFYING FXEngine LIQUIDITY");
  console.log("\n");
  
  const usdc = new ethers.Contract(ARC_CONTRACTS.USDC, IERC20_ABI, provider);
  const eurc = new ethers.Contract(ARC_CONTRACTS.EURC, IERC20_ABI, provider);
  const usyc = new ethers.Contract(ARC_CONTRACTS.USYC, IERC20_ABI, provider);

  const usdcBalance = await usdc.balanceOf(FX_ENGINE);
  const eurcBalance = await eurc.balanceOf(FX_ENGINE);
  const usycBalance = await usyc.balanceOf(FX_ENGINE);

  console.log(" FXEngine: " + FX_ENGINE);
  console.log("\n Liquidity Pool:");
  console.log("   USDC: " + ethers.formatUnits(usdcBalance, 6) + " ");
  console.log("   EURC: " + ethers.formatUnits(eurcBalance, 6) + " ");
  console.log("   USYC: " + ethers.formatUnits(usycBalance, 6) + " " + (ethers.formatUnits(usycBalance, 6) == "0.0" ? "" : ""));
  
  console.log("\n Transfer sudah masuk ke kontrak!");
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
