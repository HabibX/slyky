import { Request, Response, NextFunction } from 'express';
import prisma from '../services/database';

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing API key' });
  }

  const key = authHeader.split(' ')[1];

  // In production, compare hashed keys using bcrypt.
  // For MVP, we store plain text keys (with 'sk_' prefix) and compare directly.
  const apiKeyRecord = await prisma.apiKey.findUnique({ where: { key } });
  if (!apiKeyRecord) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKeyRecord.id },
    data: { lastUsed: new Date() },
  });

  // Attach the user ID to the request for later use
  (req as any).userId = apiKeyRecord.userId;
  next();
}