import hre from "hardhat";
const { ethers } = hre;

const ARC_RPC = "https://rpc.testnet.arc.network";
const DEPLOYER = "0x75b0b8EFb946e2892Bc650311D28DEFfbe015Ea9";

const ARC_CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  USYC: "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C",
};

async function main() {
  console.log(" Checking balances on ARC Testnet...\n");
  
  const provider = new ethers.JsonRpcProvider(ARC_RPC);
  const IERC20_ABI = ["function balanceOf(address) view returns (uint256)"];
  
  const usdc = new ethers.Contract(ARC_CONTRACTS.USDC, IERC20_ABI, provider);
  const eurc = new ethers.Contract(ARC_CONTRACTS.EURC, IERC20_ABI, provider);
  const usyc = new ethers.Contract(ARC_CONTRACTS.USYC, IERC20_ABI, provider);
  
  const usdcBalance = await usdc.balanceOf(DEPLOYER);
  const eurcBalance = await eurc.balanceOf(DEPLOYER);
  const usycBalance = await usyc.balanceOf(DEPLOYER);
  
  console.log(" Current balances:");
  console.log("   USDC:", ethers.formatUnits(usdcBalance, 6));
  console.log("   EURC:", ethers.formatUnits(eurcBalance, 6));
  console.log("   USYC:", ethers.formatUnits(usycBalance, 6));
  console.log("\n Summary:");
  console.log("   Total USDC available:", ethers.formatUnits(usdcBalance, 6));
}

main().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
