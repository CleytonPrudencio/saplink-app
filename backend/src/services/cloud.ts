import prisma from '../lib/prisma';
import { diagnose, generateFix, type Lang } from './ai';
import { recordFailure } from './federated';

export interface CloudItemInput {
  source: string;       // CPI | AIF
  artifact: string;     // IFlow (CPI) ou interface (AIF)
  messageId: string;
  direction?: string;
  status?: string;      // COMPLETED | FAILED | RETRY | ESCALATED
  error?: string;
  occurredAt?: string;
}

function cloudSeverity(status: string): string {
  const s = (status || '').toUpperCase();
  if (s.includes('ESCAL')) return 'CRITICAL';
  if (s.includes('FAIL') || s.includes('ERROR')) return 'HIGH';
  return 'MEDIUM'; // RETRY
}

/** Cria 1 alerta aberto por artefato com falha (dedup) — alimenta on-call/ticket/SLA. */
async function ensureCloudAlert(integrationId: string, clientId: string, source: string, artifact: string, status: string, err?: string | null, environment = 'PRD') {
  const tag = `${source} · ${artifact}`;
  const open = await prisma.alert.findFirst({ where: { integrationId, resolved: false, type: 'CLOUD_FAILURE', message: { startsWith: tag } } });
  if (open) return false;
  await prisma.alert.create({
    data: {
      type: 'CLOUD_FAILURE', severity: cloudSeverity(status),
      message: `${tag} — mensagem ${status}${err ? `: ${String(err).slice(0, 180)}` : ''}`,
      clientId, integrationId, environment,
    },
  });
  return true;
}

/** Resolve os alertas de CPI/AIF de artefatos que voltaram a processar sem falha. */
async function clearCloudAlerts(integrationId: string, healthyArtifacts: Set<string>) {
  const open = await prisma.alert.findMany({ where: { integrationId, resolved: false, type: 'CLOUD_FAILURE' }, select: { id: true, message: true } });
  for (const a of open) {
    for (const art of healthyArtifacts) {
      if (a.message.includes(`· ${art} `) || a.message.includes(`· ${art} —`)) {
        await prisma.alert.update({ where: { id: a.id }, data: { resolved: true, resolvedAt: new Date() } });
        break;
      }
    }
  }
}

/** Ingere mensagens CPI/AIF (upsert por integração+source+messageId) + gera alertas de falha. */
export async function ingestCloud(integrationId: string, clientId: string, items: CloudItemInput[]) {
  const integ = await prisma.integration.findUnique({ where: { id: integrationId }, select: { environment: true } });
  const environment = integ?.environment || 'PRD';
  let n = 0, alerts = 0;
  const seenHealthy = new Set<string>();
  const failedArtifacts = new Set<string>();
  for (const it of items || []) {
    if (!it.source || !it.artifact || !it.messageId) continue;
    const failed = /FAIL|ERROR|ESCAL|RETRY/i.test(it.status || '');
    const existing = await prisma.cloudItem.findUnique({ where: { integrationId_source_messageId: { integrationId, source: it.source, messageId: it.messageId } } });
    const data = {
      clientId, environment, artifact: it.artifact, direction: it.direction ?? null,
      status: it.status ?? null, error: it.error ?? null,
      occurredAt: it.occurredAt ? new Date(it.occurredAt) : null,
      resolved: !failed,
    };
    await prisma.cloudItem.upsert({
      where: { integrationId_source_messageId: { integrationId, source: it.source, messageId: it.messageId } },
      update: data,
      create: { integrationId, source: it.source, messageId: it.messageId, ...data },
    });
    n++;
    if (failed) {
      failedArtifacts.add(it.artifact);
      // nova falha (não existia ou estava resolvida) → garante alerta + alimenta a rede federada
      if (!existing || existing.resolved) {
        if (await ensureCloudAlert(integrationId, clientId, it.source, it.artifact, it.status || 'FAILED', it.error, environment)) alerts++;
        await recordFailure(clientId, it.source, it.error || it.status).catch(() => {});
      }
    } else {
      seenHealthy.add(it.artifact);
    }
  }
  // artefatos que só tiveram sucesso no lote → resolve alertas antigos (recuperação)
  const healthy = new Set([...seenHealthy].filter((a) => !failedArtifacts.has(a)));
  if (healthy.size) await clearCloudAlerts(integrationId, healthy);
  return { upserted: n, alerts };
}

/**
 * Diagnóstico de IA para uma falha de CPI/AIF: causa raiz + passos de correção + prevenção.
 * Salva no próprio CloudItem (cache) — re-chama a IA com `force` se já houver diagnóstico.
 */
