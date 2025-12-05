# Simple PowerShell script to upload Dockerfile to GitHub
# Usage: .\upload-simple.ps1 <github-token>

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$false)]
    [string]$Owner = "IDGAF-Chain-Dev",
    
    [Parameter(Mandatory=$false)]
    [string]$Repo = "idgaf-chain"
)

Write-Host "`n📤 Uploading Dockerfile to GitHub" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

Write-Host "Repository: $Owner/$Repo" -ForegroundColor Yellow
Write-Host "Token: $($Token.Substring(0, [Math]::Min(10, $Token.Length)))..." -ForegroundColor Yellow

Write-Host "`n⏳ Uploading...`n" -ForegroundColor Cyan

node cloud-deploy/upload-dockerfile.js $Token $Owner $Repo

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Upload complete!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Upload failed. Check the error above.`n" -ForegroundColor Red
}

