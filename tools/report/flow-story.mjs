// Fluxograma "Como conectar o SAP BTP / Integration Suite ao SAPLINK"
// em PNG no tamanho story do Instagram (1080x1920). node flow-story.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1920;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const steps = [
  ['1', 'SAP BTP · Integration Suite', 'Ative a capability Cloud Integration', '#22d3ee'],
  ['2', 'Faça deploy de 1 IFlow', 'É o que gera os Message Processing Logs', '#a78bfa'],
  ['3', 'Crie o Service Key', 'Process Integration Runtime · plano "api"', '#22d3ee'],
  ['4', 'Copie 4 valores do JSON', 'url · tokenurl · clientid · clientsecret', '#a78bfa'],
  ['5', 'Cole no SAPLINK', 'Tela S/4HANA Cloud → Conectar Integration Suite', '#22d3ee'],
  ['6', 'SAPLINK autentica', 'OAuth client-credentials (token)', '#a78bfa'],
  ['7', 'Puxa os MPL via OData', 'GET /api/v1/MessageProcessingLogs', '#22d3ee'],
  ['8', 'Pronto — dados reais!', 'CPI & AIF, alertas e SLA com o seu SAP', '#34d399'],
];

const topY = 470, nodeH = 132, gap = 36, x = 96, w = W - 192;
let nodes = '';
steps.forEach((s, i) => {
  const y = topY + i * (nodeH + gap);
  const [num, title, sub, accent] = s;
  // arrow above (except first)
  if (i > 0) {
    const ay = y - gap;
    nodes += `<line x1="${W / 2}" y1="${ay}" x2="${W / 2}" y2="${ay + gap - 10}" stroke="#a78bfa" stroke-width="4"/>
    <polygon points="${W / 2 - 9},${ay + gap - 12} ${W / 2 + 9},${ay + gap - 12} ${W / 2},${ay + gap}" fill="#a78bfa"/>`;
  }
  const last = i === steps.length - 1;
  nodes += `
  <rect x="${x}" y="${y}" rx="22" width="${w}" height="${nodeH}" fill="${last ? '#16241c' : '#1a1527'}" stroke="${accent}" stroke-width="${last ? 3 : 1.5}"/>
  <circle cx="${x + 66}" cy="${y + nodeH / 2}" r="40" fill="${accent}"/>
  <text x="${x + 66}" y="${y + nodeH / 2 + 14}" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#0f0b1a" text-anchor="middle">${num}</text>
  <text x="${x + 134}" y="${y + 56}" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#ffffff">${esc(title)}</text>
  <text x="${x + 134}" y="${y + 98}" font-family="Arial, sans-serif" font-size="26" fill="#9b95ad">${esc(sub)}</text>`;
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#140d24"/><stop offset="1" stop-color="#0a0712"/>
    </linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="14" fill="url(#brand)"/>
  <!-- header -->
  <polygon points="116,150 150,184 116,218 82,184" fill="#a78bfa"/>
  <text x="178" y="200" font-family="Arial, sans-serif" font-size="64" font-weight="800" fill="#ffffff">SAPLINK</text>
  <text x="96" y="300" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff">Conecte seu SAP BTP em 8 passos</text>
  <text x="96" y="350" font-family="Arial, sans-serif" font-size="28" fill="#a78bfa">Integration Suite (CPI) → SAPLINK, sem instalar nada no cliente</text>
  ${nodes}
  <text x="${W / 2}" y="${H - 70}" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#22d3ee" text-anchor="middle">saplink.com.br</text>
  <text x="${W / 2}" y="${H - 34}" font-family="Arial, sans-serif" font-size="22" fill="#6b6580" text-anchor="middle">Operação de integrações SAP para consultorias</text>
</svg>`;

const file = path.join(OUT, 'SAPLINK-fluxo-conexao-story.png');
await sharp(Buffer.from(svg)).png().toFile(file);
console.log('OK:', file);
