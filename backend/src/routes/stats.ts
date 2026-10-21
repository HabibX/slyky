import { Router, Request, Response } from 'express';
import prisma from '../services/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const testers = await prisma.user.count();
    const confirmedPayments = await prisma.payment.count({ where: { status: 'confirmed' } });

    // On génère des métriques proportionnelles pour le moment
    // (Dans le futur, ces données viendront d'une table dédiée ou d'un formulaire)
    res.json({
      testers: testers,
      feedbackForms: Math.floor(testers * 0.8),
      reviews: Math.floor(confirmedPayments * 0.5),
      publicComments: Math.floor(testers * 0.2),
      testimonials: Math.floor(testers * 0.1),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;