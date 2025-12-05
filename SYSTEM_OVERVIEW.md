# IDGAF Chain System Overview

Complete Layer 2 bridge system on Monad blockchain.

## System Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Frontend UI   │────────▶│   API Server     │
│  (index.html)   │         │   (Express.js)   │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────┐
│         Smart Contracts                     │
│  ┌──────────────┐      ┌──────────────┐    │
│  │ L1 Bridge    │◄────►│ L2 Bridge    │    │
│  │ (Monad)      │      │ (IDGAF)      │    │
│  └──────────────┘      └──────────────┘    │
└─────────────────────────────────────────────┘
         ▲                           ▲
         │                           │
         │                           │
┌────────┴────────┐         ┌────────┴────────┐
│  Relayer       │         │  Database       │
│  (Event Monitor)│         │  (Transaction   │
│                │         │   History)       │
└────────────────┘         └─────────────────┘
```

## Components

### 1. Smart Contracts
- **IDGAFBridge (L1)**: Monad network bridge
- **IDGAFChainBridge (L2)**: IDGAF Chain bridge
- **IDGAFTokenL2**: L2 wrapped token

### 2. Relayer Service
- Monitors L1/L2 events
- Automatically processes deposits/withdrawals
- Tracks transactions in database

### 3. API Server
- RESTful API for bridge status
- Real-time statistics
- Contract address queries

### 4. Frontend
- Web interface for bridging
- MetaMask integration
- Real-time status updates

### 5. Database
- Transaction history
- Statistics tracking
- Audit logs

## Quick Start

### 1. Start API Server
```bash
npm run api:start
# or for development
npm run api:dev
```

### 2. Start Relayer
```bash
npm run relayer
```

### 3. Start Frontend
```bash
cd frontend
python -m http.server 8000
# Open http://localhost:8000/index-simple.html
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/status` - Bridge status
- `GET /api/stats` - Statistics
- `GET /api/contracts` - Contract addresses
- `GET /api/transactions` - Transaction history

## Deployment Status

### Monad (L1)
- Bridge: `0x006a5044781F97475390F33E3E1c903e393fcc3d`
- Token: `0x87deEb3696Ec069d5460C389cc78925df50d7777`

### IDGAF Chain (L2)
- Bridge: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- Token: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

## Monitoring

- Dashboard: `monitoring/dashboard.html`
- API: `http://localhost:3001/api/status`
- Relayer logs: Console output

## Next Steps

1. Set up production database (PostgreSQL/MongoDB)
2. Deploy to production servers
3. Set up monitoring and alerts
4. Complete security audit
5. Launch to users

