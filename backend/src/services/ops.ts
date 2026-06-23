import prisma from '../lib/prisma';
import { consultancyClientIds, scopeWithClient } from '../lib/scope';

// Basis & Operações — ingest do agente + leitura agregada.
export const OPS_CATEGORIES = ['PIPO', 'JOB', 'DUMP', 'UPDATE_ERR', 'LOCK', 'GATEWAY', 'HANA', 'SECURITY', 'PAYMENT', 'BANK', 'MASTERDATA'] as const;
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export interface OpsSignalInput { category: string; severity?: string; title: string; object?: string; detail?: string; ref: string; occurredAt?: string }

/** O agente empurra um snapshot; faz upsert por (cliente, categoria, ref) e fecha o que sumiu. */
export async function ingestOps(integrationId: string, clientId: string, signals: OpsSignalInput[]) {
  const integ = await prisma.integration.findUnique({ where: { id: integrationId }, select: { environment: true } });
  const environment = integ?.environment || 'PRD';
  let upserted = 0;
  const seen: { category: string; ref: string }[] = [];
  for (const s of signals) {
    if (!OPS_CATEGORIES.includes(s.category as any) || !s.title || !s.ref) continue;
    const severity = SEVERITIES.includes((s.severity || '').toUpperCase()) ? s.severity!.toUpperCase() : 'MEDIUM';
    const data = { integrationId, environment, severity, title: s.title, object: s.object ?? null, detail: s.detail ?? null, occurredAt: s.occurredAt ? new Date(s.occurredAt) : new Date(), resolved: false };
    await prisma.opsSignal.upsert({
      where: { clientId_category_ref: { clientId, category: s.category, ref: s.ref } },
      update: data,
      create: { clientId, category: s.category, ref: s.ref, ...data },
    });
    seen.push({ category: s.category, ref: s.ref });
    upserted++;
  }
  return { upserted };
}

export async function listOps(consultancyId: string, f: { clientId?: string; category?: string; env?: string } = {}) {
  const ids = scopeWithClient(f.clientId, await consultancyClientIds(consultancyId));
  const clients = await prisma.client.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  const ids = clients.map((c) => c.id);
  const where: Record<string, unknown> = { clientId: { in: ids }, resolved: false };
  if (f.category) where.category = f.category;
  if (f.env) where.environment = f.env;
  const rows = ids.length ? await prisma.opsSignal.findMany({ where: where as any, orderBy: [{ severity: 'desc' }, { occurredAt: 'desc' }], take: 500 }) : [];
  const items = rows.map((r) => ({ id: r.id, clientId: r.clientId, client: clients.find((c) => c.id === r.clientId)?.name, category: r.category, severity: r.severity, title: r.title, object: r.object, detail: r.detail, ref: r.ref, occurredAt: r.occurredAt }));
  const summary = {
    total: items.length,
    critical: items.filter((i) => i.severity === 'CRITICAL').length,
    high: items.filter((i) => i.severity === 'HIGH').length,
    byCategory: OPS_CATEGORIES.map((c) => ({ category: c, count: items.filter((i) => i.category === c).length })),
  };
  return { clients, summary, items };
}

export async function resolveOps(consultancyId: string, id: string) {
  const r = await prisma.opsSignal.findUnique({ where: { id }, include: { client: true } });
  if (!r || r.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  await prisma.opsSignal.update({ where: { id }, data: { resolved: true } });
  return { ok: true };
}
