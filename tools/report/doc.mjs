// Gerador da DOCUMENTAÇÃO BBP do SAPLINK (PDF) — extremamente detalhada, por módulo.
// Capa, controle de documento, sumário (com bookmarks), regra de negócio, arquitetura,
// e um capítulo por módulo com: objetivo, regras de negócio, fluxograma, subfluxos,
// tabela de elementos de tela (cada botão/campo/label), integrações, exceções, permissões.
//   node doc.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const FILE = path.join(OUT, 'SAPLINK-documentacao-BBP.pdf');

// ---------- paleta (documento claro, estilo corporativo BBP) ----------
const C = {
  ink: '#1f2430', body: '#33384a', soft: '#6b7280', faint: '#9aa1ad',
  rule: '#e3e6ee', rule2: '#d3d8e6', band: '#f3f4fb', band2: '#eef0f9',
  brand: '#6d28d9', brandL: '#a78bfa', cyan: '#0891b2', cyanL: '#e0f5fb',
  green: '#15803d', greenL: '#e8f6ec', amber: '#b45309', amberL: '#fdf3e3', red: '#b91c1c', redL: '#fbeaea',
  white: '#ffffff', dark: '#0f0b1a',
};
const F = { reg: 'Helvetica', bold: 'Helvetica-Bold', obl: 'Helvetica-Oblique', bi: 'Helvetica-BoldOblique' };
const PG = { w: 595.28, h: 841.89, mx: 56, mt: 70, mb: 64 };
const CW = PG.w - PG.mx * 2;
const BOTTOM = PG.h - PG.mb;

const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, autoFirstPage: false, info: { Title: 'SAPLINK — Documentação Funcional (BBP)', Author: 'SAPLINK', Subject: 'Business Blueprint do sistema SAPLINK' } });
doc.pipe(fs.createWriteStream(FILE));

let pageNum = 0;
let y = PG.mt;
const toc = [];          // {title, level, page}
let curChapter = '';

function pageChrome() {
  // top accent + footer (em todas as páginas de conteúdo)
  doc.rect(0, 0, PG.w, 4).fill(C.brand);
  doc.fillColor(C.faint).font(F.reg).fontSize(7.5)
    .text('SAPLINK — Documentação Funcional (BBP)', PG.mx, PG.h - 42, { width: CW * 0.7, lineBreak: false });
  if (curChapter) doc.fillColor(C.faint).font(F.reg).fontSize(7.5).text(curChapter, PG.mx, PG.h - 42, { width: CW, align: 'right' });
  doc.fillColor(C.rule2).rect(PG.mx, PG.h - 46, CW, 0.6).fill();
}
function newPage() { doc.addPage(); pageNum++; pageChrome(); y = PG.mt; }
function need(h) { if (y + h > BOTTOM) newPage(); }
function gap(h = 8) { y += h; }

