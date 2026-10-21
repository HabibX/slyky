// backend/src/adapters/stellar/StellarPYUSDAdapter.ts
import {
  IRailAdapter,
  ReceiveAddress,
  NormalizedTransaction,
  TransactionStatus,
  FeeEstimate,
} from '../../core/interfaces/IRailAdapter';
import { Horizon, Keypair } from '@stellar/stellar-sdk';

export class StellarPYUSDAdapter implements IRailAdapter {
  readonly asset = 'PYUSD';
  readonly network = 'stellar';
  readonly requiredConfirmations = 1;

  private horizon: Horizon.Server;
  public receivingPublicKey: string;

  // Official Stellar Mainnet PYUSD Issuer (Paxos)
  public static PYUSD_ISSUER = 'GDQE7IXJ4HUHV6RQHIUPRJSEZE4DRS5WY577O2FY6YQ5LVWZ7JZTU2V5';

  constructor() {
    const secret = process.env.STELLAR_RECEIVING_SECRET;
    if (!secret) throw new Error('STELLAR_RECEIVING_SECRET is not set');
    
    this.receivingPublicKey = Keypair.fromSecret(secret).publicKey();
    this.horizon = new Horizon.Server(
      process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
      { allowHttp: true }
    );
  }

  async generateReceiveAddress(paymentId: string): Promise<ReceiveAddress> {
    const shortId = paymentId.replace(/-/g, '').substring(0, 22);
    return {
      address: this.receivingPublicKey,
      memo: `slyp_${shortId}`, // 'p' pour PYUSD
    };
  }

  // Note: La logique d'écoute (startListening) est gérée centralement par le DetectionOrchestrator.
  // Nous laissons cette méthode vide ou lançons une erreur pour éviter les doubles écoutes.
  startListening(callback: (tx: NormalizedTransaction) => void): void {
    console.log(`[StellarPYUSD] Listening handled by Orchestrator`);
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
      return { status: 'pending', confirmations: 0, requiredConfirmations: 1, isFinal: false, memo: undefined };
    }
  }

  async estimateFee(): Promise<FeeEstimate> {
    return { amount: '0.00001', currency: 'XLM', description: 'Stellar network base fee' };
  }

  async estimateSettlementTime(): Promise<number> { return 5; }

  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    try {
      await this.horizon.root();
      return { healthy: true, latency: 0 };
    } catch (error: any) {
      return { healthy: false, latency: -1, error: error.message };
    }
  }
}