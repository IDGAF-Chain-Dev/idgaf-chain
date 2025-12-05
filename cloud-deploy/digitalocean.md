# Deploy IDGAF Chain on DigitalOcean

DigitalOcean is simple and affordable ($6/month).

## Step 1: Create Account

1. Go to https://www.digitalocean.com
2. Sign up (get $200 credit with referral)
3. Add payment method

## Step 2: Create Droplet

1. Click "Create" → "Droplets"
2. Choose:
   - Image: Ubuntu 22.04
   - Plan: Basic ($6/month - 1GB RAM, 1 vCPU)
   - Datacenter: Choose closest
   - Authentication: SSH keys (recommended) or password
3. Click "Create Droplet"

## Step 3: Connect

```bash
ssh root@your-droplet-ip
```

## Step 4: Setup Node

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone and deploy
git clone <your-repo> idgaf-chain
cd idgaf-chain/node-setup
./deploy-node.sh
```

## Step 5: Setup Firewall

In DigitalOcean dashboard:
1. Go to Networking → Firewalls
2. Create firewall with rules:
   - SSH (22)
   - HTTP (80)
   - HTTPS (443)
   - Custom (8545, 8546, 30303)
3. Apply to your droplet

## Step 6: Setup Domain

1. Go to Networking → Domains
2. Add domain: `idgaf.chain`
3. Add A records:
   - `rpc` → Your droplet IP
   - `rpc1` → Your droplet IP
   - etc.

## Pricing

- Basic Droplet: $6/month (1GB RAM)
- Recommended: $12/month (2GB RAM) for better performance
- Storage: Included (25GB on basic plan)

## Tips

- Use DigitalOcean's monitoring
- Setup backups ($1/month)
- Use load balancer for multiple nodes ($12/month)

