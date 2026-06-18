import prisma from '../lib/prisma';

export interface CatalogItemInput {
  kind: string;   // PARTNER_PROFILE | RFC_DEST | MESSAGE_TYPE | ODATA_SERVICE | IDOC_PORT
  name: string;
  detail?: string;
  attributes?: Record<string, unknown>;
  active?: boolean;
}

/** Ingere o catálogo descoberto pelo agente: upsert por (integration,kind,name);
 *  o que sumiu da descoberta é marcado inativo (não some — vira histórico). */
export async function ingestCatalog(integrationId: string, clientId: string, items: CatalogItemInput[]) {
  const seen = new Set<string>();
  for (const it of items || []) {
    if (!it.kind || !it.name) continue;
    seen.add(`${it.kind}::${it.name}`);
    const data = {
      detail: it.detail ?? null,
      attributes: (it.attributes ?? undefined) as object | undefined,
      active: it.active !== false,
      lastSeenAt: new Date(),
    };
    await prisma.interfaceCatalogItem.upsert({
      where: { integrationId_kind_name: { integrationId, kind: it.kind, name: it.name } },
      update: { ...data, clientId },
      create: { integrationId, clientId, kind: it.kind, name: it.name, ...data },
    });
  }
  const existing = await prisma.interfaceCatalogItem.findMany({
    where: { integrationId, active: true },
    select: { id: true, kind: true, name: true },
  });
  const gone = existing.filter((e) => !seen.has(`${e.kind}::${e.name}`)).map((e) => e.id);
  if (gone.length) await prisma.interfaceCatalogItem.updateMany({ where: { id: { in: gone } }, data: { active: false } });
  return { upserted: (items || []).length, deactivated: gone.length };
}

export interface CatalogFilters { clientId?: string; kind?: string; q?: string }

export async function getCatalog(consultancyId: string, f: CatalogFilters = {}) {
  const clientIds = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const where: Record<string, unknown> = { clientId: { in: clientIds } };
  if (f.clientId) where.clientId = f.clientId;
  if (f.kind) where.kind = f.kind;
  if (f.q) {
    where.OR = [
      { name: { contains: f.q, mode: 'insensitive' } },
      { detail: { contains: f.q, mode: 'insensitive' } },
    ];
  }
  const [items, all] = await Promise.all([
    prisma.interfaceCatalogItem.findMany({
      where,
      orderBy: [{ kind: 'asc' }, { name: 'asc' }],
      take: 1000,
      include: { client: { select: { name: true } } },
    }),
    prisma.interfaceCatalogItem.findMany({ where: { clientId: { in: clientIds } }, select: { kind: true, active: true } }),
  ]);

  const byKind: Record<string, number> = {};
  let active = 0;
  for (const i of all) {
    byKind[i.kind] = (byKind[i.kind] || 0) + 1;
    if (i.active) active++;
  }

  return {
    items: items.map((i) => ({
      id: i.id, kind: i.kind, name: i.name, detail: i.detail, attributes: i.attributes,
      active: i.active, lastSeenAt: i.lastSeenAt, client: i.client?.name, clientId: i.clientId,
    })),
    summary: { total: all.length, active, byKind },
  };
}