// ---------- blocos ----------
function chapterTitle(num, title) {
  newPage();
  curChapter = `${num}. ${title}`;
  doc.fillColor(C.brandL).font(F.bold).fontSize(10).text(`CAPÍTULO ${num}`, PG.mx, y, { characterSpacing: 1.5 });
  y += 18;
  doc.fillColor(C.ink).font(F.bold).fontSize(22).text(title, PG.mx, y, { width: CW });
  y = doc.y + 6;
  doc.rect(PG.mx, y, 46, 3).fill(C.brand); y += 16;
  doc.outline.addItem(`${num}. ${title}`);
  toc.push({ title: `${num}. ${title}`, level: 0, page: pageNum });
}
function h2(t) { need(46); gap(6); doc.fillColor(C.ink).font(F.bold).fontSize(13.5).text(t, PG.mx, y, { width: CW }); y = doc.y + 6; doc.rect(PG.mx, y, 22, 2).fill(C.cyan); y += 12; toc.push({ title: t, level: 1, page: pageNum }); }
function h3(t) { need(30); gap(4); doc.fillColor(C.brand).font(F.bold).fontSize(11).text(t, PG.mx, y, { width: CW }); y = doc.y + 6; }
function para(t, o = {}) {
  doc.font(o.bold ? F.bold : F.reg).fontSize(o.fs || 9.7).fillColor(o.color || C.body);
  const h = doc.heightOfString(t, { width: CW, lineGap: 2.2 });
  need(h + 4); doc.text(t, PG.mx, y, { width: CW, lineGap: 2.2, align: o.align || 'left' }); y = doc.y + (o.after ?? 7);
}
function list(items, o = {}) {
  doc.font(F.reg).fontSize(9.6).fillColor(C.body);
  for (const it of items) {
    const s = '•  ' + it;
    const h = doc.heightOfString(s, { width: CW - 12, lineGap: 2 });
    need(h + 3);
    doc.fillColor(o.color || C.body).text(s, PG.mx + 8, y, { width: CW - 12, lineGap: 2 }); y = doc.y + 3.5;
  }
  gap(3);
}
function rules(items) {
  for (const r of items) {
    doc.font(F.bold).fontSize(8.4).fillColor(C.brand);
    const idW = 52;
    const txt = r.x; const th = doc.font(F.reg).fontSize(9.4).heightOfString(txt, { width: CW - idW - 14, lineGap: 2 });
    const rowH = Math.max(18, th + 10);
    need(rowH + 2);
    doc.roundedRect(PG.mx, y, CW, rowH, 4).fill(C.band);
    doc.roundedRect(PG.mx, y, idW, rowH, 4).fill(C.brand);
    doc.fillColor(C.white).font(F.bold).fontSize(8).text(r.id, PG.mx, y + rowH / 2 - 5, { width: idW, align: 'center' });
    doc.fillColor(C.body).font(F.reg).fontSize(9.4).text(txt, PG.mx + idW + 10, y + 5, { width: CW - idW - 16, lineGap: 2 });
    y += rowH + 5;
  }
  gap(2);
}
function note(t, kind = 'info') {
  const map = { info: [C.band2, C.brand, 'NOTA'], warn: [C.amberL, C.amber, 'ATENÇÃO'], ok: [C.greenL, C.green, 'BOA PRÁTICA'], risk: [C.redL, C.red, 'RISCO'] };
  const [bg, fg, tag] = map[kind];
  doc.font(F.reg).fontSize(9.3);
  const h = doc.heightOfString(t, { width: CW - 80, lineGap: 2 });
  const rowH = Math.max(30, h + 16);
  need(rowH + 4);
  doc.roundedRect(PG.mx, y, CW, rowH, 5).fill(bg);
  doc.rect(PG.mx, y, 4, rowH).fill(fg);
  doc.fillColor(fg).font(F.bold).fontSize(8).text(tag, PG.mx + 14, y + 9, { width: 60, characterSpacing: 1 });
  doc.fillColor(C.body).font(F.reg).fontSize(9.3).text(t, PG.mx + 78, y + 8, { width: CW - 92, lineGap: 2 });
  y += rowH + 7;
}
function kv(items) {
  for (const [k, v] of items) {
    doc.font(F.reg).fontSize(9.3);
    const vh = doc.heightOfString(v, { width: CW - 150, lineGap: 2 });
    const rowH = Math.max(16, vh + 6);
    need(rowH);
    doc.fillColor(C.soft).font(F.bold).fontSize(9).text(k, PG.mx, y + 2, { width: 138 });
    doc.fillColor(C.body).font(F.reg).fontSize(9.3).text(v, PG.mx + 146, y, { width: CW - 150, lineGap: 2 });
    y += rowH + 3;
    doc.rect(PG.mx, y - 2, CW, 0.4).fill(C.rule);
  }
  gap(6);
}
function table(head, rows, widths) {
  // widths em fração de CW
  const colW = widths.map((w) => w * CW);
  const drawHeader = () => {
    doc.roundedRect(PG.mx, y, CW, 20, 3).fill(C.ink);
    let cx = PG.mx;
    head.forEach((hd, i) => { doc.fillColor(C.white).font(F.bold).fontSize(8.2).text(hd, cx + 6, y + 6, { width: colW[i] - 10 }); cx += colW[i]; });
    y += 20;
  };
  need(48); drawHeader();
  rows.forEach((r, ri) => {
    doc.font(F.reg).fontSize(8.6);
    const cellH = Math.max(...r.map((c, i) => doc.heightOfString(String(c), { width: colW[i] - 12, lineGap: 1.5 })));
    const rowH = cellH + 9;
    if (y + rowH > BOTTOM) { newPage(); drawHeader(); }
    if (ri % 2 === 0) doc.rect(PG.mx, y, CW, rowH).fill(C.band);
    let cx = PG.mx;
    r.forEach((c, i) => {
      const bold = i === 0;
      doc.fillColor(bold ? C.ink : C.body).font(bold ? F.bold : F.reg).fontSize(8.6).text(String(c), cx + 6, y + 4.5, { width: colW[i] - 12, lineGap: 1.5 });
      cx += colW[i];
    });
    doc.rect(PG.mx, y + rowH - 0.4, CW, 0.4).fill(C.rule);
    y += rowH;
  });
  gap(8);
}

