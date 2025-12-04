import hre from "hardhat";
const { ethers } = hre;
import dotenv from 'dotenv';

dotenv.config();

const ARC_RPC = "https://rpc.testnet.arc.network";

const ARC_CONTRACTS = {
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
};

const FX_ENGINE = "0xF1B0a3F0BE7dAB9f7107c028faC881291734D6de";

async function main() {
  const provider = new ethers.JsonRpcProvider(ARC_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const IERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address,uint256) returns (bool)"
  ];

  const eurc = new ethers.Contract(ARC_CONTRACTS.EURC, IERC20_ABI, wallet);

  // Check balance
  const userBalance = await eurc.balanceOf(wallet.address);
  const fxBalance = await eurc.balanceOf(FX_ENGINE);

  console.log(`User EURC: ${ethers.formatUnits(userBalance, 6)}`);
  console.log(`FXEngine EURC: ${ethers.formatUnits(fxBalance, 6)}\n`);

  // Transfer more EURC to FXEngine
  const transferAmount = ethers.parseUnits("1", 6); // 1 EURC
  
  if (userBalance >= transferAmount) {
    console.log(` Transferring 1 EURC to FXEngine...\n`);
    const tx = await eurc.transfer(FX_ENGINE, transferAmount);
    const receipt = await tx.wait();
    console.log(` Transferred! Gas: ${receipt.gasUsed.toString()}\n`);

    const newBalance = await eurc.balanceOf(FX_ENGINE);
    console.log(`FXEngine new EURC balance: ${ethers.formatUnits(newBalance, 6)}`);
  } else {
    console.log(" Not enough EURC");
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
