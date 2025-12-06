# PayerX → StableFX Migration Guide

## Quick Start: Upgrade to Real Market Rates

Migrate PayerX from MockFXEngine to StableFXAdapter for real-time market rates.

### Prerequisites

- PayerX already deployed on ARC Testnet
- Testnet tokens (USDC, EURC, USYC) from [Circle Faucet](https://faucet.circle.com/)
- `.env` configured with existing deployment addresses

### Migration Steps

#### 1️⃣ Deploy StableFXAdapter

```bash
node scripts/deploy-stablefx-adapter.js
```

**Output**: StableFXAdapter address

**Action**: Add to `.env`:
```env
STABLEFX_ADAPTER_ADDRESS=0x...
```

#### 2️⃣ Fund Adapter with Liquidity

```bash
node scripts/fund-adapter.js
```

**What it does**: Transfers 50% of your USDC, EURC, USYC to adapter for instant swaps

#### 3️⃣ Migrate PayerX

```bash
node scripts/migrate-to-stablefx.js
```

**What it does**: Updates PayerX's FXEngine from MockFXEngine → StableFXAdapter

#### 4️⃣ Test Real Rates

```bash
node scripts/test-stablefx-payment.js
```

**What it does**: Executes test payment with real market rates and compares with old mock rates

#### 5️⃣ Verify Contract (Optional)

```bash
npx hardhat verify --network arc <ADAPTER_ADDRESS> "<OWNER_ADDRESS>"
```

### What Changes?

| Before (Mock) | After (Real) |
|--------------|--------------|
| MockFXEngine | StableFXAdapter |
| 1 EURC = 1.1 USDC | 1 EURC = 1.09 USDC |
| Hardcoded rates | Market rates |
| Test only | Production-grade |

### Verification Checklist

- [ ] StableFXAdapter deployed and verified
- [ ] Adapter funded with liquidity
- [ ] PayerX updated to use adapter
- [ ] Test payment executed successfully
- [ ] Rates match current market data

### Key Addresses (ARC Testnet)

- **StableFX FxEscrow**: `0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1`
- **Permit2**: `0x000000000022D473030F116dDEE9F6B43aC78BA3`

### Troubleshooting

**"Rate expired"**: Update rates using `setExchangeRate()`

**"Insufficient liquidity"**: Run `fund-adapter.js` again or add more liquidity

**"PayerX still using MockFXEngine"**: Run `migrate-to-stablefx.js`

### Documentation

- Full guide: [STABLEFX_INTEGRATION.md](./STABLEFX_INTEGRATION.md)
- StableFX Docs: https://developers.circle.com/stablefx
- ARC Docs: https://docs.arc.network/

### Support

- View transactions: https://testnet.arcscan.app/
- Get testnet tokens: https://faucet.circle.com/
- ARC Discord: https://discord.com/invite/buildonarc
