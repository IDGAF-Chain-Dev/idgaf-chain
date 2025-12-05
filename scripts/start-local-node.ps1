# IDGAF Chain 로컬 노드 시작 스크립트
Write-Host "Starting IDGAF Chain local node on port 8546 with chain ID 10144..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx hardhat node --port 8546 --chain-id 10144"
Start-Sleep -Seconds 3
Write-Host "Node should be starting. Waiting 5 seconds..."
Start-Sleep -Seconds 5
Write-Host "Testing connection..."
npx hardhat run scripts/test-rpc.ts

