# 📖 PAYERX DEPLOYMENT - GETTING STARTED

> **Dokumentasi Setup untuk Deploy PayerX ke ARC Testnet dengan Token Real**

---

## 🎯 Quick Navigation

Pilih dokumen sesuai kebutuhan Anda:

### 🚀 Ingin Deploy Cepat? (5 Menit)
**→ Baca: [`QUICK_DEPLOY.md`](./QUICK_DEPLOY.md)**
- 6 langkah sederhana
- Commands siap copy-paste
- Checklist & common issues

### 📋 Siap Deploy tapi Takut Lupa?
**→ Gunakan: [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)**
- Pre-deployment checklist
- Step-by-step verification
- Troubleshooting table

### 📚 Ingin Belajar Lebih Detail?
**→ Baca: [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)**
- Panduan lengkap step-by-step
- Penjelasan setiap langkah
- Network configuration & best practices
- Security considerations

### 💡 Ingin Lihat Contoh Praktis?
**→ Baca: [`EXAMPLE_DEPLOYMENT.md`](./EXAMPLE_DEPLOYMENT.md)**
- Contoh real dengan output
- Expected results untuk setiap step
- Verification examples

---

## 🎯 Choose Your Path

```
┌─────────────────────────────────────────────────────────────┐
│                    START HERE                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    I'm Ready!    I'm Careful!   I'm a Learner!
         │             │             │
         │             │             │
         ▼             ▼             ▼
   QUICK_DEPLOY   DEPLOYMENT_      DEPLOYMENT_
   (5 min)        CHECKLIST        GUIDE
                  (Verification)   (Detail)
```

---

## ⚡ Fastest Path (5 Minutes)

```bash
# 1. Generate wallet
cast wallet new
# Copy: Private Key (with 0x prefix)

# 2. Edit .env
# Add PRIVATE_KEY=0x...

# 3. Get testnet USDC
# Visit: https://faucet.circle.com

# 4. Deploy
npx hardhat run scripts/deploy-arc.js --network arc-testnet

# 5. Fund FX Engine (after getting tokens from faucet)
npx hardhat run scripts/fund-fxengine.js --network arc-testnet

# 6. Test
npx hardhat run scripts/test-payment.js --network arc-testnet
```

See [`QUICK_DEPLOY.md`](./QUICK_DEPLOY.md) for details.

---

## 📋 Configuration

### Files Created

| File | Purpose | Status |
|------|---------|--------|
| `.env` | Main config (KEEP PRIVATE) | ✅ Ready |
| `.env.example` | Template for reference | ✅ Ready |
| `hardhat.config.arc.js` | ARC network config | ✅ Ready |
| `scripts/deploy-arc.js` | Deployment script | ✅ Ready |
| `scripts/fund-fxengine.js` | Funding script | ✅ Ready |
| `scripts/test-payment.js` | Testing script | ✅ Ready |

### .env Setup

```env
# MUST FILL
PRIVATE_KEY=0x...  # Your private key (with 0x prefix)

# Pre-configured
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
ARC_TESTNET_CHAIN_ID=5042002
ARC_TESTNET_GAS_PRICE=160000000000
ARC_TESTNET_GAS_LIMIT=10000000

# Optional customization
FEE_BPS=10  # 0.1% fee (0-100 basis points)
FEE_COLLECTOR=  # empty = deployer address

# Token addresses (REAL ARC tokens)
ARC_USDC=0x3600000000000000000000000000000000000000
ARC_EURC=0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
ARC_USYC=0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C
```

---

## 🌐 Network Information

| Config | Value |
|--------|-------|
| **Network** | ARC Testnet |
| **Chain ID** | 5042002 |
| **RPC** | https://rpc.testnet.arc.network |
| **Gas Token** | USDC (6 decimals) |
| **Gas Price** | 160 Gwei |
| **Explorer** | https://testnet.arcscan.app |
| **Faucet** | https://faucet.circle.com |

---

## 🚀 Deployment Workflow

### Overview

```
Wallet Setup  →  Get Testnet USDC  →  Deploy  →  Fund  →  Test  →  Verify
     ↓                  ↓            ↓       ↓      ↓      ↓
  cast wallet      faucet.circle    contracts      real   payment   explorer
   new              .com             deploy       tokens    test
```

