# Dockerfile for Render deployment (root level)
FROM ethereum/client-go:latest

# Set working directory
WORKDIR /app

# Copy genesis file
COPY chain-config/genesis-mainnet-fixed.json /genesis.json

# Create data directory
RUN mkdir -p /data

# Initialize chain (if data doesn't exist)
# Use full path to geth or ensure it's in PATH
RUN if [ ! -f /data/geth/chaindata/CURRENT ]; then \
      /usr/local/bin/geth --datadir /data init /genesis.json || \
      geth --datadir /data init /genesis.json || \
      /usr/bin/geth --datadir /data init /genesis.json || true; \
    fi

# Expose ports
EXPOSE 8545 8546 30303

# Start Geth with full path
CMD ["/usr/local/bin/geth", \
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
