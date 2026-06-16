import prisma from '../lib/prisma';

export const SUB_STATUS = {
  TRIALING: 'TRIALING',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  SUSPENDED: 'SUSPENDED',
  CANCELED: 'CANCELED',
} as const;

const GRACE_DAYS = 7;
const TRIAL_DAYS = 14;

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
}

function periodKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Status EFETIVO da assinatura, já resolvendo expiração de trial/grace no tempo.
 * Retorna { status, allowed, reason }.
 *  - allowed=false => acesso deve ser cortado (só telas de billing liberadas).
 */
export async function getEffectiveStatus(consultancyId: string): Promise<{
  status: string;
  allowed: boolean;
  reason?: string;
  subscription: any;
}> {
  const sub = await prisma.subscription.findUnique({
    where: { consultancyId },
    include: { plan: true },
  });

  // Sem assinatura => trata como sem acesso (precisa assinar/trial)
  if (!sub) {
    return { status: 'NONE', allowed: false, reason: 'Nenhuma assinatura ativa.', subscription: null };
  }

  const now = new Date();

  // Trial expirado sem virar ACTIVE => corta
  if (sub.status === SUB_STATUS.TRIALING) {
    if (sub.trialEndsAt && sub.trialEndsAt < now) {
      return { status: SUB_STATUS.PAST_DUE, allowed: false, reason: 'Período de teste expirado.', subscription: sub };
    }
    return { status: SUB_STATUS.TRIALING, allowed: true, subscription: sub };
  }

  if (sub.status === SUB_STATUS.ACTIVE) {
    return { status: SUB_STATUS.ACTIVE, allowed: true, subscription: sub };
  }

  // PAST_DUE: ainda liberado durante a carência (grace)
  if (sub.status === SUB_STATUS.PAST_DUE) {
    if (sub.graceUntil && sub.graceUntil > now) {
      return { status: SUB_STATUS.PAST_DUE, allowed: true, reason: 'Pagamento pendente — regularize para não perder o acesso.', subscription: sub };
    }
    return { status: SUB_STATUS.SUSPENDED, allowed: false, reason: 'Assinatura suspensa por falta de pagamento.', subscription: sub };
  }

  // SUSPENDED / CANCELED => corta
  return {
    status: sub.status,
    allowed: false,
    reason: sub.status === SUB_STATUS.CANCELED ? 'Assinatura cancelada.' : 'Assinatura suspensa.',
    subscription: sub,
  };
}

/** Cria assinatura inicial em trial (no cadastro). */
export async function startTrial(consultancyId: string, planKey = 'STARTER') {
  const now = new Date();
  return prisma.subscription.create({
    data: {
      consultancyId,
      planKey,
      status: SUB_STATUS.TRIALING,
      trialEndsAt: addDays(now, TRIAL_DAYS),
    },
  });
}

/** Ativa/renova a assinatura (pagamento confirmado). */
export async function activateSubscription(consultancyId: string, planKey?: string) {
  const now = new Date();
  const sub = await prisma.subscription.findUnique({ where: { consultancyId } });
  if (!sub) {
    return prisma.subscription.create({
      data: {
        consultancyId,
        planKey: planKey || 'PRO',
        status: SUB_STATUS.ACTIVE,
        currentPeriodEnd: addDays(now, 30),
      },
    });
  }
  return prisma.subscription.update({
    where: { consultancyId },
    data: {
      status: SUB_STATUS.ACTIVE,
      planKey: planKey || sub.planKey,
      currentPeriodEnd: addDays(now, 30),
      graceUntil: null,
    },
  });
}

/** Marca como inadimplente e abre carência (falha de pagamento). */
export async function markPastDue(consultancyId: string) {
  const now = new Date();
  return prisma.subscription.update({
    where: { consultancyId },
    data: { status: SUB_STATUS.PAST_DUE, graceUntil: addDays(now, GRACE_DAYS) },
  });
}

/** Suspende imediatamente (corte manual pelo super-admin ou fim da carência). */
export async function suspend(consultancyId: string) {
  return prisma.subscription.update({
    where: { consultancyId },
    data: { status: SUB_STATUS.SUSPENDED },
  });
}

export async function cancel(consultancyId: string) {
  return prisma.subscription.update({
    where: { consultancyId },
    data: { status: SUB_STATUS.CANCELED, cancelAtPeriodEnd: true },
  });
}

/** Limites do plano vs uso atual. Lança Error com mensagem amigável se estourar. */
export async function assertWithinLimit(
  consultancyId: string,
  resource: 'clients' | 'integrations' | 'users' | 'aiDiagnostics'
): Promise<void> {
  const sub = await prisma.subscription.findUnique({ where: { consultancyId }, include: { plan: true } });
  if (!sub || !sub.plan) return; // sem plano definido, não limita

  const plan = sub.plan;
  if (resource === 'clients') {
    const count = await prisma.client.count({ where: { consultancyId } });
    if (count >= plan.maxClients) throw new LimitError(`Limite do plano atingido: ${plan.maxClients} clientes. Faça upgrade.`);
  } else if (resource === 'integrations') {
    const count = await prisma.integration.count({ where: { client: { consultancyId } } });
    if (count >= plan.maxIntegrations) throw new LimitError(`Limite do plano atingido: ${plan.maxIntegrations} integrações. Faça upgrade.`);
  } else if (resource === 'users') {
    const count = await prisma.user.count({ where: { consultancyId } });
    if (count >= plan.maxUsers) throw new LimitError(`Limite do plano atingido: ${plan.maxUsers} usuários. Faça upgrade.`);
  } else if (resource === 'aiDiagnostics') {
    const period = periodKey();
    const counter = await prisma.usageCounter.findUnique({
      where: { consultancyId_period: { consultancyId, period } },
    });
    const used = counter?.aiDiagnostics ?? 0;
    if (used >= plan.maxAiDiagnosticsPerMonth)
      throw new LimitError(`Limite mensal de diagnósticos de IA atingido (${plan.maxAiDiagnosticsPerMonth}). Faça upgrade.`);
  }
}

/** Incrementa o contador de uso mensal de diagnósticos de IA. */
export async function incrementAiUsage(consultancyId: string): Promise<void> {
  const period = periodKey();
  await prisma.usageCounter.upsert({
    where: { consultancyId_period: { consultancyId, period } },
    create: { consultancyId, period, aiDiagnostics: 1 },
    update: { aiDiagnostics: { increment: 1 } },
  });
}

export class LimitError extends Error {
  status = 402;
  constructor(message: string) {
    super(message);
    this.name = 'LimitError';
  }
}