export async function diagnoseCloudItem(consultancyId: string, id: string, force = false, lang: Lang = 'pt') {
  const item = await prisma.cloudItem.findUnique({ where: { id } });
  if (!item) return { error: 'NOT_FOUND' as const };
  // valida o tenant pelo cliente do item
  const client = await prisma.client.findFirst({ where: { id: item.clientId, consultancyId }, select: { name: true } });
  if (!client) return { error: 'NOT_FOUND' as const };
  if (item.aiDiagnosis && !force) {
    return { ok: true, diagnosis: item.aiDiagnosis, diagnosedAt: item.aiDiagnosedAt, cached: true };
  }
  const integration = item.integrationId
    ? await prisma.integration.findUnique({ where: { id: item.integrationId }, select: { name: true } })
    : null;

  // outras falhas recentes do mesmo artefato dão padrão à IA (recorrência?)
  const related = await prisma.cloudItem.findMany({
    where: { clientId: item.clientId, source: item.source, artifact: item.artifact, resolved: false, NOT: { id: item.id } },
    orderBy: { occurredAt: 'desc' }, take: 5,
    select: { status: true, error: true, occurredAt: true },
  });

  const context = {
    cliente: client.name,
    plataforma: item.source === 'CPI' ? 'SAP Cloud Integration (BTP/CPI)' : 'SAP AIF (Application Interface Framework)',
    integracao: integration?.name,
    artefato_ou_iflow: item.artifact,
    direcao: item.direction,
    status: item.status,
    messageId: item.messageId,
    ocorrido_em: item.occurredAt,
    erro: item.error || '(sem detalhe de erro capturado)',
    falhas_recentes_do_mesmo_artefato: related.map((r) => ({ status: r.status, erro: r.error, em: r.occurredAt })),
  };
  const query = `Esta mensagem de integração ${item.source} falhou no artefato "${item.artifact}". `
    + `Diagnostique a causa raiz com base no erro e proponha os passos de correção (no SAP/S4 e no IFlow/CPI quando couber) e como prevenir a recorrência.`;

  const diagnosis = await diagnose(query, context, consultancyId, lang);
  await prisma.cloudItem.update({ where: { id: item.id }, data: { aiDiagnosis: diagnosis, aiDiagnosedAt: new Date() } });
  return { ok: true, diagnosis, diagnosedAt: new Date(), cached: false };
}

/** Remediação generativa: a IA escreve a correção pronta (snippet/config) para a falha. */
export async function fixCloudItem(consultancyId: string, id: string, force = false, lang: Lang = 'pt') {
  const item = await prisma.cloudItem.findUnique({ where: { id } });
  if (!item) return { error: 'NOT_FOUND' as const };
  const client = await prisma.client.findFirst({ where: { id: item.clientId, consultancyId }, select: { name: true } });
  if (!client) return { error: 'NOT_FOUND' as const };
  if (item.aiFix && !force) return { ok: true, fix: item.aiFix, cached: true };
  const context = {
    cliente: client.name,
    plataforma: item.source === 'CPI' ? 'SAP Cloud Integration (BTP/CPI)' : 'SAP AIF',
    artefato_ou_iflow: item.artifact, status: item.status, erro: item.error || '(sem detalhe)',
  };
  const fix = await generateFix(`falha em ${item.source} no artefato "${item.artifact}"`, context, consultancyId, lang);
  await prisma.cloudItem.update({ where: { id: item.id }, data: { aiFix: fix } });
  return { ok: true, fix, cached: false };
}

export interface CloudFilters { source?: string; status?: string; q?: string; clientId?: string; env?: string }

export async function getCloud(consultancyId: string, f: CloudFilters = {}) {
  const clientIds = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const where: Record<string, unknown> = { clientId: { in: f.clientId ? [f.clientId] : clientIds } };
  if (f.env) where.environment = f.env;
  if (f.source) where.source = f.source;
  if (f.status) where.status = f.status;
  if (f.q) where.OR = [
    { artifact: { contains: f.q, mode: 'insensitive' } },
    { messageId: { contains: f.q, mode: 'insensitive' } },
  ];

  const [items, all] = await Promise.all([
    prisma.cloudItem.findMany({ where, orderBy: { occurredAt: 'desc' }, take: 500 }),
    prisma.cloudItem.findMany({ where: { clientId: { in: clientIds } }, select: { source: true, status: true, resolved: true } }),
  ]);

  const bySource: Record<string, number> = {};
  let failed = 0;
  for (const i of all) {
    bySource[i.source] = (bySource[i.source] || 0) + 1;
    if (!i.resolved) failed++;
  }

  return {
    items: items.map((i) => ({
      id: i.id, source: i.source, artifact: i.artifact, messageId: i.messageId,
      direction: i.direction, status: i.status, error: i.error, occurredAt: i.occurredAt, resolved: i.resolved,
      aiDiagnosis: i.aiDiagnosis, aiDiagnosedAt: i.aiDiagnosedAt, aiFix: i.aiFix,
    })),
    summary: { total: all.length, failed, bySource },
  };
}
