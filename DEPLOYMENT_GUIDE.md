# 🚀 PayerX ARC Testnet Deployment Guide

Panduan lengkap untuk deploy PayerX ke ARC Testnet dengan token asli dari Circle.

**Referensi**: https://docs.arc.network/arc/tutorials/deploy-on-arc

---

## 📋 Prerequisites

Sebelum mulai, pastikan sudah install:

```bash
# Node.js v16+ dan npm
node --version
npm --version

# Hardhat (sudah terinstall di project ini)
npx hardhat --version
```

---

## 🔑 Step 1: Generate Wallet Baru

Gunakan Foundry `cast` untuk generate wallet baru (pastikan Foundry sudah install):

```bash
# Install foundry (jika belum ada)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Generate wallet baru
cast wallet new
```

Output akan seperti ini:
```
Successfully created new keypair.
Address:     0xB815A0c4bC23930119324d4359dB65e27A846A2d
Private key: 0xcc1b30a6af68ea9a9917f1dd••••••••••••••••••••••••••••••••••••••97c5
```

---

## 💾 Step 2: Setup File `.env`

File `.env` sudah tersedia di project. Sekarang tinggal isi dengan data Anda:

### Opsi A: Manual Edit

1. Buka file `.env` di root project
2. Isi `PRIVATE_KEY` dengan key dari Step 1 (WITH `0x` prefix):
   ```
   PRIVATE_KEY=0xcc1b30a6af68ea9a9917f1dd••••••••••••••••••••••••••••••••••••••97c5
   ```
3. Simpan file

### Opsi B: Command Line (PowerShell)

```powershell
# Set private key
$privateKey = "0x..." # paste your private key here
(Get-Content .env) -replace 'PRIVATE_KEY=0x', "PRIVATE_KEY=$privateKey" | Set-Content .env
```

### Opsi C: Direct Edit

```bash
# Buka VS Code dan edit .env file
code .env
```

---

## 💰 Step 3: Get Testnet USDC dari Faucet

ARC Testnet menggunakan **USDC sebagai native gas token**. Anda perlu mendapatkan testnet USDC:

1. **Buka faucet**: https://faucet.circle.com
2. **Pilih network**: "Arc Testnet"
3. **Paste wallet address Anda** (dari Step 1, contoh: `0xB815A0c4bC23930119324d4359dB65e27A846A2d`)
4. **Request USDC** - kami rekomendasikan minta 1000+ USDC untuk headroom
5. **Tunggu konfirmasi** - biasanya instant atau maksimal 1 menit

### Verifikasi balance

```bash
# Menggunakan cast
cast balance 0xYourAddressHere --rpc-url https://rpc.testnet.arc.network

# Atau check di explorer
# https://testnet.arcscan.app/address/0xYourAddressHere
```

Jika balance kosong atau kurang, ulangi step faucet.

---

## 🚀 Step 4: Deploy ke ARC Testnet

Jalankan deployment script:

```bash
npx hardhat run scripts/deploy-arc.js --network arc-testnet
```

### Output yang diharapkan

```
🚀 Deploying PayerX to ARC Testnet...

📝 Deploying contracts with account: 0xB815A0c4bC23930119324d4359dB65e27A846A2d
💰 Account balance: 500 USDC

📦 Deploying MockFXEngine...
✅ MockFXEngine deployed to: 0x1234567890123456789012345678901234567890
⚙️  Setting exchange rates...
✅ Exchange rate set: 1 EURC = 1.1 USDC

📦 Deploying PayerX...
✅ PayerX deployed to: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
   Fee: 10 bps (0.10%)
   Fee Collector: 0xB815A0c4bC23930119324d4359dB65e27A846A2d

⚙️  Configuring token whitelist...
✅ Whitelisted: USDC, EURC, USYC
ℹ️  Whitelist is disabled (flexible mode)

═══════════════════════════════════════════════
🎉 Deployment Complete!
═══════════════════════════════════════════════
📍 Contract Addresses:
   PayerX:        0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
   MockFXEngine:  0x1234567890123456789012345678901234567890

🪙  ARC Testnet Tokens (REAL, not mock):
   USDC:          0x3600000000000000000000000000000000000000
   EURC:          0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
   USYC:          0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C

🔗 Network Info:
   Network:       ARC Testnet
   Chain ID:      5042002
   Explorer:      https://testnet.arcscan.app
   Faucet:        https://faucet.circle.com

📝 Next Steps:
   1. Get USDC/EURC/USYC from faucet
   2. Fund MockFXEngine with liquidity (transfer tokens)
   3. Test routeAndPay with REAL tokens
   4. Verify contracts on ArcScan
═══════════════════════════════════════════════
```

✅ **Sukses!** Contract sudah di-deploy. Save address PayerX dan MockFXEngine untuk testing.

---

## 💧 Step 5: Fund MockFXEngine dengan Token Asli

Sekarang kita perlu transfer token ASLI ARC ke MockFXEngine agar bisa execute swap:

### 5.1: Get token dari faucet

Kembali ke https://faucet.circle.com dan request:
- USDC (minimal 1000)
- EURC (minimal 1000)
- USYC (optional, minimal 1000)

### 5.2: Run funding script

```bash
npx hardhat run scripts/fund-fxengine.js --network arc-testnet
```

### Output yang diharapkan

