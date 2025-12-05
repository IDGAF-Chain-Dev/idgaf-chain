# Simple PowerShell script for Render deployment
# This script helps you prepare and provides step-by-step instructions

Write-Host "`n🚀 IDGAF Chain - Render Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script will help you deploy to Render." -ForegroundColor Yellow
Write-Host "`n📋 Prerequisites:" -ForegroundColor Cyan
Write-Host "  1. Render account (you have this ✅)" -ForegroundColor Green
Write-Host "  2. GitHub repository with your code" -ForegroundColor Yellow
Write-Host "  3. Render API Key (optional, for automation)" -ForegroundColor Yellow

Write-Host "`n🔑 Get Render API Key:" -ForegroundColor Cyan
Write-Host "  1. Go to: https://dashboard.render.com/account/api-keys" -ForegroundColor White
Write-Host "  2. Click 'New API Key'" -ForegroundColor White
Write-Host "  3. Copy the key" -ForegroundColor White

$apiKey = Read-Host "`nEnter Render API Key (or press Enter to skip automation)"

if ($apiKey) {
    Write-Host "`n✅ API Key received. Setting up automated deployment..." -ForegroundColor Green
    
    # Check if Node.js is available
    try {
        $nodeVersion = node --version
        Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
        
        Write-Host "`n🚀 Running automated deployment script..." -ForegroundColor Cyan
        $env:RENDER_API_KEY = $apiKey
        node cloud-deploy/deploy-render-auto.js
    } catch {
        Write-Host "`n⚠️  Node.js not found. Using manual method instead." -ForegroundColor Yellow
        $apiKey = $null
    }
}

if (-not $apiKey) {
    Write-Host "`n📝 Manual Deployment Steps:" -ForegroundColor Cyan
    Write-Host "`n1️⃣  Open Render Dashboard" -ForegroundColor Yellow
    Write-Host "   https://dashboard.render.com" -ForegroundColor White
    
    Write-Host "`n2️⃣  Create New Web Service" -ForegroundColor Yellow
    Write-Host "   - Click 'New +' button" -ForegroundColor White
    Write-Host "   - Select 'Web Service'" -ForegroundColor White
    
    Write-Host "`n3️⃣  Connect Repository" -ForegroundColor Yellow
    Write-Host "   - Click 'Connect a repository'" -ForegroundColor White
    Write-Host "   - Select your GitHub repository" -ForegroundColor White
    Write-Host "   - Or enter public repo URL" -ForegroundColor White
    
    Write-Host "`n4️⃣  Configure Service" -ForegroundColor Yellow
    Write-Host "   Name: idgaf-chain-node" -ForegroundColor White
    Write-Host "   Region: Oregon (US West) or closest" -ForegroundColor White
    Write-Host "   Branch: main" -ForegroundColor White
    Write-Host "   Environment: Docker" -ForegroundColor White
    Write-Host "   Dockerfile Path: cloud-deploy/Dockerfile.render" -ForegroundColor White
    Write-Host "   Docker Context: . (root)" -ForegroundColor White
    
    Write-Host "`n5️⃣  Add Environment Variables" -ForegroundColor Yellow
    Write-Host "   Click 'Advanced' → 'Environment Variables'" -ForegroundColor White
    Write-Host "   Add:" -ForegroundColor White
    Write-Host "     NETWORK_ID = 10144" -ForegroundColor Green
    Write-Host "     CHAIN_ID = 10144" -ForegroundColor Green
    
    Write-Host "`n6️⃣  Deploy" -ForegroundColor Yellow
    Write-Host "   - Click 'Create Web Service'" -ForegroundColor White
    Write-Host "   - Wait for build (5-10 minutes)" -ForegroundColor White
    Write-Host "   - Get your RPC URL!" -ForegroundColor White
    
    Write-Host "`n✅ After deployment, your RPC will be:" -ForegroundColor Green
    Write-Host "   https://idgaf-chain-node-xxxx.onrender.com" -ForegroundColor Cyan
    
    Write-Host "`n💡 Need help? Check:" -ForegroundColor Yellow
    Write-Host "   - cloud-deploy/RENDER_DEPLOY_NOW.md" -ForegroundColor White
    Write-Host "   - cloud-deploy/render-checklist.md" -ForegroundColor White
}

Write-Host "`n✨ Done! Good luck with your deployment!`n" -ForegroundColor Green

