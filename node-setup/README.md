# IDGAF Chain Node Setup Guide

Complete guide for setting up IDGAF Chain mainnet nodes.

## Network Information

- **Network Name**: IDGAF Chain
- **Website**: https://idgaf.chain
- **Chain ID**: 10144
- **Network ID**: 10144
- **Symbol**: IDGAF
- **Decimals**: 18

## RPC Endpoints

- `https://rpc.idgaf.chain`
- `https://rpc1.idgaf.chain`
- `https://rpc2.idgaf.chain`
- `https://rpc3.idgaf.chain`
- `https://rpc-mainnet.idgaf.chain`

## Block Explorers

- **IDGAF Explorer**: https://explorer.idgaf.chain
- **IDGAF Vision**: https://idgafvision.com

## Prerequisites

- Server with at least 4 CPU cores, 8GB RAM, 100GB+ storage
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose (recommended)
- Or Geth/Erigon installed directly

## Option 1: Docker Setup (Recommended)

### 1. Clone and Setup

```bash
git clone <repository>
cd idgaf_chain/node-setup
```

### 2. Initialize Genesis Block

```bash
# Copy genesis file
cp ../chain-config/genesis-mainnet.json ./genesis.json

# Initialize node (if using Geth directly)
geth --datadir ./data init genesis.json
```

### 3. Start with Docker Compose

```bash
docker-compose up -d
```

### 4. Verify Node

```bash
# Check node status
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
  http://localhost:8545
```

## Option 2: Direct Geth Installation

### 1. Install Geth

```bash
# Ubuntu/Debian
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum

# Or download from https://geth.ethereum.org/downloads
```

### 2. Initialize Chain

```bash
# Create data directory
mkdir -p /var/lib/idgaf-chain

# Initialize with genesis
geth --datadir /var/lib/idgaf-chain init chain-config/genesis-mainnet.json
```

### 3. Start Node

```bash
geth \
  --networkid 10144 \
  --datadir /var/lib/idgaf-chain \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 8545 \
  --http.api eth,net,web3,txpool \
  --http.corsdomain "*" \
  --http.vhosts "*" \
  --ws \
  --ws.addr 0.0.0.0 \
  --ws.port 8546 \
  --ws.api eth,net,web3 \
  --ws.origins "*" \
  --allow-insecure-unlock \
  --rpc.allow-unprotected-txs
```

### 4. Create Systemd Service

Create `/etc/systemd/system/idgaf-chain.service`:

```ini
[Unit]
Description=IDGAF Chain Node
After=network.target

[Service]
Type=simple
User=idgaf
WorkingDirectory=/var/lib/idgaf-chain
ExecStart=/usr/bin/geth \
  --networkid 10144 \
  --datadir /var/lib/idgaf-chain \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 8545 \
  --http.api eth,net,web3,txpool \
  --http.corsdomain "*" \
  --http.vhosts "*" \
  --ws \
  --ws.addr 0.0.0.0 \
  --ws.port 8546 \
  --ws.api eth,net,web3 \
  --ws.origins "*" \
  --allow-insecure-unlock \
  --rpc.allow-unprotected-txs
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable idgaf-chain
sudo systemctl start idgaf-chain
sudo systemctl status idgaf-chain
```

## RPC Load Balancer Setup

### Using Nginx

1. Install Nginx:

```bash
sudo apt-get install nginx
```

2. Copy nginx configuration:

```bash
sudo cp node-setup/nginx.conf /etc/nginx/sites-available/idgaf-rpc
sudo ln -s /etc/nginx/sites-available/idgaf-rpc /etc/nginx/sites-enabled/
```

3. Setup SSL certificates (Let's Encrypt):

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d rpc.idgaf.chain -d rpc1.idgaf.chain
```

4. Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring

### Health Check Endpoint

Add to your node:

```bash
# Health check script
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

### Prometheus Metrics

Geth exposes metrics on port 6060 (if enabled):

```bash
geth --metrics --metrics.addr 0.0.0.0 --metrics.port 6060
```

## Security Considerations

1. **Firewall**: Only expose necessary ports
   ```bash
   sudo ufw allow 8545/tcp
   sudo ufw allow 8546/tcp
   sudo ufw allow 30303/tcp
   sudo ufw allow 30303/udp
   ```

2. **Rate Limiting**: Configure in Nginx
3. **SSL/TLS**: Always use HTTPS for RPC endpoints
4. **Authentication**: Consider adding API keys for production
5. **Monitoring**: Set up alerts for node health

## High Availability

For production, run multiple nodes:

1. **Primary Node**: Full node with all APIs
2. **Secondary Nodes**: Read-only replicas
3. **Load Balancer**: Distribute requests across nodes
4. **Backup**: Regular database backups

## Troubleshooting

### Node not syncing
- Check network connectivity
- Verify genesis block matches
- Check firewall rules

### RPC not responding
- Verify node is running: `ps aux | grep geth`
- Check logs: `journalctl -u idgaf-chain -f`
- Test locally: `curl http://localhost:8545`

### High memory usage
- Reduce `DatabaseCache` in config
- Enable pruning if supported
- Add more RAM or use Erigon (more efficient)

## Next Steps

1. Deploy multiple nodes for redundancy
2. Set up block explorer (Blockscout, Etherscan)
3. Configure monitoring and alerts
4. Set up backup procedures
5. Document operational procedures

