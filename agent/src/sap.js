// Coletor de saúde do SAP. Dois modos:
//   mock — gera métricas realistas de RFC/IDoc para testar o pipeline sem SAP/SDK
//   rfc  — RFC real via node-rfc (requer o SAP NW RFC SDK instalado; opcional)

let mockUptimeBias = 0; // passeio aleatório leve para parecer real

/** Coleta a saúde do SAP conforme o modo configurado. */
export async function collectHealth(cfg) {
  if (cfg.mode === 'rfc') return collectViaRfc(cfg);
  if (cfg.mode === 'soap') return collectViaSoap(cfg);
  return collectMock(cfg);
}

const MSG_TYPES = ['ORDERS05', 'MATMAS05', 'DESADV01', 'INVOIC02', 'DELVRY07'];
const PARTNERS = ['LS_ECCCLNT100', 'KU_CLIENTE01', 'LS_PI_PROD', 'KU_FORNEC22'];
const IDOC_STATUS = [
  { code: '51', text: 'Erro na aplicação — registro não pôde ser gravado', remediable: true },
  { code: '56', text: 'IDoc com erro de segmento/parceiro (EDI)', remediable: false },
  { code: '64', text: 'IDoc pronto para processamento (preso na fila)', remediable: true },
];
const QUEUE_STATUS = [
  { code: 'SYSFAIL', text: 'Erro de sistema na execução do LUW', remediable: true },
  { code: 'CPICERR', text: 'Falha de comunicação (CPIC) com o destino', remediable: true },
  { code: 'RETRY', text: 'Aguardando reenvio automático', remediable: true },
];

/** Deriva o snapshot de itens operacionais (IDoc/filas) a partir das métricas de saúde.
 *  Determinístico para o snapshot ser estável entre ticks (mesma contagem → mesmos refs). */
export function collectSapItems(report) {
  const m = report?.metrics || {};
  const items = [];
  const errs = m.idocErrorCount || 0;
  for (let i = 0; i < errs; i++) {
    const st = IDOC_STATUS[i % IDOC_STATUS.length];
    items.push({
      kind: 'IDOC',
      direction: i % 2 === 0 ? 'INBOUND' : 'OUTBOUND',
      ref: String(90000000 + i),
      messageType: MSG_TYPES[i % MSG_TYPES.length],
      partner: PARTNERS[i % PARTNERS.length],
      statusCode: st.code,
      statusText: st.text,
      remediable: st.remediable,
    });
  }
  const backlog = m.queueBacklog || 0;
  for (let i = 0; i < backlog; i++) {
    const st = QUEUE_STATUS[i % QUEUE_STATUS.length];
    const isQ = i % 2 === 0;
    items.push({
      kind: isQ ? 'QRFC' : 'TRFC',
      direction: 'OUTBOUND',
      ref: isQ ? `SAPLINK_OUT_${i + 1}` : `TID_${(0xA0000 + i).toString(16).toUpperCase()}`,
      partner: PARTNERS[i % PARTNERS.length],
      statusCode: st.code,
      statusText: st.text,
      depth: 1 + ((i * 3) % 9),
      remediable: st.remediable,
    });
  }
  return items;
}

/**
 * Executa o Function Module RFC-enabled STFC_CONNECTION exposto como web service SOAP
 * (SOAMANAGER). Não precisa do SAP NW RFC SDK — é ABAP real rodando via HTTP.
 * O FM ecoa REQUTEXT -> ECHOTEXT; saúde = HTTP 200 + eco correto.
 */
