# PowerShell script to deploy with GitHub repo URL
# Usage: .\deploy-with-repo.ps1 <github-repo-url>

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl,
    
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = "rnd_BgrRauOTQXq4qt2bOnXjnhUJ3Y23"
)

Write-Host "`n🚀 Deploying IDGAF Chain to Render" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

Write-Host "Repository: $RepoUrl" -ForegroundColor Yellow
Write-Host "API Key: $($ApiKey.Substring(0,10))..." -ForegroundColor Yellow

Write-Host "`n⏳ Starting deployment...`n" -ForegroundColor Cyan

$env:RENDER_API_KEY = $ApiKey
node cloud-deploy/deploy-render-quick.js $ApiKey $RepoUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment initiated successfully!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Deployment failed. Check the error above.`n" -ForegroundColor Red
}

