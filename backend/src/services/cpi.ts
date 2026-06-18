import prisma from '../lib/prisma';
import { encryptValue, decryptValue } from '../lib/crypto';
import { ingestCloud } from './cloud';

export interface CpiInput { baseUrl: string; tokenUrl: string; oauthClientId: string; oauthSecret?: string; enabled?: boolean }

async function ownsClient(consultancyId: string, clientId: string) {
  return !!(await prisma.client.findFirst({ where: { id: clientId, consultancyId }, select: { id: true } }));
}

export async function saveCpiConfig(consultancyId: string, clientId: string, input: CpiInput) {
  if (!(await ownsClient(consultancyId, clientId))) return { error: 'NOT_FOUND' as const };
  const existing = await prisma.cpiConfig.findUnique({ where: { clientId } });
  const secret = input.oauthSecret ? encryptValue(input.oauthSecret) : existing?.oauthSecret;
  if (!secret) return { error: 'NO_SECRET' as const };
  const data = {
    baseUrl: input.baseUrl.replace(/\/$/, ''), tokenUrl: input.tokenUrl,
    oauthClientId: input.oauthClientId, oauthSecret: secret, enabled: input.enabled ?? true,
  };
  await prisma.cpiConfig.upsert({ where: { clientId }, update: data, create: { clientId, ...data } });
  return { ok: true };
}

export async function getCpiConfigs(consultancyId: string) {
  const ids = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const cfgs = await prisma.cpiConfig.findMany({ where: { clientId: { in: ids } }, include: { client: { select: { name: true } } } });
  return cfgs.map((c) => ({ clientId: c.clientId, client: c.client?.name, baseUrl: c.baseUrl, tokenUrl: c.tokenUrl, oauthClientId: c.oauthClientId, enabled: c.enabled, lastSyncAt: c.lastSyncAt, lastResult: c.lastResult, lastCount: c.lastCount, hasSecret: !!c.oauthSecret }));
}

async function getToken(cfg: { tokenUrl: string; oauthClientId: string; secret: string }): Promise<string | null> {
  const auth = 'Basic ' + Buffer.from(`${cfg.oauthClientId}:${cfg.secret}`).toString('base64');
  const url = cfg.tokenUrl.includes('grant_type') ? cfg.tokenUrl : `${cfg.tokenUrl}${cfg.tokenUrl.includes('?') ? '&' : '?'}grant_type=client_credentials`;
  const res = await fetch(url, { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: 'grant_type=client_credentials', signal: AbortSignal.timeout(15000) });
  if (!res.ok) return null;
  const j = (await res.json()) as { access_token?: string };
  return j.access_token || null;
}

function parseSapDate(s?: string): Date | null {
  if (!s) return null; const m = /\/Date\((\d+)/.exec(s); return m ? new Date(Number(m[1])) : (isNaN(Date.parse(s)) ? null : new Date(s));
}

/** Conecta de verdade ao Integration Suite, puxa os Message Processing Logs e ingere como CloudItem (CPI). */
export async function syncCpi(consultancyId: string, clientId: string) {
  const cfg = await prisma.cpiConfig.findUnique({ where: { clientId }, include: { client: true } });
  if (!cfg || cfg.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  try {
    const token = await getToken({ tokenUrl: cfg.tokenUrl, oauthClientId: cfg.oauthClientId, secret: String(decryptValue(cfg.oauthSecret) ?? '') });
    if (!token) { await mark(cfg.id, 'Falha no OAuth — confira clientid/secret/tokenurl.'); return { ok: false, reason: 'oauth' }; }
    const url = `${cfg.baseUrl}/MessageProcessingLogs?$top=100&$format=json&${encodeURIComponent('$orderby')}=${encodeURIComponent('LogEnd desc')}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) { await mark(cfg.id, `MPL HTTP ${res.status} — confira a baseUrl/permissão (MessageProcessingLog.Read).`); return { ok: false, reason: `http_${res.status}` }; }
    const data = (await res.json()) as { d?: { results?: any[] } };
    const rows = data.d?.results || [];
    const items = rows.map((r) => ({
      source: 'CPI', artifact: r.IntegrationFlowName || r.ApplicationMessageType || '(iflow)', messageId: r.MessageGuid,
      direction: undefined, status: (r.Status || '').toUpperCase(), error: r.LogEnd ? undefined : undefined,
      occurredAt: (parseSapDate(r.LogEnd) || parseSapDate(r.LogStart) || new Date()).toISOString(),
    })).filter((i) => i.messageId);
    // pendura num "integration" CPI do cliente (cria se não existir)
    let integ = await prisma.integration.findFirst({ where: { clientId, type: 'CPI', name: 'SAP Cloud Integration (BTP)' } });
    if (!integ) integ = await prisma.integration.create({ data: { name: 'SAP Cloud Integration (BTP)', type: 'CPI', status: 'ACTIVE', clientId } });
    const r = await ingestCloud(integ.id, clientId, items);
    await mark(cfg.id, `OK — ${items.length} MPL`, items.length);
    return { ok: true, fetched: items.length, ...r };
  } catch (e) {
    await mark(cfg.id, `Erro: ${(e as Error).message}`);
    return { ok: false, reason: 'exception' };
  }
}

async function mark(id: string, result: string, count?: number) {
  await prisma.cpiConfig.update({ where: { id }, data: { lastSyncAt: new Date(), lastResult: result, ...(count != null ? { lastCount: count } : {}) } });
}

/** Scheduler: sincroniza todas as configs CPI habilitadas. */
export async function syncAllCpi(): Promise<number> {
  const cfgs = await prisma.cpiConfig.findMany({ where: { enabled: true }, include: { client: { select: { consultancyId: true } } } });
  let ok = 0;
  for (const c of cfgs) { const r = await syncCpi(c.client.consultancyId, c.clientId); if ((r as any).ok) ok++; }
  return ok;
}
