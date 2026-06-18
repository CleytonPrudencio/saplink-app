import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';
import { requireConsultancyAdmin } from '../middleware/roles';
import {
  getEffectiveStatus,
  activateSubscription,
  markPastDue,
  cancel as cancelSub,
} from '../services/billing';
import { asaasEnabled, createCheckout, handleWebhook } from '../services/asaas';
import { logger } from '../lib/logger';

const router = Router();

// Webhook do Asaas (SEM auth de usuário). Valida o token configurado no painel do Asaas
// (header asaas-access-token) e processa de forma idempotente.
router.post('/webhook/asaas', async (req: Request, res: Response) => {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (expected) {
    const got = req.header('asaas-access-token');
    if (got !== expected) { res.status(401).json({ error: 'token inválido' }); return; }
  }
  const evt = req.body || {};
  const eventId = `asaas:${evt.event}:${evt.payment?.id || evt.id || ''}`;
  const already = await prisma.webhookEvent.findUnique({ where: { providerEventId: eventId } });
  if (already) { res.json({ status: 'ignored', reason: 'evento já processado' }); return; }
  try {
    const result = await handleWebhook(evt);
    await prisma.webhookEvent.create({ data: { provider: 'asaas', providerEventId: eventId } });
    logger.info({ event: evt.event, ...result }, 'asaas webhook');
    res.json({ status: 'ok', ...result });
  } catch (e: any) {
    logger.error({ err: e.message, event: evt.event }, 'asaas webhook error');
    res.status(500).json({ error: e.message });
  }
});

// Webhook genérico (manual/testes; valida segredo + idempotência).
// Em produção: trocar a checagem de segredo por verificação de assinatura do provedor.
const webhookSchema = z.object({
  provider: z.string().min(1),
  eventId: z.string().min(1),
  type: z.enum(['payment_succeeded', 'payment_failed', 'subscription_canceled']),
  consultancyId: z.string().uuid(),
  planKey: z.string().optional(),
});

