# PayerX Auto-Update Exchange Rates

## 📋 Overview

PayerX telah berhasil diintegrasikan dengan **real-time market rates** dari CoinGecko API. System ini secara otomatis memperbarui exchange rates di StableFXAdapter untuk memastikan pembayaran selalu menggunakan rate pasar terkini.

## 🎯 Fitur

✅ **Auto-fetch rates** dari CoinGecko API (gratis, no API key)
✅ **Smart update logic** - hanya update jika rate berubah >0.1%
✅ **Rate freshness check** - validate rate tidak expired (>5 menit)
✅ **Watch mode** - auto-update dengan interval tertentu
✅ **Fallback mechanism** - gunakan rate backup jika API gagal

## 📊 Arsitektur

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  CoinGecko  │─────▶│ auto-update-     │─────▶│ StableFXAdapter  │
│     API     │      │   rates.js       │      │   (on-chain)     │
└─────────────┘      └──────────────────┘      └──────────────────┘
                              │                          │
                              │                          │
                              └──────────┬───────────────┘
                                         │
                                         ▼
                                   ┌──────────┐
                                   │  PayerX  │
                                   │ Contract │
                                   └──────────┘
```

## 🚀 Usage

### 1. Single Update (Manual)

Update rate sekali saja:

```bash
node scripts/auto-update-rates.js
```

Output:
```
🔄 Auto-Update StableFXAdapter with Real Market Rates

📊 Fetching current market rate from CoinGecko...
✅ Current rate: 1 EURC = 1.16 USD
Contract rate value: 1160000000000000000

📍 Adapter Address: 0x177030FBa1dE345F99C91ccCf4Db615E8016f75D
👤 Updating from: 0x75b0b8EFb946e2892Bc650311D28DEFfbe015Ea9

🔍 Checking current rate in contract...
Current rate in contract: 1.09
Last update: 2025-12-06T10:00:00.000Z

Rate difference: 0.0700 (6.42%)

📝 Updating rate in contract...
Transaction hash: 0x09fa25fbe09ebbd97a9bf82d9e5b4e8eebd724d8ba4d9680764437f2fb5ecec6
⏳ Waiting for confirmation...
✅ Rate updated successfully!
   Block: 14902095
   Gas used: 37761

✅ Verified new rate: 1.16
   Updated at: 2025-12-06T10:50:41.000Z
```

### 2. Watch Mode (Auto-Update)

Update otomatis setiap interval tertentu:

```bash
# Update setiap 60 menit (default)
node scripts/auto-update-rates.js --watch

# Update setiap 30 menit
node scripts/auto-update-rates.js --watch 30

# Update setiap 5 menit
node scripts/auto-update-rates.js --watch 5
```

### 3. Check Adapter Status

Cek status rate saat ini:

```bash
node scripts/check-adapter-status.js
```

Output:
```
🔍 Checking StableFXAdapter Status...

📍 Adapter: 0x177030FBa1dE345F99C91ccCf4Db615E8016f75D
🪙 EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
🪙 USDC: 0x3600000000000000000000000000000000000000

👤 Owner: 0x75b0b8EFb946e2892Bc650311D28DEFfbe015Ea9

💱 Fetching EUR/USD rate...
✅ Current Rate: 1 EURC = 1.16 USDC
📅 Last Updated: 2025-12-06T10:50:41.000Z
⏱️  Age: 0 minutes ago

✅ Rate is fresh and valid!

📊 Rate Details:
   Rate (wei): 1160000000000000000
   Rate (decimal): 1.16
   Validity period: 5 minutes
   Time remaining: 5 minutes
```

### 4. Fetch Market Rates (Read-Only)

Hanya fetch rate tanpa update ke blockchain:

```bash
node scripts/fetch-market-rates.js
```

## 📝 Scripts Overview

| Script | Purpose | Usage |
|--------|---------|-------|
| `auto-update-rates.js` | Auto-update rates dari CoinGecko ke contract | Production |
| `check-adapter-status.js` | Check status dan freshness rate | Monitoring |
| `fetch-market-rates.js` | Fetch rate dari API (read-only) | Testing |
| `test-circle-api.js` | Test Circle API connectivity | Debugging |
| `fetch-onchain-rates.js` | Test StableFX on-chain rates | Research |

## 🔧 Configuration

### Rate Update Threshold

Rate hanya di-update jika perubahan >0.1%:

```javascript
// In auto-update-rates.js
if (percentDifference < 0.1) {
  console.log('✅ Rate is up-to-date, no update needed');
  return;
}
```

### Rate Validity Period

Rate valid selama 5 menit (defined in contract):

```solidity
// In StableFXAdapter.sol
uint256 public constant RATE_VALIDITY = 5 minutes;
```

### Watch Mode Interval

Default interval adalah 60 menit, bisa diubah:

```bash
# Custom interval (dalam menit)
node scripts/auto-update-rates.js --watch 30
```

## 🌐 Data Source

### Primary: CoinGecko API

- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price`
- **Rate**: `euro-coin` vs `usd`
- **Cost**: FREE, no API key needed
- **Rate limit**: ~50 requests/minute

### Fallback: Hardcoded Rate

