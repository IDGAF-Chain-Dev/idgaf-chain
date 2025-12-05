# Use Managed RPC Services (Alchemy/Infura)

Easiest option - no server management needed!

## Option 1: Alchemy

### Step 1: Create Account

1. Go to https://www.alchemy.com
2. Sign up (free)
3. Create new app

### Step 2: Create App

1. Click "Create App"
2. Name: "IDGAF Chain"
3. Chain: "Ethereum" (or custom)
4. Network: "Custom Network"

### Step 3: Configure Custom Network

- Chain ID: 10144
- RPC URL: Your node URL (if you have one)
- OR use Alchemy's infrastructure

### Step 4: Get RPC URL

Your RPC endpoint will be:
```
https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### Free Tier

- 300M compute units/month
- 1 app
- Good for development

## Option 2: Infura

### Step 1: Create Account

1. Go to https://www.infura.io
2. Sign up (free)
3. Create new project

### Step 2: Configure

1. Create project
2. Select "Ethereum" network
3. Get API key

### Step 3: Use Custom Endpoint

For custom chain, you'll need to:
1. Deploy your own node
2. Use Infura IPFS or other services
3. Or contact Infura for custom chain support

## Comparison

| Feature | Alchemy | Infura |
|---------|---------|--------|
| Free Tier | 300M CU/month | 100k requests/day |
| Custom Chains | Supported | Limited |
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Best For | Production | Development |

## Recommendation

For IDGAF Chain, you'll likely need to:
1. Deploy your own node (using Railway/Render/etc.)
2. Then use Alchemy/Infura as a proxy/load balancer
3. Or just use your own node directly

## Quick Setup Script

```bash
# After deploying your node, add to Alchemy
# 1. Go to Alchemy dashboard
# 2. Add custom endpoint
# 3. Point to your node URL
```

