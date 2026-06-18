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

/** Ingere mensagens CPI/AIF reportadas pelo agente (upsert por integração+source+messageId). */
export async function ingestCloud(integrationId: string, clientId: string, items: CloudItemInput[]) {
  let n = 0;
  for (const it of items || []) {
    if (!it.source || !it.artifact || !it.messageId) continue;
    const failed = /FAIL|ERROR|ESCAL|RETRY/i.test(it.status || '');
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
  }
  return { upserted: n };
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
