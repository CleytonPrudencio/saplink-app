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

// ───────────────────────── Análise + auto-correção ─────────────────────────

export interface FixChange {
  field: string;
  label: string;
  from: string;
  to: string;
}

export interface FixProposal {
  problem: string;
  rootCause: string;
  recommendation: string;
  steps: string[];
  probe: ProbeResult | null;
  autoFix:
    | { available: false; reason: string }
    | { available: true; kind: string; summary: string; changes: FixChange[]; alternatives?: string[] };
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

/** Conjunto de candidatos mais parecido com o atual (case-insensitive + distância). */
function bestMatch(current: string, options: string[]): string | null {
  if (!options.length) return null;
  const cur = (current || '').toLowerCase();
  const exact = options.find((o) => o.toLowerCase() === cur);
  if (exact) return exact;
  return [...options].sort((a, b) => levenshtein(a.toLowerCase(), cur) - levenshtein(b.toLowerCase(), cur))[0];
}

/** Lê o $metadata de um serviço OData e extrai os EntitySets declarados. */
export async function listODataEntitySets(serviceUrl: string, config: Cfg): Promise<string[]> {
  const base = serviceUrl.replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/$metadata`, { headers: authHeaders(config), signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const xml = await res.text();
    const set = new Set<string>();
    const re = /EntitySet\s+Name="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml))) set.add(m[1]);
    return [...set];
  } catch {
    return [];
  }
}

/**
 * Analisa uma integração em erro e, quando possível, propõe uma correção aplicável
 * dentro da plataforma (determinístico — baseado no probe real + $metadata).
 */
export async function analyzeFix(integration: { type: string | null; name: string; config: unknown }): Promise<FixProposal> {
  const config = (decryptConfig(integration.config) || {}) as Cfg;
  const url = probeUrl(integration.type, config);

  if (!url) {
    return {
      problem: 'Integração não monitorável diretamente',
      rootCause: `${integration.type} depende do Agente Docker on-premise (RFC/IDoc/SOAP/FILE/DATABASE). A plataforma não consegue testar nem corrigir essa conexão remotamente.`,
      recommendation: 'Verifique o Agente Docker no servidor do cliente e as credenciais SAP locais.',
      steps: ['Confirmar que o Agente Docker está rodando no ambiente do cliente', 'Validar host/usuário/senha do SAP', 'Reenviar a configuração'],
      probe: null,
      autoFix: { available: false, reason: 'Conexão on-premise — correção fora do alcance da plataforma.' },
    };
  }

  const r = await probe(url, config);
  const status = r.httpStatus;

  // Sem problema
  if (r.ok) {
    return {
      problem: 'Nenhum problema detectado',
      rootCause: `O endpoint respondeu HTTP ${status} normalmente (${r.latencyMs}ms).`,
      recommendation: 'A integração está saudável. Continue o monitoramento automático.',
      steps: [],
      probe: r,
      autoFix: { available: false, reason: 'A integração já está respondendo com sucesso.' },
    };
  }

  // 404/400 em OData → conjunto de entidades provavelmente errado: auto-corrigível
  if ((status === 404 || status === 400) && (integration.type || '').toUpperCase() === 'ODATA' && config.serviceUrl) {
    const current = config.entitySet || '';
    const entitySets = await listODataEntitySets(config.serviceUrl, config);
    const best = bestMatch(current, entitySets);
    const alternatives = entitySets.slice(0, 12);
    const valido = entitySets.length ? `Conjuntos válidos neste serviço: ${alternatives.join(', ')}.` : 'Não foi possível ler o $metadata para listar os conjuntos válidos.';

    if (best && best.toLowerCase() !== current.toLowerCase()) {
      return {
        problem: `Conjunto de entidades inexistente (HTTP ${status})`,
        rootCause: `O endpoint respondeu HTTP ${status}: o conjunto de entidades "${current || '(vazio)'}" não existe neste serviço OData. ${valido}`,
        recommendation: `Trocar o conjunto de entidades para "${best}", que existe no serviço.`,
        steps: [`Ajustar o campo "Entity Set" de "${current || '(vazio)'}" para "${best}"`, 'Sincronizar novamente para confirmar a recuperação'],
        probe: r,
        autoFix: {
          available: true,
          kind: 'entitySet',
          summary: `Trocar Entity Set: "${current || '(vazio)'}" → "${best}"`,
          changes: [{ field: 'entitySet', label: 'Entity Set', from: current || '(vazio)', to: best }],
          alternatives,
        },
      };
    }
    return {
      problem: `Recurso não encontrado (HTTP ${status})`,
      rootCause: `O endpoint respondeu HTTP ${status}. ${valido}`,
      recommendation: entitySets.length ? 'Escolha um dos conjuntos de entidades válidos listados.' : 'Confirme a URL do serviço OData e o nome do conjunto de entidades.',
      steps: ['Revisar serviceUrl e entitySet no cadastro', 'Testar novamente'],
      probe: r,
      autoFix: { available: false, reason: 'Não há um conjunto de entidades válido óbvio para aplicar automaticamente.' },
    };
  }

  // 401/403 → credencial/APIKey
  if (status === 401 || status === 403) {
    return {
      problem: `Falha de autenticação (HTTP ${status})`,
      rootCause: `O servidor recusou a requisição (HTTP ${status}). A APIKey/credencial está ausente, inválida ou expirada.`,
      recommendation: 'Atualize a APIKey (ou usuário/senha) no cadastro da integração. Por segurança, a plataforma não gera credenciais automaticamente.',
      steps: ['Gerar/copiar uma APIKey válida no provedor SAP', 'Editar a integração e colar a nova APIKey', 'Testar a conexão'],
      probe: r,
      autoFix: { available: false, reason: 'Correção de credencial exige uma chave válida fornecida por você.' },
    };
  }

  // 5xx → lado do servidor SAP
  if (status && status >= 500) {
    return {
      problem: `Erro no servidor SAP (HTTP ${status})`,
      rootCause: `O serviço respondeu HTTP ${status} — falha no lado do SAP, não na configuração.`,
      recommendation: 'Investigue o ambiente SAP. A plataforma continuará monitorando e marcará a recuperação automaticamente.',
      steps: ['Verificar logs do SAP (SM21 / ST22)', 'Confirmar disponibilidade do serviço (ICF / SICF)', 'Reprocessar quando o serviço voltar'],
      probe: r,
      autoFix: { available: false, reason: 'Falha no servidor SAP — correção fora da plataforma.' },
    };
  }

  // Sem resposta → OFFLINE (timeout/rede/URL)
  return {
    problem: 'Endpoint não respondeu',
    rootCause: `Sem resposta do endpoint (${r.error || 'timeout'}). Pode ser URL incorreta, indisponibilidade, firewall ou VPN.`,
    recommendation: 'Valide a URL do serviço e a conectividade de rede com o ambiente SAP.',
    steps: ['Conferir serviceUrl (esquema https, host e caminho)', 'Verificar firewall/VPN entre a plataforma e o SAP', 'Testar novamente'],
    probe: r,
    autoFix: { available: false, reason: 'Indisponibilidade/rede — não há ajuste de configuração seguro para aplicar automaticamente.' },
  };
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

  // 1ª leitura (nunca sincronizada) grava o valor real direto; depois usa média móvel (EWMA)
  const firstReading = integration.status === 'PENDING';
  const okVal = r.ok ? 100 : 0;
  const newErrorRate = firstReading
    ? (r.ok ? 0 : 100)
    : parseFloat((integration.errorRate * 0.7 + (r.ok ? 0 : 100) * 0.3).toFixed(2));
  const newUptime = firstReading
    ? okVal
    : parseFloat((integration.uptime * 0.9 + okVal * 0.1).toFixed(2));

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
