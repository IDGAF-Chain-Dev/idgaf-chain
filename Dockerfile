# Dockerfile for Render deployment (root level)
FROM ethereum/client-go:latest

# Set working directory
WORKDIR /app

# Copy genesis file
COPY chain-config/genesis-mainnet-fixed.json /genesis.json

# Create data directory
RUN mkdir -p /data

# Find geth location and create entrypoint script
RUN which geth > /geth_path.txt || find / -name geth -type f 2>/dev/null | head -1 > /geth_path.txt || echo "/usr/local/bin/geth" > /geth_path.txt

# Initialize chain (skip if already initialized)
RUN GETH_PATH=$(cat /geth_path.txt) && \
    if [ ! -f /data/geth/chaindata/CURRENT ]; then \
      $GETH_PATH --datadir /data init /genesis.json || true; \
    fi

# Expose ports
EXPOSE 8545 8546 30303

# Create entrypoint script
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'GETH_PATH=$(cat /geth_path.txt)' >> /entrypoint.sh && \
    echo 'exec $GETH_PATH --networkid 10144 --datadir /data --http --http.addr 0.0.0.0 --http.port 8545 --http.api eth,net,web3,txpool --http.corsdomain "*" --http.vhosts "*" --ws --ws.addr 0.0.0.0 --ws.port 8546 --ws.api eth,net,web3 --ws.origins "*" --allow-insecure-unlock --rpc.allow-unprotected-txs --nodiscover' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Use entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
