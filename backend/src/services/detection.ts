// services/detection.ts

import { railRegistry } from '../core/railRegistry';
import { paymentService } from './payment';
import { StellarXLMAdapter } from '../adapters/stellar/StellarXLMAdapter';
import { StellarUSDCAdapter } from '../adapters/stellar/StellarUSDCAdapter';

export class DetectionOrchestrator {
  private xlmAdapter: StellarXLMAdapter;
  private usdcAdapter: StellarUSDCAdapter;

  constructor() {
    // Retrieve the adapters from the registry
    const xlm = railRegistry.getAdapter('XLM', 'stellar');
    const usdc = railRegistry.getAdapter('USDC', 'stellar');

    if (!xlm || !usdc) {
      throw new Error('XLM or USDC adapter not registered. Did you register them first?');
    }

    this.xlmAdapter = xlm as StellarXLMAdapter;
    this.usdcAdapter = usdc as StellarUSDCAdapter;
  }

  /**
   * Starts listening on both XLM and USDC adapters.
   * When a transaction arrives, we look up the memo, find the matching payment,
   * and confirm it.
   */
  start(): void {
    console.log('[DetectionOrchestrator] Starting detection for XLM and USDC...');

    this.xlmAdapter.startListening(async (tx) => {
      await this.handleIncomingTransaction(tx);
    });

    this.usdcAdapter.startListening(async (tx) => {
      await this.handleIncomingTransaction(tx);
    });
  }

  /**
   * Handles a single normalized transaction.
   * 1. Fetch memo from the Stellar transaction (if missing)
   * 2. Find the payment by memo
   * 3. Confirm the payment and record in ledger
   */
  private async handleIncomingTransaction(tx: any): Promise<void> {
    console.log(`[DetectionOrchestrator] Processing tx: ${tx.txHash}`);

    // If memo is undefined, fetch transaction status to get memo
    let memo = tx.memo;
    if (!memo) {
      try {
        const adapter = railRegistry.getAdapter(tx.asset, 'stellar');
        if (adapter) {
          const status = await adapter.getTransactionStatus(tx.txHash);
          memo = (status as any).memo;
        }
      } catch (err) {
        console.error(`Failed to fetch memo for tx ${tx.txHash}:`, err);
        return;
      }
    }

    if (!memo) {
      console.log(`No memo found for tx ${tx.txHash}; skipping.`);
      return;
    }

    // Find payment by memo
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const payment = await prisma.payment.findFirst({
      where: { memo: memo, status: 'pending' },
    });

    if (!payment) {
      console.log(`No pending payment found for memo ${memo}; skipping.`);
      return;
    }

    // Confirm the payment
    try {
      const confirmed = await paymentService.confirmPayment(
        payment.id,
        tx.txHash,
        tx.amount,
        tx.asset,
        tx.from,
      );
      console.log(`[DetectionOrchestrator] Payment ${payment.id} confirmed.`);
    } catch (err) {
      console.error(`Failed to confirm payment ${payment.id}:`, err);
    }
  }
}