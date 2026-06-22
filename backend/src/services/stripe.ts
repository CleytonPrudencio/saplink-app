import crypto from 'crypto';
import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { logger } from '../lib/logger';
import { activateSubscription, markPastDue, cancel as cancelSub } from './billing';
import { sendPaymentConfirmed, sendPaymentOverdue } from './email';

// Gateway Stripe via REST (sem SDK — evita dependência nova).
// Test mode: STRIPE_SECRET_KEY=sk_test_... | Produção: sk_live_...
const API = 'https://api.stripe.com/v1';
const KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APP_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

export function stripeEnabled(): boolean {
  return !!KEY;
}

// Codifica objeto aninhado no formato form do Stripe: a[b][c]=v, arrays viram a[0][b]=v
function toForm(obj: Record<string, any>, prefix = ''): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') {
      const nested = toForm(v, key);
      if (nested) parts.push(nested);
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return parts.join('&');
}

async function stripe<T = any>(path: string, params: Record<string, any>): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm(params),
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as any)?.error?.message || `Stripe HTTP ${res.status}`);
  return body as T;
}

/** Garante um customer Stripe para a consultoria (cria 1x, reusa pelo providerCustomerId). */
async function ensureCustomer(consultancyId: string): Promise<string> {
  const sub = await prisma.subscription.findUnique({ where: { consultancyId } });
  if (sub?.providerCustomerId?.startsWith('cus_')) return sub.providerCustomerId;
  const consultancy = await prisma.consultancy.findUnique({ where: { id: consultancyId } });
  const admin = await prisma.user.findFirst({ where: { consultancyId, role: 'CONSULTANCY_ADMIN' }, orderBy: { createdAt: 'asc' } });
  const customer = await stripe<{ id: string }>('/customers', {
    name: consultancy?.name, email: admin?.email,
    metadata: { consultancyId, cnpj: consultancy?.cnpj || '' },
  });
  return customer.id;
}

/**
 * Cria uma Stripe Checkout Session e devolve a URL hospedada.
 * mode='auto' → assinatura recorrente; mode='now' → pagamento avulso (uma mensalidade).
 */
export async function createCheckout(
  consultancyId: string, planKey: string, mode: 'auto' | 'now' = 'auto'
): Promise<{ url: string; mode: string }> {
  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan) throw new Error('Plano não encontrado');
  if (plan.priceCents <= 0) throw new Error('Plano gratuito não requer pagamento');

  const customer = await ensureCustomer(consultancyId);
  const isSub = mode === 'auto';
  const priceData: any = {
    currency: 'brl',
    unit_amount: plan.priceCents,
    product_data: { name: `SAPLINK — Plano ${plan.name}` },
  };
  if (isSub) priceData.recurring = { interval: 'month' };

  const session = await stripe<{ id: string; url: string }>('/checkout/sessions', {
    mode: isSub ? 'subscription' : 'payment',
    customer,
    line_items: [{ quantity: 1, price_data: priceData }],
    success_url: `${APP_URL}/billing?paid=1`,
    cancel_url: `${APP_URL}/billing`,
    metadata: { consultancyId, planKey, mode },
    ...(isSub
      ? { subscription_data: { metadata: { consultancyId, planKey } } }
      : { payment_intent_data: { metadata: { consultancyId, planKey } } }),
  });

  await prisma.subscription.upsert({
    where: { consultancyId },
    create: { consultancyId, planKey, status: 'PAST_DUE', provider: 'stripe', providerCustomerId: customer, autoRenew: isSub },
    update: { planKey, provider: 'stripe', providerCustomerId: customer, autoRenew: isSub },
  });
  return { url: session.url, mode };
}

/** Link Stripe para pagar uma fatura ABERTA existente (pagar agora, avulso). */
export async function createInvoicePayment(consultancyId: string, invoiceId: string): Promise<{ url: string }> {
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, consultancyId } });
  if (!invoice) throw new Error('Fatura não encontrada');
  if (invoice.status === 'PAID') throw new Error('Fatura já está paga');
  const customer = await ensureCustomer(consultancyId);
  const session = await stripe<{ url: string }>('/checkout/sessions', {
    mode: 'payment',
    customer,
    line_items: [{ quantity: 1, price_data: { currency: 'brl', unit_amount: invoice.amountCents, product_data: { name: 'SAPLINK — Fatura' } } }],
    success_url: `${APP_URL}/billing?paid=1`,
    cancel_url: `${APP_URL}/billing`,
    metadata: { consultancyId, invoiceId: invoice.id },
    payment_intent_data: { metadata: { consultancyId, invoiceId: invoice.id } },
  });
  return { url: session.url };
}