// ---------- FLUXOGRAMA ----------
// nodes: {k:'start'|'proc'|'dec'|'io'|'end', x:'texto', branch:'texto do desvio (Não)'}
function flow(title, nodes) {
  if (title) h3(title);
  const cx = PG.mx + CW * 0.34;          // centro da coluna principal
  const nw = CW * 0.46;                    // largura dos nós
  const measure = (t, w) => { doc.font(F.reg).fontSize(8.6); return doc.heightOfString(t, { width: w - 18, lineGap: 1.5 }); };
  const arrow = (yTop, label) => {
    need(26);
    doc.moveTo(cx, yTop).lineTo(cx, yTop + 16).lineWidth(1.1).strokeColor(C.brandL).stroke();
    doc.polygon([cx - 3.5, yTop + 12], [cx + 3.5, yTop + 12], [cx, yTop + 18]).fill(C.brandL);
    if (label) doc.fillColor(C.soft).font(F.reg).fontSize(7.5).text(label, cx + 6, yTop + 4, { lineBreak: false });
    y = yTop + 20;
  };
  nodes.forEach((n, i) => {
    if (i > 0) arrow(y, n.arrowLabel);
    const th = measure(n.x, nw);
    const h = Math.max(30, th + 16);
    if (n.k === 'dec') {
      const dh = Math.max(46, th + 26), dw = nw + 30;
      need(dh + 6);
      const left = cx - dw / 2, top = y, midY = y + dh / 2;
      doc.polygon([cx, top], [left + dw, midY], [cx, top + dh], [left, midY]).fillAndStroke(C.amberL, C.amber);
      doc.fillColor(C.amber).font(F.bold).fontSize(8.4).text(n.x, left + 16, top + dh / 2 - th / 2, { width: dw - 32, align: 'center', lineGap: 1.5 });
      // ramo "Não" para a direita
      if (n.branch) {
        const bx = left + dw + 18, bw = PG.w - PG.mx - bx;
        doc.moveTo(left + dw, midY).lineTo(bx, midY).lineWidth(1.1).strokeColor(C.red).stroke();
        doc.polygon([bx - 6, midY - 3], [bx - 6, midY + 3], [bx, midY]).fill(C.red);
        doc.fillColor(C.red).font(F.reg).fontSize(7).text('Não', left + dw + 2, midY - 10, { lineBreak: false });
        const bbh = Math.max(28, doc.font(F.reg).fontSize(8).heightOfString(n.branch, { width: bw - 12 }) + 12);
        doc.roundedRect(bx, midY - bbh / 2, bw, bbh, 4).fillAndStroke(C.redL, C.red);
        doc.fillColor(C.red).font(F.reg).fontSize(8).text(n.branch, bx + 6, midY - bbh / 2 + 6, { width: bw - 12, lineGap: 1.5 });
        doc.fillColor(C.green).font(F.reg).fontSize(7).text('Sim', cx + 4, y + dh + 2, { lineBreak: false });
      }
      y = top + dh;
    } else {
      need(h + 6);
      const left = cx - nw / 2;
      if (n.k === 'start' || n.k === 'end') {
        const col = n.k === 'start' ? C.green : C.ink, bg = n.k === 'start' ? C.greenL : C.band2;
        doc.roundedRect(left, y, nw, h, h / 2).fillAndStroke(bg, col);
        doc.fillColor(col).font(F.bold).fontSize(9).text(n.x, left + 14, y + h / 2 - th / 2, { width: nw - 28, align: 'center', lineGap: 1.5 });
      } else if (n.k === 'io') {
        const sk = 12;
        doc.polygon([left + sk, y], [left + nw, y], [left + nw - sk, y + h], [left, y + h]).fillAndStroke(C.cyanL, C.cyan);
        doc.fillColor(C.cyan).font(F.bold).fontSize(8.6).text(n.x, left + 16, y + h / 2 - th / 2, { width: nw - 32, align: 'center', lineGap: 1.5 });
      } else {
        doc.roundedRect(left, y, nw, h, 4).fillAndStroke(C.white, C.brandL);
        doc.fillColor(C.ink).font(F.reg).fontSize(8.6).text(n.x, left + 12, y + h / 2 - th / 2, { width: nw - 24, align: 'center', lineGap: 1.5 });
      }
      y += h;
    }
  });
  gap(12);
}

