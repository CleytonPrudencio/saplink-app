import prisma from '../lib/prisma';
import { consultancyClientIds } from '../lib/scope';
import { recordFix } from './federated';

// Mapeia o tipo de item para a ação de remediação padrão e a transação SAP equivalente.
export const ACTION_FOR_KIND: Record<string, string> = {
  IDOC: 'REPROCESS_IDOC',
  QRFC: 'UNLOCK_QUEUE',
  TRFC: 'RETRY_TRFC',
};

export const ACTION_LABEL: Record<string, string> = {
  REPROCESS_IDOC: 'Reprocessar IDoc (BD87 / RBDMANI2)',
  UNLOCK_QUEUE: 'Destravar fila qRFC (SMQ2)',
  RETRY_TRFC: 'Reexecutar tRFC (SM58)',
  REACTIVATE_RFC: 'Reativar destino RFC (SM59)',
};

/** Cria uma ação de remediação (PENDING_APPROVAL) para um SapItem remediável da consultoria. */
export async function createAction(consultancyId: string, userId: string | undefined, sapItemId: string, actionType?: string) {
  const item = await prisma.sapItem.findUnique({ where: { id: sapItemId }, include: { client: true } });
  if (!item || item.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  if (item.resolved) return { error: 'RESOLVED' as const };
  if (!item.remediable) return { error: 'NOT_REMEDIABLE' as const };

  const type = actionType || ACTION_FOR_KIND[item.kind] || 'REPROCESS_IDOC';
  // evita duplicar ação em aberto para o mesmo item
  const open = await prisma.remediationAction.findFirst({
    where: { sapItemId, status: { in: ['PENDING_APPROVAL', 'APPROVED', 'EXECUTING'] } },
  });
  if (open) return { action: open, duplicate: true };

  const action = await prisma.remediationAction.create({
    data: {
      clientId: item.clientId,
      environment: (item as any).environment || 'PRD',
      integrationId: item.integrationId,
      sapItemId: item.id,
      actionType: type,
      target: item.ref,
      params: { kind: item.kind, messageType: item.messageType, partner: item.partner, statusCode: item.statusCode },
      beforeText: `${item.kind} ${item.ref} — status ${item.statusCode || '?'}: ${item.statusText || ''}`.trim(),
      requestedById: userId ?? null,
      status: 'PENDING_APPROVAL',
    },
  });
  return { action };
}

export async function setStatus(consultancyId: string, userId: string | undefined, actionId: string, decision: 'APPROVED' | 'REJECTED', confirmProd = false) {
  const action = await prisma.remediationAction.findUnique({ where: { id: actionId }, include: { sapItem: { include: { client: true } } } });
  if (!action || action.sapItem?.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  if (action.status !== 'PENDING_APPROVAL') return { error: 'NOT_PENDING' as const };
  // Trava de produção: aprovar ação que mexe no SAP de PRODUÇÃO exige confirmação explícita.
  if (decision === 'APPROVED' && action.environment === 'PRD' && !confirmProd) {
    return { error: 'PROD_CONFIRM' as const };
  }
  const updated = await prisma.remediationAction.update({
    where: { id: actionId },
    data: { status: decision, approvedById: userId ?? null, approvedAt: new Date() },
  });
  return { action: updated };
}

export async function listActions(consultancyId: string, status?: string) {
  const clientIds = await consultancyClientIds(consultancyId);
  const where: Record<string, unknown> = { clientId: { in: clientIds } };
  if (status) where.status = status;
  const actions = await prisma.remediationAction.findMany({
    where,
    orderBy: { requestedAt: 'desc' },
    take: 200,
    include: { sapItem: { select: { kind: true, ref: true } } },
  });
  return actions;
}

/** Agente reivindica os comandos aprovados da sua integração: vira EXECUTING. */
export async function claimCommands(integrationId: string) {
  const approved = await prisma.remediationAction.findMany({
    where: { integrationId, status: 'APPROVED' },
    take: 20,
  });
  if (approved.length) {
    await prisma.remediationAction.updateMany({
      where: { id: { in: approved.map((a) => a.id) } },
      data: { status: 'EXECUTING' },
    });
  }
  return approved.map((a) => ({ id: a.id, actionType: a.actionType, target: a.target, params: a.params }));
}

/** Agente reporta o resultado da execução. Em sucesso, resolve o SapItem. */
export async function recordResult(integrationId: string, actionId: string, result: { ok: boolean; resultText?: string; afterText?: string }) {
  const action = await prisma.remediationAction.findUnique({ where: { id: actionId } });
  if (!action || action.integrationId !== integrationId) return { error: 'NOT_FOUND' as const };

  const updated = await prisma.remediationAction.update({
    where: { id: actionId },
    data: {
      status: result.ok ? 'DONE' : 'FAILED',
      resultText: result.resultText ?? null,
      afterText: result.afterText ?? null,
      executedAt: new Date(),
    },
  });
  if (result.ok && action.sapItemId) {
    await prisma.sapItem.update({ where: { id: action.sapItemId }, data: { resolved: true } }).catch(() => {});
  }
  // ensina a Rede Federada: esta correção funcionou/falhou para esta assinatura de falha
  try {
    const item = action.sapItemId ? await prisma.sapItem.findUnique({ where: { id: action.sapItemId }, select: { kind: true, statusText: true } }) : null;
    const minutes = action.requestedAt ? Math.round((Date.now() - action.requestedAt.getTime()) / 60000) : undefined;
    if (item) await recordFix(item.kind, item.statusText, action.actionType, result.ok, minutes);
  } catch { /* não bloqueia */ }
  return { action: updated };
}