async function collectViaSoap(cfg) {
  const url = cfg.soap?.url;
  if (!url) throw new Error('SAP_SOAP_URL é obrigatório no modo soap.');
  const marker = 'SAPLINK_PING';
  const envelope =
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">` +
    `<soapenv:Body><urn:STFC_CONNECTION><REQUTEXT>${marker}</REQUTEXT></urn:STFC_CONNECTION></soapenv:Body></soapenv:Envelope>`;
  const headers = { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '""' };
  if (cfg.sap.user && cfg.sap.passwd) {
    headers.Authorization = 'Basic ' + Buffer.from(`${cfg.sap.user}:${cfg.sap.passwd}`).toString('base64');
  }
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method: 'POST', headers, body: envelope, signal: AbortSignal.timeout(15000) });
    const latency = Date.now() - t0;
    const text = await res.text();
    const echoed = text.includes(marker);
    if (res.ok && echoed) {
      return { ok: true, status: 'ACTIVE', latency, metrics: { rfcPing: true } };
    }
    return {
      ok: false,
      status: res.status === 401 || res.status === 403 ? 'ERROR' : 'ERROR',
      latency,
      message: res.ok ? 'Resposta SOAP sem eco esperado do FM.' : `SOAP HTTP ${res.status}`,
      metrics: { rfcPing: false },
    };
  } catch (e) {
    return { ok: false, status: 'OFFLINE', latency: Date.now() - t0, message: `Falha SOAP: ${e.message}`, metrics: { rfcPing: false } };
  }
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

/** Executa um comando de remediação. No mock, simula a transação SAP equivalente.
 *  No modo rfc real, chamaria o FM correspondente (RBDMANI2/RSARFCEX/etc.) via node-rfc. */
export function executeCommand(command) {
  const { actionType, target } = command;
  const map = {
    REPROCESS_IDOC: { resultText: `IDoc ${target} reprocessado via RBDMANI2 (BD87).`, afterText: `IDoc ${target} — status 53 (processado com sucesso).` },
    UNLOCK_QUEUE: { resultText: `Fila ${target} destravada (SMQ2 → ACTIVATE).`, afterText: `Fila ${target} — LUWs reexecutados; fila vazia.` },
    RETRY_TRFC: { resultText: `tRFC ${target} reexecutado (SM58 → execute LUW).`, afterText: `tRFC ${target} — confirmado, sem erro.` },
    REACTIVATE_RFC: { resultText: `Destino RFC ${target} reativado (SM59).`, afterText: `Destino ${target} — teste de conexão OK.` },
  };
  const m = map[actionType] || { resultText: `Ação ${actionType} executada em ${target}.`, afterText: 'OK.' };
  return { ok: true, ...m };
}

/** Descobre o catálogo de interfaces. No mock, retorna um landscape de exemplo estável. */
/** F3 — sinais de Basis & Operações. No mock, gera amostras representativas; no real, viria de SM37/ST22/SM13/SM12/SM21/HANA. */
export function collectOpsSignals(cfg) {
  if (cfg.mode !== 'mock') return [];
  const now = Date.now();
  const t = (n) => new Date(now - n * 3600000).toISOString();
  return [
    { category: 'PIPO', severity: 'HIGH', title: 'Canal de comunicação em erro', object: 'CC_ORDERS_FILE', detail: 'PI/PO: channel parado (Comm Channel Monitoring)', ref: 'CC_ORDERS_FILE', occurredAt: t(1) },
    { category: 'JOB', severity: 'HIGH', title: 'Job cancelado', object: 'ZRE_BILLING_NIGHTLY', detail: 'SM37: terminou com status Cancelado', ref: 'ZRE_BILLING_NIGHTLY', occurredAt: t(6) },
    { category: 'DUMP', severity: 'MEDIUM', title: 'Runtime error TIME_OUT', object: 'SAPLZFI_REPORT', detail: 'ST22: dump por timeout em relatório FI', ref: 'DUMP_TIME_OUT_0613', occurredAt: t(3) },
    { category: 'UPDATE_ERR', severity: 'HIGH', title: 'Update terminado', object: 'VBRK', detail: 'SM13: registro de atualização cancelado (faturamento)', ref: 'UPD_VBRK_0613', occurredAt: t(2) },
    { category: 'LOCK', severity: 'LOW', title: 'Lock antigo (>2h)', object: 'EKKO 4500001234', detail: 'SM12: bloqueio preso em pedido de compra', ref: 'LOCK_EKKO_4500001234', occurredAt: t(4) },
    { category: 'GATEWAY', severity: 'MEDIUM', title: 'OData service error', object: 'API_SALES_ORDER_SRV', detail: '/IWFND/ERROR_LOG: 500 em GET', ref: 'GW_API_SALES_ORDER_SRV', occurredAt: t(1) },
    { category: 'HANA', severity: 'CRITICAL', title: 'Memória acima de 90%', object: 'HDB/usedMemory', detail: 'HANA: uso de memória 92% — risco de OOM', ref: 'HANA_MEM_HIGH', occurredAt: t(0) },
    { category: 'SECURITY', severity: 'MEDIUM', title: 'Patch de segurança pendente', object: 'SAP Note 3300000', detail: 'Patch level abaixo do recomendado (HotNews)', ref: 'SEC_NOTE_3300000', occurredAt: t(12) },
  ];
}

