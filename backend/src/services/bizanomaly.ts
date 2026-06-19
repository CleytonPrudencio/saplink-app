import prisma from '../lib/prisma';

// Perda silenciosa de negócio: detecta queda anormal de VOLUME de mensagens por artefato,
// mesmo com tudo "verde" tecnicamente. Compara a última hora com a média das horas anteriores.

const DROP = Number(process.env.ANOMALY_DROP || 0.4);   // queda relativa que dispara (40%)
const MIN_BASELINE = Number(process.env.ANOMALY_MIN || 4); // volume mínimo p/ valer a pena comparar
const WINDOW_H = 12;

export async function detectAnomalies(consultancyId: string, clientId?: string) {
  const ids = clientId
    ? [clientId]
    : (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const names = new Map((await prisma.client.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })).map((c) => [c.id, c.name]));

  const since = new Date(Date.now() - (WINDOW_H + 1) * 3600000);
  const rows = await prisma.cloudItem.findMany({
    where: { clientId: { in: ids }, occurredAt: { gte: since } },
    select: { clientId: true, source: true, artifact: true, occurredAt: true },
  });

  // agrupa por cliente|source|artefato e por hora
  const groups = new Map<string, { clientId: string; source: string; artifact: string; perHour: number[] }>();
  const now = Date.now();
  for (const r of rows) {
    if (!r.occurredAt) continue;
    const hoursAgo = Math.floor((now - r.occurredAt.getTime()) / 3600000);
    if (hoursAgo < 0 || hoursAgo > WINDOW_H) continue;
    const key = `${r.clientId}|${r.source}|${r.artifact}`;
    let g = groups.get(key);
    if (!g) { g = { clientId: r.clientId, source: r.source, artifact: r.artifact, perHour: new Array(WINDOW_H + 1).fill(0) }; groups.set(key, g); }
    g.perHour[hoursAgo] += 1;
  }

  const items = [];
  for (const g of groups.values()) {
    const current = g.perHour[0] + g.perHour[1]; // últimas ~2h (tolera atraso de ingest)
    const baselineHours = g.perHour.slice(2); // horas anteriores
    const baseAvg2h = baselineHours.length ? (baselineHours.reduce((s, n) => s + n, 0) / baselineHours.length) * 2 : 0;
    if (baseAvg2h < MIN_BASELINE) continue;
    const drop = baseAvg2h ? 1 - current / baseAvg2h : 0;
    const status = drop >= DROP ? (current === 0 ? 'STOPPED' : 'DROP') : 'OK';
    items.push({
      client: names.get(g.clientId), source: g.source, artifact: g.artifact,
      expected: Math.round(baseAvg2h), current, dropPct: Math.round(drop * 100), status,
    });
  }
  items.sort((a, b) => b.dropPct - a.dropPct);
  const anomalies = items.filter((i) => i.status !== 'OK');
  return { summary: { tracked: items.length, anomalies: anomalies.length }, items };
}