// telas: tabela de elementos
function screen(rota, elementos) {
  h3('Tela e elementos da interface');
  kv([['Rota', rota]]);
  table(['Tipo', 'Elemento', 'Função / comportamento'], elementos.map((e) => [e[0], e[1], e[2]]), [0.16, 0.26, 0.58]);
}
function integr(items) { h3('Integrações e dependências'); list(items); }
function exc(items) { h3('Exceções e tratamento'); table(['Situação', 'Tratamento pelo sistema'], items.map((e) => [e[0], e[1]]), [0.42, 0.58]); }
function perms(items) { h3('Permissões (RBAC)'); table(['Papel', 'O que pode fazer'], items.map((e) => [e[0], e[1]]), [0.32, 0.68]); }

// =====================================================================
//  CAPA + CONTROLE + SUMÁRIO (reservado)
// =====================================================================
function cover() {
  doc.addPage(); pageNum++;
  doc.rect(0, 0, PG.w, PG.h).fill(C.dark);
  doc.rect(0, 0, PG.w, 10).fill(C.brand); doc.rect(0, 10, PG.w, 4).fill(C.cyan);
  // losango da marca (◆ não existe na Helvetica, então desenhamos)
  const dcx = PG.mx + 13, dcy = 272, ds = 13;
  doc.polygon([dcx, dcy - ds], [dcx + ds, dcy], [dcx, dcy + ds], [dcx - ds, dcy]).fill('#a78bfa');
  doc.fillColor('#ffffff').font(F.bold).fontSize(40).text('SAPLINK', PG.mx + 36, 250);
  doc.fillColor('#a78bfa').font(F.reg).fontSize(16).text('Documentação Funcional do Sistema', PG.mx, 312);
  doc.fillColor('#a78bfa').font(F.bold).fontSize(13).text('Business Blueprint (BBP)', PG.mx, 336);
  doc.fillColor('#9b95ad').font(F.reg).fontSize(11).text('Plataforma de operação de integrações SAP para consultorias', PG.mx, 372, { width: CW });
  doc.roundedRect(PG.mx, 470, 360, 92, 8).fillAndStroke('#15101f', '#2a2440');
  doc.fillColor('#9b95ad').font(F.reg).fontSize(9);
  doc.text('Versão', PG.mx + 18, 488); doc.text('Classificação', PG.mx + 18, 510); doc.text('Status', PG.mx + 18, 532);
  doc.fillColor('#e2e0ea').font(F.bold).fontSize(9);
  doc.text('1.0', PG.mx + 140, 488); doc.text('Confidencial', PG.mx + 140, 510); doc.text('Aprovado para uso', PG.mx + 140, 532);
  doc.fillColor('#22d3ee').font(F.reg).fontSize(11).text('saplink.com.br', PG.mx, PG.h - 70);
}

