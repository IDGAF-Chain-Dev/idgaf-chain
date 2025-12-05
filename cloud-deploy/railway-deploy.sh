#!/bin/bash

# Railway Deployment Script for IDGAF Chain
# This prepares your project for Railway deployment

set -e

echo "🚂 Preparing IDGAF Chain for Railway deployment..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    curl -fsSL https://railway.app/install.sh | sh
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "📁 Creating Railway project..."
railway init

# Add environment variables
echo "⚙️ Setting environment variables..."
railway variables set NETWORK_ID=10144
railway variables set CHAIN_ID=10144
railway variables set HTTP_PORT=8545
railway variables set WS_PORT=8546

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Get your RPC URL from Railway dashboard:"
echo "https://railway.app/dashboard"
echo ""
echo "Your RPC endpoint will be:"
echo "https://your-app-name.railway.app"

