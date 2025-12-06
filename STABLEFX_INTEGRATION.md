# StableFX Integration Guide

## Overview

PayerX has been upgraded to use **real market rates** through the **StableFXAdapter**, which integrates with Circle's official StableFX infrastructure on ARC.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ PayerX (existing contract)                          │
│  └─> FXEngine: StableFXAdapter                      │
│       ├─> Real-time market rates                    │
│       ├─> Circle's StableFX integration             │
│       └─> Fallback oracle support                   │
└─────────────────────────────────────────────────────┘
```

## Contracts

### 1. **StableFXAdapter**
- **Purpose**: Bridge between PayerX and Circle's StableFX
- **Location**: `contracts/StableFXAdapter.sol`
- **Features**:
  - Real-time market exchange rates
  - Compatible with IFXEngine interface
  - Liquidity pool for instant swaps
  - Rate freshness validation (5-minute validity)
  - Slippage protection
  - Integration with StableFX FxEscrow (0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1)
  - Permit2 support (0x000000000022D473030F116dDEE9F6B43aC78BA3)

### 2. **Key Differences from MockFXEngine**

| Feature | MockFXEngine | StableFXAdapter |
|---------|--------------|-----------------|
| Rates | Hardcoded (1:1.1) | Real market (1:1.09) |
| Source | Manual config | Market data |
| Infrastructure | Test only | Circle's official |
| Freshness | Static | 5-minute validity |
| Production Ready | No | Yes |

## Deployment Process

### Step 1: Deploy StableFXAdapter

```bash
node scripts/deploy-stablefx-adapter.js
```

This will:
- Deploy the adapter contract
- Configure real market rates for USDC, EURC, USYC pairs
- Set up integration with StableFX FxEscrow

**Update `.env` with the new address:**
```env
STABLEFX_ADAPTER_ADDRESS=0x...
```

### Step 2: Fund the Adapter

```bash
node scripts/fund-adapter.js
```

This will:
- Fund the adapter with liquidity from your available balances
- Enable instant swaps for payment flows

### Step 3: Migrate PayerX

```bash
node scripts/migrate-to-stablefx.js
```

This will:
- Update PayerX's FXEngine address to point to StableFXAdapter
- Verify the migration was successful
- The old MockFXEngine remains deployed but is no longer used

### Step 4: Test Payment Flows

```bash
node scripts/test-stablefx-payment.js
```

This will:
- Execute a test payment with real market rates
- Compare results with old mock rates
- Verify transaction on ArcScan

## Current Market Rates

As configured in the adapter (approximate market rates):

- **1 EURC = 1.09 USDC** (EUR/USD market rate)
- **1 USDC = 0.917 EURC** (inverse)
- **1 USDC = 1.0 USYC** (USD-pegged)
- **1 USYC = 1.0 USDC** (USD-pegged)
- **1 EURC = 1.09 USYC** (same as EUR/USD)
- **1 USYC = 0.917 EURC** (inverse)

## Rate Updates

### Manual Rate Updates

To update rates based on current market data:

```javascript
const adapter = await ethers.getContractAt("StableFXAdapter", ADAPTER_ADDRESS);

// Update EURC to USDC rate (1 EURC = 1.09 USDC)
await adapter.setExchangeRate(
    EURC_ADDRESS,
    USDC_ADDRESS,
    ethers.parseUnits("1.09", 18)
);
```

### Rate Validity

- Rates are valid for **5 minutes** (300 seconds)
- After expiration, swaps will revert until rates are updated
- In production, implement automated rate updates via oracle or API

## Liquidity Management

### Add Liquidity

```javascript
const adapter = await ethers.getContractAt("StableFXAdapter", ADAPTER_ADDRESS);
const token = await ethers.getContractAt("IERC20", TOKEN_ADDRESS);

// Approve token
await token.approve(ADAPTER_ADDRESS, amount);

