#!/bin/bash

# Interactive cloud deployment setup script
# Helps you choose and setup cloud deployment

set -e

echo "☁️  IDGAF Chain Cloud Deployment Setup"
echo "======================================"
echo ""
echo "Choose your cloud platform:"
echo "1) Railway (Easiest, $5 free credit)"
echo "2) Render (Free tier, sleeps after inactivity)"
echo "3) Fly.io (Generous free tier)"
echo "4) DigitalOcean ($6/month, simple)"
echo "5) AWS (Free for 12 months)"
echo "6) Exit"
echo ""

read -p "Enter choice (1-6): " choice

case $choice in
  1)
    echo "🚂 Setting up Railway deployment..."
    if ! command -v railway &> /dev/null; then
      echo "Installing Railway CLI..."
      npm i -g @railway/cli
    fi
    railway login
    railway init
    railway variables set NETWORK_ID=10144
    railway variables set CHAIN_ID=10144
    echo "✅ Railway setup complete!"
    echo "Run: railway up"
    ;;
  2)
    echo "🎨 Setting up Render deployment..."
    echo "1. Go to https://render.com"
    echo "2. Create new Web Service"
    echo "3. Connect your GitHub repo"
    echo "4. Use cloud-deploy/render.yaml config"
    echo "5. Deploy!"
    ;;
  3)
    echo "✈️  Setting up Fly.io deployment..."
    if ! command -v fly &> /dev/null; then
      echo "Installing Fly CLI..."
      curl -L https://fly.io/install.sh | sh
    fi
    fly auth signup
    fly launch
    echo "✅ Fly.io setup complete!"
    ;;
  4)
    echo "💧 Setting up DigitalOcean deployment..."
    echo "1. Go to https://digitalocean.com"
    echo "2. Create Droplet ($6/month)"
    echo "3. SSH into droplet"
    echo "4. Run: curl -fsSL https://get.docker.com | sh"
    echo "5. Clone repo and run: ./node-setup/deploy-node.sh"
    ;;
  5)
    echo "☁️  Setting up AWS deployment..."
    echo "1. Go to https://aws.amazon.com"
    echo "2. Launch EC2 instance (t2.micro - free tier)"
    echo "3. SSH into instance"
    echo "4. Follow aws.md guide"
    ;;
  6)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "📚 See cloud-deploy/QUICK_DEPLOY.md for detailed instructions"

