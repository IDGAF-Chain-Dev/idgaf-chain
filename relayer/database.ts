import { ethers } from "ethers";

/**
 * Database interface for transaction history
 * In production, implement with actual database (PostgreSQL, MongoDB, etc.)
 */

export interface DepositRecord {
  depositId: string;
  userAddress: string;
  amount: string;
  l1TxHash?: string;
  l2TxHash?: string;
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

export interface WithdrawalRecord {
  withdrawalId: string;
  userAddress: string;
  amount: string;
  l2TxHash?: string;
  l1TxHash?: string;
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

export class TransactionDatabase {
  // In-memory storage (for development)
  // In production, replace with actual database
  private deposits: Map<string, DepositRecord> = new Map();
  private withdrawals: Map<string, WithdrawalRecord> = new Map();

  async saveDeposit(record: DepositRecord): Promise<void> {
    this.deposits.set(record.depositId, record);
    console.log(`💾 Saved deposit: ${record.depositId}`);
  }

  async saveWithdrawal(record: WithdrawalRecord): Promise<void> {
    this.withdrawals.set(record.withdrawalId, record);
    console.log(`💾 Saved withdrawal: ${record.withdrawalId}`);
  }

  async updateDepositStatus(
    depositId: string,
    status: DepositRecord['status'],
    l2TxHash?: string
  ): Promise<void> {
    const record = this.deposits.get(depositId);
    if (record) {
      record.status = status;
      if (l2TxHash) record.l2TxHash = l2TxHash;
      if (status === 'processed') record.processedAt = new Date();
      this.deposits.set(depositId, record);
    }
  }

  async updateWithdrawalStatus(
    withdrawalId: string,
    status: WithdrawalRecord['status'],
    l1TxHash?: string
  ): Promise<void> {
    const record = this.withdrawals.get(withdrawalId);
    if (record) {
      record.status = status;
      if (l1TxHash) record.l1TxHash = l1TxHash;
      if (status === 'processed') record.processedAt = new Date();
      this.withdrawals.set(withdrawalId, record);
    }
  }

  async getDeposit(depositId: string): Promise<DepositRecord | undefined> {
    return this.deposits.get(depositId);
  }

  async getWithdrawal(withdrawalId: string): Promise<WithdrawalRecord | undefined> {
    return this.withdrawals.get(withdrawalId);
  }

  async getRecentDeposits(limit: number = 10): Promise<DepositRecord[]> {
    return Array.from(this.deposits.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getRecentWithdrawals(limit: number = 10): Promise<WithdrawalRecord[]> {
    return Array.from(this.withdrawals.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getStats(): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalVolume: string;
    pendingDeposits: number;
    pendingWithdrawals: number;
  }> {
    const deposits = Array.from(this.deposits.values());
    const withdrawals = Array.from(this.withdrawals.values());

    const totalVolume = deposits
      .filter(d => d.status === 'processed')
      .reduce((sum, d) => sum + BigInt(d.amount), 0n)
      .toString();

    return {
      totalDeposits: deposits.length,
      totalWithdrawals: withdrawals.length,
      totalVolume,
      pendingDeposits: deposits.filter(d => d.status === 'pending').length,
      pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
    };
  }
}