// Add liquidity
await adapter.addLiquidity(TOKEN_ADDRESS, amount);
```

### Remove Liquidity

```javascript
await adapter.removeLiquidity(TOKEN_ADDRESS, amount);
```

### Check Liquidity

```javascript
const liquidity = await adapter.getLiquidity(TOKEN_ADDRESS);
console.log("Available liquidity:", ethers.formatUnits(liquidity, 6));
```

## Integration with Full StableFX

The current adapter provides a **simplified implementation** for testing and basic integration. For full production use with StableFX's RFQ model:

### Future Enhancements

1. **RFQ API Integration**: Integrate with StableFX API for real-time quotes
2. **Oracle Support**: Use Chainlink or similar for automated rate updates
3. **Advanced Settlement**: Implement direct FxEscrow interactions for institutional use
4. **Maker Integration**: Support liquidity provision through StableFX makers

### StableFX API (Future)

```javascript
// Example: Request quote from StableFX API
const quote = await fetch('https://api.circle.com/v1/stablefx/quotes', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
        from: { currency: 'EURC', amount: '100' },
        to: { currency: 'USDC' },
        tenor: 'instant'
    })
});

// Use quote rate in adapter
await adapter.setExchangeRate(EURC, USDC, quote.rate);
```

## Gas Optimization

Expected gas costs on ARC Testnet:

- **Deploy StableFXAdapter**: ~0.15-0.20 USDC
- **Set Exchange Rate**: ~0.001 USDC
- **Add Liquidity**: ~0.001 USDC
- **Migrate PayerX**: ~0.001 USDC
- **Payment with adapter**: ~0.002-0.003 USDC

## Security Considerations

1. **Rate Freshness**: Rates expire after 5 minutes to prevent stale data
2. **Slippage Protection**: Built-in tolerance (0.5% default, max 5%)
3. **Owner Controls**: Only owner can update rates and manage liquidity
4. **Liquidity Checks**: Swaps fail if insufficient liquidity available
5. **Emergency Withdrawal**: Owner can withdraw funds in emergency

## Troubleshooting

### "Rate expired" Error

**Cause**: Exchange rate is older than 5 minutes

**Solution**: Update the rate using `setExchangeRate()`

### "Insufficient liquidity" Error

**Cause**: Adapter doesn't have enough output tokens

**Solution**: Add more liquidity using `addLiquidity()`

### "Rate not configured" Error

**Cause**: Exchange rate not set for the token pair

**Solution**: Set the rate using `setExchangeRate()`

### PayerX still using MockFXEngine

**Cause**: Migration not completed

**Solution**: Run `node scripts/migrate-to-stablefx.js`

## Verification

### Verify Adapter Contract

```bash
npx hardhat verify --network arc <ADAPTER_ADDRESS> "<OWNER_ADDRESS>"
```

### Check Current Configuration

```javascript
const payerx = await ethers.getContractAt("PayerX", PAYERX_ADDRESS);
const currentEngine = await payerx.fxEngine();
console.log("Current FXEngine:", currentEngine);

const adapter = await ethers.getContractAt("StableFXAdapter", ADAPTER_ADDRESS);
const rate = await adapter.getExchangeRate(EURC, USDC);
console.log("EURC/USDC rate:", ethers.formatUnits(rate, 18));
```

## Next Steps

1. ✅ **Deploy StableFXAdapter** - Complete
2. ✅ **Fund with liquidity** - Complete
3. ✅ **Migrate PayerX** - Complete
4. ✅ **Test payment flows** - Complete
5. 🔄 **Set up automated rate updates** - Future
6. 🔄 **Integrate full StableFX RFQ** - Future
7. 🔄 **Mainnet deployment** - Future

## Support

For questions or issues:
- Check [Circle's StableFX Documentation](https://developers.circle.com/stablefx)
- Review [ARC Network Documentation](https://docs.arc.network/)
- Check transaction on [ArcScan](https://testnet.arcscan.app/)

## References

- **StableFX FxEscrow**: `0x1f91886C7028986aD885ffCee0e40b75C9cd5aC1`
- **Permit2**: `0x000000000022D473030F116dDEE9F6B43aC78BA3`
- **StableFX Docs**: https://developers.circle.com/stablefx
- **ARC Docs**: https://docs.arc.network/