function docControl() {
  newPage();
  doc.fillColor(C.ink).font(F.bold).fontSize(18).text('Controle do documento', PG.mx, y); y = doc.y + 14;
  table(['Campo', 'Valor'], [
    ['Documento', 'SAPLINK — Documentação Funcional (Business Blueprint)'],
    ['Objetivo', 'Descrever em detalhe a função, os fluxos, os subfluxos, as integrações e cada elemento de tela de todos os módulos do sistema SAPLINK.'],
    ['Produto', 'SAPLINK — SaaS de operação e monitoramento de integrações SAP'],
    ['Público-alvo', 'Consultorias SAP, times de operação/Basis, gestores e clientes finais'],
    ['Versão', '1.0'],
    ['Classificação', 'Confidencial — uso interno e comercial'],
    ['Idioma', 'Português (Brasil)'],
  ], [0.26, 0.74]);
  h2('Histórico de revisões');
  table(['Versão', 'Data', 'Autor', 'Descrição'], [['1.0', '—', 'SAPLINK', 'Emissão inicial — documentação completa por módulo.']], [0.12, 0.18, 0.2, 0.5]);
  h2('Como ler este documento');
  list([
    'Cada módulo tem: Objetivo, Regras de negócio (RN-xx), Fluxo principal (fluxograma), Subfluxos, Tela e elementos (cada botão/campo/label), Integrações, Exceções e Permissões.',
    'Os fluxogramas usam: óvalo = início/fim; retângulo = processo; losango = decisão; paralelogramo = entrada/saída de dados.',
    'As regras de negócio são numeradas por módulo (ex.: RN-COCKPIT-01) para referência cruzada.',
    'O sumário e os marcadores (bookmarks) do PDF permitem navegação rápida.',
  ]);
}

let tocPages = [];
function reserveToc(n = 2) { for (let i = 0; i < n; i++) { newPage(); tocPages.push(pageNum); } }

function renderToc() {
  let ti = 0, ty = 0;
  const startPageDraw = (pIdx) => { doc.switchToPage(pIdx - 1); if (ti === 0) { doc.fillColor(C.ink).font(F.bold).fontSize(18).text('Sumário', PG.mx, PG.mt); ty = PG.mt + 36; } else ty = PG.mt; };
  startPageDraw(tocPages[0]);
  let tp = 0;
  for (const e of toc) {
    if (ty > BOTTOM - 20) { tp++; if (tp >= tocPages.length) break; startPageDraw(tocPages[tp]); ty = PG.mt; }
    const indent = e.level * 16;
    doc.font(e.level === 0 ? F.bold : F.reg).fontSize(e.level === 0 ? 10 : 9).fillColor(e.level === 0 ? C.ink : C.soft);
    doc.text(e.title, PG.mx + indent, ty, { width: CW - indent - 34, lineBreak: false, ellipsis: true });
    doc.fillColor(C.soft).font(F.reg).fontSize(9).text(String(e.page), PG.mx, ty, { width: CW, align: 'right' });
    // leaders
    doc.fillColor(C.rule2).fontSize(8);
    ty += e.level === 0 ? 17 : 14;
    if (e.level === 0) { doc.rect(PG.mx, ty - 5, CW, 0.4).fill(C.rule); }
    ti++;
  }
}

// =====================================================================
//  CONTEÚDO
// =====================================================================
cover();
docControl();
reserveToc(2);

