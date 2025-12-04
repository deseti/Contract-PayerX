# 🚀 PayerX Quick Deploy Reference

Ringkasan cepat untuk deploy PayerX ke ARC Testnet.

---

## ⚡ Quick Start (5 Menit)

### 1️⃣ Generate Wallet
```bash
cast wallet new
# Copy PRIVATE_KEY (with 0x prefix)
```

### 2️⃣ Setup .env
```bash
# Edit .env file
# Add PRIVATE_KEY=0x...
```

### 3️⃣ Get Testnet USDC
Visit: https://faucet.circle.com
- Select "Arc Testnet"
- Paste wallet address
- Request USDC (1000+ recommended)

### 4️⃣ Deploy
```bash
npx hardhat run scripts/deploy-arc.js --network arc-testnet
```

### 5️⃣ Fund FX Engine
```bash
npx hardhat run scripts/fund-fxengine.js --network arc-testnet
```

### 6️⃣ Test Payment
```bash
npx hardhat run scripts/test-payment.js --network arc-testnet
```

---

## 📋 Checklist

- [ ] Node.js v16+ installed
- [ ] Generated new wallet with `cast wallet new`
- [ ] Private key added to `.env` (with `0x` prefix)
- [ ] Got testnet USDC from faucet (~1000+)
- [ ] Ran `deploy-arc.js` successfully
- [ ] Ran `fund-fxengine.js` successfully
- [ ] Ran `test-payment.js` successfully
- [ ] Verified PayerX on ArcScan

---

## 🔗 Important URLs

| Purpose | URL |
|---------|-----|
| Faucet | https://faucet.circle.com |
| Explorer | https://testnet.arcscan.app |
| RPC | https://rpc.testnet.arc.network |
| Docs | https://docs.arc.network |

---

## 🪙 Token Addresses

```
USDC: 0x3600000000000000000000000000000000000000
EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
USYC: 0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C
```

---

## 📱 Network Config

```
Chain ID: 5042002
Gas Token: USDC
Gas Price: 160 Gwei
Block Time: ~2 seconds
```

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| No USDC balance | Get from faucet again |
| Private key error | Make sure it has `0x` prefix |
| Deploy fails | Check USDC balance is >100 |
| Token not found | Verify token address in .env |

---

## 📖 Full Documentation

Read `DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions.

---

Done! 🎉
