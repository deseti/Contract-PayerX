import hre from "hardhat";

async function main() {
    console.log("Updating WizPay to use StableFXAdapter...");
    const wizpayAddress = "0x87ACE45582f45cC81AC1E627E875AE84cbd75946";
    const adapterAddress = "0xA05921a4B0dbBF0232C5754e4A2341D6A0E77a3b";
    
    const wizpay = await hre.ethers.getContractAt("WizPay", wizpayAddress);
    
    console.log("Waiting for transaction...");
    const tx = await wizpay.updateFXEngine(adapterAddress);
    await tx.wait();
    
    console.log("✅ WizPay successfully pointed to new FX Engine!");
}
main().catch(console.error);
