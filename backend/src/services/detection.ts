// services/detection.ts

import { railRegistry } from '../core/railRegistry';
import { paymentService } from './payment';
import { StellarXLMAdapter } from '../adapters/stellar/StellarXLMAdapter';
import { StellarUSDCAdapter } from '../adapters/stellar/StellarUSDCAdapter';
import prisma from './database';

const POLL_INTERVAL_MS = 10_000; // every 10 seconds

export class DetectionOrchestrator {
  private xlmAdapter: StellarXLMAdapter;
  private usdcAdapter: StellarUSDCAdapter;
  private horizonUrl: string;

  constructor() {
    const xlm = railRegistry.getAdapter('XLM', 'stellar');
    const usdc = railRegistry.getAdapter('USDC', 'stellar');
    if (!xlm || !usdc) {
      throw new Error('Adapters not registered');
    }
    this.xlmAdapter = xlm as StellarXLMAdapter;
    this.usdcAdapter = usdc as StellarUSDCAdapter;
    this.horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  }

  start(): void {
    console.log('[DetectionOrchestrator] Starting polling detection every 10s...');
    this.poll();
    setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  private async poll(): Promise<void> {
    const publicKey = this.xlmAdapter.receivingPublicKey;
    if (!publicKey) return;

    try {
      const url = `${this.horizonUrl}/accounts/${publicKey}/payments?order=desc&limit=10`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Horizon poll failed: ${response.status}`);
        return;
      }
      const data: any = await response.json();
      const records = data._embedded?.records ?? [];

      for (const payment of records) {
        if (payment.transaction_successful !== true) continue;

        // Try to get memo directly (it won't be here, but we keep the check)
        let memo = payment.transaction?.memo;

        // If memo is missing, fetch the full transaction to get memo
        if (!memo) {
          try {
            const status = await this.xlmAdapter.getTransactionStatus(payment.transaction_hash);
            memo = (status as any).memo;
          } catch (err) {
            console.error(`Failed to fetch memo for tx ${payment.transaction_hash}:`, err);
            continue;
          }
        }

        if (!memo) continue;

        const pendingPayment = await prisma.payment.findFirst({
          where: { memo, status: 'pending' },
        });
        if (!pendingPayment) continue;

        let asset = 'XLM';
        if (payment.asset_type !== 'native') {
          if (
            payment.asset_code === 'USDC' &&
            payment.asset_issuer === StellarUSDCAdapter.USDC_ISSUER
          ) {
            asset = 'USDC';
          } else {
            continue;
          }
        }

        try {
          await paymentService.confirmPayment(
            pendingPayment.id,
            payment.transaction_hash,
            payment.amount,
            asset,
            payment.from,
          );
          console.log(`[DetectionOrchestrator] Confirmed payment ${pendingPayment.id}`);
        } catch (err) {
          console.error(`Failed to confirm payment ${pendingPayment.id}:`, err);
        }
      }
    } catch (err) {
      console.error('[DetectionOrchestrator] Polling error:', err);
    }
  }
}