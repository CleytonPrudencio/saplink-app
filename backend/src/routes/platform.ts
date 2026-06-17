import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePlatformAdmin } from '../middleware/roles';
import { suspend, activateSubscription, getEffectiveStatus } from '../services/billing';

const router = Router();
// Backoffice: só o super-admin da plataforma (você).
router.use(authMiddleware, requirePlatformAdmin);

// Visão geral da plataforma (KPIs)
router.get('/stats', async (_req: Request, res: Response) => {
  const [consultancies, users, clients, integrations, subs, plans] = await Promise.all([
    prisma.consultancy.count(),
    prisma.user.count({ where: { consultancyId: { not: null } } }),
    prisma.client.count(),
    prisma.integration.count(),
    prisma.subscription.findMany({ include: { plan: true } }),
    prisma.plan.findMany(),
  ]);

  const byStatus: Record<string, number> = {};
  let mrrCents = 0;
  for (const s of subs) {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    // MRR = soma do preço dos planos das assinaturas que faturam (ACTIVE/PAST_DUE)
    if ((s.status === 'ACTIVE' || s.status === 'PAST_DUE') && s.plan) mrrCents += s.plan.priceCents;
  }

  res.json({
    consultancies,
    users,
    clients,
    integrations,
    plans: plans.length,
    byStatus,
    mrrCents,
    active: byStatus['ACTIVE'] || 0,
    trialing: byStatus['TRIALING'] || 0,
    pastDue: byStatus['PAST_DUE'] || 0,
    suspended: (byStatus['SUSPENDED'] || 0) + (byStatus['CANCELED'] || 0),
  });
});

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

// Detalhe completo de um tenant (assinatura, usuários, clientes, faturas)
router.get('/consultancies/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const consultancy = await prisma.consultancy.findUnique({
    where: { id },
    include: {
      subscription: { include: { plan: true } },
      users: { select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
      clients: { select: { id: true, name: true, healthScore: true }, orderBy: { name: 'asc' } },
      invoices: { orderBy: { createdAt: 'desc' }, take: 12 },
    },
  });
  if (!consultancy) {
    res.status(404).json({ error: 'Consultoria não encontrada' });
    return;
  }
  const integrations = await prisma.integration.count({ where: { client: { consultancyId: id } } });
  const eff = await getEffectiveStatus(id);
  res.json({ consultancy, effectiveStatus: eff, integrationsCount: integrations });
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
