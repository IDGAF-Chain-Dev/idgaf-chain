# IDGAF Bridge API

RESTful API server for querying bridge status and statistics.

## Installation

```bash
cd api
npm install
```

## Configuration

Create a `.env` file in the `api` directory:

```env
API_PORT=3001
MONAD_RPC_URL=https://rpc1.monad.xyz
IDGAF_RPC_URL=http://localhost:8546
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Bridge Status
```
GET /api/status
```

Returns:
- L1 bridge status and balance
- L2 bridge status and supply
- Connection status between bridges

### Statistics
```
GET /api/stats
```

Returns:
- Total deposits/withdrawals
- Total volume
- Current balances

### Contract Addresses
```
GET /api/contracts
```

Returns all deployed contract addresses.

### Transaction History
```
GET /api/transactions
```

Returns transaction history (requires database integration).

## Example Usage

```bash
# Check status
curl http://localhost:3001/api/status

# Get statistics
curl http://localhost:3001/api/stats

# Get contracts
curl http://localhost:3001/api/contracts
```

## Integration with Frontend

Update frontend to fetch data from API:

```javascript
const response = await fetch('http://localhost:3001/api/status');
const status = await response.json();
```

