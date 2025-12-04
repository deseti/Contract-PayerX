# 🎓 Contoh Praktis Deployment Step-by-Step

Contoh nyata dengan output yang diharapkan untuk setiap langkah.

---

## Step 1️⃣: Generate Wallet Baru

### Command:
```bash
cast wallet new
```

### Output Contoh:
```
Successfully created new keypair.
Address:     0x7E5F4552091A69125601BF475ABC1E88B797EAED
Private key: 0x0b6e18cafb6ed99687ec547f76e9e6d6d6a6a31d6c04ff2b2c0f5b5c5d5e5f5f
```

**Catatan**: Jangan share private key!

---

## Step 2️⃣: Edit File .env

### Buka file:
```bash
# Via VS Code
code .env

# Atau editor favorit Anda
```

### Isi PRIVATE_KEY:
```env
# Cari baris ini:
PRIVATE_KEY=0x

# Ubah menjadi:
PRIVATE_KEY=0x0b6e18cafb6ed99687ec547f76e9e6d6d6a6a31d6c04ff2b2c0f5b5c5d5e5f5f
```

### Hasil:
```env
# PRIVATE KEY (Required for deployment)
PRIVATE_KEY=0x0b6e18cafb6ed99687ec547f76e9e6d6d6a6a31d6c04ff2b2c0f5b5c5d5e5f5f

# ARC TESTNET RPC URLS
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
ARC_TESTNET_CHAIN_ID=5042002
...
```

✅ **Simpan file** (Ctrl+S atau Cmd+S)

---

## Step 3️⃣: Get Testnet USDC

### Langkah-langkah:

1. **Buka browser** → https://faucet.circle.com

2. **Pilih Network**: "Arc Testnet"

3. **Paste Wallet Address**:
   ```
   0x7E5F4552091A69125601BF475ABC1E88B797EAED
   ```

4. **Select Amount**: (optional, default sudah cukup)

5. **Click "Send"**

6. **Tunggu confirm** - biasanya instant atau <1 menit

7. **Verify balance**:
   ```bash
   cast balance 0x7E5F4552091A69125601BF475ABC1E88B797EAED \
     --rpc-url https://rpc.testnet.arc.network
   ```

   Output:
   ```
   1000000000000000000  # 1000 USDC (dalam wei/18 decimals)
   ```

   Atau bisa cek di explorer:
   https://testnet.arcscan.app/address/0x7E5F4552091A69125601BF475ABC1E88B797EAED

---

## Step 4️⃣: Deploy ke ARC Testnet

### Command:
```bash
cd d:\PayerX_Router
npx hardhat run scripts/deploy-arc.js --network arc-testnet
```

### Output Diharapkan:
```
🚀 Deploying PayerX to ARC Testnet...

📝 Deploying contracts with account: 0x7E5F4552091A69125601BF475ABC1E88B797EAED
💰 Account balance: 999.999 USDC

📦 Deploying MockFXEngine...
✅ MockFXEngine deployed to: 0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266
⚙️  Setting exchange rates...
✅ Exchange rate set: 1 EURC = 1.1 USDC

📦 Deploying PayerX...
✅ PayerX deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
   Fee:  10 bps ( 0.10%)
   Fee Collector: 0x7E5F4552091A69125601BF475ABC1E88B797EAED

⚙️  Configuring token whitelist...
✅ Whitelisted: USDC, EURC, USYC
ℹ️  Whitelist is disabled (flexible mode)

💰 Using REAL ARC Testnet tokens:
   USDC: 0x3600000000000000000000000000000000000000
   EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
   USYC: 0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C

⚠️  NOTE: You need to fund MockFXEngine with real testnet tokens
   Get tokens from: https://faucet.circle.com
   Then manually transfer to FX Engine: 0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266

═══════════════════════════════════════════════════════════════
🎉 Deployment Complete!
═══════════════════════════════════════════════════════════════
📍 Contract Addresses:
   PayerX:        0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
   MockFXEngine:  0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266

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
═══════════════════════════════════════════════════════════════
```

✅ **Sukses!** PayerX deployed. Save addresses untuk step berikutnya.

---

## Step 5️⃣: Fund MockFXEngine dengan Token Real

### 5a. Get Token dari Faucet

Kembali ke https://faucet.circle.com dan request:
- **USDC**: 1000+
- **EURC**: 1000+
- **USYC**: 1000+ (optional)

