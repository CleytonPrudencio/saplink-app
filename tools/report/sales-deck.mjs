// Deck de vendas do SAPLINK (PDF). Helvetica, sem emoji (compat. de fonte).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const FILE = path.join(OUT, 'SAPLINK-deck-vendas.pdf');

const W = 842, H = 595; // A4 paisagem
const BG = '#0f0b1a', CARD = '#1a1527', TXT = '#e2e0ea', MUT = '#9b95ad', PUR = '#7c3aed', CYA = '#06b6d4', GRN = '#34d399', AMB = '#fbbf24', ROSE = '#f87171';
const doc = new PDFDocument({ size: [W, H], margin: 0 });
doc.pipe(fs.createWriteStream(FILE));

function page(bg = BG) { doc.addPage({ size: [W, H], margin: 0 }); doc.rect(0, 0, W, H).fill(bg); }
function bar() { doc.rect(0, 0, W, 6).fill(PUR); doc.rect(W / 2, 0, W / 2, 6).fill(CYA); }
function diamond(cx, cy, r, c) { doc.moveTo(cx, cy - r).lineTo(cx + r, cy).lineTo(cx, cy + r).lineTo(cx - r, cy).fill(c); }
function logo(x, y) { diamond(x + 10, y + 9, 9, '#a78bfa'); doc.fillColor('#fff').font('Helvetica-Bold').fontSize(18).text('SAPLINK', x + 26, y); }
function h(t, x, y, size = 30, color = '#fff') { doc.fillColor(color).font('Helvetica-Bold').fontSize(size).text(t, x, y, { width: W - x - 50 }); }
function p(t, x, y, size = 13, color = MUT, w = W - x - 60) { doc.fillColor(color).font('Helvetica').fontSize(size).text(t, x, y, { width: w, lineGap: 3 }); }

// ---------- Capa ----------
doc.rect(0, 0, W, H).fill(BG); bar();
diamond(W / 2, 200, 34, '#a78bfa');
doc.fillColor('#fff').font('Helvetica-Bold').fontSize(54).text('SAPLINK', 0, 250, { width: W, align: 'center' });
doc.fillColor('#a78bfa').font('Helvetica').fontSize(16).text('OPERACAO DE INTEGRACOES SAP', 0, 318, { width: W, align: 'center', characterSpacing: 2 });
doc.fillColor(TXT).font('Helvetica').fontSize(18).text('Monitore, preveja, corrija e prove valor em R$ nas integracoes SAP.', 0, 360, { width: W, align: 'center' });
doc.fillColor(MUT).fontSize(13).text('Do IDoc classico ao S/4HANA Cloud - multi-cliente, white-label, com IA.', 0, 392, { width: W, align: 'center' });
doc.fillColor(CYA).font('Helvetica-Bold').fontSize(14).text('saplink.com.br', 0, H - 60, { width: W, align: 'center' });

// ---------- Problema ----------
page(); bar(); logo(50, 28);
h('O problema', 50, 90, 34);
p('Empresas que rodam SAP vivem de integracoes: pedido que entra, nota fiscal que sai, estoque que sincroniza. Quando uma falha, ninguem percebe na hora - e o prejuizo aparece depois, em faturamento parado e cliente irritado.', 50, 150, 16, TXT, 720);
const probs = [['Falha silenciosa', 'A integracao diz "ok" mas o pedido nunca virou Ordem de Venda.'], ['Apaga-incendio', 'O time so descobre quando o cliente liga bravo, horas depois.'], ['Sem prova de valor', 'A consultoria entrega, mas nao consegue mostrar o resultado em numeros.']];
let y = 250; probs.forEach((b) => { doc.roundedRect(50, y, 740, 70, 10).fill(CARD); doc.fillColor(ROSE).font('Helvetica-Bold').fontSize(15).text(b[0], 70, y + 14); doc.fillColor(MUT).font('Helvetica').fontSize(12).text(b[1], 70, y + 38, { width: 700 }); y += 84; });

// ---------- Solucao ----------
page(); bar(); logo(50, 28);
h('A solucao: SAPLINK', 50, 90, 34);
p('Uma plataforma SaaS que a consultoria usa para operar as integracoes SAP de varios clientes num painel so.', 50, 150, 15, TXT, 720);
const sol = [['Enxerga', 'Saude de todas as integracoes de todos os clientes, em tempo real.', CYA], ['Diagnostica', 'IA aponta a causa raiz e sugere a correcao - com a transacao SAP.', '#a78bfa'], ['Corrige', 'Reprocessa/destrava com aprovacao (ou sozinho, no AMS Autonomo).', GRN], ['Prova em R$', 'Traduz cada falha em dinheiro parado - a linguagem do diretor.', AMB]];
y = 215; sol.forEach((b) => { doc.roundedRect(50, y, 360, 78, 10).fill(CARD); doc.fillColor(b[2]).font('Helvetica-Bold').fontSize(15).text(b[0], 68, y + 14); doc.fillColor(MUT).font('Helvetica').fontSize(11).text(b[1], 68, y + 38, { width: 326 }); const col2 = sol.indexOf(b) % 2; });
// 2x2 grid manual
function grid2x2(items, top) {
  items.forEach((b, i) => { const x = 50 + (i % 2) * 380, yy = top + Math.floor(i / 2) * 92; doc.roundedRect(x, yy, 360, 78, 10).fill(CARD); doc.fillColor(b[2]).font('Helvetica-Bold').fontSize(15).text(b[0], x + 18, yy + 14); doc.fillColor(MUT).font('Helvetica').fontSize(11).text(b[1], x + 18, yy + 38, { width: 326 }); });
}
doc.rect(0, 205, W, H - 205).fill(BG); grid2x2(sol, 215);