export function discoverCatalog() {
  return [
    { kind: 'PARTNER_PROFILE', name: 'LS_ECCCLNT100', detail: 'Parceiro lógico — ECC produção (WE20)', attributes: { type: 'LS' } },
    { kind: 'PARTNER_PROFILE', name: 'KU_CLIENTE01', detail: 'Parceiro cliente EDI (WE20)', attributes: { type: 'KU' } },
    { kind: 'RFC_DEST', name: 'PI_PROD', detail: 'Destino TCP/IP → SAP PI/PO (SM59)', attributes: { conn: 'T' } },
    { kind: 'RFC_DEST', name: 'SALESFORCE_OUT', detail: 'Destino HTTP → Salesforce (SM59)', attributes: { conn: 'G' } },
    { kind: 'MESSAGE_TYPE', name: 'ORDERS05', detail: 'Pedidos de compra' },
    { kind: 'MESSAGE_TYPE', name: 'MATMAS05', detail: 'Mestre de materiais' },
    { kind: 'MESSAGE_TYPE', name: 'INVOIC02', detail: 'Faturas (NF-e)' },
    { kind: 'ODATA_SERVICE', name: 'API_SALES_ORDER_SRV', detail: 'OData — Sales Order (/IWFND/MAINT_SERVICE)', attributes: { version: 'v2' } },
    { kind: 'IDOC_PORT', name: 'SAPLINK_PORT', detail: 'Porta tRFC de saída (WE21)' },
  ];
}

/** Descobre transportes STMS recentes. No mock, gera amostras com importação nas últimas horas. */
export function discoverTransports() {
  const now = Date.now();
  const h = (n) => new Date(now - n * 3600000).toISOString();
  return [
    { trNumber: 'DEVK900231', description: 'Ajuste em user-exit MIGO (ZMM)', owner: 'jsilva', status: 'IMPORTED', target: 'PRD', importedAt: h(2) },
    { trNumber: 'DEVK900228', description: 'Nova estrutura de IDoc ORDERS05', owner: 'msouza', status: 'IMPORTED', target: 'PRD', importedAt: h(5) },
    { trNumber: 'DEVK900219', description: 'Correção de mapeamento CPI', owner: 'jsilva', status: 'IMPORTED', target: 'QAS', importedAt: h(20) },
    { trNumber: 'DEVK900205', description: 'Config SM59 destino Salesforce', owner: 'basis', status: 'IMPORTED', target: 'PRD', importedAt: h(50) },
  ];
}

