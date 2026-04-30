import dotenv from 'dotenv';
dotenv.config();

import prisma from './services/database';
import { paymentService } from './services/payment';
import { railRegistry } from './core/railRegistry';
import { StellarXLMAdapter } from './adapters/stellar/StellarXLMAdapter';
import { StellarUSDCAdapter } from './adapters/stellar/StellarUSDCAdapter';
import { ledgerService } from './services/ledger';

async function main() {
  // Register adapters (normally done at startup)
  railRegistry.register(new StellarXLMAdapter());
  railRegistry.register(new StellarUSDCAdapter());

  // 1. Create a test user (we'll keep this simple for now)
  const user = await prisma.user.create({
    data: {
      email: 'testuser@slyky.app',
    },
  });
  console.log('Created test user:', user.id);

  // 2. Create an XLM payment request
  const payment = await paymentService.createPayment({
    asset: 'XLM',
    network: 'stellar',
    amount: '75',
    userId: user.id,          // use the real user ID
    description: 'Test payment from integration test',
    idempotencyKey: 'test-key-xlm-001',
  });
  console.log('Created payment:', payment.id, payment.status, payment.memo);

  // 3. Simulate an incoming transaction
  console.log('\nSimulating incoming transaction...');
  const confirmed = await paymentService.confirmPayment(
    payment.id,
    'mock_tx_xlm_001',
    '75',
    'XLM',
    'G_MOCK_SENDER',
  );
  console.log('Confirmed payment status:', confirmed.status, 'confirmedAt:', confirmed.confirmedAt);

  // 4. Check user balance
  const balance = await ledgerService.getBalance(`user_${user.id}`, 'XLM');
  console.log('User XLM balance:', balance);

  // 5. Create a USDC payment and simulate confirmation
  const usdcPayment = await paymentService.createPayment({
    asset: 'USDC',
    network: 'stellar',
    amount: '200',
    userId: user.id,
    description: 'USDC test',
    idempotencyKey: 'test-key-usdc-001',
  });
  console.log('\nCreated USDC payment:', usdcPayment.id, usdcPayment.status, usdcPayment.memo);

  const usdcConfirmed = await paymentService.confirmPayment(
    usdcPayment.id,
    'mock_tx_usdc_001',
    '200',
    'USDC',
    'G_MOCK_SENDER',
  );
  console.log('USDC confirmed:', usdcConfirmed.status);
  const usdcBalance = await ledgerService.getBalance(`user_${user.id}`, 'USDC');
  console.log('User USDC balance:', usdcBalance);
}

main()
  .catch(console.error)
  .finally(() => process.exit());