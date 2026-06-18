import prisma from '../lib/prisma';
import { encryptValue, decryptValue } from '../lib/crypto';

async function clientIds(consultancyId: string): Promise<string[]> {
  return (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
}
async function ownsClient(consultancyId: string, clientId: string): Promise<boolean> {
  return !!(await prisma.client.findFirst({ where: { id: clientId, consultancyId }, select: { id: true } }));
}

// ───────── Conector (S0) ─────────
export async function saveConnection(consultancyId: string, clientId: string, input: { baseUrl: string; authType?: string; commUser?: string; authToken?: string; release?: string }) {
  if (!(await ownsClient(consultancyId, clientId))) return { error: 'NOT_FOUND' as const };
  const existing = await prisma.s4Connection.findUnique({ where: { clientId } });
  const token = input.authToken ? encryptValue(input.authToken) : existing?.authToken ?? null;
  const data = { baseUrl: input.baseUrl, authType: input.authType || 'OAUTH', commUser: input.commUser ?? null, authToken: token, release: input.release ?? existing?.release ?? null, status: 'CONNECTED' };
  const conn = await prisma.s4Connection.upsert({ where: { clientId }, update: data, create: { clientId, ...data } });
  return { connection: { baseUrl: conn.baseUrl, authType: conn.authType, commUser: conn.commUser, release: conn.release, status: conn.status, hasToken: !!conn.authToken, lastSyncAt: conn.lastSyncAt } };
}
export async function getConnections(consultancyId: string) {
  const ids = await clientIds(consultancyId);
  const conns = await prisma.s4Connection.findMany({ where: { clientId: { in: ids } }, include: { client: { select: { name: true } } } });
  return conns.map((c) => ({ clientId: c.clientId, client: c.client?.name, baseUrl: c.baseUrl, release: c.release, status: c.status, lastSyncAt: c.lastSyncAt, hasToken: !!c.authToken }));
}

// ───────── Ingestão pelo agente (token → integration → clientId) ─────────
export async function ingestS4(clientId: string, p: Record<string, unknown>) {
  const out: Record<string, number> = {};
  if (Array.isArray(p.upgradeFindings)) {
    await prisma.upgradeFinding.deleteMany({ where: { clientId, resolved: false } });
    await prisma.upgradeFinding.createMany({ data: (p.upgradeFindings as any[]).map((f) => ({ clientId, release: String(f.release || '—'), area: f.area || 'API', object: f.object || '?', impact: f.impact || 'CHANGED', detail: f.detail ?? null, recommendation: f.recommendation ?? null })) });
    out.upgrade = (p.upgradeFindings as any[]).length;
  }
  if (Array.isArray(p.cleanCore)) {
    await prisma.cleanCoreItem.deleteMany({ where: { clientId, resolved: false } });
    await prisma.cleanCoreItem.createMany({ data: (p.cleanCore as any[]).map((c) => ({ clientId, category: c.category || 'IN_APP', object: c.object || '?', severity: c.severity || 'MEDIUM', points: c.points ?? 5, recommendation: c.recommendation ?? null })) });
    out.cleanCore = (p.cleanCore as any[]).length;
  }
  if (Array.isArray(p.apiUsage)) {
    for (const a of p.apiUsage as any[]) {
      if (!a.apiName) continue;
      await prisma.apiUsage.upsert({
        where: { clientId_apiName_version: { clientId, apiName: a.apiName, version: a.version || 'v2' } },
        update: { scenario: a.scenario ?? null, calls30d: a.calls30d ?? 0, deprecated: !!a.deprecated, deprecationRelease: a.deprecationRelease ?? null, replacement: a.replacement ?? null, lastSeenAt: new Date() },
        create: { clientId, apiName: a.apiName, version: a.version || 'v2', scenario: a.scenario ?? null, calls30d: a.calls30d ?? 0, deprecated: !!a.deprecated, deprecationRelease: a.deprecationRelease ?? null, replacement: a.replacement ?? null },
      });
    }
    out.apiUsage = (p.apiUsage as any[]).length;
  }
  if (Array.isArray(p.commArrangements)) {
    for (const c of p.commArrangements as any[]) {
      if (!c.scenario || !c.name) continue;
      const data = { direction: c.direction ?? null, commUser: c.commUser ?? null, status: c.status || 'ACTIVE', certExpiresAt: c.certExpiresAt ? new Date(c.certExpiresAt) : null, lastSeenAt: new Date() };
      await prisma.commArrangement.upsert({ where: { clientId_scenario_name: { clientId, scenario: c.scenario, name: c.name } }, update: data, create: { clientId, scenario: c.scenario, name: c.name, ...data } });
    }
    out.comm = (p.commArrangements as any[]).length;
  }
  if (Array.isArray(p.fiscalDocs)) {
    for (const f of p.fiscalDocs as any[]) {
      if (!f.docType || !f.number) continue;
      const failed = /REJECT|CONTING|PENDING/i.test(f.status || '');
      const data = { status: f.status || 'PENDING', sefazCode: f.sefazCode ?? null, message: f.message ?? null, amountCents: f.amountCents ?? 0, remediable: !!f.remediable, resolved: !failed, issuedAt: f.issuedAt ? new Date(f.issuedAt) : null };
      await prisma.fiscalDoc.upsert({ where: { clientId_docType_number: { clientId, docType: f.docType, number: String(f.number) } }, update: data, create: { clientId, docType: f.docType, number: String(f.number), ...data } });
    }
    out.fiscal = (p.fiscalDocs as any[]).length;
  }
  if (Array.isArray(p.cloudEvents)) {
    await prisma.cloudEvent.deleteMany({ where: { clientId, resolved: false } });
    await prisma.cloudEvent.createMany({ data: (p.cloudEvents as any[]).map((e) => ({ clientId, topic: e.topic || '?', status: e.status || 'DELIVERED', subscriber: e.subscriber ?? null, lagMs: e.lagMs ?? 0, occurredAt: e.occurredAt ? new Date(e.occurredAt) : null, resolved: !/DEAD|RETRY|PENDING/i.test(e.status || '') })) });
    out.events = (p.cloudEvents as any[]).length;
  }
  await prisma.s4Connection.updateMany({ where: { clientId }, data: { lastSyncAt: new Date(), status: 'CONNECTED' } });
  return out;
}

// ───────── Consultas ─────────
export async function getUpgrade(consultancyId: string, clientId?: string) {
  const ids = clientId ? [clientId] : await clientIds(consultancyId);
  const findings = await prisma.upgradeFinding.findMany({ where: { clientId: { in: ids }, resolved: false }, orderBy: { createdAt: 'desc' }, take: 500, include: { client: { select: { name: true } } } });
  const byImpact: Record<string, number> = {};
  for (const f of findings) byImpact[f.impact] = (byImpact[f.impact] || 0) + 1;
  const release = findings[0]?.release || '—';
  return { release, findings: findings.map((f) => ({ id: f.id, release: f.release, area: f.area, object: f.object, impact: f.impact, detail: f.detail, recommendation: f.recommendation, client: f.client?.name })), summary: { total: findings.length, byImpact } };
}

export async function getCleanCore(consultancyId: string) {
  const clients = await prisma.client.findMany({ where: { consultancyId }, select: { id: true, name: true } });
  const items = await prisma.cleanCoreItem.findMany({ where: { clientId: { in: clients.map((c) => c.id) }, resolved: false }, include: { client: { select: { name: true } } } });
  const perClient = clients.map((c) => {
    const its = items.filter((i) => i.clientId === c.id);
    const deduct = its.reduce((s, i) => s + i.points, 0);
    return { clientId: c.id, client: c.name, score: Math.max(0, 100 - deduct), items: its.length };
  });
  const overall = perClient.length ? Math.round(perClient.reduce((s, c) => s + c.score, 0) / perClient.length) : 100;
  const byCategory: Record<string, number> = {};
  for (const i of items) byCategory[i.category] = (byCategory[i.category] || 0) + 1;
  return {
    overall, perClient,
    byCategory,
    items: items.map((i) => ({ id: i.id, category: i.category, object: i.object, severity: i.severity, points: i.points, recommendation: i.recommendation, client: i.client?.name })),
  };
}

export async function getApis(consultancyId: string) {
  const ids = await clientIds(consultancyId);
  const usage = await prisma.apiUsage.findMany({ where: { clientId: { in: ids } }, orderBy: [{ deprecated: 'desc' }, { calls30d: 'desc' }], take: 500, include: { client: { select: { name: true } } } });
  return { items: usage.map((u) => ({ apiName: u.apiName, version: u.version, scenario: u.scenario, calls30d: u.calls30d, deprecated: u.deprecated, deprecationRelease: u.deprecationRelease, replacement: u.replacement, client: u.client?.name })), summary: { total: usage.length, deprecated: usage.filter((u) => u.deprecated).length } };
}

export async function getComm(consultancyId: string) {
  const ids = await clientIds(consultancyId);
  const arr = await prisma.commArrangement.findMany({ where: { clientId: { in: ids } }, orderBy: { certExpiresAt: 'asc' }, include: { client: { select: { name: true } } } });
  const now = Date.now();
  const sev = (d?: Date | null) => { if (!d) return 'OK'; const days = Math.floor((d.getTime() - now) / 864e5); return days < 0 ? 'EXPIRED' : days <= 7 ? 'CRITICAL' : days <= 30 ? 'WARN' : 'OK'; };
  const items = arr.map((a) => ({ scenario: a.scenario, name: a.name, direction: a.direction, commUser: a.commUser, status: a.status, certExpiresAt: a.certExpiresAt, certSeverity: sev(a.certExpiresAt), client: a.client?.name }));
  return { items, summary: { total: items.length, errors: items.filter((i) => i.status === 'ERROR').length, expiring: items.filter((i) => ['EXPIRED', 'CRITICAL', 'WARN'].includes(i.certSeverity)).length } };
}

export async function getFiscal(consultancyId: string, clientId?: string) {
  const ids = clientId ? [clientId] : await clientIds(consultancyId);
  const docs = await prisma.fiscalDoc.findMany({ where: { clientId: { in: ids } }, orderBy: { issuedAt: 'desc' }, take: 500, include: { client: { select: { name: true } } } });
  const byStatus: Record<string, number> = {};
  let atRiskCents = 0;
  for (const d of docs) { byStatus[d.status] = (byStatus[d.status] || 0) + 1; if (!d.resolved) atRiskCents += d.amountCents; }
  return { items: docs.map((d) => ({ id: d.id, docType: d.docType, number: d.number, status: d.status, sefazCode: d.sefazCode, message: d.message, amountCents: d.amountCents, remediable: d.remediable, resolved: d.resolved, issuedAt: d.issuedAt, client: d.client?.name })), summary: { total: docs.length, byStatus, atRiskCents, blocked: docs.filter((d) => !d.resolved).length } };
}

export async function reprocessFiscal(consultancyId: string, id: string) {
  const doc = await prisma.fiscalDoc.findUnique({ where: { id }, include: { client: true } });
  if (!doc || doc.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  if (!doc.remediable) return { error: 'NOT_REMEDIABLE' as const };
  const u = await prisma.fiscalDoc.update({ where: { id }, data: { status: 'AUTHORIZED', resolved: true, message: 'Reenviado pelo SAPLINK — autorizado.' } });
  return { ok: true, status: u.status };
}

export async function getEvents(consultancyId: string) {
  const ids = await clientIds(consultancyId);
  const ev = await prisma.cloudEvent.findMany({ where: { clientId: { in: ids } }, orderBy: { occurredAt: 'desc' }, take: 500, include: { client: { select: { name: true } } } });
  const byStatus: Record<string, number> = {};
  for (const e of ev) byStatus[e.status] = (byStatus[e.status] || 0) + 1;
  return { items: ev.map((e) => ({ topic: e.topic, status: e.status, subscriber: e.subscriber, lagMs: e.lagMs, occurredAt: e.occurredAt, client: e.client?.name })), summary: { total: ev.length, byStatus, deadLetter: byStatus.DEAD_LETTER || 0 } };
}

export async function getOverview(consultancyId: string) {
  const [cc, up, fis, comm, ev, apis] = await Promise.all([
    getCleanCore(consultancyId), getUpgrade(consultancyId), getFiscal(consultancyId), getComm(consultancyId), getEvents(consultancyId), getApis(consultancyId),
  ]);
  return {
    cleanCoreScore: cc.overall,
    upgradeBreaking: up.summary.byImpact.BREAKING || 0,
    upgradeFindings: up.summary.total,
    fiscalBlocked: fis.summary.blocked,
    fiscalAtRiskCents: fis.summary.atRiskCents,
    commExpiring: comm.summary.expiring,
    eventsDeadLetter: ev.summary.deadLetter,
    apisDeprecated: apis.summary.deprecated,
  };
}
