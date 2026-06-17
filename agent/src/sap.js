// Coletor de saúde do SAP. Dois modos:
//   mock — gera métricas realistas de RFC/IDoc para testar o pipeline sem SAP/SDK
//   rfc  — RFC real via node-rfc (requer o SAP NW RFC SDK instalado; opcional)

let mockUptimeBias = 0; // passeio aleatório leve para parecer real

/** Coleta a saúde do SAP conforme o modo configurado. */
export async function collectHealth(cfg) {
  if (cfg.mode === 'rfc') return collectViaRfc(cfg);
  return collectMock(cfg);
}

function collectMock(cfg) {
  // Estado forçado para demonstração: MOCK_FORCE=healthy|error|offline
  const force = (process.env.MOCK_FORCE || '').toLowerCase();
  if (force === 'offline') {
    return { ok: false, status: 'OFFLINE', latency: 0, message: 'Ping RFC falhou (forçado).',
      metrics: { rfcPing: false } };
  }
  if (force === 'error') {
    return { ok: false, status: 'ERROR', latency: 320,
      message: 'IDocs em erro e dump ABAP (forçado).',
      metrics: { rfcPing: true, idocErrorCount: 7, idocTotal: 120, dumps: 2, queueBacklog: 4 } };
  }
  if (force === 'healthy') {
    return { ok: true, status: 'ACTIVE', latency: 35 + Math.floor(Math.random() * 30),
      metrics: { rfcPing: true, idocErrorCount: 0, idocTotal: 140, dumps: 0, queueBacklog: 0 } };
  }

  // Sem força: ~15% de chance de problema, latência variável
  const roll = Math.random();
  const baseLatency = 30 + Math.floor(Math.random() * 60);
  mockUptimeBias = Math.max(-5, Math.min(5, mockUptimeBias + (Math.random() - 0.5) * 2));

  if (roll < 0.06) {
    return { ok: false, status: 'OFFLINE', latency: 0, message: 'Sem resposta do SAP (timeout RFC).',
      metrics: { rfcPing: false } };
  }
  if (roll < 0.15) {
    const errs = 3 + Math.floor(Math.random() * 8);
    return { ok: false, status: 'ERROR', latency: baseLatency + 200,
      message: `${errs} IDoc(s) em erro na fila.`,
      metrics: { rfcPing: true, idocErrorCount: errs, idocTotal: 100 + Math.floor(Math.random() * 80),
        dumps: Math.random() < 0.3 ? 1 : 0, queueBacklog: Math.floor(Math.random() * 6) } };
  }
  return { ok: true, status: 'ACTIVE', latency: baseLatency,
    metrics: { rfcPing: true, idocErrorCount: 0, idocTotal: 100 + Math.floor(Math.random() * 80),
      dumps: 0, queueBacklog: 0 } };
}

async function collectViaRfc(cfg) {
  // node-rfc é opcional: só funciona com o SAP NW RFC SDK instalado no host/imagem.
  let rfc;
  try {
    rfc = await import('node-rfc');
  } catch {
    throw new Error(
      'Modo rfc requer o pacote node-rfc + SAP NW RFC SDK. Instale o SDK (S-user na SAP) ' +
      'e rode `npm i node-rfc`, ou use SAP_MODE=mock.'
    );
  }

  const client = new rfc.Client({
    ashost: cfg.sap.ashost, sysnr: cfg.sap.sysnr, client: cfg.sap.client,
    user: cfg.sap.user, passwd: cfg.sap.passwd, lang: cfg.sap.lang || 'EN',
  });

  const t0 = Date.now();
  try {
    await client.open();
    // Ping de saúde
    await client.call('RFC_PING', {});
    const latency = Date.now() - t0;

    // Leitura de IDocs em erro (status 51) — ajuste o FM conforme o ambiente do cliente.
    // Exemplo genérico: muitos ambientes expõem um FM/CDS próprio para contagem.
    let idocErrorCount = 0, idocTotal = 0;
    try {
      const r = await client.call('IDOCS_LIST_OUTPUT_BY_STATUS', { PI_STATUS: '51' }).catch(() => null);
      if (r && Array.isArray(r.PT_IDOCS)) idocErrorCount = r.PT_IDOCS.length;
    } catch { /* FM pode não existir — mantém 0 */ }

    return { ok: idocErrorCount === 0, status: idocErrorCount === 0 ? 'ACTIVE' : 'ERROR', latency,
      metrics: { rfcPing: true, idocErrorCount, idocTotal } };
  } catch (e) {
    return { ok: false, status: 'OFFLINE', latency: Date.now() - t0,
      message: `Falha RFC: ${e.message}`, metrics: { rfcPing: false } };
  } finally {
    try { await client.close(); } catch { /* ignore */ }
  }
}
