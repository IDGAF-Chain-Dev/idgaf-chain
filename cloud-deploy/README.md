# Cloud Deployment Options for IDGAF Chain

Free and low-cost cloud deployment options for IDGAF Chain nodes.

## 🚀 Quick Start (Recommended)

**Fastest Option**: Railway
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

**Free Option**: Render
- Go to https://render.com
- Create Web Service
- Connect GitHub repo
- Deploy!

See `QUICK_DEPLOY.md` for step-by-step guides.

## 📋 Available Platforms

### 1. Railway ⭐ (Easiest)
- **Cost**: $5 free, then ~$10/month
- **Setup**: 5 minutes
- **Guide**: `railway.md`

### 2. Render (Free Tier)
- **Cost**: Free (sleeps after 15 min)
- **Setup**: 10 minutes
- **Guide**: `render.md`

### 3. Fly.io (Generous Free)
- **Cost**: Free tier available
- **Setup**: 15 minutes
- **Guide**: `flyio.md`

### 4. DigitalOcean (Budget)
- **Cost**: $6/month
- **Setup**: 20 minutes
- **Guide**: `digitalocean.md`

### 5. AWS (Enterprise)
- **Cost**: Free 12 months, then ~$10/month
- **Setup**: 30 minutes
- **Guide**: `aws.md`

### 6. Managed RPC (Alchemy/Infura)
- **Cost**: Free tier available
- **Setup**: 10 minutes
- **Guide**: `alchemy-infura.md`

## 🎯 Which Should I Choose?

| Use Case | Recommended |
|----------|-------------|
| Quick testing | Railway |
| Free development | Render |
| Production | Fly.io or DigitalOcean |
| Enterprise | AWS |
| No server management | Alchemy/Infura |

## 📚 Guides

- `QUICK_DEPLOY.md` - Quick comparison and setup
- `railway.md` - Railway detailed guide
- `render.md` - Render detailed guide
- `flyio.md` - Fly.io detailed guide
- `digitalocean.md` - DigitalOcean guide
- `aws.md` - AWS guide
- `alchemy-infura.md` - Managed RPC services

## 🔧 Setup Script

Run interactive setup:

```bash
chmod +x cloud-deploy/setup-cloud.sh
./cloud-deploy/setup-cloud.sh
```

## 📝 After Deployment

1. Get your RPC URL from the platform
2. Update configuration:
   ```bash
   ./node-setup/update-rpc-config.sh
   ```
3. Deploy contracts:
   ```bash
   npm run deploy:l2
   ```
4. Test:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
     YOUR_RPC_URL
   ```

## 💡 Tips

- Start with Railway for fastest setup
- Use Render for free testing
- Move to Fly.io/DigitalOcean for production
- Always setup monitoring
- Use custom domains for professional look
- Enable SSL/HTTPS
