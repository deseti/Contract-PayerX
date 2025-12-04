import hre from "hardhat";
const { ethers } = hre;
import dotenv from 'dotenv';

dotenv.config();

const ARC_RPC = "https://rpc.testnet.arc.network";

const ARC_CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
};

const FX_ENGINE = "0xF1B0a3F0BE7dAB9f7107c028faC881291734D6de";

async function main() {
  const provider = new ethers.JsonRpcProvider(ARC_RPC);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log(" Setting exchange rate: 1 USDC = ~0.909 EURC\n");

  const FXEngine_ABI = ["function setExchangeRate(address,address,uint256) external"];
  const fxEngine = new ethers.Contract(FX_ENGINE, FXEngine_ABI, wallet);

  // Rate: 1 USDC = 0.909090909... EURC (18 decimals precision)
  // 0.909090909... = 909090909090909090 / 10^18
  const rate = ethers.parseEther("0.909090909090909090");

  console.log(" Setting exchange rate...");
  try {
    const tx = await fxEngine.setExchangeRate(
      ARC_CONTRACTS.USDC,
      ARC_CONTRACTS.EURC,
      rate
    );
    const receipt = await tx.wait();
    console.log(` Exchange rate set! Gas: ${receipt.gasUsed.toString()}\n`);
  } catch (err) {
    console.error(` Failed: ${err.message}`);
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
