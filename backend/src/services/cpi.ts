import prisma from '../lib/prisma';
import { consultancyClientIds } from '../lib/scope';
import { encryptValue, decryptValue } from '../lib/crypto';
import { ingestCloud } from './cloud';

export interface CpiInput { baseUrl: string; tokenUrl: string; oauthClientId: string; oauthSecret?: string; enabled?: boolean }

async function ownsClient(consultancyId: string, clientId: string) {
  return !!(await prisma.client.findFirst({ where: { id: clientId, consultancyId }, select: { id: true } }));
}

const ENV = (e?: string) => (['DEV', 'HML', 'PRD'].includes(e || '') ? e! : 'PRD');

export async function saveCpiConfig(consultancyId: string, clientId: string, input: CpiInput, env?: string) {
  const environment = ENV(env);
  if (!(await ownsClient(consultancyId, clientId))) return { error: 'NOT_FOUND' as const };
  const existing = await prisma.cpiConfig.findUnique({ where: { clientId_environment: { clientId, environment } } });
  const secret = input.oauthSecret ? encryptValue(input.oauthSecret) : existing?.oauthSecret;
  if (!secret) return { error: 'NO_SECRET' as const };
  const data = {
    baseUrl: input.baseUrl.replace(/\/$/, ''), tokenUrl: input.tokenUrl,
    oauthClientId: input.oauthClientId, oauthSecret: secret, enabled: input.enabled ?? true,
  };
  await prisma.cpiConfig.upsert({ where: { clientId_environment: { clientId, environment } }, update: data, create: { clientId, environment, ...data } });
  return { ok: true };
}

export async function getCpiConfigs(consultancyId: string, env?: string) {
  const ids = await consultancyClientIds(consultancyId);
  const e = env ? ENV(env) : undefined;
  const cfgs = await prisma.cpiConfig.findMany({ where: { clientId: { in: ids }, ...(e ? { environment: e } : {}) }, include: { client: { select: { name: true } } } });
  return cfgs.map((c) => ({ clientId: c.clientId, client: c.client?.name, environment: c.environment, baseUrl: c.baseUrl, tokenUrl: c.tokenUrl, oauthClientId: c.oauthClientId, enabled: c.enabled, lastSyncAt: c.lastSyncAt, lastResult: c.lastResult, lastCount: c.lastCount, hasSecret: !!c.oauthSecret }));
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
export async function syncCpi(consultancyId: string, clientId: string, env?: string) {
  const environment = ENV(env);
  const cfg = await prisma.cpiConfig.findUnique({ where: { clientId_environment: { clientId, environment } }, include: { client: true } });
  if (!cfg || cfg.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  try {
    const token = await getToken({ tokenUrl: cfg.tokenUrl, oauthClientId: cfg.oauthClientId, secret: String(decryptValue(cfg.oauthSecret) ?? '') });
    if (!token) { await mark(cfg.id, 'Falha no OAuth — confira clientid/secret/tokenurl.'); return { ok: false, reason: 'oauth' }; }
    const url = `${cfg.baseUrl}/MessageProcessingLogs?$top=100&$format=json&${encodeURIComponent('$orderby')}=${encodeURIComponent('LogEnd desc')}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) { await mark(cfg.id, `MPL HTTP ${res.status} — confira a baseUrl/permissão (MessageProcessingLog.Read).`); return { ok: false, reason: `http_${res.status}` }; }
    const data = (await res.json()) as { d?: { results?: any[] } };
    const rows = data.d?.results || [];
    const items: any[] = rows.map((r) => ({
      source: 'CPI', artifact: r.IntegrationFlowName || r.ApplicationMessageType || '(iflow)', messageId: r.MessageGuid,
      direction: undefined, status: (r.Status || '').toUpperCase(), error: undefined,
      occurredAt: (parseSapDate(r.LogEnd) || parseSapDate(r.LogStart) || new Date()).toISOString(),
    })).filter((i) => i.messageId);
    // puxa a mensagem de erro detalhada dos MPL com falha (até 15, pra não estourar)
    let ef = 0;
    for (const it of items) {
      if (ef >= 15) break;
      if (/FAIL|ERROR|ESCAL/i.test(it.status)) {
        try {
          const er = await fetch(`${cfg.baseUrl}/MessageProcessingLogs('${it.messageId}')/ErrorInformation/$value`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) });
          if (er.ok) { const t = (await er.text()).trim(); if (t) { it.error = t.slice(0, 400); ef++; } }
        } catch { /* ignore */ }
      }
    }
    // pendura num "integration" CPI do cliente (cria se não existir)
    const integName = `SAP Cloud Integration (BTP) · ${environment}`;
    let integ = await prisma.integration.findFirst({ where: { clientId, type: 'CPI', environment } });
    if (!integ) integ = await prisma.integration.create({ data: { name: integName, type: 'CPI', status: 'ACTIVE', clientId, environment } });
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
  for (const c of cfgs) { const r = await syncCpi(c.client.consultancyId, c.clientId, c.environment); if ((r as any).ok) ok++; }
  return ok;
}
