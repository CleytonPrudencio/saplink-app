import prisma from '../lib/prisma';
import { ACTION_FOR_KIND } from './remediation';
import { lookup } from './federated';

// AMS Autônomo: detecta → diagnostica → corrige → mede → aprende.
// A confiança vem da Rede Federada (taxa de sucesso real da correção). Acima do limiar
// da política, a correção é auto-aprovada (autoExecuted) e o agente executa no próximo poll.

export async function getPolicy(consultancyId: string) {
  const p = await prisma.autoHealPolicy.findUnique({ where: { consultancyId } });
  return {
    enabled: p?.enabled ?? false,
    minConfidence: p?.minConfidence ?? 85,
    allowedActions: (p?.allowedActions as string[] | undefined) ?? ['REPROCESS_IDOC', 'RETRY_TRFC', 'UNLOCK_QUEUE'],
  };
}

export async function savePolicy(consultancyId: string, input: { enabled?: boolean; minConfidence?: number; allowedActions?: string[] }) {
  const data = {
    enabled: input.enabled ?? false,
    minConfidence: Math.max(0, Math.min(100, input.minConfidence ?? 85)),
    allowedActions: (input.allowedActions ?? ['REPROCESS_IDOC', 'RETRY_TRFC', 'UNLOCK_QUEUE']) as any,
  };
  await prisma.autoHealPolicy.upsert({ where: { consultancyId }, update: data, create: { consultancyId, ...data } });
  return getPolicy(consultancyId);
}

/** Confiança de uma correção para um item, com base na Rede Federada. */
export async function confidenceFor(kind: string, statusText?: string | null, actionType?: string): Promise<number> {
  const net = await lookup(kind, statusText);
  if (!net?.bestFix) return 0;
  if (actionType && net.bestFix.action !== actionType) {
    const f = net.fixes.find((x) => x.action === actionType);
    return f && f.count >= 2 ? Math.round((f.successCount / f.count) * 100) : 0;
  }
  return net.bestFix.count >= 2 ? net.bestFix.successRate : 0;
}

/**
 * Avalia itens SAP remediáveis de um cliente e auto-cria/aprova correções de alta confiança.
 * Retorna quantas ações foram disparadas automaticamente.
 */
export async function autoHealClient(consultancyId: string, clientId: string): Promise<number> {
  const policy = await getPolicy(consultancyId);
  if (!policy.enabled) return 0;
  const items = await prisma.sapItem.findMany({ where: { clientId, resolved: false, remediable: true }, take: 50 });
  let fired = 0;
  for (const it of items) {
    const actionType = ACTION_FOR_KIND[it.kind] || 'REPROCESS_IDOC';
    if (!policy.allowedActions.includes(actionType)) continue;
    // já tem ação em aberto?
    const open = await prisma.remediationAction.findFirst({ where: { sapItemId: it.id, status: { in: ['PENDING_APPROVAL', 'APPROVED', 'EXECUTING'] } } });
    if (open) continue;
    const confidence = await confidenceFor(it.kind, it.statusText, actionType);
    if (confidence < policy.minConfidence) continue;
    // Trava de produção: em PRD o AMS autônomo NÃO executa sozinho — apenas sugere (pendente de aprovação humana).
    const isProd = ((it as any).environment || 'PRD') === 'PRD';
    await prisma.remediationAction.create({
      data: {
        clientId: it.clientId, environment: (it as any).environment || 'PRD', integrationId: it.integrationId, sapItemId: it.id, actionType, target: it.ref,
        params: { kind: it.kind, messageType: it.messageType, partner: it.partner, statusCode: it.statusCode, auto: true },
        beforeText: `${it.kind} ${it.ref} — ${it.statusText || ''}`.trim(),
        status: isProd ? 'PENDING_APPROVAL' : 'APPROVED', autoExecuted: !isProd, confidence,
      },
    });
    if (!isProd) fired += 1;
  }
  return fired;
}

/** Scoreboard do AMS: % resolvido sem humano, MTTR, volume. */
export async function scoreboard(consultancyId: string) {
  const clientIds = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const actions = await prisma.remediationAction.findMany({
    where: { clientId: { in: clientIds } },
    select: { status: true, autoExecuted: true, confidence: true, requestedAt: true, executedAt: true, actionType: true },
    orderBy: { requestedAt: 'desc' }, take: 1000,
  });
  const done = actions.filter((a) => a.status === 'DONE');
  const auto = actions.filter((a) => a.autoExecuted);
  const autoDone = done.filter((a) => a.autoExecuted);
  const mttrMin = done.length
    ? Math.round(done.reduce((s, a) => s + (a.executedAt && a.requestedAt ? (a.executedAt.getTime() - a.requestedAt.getTime()) / 60000 : 0), 0) / done.length)
    : 0;
  const autonomyRate = done.length ? Math.round((autoDone.length / done.length) * 100) : 0;
  const byAction: Record<string, number> = {};
  for (const a of done) byAction[a.actionType] = (byAction[a.actionType] || 0) + 1;
  return {
    total: actions.length, resolved: done.length, autoFired: auto.length, autoResolved: autoDone.length,
    autonomyRate, mttrMin, byAction,
    pending: actions.filter((a) => a.status === 'PENDING_APPROVAL').length,
  };
}
