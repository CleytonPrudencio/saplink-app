// Gerador da apresentação de vendas (PPTX) e relatório (PDF) do SAPLINK.
// Puxa dados reais da API de produção e monta os arquivos em ./out.
//   node generate.mjs            (usa https://saplink.com.br/api)
//   API=http://localhost:8080/api EMAIL=... PASSWORD=... node generate.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PptxGenJS from 'pptxgenjs';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const API = (process.env.API || 'https://saplink.com.br/api').replace(/\/$/, '');
const EMAIL = process.env.EMAIL || 'admin@saplink.com';
const PASSWORD = process.env.PASSWORD || 'Saplink@2026';

// ---------- paleta ----------
const C = {
  bg: '0F0B1A', card: '1A1527', line: '2A2440', text: 'E2E0EA', muted: '9B95AD',
  purple: '7C3AED', purpleL: 'A78BFA', cyan: '06B6D4', cyanL: '22D3EE',
  rose: 'F87171', emerald: '34D399', amber: 'FBBF24', white: 'FFFFFF',
};
const FONT = 'Segoe UI';
const brl = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ---------- coleta de dados ----------
async function api(token, p) {
  const r = await fetch(`${API}${p}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!r.ok) throw new Error(`${p} -> HTTP ${r.status}`);
  return r.json();
}
async function safe(fn, fallback) { try { return await fn(); } catch (e) { console.warn('  (aviso)', e.message); return fallback; } }

async function collect() {
  console.log('Coletando dados de', API);
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  }).then((r) => r.json());
  const token = login.token;
  if (!token) throw new Error('login falhou — confira EMAIL/PASSWORD');

  const clients = await safe(() => api(token, '/clients'), []);
  const cockpit = await safe(() => api(token, '/cockpit'), { summary: {} });
  const sla = await safe(() => api(token, '/sla'), { clients: [], overall: 0 });
  const impact = await safe(() => api(token, '/sla/impact/all'), { totals: {} });
  const cloud = await safe(() => api(token, '/cloud'), { summary: {} });
  const predict = await safe(() => api(token, '/predict'), { summary: {} });
  const catalog = await safe(() => api(token, '/catalog'), { summary: {} });
  const transports = await safe(() => api(token, '/transports'), { summary: {} });
  const plans = await safe(() => fetch(`${API}/plans`).then((r) => r.json()), []);

  const integrations = clients.reduce((s, c) => s + (c.integrationCount || (c.integrations?.length ?? 0)), 0);
  const alerts = clients.reduce((s, c) => s + (c.alertCount || c._count?.alerts || 0), 0);
  const avgHealth = clients.length ? Math.round(clients.reduce((s, c) => s + (c.healthScore || 0), 0) / clients.length) : 0;

  return {
    clients: clients.length, integrations, alerts, avgHealth,
    cockpit: cockpit.summary || {}, slaOverall: sla.overall ?? 0, slaClients: sla.clients || [],
    impact: impact.totals || {}, cloud: cloud.summary || {}, predict: predict.summary || {},
    catalog: catalog.summary || {}, transports: transports.summary || {},
    plans: Array.isArray(plans) ? plans : (plans.plans || []),
  };
}

// =====================================================================
// PPTX
// =====================================================================
function buildPptx(d) {
  const p = new PptxGenJS();
  p.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
  p.layout = 'WIDE';
  p.author = 'SAPLINK';
  p.company = 'SAPLINK';

  const W = 13.333, H = 7.5;
  const bg = (s) => { s.background = { color: C.bg }; };
  const accentBar = (s) => s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.12, fill: { color: C.purple } });
  const footer = (s, n) => s.addText(`saplink.com.br  ·  ${n}`, { x: 0.5, y: H - 0.45, w: W - 1, h: 0.3, fontSize: 9, color: C.muted, fontFace: FONT });
  const title = (s, t, sub) => {
    s.addText(t, { x: 0.6, y: 0.5, w: W - 1.2, h: 0.8, fontSize: 30, bold: true, color: C.white, fontFace: FONT });
    if (sub) s.addText(sub, { x: 0.6, y: 1.25, w: W - 1.2, h: 0.5, fontSize: 15, color: C.purpleL, fontFace: FONT });
  };
  const bullets = (s, items, opt = {}) => s.addText(
    items.map((t) => ({ text: t, options: { bullet: { code: '2022', indent: 18 }, color: C.text, fontSize: opt.fontSize || 17, paraSpaceAfter: 10, fontFace: FONT } })),
    { x: opt.x ?? 0.8, y: opt.y ?? 2.1, w: opt.w ?? (W - 1.6), h: opt.h ?? 4.4, valign: 'top' },
  );
  const kpis = (s, cards, y = 2.3) => {
    const n = cards.length, gap = 0.3, mx = 0.8;
    const cw = (W - mx * 2 - gap * (n - 1)) / n;
    cards.forEach((c, i) => {
      const x = mx + i * (cw + gap);
      s.addShape(p.ShapeType.roundRect, { x, y, w: cw, h: 1.9, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } });
      s.addText(c.v, { x, y: y + 0.35, w: cw, h: 0.9, fontSize: 34, bold: true, color: c.color || C.cyanL, align: 'center', fontFace: FONT });
      s.addText(c.l, { x: x + 0.1, y: y + 1.25, w: cw - 0.2, h: 0.5, fontSize: 12, color: C.muted, align: 'center', fontFace: FONT });
    });
  };

  // 1 — Capa
  let s = p.addSlide(); bg(s);
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: W, h: 0.18, fill: { color: C.purple } });
  s.addShape(p.ShapeType.rect, { x: 0, y: 0.18, w: W, h: 0.06, fill: { color: C.cyan } });
  s.addText('◆ SAPLINK', { x: 0.8, y: 2.4, w: W - 1.6, h: 1, fontSize: 54, bold: true, color: C.white, fontFace: FONT });
  s.addText('A plataforma de operação de integrações SAP para consultorias', { x: 0.8, y: 3.5, w: W - 1.6, h: 0.8, fontSize: 22, color: C.purpleL, fontFace: FONT });
  s.addText('Monitora · Prevê · Corrige · Prova valor em R$', { x: 0.8, y: 4.3, w: W - 1.6, h: 0.6, fontSize: 16, color: C.muted, fontFace: FONT });
  s.addText('saplink.com.br', { x: 0.8, y: 6.4, w: 6, h: 0.4, fontSize: 14, color: C.cyanL, fontFace: FONT });

  // 2 — A dor
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'O dia a dia da consultoria SAP', 'Operação reativa custa cliente e margem');
  bullets(s, [
    'Integrações SAP quebram em silêncio — IDoc travado, fila parada, RFC caída.',
    'O cliente descobre o problema antes de você. Erosão de confiança.',
    'O time vive apagando incêndio, sem visão única de toda a carteira.',
    'Difícil provar o valor entregue — e difícil justificar o contrato.',
    'Cada cliente novo = mais carga no mesmo time. Não escala.',
  ]);
  footer(s, 'O problema');

  // 3 — A solução
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'O que é o SAPLINK', 'De monitor a plataforma autônoma de operação');
  bullets(s, [
    'Visão única, multi-cliente, da saúde de todas as integrações SAP.',
    'Cockpit de IDoc/filas (BD87 · SMQ · SM58) e remediação com 1 clique.',
    'IA que diagnostica, sugere a Nota SAP e corrige dentro da plataforma.',
    'SLA medido por cliente e impacto financeiro das paradas em R$.',
    'Portal white-label: o cliente final vê a própria saúde com a sua marca.',
  ]);
  footer(s, 'A solução');

  // 4 — Como funciona
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'Como funciona', 'Seguro por design — sem abrir porta na rede do cliente');
  const boxes = [
    { t: 'Agente on-premise', d: 'Roda no SAP do cliente. Lê IDoc/RFC/filas e só faz saída HTTPS.' },
    { t: 'Plataforma SAPLINK', d: 'Multi-tenant na nuvem. Correlaciona, prevê e dispara ações.' },
    { t: 'Sua consultoria', d: 'Dashboards, alertas multicanal, SLA e relatórios por cliente.' },
  ];
  boxes.forEach((b, i) => {
    const x = 0.8 + i * 4.0;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.4, w: 3.7, h: 2.6, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.purple, width: 1.5 } });
    s.addText(b.t, { x: x + 0.2, y: 2.7, w: 3.3, h: 0.6, fontSize: 18, bold: true, color: C.cyanL, fontFace: FONT });
    s.addText(b.d, { x: x + 0.2, y: 3.4, w: 3.3, h: 1.4, fontSize: 13, color: C.text, fontFace: FONT, valign: 'top' });
    if (i < 2) s.addText('→', { x: x + 3.7, y: 3.4, w: 0.4, h: 0.6, fontSize: 24, color: C.purpleL, align: 'center', fontFace: FONT });
  });
  footer(s, 'Arquitetura');

  // 5 — Evidência: carteira
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'Visão da carteira', 'Dados reais de uma operação rodando no SAPLINK');
  kpis(s, [
    { v: String(d.clients), l: 'Clientes', color: C.white },
    { v: String(d.integrations), l: 'Integrações', color: C.cyanL },
    { v: String(d.alerts), l: 'Alertas', color: C.amber },
    { v: `${d.avgHealth}`, l: 'Health médio', color: C.purpleL },
    { v: `${d.slaOverall}%`, l: 'SLA compliance', color: d.slaOverall >= 90 ? C.emerald : C.amber },
  ]);
  s.addText('Tudo isso em um só painel — sem planilha, sem caça a transação cliente por cliente.', { x: 0.8, y: 4.6, w: W - 1.6, h: 0.6, fontSize: 15, color: C.muted, fontFace: FONT });
  footer(s, 'Evidência · Carteira');

  // 6 — Cockpit
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'Cockpit de operação', 'IDoc e filas de toda a carteira num só lugar');
  const ck = d.cockpit;
  kpis(s, [
    { v: String(ck.total ?? 0), l: 'Itens abertos', color: C.white },
    { v: String(ck.byKind?.IDOC ?? 0), l: 'IDocs em erro', color: C.rose },
    { v: String((ck.byKind?.QRFC ?? 0) + (ck.byKind?.TRFC ?? 0)), l: 'Filas qRFC/tRFC', color: C.amber },
    { v: String(ck.remediable ?? 0), l: 'Remediáveis', color: C.emerald },
  ]);
  bullets(s, [
    'BD87 + SMQ1/2 + SM58 unificados, multi-cliente, com filtros.',
    'Cada item remediável vira ação de 1 clique — com aprovação e log.',
  ], { y: 4.6, fontSize: 15, h: 1.6 });
  footer(s, 'Evidência · Cockpit');

  // 7 — Remediação
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'Remediação autônoma', 'O agente AGE — com governança');
  bullets(s, [
    'Reprocessa IDoc (RBDMANI2/BD87), destrava fila (SMQ2), reexecuta tRFC (SM58).',
    'Fluxo com aprovação do admin: nada roda no SAP sem o seu OK.',
    'Log de antes/depois de cada ação — auditoria completa.',
    'O comando é puxado pelo agente: zero porta de entrada na rede do cliente.',
  ]);
  footer(s, 'Evidência · Remediação');

  // 8 — SLA & R$
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'SLA & impacto em R$', 'A conversa que o C-level entende');
  kpis(s, [
    { v: `${d.slaOverall}%`, l: 'SLA compliance', color: d.slaOverall >= 90 ? C.emerald : C.amber },
    { v: brl(d.impact.riskPerHourCents ?? 0), l: 'R$/hora em risco', color: C.rose },
    { v: brl(d.impact.accumulatedCents ?? 0), l: 'Exposição acumulada', color: C.amber },
    { v: String(d.impact.atRisk ?? 0), l: 'Integrações fora do ar', color: C.rose },
  ]);
  bullets(s, [
    'SLA por cliente com relatório mensal narrado por IA — pronto pra apresentar.',
    'Cada parada vira número em R$: você vende SLA premium e prova o ROI do contrato.',
  ], { y: 4.6, fontSize: 15, h: 1.6 });
  footer(s, 'Evidência · SLA & R$');

  // 9 — CPI/AIF
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'Cobertura do stack moderno', 'CPI / Integration Suite + AIF');
  const cl = d.cloud;
  kpis(s, [
    { v: String(cl.total ?? 0), l: 'Mensagens CPI/AIF', color: C.white },
    { v: String(cl.bySource?.CPI ?? 0), l: 'CPI (MPL/IFlows)', color: C.cyanL },
    { v: String(cl.bySource?.AIF ?? 0), l: 'AIF', color: C.purpleL },
    { v: String(cl.failed ?? 0), l: 'Com falha', color: C.rose },
  ], 2.2);
  s.addShape(p.ShapeType.roundRect, { x: 0.8, y: 4.35, w: W - 1.6, h: 2.2, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.cyan, width: 1, dashType: 'dash' } });
  s.addText('[ Cole aqui o print do SAP BTP — Integration Suite (Message Monitoring) e AIF ]', { x: 1, y: 5.2, w: W - 2, h: 0.5, fontSize: 14, italic: true, color: C.muted, align: 'center', fontFace: FONT });
  footer(s, 'Evidência · CPI/AIF');

  // 10 — Diferenciais
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'O que ninguém mais tem', 'O moat do SAPLINK');
  bullets(s, [
    'Copiloto IA: pergunte em linguagem natural sobre toda a carteira.',
    'Digest semanal narrado por IA, white-label, no e-mail do gestor.',
    'SAP Notes sugeridas automaticamente no diagnóstico do erro.',
    'Radar de validade: certificados TLS e segredos antes de expirarem.',
    'Previsão de falha por tendência + benchmark anônimo vs mercado.',
    'Radar de transports (STMS): correlaciona incidente com o transporte recente.',
  ], { fontSize: 16 });
  footer(s, 'Diferenciais');

  // 11 — Ganhos
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'O que a sua consultoria ganha', '');
  bullets(s, [
    'Retém o cliente: portal white-label com a sua marca, transparência total.',
    'Escala sem inchar o time: um analista cuida de muito mais clientes.',
    'Vende mais: SLA premium, plano de saúde de integrações, suporte proativo.',
    'Prova valor: relatórios em R$ e SLA que justificam (e aumentam) o contrato.',
    'Diferencia a proposta: chega na concorrência com plataforma, não com planilha.',
  ], { fontSize: 16 });
  footer(s, 'Ganhos');

  // 12 — Planos
  s = p.addSlide(); bg(s); accentBar(s); title(s, 'Planos', 'Comece pequeno, cresça com a carteira');
  const planos = (d.plans || []).slice(0, 4);
  if (planos.length) {
    const rows = [[
      { text: 'Plano', options: { bold: true, color: C.white, fill: { color: C.purple } } },
      { text: 'Preço/mês', options: { bold: true, color: C.white, fill: { color: C.purple } } },
      { text: 'Inclui', options: { bold: true, color: C.white, fill: { color: C.purple } } },
    ]];
    planos.forEach((pl) => {
      const price = pl.priceCents != null ? brl(pl.priceCents) : (pl.price != null ? `R$ ${pl.price}` : '—');
      const inc = pl.description || `${pl.maxIntegrations ?? '—'} integrações · ${pl.maxUsers ?? '—'} usuários`;
      rows.push([
        { text: pl.name || pl.key || '—', options: { color: C.text } },
        { text: price, options: { color: C.cyanL, bold: true } },
        { text: String(inc).slice(0, 80), options: { color: C.muted, fontSize: 11 } },
      ]);
    });
    s.addTable(rows, { x: 0.8, y: 2.2, w: W - 1.6, color: C.text, fontFace: FONT, fontSize: 14, border: { type: 'solid', color: C.line, pt: 1 }, fill: { color: C.card }, rowH: 0.55, valign: 'middle' });
  } else {
    s.addText('Planos em saplink.com.br', { x: 0.8, y: 3, w: 8, h: 0.5, fontSize: 16, color: C.muted, fontFace: FONT });
  }
  s.addText('+ add-ons por integração e por usuário · 14 dias de trial', { x: 0.8, y: 6.3, w: W - 1.6, h: 0.4, fontSize: 13, color: C.muted, fontFace: FONT });
  footer(s, 'Planos');

  // 13 — CTA
  s = p.addSlide(); bg(s);
  s.addShape(p.ShapeType.rect, { x: 0, y: 3.2, w: W, h: 1.1, fill: { color: C.purple } });
  s.addText('Pare de apagar incêndio. Comece a operar.', { x: 0.8, y: 3.35, w: W - 1.6, h: 0.8, fontSize: 26, bold: true, color: C.white, align: 'center', fontFace: FONT });
  s.addText('saplink.com.br  ·  comece o trial hoje', { x: 0.8, y: 4.7, w: W - 1.6, h: 0.6, fontSize: 18, color: C.cyanL, align: 'center', fontFace: FONT });

  return p;
}

// =====================================================================
// PDF
// =====================================================================
function buildPdf(d, file) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const stream = fs.createWriteStream(file);
    doc.pipe(stream);
    const P = { w: 595, h: 842, m: 50 };
    const hx = (h) => `#${h}`;

    const cover = () => {
      doc.rect(0, 0, P.w, P.h).fill(hx(C.bg));
      doc.rect(0, 0, P.w, 8).fill(hx(C.purple));
      doc.rect(0, 8, P.w, 4).fill(hx(C.cyan));
      doc.fillColor(hx(C.white)).font('Helvetica-Bold').fontSize(40).text('◆ SAPLINK', P.m, 300);
      doc.fillColor(hx(C.purpleL)).font('Helvetica').fontSize(16).text('Plataforma de operação de integrações SAP para consultorias', P.m, 360, { width: P.w - P.m * 2 });
      doc.fillColor(hx(C.muted)).fontSize(12).text('Relatório comercial · Monitora · Prevê · Corrige · Prova valor em R$', P.m, 400);
      doc.fillColor(hx(C.cyanL)).fontSize(12).text('saplink.com.br', P.m, P.h - 70);
    };
    let y = 0;
    const page = () => { doc.addPage(); doc.rect(0, 0, P.w, P.h).fill(hx(C.bg)); doc.rect(0, 0, P.w, 6).fill(hx(C.purple)); y = 60; };
    const h2 = (t) => { doc.fillColor(hx(C.white)).font('Helvetica-Bold').fontSize(20).text(t, P.m, y); y += 30; };
    const sub = (t) => { doc.fillColor(hx(C.purpleL)).font('Helvetica').fontSize(12).text(t, P.m, y); y += 24; };
    const bullet = (t) => { doc.fillColor(hx(C.text)).font('Helvetica').fontSize(11.5).text('•  ' + t, P.m + 6, y, { width: P.w - P.m * 2 - 6 }); y = doc.y + 8; };
    const kpiGrid = (cards) => {
      const n = cards.length, gap = 12, cw = (P.w - P.m * 2 - gap * (n - 1)) / n;
      cards.forEach((c, i) => {
        const x = P.m + i * (cw + gap);
        doc.roundedRect(x, y, cw, 78, 8).fill(hx(C.card));
        doc.fillColor(hx(c.color || C.cyanL)).font('Helvetica-Bold').fontSize(20).text(c.v, x, y + 16, { width: cw, align: 'center' });
        doc.fillColor(hx(C.muted)).font('Helvetica').fontSize(8.5).text(c.l, x + 4, y + 50, { width: cw - 8, align: 'center' });
      });
      y += 98;
    };

    cover();

    page(); h2('O problema'); sub('A operação reativa custa cliente e margem');
    ['Integrações SAP quebram em silêncio — IDoc travado, fila parada, RFC caída.',
      'O cliente descobre antes de você. Erosão de confiança.',
      'O time apaga incêndio, sem visão única da carteira.',
      'Difícil provar valor — e justificar o contrato.',
      'Cada cliente novo sobrecarrega o mesmo time. Não escala.'].forEach(bullet);
    y += 14; h2('A solução: SAPLINK'); sub('De monitor a plataforma autônoma de operação');
    ['Visão única multi-cliente da saúde das integrações SAP.',
      'Cockpit de IDoc/filas e remediação com aprovação + log.',
      'IA que diagnostica, sugere a Nota SAP e corrige na plataforma.',
      'SLA por cliente e impacto das paradas em R$.',
      'Portal white-label para o cliente final.'].forEach(bullet);

    page(); h2('Evidência — carteira'); sub('Dados reais de uma operação no SAPLINK');
    kpiGrid([
      { v: String(d.clients), l: 'Clientes', color: C.white },
      { v: String(d.integrations), l: 'Integrações', color: C.cyanL },
      { v: String(d.alerts), l: 'Alertas', color: C.amber },
      { v: `${d.avgHealth}`, l: 'Health médio', color: C.purpleL },
      { v: `${d.slaOverall}%`, l: 'SLA', color: C.emerald },
    ]);
    y += 10; h2('Cockpit de operação');
    kpiGrid([
      { v: String(d.cockpit.total ?? 0), l: 'Itens abertos', color: C.white },
      { v: String(d.cockpit.byKind?.IDOC ?? 0), l: 'IDocs', color: C.rose },
      { v: String((d.cockpit.byKind?.QRFC ?? 0) + (d.cockpit.byKind?.TRFC ?? 0)), l: 'Filas', color: C.amber },
      { v: String(d.cockpit.remediable ?? 0), l: 'Remediáveis', color: C.emerald },
    ]);
    y += 10; h2('SLA & impacto em R$'); sub('A conversa que o C-level entende');
    kpiGrid([
      { v: `${d.slaOverall}%`, l: 'SLA', color: C.emerald },
      { v: brl(d.impact.riskPerHourCents ?? 0), l: 'R$/h em risco', color: C.rose },
      { v: brl(d.impact.accumulatedCents ?? 0), l: 'Exposição', color: C.amber },
      { v: String(d.impact.atRisk ?? 0), l: 'Fora do ar', color: C.rose },
    ]);

    page(); h2('Cobertura do stack moderno'); sub('CPI / Integration Suite + AIF');
    kpiGrid([
      { v: String(d.cloud.total ?? 0), l: 'Mensagens', color: C.white },
      { v: String(d.cloud.bySource?.CPI ?? 0), l: 'CPI', color: C.cyanL },
      { v: String(d.cloud.bySource?.AIF ?? 0), l: 'AIF', color: C.purpleL },
      { v: String(d.cloud.failed ?? 0), l: 'Falhas', color: C.rose },
    ]);
    doc.roundedRect(P.m, y, P.w - P.m * 2, 70, 8).dash(4, {}).strokeColor(hx(C.cyan)).stroke().undash();
    doc.fillColor(hx(C.muted)).font('Helvetica-Oblique').fontSize(10).text('[ Anexar print do SAP BTP — Integration Suite (Message Monitoring) e AIF ]', P.m + 10, y + 28, { width: P.w - P.m * 2 - 20, align: 'center' });
    y += 90;
    h2('O que ninguém mais tem');
    ['Copiloto IA sobre toda a carteira.', 'Digest semanal narrado por IA (white-label).',
      'SAP Notes sugeridas no diagnóstico.', 'Radar de validade (certs/segredos).',
      'Previsão de falha + benchmark vs mercado.', 'Radar de transports (STMS).'].forEach(bullet);

    page(); h2('O que a sua consultoria ganha');
    ['Retém o cliente com portal white-label.', 'Escala sem inchar o time.',
      'Vende SLA premium e suporte proativo.', 'Prova valor em R$ e SLA.',
      'Diferencia a proposta com plataforma, não planilha.'].forEach(bullet);
    y += 20;
    doc.roundedRect(P.m, y, P.w - P.m * 2, 80, 8).fill(hx(C.purple));
    doc.fillColor(hx(C.white)).font('Helvetica-Bold').fontSize(16).text('Pare de apagar incêndio. Comece a operar.', P.m, y + 22, { width: P.w - P.m * 2, align: 'center' });
    doc.fillColor(hx(C.white)).font('Helvetica').fontSize(12).text('saplink.com.br · comece o trial hoje', P.m, y + 48, { width: P.w - P.m * 2, align: 'center' });

    doc.end();
    stream.on('finish', resolve);
  });
}

// =====================================================================
(async () => {
  const d = await collect();
  console.log('Dados:', JSON.stringify(d).slice(0, 300), '...');

  const pptx = buildPptx(d);
  const pptxFile = path.join(OUT, 'SAPLINK-apresentacao-vendas.pptx');
  await pptx.writeFile({ fileName: pptxFile });
  console.log('✓ PPTX:', pptxFile);

  const pdfFile = path.join(OUT, 'SAPLINK-relatorio-comercial.pdf');
  await buildPdf(d, pdfFile);
  console.log('✓ PDF :', pdfFile);
})().catch((e) => { console.error('ERRO:', e); process.exit(1); });
