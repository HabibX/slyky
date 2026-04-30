// adapters/mock/MockAdapter.ts

import { IRailAdapter, ReceiveAddress, NormalizedTransaction, TransactionStatus, FeeEstimate } from '../../core/interfaces/IRailAdapter';

export class MockAdapter implements IRailAdapter {
  readonly asset = 'MOCK';
  readonly network = 'mocknet';
  readonly requiredConfirmations = 0;

  async generateReceiveAddress(paymentId: string): Promise<ReceiveAddress> {
    return {
      address: `MOCK_ADDR_${paymentId}`,
      memo: `memo_${paymentId}`,
    };
  }

  startListening(callback: (tx: NormalizedTransaction) => void): void {
    // Simule une transaction après 5 secondes
    setTimeout(() => {
      callback({
        txHash: 'mock_tx_123',
        asset: 'MOCK',
        amount: '50',
        from: 'mock_sender',
        to: `MOCK_ADDR_test`,
        memo: 'memo_test',
        confirmations: 1,
        isFinal: true,
      });
    }, 5000);
    console.log('MockAdapter listening started (simulated)');
  }

  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    return {
      status: 'confirmed',
      confirmations: 1,
      requiredConfirmations: 0,
      isFinal: true,
    };
  }

  async estimateFee(amount: string, from?: string): Promise<FeeEstimate> {
    return {
      amount: '0',
      currency: 'MOCK',
      description: 'Mock fee',
    };
  }

  async estimateSettlementTime(): Promise<number> {
    return 0;
  }

  async healthCheck(): Promise<{ healthy: boolean; latency: number }> {
    return { healthy: true, latency: 0 };
  }
}