Jika CoinGecko gagal, gunakan fallback:

```javascript
console.log('⚠️  Failed to fetch from CoinGecko');
console.log('Using fallback rate: 1.09');
return 1.09;
```

## 📊 Current Status

### Deployment Info

```
Network:         ARC Testnet (Chain ID: 5042002)
PayerX:          0x570b3d069b3350C54Ec5E78E8b2c2677ddb38C0C
StableFXAdapter: 0x177030FBa1dE345F99C91ccCf4Db615E8016f75D
Owner:           0x75b0b8EFb946e2892Bc650311D28DEFfbe015Ea9

Current Rate:    1.16 EURC = 1 USDC
Last Update:     2025-12-06T10:50:41.000Z
Data Source:     CoinGecko API
```

### Supported Pairs

Currently implemented:
- ✅ EURC/USDC (1.16)

Future additions:
- USYC/USDC (when available)
- Custom token pairs

## 🔐 Security

### Rate Validation

1. **Freshness Check**: Rate expired after 5 minutes
2. **Slippage Protection**: Max 5% slippage allowed
3. **Owner Control**: Only owner can update rates
4. **Sanity Check**: Rate must be >0

### Gas Optimization

- Only update if rate changed >0.1%
- Single transaction update (not batch)
- Average gas: ~37,000 per update

## 🚨 Error Handling

### Common Errors

1. **Rate Expired**
   ```
   ❌ Error: StableFXAdapter: Rate expired
   ```
   **Solution**: Run `node scripts/auto-update-rates.js`

2. **Insufficient Funds**
   ```
   ❌ Error: INSUFFICIENT_FUNDS
   ```
   **Solution**: Get USDC from https://faucet.circle.com

3. **CoinGecko API Failed**
   ```
   ⚠️  Failed to fetch from CoinGecko
   Using fallback rate: 1.09
   ```
   **Solution**: Automatic fallback, no action needed

## 📈 Monitoring

### Recommended Setup

1. **Cron Job** (Linux/Mac):
   ```bash
   # Update setiap 30 menit
   */30 * * * * cd /path/to/PayerX_Router && node scripts/auto-update-rates.js
   ```

2. **Task Scheduler** (Windows):
   - Action: Start a program
   - Program: `node`
   - Arguments: `scripts/auto-update-rates.js`
   - Start in: `D:\PayerX_Router`
   - Trigger: Every 30 minutes

3. **PM2** (Recommended):
   ```bash
   # Install PM2
   npm install -g pm2

   # Start in watch mode (60 min interval)
   pm2 start "node scripts/auto-update-rates.js --watch 60" --name payerx-rates

   # View logs
   pm2 logs payerx-rates

   # Stop
   pm2 stop payerx-rates
   ```

## 🔄 Upgrade Path

### Phase 1: ✅ COMPLETED
- Auto-fetch rates from CoinGecko
- Smart update logic
- Manual + watch mode

### Phase 2: 🔄 IN PROGRESS
- Integrate Circle StableFX API (when available)
- Chainlink Price Feeds (if available on ARC)

### Phase 3: 📋 PLANNED
- Multi-source aggregation (average dari multiple APIs)
- WebSocket real-time updates
- Alert system for rate anomalies

## 📚 API References

### CoinGecko API

```javascript
// Fetch EUR/USD rate
fetch('https://api.coingecko.com/api/v3/simple/price?ids=euro-coin&vs_currencies=usd')
  .then(res => res.json())
  .then(data => {
    const rate = data['euro-coin'].usd; // 1.16
    console.log(`1 EURC = ${rate} USD`);
  });
```

### Circle StableFX API (Future)

```javascript
// Note: Requires API key from console.circle.com
const response = await fetch('https://api-sandbox.circle.com/v1/stablefx/rates', {
  headers: {
    'Authorization': `Bearer ${CIRCLE_API_KEY}`
  }
});
```

## 🎓 Learn More

- [CoinGecko API Docs](https://www.coingecko.com/en/api)
- [Circle StableFX Docs](https://developers.circle.com/stablefx)
- [PayerX Contract](../contracts/PayerX.sol)
- [StableFXAdapter Contract](../contracts/StableFXAdapter.sol)

## 💡 Tips

1. **Rate Validity**: Set sesuai kebutuhan trading frequency
   - High frequency: 1-5 minutes
   - Normal: 5-15 minutes
   - Low frequency: 30-60 minutes

2. **Update Threshold**: Sesuaikan untuk balance gas cost vs accuracy
   - Tight: 0.01% (more updates, higher gas)
   - Normal: 0.1% (recommended)
   - Loose: 1% (fewer updates, lower gas)

3. **Watch Mode**: Gunakan untuk production deployment
   ```bash
   # Production: update every 30 minutes
   node scripts/auto-update-rates.js --watch 30
   ```

## 🆘 Support

Jika mengalami issues:

1. Check adapter status: `node scripts/check-adapter-status.js`
2. Verify wallet has USDC for gas
3. Check CoinGecko API availability
4. Review transaction on ArcScan: https://testnet.arcscan.app

---

**Status**: ✅ Production Ready
**Last Updated**: 2025-12-06
**Version**: 1.0.0
