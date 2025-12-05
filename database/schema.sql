-- IDGAF Bridge Transaction History Database Schema

CREATE TABLE IF NOT EXISTS deposits (
    id SERIAL PRIMARY KEY,
    deposit_id VARCHAR(66) UNIQUE NOT NULL,
    user_address VARCHAR(42) NOT NULL,
    amount VARCHAR(78) NOT NULL,
    l1_tx_hash VARCHAR(66),
    l2_tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    INDEX idx_deposit_id (deposit_id),
    INDEX idx_user_address (user_address),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS withdrawals (
    id SERIAL PRIMARY KEY,
    withdrawal_id VARCHAR(66) UNIQUE NOT NULL,
    user_address VARCHAR(42) NOT NULL,
    amount VARCHAR(78) NOT NULL,
    l2_tx_hash VARCHAR(66),
    l1_tx_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    INDEX idx_withdrawal_id (withdrawal_id),
    INDEX idx_user_address (user_address),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS bridge_stats (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_deposits INTEGER DEFAULT 0,
    total_withdrawals INTEGER DEFAULT 0,
    total_volume VARCHAR(78) DEFAULT '0',
    l1_balance VARCHAR(78) DEFAULT '0',
    l2_supply VARCHAR(78) DEFAULT '0',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- View for recent transactions
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    'deposit' as type,
    deposit_id as tx_id,
    user_address,
    amount,
    status,
    created_at,
    l1_tx_hash,
    l2_tx_hash
FROM deposits
UNION ALL
SELECT 
    'withdrawal' as type,
    withdrawal_id as tx_id,
    user_address,
    amount,
    status,
    created_at,
    l2_tx_hash as l1_tx_hash,
    l1_tx_hash as l2_tx_hash
FROM withdrawals
ORDER BY created_at DESC
LIMIT 100;

