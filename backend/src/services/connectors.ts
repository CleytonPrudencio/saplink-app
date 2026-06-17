import prisma from '../lib/prisma';
import { decryptConfig } from '../lib/crypto';

type Cfg = Record<string, string>;

/**
 * Retorna a URL de probe se a integração é monitorável de verdade (endpoint HTTP/OData real),
 * ou null se depende de agente on-premise (RFC/IDoc/SOAP/FILE/DATABASE) ou não tem URL.
 */
export function probeUrl(type: string | null, config: Cfg): string | null {
  const t = (type || '').toUpperCase();
  if (t === 'ODATA' && config.serviceUrl && /^https?:\/\//.test(config.serviceUrl)) {
    const base = config.serviceUrl.replace(/\/$/, '');
    return config.entitySet ? `${base}/${config.entitySet}?$top=1&$format=json` : `${base}/$metadata`;
  }
  if ((t === 'REST' || t === 'CUSTOM') && (config.baseUrl || config.url)) {
    const base = (config.baseUrl || config.url).replace(/\/$/, '');
    if (!/^https?:\/\//.test(base)) return null;
    return config.healthEndpoint ? `${base}${config.healthEndpoint}` : base;
  }
  return null;
}

export function isMonitorable(integration: { type: string | null; config: unknown }): boolean {
  return probeUrl(integration.type, (integration.config || {}) as Cfg) !== null;
}

function authHeaders(config: Cfg): Record<string, string> {
  // json preferido, mas aceita xml ($metadata) e qualquer coisa — evita 406 no SAP
  const h: Record<string, string> = { Accept: 'application/json, application/xml;q=0.9, */*;q=0.8' };
  // SAP Business Accelerator Hub (sandbox) usa o header APIKey
  if (config.apiKey) h['APIKey'] = config.apiKey;
  if (config.user && config.password) {
    h['Authorization'] = `Basic ${Buffer.from(`${config.user}:${config.password}`).toString('base64')}`;
  } else if (config.authType === 'Bearer Token' && config.authValue) {
    h['Authorization'] = `Bearer ${config.authValue}`;
  } else if (config.authType === 'API Key' && config.authValue) {
    h['X-API-Key'] = config.authValue;
  }
  return h;
}

export interface ProbeResult {
  ok: boolean;
  httpStatus: number | null;
  latencyMs: number;
  error?: string;
}

/** Faz uma requisição real ao endpoint e mede latência/status. */
export async function probe(url: string, config: Cfg): Promise<ProbeResult> {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: 'GET', headers: authHeaders(config), signal: AbortSignal.timeout(10000) });
    return { ok: res.ok, httpStatus: res.status, latencyMs: Date.now() - start };
  } catch (e) {
    return { ok: false, httpStatus: null, latencyMs: Date.now() - start, error: (e as Error).message };
  }
}

/**
 * Sincroniza UMA integração real: faz o probe, atualiza métricas (média móvel) e
 * cria/resolve alertas. Retorna o resultado do probe (ou null se não-monitorável).
 */
export async function syncIntegration(integrationId: string): Promise<ProbeResult | null> {
  const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
  if (!integration) return null;
  const config = (decryptConfig(integration.config) || {}) as Cfg;
  const url = probeUrl(integration.type, config);
  if (!url) return null;

  const r = await probe(url, config);

  // Classificação de status
  let status: string;
  if (r.ok) status = 'ACTIVE';
  else if (r.httpStatus) status = 'ERROR'; // respondeu, mas com erro HTTP
  else status = 'OFFLINE'; // não respondeu (timeout/rede)

  // Métricas com média móvel (EWMA) — evolui com o tempo, dado real
  const okVal = r.ok ? 100 : 0;
  const newErrorRate = parseFloat((integration.errorRate * 0.7 + (r.ok ? 0 : 100) * 0.3).toFixed(2));
  const newUptime = parseFloat((integration.uptime * 0.9 + okVal * 0.1).toFixed(2));

  await prisma.integration.update({
    where: { id: integration.id },
    data: { status, latency: r.latencyMs, errorRate: newErrorRate, uptime: newUptime },
  });

  // Alertas: dispara ao ENTRAR em estado ruim (de qualquer status anterior),
  // sem repetir enquanto permanecer no mesmo estado.
  if (status !== 'ACTIVE' && integration.status !== status) {
    await prisma.alert.create({
      data: {
        type: status === 'OFFLINE' ? 'INTEGRATION_OFFLINE' : 'INTEGRATION_ERROR',
        severity: status === 'OFFLINE' ? 'CRITICAL' : 'HIGH',
        message:
          status === 'OFFLINE'
            ? `Integração ${integration.name} não respondeu (${r.error || 'timeout'}).`
            : `Integração ${integration.name} respondeu com erro HTTP ${r.httpStatus}.`,
        clientId: integration.clientId,
        integrationId: integration.id,
      },
    });
  } else if (status === 'ACTIVE' && integration.status !== 'ACTIVE') {
    await prisma.alert.updateMany({
      where: { integrationId: integration.id, resolved: false },
      data: { resolved: true, resolvedAt: new Date() },
    });
  }

  return r;
}
