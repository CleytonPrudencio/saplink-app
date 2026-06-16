import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePlatformAdmin } from '../middleware/roles';
import { suspend, activateSubscription, getEffectiveStatus } from '../services/billing';

const router = Router();
// Backoffice: só o super-admin da plataforma (você).
router.use(authMiddleware, requirePlatformAdmin);

// Lista todos os tenants com status de assinatura e uso
router.get('/consultancies', async (_req: Request, res: Response) => {
  const consultancies = await prisma.consultancy.findMany({
    include: {
      subscription: { include: { plan: true } },
      _count: { select: { users: true, clients: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(consultancies);
});

// Status efetivo de um tenant
router.get('/consultancies/:id', async (req: Request, res: Response) => {
  const eff = await getEffectiveStatus(req.params.id);
  res.json(eff);
});

// Corte manual de acesso
router.post('/consultancies/:id/suspend', async (req: Request, res: Response) => {
  const sub = await prisma.subscription.findUnique({ where: { consultancyId: req.params.id } });
  if (!sub) {
    res.status(404).json({ error: 'Tenant sem assinatura' });
    return;
  }
  await suspend(req.params.id);
  res.json({ status: 'ok', message: 'Acesso suspenso.' });
});

// Reativação manual (cortesia / pagamento offline)
router.post('/consultancies/:id/activate', async (req: Request, res: Response) => {
  await activateSubscription(req.params.id);
  res.json({ status: 'ok', message: 'Acesso reativado.' });
});

export default router;
