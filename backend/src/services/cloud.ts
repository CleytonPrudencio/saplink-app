import prisma from '../lib/prisma';

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
async function ensureCloudAlert(integrationId: string, clientId: string, source: string, artifact: string, status: string, err?: string | null) {
  const tag = `${source} · ${artifact}`;
  const open = await prisma.alert.findFirst({ where: { integrationId, resolved: false, type: 'CLOUD_FAILURE', message: { startsWith: tag } } });
  if (open) return false;
  await prisma.alert.create({
    data: {
      type: 'CLOUD_FAILURE', severity: cloudSeverity(status),
      message: `${tag} — mensagem ${status}${err ? `: ${String(err).slice(0, 180)}` : ''}`,
      clientId, integrationId,
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
  let n = 0, alerts = 0;
  const seenHealthy = new Set<string>();
  const failedArtifacts = new Set<string>();
  for (const it of items || []) {
    if (!it.source || !it.artifact || !it.messageId) continue;
    const failed = /FAIL|ERROR|ESCAL|RETRY/i.test(it.status || '');
    const existing = await prisma.cloudItem.findUnique({ where: { integrationId_source_messageId: { integrationId, source: it.source, messageId: it.messageId } } });
    const data = {
      clientId, artifact: it.artifact, direction: it.direction ?? null,
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
      // nova falha (não existia ou estava resolvida) → garante alerta
      if (!existing || existing.resolved) {
        if (await ensureCloudAlert(integrationId, clientId, it.source, it.artifact, it.status || 'FAILED', it.error)) alerts++;
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

export interface CloudFilters { source?: string; status?: string; q?: string; clientId?: string }

export async function getCloud(consultancyId: string, f: CloudFilters = {}) {
  const clientIds = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const where: Record<string, unknown> = { clientId: { in: f.clientId ? [f.clientId] : clientIds } };
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
    })),
    summary: { total: all.length, failed, bySource },
  };
}
