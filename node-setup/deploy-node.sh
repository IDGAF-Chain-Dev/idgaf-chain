#!/bin/bash

# IDGAF Chain Node Deployment Script
# This script sets up a production IDGAF Chain node

set -e

echo "🚀 IDGAF Chain Node Deployment Script"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "❌ Please do not run as root"
   exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
sudo apt-get update
sudo apt-get install -y curl wget git build-essential

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create directories
echo "📁 Creating directories..."
mkdir -p ~/idgaf-chain/node-setup/data
mkdir -p ~/idgaf-chain/node-setup/ssl

# Copy configuration files
echo "📋 Copying configuration files..."
cp genesis-mainnet.json ~/idgaf-chain/node-setup/genesis.json
cp docker-compose.yml ~/idgaf-chain/node-setup/
cp nginx.conf ~/idgaf-chain/node-setup/

# Setup SSL certificates (if not exists)
if [ ! -f ~/idgaf-chain/node-setup/ssl/cert.pem ]; then
    echo "🔒 Generating self-signed certificate (replace with Let's Encrypt in production)..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ~/idgaf-chain/node-setup/ssl/key.pem \
        -out ~/idgaf-chain/node-setup/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=IDGAF/CN=rpc.idgaf.chain"
fi

# Initialize node
echo "🔧 Initializing node..."
cd ~/idgaf-chain/node-setup
docker-compose run --rm idgaf-node geth --datadir /root/.ethereum init /genesis.json

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for node to start
echo "⏳ Waiting for node to start..."
sleep 10

# Verify node
echo "✅ Verifying node..."
CHAIN_ID=$(curl -s -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
    http://localhost:8545 | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

if [ "$CHAIN_ID" = "0x2790" ] || [ "$CHAIN_ID" = "10144" ]; then
    echo "✅ Node is running correctly! Chain ID: $CHAIN_ID"
else
    echo "⚠️  Warning: Unexpected chain ID: $CHAIN_ID"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Node RPC: http://localhost:8545"
echo "WebSocket: ws://localhost:8546"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"

