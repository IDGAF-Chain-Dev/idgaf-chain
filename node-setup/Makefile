.PHONY: init start stop restart logs status clean

init:
	@echo "Initializing IDGAF Chain node..."
	docker-compose run --rm idgaf-node geth --datadir /root/.ethereum init /genesis.json

start:
	@echo "Starting IDGAF Chain node..."
	docker-compose up -d
	@echo "Node started. Use 'make logs' to view logs."

stop:
	@echo "Stopping IDGAF Chain node..."
	docker-compose down

restart: stop start

logs:
	docker-compose logs -f idgaf-node

status:
	@echo "Checking node status..."
	@curl -s -X POST -H "Content-Type: application/json" \
		--data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
		http://localhost:8545 | grep -o '"result":"[^"]*"'

clean:
	@echo "Cleaning up..."
	docker-compose down -v
	rm -rf data/*

update:
	@echo "Updating node..."
	docker-compose pull
	docker-compose up -d

