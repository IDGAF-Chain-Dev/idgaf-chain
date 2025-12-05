#!/bin/bash

# Update RPC configuration in all project files
# This script updates RPC URLs across the project

set -e

echo "🔄 Updating RPC configuration..."

# Update .env file
if [ -f .env ]; then
    sed -i 's|IDGAF_RPC_URL=.*|IDGAF_RPC_URL=https://rpc.idgaf.chain|g' .env
    echo "✅ Updated .env file"
fi

# Update hardhat.config.ts
if [ -f hardhat.config.ts ]; then
    sed -i 's|IDGAF_RPC_URL.*localhost:8546|IDGAF_RPC_URL || "https://rpc.idgaf.chain"|g' hardhat.config.ts
    echo "✅ Updated hardhat.config.ts"
fi

# Update frontend files
if [ -f frontend/app-simple.js ]; then
    sed -i "s|rpc: 'http://localhost:8546'|rpc: 'https://rpc.idgaf.chain'|g" frontend/app-simple.js
    echo "✅ Updated frontend/app-simple.js"
fi

if [ -f frontend/app.js ]; then
    sed -i "s|rpc: 'http://localhost:8546'|rpc: 'https://rpc.idgaf.chain'|g" frontend/app.js
    echo "✅ Updated frontend/app.js"
fi

# Update API server
if [ -f api/server.js ]; then
    sed -i "s|IDGAF_RPC_URL || 'http://localhost:8546'|IDGAF_RPC_URL || 'https://rpc.idgaf.chain'|g" api/server.js
    echo "✅ Updated api/server.js"
fi

# Update relayer
if [ -f relayer/index.ts ]; then
    sed -i "s|IDGAF_RPC_URL || 'http://localhost:8546'|IDGAF_RPC_URL || 'https://rpc.idgaf.chain'|g" relayer/index.ts
    echo "✅ Updated relayer/index.ts"
fi

echo ""
echo "✅ RPC configuration updated to production endpoints!"
echo ""
echo "Updated endpoints:"
echo "  - https://rpc.idgaf.chain"
echo "  - https://rpc1.idgaf.chain"
echo "  - https://rpc2.idgaf.chain"
echo "  - https://rpc3.idgaf.chain"

