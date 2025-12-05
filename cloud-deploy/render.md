# Deploy IDGAF Chain on Render

Render offers a free tier perfect for IDGAF Chain nodes.

## Step 1: Create Account

1. Go to https://render.com
2. Sign up (free)
3. No credit card required for free tier

## Step 2: Create Web Service

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Or use "Public Git repository"

## Step 3: Configure Service

### Build Command
```bash
cd node-setup && docker-compose build
```

### Start Command
```bash
cd node-setup && docker-compose up
```

### Environment Variables
```
NETWORK_ID=10144
CHAIN_ID=10144
```

## Step 4: Deploy

1. Click "Create Web Service"
2. Render will build and deploy
3. Get your URL: `https://your-service.onrender.com`

## Step 5: Custom Domain (Optional)

1. Go to Settings → Custom Domains
2. Add: `rpc.idgaf.chain`
3. Update DNS records as shown

## Free Tier Limitations

- Service sleeps after 15 minutes of inactivity
- Wakes up on first request (may take 30-60 seconds)
- 750 hours/month free

## Upgrade Options

- Starter: $7/month (no sleep)
- Standard: $25/month (better performance)

## Tips

- Use Render's health checks
- Enable auto-deploy
- Monitor in Render dashboard

