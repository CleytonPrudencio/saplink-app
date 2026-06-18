// Story (1080x1920) — mapa do SAPLINK: como funciona + todas as funcionalidades.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1920, MX = 56, CW = W - MX * 2;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- mini-flow "como funciona" ----
const flow = ['SAP do cliente', 'Agente / Conector', 'Plataforma SAPLINK', 'Painéis & Portal'];
const fchipW = (CW - 3 * 34) / 4, fy = 430, fchipH = 96;
let flowSvg = '';
flow.forEach((t, i) => {
  const x = MX + i * (fchipW + 34);
  flowSvg += `<rect x="${x}" y="${fy}" rx="16" width="${fchipW}" height="${fchipH}" fill="#1a1527" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="${x + fchipW / 2}" y="${fy + fchipH / 2 + 8}" font-family="Arial" font-size="23" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(t)}</text>`;
  if (i < 3) { const ax = x + fchipW + 6; flowSvg += `<text x="${ax + 11}" y="${fy + fchipH / 2 + 12}" font-family="Arial" font-size="34" font-weight="800" fill="#a78bfa" text-anchor="middle">›</text>`; }
});

// ---- cards de funcionalidades ----
const groups = [
  ['OPERAÇÃO', '#22d3ee', ['Cockpit de IDoc & filas', 'Remediação autônoma', 'Catálogo de interfaces', 'Alertas em tempo real']],
  ['INTELIGÊNCIA IA', '#a78bfa', ['Copiloto da carteira', 'Diagnóstico + SAP Notes', 'Previsão de falha', 'Digest semanal por IA']],
  ['VALOR & SLA', '#34d399', ['SLA por cliente', 'Impacto em R$', 'Benchmark de mercado', 'Portal do cliente (white-label)']],
  ['S/4HANA CLOUD', '#fbbf24', ['Radar de Upgrade', 'Clean Core Score', 'Fiscal DRC (NF-e/SEFAZ)', 'Event Mesh', 'CPI & AIF']],
  ['RESPOSTA & CONFIANÇA', '#f87171', ['On-call multicanal', 'Tickets Jira/ServiceNow', 'Radar de validade', 'Transports (STMS)']],
];
const top = 600, gap = 22;
const cardH = (H - 90 - top - gap * (groups.length - 1)) / groups.length;
let cardsSvg = '';
groups.forEach((g, gi) => {
  const [title, accent, feats] = g;
  const y = top + gi * (cardH + gap);
  cardsSvg += `<rect x="${MX}" y="${y}" rx="20" width="${CW}" height="${cardH}" fill="#1a1527" stroke="#2a2440" stroke-width="1.5"/>
  <rect x="${MX}" y="${y}" width="9" height="${cardH}" fill="${accent}"/>
  <text x="${MX + 30}" y="${y + 46}" font-family="Arial" font-size="30" font-weight="800" fill="${accent}">${esc(title)}</text>`;
  const colW = (CW - 60) / 2, fx0 = MX + 36, rowH = 40, startY = y + 84;
  feats.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const fx = fx0 + col * colW, ry = startY + row * rowH;
    cardsSvg += `<circle cx="${fx + 6}" cy="${ry - 6}" r="6" fill="${accent}"/>
    <text x="${fx + 22}" y="${ry}" font-family="Arial" font-size="25" fill="#e2e0ea">${esc(f)}</text>`;
  });
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140d24"/><stop offset="1" stop-color="#0a0712"/></linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="14" fill="url(#brand)"/>
  <polygon points="${MX + 24},150 ${MX + 58},184 ${MX + 24},218 ${MX - 10},184" fill="#a78bfa"/>
  <text x="${MX + 84}" y="204" font-family="Arial" font-size="66" font-weight="800" fill="#ffffff">SAPLINK</text>
  <text x="${MX}" y="300" font-family="Arial" font-size="44" font-weight="700" fill="#ffffff">A plataforma de operação SAP</text>
  <text x="${MX}" y="346" font-family="Arial" font-size="27" fill="#a78bfa">Monitora · Prevê · Corrige · Prova valor em R$</text>
  <text x="${MX}" y="406" font-family="Arial" font-size="22" font-weight="700" fill="#6b6580" letter-spacing="2">COMO FUNCIONA</text>
  ${flowSvg}
  <text x="${MX}" y="576" font-family="Arial" font-size="22" font-weight="700" fill="#6b6580" letter-spacing="2">TUDO QUE ELE FAZ</text>
  ${cardsSvg}
  <text x="${W / 2}" y="${H - 50}" font-family="Arial" font-size="30" font-weight="800" fill="#22d3ee" text-anchor="middle">saplink.com.br</text>
</svg>`;

const file = path.join(OUT, 'SAPLINK-mapa-sistema-story.png');
await sharp(Buffer.from(svg)).png().toFile(file);
console.log('OK:', file);
