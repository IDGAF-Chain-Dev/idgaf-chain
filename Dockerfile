# Dockerfile for Render deployment (root level)
FROM ethereum/client-go:latest

# Set working directory
WORKDIR /app

# Copy genesis file
COPY chain-config/genesis-mainnet-fixed.json /genesis.json

# Create data directory
RUN mkdir -p /data

# Initialize chain (if data doesn't exist)
RUN if [ ! -f /data/geth/chaindata/CURRENT ]; then \
      geth --datadir /data init /genesis.json || true; \
    fi

# Expose ports
EXPOSE 8545 8546 30303

# Start Geth
CMD ["geth", \
     "--networkid", "10144", \
     "--datadir", "/data", \
     "--http", \
     "--http.addr", "0.0.0.0", \
     "--http.port", "8545", \
     "--http.api", "eth,net,web3,txpool", \
     "--http.corsdomain", "*", \
     "--http.vhosts", "*", \
     "--ws", \
     "--ws.addr", "0.0.0.0", \
     "--ws.port", "8546", \
     "--ws.api", "eth,net,web3", \
     "--ws.origins", "*", \
     "--allow-insecure-unlock", \
     "--rpc.allow-unprotected-txs", \
     "--nodiscover"]