// ---- CAP 1: Visão geral & regra de negócio ----
chapterTitle('1', 'Visão geral e regra de negócio');
h2('1.1 O que é o SAPLINK');
para('O SAPLINK é uma plataforma SaaS multi-tenant que dá a uma consultoria SAP uma camada única de operação sobre todas as integrações SAP dos seus clientes — do clássico (IDoc, RFC, ALE/EDI, BAPIs) ao moderno (OData, SAP Cloud Integration/CPI, AIF). Ele monitora a saúde dessas integrações, prevê falhas, executa remediações com governança e prova o valor entregue em SLA e em R$.');
para('A tese do produto é deixar de ser um "monitor passivo" e virar a "plataforma autônoma de operação de integrações SAP": que enxerga, antecipa, corrige e comprova valor — com um moat de dados cross-cliente.');
h2('1.2 Para que serve / problema que resolve');
list([
  'Integrações SAP quebram em silêncio (IDoc travado, fila qRFC/tRFC parada, RFC caída) e o cliente costuma descobrir antes da consultoria.',
  'O time de operação é reativo, sem visão única e multi-cliente, abrindo SAP por SAP para caçar problemas.',
  'É difícil provar o valor entregue e justificar o contrato — o que pressiona a margem.',
  'Cada novo cliente sobrecarrega o mesmo time: a operação não escala.',
  'O stack se fragmenta entre clássico (RFC/IDoc) e cloud (CPI/AIF), sem um painel comum.',
]);
h2('1.3 Modelo de negócio e personas');
table(['Persona', 'Quem é', 'Como usa o SAPLINK'], [
  ['Admin da consultoria', 'Gestor/coordenador de operação SAP', 'Configura clientes, integrações, canais, SLA, cobrança e branding; aprova remediações.'],
  ['Analista/consultor', 'Operação, Basis, ABAP', 'Acompanha cockpit, diagnostica, executa sincronizações, atende alertas.'],
  ['Cliente final', 'Empresa atendida pela consultoria', 'Acessa o portal white-label read-only com a própria saúde e SLA.'],
  ['Platform admin', 'Operador do SAPLINK (dono do SaaS)', 'Gerencia consultorias (tenants) e receita.'],
], [0.22, 0.3, 0.48]);
h2('1.4 Regras de negócio gerais');
rules([
  { id: 'RN-G-01', x: 'Toda informação é isolada por consultoria (tenant). Um usuário só enxerga dados da sua própria consultoria.' },
  { id: 'RN-G-02', x: 'Os papéis são PLATFORM_ADMIN, CONSULTANCY_ADMIN e CONSULTANCY_USER. Recursos financeiros e de configuração são exclusivos do admin.' },
  { id: 'RN-G-03', x: 'O acesso ao sistema exige assinatura ativa (TRIALING ou ACTIVE). Sem assinatura ativa, usuários comuns são bloqueados e o admin é direcionado à resolução de pagamento.' },
  { id: 'RN-G-04', x: 'O agente on-premise só realiza conexões de saída (HTTPS) e autentica por token por integração; o cliente nunca abre porta de entrada.' },
  { id: 'RN-G-05', x: 'Nenhuma ação que altera o SAP (remediação) é executada sem aprovação explícita de um admin.' },
  { id: 'RN-G-06', x: 'A IA nunca fabrica dados: quando indisponível, retorna mensagem honesta de indisponibilidade em vez de inventar resultado.' },
]);
h2('1.5 Glossário rápido');
table(['Termo', 'Significado'], [
  ['IDoc', 'Intermediate Document — documento de integração SAP (EDI/ALE).'],
  ['RFC / tRFC / qRFC', 'Remote Function Call e suas variantes transacional/em fila.'],
  ['OData', 'Protocolo REST do SAP Gateway (Fiori, APIs).'],
  ['CPI', 'SAP Cloud Integration (Integration Suite) — IFlows e MPL.'],
  ['AIF', 'Application Interface Framework — monitor de mensagens de interface.'],
  ['STMS', 'Sistema de transportes do SAP (importação de TRs entre ambientes).'],
  ['Agente', 'Componente Docker on-premise que lê o SAP e empurra dados ao SAPLINK.'],
  ['SLA', 'Acordo de nível de serviço (meta de uptime/latência).'],
], [0.2, 0.8]);

