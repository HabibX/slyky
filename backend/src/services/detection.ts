import { railRegistry } from '../core/railRegistry';
import { paymentService } from './payment';
import { StellarXLMAdapter } from '../adapters/stellar/StellarXLMAdapter';
import { StellarUSDCAdapter } from '../adapters/stellar/StellarUSDCAdapter';
import { StellarPYUSDAdapter } from '../adapters/stellar/StellarPYUSDAdapter';
import { StellarUSDTAdapter } from '../adapters/stellar/StellarUSDTAdapter';
import prisma from './database';

const USDT_ISSUER = 'GBDUK...';

const POLL_INTERVAL_MS = 10_000;

export class DetectionOrchestrator {
  private horizonUrl: string;

  constructor() {
    this.horizonUrl = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  }

  start(): void {
    console.log('[DetectionOrchestrator] Starting polling detection...');
    this.poll();
    setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  private async poll(): Promise<void> {
    const adapters = railRegistry.getAllAdapters();
    if (adapters.length === 0) return;
    
    // On récupère l'adresse publique depuis le premier adaptateur (ils partagent le même compte)
    const publicKey = (adapters[0] as any).receivingPublicKey;
    if (!publicKey) return;

    try {
      const url = `${this.horizonUrl}/accounts/${publicKey}/payments?order=desc&limit=30`;
      const response = await fetch(url);
      if (!response.ok) return;

      const data: any = await response.json();
      const records = data._embedded?.records ?? [];

      for (const payment of records) {
        if (payment.transaction_successful !== true) continue;

        // 1. Identifier l'actif
        let asset = 'XLM';
        if (payment.asset_type !== 'native') {
          if (payment.asset_code === 'USDC' && payment.asset_issuer === StellarUSDCAdapter.USDC_ISSUER) {
            asset = 'USDC';
          } else if (payment.asset_code === 'PYUSD' && payment.asset_issuer === StellarPYUSDAdapter.PYUSD_ISSUER) {
            asset = 'PYUSD';
          } else if (payment.asset_code === 'USDT0' && payment.asset_issuer === StellarUSDTAdapter.USDT_ISSUER) {
            asset = 'USDT'; // On mappe USDT0 vers USDT pour notre API interne
          } else {
            continue; // Actif non supporté
          }
        }

        // 2. Récupérer le memo (parfois absent de l'objet payment, il faut fetch la tx)
        let memo = payment.transaction?.memo;
        if (!memo) {
          const horizonTx = (await fetch(`${this.horizonUrl}/transactions/${payment.transaction_hash}`).then((r) => r.json())) as {
            memo?: string;
          } | undefined;
          memo = horizonTx?.memo;
        }
        if (!memo) continue;

        // 3. Trouver le paiement en attente correspondant
        const pendingPayment = await prisma.payment.findFirst({
          where: { memo, status: 'pending', asset },
        });
        
        if (!pendingPayment) continue;

        // 4. Confirmer le paiement
        try {
          await paymentService.confirmPayment(
            pendingPayment.id,
            payment.transaction_hash,
            payment.amount,
            asset,
            payment.from,
          );
          console.log(`[DetectionOrchestrator] Confirmed ${asset} payment ${pendingPayment.id}`);
        } catch (err) {
          console.error(`Failed to confirm payment ${pendingPayment.id}:`, err);
        }
      }
    } catch (err) {
      console.error('[DetectionOrchestrator] Polling error:', err);
    }
  }
}