# IDGAF Chain Quick Start Guide

## 🚀 Running the Complete System

### 1. Start Frontend (Simple Version - Recommended)

Simplest method:

1. Open `frontend/index-simple.html` in your browser
2. Connect MetaMask wallet
3. Start bridging!

### 2. Start Relayer Service

```bash
# Start relayer (monitors L1/L2 events and auto-processes)
npm run relayer
```

**Run L2 node in separate terminal (for local testing):**
```bash
npm run node:idgaf
```

### 3. Setup L1 Bridge Operator

Set relayer account as operator on L1 bridge:

```bash
npx hardhat run scripts/setup-operator.ts --network monad
```

## 📋 Checklist

### Required Setup
- [x] Smart contracts deployed
- [ ] Relayer service running
- [ ] L1 bridge operator configured
- [ ] Frontend accessible

### Testing
- [ ] Test L1 → L2 deposit
- [ ] Test L2 → L1 withdrawal
- [ ] Verify relayer auto-processing

## 🎯 Usage Scenarios

### Scenario 1: L1 → L2 Deposit

1. Select "Monad → IDGAF" in frontend
2. Enter amount (e.g., 100 IDGAF)
3. Click "Execute Bridge"
4. Approve transaction in MetaMask
5. Relayer automatically processes on L2
6. Verify tokens in L2 wallet

### Scenario 2: L2 → L1 Withdrawal

1. Select "IDGAF → Monad" in frontend
2. Enter amount
3. Click "Execute Bridge"
4. Approve transaction in MetaMask
5. Relayer automatically processes on L1
6. Verify tokens in Monad wallet

## 🔧 Useful Commands

```bash
# Check balance
npx hardhat run scripts/check-balance.ts --network monad

# Test bridge flow
npx hardhat run scripts/test-bridge-flow.ts --network hardhat

# Test RPC connection
npx hardhat run scripts/test-rpc.ts

# Verify contracts
npx hardhat run scripts/verify-contracts.ts --network monad
```

## 📍 Deployed Contract Addresses

### Monad (L1)
- **IDGAFBridge**: `0x006a5044781F97475390F33E3E1c903e393fcc3d`
- **IDGAF Token**: `0x87deEb3696Ec069d5460C389cc78925df50d7777`

### IDGAF Chain (L2)
- **IDGAFTokenL2**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **IDGAFChainBridge**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

## 🆘 Troubleshooting

### Relayer not working
- Check RPC URLs
- Verify network connectivity
- Check operator permissions

### Frontend transaction failures
- Verify MetaMask network
- Check gas fees
- Verify token balance

### Network connection errors
- Check `.env` file configuration
- Verify RPC endpoints are working

## 📚 Additional Documentation

- [README.md](./README.md) - Project overview
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - Deployment summary
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Next steps
- [relayer/README.md](./relayer/README.md) - Relayer guide
- [frontend/README.md](./frontend/README.md) - Frontend guide
