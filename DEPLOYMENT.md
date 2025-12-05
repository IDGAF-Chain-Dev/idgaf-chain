# Deployment Guide

Step-by-step guide for deploying the IDGAF Chain bridge system.

## Prerequisites

1. Node.js and npm installed
2. Hardhat installed (`npm install`)
3. Access to Monad and IDGAF Chain networks
4. Private key for deployment account (with sufficient gas)

## Deployment Order

### Step 1: Environment Setup

Create a `.env` file and set the required variables:

```env
MONAD_RPC_URL=https://rpc.monad.xyz
MONAD_CHAIN_ID=143
IDGAF_RPC_URL=https://rpc.idgaf.chain
IDGAF_CHAIN_ID=10144
PRIVATE_KEY=your_private_key_here
```

### Step 2: Compile Contracts

```bash
npm run compile
```

### Step 3: Deploy L2 Contracts (IDGAF Chain)

```bash
npm run deploy:l2
```

Contracts deployed in this step:
- `IDGAFTokenL2`: Wrapped token for use on L2
- `IDGAFChainBridge`: L2 bridge contract

Record the addresses after deployment.

### Step 4: Deploy L1 Contracts (Monad)

```bash
npm run deploy:l1
```

Contracts deployed in this step:
- `IDGAFBridge`: L1 bridge contract

### Step 5: Setup Bridge Connection

Connect L1 and L2 bridges:

```bash
# Set L1 bridge address on L2 bridge
npx hardhat run scripts/setup-bridge.ts --network idgaf
```

### Step 6: Setup Bridge Operator

Add a trusted operator to L1 bridge:

```typescript
// Example in scripts/set-operator.ts
const bridge = await ethers.getContractAt("IDGAFBridge", l1BridgeAddress);
await bridge.setBridgeOperator(operatorAddress, true);
```

### Step 7: Verify Deployment

```bash
npx hardhat run scripts/verify-contracts.ts --network idgaf
npx hardhat run scripts/verify-contracts.ts --network monad
```

## Post-Deployment Checklist

1. ✅ Verify all contracts are deployed to correct addresses
2. ✅ Verify bridge address is correctly set on L2 token
3. ✅ Verify Monad bridge address is correctly set on L2 bridge
4. ✅ Verify IDGAF token address on L1 bridge is `0x87deEb3696Ec069d5460C389cc78925df50d7777`
5. ✅ Verify bridge operator is correctly configured

## Relayer Setup

In production, you should set up a relayer to monitor L1 and L2 events and process them automatically.

See `scripts/relayer-example.ts` for example relayer code.

## Troubleshooting

### Deployment Failure

- Check if gas is sufficient
- Verify network connectivity
- Check for contract compilation errors

### Bridge Connection Failure

- Verify deployment addresses are correct
- Verify networks are correct
- Verify transactions succeeded

## Security Checklist

- [ ] All contracts compiled with latest version
- [ ] Owner address is a multisig wallet
- [ ] Bridge operator is a trusted address
- [ ] All contracts audited before deployment
- [ ] Sufficiently tested on testnet
