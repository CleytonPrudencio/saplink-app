import prisma from '../lib/prisma';
import { logger } from '../lib/logger';
import { activateSubscription, markPastDue, cancel as cancelSub } from './billing';
import { sendPaymentConfirmed, sendPaymentOverdue } from './email';

// Gateway de pagamento Asaas (https://docs.asaas.com). PIX, boleto e cartão.
// Sandbox: ASAAS_API_URL=https://sandbox.asaas.com/api/v3
// Produção: ASAAS_API_URL=https://api.asaas.com/v3
const API_URL = (process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3').replace(/\/$/, '');
const API_KEY = process.env.ASAAS_API_KEY;

export function asaasEnabled(): boolean {
  return !!API_KEY;
}

async function asaas<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { access_token: API_KEY!, 'Content-Type': 'application/json', ...(init.headers || {}) },
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as any)?.errors?.[0]?.description || `Asaas HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

/** Garante um cliente Asaas para a consultoria (cria 1x, reusa pelo providerCustomerId). */
async function ensureCustomer(consultancyId: string): Promise<string> {
  const sub = await prisma.subscription.findUnique({ where: { consultancyId } });
  if (sub?.providerCustomerId) return sub.providerCustomerId;

  const consultancy = await prisma.consultancy.findUnique({ where: { id: consultancyId } });
  if (!consultancy) throw new Error('Consultoria não encontrada');
  if (!consultancy.cnpj) throw new Error('Preencha o CNPJ da consultoria antes de assinar (necessário para a cobrança).');
  const admin = await prisma.user.findFirst({
    where: { consultancyId, role: 'CONSULTANCY_ADMIN' },
    orderBy: { createdAt: 'asc' },
  });

  const customer = await asaas<{ id: string }>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: consultancy.name,
      cpfCnpj: consultancy.cnpj.replace(/\D/g, ''),
      email: admin?.email,
    }),
  });
  return customer.id;
}

/**
 * Inicia o checkout no Asaas e devolve a URL de pagamento (PIX/boleto/cartão).
 * mode='auto'  → assinatura RECORRENTE (cobrança automática mensal).
 * mode='now'   → cobrança AVULSA da primeira mensalidade (sem renovação automática).
 * A ativação local só acontece quando o webhook PAYMENT_CONFIRMED chegar.
 */
export async function createCheckout(
  consultancyId: string,
  planKey: string,
  mode: 'auto' | 'now' = 'auto'
): Promise<{ url: string; mode: string }> {
  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan) throw new Error('Plano não encontrado');
  if (plan.priceCents <= 0) throw new Error('Plano gratuito não requer pagamento');

  const customerId = await ensureCustomer(consultancyId);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const value = plan.priceCents / 100;

  if (mode === 'now') {
    // Cobrança única (paga agora, sem recorrência)
    const payment = await asaas<{ id: string; invoiceUrl?: string; bankSlipUrl?: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: customerId, billingType: 'UNDEFINED', value, dueDate: today,
        description: `SAPLINK — Plano ${plan.name} (pagamento avulso)`, externalReference: consultancyId,
      }),
    });
    await prisma.subscription.upsert({
      where: { consultancyId },
      create: { consultancyId, planKey, status: 'PAST_DUE', provider: 'asaas', providerCustomerId: customerId, autoRenew: false },
      update: { planKey, provider: 'asaas', providerCustomerId: customerId, autoRenew: false },
    });
    await prisma.invoice.create({
      data: { consultancyId, amountCents: plan.priceCents, status: 'OPEN', providerInvoiceId: payment.id, dueDate: new Date() },
    });
    return { url: payment.invoiceUrl || payment.bankSlipUrl || `${API_URL.replace('/api/v3', '')}/`, mode };
  }

  // mode='auto': assinatura recorrente
  const subscription = await asaas<{ id: string }>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId, billingType: 'UNDEFINED', value, nextDueDate: today,
      cycle: 'MONTHLY', description: `SAPLINK — Plano ${plan.name}`, externalReference: consultancyId,
    }),
  });
  await prisma.subscription.upsert({
    where: { consultancyId },
    create: { consultancyId, planKey, status: 'PAST_DUE', provider: 'asaas', providerCustomerId: customerId, providerSubscriptionId: subscription.id, autoRenew: true },
    update: { planKey, provider: 'asaas', providerCustomerId: customerId, providerSubscriptionId: subscription.id, autoRenew: true },
  });
  const payments = await asaas<{ data: Array<{ invoiceUrl?: string; bankSlipUrl?: string }> }>(
    `/payments?subscription=${subscription.id}`
  );
  const url = payments.data?.[0]?.invoiceUrl || payments.data?.[0]?.bankSlipUrl || `${API_URL.replace('/api/v3', '')}/`;
  return { url, mode };
}

/** Gera um link de pagamento Asaas para uma fatura ABERTA existente (pagar agora). */
export async function createInvoicePayment(consultancyId: string, invoiceId: string): Promise<{ url: string }> {
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, consultancyId } });
  if (!invoice) throw new Error('Fatura não encontrada');
  if (invoice.status === 'PAID') throw new Error('Fatura já está paga');
  const customerId = await ensureCustomer(consultancyId);
  const today = new Date().toISOString().slice(0, 10);
  const payment = await asaas<{ id: string; invoiceUrl?: string; bankSlipUrl?: string }>('/payments', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerId, billingType: 'UNDEFINED', value: invoice.amountCents / 100, dueDate: today,
      description: 'SAPLINK — Fatura', externalReference: consultancyId,
    }),
  });
  await prisma.invoice.update({ where: { id: invoice.id }, data: { providerInvoiceId: payment.id } });
  return { url: payment.invoiceUrl || payment.bankSlipUrl || `${API_URL.replace('/api/v3', '')}/` };
}

interface AsaasWebhook {
  event: string;
  payment?: { id: string; customer?: string; subscription?: string; value?: number };
}

/** Mapeia um evento de webhook do Asaas para o estado da assinatura. Idempotência é do chamador. */
export async function handleWebhook(evt: AsaasWebhook): Promise<{ action: string; consultancyId?: string }> {
  const p = evt.payment;
  if (!p) return { action: 'ignored:no_payment' };

  // Encontra nossa assinatura pelo id de assinatura ou de cliente do Asaas
  const sub = await prisma.subscription.findFirst({
    where: {
      OR: [
        p.subscription ? { providerSubscriptionId: p.subscription } : undefined,
        p.customer ? { providerCustomerId: p.customer } : undefined,
      ].filter(Boolean) as any,
    },
  });
  if (!sub) return { action: 'ignored:subscription_not_found' };
  const consultancyId = sub.consultancyId;
  const admin = await prisma.user.findFirst({ where: { consultancyId, role: 'CONSULTANCY_ADMIN' }, orderBy: { createdAt: 'asc' } });
  const plan = await prisma.plan.findUnique({ where: { key: sub.planKey } });

  switch (evt.event) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED':
      await activateSubscription(consultancyId, sub.planKey);
      await prisma.invoice.create({
        data: {
          consultancyId, subscriptionId: sub.id,
          amountCents: Math.round((p.value ?? (plan?.priceCents ?? 0) / 100) * 100),
          status: 'PAID', providerInvoiceId: p.id, paidAt: new Date(),
        },
      });
      if (admin?.email) await sendPaymentConfirmed(admin.email, plan?.name || sub.planKey);
      return { action: 'activated', consultancyId };

    case 'PAYMENT_OVERDUE':
      await markPastDue(consultancyId);
      if (admin?.email) await sendPaymentOverdue(admin.email);
      return { action: 'past_due', consultancyId };

    case 'PAYMENT_DELETED':
    case 'PAYMENT_REFUNDED':
    case 'SUBSCRIPTION_DELETED':
      await cancelSub(consultancyId);
      return { action: 'canceled', consultancyId };

    default:
      return { action: `ignored:${evt.event}`, consultancyId };
  }
}
