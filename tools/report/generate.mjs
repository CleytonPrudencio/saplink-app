// Gerador da apresentação de vendas (PPTX) + relatório (PDF) do SAPLINK — v3.
// Deck detalhado, profissional, com visualizações desenhadas à mão (sem gráficos
// nativos → sem aviso de reparo no PowerPoint). Dados reais da API.
//   node generate.mjs   |   API=... EMAIL=... PASSWORD=... node generate.mjs
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

const C = {
  bg: '0F0B1A', bg2: '15101F', card: '1A1527', card2: '211A33', line: '2A2440', line2: '3A3358',
  text: 'E2E0EA', muted: '9B95AD', dim: '6B6580',
  purple: '7C3AED', purpleL: 'A78BFA', cyan: '06B6D4', cyanL: '22D3EE',
  rose: 'F87171', emerald: '34D399', amber: 'FBBF24', orange: 'FB923C', white: 'FFFFFF',
};
const FONT = 'Segoe UI';
const brl = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

async function api(token, p) {
  const r = await fetch(`${API}${p}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!r.ok) throw new Error(`${p} -> HTTP ${r.status}`);
  return r.json();
}
async function safe(fn, fb) { try { return await fn(); } catch (e) { console.warn('  (aviso)', e.message); return fb; } }

async function collect() {
  console.log('Coletando dados de', API);
  const login = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: EMAIL, password: PASSWORD }) }).then((r) => r.json());
  const token = login.token;
  if (!token) throw new Error('login falhou');
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
  const avgHealth = clients.length ? Math.round(clients.reduce((s, c) => s + (c.healthScore || 0), 0) / clients.length) : 0;
  return {
    clientList: clients.map((c) => ({ name: c.name, health: c.healthScore || 0, integr: c.integrationCount || (c.integrations?.length ?? 0) })),
    clients: clients.length, integrations, avgHealth,
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
  p.defineLayout({ name: 'W', width: 13.333, height: 7.5 });
  p.layout = 'W';
  p.author = 'SAPLINK'; p.company = 'SAPLINK'; p.title = 'SAPLINK — Apresentação comercial';
  const W = 13.333, H = 7.5, MX = 0.65;
  const R = p.ShapeType;

  // ---------- helpers ----------
  const txt = (s, t, o) => s.addText(t, { fontFace: FONT, ...o });
  const rect = (s, x, y, w, h, fill, o = {}) => s.addShape(R.rect, { x, y, w, h, fill: fill ? { color: fill } : undefined, ...o });
  const rrect = (s, x, y, w, h, fill, line, rad = 0.09) => s.addShape(R.roundRect, { x, y, w, h, rectRadius: rad, fill: fill ? { color: fill } : { type: 'none' }, line: line ? { color: line, width: 1 } : { type: 'none' } });
  const ell = (s, x, y, w, h, fill, line) => s.addShape(R.ellipse, { x, y, w, h, fill: fill ? { color: fill } : { type: 'none' }, line: line ? { color: line.color, width: line.width } : { type: 'none' } });

  let pageNo = 0;
  const base = (s) => { s.background = { color: C.bg }; };
  const chrome = (s, kicker, title) => {
    pageNo++;
    rect(s, 0, 0, 0.16, H, C.purple);
    rect(s, 0.16, 0, 0.05, H, C.cyan);
    if (kicker) txt(s, kicker.toUpperCase(), { x: MX, y: 0.4, w: 9, h: 0.3, fontSize: 11, bold: true, color: C.cyanL, charSpacing: 2 });
    if (title) txt(s, title, { x: MX, y: 0.72, w: W - MX * 2, h: 0.9, fontSize: 28, bold: true, color: C.white });
    txt(s, '◆ SAPLINK', { x: W - 2.6, y: 0.4, w: 2.0, h: 0.3, fontSize: 11, bold: true, color: C.purpleL, align: 'right' });
    rect(s, MX, H - 0.5, W - MX * 2, 0.012, C.line);
    txt(s, 'saplink.com.br', { x: MX, y: H - 0.46, w: 4, h: 0.3, fontSize: 9, color: C.dim });
    txt(s, String(pageNo).padStart(2, '0'), { x: W - 1.1, y: H - 0.46, w: 0.6, h: 0.3, fontSize: 9, color: C.dim, align: 'right' });
  };
  const newSlide = (kicker, title) => { const s = p.addSlide(); base(s); chrome(s, kicker, title); return s; };

  // divider
  const divider = (num, title, sub) => {
    const s = p.addSlide(); base(s);
    rect(s, 0, 0, W * 0.42, H, C.purple);
    rect(s, W * 0.42, 0, 0.06, H, C.cyan);
    txt(s, num, { x: 0.8, y: 2.2, w: 4, h: 2, fontSize: 130, bold: true, color: 'FFFFFF', transparency: 80 });
    txt(s, title, { x: W * 0.42 + 0.7, y: 2.7, w: W * 0.55, h: 1, fontSize: 34, bold: true, color: C.white });
    if (sub) txt(s, sub, { x: W * 0.42 + 0.72, y: 3.7, w: W * 0.5, h: 1.4, fontSize: 16, color: C.muted });
    txt(s, '◆ SAPLINK', { x: 0.8, y: 6.6, w: 4, h: 0.3, fontSize: 12, bold: true, color: 'FFFFFF' });
    return s;
  };

  // KPI cards
  const kpiRow = (s, cards, y, x0 = MX, totalW = W - MX * 2, h = 1.55) => {
    const n = cards.length, gap = 0.22, cw = (totalW - gap * (n - 1)) / n;
    cards.forEach((c, i) => {
      const x = x0 + i * (cw + gap);
      rrect(s, x, y, cw, h, C.card, C.line);
      rect(s, x, y, cw, 0.07, c.color || C.cyanL);
      txt(s, c.v, { x: x + 0.05, y: y + 0.28, w: cw - 0.1, h: 0.7, fontSize: c.fs || 26, bold: true, color: c.color || C.cyanL, align: 'center' });
      txt(s, c.l, { x: x + 0.08, y: y + h - 0.55, w: cw - 0.16, h: 0.5, fontSize: 10.5, color: C.muted, align: 'center', valign: 'top' });
    });
  };
  // horizontal bars
  const hbars = (s, x, y, w, items, o = {}) => {
    const rowH = o.rowH || 0.4, gap = o.gap || 0.16, labelW = o.labelW || 2.4, valW = 0.65;
    const barMax = w - labelW - valW;
    const max = Math.max(1, ...items.map((i) => i.value));
    items.forEach((it, i) => {
      const ry = y + i * (rowH + gap);
      txt(s, it.label, { x, y: ry, w: labelW - 0.12, h: rowH, fontSize: 11, color: C.text, valign: 'middle' });
      rrect(s, x + labelW, ry + rowH * 0.2, barMax, rowH * 0.55, C.line, null, 0.04);
      const bw = Math.max(0.06, (it.value / max) * barMax);
      rrect(s, x + labelW, ry + rowH * 0.2, bw, rowH * 0.55, it.color || C.purple, null, 0.04);
      txt(s, String(it.value), { x: x + labelW + barMax + 0.08, y: ry, w: valW, h: rowH, fontSize: 11, bold: true, color: C.text, valign: 'middle' });
    });
  };
  // progress (percent)
  const progress = (s, x, y, w, pct, color, label) => {
    txt(s, `${pct}%`, { x, y: y - 0.5, w, h: 0.5, fontSize: 24, bold: true, color });
    rrect(s, x, y, w, 0.22, C.line, null, 0.11);
    rrect(s, x, y, Math.max(0.1, w * Math.min(100, pct) / 100), 0.22, color, null, 0.11);
    if (label) txt(s, label, { x, y: y + 0.3, w, h: 0.4, fontSize: 10, color: C.muted });
  };
  // feature column
  const feat = (s, x, y, w, heading, items, color) => {
    txt(s, heading, { x, y, w, h: 0.32, fontSize: 11.5, bold: true, color, charSpacing: 1 });
    txt(s, items.map((t) => ({ text: t, options: { bullet: { code: '2022', indent: 13 }, color: C.text, fontSize: 12.5, paraSpaceAfter: 6, fontFace: FONT } })),
      { x, y: y + 0.38, w, h: o_h(items), valign: 'top' });
  };
  const o_h = (items) => Math.max(1, items.length * 0.42 + 0.3);
  // big paragraph
  const lead = (s, t, x, y, w, fs = 14) => txt(s, t, { x, y, w, h: 1.2, fontSize: fs, color: C.text, valign: 'top', lineSpacingMultiple: 1.1 });

  // mock "janela" do produto (painel ilustrativo à esquerda)
  const mockPanel = (s, x, y, w, h, spec) => {
    rrect(s, x, y, w, h, C.card, C.line);
    // top bar
    rrect(s, x, y, w, 0.5, C.card2, null, 0.09);
    ell(s, x + 0.22, y + 0.19, 0.13, 0.13, C.rose); ell(s, x + 0.42, y + 0.19, 0.13, 0.13, C.amber); ell(s, x + 0.62, y + 0.19, 0.13, 0.13, C.emerald);
    txt(s, spec.title || 'SAPLINK', { x: x + 0.9, y: y + 0.06, w: w - 1.1, h: 0.38, fontSize: 11.5, bold: true, color: C.muted, valign: 'middle' });
    const rows = spec.rows || [];
    const ry0 = y + 0.75, rh = Math.min(0.62, (h - 1.0) / Math.max(1, rows.length));
    rows.forEach((r, i) => {
      const ry = ry0 + i * rh;
      rrect(s, x + 0.25, ry, w - 0.5, rh - 0.12, C.bg2, null, 0.05);
      txt(s, r.l, { x: x + 0.42, y: ry, w: w - 1.0 - (r.r ? 1.6 : 0), h: rh - 0.12, fontSize: 11, color: C.text, valign: 'middle' });
      if (r.sub) txt(s, r.sub, { x: x + 0.42, y: ry + (rh - 0.12) * 0.5, w: w - 1.0, h: (rh - 0.12) * 0.5, fontSize: 8.5, color: C.dim, valign: 'middle' });
      if (r.r) { rrect(s, x + w - 1.7, ry + (rh - 0.12 - 0.3) / 2, 1.4, 0.3, null, r.c || C.line, 0.05); txt(s, r.r, { x: x + w - 1.7, y: ry + (rh - 0.12 - 0.3) / 2, w: 1.4, h: 0.3, fontSize: 9, bold: true, color: r.c || C.muted, align: 'center', valign: 'middle' }); }
    });
  };

  // Standard module slide: left mock panel, right text (O QUE FAZ / RECURSOS / PONTOS FORTES)
  const moduleSlide = (kicker, title, opts) => {
    const s = newSlide(kicker, title);
    if (opts.mock) mockPanel(s, MX, 1.9, 5.9, 4.5, opts.mock);
    const colX = 7.0, colW = W - colX - MX;
    if (opts.lead) lead(s, opts.lead, colX, 1.85, colW, 13.5);
    let fy = opts.lead ? 3.15 : 1.9;
    if (opts.recursos) { feat(s, colX, fy, colW, 'RECURSOS', opts.recursos, C.cyanL); fy += o_h(opts.recursos) + 0.3; }
    if (opts.fortes) { feat(s, colX, fy, colW, 'PONTOS FORTES', opts.fortes, C.emerald); }
    return s;
  };

  // ============ SLIDES ============
  // 1 — CAPA
  let s = p.addSlide(); base(s);
  rect(s, 0, 0, W, 0.24, C.purple); rect(s, 0, 0.24, W, 0.08, C.cyan);
  txt(s, '◆ SAPLINK', { x: 0.8, y: 2.1, w: W - 1.6, h: 1.2, fontSize: 64, bold: true, color: C.white });
  txt(s, 'A plataforma de operação de integrações SAP para consultorias', { x: 0.82, y: 3.4, w: 10.5, h: 0.7, fontSize: 23, color: C.purpleL });
  txt(s, 'Monitora   ·   Prevê   ·   Corrige   ·   Prova valor em R$', { x: 0.82, y: 4.15, w: 10.5, h: 0.5, fontSize: 15, color: C.muted });
  const capaK = [[`${d.clients}`, 'clientes'], [`${d.integrations}`, 'integrações SAP'], [`${d.avgHealth}`, 'health médio'], [`${d.catalog.total ?? 0}`, 'interfaces']];
  capaK.forEach((k, i) => { const x = 0.8 + i * 2.45; rrect(s, x, 5.3, 2.25, 1.05, C.card, C.line); txt(s, k[0], { x, y: 5.45, w: 2.25, h: 0.55, fontSize: 24, bold: true, color: C.cyanL, align: 'center' }); txt(s, k[1], { x, y: 6.0, w: 2.25, h: 0.3, fontSize: 10, color: C.muted, align: 'center' }); });
  txt(s, 'Apresentação comercial', { x: W - 3.8, y: 6.7, w: 3.3, h: 0.3, fontSize: 12, color: C.dim, align: 'right' });

  // 2 — AGENDA
  s = newSlide('Agenda', 'O que você vai ver');
  const ag = [
    ['01', 'O cenário', 'Por que a operação reativa de integrações SAP custa cliente e margem'],
    ['02', 'A plataforma', 'O que o SAPLINK é, como funciona e o mapa de funcionalidades'],
    ['03', 'Em ação', 'Cada tela e capacidade — dashboard, cockpit, IA, SLA, R$, CPI/AIF'],
    ['04', 'O retorno', 'Diferenciais, ganhos para a consultoria, segurança, planos e início'],
  ];
  ag.forEach((a, i) => {
    const y = 2.0 + i * 1.12;
    rrect(s, MX, y, W - MX * 2, 0.95, C.card, C.line);
    rect(s, MX, y, 0.07, 0.95, C.purple);
    txt(s, a[0], { x: MX + 0.2, y, w: 1.0, h: 0.95, fontSize: 30, bold: true, color: C.purpleL, align: 'center', valign: 'middle' });
    txt(s, a[1], { x: MX + 1.3, y, w: 3.4, h: 0.95, fontSize: 18, bold: true, color: C.white, valign: 'middle' });
    txt(s, a[2], { x: MX + 4.8, y, w: W - MX * 2 - 5.0, h: 0.95, fontSize: 13, color: C.muted, valign: 'middle' });
  });

  // ===== PARTE 1 =====
  divider('01', 'O cenário', 'A integração é o sistema nervoso do SAP — e hoje ela é operada no escuro.');

  // 3 — Por que importa
  s = newSlide('O cenário', 'Integração SAP é crítica — e frágil');
  lead(s, 'Pedidos, notas fiscais, estoque, pagamentos: tudo trafega por integrações (IDoc, RFC, OData, CPI, AIF). Quando uma para, o processo de negócio para junto — e o relógio do prejuízo começa.', MX, 1.8, W - MX * 2, 15);
  kpiRow(s, [
    { v: 'IDoc / RFC', l: 'EDI, ALE, BAPIs — o clássico que ainda roda o core', color: C.cyanL, fs: 18 },
    { v: 'OData / REST', l: 'Fiori, apps, parceiros e APIs externas', color: C.purpleL, fs: 18 },
    { v: 'CPI / AIF', l: 'Integration Suite e Application Interface Framework', color: C.emerald, fs: 18 },
  ], 3.1, MX, W - MX * 2, 1.7);
  lead(s, 'O problema não é falta de SAP — é falta de uma camada de operação que enxergue, antecipe e resolva, multi-cliente, com prova de valor.', MX, 5.4, W - MX * 2, 15);

  // 4 — A dor
  s = newSlide('O cenário', 'O dia a dia da consultoria SAP');
  const dores = [
    ['Quebra silenciosa', 'IDoc travado, fila parada, RFC caída — ninguém vê até o cliente ligar.'],
    ['Cliente descobre antes', 'A consultoria perde a narrativa e a confiança no mesmo telefonema.'],
    ['Apaga-incêndio', 'Time reativo, sem visão única, caçando transação cliente a cliente.'],
    ['Valor invisível', 'Difícil provar o que foi entregue — e justificar o contrato.'],
    ['Não escala', 'Cada cliente novo pesa no mesmo time. Margem corroída.'],
    ['Stack fragmentado', 'Clássico + Cloud (CPI/AIF) sem um painel comum.'],
  ];
  dores.forEach((b, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = MX + col * 4.05, y = 2.0 + row * 2.25;
    rrect(s, x, y, 3.8, 2.0, C.card, C.line);
    rect(s, x, y, 3.8, 0.07, C.rose);
    txt(s, b[0], { x: x + 0.22, y: y + 0.22, w: 3.4, h: 0.5, fontSize: 15.5, bold: true, color: C.rose });
    txt(s, b[1], { x: x + 0.22, y: y + 0.78, w: 3.4, h: 1.1, fontSize: 12.5, color: C.text, valign: 'top' });
  });

  // 5 — Custo do reativo
  s = newSlide('O cenário', 'O custo de operar no escuro');
  kpiRow(s, [
    { v: brl(d.impact.riskPerHourCents ?? 0), l: 'em risco por hora parada (carteira exemplo)', color: C.rose },
    { v: brl(d.impact.accumulatedCents ?? 0), l: 'exposição acumulada estimada', color: C.amber },
    { v: `${d.slaOverall}%`, l: 'SLA real medido — o que não se mede, não se cobra', color: C.cyanL },
  ], 2.0, MX, W - MX * 2, 1.7);
  rrect(s, MX, 4.0, W - MX * 2, 2.5, C.bg2, C.rose);
  txt(s, 'Cada hora de integração parada é processo de negócio parado.', { x: MX + 0.3, y: 4.25, w: W - MX * 2 - 0.6, h: 0.6, fontSize: 18, bold: true, color: C.white });
  lead(s, 'Faturamento que não sai, pedido que não entra, estoque que diverge. Sem número, vira “sensação”. Com o SAPLINK, vira R$ — e o R$ justifica o contrato, sustenta o SLA premium e segura o cliente.', MX + 0.3, 5.0, W - MX * 2 - 0.6, 15);

  // ===== PARTE 2 =====
  divider('02', 'A plataforma', 'De monitor passivo a plataforma de operação autônoma — com moat de dados.');

  // 6 — O que é
  s = newSlide('A plataforma', 'O que é o SAPLINK');
  lead(s, 'Uma plataforma SaaS multi-cliente que dá à consultoria uma camada única de operação sobre todas as integrações SAP dos seus clientes — do IDoc clássico ao CPI/AIF moderno.', MX, 1.8, W - MX * 2, 16);
  const pil = [
    ['ENXERGA', 'Saúde de todas as integrações em tempo real, multi-cliente, num só painel.', C.cyanL],
    ['RESOLVE', 'Cockpit de IDoc/filas + remediação autônoma com aprovação e log. O agente AGE no SAP.', C.purpleL],
    ['PROVA', 'SLA por cliente, impacto em R$ e relatórios narrados por IA. Valor mensurável.', C.emerald],
  ];
  pil.forEach((b, i) => {
    const x = MX + i * 4.05, y = 3.0;
    rrect(s, x, y, 3.8, 3.3, C.card, C.line);
    rect(s, x, y, 3.8, 0.1, b[2]);
    txt(s, b[0], { x: x + 0.25, y: y + 0.35, w: 3.3, h: 0.6, fontSize: 20, bold: true, color: b[2], charSpacing: 1 });
    txt(s, b[1], { x: x + 0.25, y: y + 1.1, w: 3.3, h: 2.0, fontSize: 14, color: C.text, valign: 'top' });
  });

  // 7 — Arquitetura
  s = newSlide('A plataforma', 'Arquitetura — seguro por design');
  const arch = [
    ['1 · Agente on-premise', 'Roda no ambiente do cliente. Lê IDoc / RFC / filas / STMS / CPI / AIF e só faz saída HTTPS, autenticada por token.', C.cyanL],
    ['2 · Plataforma SAPLINK', 'Multi-tenant na nuvem. Correlaciona, calcula SLA e R$, prevê falhas e orquestra remediação.', C.purpleL],
    ['3 · Sua consultoria', 'Dashboards, on-call multicanal, tickets, SLA e portal white-label por cliente.', C.emerald],
  ];
  arch.forEach((b, i) => {
    const x = MX + i * 4.25, y = 2.2;
    rrect(s, x, y, 3.7, 2.8, C.card, b[2]);
    txt(s, b[0], { x: x + 0.22, y: y + 0.25, w: 3.3, h: 0.6, fontSize: 16, bold: true, color: b[2] });
    txt(s, b[1], { x: x + 0.22, y: y + 0.95, w: 3.3, h: 1.7, fontSize: 12.5, color: C.text, valign: 'top' });
    if (i < 2) txt(s, '→', { x: x + 3.72, y: y + 1.0, w: 0.5, h: 0.6, fontSize: 30, color: C.purpleL, align: 'center' });
  });
  rrect(s, MX, 5.4, W - MX * 2, 1.1, C.bg2, C.line);
  txt(s, [{ text: 'Conformidade:  ', options: { bold: true, color: C.emerald } }, { text: 'o cliente nunca abre porta de entrada na rede. Todo tráfego é de saída (HTTPS), autenticado por token por integração. Sem VPN obrigatória, sem firewall reconfigurado.', options: { color: C.text } }], { x: MX + 0.3, y: 5.6, w: W - MX * 2 - 0.6, h: 0.8, fontSize: 13.5, valign: 'middle', fontFace: FONT });

  // 8 — Mapa de funcionalidades
  s = newSlide('A plataforma', 'Mapa de funcionalidades');
  const mods = [
    ['Dashboard', 'Saúde da carteira'], ['Cockpit', 'IDoc & filas'], ['Remediação', 'Ação com aprovação'],
    ['Catálogo', 'Interfaces vivas'], ['Diagnóstico IA', '+ SAP Notes'], ['Copiloto IA', 'Pergunte à carteira'],
    ['Digest IA', 'Resumo semanal'], ['Radar validade', 'Certs & segredos'], ['On-call', 'Slack/Teams/e-mail'],
    ['Tickets', 'Jira/ServiceNow'], ['Portal cliente', 'White-label'], ['SLA', 'Por cliente + IA'],
    ['Impacto R$', 'Exposição'], ['Transports', 'STMS correlacionado'], ['Previsão', 'Risco de falha'],
    ['Benchmark', 'vs mercado'], ['CPI', 'Integration Suite'], ['AIF', 'App Interface FW'],
  ];
  mods_grid(s, mods);
  function mods_grid(sl, items) {
    const cols = 6, gap = 0.18, cw = (W - MX * 2 - gap * (cols - 1)) / cols, ch = 1.15;
    items.forEach((m, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = MX + col * (cw + gap), y = 2.0 + row * (ch + gap);
      rrect(sl, x, y, cw, ch, C.card, C.line);
      txt(sl, m[0], { x: x + 0.08, y: y + 0.18, w: cw - 0.16, h: 0.45, fontSize: 12.5, bold: true, color: C.cyanL, align: 'center' });
      txt(sl, m[1], { x: x + 0.06, y: y + 0.62, w: cw - 0.12, h: 0.45, fontSize: 9.5, color: C.muted, align: 'center', valign: 'top' });
    });
  }

  // ===== PARTE 3 =====
  divider('03', 'A plataforma em ação', 'Cada capacidade, com dados reais da carteira monitorada.');

  // 9 — Dashboard / carteira
  s = newSlide('Em ação · Visão geral', 'Dashboard — a carteira num relance');
  kpiRow(s, [
    { v: String(d.clients), l: 'Clientes', color: C.white },
    { v: String(d.integrations), l: 'Integrações', color: C.cyanL },
    { v: `${d.avgHealth}`, l: 'Health médio', color: C.purpleL },
    { v: `${d.slaOverall}%`, l: 'SLA compliance', color: d.slaOverall >= 90 ? C.emerald : C.amber },
  ], 1.85, MX, 6.0, 1.5);
  rrect(s, MX, 3.6, 6.0, 3.0, C.card, C.line);
  txt(s, 'Health score por cliente', { x: MX + 0.25, y: 3.75, w: 5.5, h: 0.4, fontSize: 12, bold: true, color: C.muted });
  hbars(s, MX + 0.25, 4.3, 5.5, (d.clientList.length ? d.clientList : [{ name: '-', health: 0 }]).map((c) => ({ label: c.name, value: c.health, color: c.health >= 80 ? C.emerald : c.health >= 50 ? C.amber : C.rose })), { labelW: 2.6 });
  feat(s, 7.0, 1.9, W - 7.0 - MX, 'O QUE FAZ', ['Consolida saúde, alertas e score de todos os clientes.', 'Anéis de health por cliente, alertas recentes ao vivo.'], C.cyanL);
  feat(s, 7.0, 3.6, W - 7.0 - MX, 'PONTOS FORTES', ['Uma tela responde "como está tudo?" em 5 segundos.', 'Prioriza onde agir — sem abrir 1 SAP por vez.', 'Multi-cliente nativo: a visão que a consultoria nunca teve.'], C.emerald);

  // 10 — Cockpit
  const ck = d.cockpit;
  s = newSlide('Em ação · Operação', 'Cockpit de IDoc & filas');
  rrect(s, MX, 1.85, 6.0, 2.0, C.card, C.line);
  txt(s, 'Itens operacionais abertos, por tipo', { x: MX + 0.25, y: 1.98, w: 5.5, h: 0.4, fontSize: 12, bold: true, color: C.muted });
  hbars(s, MX + 0.25, 2.45, 5.5, [
    { label: 'IDoc (BD87)', value: ck.byKind?.IDOC ?? 0, color: C.rose },
    { label: 'qRFC (SMQ1/2)', value: ck.byKind?.QRFC ?? 0, color: C.amber },
    { label: 'tRFC (SM58)', value: ck.byKind?.TRFC ?? 0, color: C.orange },
  ], { labelW: 2.6, rowH: 0.36 });
  kpiRow(s, [{ v: String(ck.total ?? 0), l: 'itens em erro', color: C.white }, { v: String(ck.remediable ?? 0), l: 'remediáveis', color: C.emerald }, { v: String(ck.queueDepth ?? 0), l: 'profundidade fila', color: C.amber }], 4.1, MX, 6.0, 1.4);
  feat(s, 7.0, 1.85, W - 7.0 - MX, 'O QUE FAZ', ['Unifica BD87 + SMQ1/2 + SM58, multi-cliente, com filtros.', 'Mostra status real (51/56/64, SYSFAIL, CPICERR…).'], C.cyanL);
  feat(s, 7.0, 3.5, W - 7.0 - MX, 'RECURSOS', ['Filtro por cliente, tipo, status e busca livre.', 'Contadores por severidade e profundidade de fila.'], C.purpleL);
  feat(s, 7.0, 5.15, W - 7.0 - MX, 'PONTOS FORTES', ['O que exigia abrir vários SAPs vira uma tela.', 'Cada item já vem com ação de remediação.'], C.emerald);

  // 11 — Remediação
  s = newSlide('Em ação · Operação', 'Remediação autônoma — com governança');
  const flow = ['Detecta', 'Solicita', 'Admin aprova', 'Agente executa', 'Resolve + log'];
  flow.forEach((f, i) => {
    const x = MX + i * 2.42; rrect(s, x, 1.9, 2.2, 0.85, C.card, i === 2 ? C.amber : C.purple);
    txt(s, f, { x, y: 1.9, w: 2.2, h: 0.85, fontSize: 13, bold: true, color: C.white, align: 'center', valign: 'middle' });
    if (i < flow.length - 1) txt(s, '→', { x: x + 2.18, y: 1.9, w: 0.28, h: 0.85, fontSize: 18, color: C.purpleL, align: 'center', valign: 'middle' });
  });
  feat(s, MX, 3.2, 5.9, 'O QUE FAZ', ['Reprocessa IDoc (RBDMANI2/BD87).', 'Destrava fila qRFC (SMQ2).', 'Reexecuta tRFC (SM58) e reativa destino (SM59).'], C.cyanL);
  feat(s, 7.0, 3.2, W - 7.0 - MX, 'PONTOS FORTES', ['Nada roda no SAP sem aprovação do admin.', 'Log de antes/depois — auditoria completa.', 'Comando puxado pelo agente: zero porta de entrada.', 'Sai de "monitorar" para efetivamente "resolver".'], C.emerald);

  // 12 — Catálogo
  moduleSlide('Em ação · Conhecimento', 'Catálogo vivo de interfaces', {
    mock: { title: 'Catálogo · interfaces', rows: [
      { l: 'LS_ECCCLNT100', sub: 'Parceiro (WE20)', r: 'ATIVO', c: C.emerald },
      { l: 'PI_PROD', sub: 'Destino RFC (SM59)', r: 'ATIVO', c: C.emerald },
      { l: 'ORDERS05', sub: 'Message type', r: 'ATIVO', c: C.emerald },
      { l: 'API_SALES_ORDER_SRV', sub: 'Serviço OData', r: 'ATIVO', c: C.emerald },
      { l: 'SAPLINK_PORT', sub: 'Porta IDoc (WE21)', r: 'ATIVO', c: C.emerald },
    ] },
    lead: `Auto-descoberta do landscape: parceiros (WE20), destinos RFC (SM59), message types, serviços OData e portas. ${d.catalog.total ?? 0} interfaces catalogadas, ${d.catalog.active ?? 0} ativas.`,
    recursos: ['Atualizado pelo agente continuamente.', 'Busca por cliente, tipo e nome.', 'Marca interfaces inativas (histórico).'],
    fortes: ['Onboarding de cliente documentado sozinho.', 'Fim do "conhecimento na cabeça do consultor".'],
  });
  // 13 — Diagnóstico IA + SAP Notes
  moduleSlide('Em ação · IA', 'Diagnóstico por IA + SAP Notes', {
    mock: { title: 'Diagnóstico IA', rows: [
      { l: 'Causa raiz identificada', r: 'IA', c: C.purpleL },
      { l: 'Passos de correção (PT-BR)', r: 'OK', c: C.emerald },
      { l: 'Nota SAP sugerida', sub: 'Componente BC-MID-ALE', r: 'BUSCAR', c: C.amber },
      { l: 'Aplicar correção', sub: 'in-platform', r: 'IA CORRIGE', c: C.cyanL },
    ] },
    lead: 'Ao detectar um erro, a IA explica a causa raiz, propõe a correção e — quando aplicável — corrige na própria plataforma. Mapeia o sintoma para a Nota SAP / KBA provável e a transação certa.',
    recursos: ['Causa raiz + passos de correção em PT-BR.', 'Botão "IA corrige" para problemas in-platform.', 'SAP Notes/KBA por componente (BC-MID-ALE, OPU-GW…).'],
    fortes: ['Reduz MTTR e dependência de especialista sênior.', 'Honesto: nunca inventa número de Nota — leva à busca oficial.'],
  });
  // 14 — Copiloto
  moduleSlide('Em ação · IA', 'Pergunte ao SAPLINK (copiloto)', {
    mock: { title: 'Pergunte à IA', rows: [
      { l: 'Quais clientes têm IDoc travado?', r: 'VOCÊ', c: C.purpleL },
      { l: 'Distribuidora Nacional: 3 IDocs em erro (ORDERS05).', r: 'IA', c: C.cyanL },
      { l: 'Onde está o maior risco agora?', r: 'VOCÊ', c: C.purpleL },
      { l: 'EDI ANTT — risco alto (uptime 0,05%).', r: 'IA', c: C.cyanL },
    ] },
    lead: 'Um chat que enxerga toda a carteira. "Quais clientes têm IDoc travado agora?", "Onde está o maior risco?" — resposta em linguagem natural, citando clientes e integrações.',
    recursos: ['Contexto = carteira inteira (clientes, métricas, alertas).', 'Respostas acionáveis com transação/passo sugerido.', 'Perguntas sugeridas para começar.'],
    fortes: ['Decisão em segundos, sem montar relatório.', 'Democratiza o conhecimento do landscape.'],
  });
  // 15 — Digest
  moduleSlide('Em ação · IA', 'Digest semanal por IA', {
    mock: { title: 'E-mail · Resumo semanal', rows: [
      { l: 'Panorama da semana', sub: 'Health médio 81, 2 clientes em atenção', r: 'IA', c: C.cyanL },
      { l: 'Pontos de atenção', sub: 'Distribuidora Nacional, EDI ANTT', r: '!', c: C.amber },
      { l: 'Recomendações', sub: '3 ações priorizadas', r: 'IA', c: C.purpleL },
      { l: 'Enviado para o gestor', r: 'AUTO', c: C.emerald },
    ] },
    lead: 'Toda semana, um resumo executivo de saúde da carteira, narrado por IA e white-label, no e-mail do gestor — panorama, pontos de atenção e recomendações.',
    recursos: ['Agendado automaticamente (janela semanal).', 'Narrativa executiva pronta para encaminhar.', 'Marca da consultoria no template.'],
    fortes: ['Presença proativa toda semana, sem esforço.', 'Mantém o cliente lembrando do valor entregue.'],
  });
  // 16 — Radar validade
  moduleSlide('Em ação · Prevenção', 'Radar de validade', {
    mock: { title: 'Radar de validade', rows: [
      { l: 'Cert TLS · gateway.cliente', sub: 'expira em 5 dias', r: 'CRÍTICO', c: C.rose },
      { l: 'Cert TLS · api.fiori', sub: 'expira em 22 dias', r: 'ATENÇÃO', c: C.amber },
      { l: 'Senha usuário RFC', sub: 'expira em 60 dias', r: 'OK', c: C.emerald },
      { l: 'Client secret OAuth', sub: 'expira em 90 dias', r: 'OK', c: C.emerald },
    ] },
    lead: 'Detecta automaticamente o vencimento de certificados TLS dos endpoints (handshake real) e registra a expiração de segredos manuais — senha RFC, client secret OAuth, certificado SNC.',
    recursos: ['Leitura real do certificado (notAfter) dos endpoints HTTPS.', 'Severidade: expirado / crítico (≤7d) / atenção (≤30d).', 'Alertas automáticos antes do vencimento.'],
    fortes: ['Evita a falha mais comum: certificado/segredo vencido.', 'Sem planilha de controle manual.'],
  });
  // 17 — On-call
  moduleSlide('Em ação · Resposta', 'On-call multicanal + escalonamento', {
    mock: { title: 'On-call', rows: [
      { l: 'Slack · #plantao-sap', sub: 'Nível 1 · ≥ Média', r: 'ATIVO', c: C.emerald },
      { l: 'Microsoft Teams', sub: 'Nível 1 · ≥ Alta', r: 'ATIVO', c: C.emerald },
      { l: 'E-mail gestor', sub: 'Nível 2 · escalonamento', r: 'ATIVO', c: C.emerald },
      { l: 'Escalar após', sub: 'sem resolução', r: '30 min', c: C.amber },
    ] },
    lead: 'Alertas vão para os canais certos — Slack, Teams, Webhook ou e-mail — e escalam para o nível 2 se não forem resolvidos no tempo definido.',
    recursos: ['Canais por nível e por severidade mínima.', 'Escalonamento automático por tempo.', 'Teste de canal com um clique.'],
    fortes: ['Plantão de verdade, sem ninguém vigiando tela.', 'Acaba o "ninguém viu o alerta".'],
  });
  // 18 — Tickets
  moduleSlide('Em ação · Resposta', 'Ticket sync — Jira / ServiceNow', {
    mock: { title: 'Tickets', rows: [
      { l: 'SAP-1421 · IDoc ORDERS05 em erro', sub: 'Jira', r: 'ABERTO', c: C.amber },
      { l: 'INC0012 · Fila qRFC travada', sub: 'ServiceNow', r: 'ABERTO', c: C.amber },
      { l: 'SAP-1410 · RFC restabelecida', sub: 'Jira', r: 'FECHADO', c: C.emerald },
      { l: 'Abertura/fechamento', sub: 'automático por severidade', r: 'AUTO', c: C.cyanL },
    ] },
    lead: 'Cada alerta relevante vira chamado automaticamente no Jira ou ServiceNow e fecha sozinho quando o problema é resolvido. Credenciais cifradas.',
    recursos: ['Abre incident/issue via REST com severidade mapeada.', 'Fecha/encerra ao resolver o alerta.', 'Limite por severidade configurável.'],
    fortes: ['Integra ao processo de ITSM que o cliente já usa.', 'Rastreabilidade e SLA na ferramenta do cliente.'],
  });
  // 19 — Portal
  moduleSlide('Em ação · Cliente', 'Portal do cliente final (white-label)', {
    mock: { title: 'Portal · Agro Nordeste', rows: [
      { l: 'Health score', r: '94', c: C.emerald },
      { l: 'Uptime médio', r: '99,2%', c: C.emerald },
      { l: 'Integrações', r: '3', c: C.cyanL },
      { l: 'Incidentes abertos', r: '0', c: C.emerald },
    ] },
    lead: 'Um link público, somente leitura, com a marca da consultoria, onde o cliente final acompanha a própria saúde: integrações, uptime médio e incidentes abertos.',
    recursos: ['Token único por cliente, ativável em 1 clique.', 'Branding (logo/cor) da consultoria.', 'Sem login: link seguro, read-only.'],
    fortes: ['Transparência que vira retenção.', 'O cliente "vê" o serviço — e o valor — todo dia.'],
  });

  // 20 — SLA
  s = newSlide('Em ação · Valor', 'SLA por cliente');
  rrect(s, MX, 1.95, 6.0, 4.0, C.card, C.line);
  txt(s, 'Compliance geral da carteira', { x: MX + 0.3, y: 2.2, w: 5.4, h: 0.4, fontSize: 12, bold: true, color: C.muted });
  progress(s, MX + 0.3, 3.4, 5.4, d.slaOverall || 0, d.slaOverall >= 90 ? C.emerald : C.amber, 'média de compliance entre os clientes');
  const topSla = (d.slaClients || []).slice(0, 3);
  topSla.forEach((c, i) => txt(s, `${c.client}: ${c.compliance}%`, { x: MX + 0.3, y: 4.4 + i * 0.42, w: 5.4, h: 0.4, fontSize: 12, color: C.text }));
  feat(s, 7.0, 1.95, W - 7.0 - MX, 'O QUE FAZ', ['Meta de uptime e latência por cliente.', 'Mede o compliance automaticamente.', 'Relatório mensal narrado por IA.'], C.cyanL);
  feat(s, 7.0, 4.0, W - 7.0 - MX, 'PONTOS FORTES', ['Transforma “está tudo bem?” em número defensável.', 'Base para vender e cobrar SLA premium.'], C.emerald);

  // 21 — Impacto R$
  s = newSlide('Em ação · Valor', 'Impacto financeiro — a conversa do C-level');
  kpiRow(s, [
    { v: brl(d.impact.riskPerHourCents ?? 0), l: 'R$/hora em risco', color: C.rose },
    { v: brl(d.impact.accumulatedCents ?? 0), l: 'Exposição acumulada', color: C.amber },
    { v: String(d.impact.atRisk ?? 0), l: 'Integrações fora do ar', color: C.rose },
    { v: String(d.impact.monitoredWithCost ?? 0), l: 'Mapeadas com custo', color: C.white },
  ], 1.95, MX, W - MX * 2, 1.5);
  feat(s, MX, 3.8, 5.9, 'O QUE FAZ', ['Custo de parada por hora e processo de negócio por integração.', 'Calcula R$/h em risco e exposição acumulada pela idade do incidente.'], C.cyanL);
  feat(s, 7.0, 3.8, W - 7.0 - MX, 'PONTOS FORTES', ['Mostra o ROI do contrato em números reais.', 'O argumento que sustenta (e aumenta) o seu preço.', 'Linguagem que o C-level entende: R$.'], C.emerald);

  // 22 — Transports
  moduleSlide('Em ação · Causa raiz', 'Radar de transports (STMS)', {
    mock: { title: 'Transports · correlação', rows: [
      { l: 'DEVK900231 · user-exit MIGO', sub: 'importado há 2h → PRD', r: 'SUSPEITO', c: C.rose },
      { l: 'DEVK900228 · IDoc ORDERS05', sub: 'importado há 5h → PRD', r: 'SUSPEITO', c: C.rose },
      { l: 'DEVK900219 · mapeamento CPI', sub: 'importado há 20h → QAS', r: 'SUSPEITO', c: C.amber },
      { l: 'Incidente: EDI ANTT falhou', sub: 'provável causa: TR recente', r: 'LINK', c: C.cyanL },
    ] },
    lead: `O agente descobre os transportes importados (STMS) e o SAPLINK correlaciona cada incidente com os transportes das 24h anteriores — a provável causa. ${d.transports.correlated ?? 0} incidentes correlacionados.`,
    recursos: ['Lista de TRs com owner, alvo e horário de importação.', 'Correlação incidente × transporte recente.', 'Filtro por cliente.'],
    fortes: ['Responde "o que mudou?" em segundos.', 'Acelera o root-cause de incidentes pós-deploy.'],
  });
  // 23 — Previsão
  s = newSlide('Em ação · Inteligência', 'Previsão de falha');
  rrect(s, MX, 1.95, 6.0, 3.4, C.card, C.line);
  txt(s, 'Integrações por nível de risco', { x: MX + 0.3, y: 2.15, w: 5.4, h: 0.4, fontSize: 12, bold: true, color: C.muted });
  hbars(s, MX + 0.3, 2.7, 5.4, [
    { label: 'Risco alto', value: d.predict.high ?? 0, color: C.rose },
    { label: 'Risco médio', value: d.predict.medium ?? 0, color: C.amber },
    { label: 'Risco baixo', value: d.predict.low ?? 0, color: C.emerald },
  ], { labelW: 2.2, rowH: 0.5 });
  feat(s, 7.0, 1.95, W - 7.0 - MX, 'O QUE FAZ', ['Score de risco por estado atual + tendência (erro/latência/fila).', 'Amostra métricas no tempo para detectar degradação.'], C.cyanL);
  feat(s, 7.0, 3.9, W - 7.0 - MX, 'PONTOS FORTES', ['Agir ANTES de quebrar — manutenção preventiva.', 'Prioriza o time no que vai falhar primeiro.'], C.emerald);

  // 24 — Benchmark
  moduleSlide('Em ação · Inteligência', 'Benchmark cross-cliente', {
    mock: { title: 'Benchmark · vs mercado', rows: [
      { l: 'IDoc · uptime', sub: 'você 94,9% · mercado 94,9%', r: 'P33', c: C.amber },
      { l: 'RFC · uptime', sub: 'você 96,7% · mercado 96,7%', r: 'P50', c: C.cyanL },
      { l: 'OData · uptime', sub: 'acima da média', r: 'P100', c: C.emerald },
      { l: 'CPI · uptime', sub: 'acima da média', r: 'P100', c: C.emerald },
    ] },
    lead: 'Compara a saúde da carteira contra o agregado anônimo de mercado, por tipo de integração — uptime, erro e latência vs percentil. O moat de dados que cresce com a base.',
    recursos: ['Agregação anônima por tipo (IDoc, RFC, OData, CPI…).', 'Percentil de uptime vs mercado.', 'Quanto mais consultorias, mais rico.'],
    fortes: ['Argumento único: "seu SAP está acima/abaixo do mercado".', 'Dado que nenhum concorrente isolado tem.'],
  });
  // 25 — CPI/AIF
  s = newSlide('Em ação · Stack moderno', 'CPI / Integration Suite + AIF');
  rrect(s, MX, 1.95, 6.0, 3.4, C.card, C.line);
  txt(s, 'Mensagens monitoradas', { x: MX + 0.3, y: 2.15, w: 5.4, h: 0.4, fontSize: 12, bold: true, color: C.muted });
  hbars(s, MX + 0.3, 2.7, 5.4, [
    { label: 'CPI (MPL/IFlows)', value: d.cloud.bySource?.CPI ?? 0, color: C.cyanL },
    { label: 'AIF', value: d.cloud.bySource?.AIF ?? 0, color: C.purpleL },
    { label: 'Com falha', value: d.cloud.failed ?? 0, color: C.rose },
  ], { labelW: 2.6, rowH: 0.5 });
  feat(s, 7.0, 1.95, W - 7.0 - MX, 'O QUE FAZ', ['Monitora Message Processing Logs e status de IFlows (CPI).', 'Acompanha mensagens do Application Interface Framework (AIF).'], C.cyanL);
  feat(s, 7.0, 3.9, W - 7.0 - MX, 'PONTOS FORTES', ['Cobre clássico (RFC/IDoc) E moderno (Cloud) num só lugar.', 'Evidência real via SAP BTP (Integration Suite trial).'], C.emerald);

  // ===== PARTE 4 =====
  divider('04', 'O retorno', 'Diferenciais, ganhos, segurança e como começar.');

  // 26 — Diferenciais
  s = newSlide('O retorno', 'O que nenhum monitor genérico tem');
  const dif = [
    ['Opera, não só observa', 'Remediação autônoma com governança — resolve no SAP.'],
    ['IA aplicada de ponta a ponta', 'Copiloto, digest, diagnóstico, SAP Notes e previsão.'],
    ['Prova de valor em R$', 'Impacto financeiro e SLA por cliente, prontos para o C-level.'],
    ['Multi-cliente nativo', 'Uma camada para toda a carteira — pensado para consultoria.'],
    ['Clássico + Cloud', 'IDoc/RFC e CPI/AIF no mesmo painel.'],
    ['Moat de dados', 'Benchmark anônimo cross-cliente que melhora com a escala.'],
  ];
  dif.forEach((b, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = MX + col * 6.1, y = 2.0 + row * 1.5;
    rrect(s, x, y, 5.9, 1.35, C.card, C.line);
    rect(s, x, y, 0.07, 1.35, C.purple);
    txt(s, b[0], { x: x + 0.25, y: y + 0.18, w: 5.5, h: 0.5, fontSize: 15, bold: true, color: C.cyanL });
    txt(s, b[1], { x: x + 0.25, y: y + 0.68, w: 5.5, h: 0.6, fontSize: 12.5, color: C.text, valign: 'top' });
  });

  // 27 — Ganhos / ROI
  s = newSlide('O retorno', 'O que a sua consultoria ganha');
  const ganhos = [
    ['Retém', 'Portal white-label + transparência = menos churn.', C.emerald],
    ['Escala', 'Um analista cuida de muito mais clientes.', C.cyanL],
    ['Vende mais', 'SLA premium, suporte proativo, novos pacotes.', C.purpleL],
    ['Prova valor', 'Relatórios em R$ e SLA que justificam o contrato.', C.amber],
  ];
  ganhos.forEach((b, i) => {
    const x = MX + i * 3.05, y = 2.1; rrect(s, x, y, 2.85, 3.0, C.card, C.line); rect(s, x, y, 2.85, 0.09, b[2]);
    txt(s, b[0], { x: x + 0.2, y: y + 0.35, w: 2.5, h: 0.6, fontSize: 19, bold: true, color: b[2] });
    txt(s, b[1], { x: x + 0.2, y: y + 1.1, w: 2.5, h: 1.7, fontSize: 13, color: C.text, valign: 'top' });
  });
  rrect(s, MX, 5.4, W - MX * 2, 1.05, C.bg2, C.emerald);
  txt(s, [{ text: 'A conta fecha:  ', options: { bold: true, color: C.emerald } }, { text: 'um único incidente evitado, ou um SLA premium vendido, paga o SAPLINK por meses.', options: { color: C.text } }], { x: MX + 0.3, y: 5.6, w: W - MX * 2 - 0.6, h: 0.7, fontSize: 14, valign: 'middle', fontFace: FONT });

  // 28 — Segurança
  s = newSlide('O retorno', 'Segurança & conformidade');
  const sec = [
    ['Saída-apenas', 'O agente só faz conexões de saída (HTTPS). Sem porta de entrada na rede do cliente.'],
    ['Token por integração', 'Cada agente autentica com token próprio, com hash no servidor.'],
    ['Segredos cifrados', 'Credenciais (Jira/ServiceNow, configs) cifradas em repouso.'],
    ['Aprovação humana', 'Nenhuma remediação roda no SAP sem aprovação do admin.'],
    ['Multi-tenant isolado', 'Dados por consultoria; papéis (admin/usuário) e RBAC.'],
    ['Auditoria', 'Log de antes/depois de cada ação executada.'],
  ];
  sec.forEach((b, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = MX + col * 6.1, y = 2.0 + row * 1.5;
    rrect(s, x, y, 5.9, 1.35, C.card, C.line);
    txt(s, b[0], { x: x + 0.25, y: y + 0.18, w: 5.5, h: 0.45, fontSize: 14.5, bold: true, color: C.emerald });
    txt(s, b[1], { x: x + 0.25, y: y + 0.66, w: 5.5, h: 0.6, fontSize: 12, color: C.text, valign: 'top' });
  });

  // 29 — Planos
  s = newSlide('O retorno', 'Planos — comece pequeno, cresça com a carteira');
  const planos = (d.plans || []).slice(0, 4);
  const pc = planos.length || 4;
  const gap = 0.25, cw = (W - MX * 2 - gap * (pc - 1)) / pc;
  (planos.length ? planos : [{ name: 'Starter' }, { name: 'Pro' }, { name: 'Business' }, { name: 'Enterprise' }]).forEach((pl, i) => {
    const x = MX + i * (cw + gap), y = 2.0, h = 4.0;
    const hi = !!pl.highlight;
    rrect(s, x, y, cw, h, hi ? C.card2 : C.card, hi ? C.purple : C.line);
    rect(s, x, y, cw, 0.12, hi ? C.purple : C.line2);
    txt(s, pl.name || pl.key || '—', { x: x + 0.15, y: y + 0.35, w: cw - 0.3, h: 0.5, fontSize: 17, bold: true, color: hi ? C.purpleL : C.white, align: 'center' });
    const price = pl.priceCents != null ? brl(pl.priceCents) : (pl.price != null ? `R$ ${pl.price}` : '—');
    txt(s, price, { x: x + 0.1, y: y + 0.95, w: cw - 0.2, h: 0.6, fontSize: 22, bold: true, color: C.cyanL, align: 'center' });
    txt(s, '/mês', { x: x + 0.1, y: y + 1.5, w: cw - 0.2, h: 0.3, fontSize: 10, color: C.muted, align: 'center' });
    const feats = [];
    if (pl.maxIntegrations != null) feats.push(`${pl.maxIntegrations} integrações`);
    if (pl.maxUsers != null) feats.push(`${pl.maxUsers} usuários`);
    if (pl.description) feats.push(pl.description);
    txt(s, (feats.length ? feats : ['Sob consulta']).map((t) => ({ text: t, options: { bullet: { code: '2022' }, fontSize: 10.5, color: C.text, paraSpaceAfter: 5, fontFace: FONT } })), { x: x + 0.2, y: y + 2.0, w: cw - 0.4, h: 1.8, valign: 'top' });
  });
  txt(s, '+ add-ons por integração e por usuário  ·  14 dias de trial  ·  pagamento via Stripe (cartão / cobrança automática)', { x: MX, y: 6.3, w: W - MX * 2, h: 0.4, fontSize: 12.5, color: C.muted });

  // 30 — Como começar
  s = newSlide('O retorno', 'Como começar — em dias, não meses');
  const steps = [
    ['1', 'Cadastro', 'Conta da consultoria com CNPJ e dados de faturamento. Trial de 14 dias.'],
    ['2', 'Conectar', 'Cadastra clientes e integrações; instala o agente Docker (1 comando) onde há RFC/IDoc.'],
    ['3', 'Operar', 'Cockpit, alertas e SLA no ar. Branding white-label e portais ativados.'],
    ['4', 'Provar valor', 'Relatórios em R$ e SLA na primeira reunião com o cliente.'],
  ];
  steps.forEach((b, i) => {
    const y = 2.0 + i * 1.15; rrect(s, MX, y, W - MX * 2, 1.0, C.card, C.line);
    ell(s, MX + 0.2, y + 0.2, 0.6, 0.6, C.purple); txt(s, b[0], { x: MX + 0.2, y: y + 0.2, w: 0.6, h: 0.6, fontSize: 20, bold: true, color: C.white, align: 'center', valign: 'middle' });
    txt(s, b[1], { x: MX + 1.0, y, w: 3.0, h: 1.0, fontSize: 16, bold: true, color: C.cyanL, valign: 'middle' });
    txt(s, b[2], { x: MX + 4.0, y, w: W - MX * 2 - 4.2, h: 1.0, fontSize: 13, color: C.text, valign: 'middle' });
  });

  // 31 — CTA
  s = p.addSlide(); base(s);
  rect(s, 0, 0, W, 0.24, C.cyan); rect(s, 0, 2.9, W, 1.7, C.purple);
  txt(s, 'Pare de apagar incêndio. Comece a operar.', { x: 0.8, y: 3.05, w: W - 1.6, h: 0.9, fontSize: 32, bold: true, color: C.white, align: 'center' });
  txt(s, 'Comece o trial hoje  ·  saplink.com.br', { x: 0.8, y: 4.0, w: W - 1.6, h: 0.5, fontSize: 19, color: C.white, align: 'center' });
  txt(s, '◆ SAPLINK', { x: 0.8, y: 5.5, w: W - 1.6, h: 0.6, fontSize: 26, bold: true, color: C.purpleL, align: 'center' });
  txt(s, 'A plataforma de operação de integrações SAP para consultorias', { x: 0.8, y: 6.2, w: W - 1.6, h: 0.4, fontSize: 13, color: C.muted, align: 'center' });

  return p;
}

// =====================================================================
// PDF (mantém versão enxuta com barras desenhadas)
// =====================================================================
function buildPdf(d, file) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const stream = fs.createWriteStream(file);
    doc.pipe(stream);
    const Pg = { w: 595, h: 842, m: 50 };
    const hx = (h) => `#${h}`;
    let y = 0;
    const page = () => { doc.addPage(); doc.rect(0, 0, Pg.w, Pg.h).fill(hx(C.bg)); doc.rect(0, 0, Pg.w, 6).fill(hx(C.purple)); y = 56; };
    const kicker = (t) => { doc.fillColor(hx(C.cyanL)).font('Helvetica-Bold').fontSize(9).text(t.toUpperCase(), Pg.m, y, { characterSpacing: 2 }); y += 16; };
    const h2 = (t) => { doc.fillColor(hx(C.white)).font('Helvetica-Bold').fontSize(20).text(t, Pg.m, y); y += 30; };
    const para = (t, c = C.text) => { doc.fillColor(hx(c)).font('Helvetica').fontSize(11).text(t, Pg.m, y, { width: Pg.w - Pg.m * 2 }); y = doc.y + 8; };
    const bullet = (t) => { doc.fillColor(hx(C.text)).font('Helvetica').fontSize(11).text('•  ' + t, Pg.m + 4, y, { width: Pg.w - Pg.m * 2 - 4 }); y = doc.y + 7; };
    const kpiGrid = (cards) => {
      const n = cards.length, gap = 10, cw = (Pg.w - Pg.m * 2 - gap * (n - 1)) / n;
      cards.forEach((c, i) => { const x = Pg.m + i * (cw + gap); doc.roundedRect(x, y, cw, 70, 7).fill(hx(C.card)); doc.fillColor(hx(c.color || C.cyanL)).font('Helvetica-Bold').fontSize(15).text(c.v, x, y + 14, { width: cw, align: 'center' }); doc.fillColor(hx(C.muted)).font('Helvetica').fontSize(7.5).text(c.l, x + 3, y + 44, { width: cw - 6, align: 'center' }); });
      y += 88;
    };
    const barChart = (title, items) => {
      doc.fillColor(hx(C.muted)).font('Helvetica-Bold').fontSize(10).text(title, Pg.m, y); y += 18;
      const max = Math.max(1, ...items.map((i) => i.v)); const labelW = 130, barMaxW = Pg.w - Pg.m * 2 - labelW - 50;
      items.forEach((i) => { doc.fillColor(hx(C.text)).font('Helvetica').fontSize(9).text(i.l, Pg.m, y + 5, { width: labelW - 6 }); const w = Math.max(2, (i.v / max) * barMaxW); doc.roundedRect(Pg.m + labelW, y + 3, barMaxW, 12, 3).fill(hx(C.line)); doc.roundedRect(Pg.m + labelW, y + 3, w, 12, 3).fill(hx(i.c || C.purple)); doc.fillColor(hx(C.text)).font('Helvetica-Bold').fontSize(9).text(String(i.v), Pg.m + labelW + barMaxW + 6, y + 5); y += 22; });
      y += 10;
    };
    doc.rect(0, 0, Pg.w, Pg.h).fill(hx(C.bg)); doc.rect(0, 0, Pg.w, 10).fill(hx(C.purple)); doc.rect(0, 10, Pg.w, 4).fill(hx(C.cyan));
    doc.fillColor(hx(C.white)).font('Helvetica-Bold').fontSize(42).text('◆ SAPLINK', Pg.m, 280);
    doc.fillColor(hx(C.purpleL)).font('Helvetica').fontSize(15).text('Plataforma de operação de integrações SAP para consultorias', Pg.m, 340, { width: Pg.w - Pg.m * 2 });
    doc.fillColor(hx(C.muted)).fontSize(12).text('Relatório comercial  ·  Monitora · Prevê · Corrige · Prova valor em R$', Pg.m, 372);
    doc.fillColor(hx(C.cyanL)).font('Helvetica-Bold').fontSize(18).text(`${d.clients} clientes · ${d.integrations} integrações · SLA ${d.slaOverall}%`, Pg.m, 430, { width: Pg.w - Pg.m * 2 });
    doc.fillColor(hx(C.cyanL)).fontSize(12).text('saplink.com.br', Pg.m, Pg.h - 60);
    page(); kicker('O problema'); h2('A operação reativa custa cliente e margem');
    ['Integrações SAP quebram em silêncio — IDoc travado, fila parada, RFC caída.', 'O cliente descobre antes de você. Erosão de confiança.', 'O time apaga incêndio, sem visão única da carteira.', 'Difícil provar valor e justificar o contrato.', 'Cada cliente novo sobrecarrega o mesmo time. Não escala.'].forEach(bullet);
    y += 14; kicker('A plataforma'); h2('De monitor a plataforma de operação');
    para('Enxerga a saúde de todas as integrações (OData, RFC, IDoc, filas, CPI, AIF), resolve com cockpit e remediação autônoma, e prova valor com SLA e impacto em R$.');
    page(); kicker('Evidências · carteira'); h2('A carteira em números');
    kpiGrid([{ v: String(d.clients), l: 'Clientes', color: C.white }, { v: String(d.integrations), l: 'Integrações', color: C.cyanL }, { v: `${d.avgHealth}`, l: 'Health médio', color: C.purpleL }, { v: `${d.slaOverall}%`, l: 'SLA', color: C.emerald }]);
    barChart('Health score por cliente', (d.clientList.length ? d.clientList : [{ name: '-', health: 0 }]).map((c) => ({ l: c.name, v: c.health, c: c.health >= 80 ? C.emerald : c.health >= 50 ? C.amber : C.rose })));
    barChart('Cockpit — itens por tipo', [{ l: 'IDoc', v: d.cockpit.byKind?.IDOC ?? 0, c: C.rose }, { l: 'qRFC', v: d.cockpit.byKind?.QRFC ?? 0, c: C.amber }, { l: 'tRFC', v: d.cockpit.byKind?.TRFC ?? 0, c: C.orange }]);
    page(); kicker('Evidências · valor'); h2('SLA & impacto financeiro');
    kpiGrid([{ v: `${d.slaOverall}%`, l: 'SLA', color: C.emerald }, { v: brl(d.impact.riskPerHourCents ?? 0), l: 'R$/h risco', color: C.rose }, { v: brl(d.impact.accumulatedCents ?? 0), l: 'Exposição', color: C.amber }, { v: String(d.impact.atRisk ?? 0), l: 'Fora do ar', color: C.rose }]);
    barChart('Previsão de falha — por risco', [{ l: 'Alto', v: d.predict.high ?? 0, c: C.rose }, { l: 'Médio', v: d.predict.medium ?? 0, c: C.amber }, { l: 'Baixo', v: d.predict.low ?? 0, c: C.emerald }]);
    barChart('CPI / AIF — mensagens', [{ l: 'CPI', v: d.cloud.bySource?.CPI ?? 0, c: C.cyanL }, { l: 'AIF', v: d.cloud.bySource?.AIF ?? 0, c: C.purpleL }, { l: 'Falhas', v: d.cloud.failed ?? 0, c: C.rose }]);
    page(); kicker('Diferenciais & ganhos'); h2('Por que SAPLINK');
    ['Opera, não só observa: remediação autônoma com governança.', 'IA de ponta a ponta: copiloto, digest, diagnóstico, SAP Notes, previsão.', 'Prova de valor em R$ e SLA por cliente.', 'Multi-cliente nativo + clássico e Cloud (CPI/AIF).', 'Moat de dados: benchmark anônimo cross-cliente.'].forEach(bullet);
    y += 10;
    doc.roundedRect(Pg.m, y, Pg.w - Pg.m * 2, 76, 8).fill(hx(C.purple));
    doc.fillColor(hx(C.white)).font('Helvetica-Bold').fontSize(15).text('Pare de apagar incêndio. Comece a operar.', Pg.m, y + 22, { width: Pg.w - Pg.m * 2, align: 'center' });
    doc.fillColor(hx(C.white)).font('Helvetica').fontSize(12).text('saplink.com.br · comece o trial hoje', Pg.m, y + 46, { width: Pg.w - Pg.m * 2, align: 'center' });
    doc.end(); stream.on('finish', resolve);
  });
}

(async () => {
  const d = await collect();
  console.log('Dados:', JSON.stringify(d).slice(0, 240), '...');
  const pptx = buildPptx(d);
  const pptxFile = path.join(OUT, 'SAPLINK-apresentacao-vendas.pptx');
  await pptx.writeFile({ fileName: pptxFile });
  console.log('OK PPTX:', pptxFile);
  const pdfFile = path.join(OUT, 'SAPLINK-relatorio-comercial.pdf');
  await buildPdf(d, pdfFile);
  console.log('OK PDF :', pdfFile);
})().catch((e) => { console.error('ERRO:', e); process.exit(1); });
