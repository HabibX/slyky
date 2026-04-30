import dotenv from 'dotenv';
dotenv.config();

import { StellarXLMAdapter } from './adapters/stellar/StellarXLMAdapter';
import { railRegistry } from './core/railRegistry';

async function main() {
  const xlmAdapter = new StellarXLMAdapter();

  // 1. Register it
  railRegistry.register(xlmAdapter);
  console.log('Adapter registered');

  // 2. Generate a receive address
  const addr = await xlmAdapter.generateReceiveAddress('test_payment_1');
  console.log('Receive address:', addr);

  // 3. Health check
  const health = await xlmAdapter.healthCheck();
  console.log('Health check:', health);

  // 4. Fee estimate
  const fee = await xlmAdapter.estimateFee('100');
  console.log('Fee estimate:', fee);

  // 5. Settlement time
  const time = await xlmAdapter.estimateSettlementTime();
  console.log('Settlement time (seconds):', time);

  // 6. Start listening (keep process alive for 30 seconds)
  console.log('Listening for payments...');
  xlmAdapter.startListening((tx) => {
    console.log('🎉 Received transaction:', tx);
  });

  // Wait for potential test transactions
  setTimeout(() => {
    console.log('Done listening (30s)');
    process.exit(0);
  }, 30000);
}

main().catch(console.error);