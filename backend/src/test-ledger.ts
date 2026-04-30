import { ledgerService } from './services/ledger';

async function main() {
  const userAccount = 'user_test123';
  const networkAccount = 'stellar_network';

  // Record a payment of 100 XLM
  console.log('Recording transfer...');
  const entry = await ledgerService.transfer(
    networkAccount,   // debit (money leaves network)
    userAccount,      // credit (money enters user account)
    'XLM',
    '100',
    'payment',
    'payment_abc',
  );
  console.log('Ledger entry created:', entry.id);

  // Check balance
  const balance = await ledgerService.getBalance(userAccount, 'XLM');
  console.log('User XLM balance:', balance.XLM.toString()); // Should be 100

  // Add another 50 XLM
  await ledgerService.transfer(networkAccount, userAccount, 'XLM', '50', 'payment', 'payment_def');
  const newBalance = await ledgerService.getBalance(userAccount, 'XLM');
  console.log('Updated XLM balance:', newBalance.XLM.toString()); // Should be 150

  // Get all balances
  const allBalances = await ledgerService.getBalance(userAccount);
  console.log('All balances:', allBalances);

  // Get history
  const entries = await ledgerService.getEntries(userAccount);
  console.log('Entries count:', entries.length);
}

main()
  .catch(console.error)
  .finally(() => process.exit());