/** Portal de Cobrança do Stripe — o cliente adiciona/troca o cartão, vê faturas e gerencia a assinatura. */
export async function createBillingPortal(consultancyId: string): Promise<{ url: string }> {
  const customer = await ensureCustomer(consultancyId);
  await prisma.subscription.update({ where: { consultancyId }, data: { providerCustomerId: customer } }).catch(() => {});
  const session = await stripe<{ url: string }>('/billing_portal/sessions', {
    customer,
    return_url: `${APP_URL}/billing`,
  });
  return { url: session.url };
}

function verifySignature(rawBody: Buffer, sigHeader: string): any {
  const parts: Record<string, string> = {};
  for (const item of sigHeader.split(',')) {
    const [k, v] = item.split('=');
    parts[k] = v;
  }
  const signedPayload = `${parts.t}.${rawBody.toString('utf8')}`;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET!).update(signedPayload).digest('hex');
  const a = Buffer.from(expected), b = Buffer.from(parts.v1 || '');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('assinatura inválida');
  return JSON.parse(rawBody.toString('utf8'));
}

async function activateByConsultancy(consultancyId: string, planKey: string | undefined, amountCents: number, providerInvoiceId: string, invoiceId?: string) {
  await activateSubscription(consultancyId, planKey);
  if (invoiceId) {
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: 'PAID', paidAt: new Date(), providerInvoiceId } }).catch(() => {});
  } else {
    await prisma.invoice.create({ data: { consultancyId, amountCents, status: 'PAID', providerInvoiceId, paidAt: new Date() } });
  }
  const admin = await prisma.user.findFirst({ where: { consultancyId, role: 'CONSULTANCY_ADMIN' }, orderBy: { createdAt: 'asc' } });
  const plan = planKey ? await prisma.plan.findUnique({ where: { key: planKey } }) : null;
  if (admin?.email) await sendPaymentConfirmed(admin.email, plan?.name || planKey || '');
}

/** Handler do webhook Stripe (montado com express.raw — req.body é Buffer cru). */
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  let event: any;
  try {
    if (WEBHOOK_SECRET) {
      event = verifySignature(req.body as Buffer, req.header('stripe-signature') || '');
    } else {
      event = JSON.parse((req.body as Buffer).toString('utf8'));
    }
  } catch (e: any) {
    res.status(400).json({ error: `webhook: ${e.message}` });
    return;
  }

  if (!event?.id || !event?.type) { res.status(400).json({ error: 'evento inválido' }); return; }

  // Idempotência
  const already = await prisma.webhookEvent.findUnique({ where: { providerEventId: event.id } }).catch(() => null);
  if (already) { res.json({ received: true, duplicate: true }); return; }

  try {
    const obj = event.data?.object || {};
    if (event.type === 'checkout.session.completed') {
      const md = obj.metadata || {};
      const consultancyId = md.consultancyId;
      if (consultancyId) {
        // guarda o id da assinatura recorrente, se houver
        if (obj.subscription) {
          await prisma.subscription.update({ where: { consultancyId }, data: { providerSubscriptionId: obj.subscription } }).catch(() => {});
        }
        await activateByConsultancy(consultancyId, md.planKey, obj.amount_total || 0, obj.payment_intent || obj.id, md.invoiceId);
      }
    } else if (event.type === 'invoice.paid') {
      // renovação recorrente
      const sub = await prisma.subscription.findFirst({ where: { providerCustomerId: obj.customer } });
      if (sub) await activateByConsultancy(sub.consultancyId, sub.planKey, obj.amount_paid || 0, obj.id);
    } else if (event.type === 'invoice.payment_failed') {
      const sub = await prisma.subscription.findFirst({ where: { providerCustomerId: obj.customer } });
      if (sub) {
        await markPastDue(sub.consultancyId);
        const admin = await prisma.user.findFirst({ where: { consultancyId: sub.consultancyId, role: 'CONSULTANCY_ADMIN' }, orderBy: { createdAt: 'asc' } });
        if (admin?.email) await sendPaymentOverdue(admin.email);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = await prisma.subscription.findFirst({ where: { providerCustomerId: obj.customer } });
      if (sub) await cancelSub(sub.consultancyId);
    }
    await prisma.webhookEvent.create({ data: { provider: 'stripe', providerEventId: event.id } });
    logger.info({ type: event.type }, 'stripe webhook');
    res.json({ received: true });
  } catch (e: any) {
    logger.error({ err: e.message, type: event.type }, 'stripe webhook error');
    res.status(500).json({ error: e.message });
  }
}