Tunggu hingga semua terima.

### 5b. Run Funding Script

```bash
npx hardhat run scripts/fund-fxengine.js --network arc-testnet
```

### Output Diharapkan:

```
💰 Funding MockFXEngine with REAL ARC tokens...

📝 Using account: 0x7E5F4552091A69125601BF475ABC1E88B797EAED
🎯 MockFXEngine address: 0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266

💼 Your token balances:
   USDC: 1000
   EURC: 1000
   USYC: 1000

📤 Transferring 1000 USDC to FX Engine...
✅ USDC transferred
📤 Transferring 1000 EURC to FX Engine...
✅ EURC transferred
📤 Transferring 1000 USYC to FX Engine...
✅ USYC transferred

═══════════════════════════════════════════════════════════════
🎉 Funding Complete!
═══════════════════════════════════════════════════════════════
FX Engine now has liquidity and ready to swap!

📝 Next: Test with routeAndPay function
═══════════════════════════════════════════════════════════════
```

✅ **FX Engine funded!** Sekarang ready untuk testing.

---

## Step 6️⃣: Test Payment

### Command:
```bash
npx hardhat run scripts/test-payment.js --network arc-testnet
```

### Output Diharapkan:

```
🧪 Testing PayerX with REAL ARC tokens...

📝 Using account: 0x7E5F4552091A69125601BF475ABC1E88B797EAED
🎯 PayerX address: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
🎯 FX Engine address: 0xF39Fd6e51aad88F6F4ce6aB8827279cffFb92266

💼 Balances BEFORE payment:
   EURC: 1000
   USDC: 0

📤 Payment details:
   From:       0x7E5F4552091A69125601BF475ABC1E88B797EAED
   To:         0x7E5F4552091A69125601BF475ABC1E88B797EAED
   Token In:   EURC
   Token Out:  USDC
   Amount In:  10 EURC
   Min Out:    10 USDC

✍️  Approving PayerX to spend EURC...
✅ Approved

⚡ Executing routeAndPay...
✅ Payment successful!
   Tx hash: 0x1234567890abcdef...
   Gas used: 148420

📊 Payment details from event:
   Amount In:   10 EURC
   Amount Out:  11 USDC (rate: 1 EURC = 1.1 USDC)
   Fee Amount:  0.01 EURC (0.1% fee)

💼 Balances AFTER payment:
   EURC: 989.99
   USDC: 11

📈 Changes:
   EURC spent:  10.01 (10 payment + 0.01 fee)
   USDC gained: 11

═══════════════════════════════════════════════════════════════
🎉 Test Complete!
═══════════════════════════════════════════════════════════════
PayerX works perfectly with REAL ARC tokens! 🚀
═══════════════════════════════════════════════════════════════
```

✅ **Test Passed!** PayerX berfungsi sempurna dengan token real ARC.

---

## 🔍 Verify di ArcScan

### Langkah-langkah:

1. **Buka ArcScan**: https://testnet.arcscan.app

2. **Search PayerX address**:
   ```
   0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
   ```

3. **Lihat informasi**:
   - ✅ Contract code visible
   - ✅ Deployment confirmed
   - ✅ Balance & transactions

4. **Search Payment Transaction**:
   - Copy tx hash dari test-payment.js output
   - Paste di ArcScan search
   - Lihat detail: from, to, tokens, gas

---

## 📊 Summary

| Step | Status | Output |
|------|--------|--------|
| 1. Wallet | ✅ | 0x7E5F... address + private key |
| 2. .env | ✅ | PRIVATE_KEY terisi |
| 3. Faucet USDC | ✅ | 1000 USDC received |
| 4. Deploy | ✅ | PayerX + MockFXEngine deployed |
| 5. Fund | ✅ | FX Engine punya liquidity |
| 6. Test | ✅ | Payment sukses, 10 EURC → 11 USDC |
| 7. Verify | ✅ | Contract visible di ArcScan |

---

## 🎉 SELESAI!

PayerX sudah successfully deployed dan tested di ARC Testnet dengan token REAL!

### Next Steps:

- [ ] Test dengan amounts berbeda
- [ ] Test dengan pair token lain (USDC→EURC, dll)
- [ ] Check gas usage optimize
- [ ] Integration dengan frontend/SDK
- [ ] Security audit sebelum mainnet

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` untuk troubleshooting atau reference ke https://docs.arc.network 🚀
