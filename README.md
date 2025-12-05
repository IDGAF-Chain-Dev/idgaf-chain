# IDGAF Chain

A Layer 2 blockchain built on top of the Monad chain. Enables bridging of IDGAF tokens between Monad (L1) and IDGAF Chain (L2).

## Overview

IDGAF Chain is a Layer 2 solution based on the Monad mainnet, providing the following features:

- **Bidirectional Bridge**: Token transfers between Monad ↔ IDGAF Chain
- **IDGAF Token Support**: L1 token address `0x87deEb3696Ec069d5460C389cc78925df50d7777`
- **Secure Token Wrapping**: Convert L1 tokens to a usable form on L2

## Architecture

```
Monad (L1)                    IDGAF Chain (L2)
┌─────────────┐              ┌─────────────────┐
│ IDGAF Token │              │ IDGAFTokenL2     │
│ 0x87de...   │              │ (Wrapped Token)  │
└──────┬──────┘              └────────┬─────────┘
       │                              │
       │                              │
┌──────▼──────────┐          ┌────────▼────────────┐
│ IDGAFBridge     │◄────────►│ IDGAFChainBridge    │
│ (L1 Bridge)     │          │ (L2 Bridge)          │
└─────────────────┘          └─────────────────────┘
```

### Key Contracts

1. **IDGAFBridge** (L1): Bridge contract deployed on Monad chain
   - Receives L1 tokens and prepares for L2 transfer
   - Processes withdrawal requests from L2

2. **IDGAFChainBridge** (L2): Bridge contract deployed on IDGAF Chain
   - Processes deposits from L1 and mints L2 tokens
   - Processes withdrawal requests from L2 and burns tokens

3. **IDGAFTokenL2** (L2): Wrapped IDGAF token used on L2
   - Exchangeable with L1 tokens at 1:1 ratio
   - Can only be minted/burned by the bridge

## Installation

```bash
# Install dependencies
npm install

# or
yarn install
```

## Environment Setup

Create a `.env` file and set the following variables:

```env
# Monad network configuration
MONAD_RPC_URL=https://rpc.monad.xyz
MONAD_CHAIN_ID=143

# IDGAF Chain network configuration
IDGAF_RPC_URL=https://rpc.idgaf.chain
IDGAF_CHAIN_ID=10144

# Private key for deployment (DO NOT SHARE!)
PRIVATE_KEY=your_private_key_here
```

## Compilation

```bash
npm run compile
```

## Testing

```bash
npm test
```

## Deployment

### Deploy to Local Network

```bash
# Start Hardhat local node (in separate terminal)
npx hardhat node

# Run deployment
npm run deploy
```

### Deploy to Monad and IDGAF Chain

```bash
# Deploy L1 bridge to Monad
npm run deploy:l1

# Deploy L2 contracts to IDGAF Chain
npm run deploy:l2

# Setup bridge connection
npx hardhat run scripts/setup-bridge.ts --network idgaf
```

## Usage

### L1 → L2 (Deposit)

1. Deposit IDGAF tokens to L1 bridge on Monad:
```solidity
// Call deposit function of IDGAFBridge contract
bridge.deposit(amount);
```

2. Relayer/operator processes deposit on L2 bridge:
```solidity
// Call processDeposit function of IDGAFChainBridge contract
l2Bridge.processDeposit(user, amount, depositId);
```

### L2 → L1 (Withdrawal)

1. Initiate withdrawal on L2:
```solidity
// Call initiateWithdrawal function of IDGAFChainBridge contract
l2Bridge.initiateWithdrawal(amount);
```

2. Relayer/operator processes withdrawal on L1 bridge:
```solidity
// Call withdraw function of IDGAFBridge contract
l1Bridge.withdraw(user, amount, withdrawalId);
```

## Security Considerations

- Set bridge operators to trusted addresses only
- All transactions use `nonReentrant` modifier to prevent reentrancy attacks
- Audit all contracts before deployment

## Network Information

### IDGAF Chain
- **Chain ID**: 10144
- **Native Token**: IDGAF
- **RPC URL**: `https://rpc.idgaf.chain`
- **Explorer**: `https://explorer.idgaf.chain`

### Monad
- **Chain ID**: 143
- **IDGAF Token**: `0x87deEb3696Ec069d5460C389cc78925df50d7777`

## License

MIT

## Contributing

Issues and pull requests are welcome!