```
💰 Funding MockFXEngine with REAL ARC tokens...

📝 Using account: 0xB815A0c4bC23930119324d4359dB65e27A846A2d
🎯 MockFXEngine address: 0x1234567890123456789012345678901234567890

💼 Your token balances:
   USDC: 500
   EURC: 200
   USYC: 100

📤 Transferring 1000 USDC to FX Engine...
✅ USDC transferred
📤 Transferring 1000 EURC to FX Engine...
✅ EURC transferred
📤 Transferring 1000 USYC to FX Engine...
✅ USYC transferred

═══════════════════════════════════════════════
🎉 Funding Complete!
═══════════════════════════════════════════════
FX Engine now has liquidity and ready to swap!

📝 Next: Test with routeAndPay function
═══════════════════════════════════════════════
```

---

## 🧪 Step 6: Test Payment dengan Token Asli

Sekarang test payment flow dengan token REAL ARC:

```bash
npx hardhat run scripts/test-payment.js --network arc-testnet
```

### Output yang diharapkan

```
🧪 Testing PayerX with REAL ARC tokens...

📝 Using account: 0xB815A0c4bC23930119324d4359dB65e27A846A2d
🎯 PayerX address: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
🎯 FX Engine address: 0x1234567890123456789012345678901234567890

💼 Balances BEFORE payment:
   EURC: 199
   USDC: 499

📤 Payment details:
   From:       0xB815A0c4bC23930119324d4359dB65e27A846A2d
   To:         0xB815A0c4bC23930119324d4359dB65e27A846A2d
   Token In:   EURC
   Token Out:  USDC
   Amount In:  10 EURC
   Min Out:    10 USDC

✍️  Approving PayerX to spend EURC...
✅ Approved

⚡ Executing routeAndPay...
✅ Payment successful!
   Tx hash: 0x...
   Gas used: 148420

📊 Payment details from event:
   Amount In:   10 EURC
   Amount Out:  11 USDC
   Fee Amount:  0.01 EURC

💼 Balances AFTER payment:
   EURC: 188.99
   USDC: 510

📈 Changes:
   EURC spent:  10.01
   USDC gained: 11

═══════════════════════════════════════════════
🎉 Test Complete!
═══════════════════════════════════════════════
PayerX works perfectly with REAL ARC tokens! 🚀
═══════════════════════════════════════════════
```

---

## ✅ Step 7: Verify di ArcScan Explorer

Lihat contract deployment Anda:

1. **Buka ArcScan**: https://testnet.arcscan.app
2. **Paste PayerX address** di search bar
3. **Verify details**:
   - Contract code visible
   - Deployment transaction confirmed
   - All functions accessible

---

## 🐛 Troubleshooting

### Error: "Insufficient USDC for gas fees"

**Solusi**: Get lebih banyak USDC dari faucet
```bash
# Check balance
cast balance 0xYourAddress --rpc-url https://rpc.testnet.arc.network
```

### Error: "Private key not found"

**Solusi**: Pastikan .env file ada dan PRIVATE_KEY terisi dengan `0x` prefix

### Error: "Network arc-testnet not found"

**Solusi**: Pastikan `hardhat.config.arc.js` ada di root project

### Transaction timeout

**Solusi**: Tunggu 1-2 menit, RPC testnet kadang lambat

### Token balance tidak berubah

**Solusi**: 
1. Check approval: `cast call USDC_ADDRESS "allowance(address,address)(uint256)" YourAddress PayerXAddress --rpc-url ...`
2. Check FX Engine balance: `cast call USDC_ADDRESS "balanceOf(address)(uint256)" FXEngineAddress --rpc-url ...`

---

## 📊 Network Info Reference

| Param | Value |
|-------|-------|
| Chain ID | 5042002 |
| RPC URL | https://rpc.testnet.arc.network |
| Gas Token | USDC (6 decimals) |
| Gas Price | 160 Gwei |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

---

## 🪙 ARC Testnet Stablecoins (REAL)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC | 0x3600000000000000000000000000000000000000 | 6 |
| EURC | 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a | 6 |
| USYC | 0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C | 6 |

---

## 📝 Deployment Info File

Setelah deploy, file `deployments/arc-testnet.json` berisi:

```json
{
  "network": "arc-testnet",
  "chainId": 5042002,
  "timestamp": "2025-12-04T...",
  "deployer": "0x...",
  "contracts": {
    "PayerX": "0x...",
    "MockFXEngine": "0x...",
    "RealUSDC": "0x3600000000000000000000000000000000000000",
    "RealEURC": "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    "RealUSYC": "0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C"
  },
  "config": {
    "feeBps": "10",
    "feeCollector": "0x...",
    "whitelistEnabled": false
  }
}
```

---

## 🎓 Next Steps (Phase 2)

Setelah berhasil deploy dengan Mock & Real tokens:

- [ ] Dapatkan StableFX API key dari Circle
- [ ] Create StableFXAdapter.sol
- [ ] Integrate dengan real StableFX (tidak pakai mock lagi)
- [ ] Test dengan real FX quotes
- [ ] Security audit sebelum mainnet

---

## ⚠️ Security Reminders

✅ **DO:**
- Keep `.env` file PRIVATE
- Add `.env` ke `.gitignore` (jangan commit)
- Use separate wallets untuk dev/test/prod
- Monitor gas prices
- Test thoroughly sebelum mainnet

❌ **DON'T:**
- Share private keys
- Commit `.env` ke git
- Use production wallet untuk testing
- Deploy unaudited code ke mainnet

---

## 📚 References

- [ARC Documentation](https://docs.arc.network)
- [ARC Deploy Guide](https://docs.arc.network/arc/tutorials/deploy-on-arc)
- [Circle Faucet](https://faucet.circle.com)
- [ArcScan Explorer](https://testnet.arcscan.app)
- [Hardhat Documentation](https://hardhat.org)

---

**Pertanyaan? Need help?** Check troubleshooting section atau refer ke official ARC docs.

Good luck! 🚀