/** Descobre mensagens CPI (MPL) e AIF. No mock, gera amostras com alguns erros. */
export function discoverCloud() {
  const now = Date.now();
  const t = (n) => new Date(now - n * 60000).toISOString();
  return [
    { source: 'CPI', artifact: 'IF_Salesforce_Customer', messageId: 'MPL_1001', direction: 'OUTBOUND', status: 'COMPLETED', occurredAt: t(8) },
    { source: 'CPI', artifact: 'IF_Salesforce_Customer', messageId: 'MPL_1002', direction: 'OUTBOUND', status: 'FAILED', error: 'HTTP 500 from receiver (Salesforce)', occurredAt: t(5) },
    { source: 'CPI', artifact: 'IF_Bank_Payment', messageId: 'MPL_1003', direction: 'OUTBOUND', status: 'RETRY', error: 'Connection timeout', occurredAt: t(3) },
    { source: 'CPI', artifact: 'IF_Material_Sync', messageId: 'MPL_1004', direction: 'INBOUND', status: 'COMPLETED', occurredAt: t(2) },
    { source: 'AIF', artifact: '/SAPLINK/INVOICE_IN', messageId: 'AIF_77001', direction: 'INBOUND', status: 'ESCALATED', error: 'Erro de mapeamento no campo BUKRS', occurredAt: t(12) },
    { source: 'AIF', artifact: '/SAPLINK/ORDER_OUT', messageId: 'AIF_77002', direction: 'OUTBOUND', status: 'COMPLETED', occurredAt: t(6) },
    { source: 'AIF', artifact: '/SAPLINK/DELIVERY_IN', messageId: 'AIF_77003', direction: 'INBOUND', status: 'FAILED', error: 'Cliente inexistente (KUNNR)', occurredAt: t(1) },
  ];
}