// ---- CAP 2: Arquitetura & segurança ----
chapterTitle('2', 'Arquitetura, integração e segurança');
h2('2.1 Visão de arquitetura');
para('A solução tem três camadas: (1) o Agente on-premise, que roda na rede do cliente; (2) a Plataforma SAPLINK, multi-tenant na nuvem; (3) os consumidores — consultoria (dashboards/alertas) e cliente final (portal).');
flow('Fluxo de dados ponta a ponta', [
  { k: 'start', x: 'SAP do cliente (ECC / S/4HANA / PI / CPI)' },
  { k: 'proc', x: 'Agente on-premise lê saúde, IDocs, filas, STMS, CPI/AIF' },
  { k: 'io', x: 'Push HTTPS de saída (token por integração)' },
  { k: 'proc', x: 'Plataforma ingere, correlaciona, calcula SLA e R$, prevê falha' },
  { k: 'dec', x: 'Ação de remediação necessária?', branch: 'Segue só monitorando e alertando' },
  { k: 'proc', x: 'Admin aprova -> agente puxa o comando e executa no SAP' },
  { k: 'io', x: 'Dashboards, alertas multicanal, tickets, portal do cliente' },
  { k: 'end', x: 'Operação proativa com prova de valor' },
]);
h2('2.2 Componentes');
table(['Componente', 'Tecnologia', 'Responsabilidade'], [
  ['Frontend', 'Next.js (App Router)', 'Telas, dashboards, white-label, portal público.'],
  ['Backend/API', 'Node.js + Express + Prisma', 'Regras de negócio, ingestão, schedulers, integrações.'],
  ['Banco', 'PostgreSQL', 'Dados multi-tenant.'],
  ['IA', 'Ollama / Claude', 'Diagnóstico, copiloto, digest, relatórios narrados.'],
  ['Agente', 'Docker (Node)', 'Coleta on-premise e execução de remediação.'],
  ['Proxy/TLS', 'Caddy', 'HTTPS automático (Let’s Encrypt).'],
  ['Pagamentos', 'Stripe (e Asaas alt.)', 'Checkout, faturas e webhooks.'],
  ['E-mail', 'Resend', 'Digest, convites, on-call por e-mail.'],
], [0.2, 0.26, 0.54]);
h2('2.3 Segurança e conformidade');
rules([
  { id: 'RN-SEC-01', x: 'O agente só faz conexões de saída (HTTPS). Nenhuma porta de entrada é aberta na rede do cliente.' },
  { id: 'RN-SEC-02', x: 'Cada integração tem um token de agente próprio; no servidor guarda-se apenas o hash do token.' },
  { id: 'RN-SEC-03', x: 'Segredos (tokens de Jira/ServiceNow, configs sensíveis) são cifrados em repouso.' },
  { id: 'RN-SEC-04', x: 'Autenticação via JWT; senhas com hash (bcrypt). 401 desloga; 403 é tratado pela camada de acesso por papel.' },
  { id: 'RN-SEC-05', x: 'Toda remediação exige aprovação humana e gera log de antes/depois (auditoria).' },
]);
note('O modelo "pull" da remediação (o agente busca comandos aprovados) é o que permite agir no SAP sem expor a rede do cliente.', 'ok');

// ---- Helper para montar capítulos de módulo padronizados ----
function modulo(num, titulo, spec) {
  chapterTitle(num, titulo);
  if (spec.objetivo) { h2(`${num}.1 Objetivo`); para(spec.objetivo); }
  if (spec.contexto) para(spec.contexto);
  if (spec.regras) { h2(`${num}.2 Regras de negócio`); rules(spec.regras); }
  if (spec.fluxo) { h2(`${num}.3 Fluxo principal`); flow(spec.fluxo.title || 'Fluxo principal', spec.fluxo.nodes); }
  if (spec.subfluxos) { h2(`${num}.4 Subfluxos`); spec.subfluxos.forEach((sf) => { h3(sf.title); list(sf.steps); }); }
  if (spec.tela) { h2(`${num}.5 Tela e elementos`); screen(spec.tela.rota, spec.tela.elementos); }
  if (spec.integracoes) { h2(`${num}.6 Integrações`); list(spec.integracoes); }
  if (spec.excecoes) { h2(`${num}.7 Exceções e tratamento`); table(['Situação', 'Tratamento pelo sistema'], spec.excecoes.map((e) => [e[0], e[1]]), [0.42, 0.58]); }
  if (spec.permissoes) { h2(`${num}.8 Permissões (RBAC)`); table(['Papel', 'O que pode fazer'], spec.permissoes.map((e) => [e[0], e[1]]), [0.32, 0.68]); }
  if (spec.nota) note(spec.nota.x, spec.nota.k || 'info');
}

