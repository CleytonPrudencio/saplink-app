// Gera a imagem de Open Graph (1200x630) e o ícone (512x512) do SAPLINK.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(__dirname, '../../frontend/public');
fs.mkdirSync(PUB, { recursive: true });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// diamante (logo) em polígono pra não depender de glyph
const diamond = (cx, cy, r, fill) => `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fill}"/>`;

function chip(x, y, label) {
  const w = 18 + label.length * 12.5;
  return `<rect x="${x}" y="${y}" rx="22" width="${w}" height="44" fill="#ffffff" fill-opacity="0.06" stroke="#ffffff" stroke-opacity="0.12"/>
  <text x="${x + w / 2}" y="${y + 29}" font-family="Arial" font-size="20" fill="#c9c5d6" text-anchor="middle">${esc(label)}</text>`;
}

const W = 1200, H = 630;
let cx = 90;
const chips = ['Cockpit IDoc & filas', 'IA de ponta a ponta', 'S/4HANA Cloud', 'SLA & R$ em risco'];
let chipsSvg = '';
for (const c of chips) { const w = 18 + c.length * 12.5; chipsSvg += chip(cx, 470, c); cx += w + 16; }

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#160e28"/><stop offset="1" stop-color="#0a0712"/></linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>
    <radialGradient id="glow" cx="0.8" cy="0.2" r="0.6"><stop offset="0" stop-color="#7c3aed" stop-opacity="0.25"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="10" fill="url(#brand)"/>

  ${diamond(112, 118, 26, '#a78bfa')}
  <text x="156" y="132" font-family="Arial" font-size="58" font-weight="800" fill="#ffffff">SAPLINK</text>
  <text x="156" y="168" font-family="Arial" font-size="22" fill="#a78bfa" letter-spacing="2">OPERACAO DE INTEGRACOES SAP</text>

  <text x="90" y="300" font-family="Arial" font-size="62" font-weight="800" fill="#ffffff">Monitore, preveja, corrija</text>
  <text x="90" y="372" font-family="Arial" font-size="62" font-weight="800" fill="#ffffff">e prove valor em <tspan fill="#34d399">R$</tspan>.</text>
  <text x="90" y="426" font-family="Arial" font-size="26" fill="#9b95ad">Do IDoc classico ao S/4HANA Cloud — multi-cliente, white-label, com IA.</text>

  ${chipsSvg}

  <text x="${W - 90}" y="${H - 48}" font-family="Arial" font-size="30" font-weight="700" fill="#22d3ee" text-anchor="end">saplink.com.br</text>
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
  <rect width="512" height="512" rx="112" fill="#0f0b1a"/>
  <rect x="40" y="40" width="432" height="432" rx="88" fill="none" stroke="url(#b)" stroke-width="10" stroke-opacity="0.5"/>
  ${diamond(256, 256, 150, 'url(#b)')}
  ${diamond(256, 256, 78, '#0f0b1a')}
</svg>`;

await sharp(Buffer.from(og)).png().toFile(path.join(PUB, 'og.png'));
await sharp(Buffer.from(icon)).png().resize(512, 512).toFile(path.join(PUB, 'icon.png'));
await sharp(Buffer.from(icon)).resize(180, 180).png().toFile(path.join(PUB, 'apple-icon.png'));
console.log('OK ->', PUB);