router.post('/webhook', async (req: Request, res: Response) => {
  const secret = process.env.BILLING_WEBHOOK_SECRET;
  const sig = req.header('X-Webhook-Secret');
  if (!secret || sig !== secret) {
    res.status(401).json({ error: 'assinatura inválida' });
    return;
  }
  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'payload inválido', details: parsed.error.flatten() });
    return;
  }
  const { provider, eventId, type, consultancyId, planKey } = parsed.data;

  // Idempotência: nunca processa o mesmo evento duas vezes
  const already = await prisma.webhookEvent.findUnique({ where: { providerEventId: eventId } });
  if (already) {
    res.json({ status: 'ignored', reason: 'evento já processado' });
    return;
  }

  try {
    if (type === 'payment_succeeded') {
      await activateSubscription(consultancyId, planKey);
      await prisma.invoice.create({
        data: { consultancyId, amountCents: 0, status: 'PAID', providerInvoiceId: eventId, paidAt: new Date() },
      });
    } else if (type === 'payment_failed') {
      await markPastDue(consultancyId);
    } else if (type === 'subscription_canceled') {
      await cancelSub(consultancyId);
    }
    await prisma.webhookEvent.create({ data: { provider, providerEventId: eventId } });
    res.json({ status: 'ok' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Daqui pra baixo: exige usuário autenticado do tenant (mas NÃO exige assinatura ativa,
// para o inadimplente conseguir regularizar).
router.use(authMiddleware, tenancyMiddleware);

// Status atual: assinatura, plano, uso, faturas, gastos e add-ons
router.get('/', async (req: Request, res: Response) => {
  const consultancyId = req.consultancyId!;
  const eff = await getEffectiveStatus(consultancyId);
  const sub: any = eff.subscription;
  const plan = sub?.plan ?? null;
  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  const [usage, invoices, clientsCount, integrationsCount, usersCount, consultancy] = await Promise.all([
    prisma.usageCounter.findUnique({ where: { consultancyId_period: { consultancyId, period } } }),
    prisma.invoice.findMany({ where: { consultancyId }, orderBy: { createdAt: 'desc' }, take: 36 }),
    prisma.client.count({ where: { consultancyId } }),
    prisma.integration.count({ where: { client: { consultancyId } } }),
    prisma.user.count({ where: { consultancyId } }),
    prisma.consultancy.findUnique({ where: { id: consultancyId }, select: { name: true, cnpj: true } }),
  ]);

  const extraIntegrations = sub?.extraIntegrations ?? 0;
  const extraUsers = sub?.extraUsers ?? 0;

  // Total mensal = plano + add-ons
  const monthlyCents = plan
    ? plan.priceCents + extraIntegrations * plan.addonIntegrationCents + extraUsers * plan.addonUserCents
    : 0;

  // Gastos: total pago e série por mês (últimos 12)
  const paid = invoices.filter((i) => i.status === 'PAID');
  const totalPaidCents = paid.reduce((s, i) => s + i.amountCents, 0);
  const byMonth: Record<string, number> = {};
  for (const i of paid) {
    const d = new Date(i.paidAt || i.createdAt);
    const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    byMonth[k] = (byMonth[k] || 0) + i.amountCents;
  }
  const spendingSeries = Object.entries(byMonth).sort().slice(-12).map(([month, cents]) => ({ month, cents }));

  res.json({
    status: eff.status,
    allowed: eff.allowed,
    reason: eff.reason ?? null,
    consultancyName: consultancy?.name ?? null,
    consultancyCnpj: consultancy?.cnpj ?? null,
    plan,
    extras: { integrations: extraIntegrations, users: extraUsers },
    effectiveLimits: plan ? {
      clients: plan.maxClients,
      integrations: plan.maxIntegrations + extraIntegrations,
      users: plan.maxUsers + extraUsers,
      aiDiagnostics: plan.maxAiDiagnosticsPerMonth,
    } : null,
    addonPrices: plan ? { integrationCents: plan.addonIntegrationCents, userCents: plan.addonUserCents } : null,
    monthlyCents,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    trialEndsAt: sub?.trialEndsAt ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    usage: {
      clients: clientsCount,
      integrations: integrationsCount,
      users: usersCount,
      aiDiagnostics: usage?.aiDiagnostics ?? 0,
    },
    spending: { totalPaidCents, series: spendingSeries },
    invoices,
  });
});

// Add-ons: ajusta integrações/usuários extras (só admin). No provider manual, gera fatura do delta.
const addonSchema = z.object({
  extraIntegrations: z.number().int().min(0).max(999).optional(),
  extraUsers: z.number().int().min(0).max(999).optional(),
});
router.post('/addons', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const parsed = addonSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Valores inválidos' }); return; }
  const consultancyId = req.consultancyId!;
  const sub = await prisma.subscription.findUnique({ where: { consultancyId }, include: { plan: true } });
  if (!sub || !sub.plan) { res.status(409).json({ error: 'Sem assinatura ativa. Escolha um plano primeiro.' }); return; }

  const data: any = {};
  if (parsed.data.extraIntegrations !== undefined) data.extraIntegrations = parsed.data.extraIntegrations;
  if (parsed.data.extraUsers !== undefined) data.extraUsers = parsed.data.extraUsers;
  const updated = await prisma.subscription.update({ where: { consultancyId }, data, include: { plan: true } });

  const monthlyCents = updated.plan.priceCents
    + updated.extraIntegrations * updated.plan.addonIntegrationCents
    + updated.extraUsers * updated.plan.addonUserCents;
  res.json({ status: 'ok', extras: { integrations: updated.extraIntegrations, users: updated.extraUsers }, monthlyCents });
});

router.get('/plans', async (_req: Request, res: Response) => {
  const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } });
  res.json(plans);
});

// Checkout (provider manual): ativa a assinatura no plano escolhido.
// Em produção, isto redireciona ao gateway; aqui simula pagamento aprovado.
const checkoutSchema = z.object({ planKey: z.string().min(1) });
router.post('/checkout', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'planKey é obrigatório' });
    return;
  }
  const plan = await prisma.plan.findUnique({ where: { key: parsed.data.planKey } });
  if (!plan) {
    res.status(404).json({ error: 'Plano não encontrado' });
    return;
  }

  // Com Asaas configurado: cria a assinatura real e devolve a URL de pagamento (sem ativar ainda).
  // A ativação acontece no webhook PAYMENT_CONFIRMED.
  if (asaasEnabled() && plan.priceCents > 0) {
    try {
      const { url } = await createCheckout(req.consultancyId!, plan.key);
      res.json({ status: 'redirect', url, message: `Finalize o pagamento do plano ${plan.name}.` });
    } catch (e: any) {
      res.status(400).json({ error: e.message || 'Falha ao iniciar o pagamento.' });
    }
    return;
  }

  // Sem gateway (dev/demo): ativa direto.
  const sub = await activateSubscription(req.consultancyId!, plan.key);
  await prisma.invoice.create({
    data: { consultancyId: req.consultancyId!, subscriptionId: sub.id, amountCents: plan.priceCents, status: 'PAID', paidAt: new Date() },
  });
  res.json({ status: 'ok', message: `Plano ${plan.name} ativado.`, subscription: sub });
});

router.post('/cancel', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const sub = await cancelSub(req.consultancyId!);
  res.json({ status: 'ok', message: 'Assinatura cancelada.', subscription: sub });
});

export default router;
