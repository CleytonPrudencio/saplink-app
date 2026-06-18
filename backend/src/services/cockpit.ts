import prisma from '../lib/prisma';

export interface SapItemInput {
  kind: string;            // IDOC | QRFC | TRFC
  direction?: string;
  ref: string;
  messageType?: string;
  partner?: string;
  statusCode?: string;
  statusText?: string;
  depth?: number;
  remediable?: boolean;
}

/** Ingere o snapshot de itens operacionais do agente: upsert por (integration,kind,ref);
 *  o que sumiu do snapshot é marcado como resolvido. */
export async function ingestSapItems(integrationId: string, clientId: string, items: SapItemInput[]) {
  const seen = new Set<string>();
  for (const it of items || []) {
    if (!it.kind || !it.ref) continue;
    seen.add(`${it.kind}::${it.ref}`);
    const data = {
      direction: it.direction ?? null,
      messageType: it.messageType ?? null,
      partner: it.partner ?? null,
      statusCode: it.statusCode ?? null,
      statusText: it.statusText ?? null,
      depth: typeof it.depth === 'number' ? it.depth : 1,
      remediable: !!it.remediable,
    };
    await prisma.sapItem.upsert({
      where: { integrationId_kind_ref: { integrationId, kind: it.kind, ref: it.ref } },
      update: { ...data, clientId, resolved: false, lastSeenAt: new Date() },
      create: { integrationId, clientId, kind: it.kind, ref: it.ref, ...data },
    });
  }
  const existing = await prisma.sapItem.findMany({
    where: { integrationId, resolved: false },
    select: { id: true, kind: true, ref: true },
  });
  const toResolve = existing.filter((e) => !seen.has(`${e.kind}::${e.ref}`)).map((e) => e.id);
  if (toResolve.length) await prisma.sapItem.updateMany({ where: { id: { in: toResolve } }, data: { resolved: true } });
  return { upserted: (items || []).length, resolved: toResolve.length };
}

export interface CockpitFilters { clientId?: string; kind?: string; status?: string; q?: string }

export async function getCockpit(consultancyId: string, f: CockpitFilters = {}) {
  const where: Record<string, unknown> = { client: { consultancyId }, resolved: false };
  if (f.clientId) where.clientId = f.clientId;
  if (f.kind) where.kind = f.kind;
  if (f.status) where.statusCode = f.status;
  if (f.q) {
    const q = f.q;
    where.OR = [
      { ref: { contains: q, mode: 'insensitive' } },
      { messageType: { contains: q, mode: 'insensitive' } },
      { partner: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [items, all] = await Promise.all([
    prisma.sapItem.findMany({
      where,
      orderBy: [{ kind: 'asc' }, { lastSeenAt: 'desc' }],
      take: 500,
      include: { client: { select: { id: true, name: true } }, integration: { select: { id: true, name: true } } },
    }),
    prisma.sapItem.findMany({
      where: { client: { consultancyId }, resolved: false },
      select: { kind: true, statusCode: true, depth: true, clientId: true, remediable: true },
    }),
  ]);

  const byKind: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byClient: Record<string, number> = {};
  let queueDepth = 0;
  let remediable = 0;
  for (const i of all) {
    byKind[i.kind] = (byKind[i.kind] || 0) + 1;
    if (i.statusCode) byStatus[i.statusCode] = (byStatus[i.statusCode] || 0) + 1;
    byClient[i.clientId] = (byClient[i.clientId] || 0) + 1;
    if (i.kind !== 'IDOC') queueDepth += i.depth || 0;
    if (i.remediable) remediable++;
  }

  return {
    items: items.map((i) => ({
      id: i.id,
      kind: i.kind,
      direction: i.direction,
      ref: i.ref,
      messageType: i.messageType,
      partner: i.partner,
      statusCode: i.statusCode,
      statusText: i.statusText,
      depth: i.depth,
      remediable: i.remediable,
      lastSeenAt: i.lastSeenAt,
      client: i.client?.name,
      clientId: i.clientId,
      integration: i.integration?.name,
      integrationId: i.integrationId,
    })),
    summary: { total: all.length, byKind, byStatus, byClient, queueDepth, remediable },
  };
}
