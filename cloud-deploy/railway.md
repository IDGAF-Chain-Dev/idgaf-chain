# Deploy IDGAF Chain on Railway

Railway is the easiest option for deploying IDGAF Chain nodes.

## Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Get $5 free credit (no credit card needed initially)

## Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo" (if you have repo)
   OR
   Select "Empty Project"

## Step 3: Add Service

### Option A: Using Dockerfile (Recommended)

1. Click "New" → "GitHub Repo"
2. Select your repository
3. Railway will auto-detect Dockerfile

### Option B: Manual Setup

1. Click "New" → "Empty Service"
2. Add environment variables:
   ```
   NETWORK_ID=10144
   CHAIN_ID=10144
   ```

## Step 4: Configure Service

### Environment Variables

```
NETWORK_ID=10144
CHAIN_ID=10144
HTTP_PORT=8545
WS_PORT=8546
```

### Port Settings

- HTTP RPC: 8545
- WebSocket: 8546
- P2P: 30303

## Step 5: Deploy

Railway will automatically:
- Build your Docker image
- Deploy the service
- Provide a public URL

## Step 6: Get RPC URL

1. Go to your service
2. Click "Settings" → "Networking"
3. Copy the public URL
4. Your RPC endpoint: `https://your-service.railway.app`

## Cost

- Free: $5 credit/month
- After free tier: ~$5-10/month for small node

## Tips

- Use Railway's built-in metrics to monitor
- Set up auto-deploy from GitHub
- Use Railway's database for transaction history

