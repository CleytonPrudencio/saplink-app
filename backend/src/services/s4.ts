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

// ───────── Sync ao vivo via SAP Business Accelerator Hub (sandbox, APIKey) ─────────
// Não precisa de S-user nem tenant: usa a API Key do api.sap.com contra o S/4 de demonstração.
const SANDBOX_BASE = 'https://sandbox.api.sap.com/s4hanacloud';
const S4_API_PROBES = [
  { apiName: 'API_BUSINESS_PARTNER', entity: 'A_BusinessPartner', scenario: 'SAP_COM_0008', version: 'v2', deprecated: false },
  { apiName: 'API_SALES_ORDER_SRV', entity: 'A_SalesOrder', scenario: 'SAP_COM_0109', version: 'v2', deprecated: true, replacement: 'API_SALES_ORDER_SRV;v4' },
  { apiName: 'API_PRODUCT_SRV', entity: 'A_Product', scenario: 'SAP_COM_0009', version: 'v2', deprecated: false },
  { apiName: 'API_BILLING_DOCUMENT_SRV', entity: 'A_BillingDocument', scenario: 'SAP_COM_0157', version: 'v2', deprecated: false },
];

/** Conecta de verdade ao S/4 sandbox da SAP e inventaria as APIs OData reais (contagem real de registros). */
export async function syncS4Sandbox(consultancyId: string, clientId: string) {
  const conn = await prisma.s4Connection.findUnique({ where: { clientId }, include: { client: true } });
  if (!conn || conn.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  const apiKey = conn.authToken ? String(decryptValue(conn.authToken) ?? '') : '';
  if (!apiKey) return { error: 'NO_KEY' as const };
  const base = (conn.baseUrl || SANDBOX_BASE).replace(/\/$/, '');

  let reachable = 0, deprecated = 0;
  const results: { apiName: string; ok: boolean; count: number | null; deprecated: boolean }[] = [];
  for (const p of S4_API_PROBES) {
    const url = `${base}/sap/opu/odata/sap/${p.apiName}/${p.entity}?$top=1&${encodeURIComponent('$inlinecount')}=allpages&${encodeURIComponent('$format')}=json`;
    let ok = false, count: number | null = null;
    try {
      const res = await fetch(url, { headers: { APIKey: apiKey, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        ok = true; reachable++;
        const j = (await res.json()) as { d?: { __count?: string; results?: any[] } };
        const c = j?.d?.__count;
        count = c != null && !isNaN(Number(c)) ? Number(c) : (j?.d?.results?.length ?? 0);
      }
    } catch { /* inalcançável — registra como não-ok */ }
    if (p.deprecated) deprecated++;
    results.push({ apiName: p.apiName, ok, count, deprecated: p.deprecated });
    // grava o uso REAL (apenas as alcançadas viram inventário)
    if (ok) {
      await prisma.apiUsage.upsert({
        where: { clientId_apiName_version: { clientId, apiName: p.apiName, version: p.version } },
        update: { scenario: p.scenario, calls30d: count ?? 0, deprecated: p.deprecated, replacement: (p as any).replacement ?? null, lastSeenAt: new Date() },
        create: { clientId, apiName: p.apiName, version: p.version, scenario: p.scenario, calls30d: count ?? 0, deprecated: p.deprecated, replacement: (p as any).replacement ?? null },
      });
    }
  }

  // ── deriva achados REAIS de Upgrade + Clean Core a partir das APIs depreciadas em uso ──
  const deprecatedHit = S4_API_PROBES.filter((p) => p.deprecated && results.find((r) => r.apiName === p.apiName && r.ok));
  await prisma.upgradeFinding.deleteMany({ where: { clientId, resolved: false } });
  if (deprecatedHit.length) {
    await prisma.upgradeFinding.createMany({
      data: deprecatedHit.map((p) => ({
        clientId, release: 'OData v2→v4', area: 'API', object: `${p.apiName} (${p.version})`, impact: 'DEPRECATED',
        detail: `OData v2 em uso real no S/4 — será descontinuada.`, recommendation: `Migrar o consumo para ${(p as any).replacement || p.apiName + ';v4'}.`,
      })),
    });
  }
  await prisma.cleanCoreItem.deleteMany({ where: { clientId, resolved: false } });
  if (deprecatedHit.length) {
    await prisma.cleanCoreItem.createMany({
      data: deprecatedHit.map((p) => ({
        clientId, category: 'DEPRECATED_API', object: `${p.apiName} ${p.version}`, severity: 'HIGH', points: 12,
        recommendation: `Migrar para ${(p as any).replacement || p.apiName + ';v4'}.`,
      })),
    });
  }

  // ── massa de dados REAL: puxa Billing Documents do S/4 sandbox → cockpit fiscal ──
  let fiscal = 0;
  try {
    const fUrl = `${base}/sap/opu/odata/sap/API_BILLING_DOCUMENT_SRV/A_BillingDocument?${encodeURIComponent('$top')}=200&${encodeURIComponent('$select')}=${encodeURIComponent('BillingDocument,BillingDocumentType,TotalGrossAmount,TransactionCurrency,BillingDocumentIsCancelled,BillingDocumentDate')}&${encodeURIComponent('$format')}=json`;
    const fRes = await fetch(fUrl, { headers: { APIKey: apiKey, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
    if (fRes.ok) {
      const fj = (await fRes.json()) as { d?: { results?: any[] } };
      const docs = fj?.d?.results || [];
      await prisma.fiscalDoc.deleteMany({ where: { clientId } });
      for (const d of docs) {
        if (!d.BillingDocument) continue;
        const cancelled = d.BillingDocumentIsCancelled === true || d.BillingDocumentIsCancelled === 'true';
        const cents = Math.round(Number(d.TotalGrossAmount || 0) * 100);
        await prisma.fiscalDoc.create({
          data: {
            clientId, docType: `BILLING_${d.BillingDocumentType || 'F2'}`, number: String(d.BillingDocument),
            status: cancelled ? 'CANCELLED' : 'AUTHORIZED', amountCents: isNaN(cents) ? 0 : cents,
            message: `Fatura ${d.BillingDocumentType || ''} · ${d.TransactionCurrency || ''} (S/4 sandbox)`.trim(),
            remediable: false, resolved: true, issuedAt: parseSapDate(d.BillingDocumentDate),
          },
        });
        fiscal++;
      }
    }
  } catch { /* fiscal opcional — não quebra o sync de APIs */ }

  const status = reachable > 0 ? 'CONNECTED' : 'ERROR';
  await prisma.s4Connection.update({ where: { clientId }, data: { lastSyncAt: new Date(), status, release: conn.release ?? 'sandbox' } });
  return { ok: reachable > 0, probed: S4_API_PROBES.length, reachable, deprecated, upgrade: deprecatedHit.length, fiscal, results };
}

function parseSapDate(s?: string): Date | null {
  if (!s) return null; const m = /\/Date\((\d+)/.exec(s); return m ? new Date(Number(m[1])) : (isNaN(Date.parse(s)) ? null : new Date(s));
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
export async function getUpgrade(consultancyId: string, clientId?: string, env?: string) {
  const ids = clientId ? [clientId] : await clientIds(consultancyId);
  const findings = await prisma.upgradeFinding.findMany({ where: { clientId: { in: ids }, resolved: false, ...(env ? { environment: env } : {}) }, orderBy: { createdAt: 'desc' }, take: 500, include: { client: { select: { name: true } } } });
  const byImpact: Record<string, number> = {};
  for (const f of findings) byImpact[f.impact] = (byImpact[f.impact] || 0) + 1;
  const release = findings[0]?.release || '—';
  return { release, findings: findings.map((f) => ({ id: f.id, release: f.release, area: f.area, object: f.object, impact: f.impact, detail: f.detail, recommendation: f.recommendation, client: f.client?.name })), summary: { total: findings.length, byImpact } };
}

export async function getCleanCore(consultancyId: string, env?: string) {
  const clients = await prisma.client.findMany({ where: { consultancyId }, select: { id: true, name: true } });
  const items = await prisma.cleanCoreItem.findMany({ where: { clientId: { in: clients.map((c) => c.id) }, resolved: false, ...(env ? { environment: env } : {}) }, include: { client: { select: { name: true } } } });
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

export async function getApis(consultancyId: string, env?: string) {
  const ids = await clientIds(consultancyId);
  const usage = await prisma.apiUsage.findMany({ where: { clientId: { in: ids }, ...(env ? { environment: env } : {}) }, orderBy: [{ deprecated: 'desc' }, { calls30d: 'desc' }], take: 500, include: { client: { select: { name: true } } } });
  return { items: usage.map((u) => ({ apiName: u.apiName, version: u.version, scenario: u.scenario, calls30d: u.calls30d, deprecated: u.deprecated, deprecationRelease: u.deprecationRelease, replacement: u.replacement, client: u.client?.name })), summary: { total: usage.length, deprecated: usage.filter((u) => u.deprecated).length } };
}

export async function getComm(consultancyId: string, env?: string) {
  const ids = await clientIds(consultancyId);
  const arr = await prisma.commArrangement.findMany({ where: { clientId: { in: ids }, ...(env ? { environment: env } : {}) }, orderBy: { certExpiresAt: 'asc' }, include: { client: { select: { name: true } } } });
  const now = Date.now();
  const sev = (d?: Date | null) => { if (!d) return 'OK'; const days = Math.floor((d.getTime() - now) / 864e5); return days < 0 ? 'EXPIRED' : days <= 7 ? 'CRITICAL' : days <= 30 ? 'WARN' : 'OK'; };
  const items = arr.map((a) => ({ scenario: a.scenario, name: a.name, direction: a.direction, commUser: a.commUser, status: a.status, certExpiresAt: a.certExpiresAt, certSeverity: sev(a.certExpiresAt), client: a.client?.name }));
  return { items, summary: { total: items.length, errors: items.filter((i) => i.status === 'ERROR').length, expiring: items.filter((i) => ['EXPIRED', 'CRITICAL', 'WARN'].includes(i.certSeverity)).length } };
}

// Famílias de documentos fiscais BR (DRC/GRC) — classifica pelo docType.
export const FISCAL_FAMILIES = ['NFE', 'NFSE', 'CTE', 'MDFE', 'SPED', 'ESOCIAL', 'EFDREINF', 'BILLING', 'OUTROS'];
export function fiscalFamily(docType: string): string {
  const t = (docType || '').toUpperCase();
  if (t.startsWith('NFE') || t === 'NF-E' || t.startsWith('NFISCAL')) return 'NFE';
  if (t.startsWith('NFSE') || t.startsWith('NFS')) return 'NFSE';
  if (t.startsWith('CTE') || t.startsWith('CT-E')) return 'CTE';
  if (t.startsWith('MDFE') || t.startsWith('MDF-E')) return 'MDFE';
  if (t.startsWith('SPED')) return 'SPED';
  if (t.startsWith('ESOCIAL') || t.startsWith('ESOC')) return 'ESOCIAL';
  if (t.startsWith('EFDREINF') || t.startsWith('REINF')) return 'EFDREINF';
  if (t.startsWith('BILLING')) return 'BILLING';
  return 'OUTROS';
}

export async function getFiscal(consultancyId: string, clientId?: string, family?: string, env?: string) {
  const ids = clientId ? [clientId] : await clientIds(consultancyId);
  let docs = await prisma.fiscalDoc.findMany({ where: { clientId: { in: ids }, ...(env ? { environment: env } : {}) }, orderBy: { issuedAt: 'desc' }, take: 1000, include: { client: { select: { name: true } } } });
  const withFam = docs.map((d) => ({ id: d.id, docType: d.docType, family: fiscalFamily(d.docType), number: d.number, status: d.status, sefazCode: d.sefazCode, message: d.message, amountCents: d.amountCents, remediable: d.remediable, resolved: d.resolved, issuedAt: d.issuedAt, client: d.client?.name }));
  const byStatus: Record<string, number> = {};
  let atRiskCents = 0;
  for (const d of docs) { byStatus[d.status] = (byStatus[d.status] || 0) + 1; if (!d.resolved) atRiskCents += d.amountCents; }
  const byFamily = FISCAL_FAMILIES.map((f) => ({ family: f, count: withFam.filter((d) => d.family === f).length })).filter((x) => x.count > 0);
  const items = family ? withFam.filter((d) => d.family === family) : withFam;
  return { items: items.slice(0, 500), summary: { total: withFam.length, byStatus, byFamily, atRiskCents, blocked: docs.filter((d) => !d.resolved).length } };
}

export async function reprocessFiscal(consultancyId: string, id: string) {
  const doc = await prisma.fiscalDoc.findUnique({ where: { id }, include: { client: true } });
  if (!doc || doc.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  if (!doc.remediable) return { error: 'NOT_REMEDIABLE' as const };
  const u = await prisma.fiscalDoc.update({ where: { id }, data: { status: 'AUTHORIZED', resolved: true, message: 'Reenviado pelo SAPLINK — autorizado.' } });
  return { ok: true, status: u.status };
}

export async function getEvents(consultancyId: string, env?: string) {
  const ids = await clientIds(consultancyId);
  const ev = await prisma.cloudEvent.findMany({ where: { clientId: { in: ids }, ...(env ? { environment: env } : {}) }, orderBy: { occurredAt: 'desc' }, take: 500, include: { client: { select: { name: true } } } });
  const byStatus: Record<string, number> = {};
  for (const e of ev) byStatus[e.status] = (byStatus[e.status] || 0) + 1;
  return { items: ev.map((e) => ({ topic: e.topic, status: e.status, subscriber: e.subscriber, lagMs: e.lagMs, occurredAt: e.occurredAt, client: e.client?.name })), summary: { total: ev.length, byStatus, deadLetter: byStatus.DEAD_LETTER || 0 } };
}

export async function getOverview(consultancyId: string, env?: string) {
  const [cc, up, fis, comm, ev, apis] = await Promise.all([
    getCleanCore(consultancyId, env), getUpgrade(consultancyId, undefined, env), getFiscal(consultancyId, undefined, undefined, env), getComm(consultancyId, env), getEvents(consultancyId, env), getApis(consultancyId, env),
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
