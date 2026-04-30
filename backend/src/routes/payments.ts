import { Router, Request, Response } from 'express';
import { paymentService } from '../services/payment';
import { apiKeyAuth } from '../middleware/auth';

const router = Router();

// All routes require API key
router.use(apiKeyAuth);

// POST /v1/payments — Create a payment request
router.post('/', async (req: Request, res: Response) => {
  try {
    const { asset, network, amount, description, idempotencyKey } = req.body;
    const userId = (req as any).userId;

    // Basic validation
    if (!asset || !network || !amount) {
      return res.status(400).json({ error: 'asset, network, and amount are required' });
    }

    const payment = await paymentService.createPayment({
      asset,
      network,
      amount,
      userId,
      description,
      idempotencyKey,
    });

    // Return only public fields
    return res.status(201).json({
      id: payment.id,
      asset: payment.asset,
      network: payment.network,
      amount: payment.amount.toString(),
      status: payment.status,
      address: payment.address,
      memo: payment.memo,
      description: payment.description,
      expiresAt: payment.expiresAt,
      createdAt: payment.createdAt,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /v1/payments/:id — Check payment status
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const payment = await paymentService.getPayment(req.params.id as string);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.json({
      id: payment.id,
      asset: payment.asset,
      amount: payment.amount.toString(),
      status: payment.status,
      address: payment.address,
      memo: payment.memo,
      txHash: payment.txHash,
      confirmedAt: payment.confirmedAt,
      createdAt: payment.createdAt,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /v1/payments — List payments (dashboard)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const payments = await paymentService.listPayments(userId, limit, offset);

    return res.json(
      payments.map((p) => ({
        id: p.id,
        asset: p.asset,
        amount: p.amount.toString(),
        status: p.status,
        address: p.address,
        memo: p.memo,
        txHash: p.txHash,
        createdAt: p.createdAt,
        confirmedAt: p.confirmedAt,
      }))
    );
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;