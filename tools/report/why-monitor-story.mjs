// Story (1080x1920) — "Por que monitorar IFlows?" com exemplo de falha.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const W = 1080, H = 1920, MX = 60;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// fluxo real (3 caixas horizontais)
const flow = [["Loja / e-commerce", "cliente faz o pedido"], ["IFlow no CPI", "Sales Order Replication"], ["SAP S/4HANA", "cria a Ordem de Venda"]];
const fw = (W - MX * 2 - 2 * 44) / 3, fy = 470, fh = 130;
let flowSvg = "";
flow.forEach((b, i) => {
  const x = MX + i * (fw + 44);
  flowSvg += `<rect x="${x}" y="${fy}" rx="16" width="${fw}" height="${fh}" fill="#16241c" stroke="#34d399" stroke-width="1.5"/>
  <text x="${x + fw / 2}" y="${fy + 56}" font-family="Arial" font-size="26" font-weight="700" fill="#ffffff" text-anchor="middle">${esc(b[0])}</text>
  <text x="${x + fw / 2}" y="${fy + 90}" font-family="Arial" font-size="19" fill="#9b95ad" text-anchor="middle">${esc(b[1])}</text>`;
  if (i < 2) flowSvg += `<text x="${x + fw + 22}" y="${fy + fh / 2 + 12}" font-family="Arial" font-size="34" font-weight="800" fill="#34d399" text-anchor="middle">›</text>`;
});

// colunas comparativas
function col(x, title, color, bg, items) {
  let s = `<rect x="${x}" y="1150" rx="18" width="${(W - MX * 2 - 40) / 2}" height="520" fill="${bg}" stroke="${color}" stroke-width="1.5"/>
  <text x="${x + 28}" y="1210" font-family="Arial" font-size="28" font-weight="800" fill="${color}">${esc(title)}</text>`;
  const cw = (W - MX * 2 - 40) / 2;
  items.forEach((t, i) => {
    const y = 1270 + i * 95;
    s += `<circle cx="${x + 36}" cy="${y - 8}" r="6" fill="${color}"/>
    <text x="${x + 54}" y="${y}" font-family="Arial" font-size="23" fill="#e2e0ea"><tspan>${esc(t)}</tspan></text>`;
  });
  return s;
}
// quebra manual em 2 linhas se longo
function lines(x, baseY, cw, items, color) {
  let s = "";
  items.forEach((t, i) => {
    const y = baseY + i * 92;
    s += `<circle cx="${x + 18}" cy="${y - 7}" r="6" fill="${color}"/>`;
    const words = t.split(" "); let l1 = "", l2 = ""; let cur = "";
    for (const w of words) { if ((cur + " " + w).length <= 26) cur = (cur ? cur + " " : "") + w; else { if (!l1) { l1 = cur; cur = w; } else { l2 += (l2 ? " " : "") + w; } } }
    if (!l1) l1 = cur; else if (cur && !l2) l2 = cur; else if (cur) l2 += " " + cur;
    s += `<text x="${x + 38}" y="${y}" font-family="Arial" font-size="22" fill="#e2e0ea">${esc(l1)}</text>`;
    if (l2) s += `<text x="${x + 38}" y="${y + 28}" font-family="Arial" font-size="22" fill="#e2e0ea">${esc(l2)}</text>`;
  });
  return s;
}

const colW = (W - MX * 2 - 40) / 2;
const semX = MX, comX = MX + colW + 40;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140d24"/><stop offset="1" stop-color="#0a0712"/></linearGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="14" fill="url(#brand)"/>
  <polygon points="${MX + 24},150 ${MX + 58},184 ${MX + 24},218 ${MX - 10},184" fill="#a78bfa"/>
  <text x="${MX + 84}" y="204" font-family="Arial" font-size="60" font-weight="800" fill="#ffffff">SAPLINK</text>
  <text x="${MX}" y="300" font-family="Arial" font-size="46" font-weight="800" fill="#ffffff">Por que monitorar os IFlows?</text>
  <text x="${MX}" y="350" font-family="Arial" font-size="24" fill="#a78bfa">Cada integração carrega dinheiro. Quando para, o negócio para.</text>

  <text x="${MX}" y="430" font-family="Arial" font-size="22" font-weight="700" fill="#34d399" letter-spacing="1">O FLUXO NORMAL (exemplo)</text>
  ${flowSvg}

  <!-- falha -->
  <text x="${MX}" y="700" font-family="Arial" font-size="22" font-weight="700" fill="#f87171" letter-spacing="1">E QUANDO O IFLOW FALHA?</text>
  <rect x="${MX}" y="730" rx="18" width="${W - MX * 2}" height="320" fill="#1f1216" stroke="#f87171" stroke-width="1.5"/>
  <rect x="${MX}" y="730" width="9" height="320" fill="#f87171"/>
  <text x="${MX + 34}" y="790" font-family="Arial" font-size="28" font-weight="800" fill="#ffffff">IFlow: SalesOrder_Replication  ·  <tspan fill="#f87171">FAILED</tspan></text>
  <text x="${MX + 34}" y="836" font-family="Arial" font-size="23" fill="#e2e0ea">Erro: HTTP 500 do SAP — "Sold-to party não encontrado"</text>
  <text x="${MX + 34}" y="872" font-family="Arial" font-size="23" fill="#e2e0ea">Status SEFAZ/SAP: mensagem não processada</text>
  <rect x="${MX + 34}" y="906" rx="10" width="${W - MX * 2 - 68}" height="110" fill="#0f0b1a"/>
  <text x="${MX + 56}" y="952" font-family="Arial" font-size="24" font-weight="700" fill="#fbbf24">Resultado: o pedido do cliente NÃO entra no SAP</text>
  <text x="${MX + 56}" y="990" font-family="Arial" font-size="22" fill="#9b95ad">→ faturamento parado, estoque divergente, cliente sem resposta</text>

  <!-- comparacao -->
  <rect x="${semX}" y="1150" rx="18" width="${colW}" height="520" fill="#1f1216" stroke="#f87171" stroke-width="1.5"/>
  <text x="${semX + 28}" y="1212" font-family="Arial" font-size="28" font-weight="800" fill="#f87171">SEM SAPLINK</text>
  ${lines(semX + 12, 1280, colW, ["Ninguém percebe a falha", "Cliente liga bravo horas depois", "Pedidos e receita parados", "Apaga-incêndio e desgaste"], "#f87171")}

  <rect x="${comX}" y="1150" rx="18" width="${colW}" height="520" fill="#16241c" stroke="#34d399" stroke-width="1.5"/>
  <text x="${comX + 28}" y="1212" font-family="Arial" font-size="28" font-weight="800" fill="#34d399">COM SAPLINK</text>
  ${lines(comX + 12, 1280, colW, ["Detecta a falha na hora", "Alerta no Slack/Teams + ticket", "Mede SLA e impacto em R$", "Corrige antes do cliente sentir"], "#34d399")}

  <text x="${W / 2}" y="1760" font-family="Arial" font-size="32" font-weight="800" fill="#ffffff" text-anchor="middle">O radar que enxerga o que o SAP esconde.</text>
  <text x="${W / 2}" y="${H - 46}" font-family="Arial" font-size="30" font-weight="800" fill="#22d3ee" text-anchor="middle">saplink.com.br</text>
</svg>`;

const file = path.join(OUT, 'SAPLINK-porque-monitorar-story.png');
await sharp(Buffer.from(svg)).png().toFile(file);
console.log('OK:', file);