### Detailed Steps

1. **Generate Wallet**
   - Command: `cast wallet new`
   - Save: Address + Private Key

2. **Setup .env**
   - Edit: `.env` file
   - Add: `PRIVATE_KEY=0x...` (from step 1)

3. **Get Testnet USDC**
   - Visit: https://faucet.circle.com
   - Select: Arc Testnet
   - Request: 1000+ USDC

4. **Deploy Contracts**
   - Command: `npx hardhat run scripts/deploy-arc.js --network arc-testnet`
   - Get: PayerX address + FXEngine address

5. **Fund FX Engine**
   - Get: USDC, EURC, USYC from faucet
   - Command: `npx hardhat run scripts/fund-fxengine.js --network arc-testnet`

6. **Test Payment**
   - Command: `npx hardhat run scripts/test-payment.js --network arc-testnet`
   - Verify: Swap works correctly

7. **Verify on ArcScan**
   - Visit: https://testnet.arcscan.app
   - Search: PayerX contract address
   - Confirm: Code visible & functions accessible

---

## 📚 Documentation Index

### Quick Reference
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - 5-minute quick start
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

### Comprehensive Guides
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Step-by-step detailed guide
- **[EXAMPLE_DEPLOYMENT.md](./EXAMPLE_DEPLOYMENT.md)** - Practical examples with output

### Reference
- [ARC Documentation](https://docs.arc.network)
- [ARC Deploy Guide](https://docs.arc.network/arc/tutorials/deploy-on-arc)
- [Hardhat Documentation](https://hardhat.org)

---

## 🔗 Important Links

| Purpose | URL |
|---------|-----|
| **Testnet Faucet** | https://faucet.circle.com |
| **Block Explorer** | https://testnet.arcscan.app |
| **RPC Endpoint** | https://rpc.testnet.arc.network |
| **ARC Docs** | https://docs.arc.network |
| **Deploy Tutorial** | https://docs.arc.network/arc/tutorials/deploy-on-arc |

---

## 🪙 Token Addresses (Real ARC Tokens)

These are official Circle contracts deployed on ARC Testnet:

```
USDC: 0x3600000000000000000000000000000000000000
EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
USYC: 0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C
```

---

## ✅ Pre-Deployment Checklist

- [ ] Node.js v16+ installed
- [ ] Project cloned/downloaded
- [ ] Dependencies installed (`npm install`)
- [ ] Contracts compiled (`npx hardhat compile`)
- [ ] Tests passing locally (`npx hardhat test`)
- [ ] Foundry installed (`cast` command works)
- [ ] Wallet generated (`cast wallet new`)
- [ ] `.env` file created
- [ ] Private key added to `.env`
- [ ] Testnet USDC obtained from faucet

---

## 🆘 Need Help?

### Common Issues

**Q: Where do I get testnet USDC?**
A: Visit https://faucet.circle.com, select "Arc Testnet", and request USDC.

**Q: What's the minimum USDC needed?**
A: Minimum 100 USDC for gas. We recommend 1000+ for headroom.

**Q: How do I know deployment succeeded?**
A: Check the output for contract addresses, then visit ArcScan to verify.

**Q: Can I test on localhost first?**
A: Yes! Run `npx hardhat test` for local testing. Use real tokens for testnet.

**Q: What if deployment fails?**
A: See troubleshooting section in [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)

---

## 🚀 Ready? Let's Go!

1. **Pick your documentation:**
   - Quick? → [`QUICK_DEPLOY.md`](./QUICK_DEPLOY.md)
   - Detail? → [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)
   - Verify? → [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)

2. **Follow the steps**

3. **Deploy! 🎉**

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section in relevant documentation
2. Review [`EXAMPLE_DEPLOYMENT.md`](./EXAMPLE_DEPLOYMENT.md) for expected outputs
3. Refer to [ARC Official Docs](https://docs.arc.network)
4. Create an issue on GitHub with details

---

**Happy Deploying! 🚀**

---

*Last Updated: December 2025*  
*PayerX v2.0 - ARC Smart Payment Router*
