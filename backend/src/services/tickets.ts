import prisma from '../lib/prisma';
import { logger } from '../lib/logger';
import { encryptValue, decryptValue } from '../lib/crypto';

export interface TicketConfigInput {
  provider: string; baseUrl: string; authUser: string; authToken?: string;
  projectKey?: string; minSeverity?: string; enabled?: boolean;
}

interface ResolvedConfig {
  provider: string; baseUrl: string; authUser: string; authToken: string;
  projectKey: string | null; minSeverity: string; enabled: boolean;
}

async function getConfig(consultancyId: string): Promise<ResolvedConfig | null> {
  const c = await prisma.ticketConfig.findUnique({ where: { consultancyId } });
  if (!c || !c.enabled) return null;
  return {
    provider: c.provider, baseUrl: c.baseUrl.replace(/\/$/, ''), authUser: c.authUser,
    authToken: String(decryptValue(c.authToken) ?? ''), projectKey: c.projectKey,
    minSeverity: c.minSeverity, enabled: c.enabled,
  };
}

function basic(user: string, token: string): string {
  return 'Basic ' + Buffer.from(`${user}:${token}`).toString('base64');
}

interface AlertForTicket { id: string; severity: string; message: string; type: string; client?: { name?: string | null } | null }

/** Cria um chamado no provedor para o alerta. Retorna {key,url} ou null. */
export async function createTicket(consultancyId: string, alert: AlertForTicket): Promise<{ key: string; url: string } | null> {
  const cfg = await getConfig(consultancyId);
  if (!cfg) return null;
  const summary = `[SAPLINK] ${alert.severity}: ${alert.message}`.slice(0, 240);
  const desc = `Alerta SAPLINK\nCliente: ${alert.client?.name || '-'}\nTipo: ${alert.type}\nSeveridade: ${alert.severity}\n\n${alert.message}`;
  try {
    if (cfg.provider === 'JIRA') {
      const res = await fetch(`${cfg.baseUrl}/rest/api/2/issue`, {
        method: 'POST',
        headers: { Authorization: basic(cfg.authUser, cfg.authToken), 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { project: { key: cfg.projectKey }, summary, description: desc, issuetype: { name: 'Bug' } } }),
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) { logger.warn({ status: res.status }, '[tickets] Jira create falhou'); return null; }
      const data = (await res.json()) as { key?: string };
      if (!data.key) return null;
      return { key: data.key, url: `${cfg.baseUrl}/browse/${data.key}` };
    }
    if (cfg.provider === 'SERVICENOW') {
      const res = await fetch(`${cfg.baseUrl}/api/now/table/incident`, {
        method: 'POST',
        headers: { Authorization: basic(cfg.authUser, cfg.authToken), 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ short_description: summary, description: desc, urgency: alert.severity === 'CRITICAL' ? '1' : '2' }),
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) { logger.warn({ status: res.status }, '[tickets] ServiceNow create falhou'); return null; }
      const data = (await res.json()) as { result?: { number?: string; sys_id?: string } };
      const num = data.result?.number;
      if (!num) return null;
      return { key: num, url: `${cfg.baseUrl}/nav_to.do?uri=incident.do?sys_id=${data.result?.sys_id}` };
    }
  } catch (e) {
    logger.warn({ err: (e as Error).message }, '[tickets] erro ao criar chamado');
  }
  return null;
}

/** Fecha/resolve o chamado quando o alerta é resolvido. */
export async function closeTicket(consultancyId: string, ticketKey: string): Promise<boolean> {
  const cfg = await getConfig(consultancyId);
  if (!cfg) return false;
  try {
    if (cfg.provider === 'JIRA') {
      // adiciona comentário de resolução (transição varia por workflow; comentar é universal)
      const res = await fetch(`${cfg.baseUrl}/rest/api/2/issue/${ticketKey}/comment`, {
        method: 'POST',
        headers: { Authorization: basic(cfg.authUser, cfg.authToken), 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: 'Alerta resolvido no SAPLINK — integração recuperada.' }),
        signal: AbortSignal.timeout(12000),
      });
      return res.ok;
    }
    if (cfg.provider === 'SERVICENOW') {
      const res = await fetch(`${cfg.baseUrl}/api/now/table/incident?sysparm_query=number=${ticketKey}`, {
        headers: { Authorization: basic(cfg.authUser, cfg.authToken), Accept: 'application/json' },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { result?: Array<{ sys_id?: string }> };
      const sysId = data.result?.[0]?.sys_id;
      if (!sysId) return false;
      const upd = await fetch(`${cfg.baseUrl}/api/now/table/incident/${sysId}`, {
        method: 'PATCH',
        headers: { Authorization: basic(cfg.authUser, cfg.authToken), 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: '6', close_code: 'Resolved', close_notes: 'Resolvido no SAPLINK.' }),
        signal: AbortSignal.timeout(12000),
      });
      return upd.ok;
    }
  } catch (e) {
    logger.warn({ err: (e as Error).message }, '[tickets] erro ao fechar chamado');
  }
  return false;
}

/** Persiste a config (cifra o token). authToken vazio mantém o atual. */
export async function saveConfig(consultancyId: string, input: TicketConfigInput) {
  const existing = await prisma.ticketConfig.findUnique({ where: { consultancyId } });
  const encToken = input.authToken
    ? encryptValue(input.authToken)
    : existing?.authToken;
  if (!encToken) throw new Error('authToken obrigatório na primeira configuração.');
  const data = {
    provider: input.provider, baseUrl: input.baseUrl, authUser: input.authUser,
    authToken: encToken, projectKey: input.projectKey ?? null,
    minSeverity: input.minSeverity ?? 'HIGH', enabled: input.enabled ?? true,
  };
  return prisma.ticketConfig.upsert({
    where: { consultancyId },
    update: data,
    create: { consultancyId, ...data },
  });
}

/** Config sem o segredo, para o front. */
export async function getConfigPublic(consultancyId: string) {
  const c = await prisma.ticketConfig.findUnique({ where: { consultancyId } });
  if (!c) return null;
  return {
    provider: c.provider, baseUrl: c.baseUrl, authUser: c.authUser, projectKey: c.projectKey,
    minSeverity: c.minSeverity, enabled: c.enabled, hasToken: !!c.authToken,
  };
}
