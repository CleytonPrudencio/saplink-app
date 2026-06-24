import prisma from '../lib/prisma';
import { consultancyClientIds, scopeWithClient } from '../lib/scope';

// BTP Cockpit — inventário e radar de validade de recursos da SAP BTP por cliente.
// Entrada manual ou via importação; status de expiração calculado na leitura.

const KINDS = ['SERVICE_KEY', 'BINDING', 'DESTINATION', 'QUOTA', 'APP'];
const DAY = 86400000;

function expiryStatus(expiresAt: Date | null, base: string): string {
  if (!expiresAt) return base || 'OK';
  const diff = expiresAt.getTime() - Date.now();
  if (diff < 0) return 'EXPIRED';
  if (diff < 30 * DAY) return 'WARN';
  return base === 'DOWN' ? 'DOWN' : 'OK';
}

export async function listBtp(consultancyId: string, clientId?: string, env?: string) {
  const ids = scopeWithClient(clientId, await consultancyClientIds(consultancyId));
  const clients = await prisma.client.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  const rows = ids.length ? await prisma.btpResource.findMany({ where: { clientId: { in: ids }, ...(env ? { environment: env } : {}) }, orderBy: [{ expiresAt: 'asc' }] }) : [];
  const items = rows.map((r) => ({
    id: r.id, clientId: r.clientId, client: clients.find((c) => c.id === r.clientId)?.name,
    subaccount: r.subaccount, kind: r.kind, name: r.name, detail: r.detail,
    expiresAt: r.expiresAt, status: expiryStatus(r.expiresAt, r.status),
  }));
  const summary = {
    total: items.length,
    expired: items.filter((i) => i.status === 'EXPIRED').length,
    warn: items.filter((i) => i.status === 'WARN').length,
    down: items.filter((i) => i.status === 'DOWN').length,
    byKind: KINDS.map((k) => ({ kind: k, count: items.filter((i) => i.kind === k).length })),
  };
  return { clients, summary, items };
}

export async function createBtp(consultancyId: string, input: { clientId: string; kind: string; name: string; subaccount?: string; detail?: string; expiresAt?: string; status?: string; environment?: string }) {
  const client = await prisma.client.findUnique({ where: { id: input.clientId } });
  if (!client || client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  if (!KINDS.includes(input.kind) || !input.name) return { error: 'INVALID' as const };
  const r = await prisma.btpResource.create({ data: {
    clientId: input.clientId, kind: input.kind, name: input.name, subaccount: input.subaccount || null,
    detail: input.detail || null, status: input.status || 'OK',
    environment: ['DEV', 'HML', 'PRD'].includes(input.environment || '') ? input.environment! : 'PRD',
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  } });
  return { ok: true, id: r.id };
}

export async function updateBtp(consultancyId: string, id: string, input: Partial<{ name: string; subaccount: string; detail: string; expiresAt: string; status: string }>) {
  const r = await prisma.btpResource.findUnique({ where: { id }, include: { client: true } });
  if (!r || r.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  await prisma.btpResource.update({ where: { id }, data: {
    name: input.name ?? r.name, subaccount: input.subaccount ?? r.subaccount, detail: input.detail ?? r.detail,
    status: input.status ?? r.status, expiresAt: input.expiresAt !== undefined ? (input.expiresAt ? new Date(input.expiresAt) : null) : r.expiresAt,
  } });
  return { ok: true };
}

export async function removeBtp(consultancyId: string, id: string) {
  const r = await prisma.btpResource.findUnique({ where: { id }, include: { client: true } });
  if (!r || r.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  await prisma.btpResource.delete({ where: { id } });
  return { ok: true };
}
