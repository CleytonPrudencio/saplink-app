// SAPLINK — Agente on-premise
// Roda na rede do cliente, lê a saúde do SAP localmente e empurra via HTTPS (só saída)
// para a plataforma. Autentica por token próprio da integração (X-Agent-Token).

import { collectHealth, collectSapItems, executeCommand, discoverCatalog, discoverTransports } from './sap.js';

const cfg = {
  url: (process.env.SAPLINK_URL || '').replace(/\/$/, ''),
  token: process.env.AGENT_TOKEN || '',
  mode: (process.env.SAP_MODE || 'mock').toLowerCase(),
  pollSeconds: parseInt(process.env.POLL_SECONDS || '60'),
  sap: {
    ashost: process.env.SAP_ASHOST, sysnr: process.env.SAP_SYSNR, client: process.env.SAP_CLIENT,
    user: process.env.SAP_USER, passwd: process.env.SAP_PASSWD, lang: process.env.SAP_LANG,
  },
  soap: {
    url: process.env.SAP_SOAP_URL, // endpoint do FM STFC_CONNECTION exposto via SOAMANAGER
  },
};

function log(...a) { console.log(new Date().toISOString(), '[agent]', ...a); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!cfg.url || !cfg.token) {
  console.error('Faltam variáveis obrigatórias: SAPLINK_URL e AGENT_TOKEN.');
  process.exit(1);
}

async function api(path, init = {}) {
  const res = await fetch(`${cfg.url}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'x-agent-token': cfg.token, ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function verifyToken() {
  for (let attempt = 1; ; attempt++) {
    try {
      const { status, body } = await api('/api/agent/ping');
      if (status === 200) { log(`conectado: integração "${body.integration?.name}" (${body.integration?.type})`); return; }
      if (status === 401) { console.error('Token do agente inválido. Gere um novo no SAPLINK e atualize AGENT_TOKEN.'); process.exit(1); }
      log(`ping retornou ${status}, tentando de novo...`);
    } catch (e) {
      log(`sem conexão com o SAPLINK (${e.message}). Retry...`);
    }
    await sleep(Math.min(30000, 2000 * attempt));
  }
}

async function tick() {
  let report;
  try {
    report = await collectHealth(cfg);
  } catch (e) {
    log('erro ao coletar saúde do SAP:', e.message);
    report = { ok: false, status: 'OFFLINE', message: `Coletor falhou: ${e.message}`, metrics: { rfcPing: false } };
  }
  try {
    const { status, body } = await api('/api/agent/report', { method: 'POST', body: JSON.stringify(report) });
    if (status === 200) {
      log(`reportado: status=${body.status} uptime=${body.uptime}% erro=${body.errorRate}% latência=${report.latency}ms`);
      if (body.nextPollSeconds) cfg.pollSeconds = body.nextPollSeconds;
    } else {
      log(`report falhou (${status}): ${body.error || 'erro'}`);
    }
  } catch (e) {
    log('falha ao enviar report (rede):', e.message);
  }

  // B1 — empurra o snapshot de IDocs/filas (vazio quando saudável)
  try {
    const items = collectSapItems(report);
    const { status, body } = await api('/api/agent/sap-items', { method: 'POST', body: JSON.stringify({ items }) });
    if (status === 200) log(`itens: ${items.length} enviado(s) (resolvidos: ${body.resolved ?? 0})`);
  } catch (e) {
    log('falha ao enviar itens (rede):', e.message);
  }

  // B2 — busca remediações aprovadas, executa e reporta o resultado
  try {
    const { status, body } = await api('/api/agent/commands');
    if (status === 200 && Array.isArray(body.commands) && body.commands.length) {
      for (const cmd of body.commands) {
        const result = executeCommand(cmd);
        await api(`/api/agent/commands/${cmd.id}/result`, { method: 'POST', body: JSON.stringify(result) });
        log(`remediação executada: ${cmd.actionType} em ${cmd.target} → ${result.ok ? 'OK' : 'FALHOU'}`);
      }
    }
  } catch (e) {
    log('falha no ciclo de comandos:', e.message);
  }
}

let catalogPushed = false;
async function pushCatalogOnce() {
  // B3 — descoberta do catálogo: empurra no início e a cada ~1h
  try {
    const items = discoverCatalog();
    const { status, body } = await api('/api/agent/catalog', { method: 'POST', body: JSON.stringify({ items }) });
    if (status === 200) { catalogPushed = true; log(`catálogo: ${items.length} interface(s) (inativadas: ${body.deactivated ?? 0})`); }
  } catch (e) {
    log('falha ao enviar catálogo (rede):', e.message);
  }
  // D3 — transportes STMS
  try {
    const items = discoverTransports();
    const { status, body } = await api('/api/agent/transports', { method: 'POST', body: JSON.stringify({ items }) });
    if (status === 200) log(`transports: ${body.upserted ?? items.length} enviado(s)`);
  } catch (e) {
    log('falha ao enviar transports (rede):', e.message);
  }
}

async function main() {
  log(`iniciando — modo=${cfg.mode} alvo=${cfg.url} intervalo=${cfg.pollSeconds}s`);
  await verifyToken();
  await pushCatalogOnce();
  let ticks = 0;
  // loop principal
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await tick();
    ticks++;
    // re-descobre o catálogo a cada ~1h (3600s / pollSeconds)
    if (!catalogPushed || ticks % Math.max(1, Math.round(3600 / cfg.pollSeconds)) === 0) await pushCatalogOnce();
    await sleep(cfg.pollSeconds * 1000);
  }
}

process.on('SIGTERM', () => { log('encerrando.'); process.exit(0); });
process.on('SIGINT', () => { log('encerrando.'); process.exit(0); });

main();
