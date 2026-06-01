import { Router, Request, Response } from 'express';
import prisma from '../services/database';
import crypto from 'crypto';

const router = Router();

// POST /v1/register — public, no auth required
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
    }

    // Generate a new API key
    const key = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
    await prisma.apiKey.create({
      data: {
        userId: user.id,
        key,
        type: 'secret',
      },
    });

    // Return the key (only once – they should save it)
    return res.status(201).json({
      email: user.email,
      apiKey: key,
      message: 'API key created successfully. Save it securely – it won’t be shown again.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;