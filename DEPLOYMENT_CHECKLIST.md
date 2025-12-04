# 🎯 PAYERX DEPLOYMENT - FINAL CHECKLIST

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code & Compilation
- [x] Project downloaded/cloned
- [x] `npm install` run (dependencies installed)
- [x] `npx hardhat compile` successful (10 contracts compiled)
- [x] `npx hardhat test` successful (23/23 tests passing)

### Configuration
- [x] `hardhat.config.arc.js` exists
- [x] `.env` file created
- [x] `.env.example` available as reference
- [x] Deployment scripts ready:
  - [x] `scripts/deploy-arc.js`
  - [x] `scripts/fund-fxengine.js`
  - [x] `scripts/test-payment.js`

### Documentation
- [x] `DEPLOYMENT_GUIDE.md` - detailed step-by-step
- [x] `QUICK_DEPLOY.md` - 5-minute quick start
- [x] `EXAMPLE_DEPLOYMENT.md` - practical examples with output

---

## 🚀 READY TO DEPLOY CHECKLIST

### Before Starting
- [ ] Foundry installed (`cast wallet new` works)
- [ ] Private key generated and copied
- [ ] .env file ready to edit
- [ ] Testnet USDC in wallet (minimal: 100, recommended: 1000+)

### Step-by-Step
1. [ ] **Generate Wallet**
   - Command: `cast wallet new`
   - Copy: Address + Private Key (with 0x)

2. [ ] **Edit .env**
   - Open: `d:\PayerX_Router\.env`
   - Fill: `PRIVATE_KEY=0x...` (paste from step 1)
   - Save: Ctrl+S or Cmd+S

3. [ ] **Get Testnet USDC**
   - Visit: https://faucet.circle.com
   - Select: "Arc Testnet"
   - Paste: Wallet address
   - Request: 1000+ USDC
   - Wait: ~1 minute for confirmation

4. [ ] **Deploy Contracts**
   - Command: `npx hardhat run scripts/deploy-arc.js --network arc-testnet`
   - Save: PayerX address + FXEngine address

5. [ ] **Fund FX Engine**
   - Get: USDC, EURC, USYC from faucet (1000+ each)
   - Command: `npx hardhat run scripts/fund-fxengine.js --network arc-testnet`

6. [ ] **Test Payment**
   - Command: `npx hardhat run scripts/test-payment.js --network arc-testnet`
   - Verify: Output shows successful swap

7. [ ] **Verify on ArcScan**
   - Visit: https://testnet.arcscan.app
   - Search: PayerX address
   - Verify: Code visible, deployment confirmed

---

## 📋 COMMANDS QUICK REFERENCE

```bash
# 1. Generate wallet
cast wallet new

# 2. (Edit .env with PRIVATE_KEY from above)

# 3. (Get USDC from faucet)

# 4. Deploy
npx hardhat run scripts/deploy-arc.js --network arc-testnet

# 5. Fund FX Engine (after getting USDC/EURC/USYC)
npx hardhat run scripts/fund-fxengine.js --network arc-testnet

# 6. Test
npx hardhat run scripts/test-payment.js --network arc-testnet

# 7. Optional: Check deployment info
cat deployments/arc-testnet.json
```

---

## 🔗 IMPORTANT URLS

| Purpose | URL |
|---------|-----|
| **Faucet** | https://faucet.circle.com |
| **Explorer** | https://testnet.arcscan.app |
| **RPC** | https://rpc.testnet.arc.network |
| **Docs** | https://docs.arc.network |
| **ARC Deploy Guide** | https://docs.arc.network/arc/tutorials/deploy-on-arc |

---

## 🪙 ARC TESTNET TOKEN ADDRESSES (REAL)

```
USDC:  0x3600000000000000000000000000000000000000
EURC:  0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
USYC:  0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C
```

---

## 📁 KEY FILES

### Configuration
- `hardhat.config.js` - Main Hardhat config
- `hardhat.config.arc.js` - ARC-specific config
- `.env` - Environment variables (KEEP PRIVATE!)
- `.env.example` - Template (safe to commit)

### Smart Contracts
- `contracts/PayerX.sol` - Main router
- `contracts/mocks/MockFXEngine.sol` - Test FX engine
- `contracts/mocks/MockERC20.sol` - Test tokens (local only)

### Deployment Scripts
- `scripts/deploy-arc.js` - Deploy to ARC Testnet
- `scripts/fund-fxengine.js` - Fund with real tokens
- `scripts/test-payment.js` - Test payment flow

### Documentation
- `DEPLOYMENT_GUIDE.md` - Full guide
- `QUICK_DEPLOY.md` - Quick start
- `EXAMPLE_DEPLOYMENT.md` - Practical examples

---

## ⚠️ SECURITY CHECKLIST

### MUST DO
- [x] Keep `.env` PRIVATE
- [x] Add `.env` to `.gitignore`
- [x] Never share private keys
- [x] Use separate wallets (dev/test/prod)
- [x] Test thoroughly before mainnet

### MUST NOT DO
- [ ] Commit `.env` to git
- [ ] Share private keys
- [ ] Use production wallet for testing
- [ ] Deploy unaudited code to mainnet
- [ ] Expose API keys in code

---

## 🆘 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Private key not found | Make sure .env has `PRIVATE_KEY=0x...` (with 0x) |
| No USDC balance | Get from faucet: https://faucet.circle.com |
| Deploy fails | Check USDC balance >100, RPC is accessible |
| Token not found | Verify token addresses in .env match docs |
| Transaction timeout | Wait 1-2 min, testnet RPC may be slow |
| FX Engine deployment fails | Check gas limit and gas price in .env |

---

## 📊 EXPECTED OUTPUTS

### After Deploy
```
✅ PayerX deployed to: 0x...
✅ MockFXEngine deployed to: 0x...
💾 Deployment info saved to: deployments/arc-testnet.json
```

### After Fund
```
✅ USDC transferred to FX Engine
✅ EURC transferred to FX Engine
✅ USYC transferred to FX Engine
```

### After Test
```
✅ Payment successful!
📊 10 EURC → 11 USDC (with 0.1% fee)
💼 Balance changed correctly
```

---

## 📚 DOCUMENTATION GUIDE

### For Quick Start (5 min)
→ Read `QUICK_DEPLOY.md`

### For Step-by-Step Detail
→ Read `DEPLOYMENT_GUIDE.md`

### For Practical Examples
→ Read `EXAMPLE_DEPLOYMENT.md`

### For ARC Network Details
→ Visit https://docs.arc.network

---

## ✨ YOU'RE ALL SET!

Everything is configured and ready. Just follow the checklist above!

Questions? Check the documentation files or refer to https://docs.arc.network

Good luck! 🚀
