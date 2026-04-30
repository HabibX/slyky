import dotenv from 'dotenv';
dotenv.config();

import { StellarUSDCAdapter } from './adapters/stellar/StellarUSDCAdapter';
import { railRegistry } from './core/railRegistry';

async function main() {
  const usdcAdapter = new StellarUSDCAdapter();

  railRegistry.register(usdcAdapter);
  console.log('USDC adapter registered');

  const addr = await usdcAdapter.generateReceiveAddress('test_payment_usdc_1');
  console.log('Receive address:', addr);

  const health = await usdcAdapter.healthCheck();
  console.log('Health check:', health);

  const fee = await usdcAdapter.estimateFee('100');
  console.log('Fee estimate:', fee);

  const time = await usdcAdapter.estimateSettlementTime();
  console.log('Settlement time (seconds):', time);

  console.log('Listening for USDC payments...');
  usdcAdapter.startListening((tx) => {
    console.log('🎉 Received USDC transaction:', tx);
  });

  setTimeout(() => {
    console.log('Done listening (30s)');
    process.exit(0);
  }, 30000);
}

main().catch(console.error);