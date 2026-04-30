// services/payment.ts

import prisma from './database';
import { railRegistry } from '../core/railRegistry';
import { ledgerService } from './ledger';
import { Prisma, Payment as PaymentRecord } from '@prisma/client';

const IDEMPOTENCY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export class PaymentService {
  /**
   * Creates a new payment request.
   *
   * @param params.asset        - "XLM" or "USDC"
   * @param params.network      - "stellar" (more later)
   * @param params.amount       - Amount string (e.g. "100")
   * @param params.userId       - The user (merchant) requesting the payment
   * @param params.description  - Optional note
   * @param params.idempotencyKey - Optional unique key to prevent duplicates
   * @returns The created Payment record (without sensitive fields)
   */
  async createPayment(params: {
    asset: string;
    network: string;
    amount: string;
    userId: string;
    description?: string;
    idempotencyKey?: string;
  }): Promise<PaymentRecord> {
    const { asset, network, amount, userId, description, idempotencyKey } = params;

    // 1. Idempotency check
    if (idempotencyKey) {
      const existing = await prisma.payment.findFirst({
        where: {
          metadata: {
            path: ['idempotencyKey'],
            equals: idempotencyKey,
          },
        },
      });
      if (existing && existing.createdAt.getTime() > Date.now() - IDEMPOTENCY_EXPIRY_MS) {
        // Return the existing payment if still valid
        return existing;
      }
    }

    // 2. Look up the adapter
    const adapter = railRegistry.getAdapter(asset, network);
    if (!adapter) {
      throw new Error(`No adapter for ${asset}:${network}`);
    }

    // 3. Generate receiving address and memo
    // First, create a placeholder payment record to get an ID
    const tempPayment = await prisma.payment.create({
      data: {
        userId,
        amount: new Prisma.Decimal(amount),
        asset,
        network,
        status: 'created',
        description: description || null,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        metadata: idempotencyKey ? { idempotencyKey } : Prisma.DbNull,
      },
    });

    // Generate address with the real payment ID as memo
    const receiveAddress = await adapter.generateReceiveAddress(tempPayment.id);

    // Update the payment with address and memo, and move status to 'pending'
    const payment = await prisma.payment.update({
      where: { id: tempPayment.id },
      data: {
        address: receiveAddress.address,
        memo: receiveAddress.memo,
        status: 'pending',
      },
    });

    return payment;
  }

  /**
   * Handles a detected incoming transaction matched to a payment.
   *
   * @param paymentId  - The payment ID that was matched
   * @param txHash     - Blockchain transaction hash
   * @param amount     - Actual amount received
   * @param asset      - Asset received
   * @param from       - Sender address
   */
  async confirmPayment(
    paymentId: string,
    txHash: string,
    amount: string,
    asset: string,
    from: string,
  ): Promise<PaymentRecord> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new Error('Payment not found');

    // Already confirmed? Idempotent.
    if (payment.status === 'confirmed') return payment;

    // Transition: pending → processing → confirming → confirmed
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'processing' },
    });

    // Simulate a short processing step; in production this might check confirmations
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'confirming', txHash, confirmations: 1 },
    });

    // Record in ledger: debit network, credit user
    const networkAccount = `${payment.network}_network`;
    const userAccount = `user_${payment.userId}`;

    await ledgerService.transfer(
      networkAccount,
      userAccount,
      asset,
      amount,
      'payment',
      payment.id,
    );

    // Mark confirmed
    const confirmedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    return confirmedPayment;
  }

  /**
   * Retrieves a payment by ID (for checkout polling).
   */
  async getPayment(paymentId: string): Promise<PaymentRecord | null> {
    return prisma.payment.findUnique({ where: { id: paymentId } });
  }

  /**
   * Lists payments for a user (for dashboard).
   */
  async listPayments(userId: string, limit = 20, offset = 0) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}

export const paymentService = new PaymentService();