// Conteúdo dos módulos importado de doc-modules.mjs (mantém este arquivo legível)
import { MODULES } from './doc-modules.mjs';
MODULES.forEach((m) => modulo(m.num, m.titulo, m));

// ---- Apêndices ----
chapterTitle('A', 'Apêndice A — Mapa de transações SAP referenciadas');
table(['Transação', 'Uso no contexto SAPLINK'], [
  ['BD87', 'Reprocessar IDocs em erro (status 51/64).'], ['WE02 / WE05', 'Monitor de IDocs.'], ['WE19', 'Teste/edição de IDoc.'],
  ['WE20 / WE21', 'Partner profiles e portas (catálogo).'], ['SM58', 'Fila tRFC (reexecução).'], ['SMQ1 / SMQ2', 'Filas qRFC de saída/entrada.'],
  ['SM59', 'Destinos RFC.'], ['ST22', 'Dumps ABAP.'], ['SM21', 'Log do sistema.'], ['SICF / SMICM', 'Serviços ICF / monitor ICM.'],
  ['/IWFND/MAINT_SERVICE', 'Publicação de serviços OData (Gateway).'], ['/IWFND/ERROR_LOG', 'Log de erros do Gateway.'],
  ['STMS', 'Sistema de transportes.'], ['SOAMANAGER', 'Configuração de web services (modo SOAP do agente).'],
  ['ST05 / SAT / ST03N', 'Análise de performance.'], ['STRUST', 'Gestão de certificados (SSL/SNC).'],
], [0.28, 0.72]);

chapterTitle('B', 'Apêndice B — Modelo de dados (entidades principais)');
table(['Entidade', 'Descrição'], [
  ['Consultancy', 'Tenant (consultoria). Dados cadastrais, branding, preferências, assinatura.'],
  ['User', 'Usuário com papel (PLATFORM_ADMIN / CONSULTANCY_ADMIN / CONSULTANCY_USER).'],
  ['Client', 'Cliente final da consultoria; health score; flags de portal e SLA.'],
  ['Integration', 'Integração SAP monitorada; tipo, config (cifrada), métricas, token de agente, custo/hora.'],
  ['Alert', 'Alerta gerado; severidade, status, notificação, ticket vinculado.'],
  ['SapItem', 'Item operacional reportado pelo agente (IDoc, qRFC, tRFC).'],
  ['RemediationAction', 'Ação de remediação (aprovação, execução, log antes/depois).'],
  ['InterfaceCatalogItem', 'Item do catálogo de interfaces auto-descoberto.'],
  ['Transport', 'Transporte STMS para correlação com incidentes.'],
  ['MetricSample', 'Amostra de métricas no tempo (previsão de falha).'],
  ['CloudItem', 'Mensagem CPI/AIF monitorada.'],
  ['NotificationChannel / TicketConfig', 'Canais de on-call e configuração de ticket sync.'],
  ['Plan / Subscription / Invoice', 'Catálogo de planos, assinatura e faturas (billing).'],
], [0.28, 0.72]);

// =====================================================================
renderToc();

// Footer com numeração final (página X de N) — pula a capa (página 1)
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  if (i === 0) continue;
  doc.switchToPage(i);
  doc.fillColor(C.faint).font(F.reg).fontSize(7.5).text(`Página ${i + 1} de ${range.count}`, PG.mx, PG.h - 30, { width: CW, align: 'center' });
}

doc.end();
console.log('OK:', FILE);
