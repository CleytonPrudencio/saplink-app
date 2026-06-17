import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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

// Painel de RECEITA — agregações financeiras
router.get('/revenue', async (_req: Request, res: Response) => {
  const [subs, plans, paidInvoices] = await Promise.all([
    prisma.subscription.findMany({ include: { plan: true } }),
    prisma.plan.findMany({ orderBy: { priceCents: 'asc' } }),
    prisma.invoice.findMany({ where: { status: 'PAID' }, orderBy: { createdAt: 'desc' }, take: 500, include: { consultancy: { select: { name: true } } } }),
  ]);

  // MRR = assinaturas que faturam (ACTIVE/PAST_DUE)
  let mrrCents = 0;
  const byStatus: Record<string, number> = {};
  const planMrr: Record<string, { name: string; priceCents: number; count: number; mrrCents: number }> = {};
  for (const p of plans) planMrr[p.key] = { name: p.name, priceCents: p.priceCents, count: 0, mrrCents: 0 };
  for (const s of subs) {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
    if ((s.status === 'ACTIVE' || s.status === 'PAST_DUE') && s.plan) {
      mrrCents += s.plan.priceCents;
      const pm = planMrr[s.planKey];
      if (pm) { pm.count += 1; pm.mrrCents += s.plan.priceCents; }
    }
  }

  const totalPaidCents = paidInvoices.reduce((sum, i) => sum + i.amountCents, 0);

  // Faturamento por mês (últimos 6 meses) a partir das faturas pagas
  const now = new Date();
  const months: { month: string; cents: number }[] = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - k, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    months.push({ month: key, cents: 0 });
  }
  for (const inv of paidInvoices) {
    const d = new Date(inv.paidAt || inv.createdAt);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const m = months.find((x) => x.month === key);
    if (m) m.cents += inv.amountCents;
  }

  res.json({
    mrrCents,
    arrCents: mrrCents * 12,
    totalPaidCents,
    paidInvoicesCount: paidInvoices.length,
    byStatus,
    byPlan: Object.values(planMrr),
    monthly: months,
    recentInvoices: paidInvoices.slice(0, 15).map((i) => ({
      id: i.id, amountCents: i.amountCents, paidAt: i.paidAt, createdAt: i.createdAt, consultancy: i.consultancy?.name,
    })),
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

// Mascara campos sensíveis do config da integração
function maskConfig(config: unknown): Record<string, unknown> | null {
  if (!config || typeof config !== 'object') return config as null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config as Record<string, unknown>)) {
    out[k] = /pass|secret|apikey|api_key|authvalue|auth_value|token|client_secret/i.test(k) ? '••••••' : v;
  }
  return out;
}

// Detalhe completo de um CLIENTE (integrações com dados + alertas) — drill-down do super-admin
router.get('/clients/:id', async (req: Request, res: Response) => {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id },
    include: {
      integrations: { orderBy: { name: 'asc' } },
      alerts: { where: { resolved: false }, orderBy: { createdAt: 'desc' }, take: 20 },
      consultancy: { select: { id: true, name: true } },
    },
  });
  if (!client) {
    res.status(404).json({ error: 'Cliente não encontrado' });
    return;
  }
  res.json({
    id: client.id,
    name: client.name,
    cnpj: client.cnpj,
    healthScore: client.healthScore,
    consultancy: client.consultancy,
    integrations: client.integrations.map((i) => ({
      id: i.id, name: i.name, description: i.description, type: i.type, status: i.status,
      latency: i.latency, errorRate: i.errorRate, uptime: i.uptime,
      config: maskConfig(i.config), createdAt: i.createdAt, updatedAt: i.updatedAt,
    })),
    openAlerts: client.alerts.map((a) => ({ id: a.id, type: a.type, severity: a.severity, message: a.message, createdAt: a.createdAt })),
  });
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

// === Ações de admin sobre qualquer usuário/consultoria ===

// Resetar senha de qualquer usuário (retorna senha temporária)
router.post('/users/:userId/reset-password', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  const tempPassword = crypto.randomBytes(6).toString('base64url');
  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(tempPassword, 10) } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  res.json({ status: 'ok', email: user.email, tempPassword });
});

// Editar cadastro de usuário (nome/papel)
router.put('/users/:userId', async (req: Request, res: Response) => {
  const { name, role, email } = req.body || {};
  const data: { name?: string; role?: string; email?: string } = {};
  if (typeof name === 'string' && name.trim()) data.name = name.trim();
  if (role === 'CONSULTANCY_ADMIN' || role === 'CONSULTANCY_USER') data.role = role;
  if (typeof email === 'string' && email.trim()) {
    const exists = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (exists && exists.id !== req.params.userId) {
      res.status(409).json({ error: 'E-mail já em uso' });
      return;
    }
    data.email = email.trim();
  }
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: 'Nada para atualizar' });
    return;
  }
  const user = await prisma.user.update({
    where: { id: req.params.userId },
    data,
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(user);
});

// Editar cadastro da consultoria (nome/cnpj/plano)
router.put('/consultancies/:id', async (req: Request, res: Response) => {
  const { name, cnpj } = req.body || {};
  const data: { name?: string; cnpj?: string | null } = {};
  if (typeof name === 'string' && name.trim()) data.name = name.trim();
  if (cnpj !== undefined) data.cnpj = cnpj || null;
  const c = await prisma.consultancy.update({ where: { id: req.params.id }, data });
  res.json({ id: c.id, name: c.name, cnpj: c.cnpj });
});

export default router;
