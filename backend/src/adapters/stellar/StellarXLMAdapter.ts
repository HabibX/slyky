// adapters/stellar/StellarXLMAdapter.ts

import {
  IRailAdapter,
  ReceiveAddress,
  NormalizedTransaction,
  TransactionStatus,
  FeeEstimate,
} from '../../core/interfaces/IRailAdapter';
import { Horizon, Keypair } from '@stellar/stellar-sdk';

export class StellarXLMAdapter implements IRailAdapter {
  readonly asset = 'XLM';
  readonly network = 'stellar';
  readonly requiredConfirmations = 1;

  private horizon: Horizon.Server;
  private receivingPublicKey: string;

  constructor() {
    const secret = process.env.STELLAR_RECEIVING_SECRET;
    if (!secret) {
      throw new Error('STELLAR_RECEIVING_SECRET is not set');
    }
    const keypair = Keypair.fromSecret(secret);
    this.receivingPublicKey = keypair.publicKey();

    this.horizon = new Horizon.Server(
      process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'
    );
  }

  async generateReceiveAddress(paymentId: string): Promise<ReceiveAddress> {
    return {
      address: this.receivingPublicKey,
      memo: `slyky_${paymentId}`,
    };
  }

  startListening(callback: (tx: NormalizedTransaction) => void): void {
    console.log(`[StellarXLM] Starting payment stream for ${this.receivingPublicKey}...`);

    this.horizon
      .payments()
      .forAccount(this.receivingPublicKey)
      .cursor('now')
      .stream({
        onmessage: (operation) => {
          if (
            operation.type !== 'payment' ||
            (operation as any).asset_type !== 'native'
          ) {
            return;
          }

          const payment = operation as Horizon.ServerApi.PaymentOperationRecord;

          const normalized: NormalizedTransaction = {
            txHash: payment.transaction_hash,
            asset: 'XLM',
            amount: payment.amount,
            from: payment.from,
            to: payment.to,
            memo: undefined,
            confirmations: 1,
            isFinal: true,
          };

          console.log(`[StellarXLM] Payment received:`, normalized);
          callback(normalized);
        },
        onerror: (error: any) => {
          console.error('[StellarXLM] Stream error:', error);
        },
      });
  }

  async getTransactionStatus(txHash: string): Promise<TransactionStatus & { memo?: string }> {
    try {
      const tx = await this.horizon.transactions().transaction(txHash).call();
      return {
        status: tx.successful ? 'confirmed' : 'failed',
        confirmations: 1,
        requiredConfirmations: this.requiredConfirmations,
        isFinal: true,
        memo: tx.memo ?? undefined,
      };
    } catch (error) {
      return {
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: this.requiredConfirmations,
        isFinal: false,
        memo: undefined,
      };
    }
  }

  async estimateFee(amount: string, from?: string): Promise<FeeEstimate> {
    return {
      amount: '0.00001',
      currency: 'XLM',
      description: 'Stellar network base fee',
    };
  }

  async estimateSettlementTime(): Promise<number> {
    return 5;
  }

  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const start = Date.now();
    try {
      await this.horizon.root();
      const latency = Date.now() - start;
      return { healthy: true, latency };
    } catch (error: any) {
      return { healthy: false, latency: -1, error: error.message };
    }
  }
}