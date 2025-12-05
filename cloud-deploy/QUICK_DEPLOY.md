# Quick Deploy Guide - Choose Your Platform

## 🚀 Fastest Option: Railway (5 minutes)

### Step 1: Sign Up
1. Go to https://railway.app
2. Sign up with GitHub (free $5 credit)

### Step 2: Deploy
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
cd cloud-deploy
railway init
railway up
```

### Step 3: Get URL
- Railway dashboard → Your service → Settings → Networking
- Copy the public URL
- Your RPC: `https://your-app.railway.app`

**Done!** Your node is live in ~5 minutes.

---

## 🆓 Free Option: Render (10 minutes)

### Step 1: Sign Up
1. Go to https://render.com
2. Sign up (no credit card needed)

### Step 2: Create Web Service
1. New → Web Service
2. Connect GitHub repo OR use public repo
3. Build command: `cd node-setup && docker-compose build`
4. Start command: `cd node-setup && docker-compose up`

### Step 3: Deploy
- Render auto-deploys
- Get URL: `https://your-service.onrender.com`

**Note**: Free tier sleeps after 15 min, wakes on request.

---

## 🌍 Global Option: Fly.io (15 minutes)

### Step 1: Install & Sign Up
```bash
# Install Fly CLI
iwr https://fly.io/install.ps1 -useb | iex  # Windows
# or
curl -L https://fly.io/install.sh | sh     # Mac/Linux

# Sign up
fly auth signup
```

### Step 2: Deploy
```bash
cd cloud-deploy
fly launch
# Follow prompts
fly deploy
```

### Step 3: Get URL
```bash
fly status
# Your RPC: https://your-app.fly.dev
```

---

## 💰 Budget Option: DigitalOcean ($6/month)

### Step 1: Create Droplet
1. Go to https://digitalocean.com
2. Create → Droplets
3. Choose: Ubuntu 22.04, $6/month plan
4. Create

### Step 2: SSH & Deploy
```bash
ssh root@your-droplet-ip

# Install Docker
curl -fsSL https://get.docker.com | sh

# Deploy
git clone <your-repo> idgaf-chain
cd idgaf-chain/node-setup
./deploy-node.sh
```

### Step 3: Setup Domain
- Add domain in DigitalOcean
- Point `rpc.idgaf.chain` to droplet IP

---

## ☁️ Enterprise Option: AWS (Free for 12 months)

See `aws.md` for detailed guide.

---

## 📊 Comparison

| Platform | Cost | Setup Time | Best For |
|----------|------|------------|----------|
| Railway | $5 free, then ~$10/mo | 5 min | ⭐ Quick testing |
| Render | Free (sleeps) | 10 min | Development |
| Fly.io | Free tier available | 15 min | Production |
| DigitalOcean | $6/mo | 20 min | Budget production |
| AWS | Free 12mo, then ~$10/mo | 30 min | Enterprise |

---

## 🎯 Recommendation

**For Quick Start**: Railway
- Fastest setup
- $5 free credit
- No credit card needed initially

**For Free Testing**: Render
- Completely free
- Easy setup
- Good for development

**For Production**: Fly.io or DigitalOcean
- Reliable
- Good performance
- Reasonable cost

---

## Next Steps After Deployment

1. **Update RPC URLs**:
   ```bash
   ./node-setup/update-rpc-config.sh
   ```

2. **Deploy Contracts**:
   ```bash
   npm run deploy:l2
   ```

3. **Test Connection**:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
     https://your-rpc-url
   ```

4. **Add to MetaMask**:
   - Network: IDGAF Chain
   - RPC: Your deployed URL
   - Chain ID: 10144

