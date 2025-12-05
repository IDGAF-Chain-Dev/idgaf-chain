# IDGAF Chain Mainnet Deployment Guide

Complete guide for deploying IDGAF Chain as a production mainnet.

## Overview

This guide will help you deploy IDGAF Chain as a production-ready Layer 2 blockchain on Monad, similar to how Monad Chain is deployed.

## Prerequisites

- Server(s) with:
  - 4+ CPU cores
  - 8GB+ RAM
  - 100GB+ SSD storage
  - Ubuntu 20.04+ or similar
- Domain name(s) for RPC endpoints
- SSL certificates (Let's Encrypt recommended)
- Basic Linux server administration knowledge

## Step 1: Server Setup

### 1.1 Initial Server Configuration

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install basic tools
sudo apt-get install -y curl wget git build-essential

# Create user for node
sudo useradd -m -s /bin/bash idgaf
sudo usermod -aG sudo idgaf
```

### 1.2 Install Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker idgaf
```

## Step 2: Deploy Node

### 2.1 Clone Repository

```bash
cd /opt
sudo git clone <your-repo-url> idgaf-chain
sudo chown -R idgaf:idgaf idgaf-chain
cd idgaf-chain/node-setup
```

### 2.2 Run Deployment Script

```bash
./deploy-node.sh
```

Or manually:

```bash
# Initialize genesis
docker-compose run --rm idgaf-node geth --datadir /root/.ethereum init /genesis.json

# Start node
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f idgaf-node
```

## Step 3: Configure RPC Endpoints

### 3.1 DNS Setup

Point your domains to server IP:

```
rpc.idgaf.chain      → YOUR_SERVER_IP
rpc1.idgaf.chain     → YOUR_SERVER_IP
rpc2.idgaf.chain     → YOUR_SERVER_IP_2 (if multiple servers)
rpc3.idgaf.chain     → YOUR_SERVER_IP_3
```

### 3.2 SSL Certificates

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificates
sudo certbot certonly --standalone -d rpc.idgaf.chain -d rpc1.idgaf.chain

# Copy certificates to node-setup/ssl/
sudo cp /etc/letsencrypt/live/rpc.idgaf.chain/fullchain.pem node-setup/ssl/cert.pem
sudo cp /etc/letsencrypt/live/rpc.idgaf.chain/privkey.pem node-setup/ssl/key.pem
sudo chown $USER:$USER node-setup/ssl/*
```

### 3.3 Configure Nginx

```bash
# Install Nginx
sudo apt-get install nginx

# Copy config
sudo cp node-setup/nginx.conf /etc/nginx/sites-available/idgaf-rpc
sudo ln -s /etc/nginx/sites-available/idgaf-rpc /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step 4: Deploy Contracts

### 4.1 Update RPC Configuration

```bash
# Run update script
./node-setup/update-rpc-config.sh

# Or manually update .env
IDGAF_RPC_URL=https://rpc.idgaf.chain
```

### 4.2 Deploy to IDGAF Chain

```bash
# Deploy L2 contracts
npm run deploy:l2

# Verify deployment
npm run status
```

## Step 5: Setup Block Explorer

### Option A: Blockscout

```bash
# Clone Blockscout
git clone https://github.com/blockscout/blockscout
cd blockscout

# Configure for IDGAF Chain
# Update docker-compose.yml with IDGAF Chain settings
# Set RPC URL to https://rpc.idgaf.chain
# Set Chain ID to 10144

docker-compose up -d
```

### Option B: Custom Explorer

Deploy your own explorer or use a service like:
- Etherscan API
- The Graph
- Custom solution

## Step 6: High Availability Setup

### 6.1 Multiple Nodes

Deploy nodes on multiple servers:

```bash
# Server 1: Primary
# Server 2: Secondary
# Server 3: Tertiary
```

### 6.2 Load Balancer

Configure load balancer (AWS ELB, Cloudflare, etc.) to distribute traffic:

```
Load Balancer → rpc1.idgaf.chain
              → rpc2.idgaf.chain
              → rpc3.idgaf.chain
```

## Step 7: Monitoring

### 7.1 Setup Monitoring

```bash
# Install Prometheus
# Install Grafana
# Configure alerts
```

### 7.2 Health Checks

```bash
# Create health check endpoint
# Monitor node sync status
# Monitor RPC availability
```

## Step 8: Update Documentation

1. Update `NETWORK_INFO.md` with actual endpoints
2. Submit to Chainlist.org
3. Update website with network info
4. Announce on social media

## Step 9: Production Checklist

- [ ] Nodes running and synced
- [ ] RPC endpoints accessible
- [ ] SSL certificates valid
- [ ] Contracts deployed
- [ ] Block explorer working
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Support channels ready

## Maintenance

### Regular Tasks

- Monitor node health
- Update node software
- Renew SSL certificates
- Backup database
- Review logs
- Update documentation

### Updates

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose build

# Restart services
docker-compose restart
```

## Troubleshooting

See `node-setup/README.md` for detailed troubleshooting guide.

## Support

For deployment assistance:
- Documentation: https://docs.idgaf.chain
- Discord: https://discord.gg/idgaf
- Email: support@idgaf.chain

