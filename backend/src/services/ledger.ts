import { LedgerEntry, Prisma } from '@prisma/client';
import prisma from './database';

/**
 * LedgerService
 * ---------------
 * Double-entry, append-only ledger.
 *
 * Every financial movement is recorded as a transfer from a debit account
 * to a credit account. Debits and credits always balance.
 *
 * Account IDs are free-form strings. Examples:
 *   - "user_<uuid>"          (user holding funds)
 *   - "platform"              (platform fees or retained earnings)
 *   - "stellar_network"       (external source/sink for on-chain payments)
 *
 * Balance for an account = SUM(credits) - SUM(debits) per asset.
 */

export class LedgerService {
  /**
   * Records a transfer between two accounts.
   *
   * @param debitAccountId  - The account losing value.
   * @param creditAccountId - The account gaining value.
   * @param asset           - e.g. "XLM", "USDC".
   * @param amount          - Amount as string or Decimal (handled by Prisma).
   * @param referenceType   - e.g. "payment".
   * @param referenceId     - ID of the related entity (Payment.id).
   * @returns The created LedgerEntry.
   */
  async transfer(
    debitAccountId: string,
    creditAccountId: string,
    asset: string,
    amount: string | Prisma.Decimal,
    referenceType: string,
    referenceId: string,
  ): Promise<LedgerEntry> {
    // 1. Validate accounts are different
    if (debitAccountId === creditAccountId) {
      throw new Error('Debit and credit accounts must be different');
    }

    // 2. Convert amount to Decimal if it's a string
    const decimalAmount =
      amount instanceof Prisma.Decimal ? amount : new Prisma.Decimal(amount);

    // 3. Amount must be positive
    if (decimalAmount.lte(0)) {
      throw new Error('Transfer amount must be positive');
    }

    // 4. Create the ledger entry (append-only)
    const entry = await prisma.ledgerEntry.create({
      data: {
        debitAccountId,
        creditAccountId,
        asset,
        amount: decimalAmount,
        referenceType,
        referenceId,
      },
    });

    return entry;
  }

  /**
   * Calculates the current balance for one or all assets of an account.
   *
   * @param accountId - The account to query.
   * @param asset     - (Optional) Specific asset, or undefined for all.
   * @returns A map of asset -> balance (as Prisma.Decimal).
   */
  async getBalance(
    accountId: string,
    asset?: string,
  ): Promise<Record<string, Prisma.Decimal>> {
    // Build the where clause for debits and credits
    const assetFilter = asset ? { asset } : {};

    // Total credits to this account
    const creditsAgg = await prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        creditAccountId: accountId,
        ...assetFilter,
      },
    });

    // Total debits from this account
    const debitsAgg = await prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        debitAccountId: accountId,
        ...assetFilter,
      },
    });

    // Aggregate returns Decimal | null; default to 0
    const totalCredits = creditsAgg._sum.amount ?? new Prisma.Decimal(0);
    const totalDebits = debitsAgg._sum.amount ?? new Prisma.Decimal(0);

    // If asset is specified, return single balance; otherwise we need per-asset breakdown
    if (asset) {
      return { [asset]: totalCredits.minus(totalDebits) };
    }

    // For all assets, we need to group by asset. We'll do a raw query or use groupBy.
    // Since Prisma groupBy with sum is straightforward:
    const groupByAsset = await prisma.ledgerEntry.groupBy({
      by: ['asset'],
      _sum: { amount: true },
      where: {
        OR: [
          { creditAccountId: accountId },
          { debitAccountId: accountId },
        ],
      },
    });

    // Manually compute balance per asset from groupBy results
    const balanceMap: Record<string, Prisma.Decimal> = {};

    for (const group of groupByAsset) {
      const assetKey = group.asset;
      // For this asset, compute total credits to account minus total debits from account
      const assetCredits = await prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: {
          creditAccountId: accountId,
          asset: assetKey,
        },
      });
      const assetDebits = await prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: {
          debitAccountId: accountId,
          asset: assetKey,
        },
      });
      const creditSum = assetCredits._sum.amount ?? new Prisma.Decimal(0);
      const debitSum = assetDebits._sum.amount ?? new Prisma.Decimal(0);
      balanceMap[assetKey] = creditSum.minus(debitSum);
    }

    return balanceMap;
  }

  /**
   * Retrieves a list of ledger entries for an account, with optional filtering.
   * Used by the dashboard to show transaction history.
   *
   * @param accountId - Account whose entries to fetch (appears in debit OR credit).
   * @param limit     - Max entries to return (default 50).
   * @param offset    - For pagination.
   */
  async getEntries(
    accountId: string,
    limit = 50,
    offset = 0,
  ) {
    return prisma.ledgerEntry.findMany({
      where: {
        OR: [
          { debitAccountId: accountId },
          { creditAccountId: accountId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}

// Export a singleton instance for the app
export const ledgerService = new LedgerService();