/** Descoberta S/4HANA Cloud (mock): upgrade, clean core, APIs, comm arrangements, fiscal, eventos. */
export function discoverS4() {
  const now = Date.now();
  const d = (h) => new Date(now - h * 3600000).toISOString();
  const cert = (days) => new Date(now + days * 864e5).toISOString();
  return {
    upgradeFindings: [
      { release: '2508', area: 'API', object: 'API_SALES_ORDER_SRV (v2)', impact: 'DEPRECATED', detail: 'OData v2 será descontinuada; migrar para v4.', recommendation: 'Migrar consumo para API_SALES_ORDER_SRV;v4.' },
      { release: '2508', area: 'CDS', object: 'ZCDS_PEDIDOS_CUSTOM', impact: 'BREAKING', detail: 'Campo de origem renomeado no release.', recommendation: 'Ajustar a CDS custom antes do upgrade.' },
      { release: '2508', area: 'EXTENSION', object: 'BTP ext: ext-faturamento (CAP)', impact: 'CHANGED', detail: 'Destino consome API que muda payload.', recommendation: 'Revisar o mapeamento da extensão.' },
      { release: '2508', area: 'FIELD', object: 'Custom field YY1_DESC_ROTA', impact: 'OK', detail: 'Compatível.', recommendation: '' },
      { release: '2508', area: 'JOB', object: 'Job: Reprocesso de saídas', impact: 'CHANGED', detail: 'Template de job atualizado.', recommendation: 'Recriar agendamento.' },
    ],
    cleanCore: [
      { category: 'DEPRECATED_API', object: 'API_SALES_ORDER_SRV v2', severity: 'HIGH', points: 12, recommendation: 'Migrar para v4.' },
      { category: 'CUSTOM_CDS', object: 'ZCDS_PEDIDOS_CUSTOM', severity: 'MEDIUM', points: 8, recommendation: 'Avaliar substituir por view liberada.' },
      { category: 'MODIFICATION', object: 'Lógica in-app não-cloud-ready', severity: 'HIGH', points: 15, recommendation: 'Migrar para extensibilidade liberada.' },
      { category: 'SIDE_BY_SIDE', object: 'ext-faturamento (BTP)', severity: 'LOW', points: 3, recommendation: 'OK — manter padrão side-by-side.' },
      { category: 'IN_APP', object: '6 custom fields em VBAK', severity: 'MEDIUM', points: 6, recommendation: 'Consolidar custom fields.' },
    ],
    apiUsage: [
      { apiName: 'API_SALES_ORDER_SRV', version: 'v2', scenario: 'SAP_COM_0109', calls30d: 18420, deprecated: true, deprecationRelease: '2508', replacement: 'API_SALES_ORDER_SRV;v4' },
      { apiName: 'API_BUSINESS_PARTNER', version: 'v2', scenario: 'SAP_COM_0008', calls30d: 9610, deprecated: false },
      { apiName: 'API_PRODUCT_SRV', version: 'v2', scenario: 'SAP_COM_0009', calls30d: 4300, deprecated: false },
      { apiName: 'API_BILLING_DOCUMENT_SRV', version: 'v2', scenario: 'SAP_COM_0157', calls30d: 2750, deprecated: false },
    ],
    commArrangements: [
      { scenario: 'SAP_COM_0109', name: 'Salesforce → S/4 (Pedidos)', direction: 'INBOUND', commUser: 'COMM_SF_IN', status: 'ACTIVE', certExpiresAt: cert(6) },
      { scenario: 'SAP_COM_0008', name: 'MDI Business Partner', direction: 'OUTBOUND', commUser: 'COMM_MDI', status: 'ACTIVE', certExpiresAt: cert(24) },
      { scenario: 'SAP_COM_0157', name: 'Faturamento → Banco', direction: 'OUTBOUND', commUser: 'COMM_BANK', status: 'ERROR', certExpiresAt: cert(120) },
    ],
    fiscalDocs: [
      { docType: 'NFE', number: '000123456', status: 'REJECTED', sefazCode: '539', message: 'Duplicidade de NF-e (chave já autorizada).', amountCents: 1875000, remediable: true, issuedAt: d(3) },
      { docType: 'NFE', number: '000123457', status: 'CONTINGENCY', sefazCode: '108', message: 'SEFAZ indisponível — emitido em contingência.', amountCents: 940000, remediable: true, issuedAt: d(2) },
      { docType: 'NFSE', number: 'NFSE-7781', status: 'PENDING', message: 'Aguardando retorno da prefeitura.', amountCents: 320000, remediable: false, issuedAt: d(1) },
      { docType: 'NFE', number: '000123455', status: 'AUTHORIZED', amountCents: 560000, remediable: false, issuedAt: d(5) },
      { docType: 'CTE', number: 'CTE-5521', status: 'AUTHORIZED', amountCents: 120000, remediable: false, issuedAt: d(6) },
      { docType: 'CTE', number: 'CTE-5544', status: 'REJECTED', sefazCode: '236', message: 'CT-e: chave de acesso com dígito verificador inválido.', amountCents: 84000, remediable: true, issuedAt: d(2) },
      { docType: 'MDFE', number: 'MDFE-2031', status: 'PENDING', message: 'MDF-e aguardando encerramento (em trânsito).', amountCents: 0, remediable: false, issuedAt: d(1) },
      { docType: 'MDFE', number: 'MDFE-2029', status: 'REJECTED', sefazCode: '645', message: 'MDF-e: município de descarregamento inexistente.', amountCents: 0, remediable: true, issuedAt: d(3) },
      { docType: 'SPED_EFD_ICMS', number: 'SPED-2026-05', status: 'PENDING', message: 'SPED Fiscal: bloco H com inconsistência de inventário.', amountCents: 0, remediable: false, issuedAt: d(8) },
      { docType: 'ESOCIAL_S1200', number: 'eSocial-S1200-0426', status: 'REJECTED', sefazCode: '301', message: 'eSocial: trabalhador sem cadastro prévio (S-2200).', amountCents: 0, remediable: true, issuedAt: d(4) },
      { docType: 'EFDREINF_R2010', number: 'Reinf-R2010-0426', status: 'PENDING', message: 'EFD-Reinf: retenção de INSS aguardando transmissão.', amountCents: 47000, remediable: false, issuedAt: d(2) },
    ],
    cloudEvents: [
      { topic: 'sap.s4.beh.salesorder.v1.SalesOrder.Created.v1', status: 'DELIVERED', subscriber: 'ext-faturamento', lagMs: 220, occurredAt: d(1) },
      { topic: 'sap.s4.beh.businesspartner.v1.Changed.v1', status: 'DEAD_LETTER', subscriber: 'mdi-sync', lagMs: 0, occurredAt: d(2) },
      { topic: 'sap.s4.beh.billingdocument.v1.Created.v1', status: 'RETRY', subscriber: 'bank-connector', lagMs: 5400, occurredAt: d(1) },
      { topic: 'sap.s4.beh.outbounddelivery.v1.Created.v1', status: 'DELIVERED', subscriber: 'wms-bridge', lagMs: 180, occurredAt: d(3) },
    ],
  };
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
