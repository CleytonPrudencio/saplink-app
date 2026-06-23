import prisma from '../lib/prisma';
import { consultancyClientIds, scopeWithClient } from '../lib/scope';

// Reform Readiness Radar — prontidão CBS/IBS. SÓ monitora (não calcula, não transmite).
const AREA_LABEL: Record<string, string> = {
  SAP_NOTES: 'SAP Notes da reforma',
  TAX_FIELDS: 'Campos CBS/IBS',
  CONDITION_TECHNIQUE: 'Determinação tributária',
  NFE_LAYOUT: 'Layout NF-e/NFS-e',
  DRC: 'SAP DRC adaptado',
  MASTER_DATA: 'Cadastros (BP/material)',
};

export async function getReform(consultancyId: string, clientId?: string, env?: string) {
  const clientIds = await consultancyClientIds(consultancyId);
  const scope = scopeWithClient(clientId, clientIds);
  const where: any = { clientId: { in: scope } };
  if (env) where.environment = env;

  const rows = await prisma.reformReadiness.findMany({
    where,
    orderBy: [{ status: 'desc' }, { createdAt: 'desc' }], // RISK/PENDING antes de OK
    take: 500,
    include: { client: { select: { name: true } } },
  });

  const items = rows.map((i) => ({
    id: i.id, area: i.area, areaLabel: AREA_LABEL[i.area] || i.area, title: i.title,
    status: i.status, phase: i.phase, detail: i.detail, client: i.client?.name, environment: i.environment,
  }));

  const total = items.length;
  const ok = items.filter((i) => i.status === 'OK').length;
  const risk = items.filter((i) => i.status === 'RISK').length;
  const pending = items.filter((i) => i.status === 'PENDING').length;
  const readiness = total ? Math.round((ok / total) * 100) : 0;

  const byClientMap: Record<string, { client: string; ok: number; total: number; readiness: number }> = {};
  for (const i of items) {
    const k = i.client || '—';
    byClientMap[k] = byClientMap[k] || { client: k, ok: 0, total: 0, readiness: 0 };
    byClientMap[k].total++;
    if (i.status === 'OK') byClientMap[k].ok++;
  }
  const byClient = Object.values(byClientMap).map((c) => ({ ...c, readiness: c.total ? Math.round((c.ok / c.total) * 100) : 0 }))
    .sort((a, b) => a.readiness - b.readiness);

  return { items, summary: { total, ok, risk, pending, readiness, byClient } };
}