// ---------- 13 diferenciais ----------
page(); bar(); logo(50, 28);
h('13 diferenciais que ninguem tem', 50, 78, 26);
p('Exploram o que so o SAPLINK acumula: rede entre clientes + on-premise e nuvem juntos + IA.', 50, 116, 12, MUT, 740);
const diffs = [
  'Rede Federada de Falhas - "Waze do SAP"', 'Causa raiz cross-camada (transport -> falha)', 'AMS Autonomo (self-healing que aprende)', 'Dinheiro em risco ao vivo (R$)',
  'Reconciliacao ponta-a-ponta', 'Remediacao generativa (IA escreve a correcao)', 'ChatOps por WhatsApp', 'Perda silenciosa de negocio',
  'Pre-voo de mudanca (blast radius)', 'Time machine de incidente + "e se?"', 'Auditoria & Compliance (SoD)', 'Parceiros EDI (confiabilidade)', 'FinOps de BTP (custo por IFlow)',
];
y = 150; diffs.forEach((d, i) => { const x = 50 + (i % 2) * 380, yy = y + Math.floor(i / 2) * 31; doc.roundedRect(x, yy, 365, 26, 6).fill(CARD); diamond(x + 14, yy + 13, 4, '#a78bfa'); doc.fillColor(TXT).font('Helvetica').fontSize(11).text(d, x + 26, yy + 7, { width: 330 }); });

// ---------- S/4HANA carro-chefe ----------
page(); bar(); logo(50, 28);
h('Carro-chefe: S/4HANA Cloud', 50, 90, 30, AMB);
p('A edicao que a SAP empurra em todos - sem GUI, upgrade 2x/ano, API-first. O SAPLINK cobre o que falta, sem instalar nada (Communication Arrangement / OData).', 50, 145, 14, TXT, 730);
const s4 = [['Radar de Upgrade', 'O que quebra no proximo release, mapeado ao seu uso.'], ['Clean Core Score', 'A metrica que a propria SAP cobra, com plano.'], ['Fiscal DRC (NF-e)', 'Rejeicao SEFAZ, contingencia e reprocesso.'], ['Event Mesh + CPI/AIF', 'Dead-letter, lag e MPL reais.']];
grid2x2(s4.map((x) => [x[0], x[1], AMB]), 215);

// ---------- Planos ----------
page(); bar(); logo(50, 28);
h('Planos', 50, 90, 30);
p('1a mensalidade GRATIS nos planos Business e Enterprise. Pro com 50% OFF no 1o mes. Fidelidade minima de 3 meses.', 50, 145, 13, GRN, 730);
const plans = [['Starter', 'R$ 297/mes', '3 clientes - 10 integr.'], ['Pro', 'R$ 797/mes', '10 clientes - 40 integr.'], ['Business', 'R$ 1.697/mes', '30 clientes - 150 integr.'], ['Enterprise', 'R$ 3.997/mes', 'Ilimitado + gerente']];
plans.forEach((pl, i) => { const x = 50 + i * 188; doc.roundedRect(x, 195, 176, 150, 12).fill(CARD); if (i === 1) doc.roundedRect(x, 195, 176, 150, 12).lineWidth(2).stroke(PUR); doc.fillColor(TXT).font('Helvetica-Bold').fontSize(16).text(pl[0], x + 16, 214); doc.fillColor(i === 1 ? '#a78bfa' : CYA).font('Helvetica-Bold').fontSize(18).text(pl[1], x + 16, 244); doc.fillColor(MUT).font('Helvetica').fontSize(11).text(pl[2], x + 16, 280, { width: 150 }); });
p('Add-ons de integracao e usuario extra sob demanda. Cobranca automatica ou avulsa.', 50, 380, 12, MUT, 740);

// ---------- CTA ----------
page(); bar();
doc.fillColor('#fff').font('Helvetica-Bold').fontSize(34).text('Pare de apagar incendio.', 0, 210, { width: W, align: 'center' });
doc.fillColor('#fff').font('Helvetica-Bold').fontSize(34).text('Comece a operar.', 0, 252, { width: W, align: 'center' });
doc.fillColor(MUT).font('Helvetica').fontSize(15).text('Mostramos o SAPLINK rodando no SAP dos seus clientes, ao vivo.', 0, 320, { width: W, align: 'center' });
doc.fillColor(CYA).font('Helvetica-Bold').fontSize(20).text('saplink.com.br', 0, 380, { width: W, align: 'center' });
doc.fillColor(MUT).font('Helvetica').fontSize(12).text('comercial@saplink.com.br', 0, 412, { width: W, align: 'center' });

doc.end();
console.log('OK:', FILE);
