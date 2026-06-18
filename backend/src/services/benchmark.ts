import prisma from '../lib/prisma';

interface Row { type: string; uptime: number; errorRate: number; latency: number; consultancyId: string }

function avg(ns: number[]): number { return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0; }

export interface BenchmarkRow {
  type: string;
  count: number;          // integrações da consultoria desse tipo
  marketCount: number;    // total de mercado desse tipo
  myUptime: number; marketUptime: number; uptimePercentile: number;
  myErrorRate: number; marketErrorRate: number;
  myLatency: number; marketLatency: number;
}

/** Compara a carteira da consultoria contra o agregado anônimo de mercado, por tipo. */
export async function benchmark(consultancyId: string): Promise<{ rows: BenchmarkRow[]; marketTenants: number }> {
  const all = await prisma.integration.findMany({
    select: { type: true, uptime: true, errorRate: true, latency: true, client: { select: { consultancyId: true } } },
  });
  const rows0: Row[] = all.map((i) => ({
    type: (i.type || 'OUTRO').toUpperCase(), uptime: i.uptime ?? 100, errorRate: i.errorRate ?? 0,
    latency: i.latency ?? 0, consultancyId: i.client?.consultancyId || '',
  }));

  const tenants = new Set(rows0.map((r) => r.consultancyId).filter(Boolean));
  const byType = new Map<string, Row[]>();
  for (const r of rows0) { (byType.get(r.type) || byType.set(r.type, []).get(r.type)!).push(r); }

  const myTypes = new Set(rows0.filter((r) => r.consultancyId === consultancyId).map((r) => r.type));

  const rows: BenchmarkRow[] = [];
  for (const type of myTypes) {
    const market = byType.get(type) || [];
    const mine = market.filter((r) => r.consultancyId === consultancyId);
    if (!mine.length) continue;
    const myUptime = parseFloat(avg(mine.map((r) => r.uptime)).toFixed(2));
    const marketUptime = parseFloat(avg(market.map((r) => r.uptime)).toFixed(2));
    const below = market.filter((r) => r.uptime <= myUptime).length;
    const uptimePercentile = market.length ? Math.round((below / market.length) * 100) : 50;
    rows.push({
      type, count: mine.length, marketCount: market.length,
      myUptime, marketUptime, uptimePercentile,
      myErrorRate: parseFloat(avg(mine.map((r) => r.errorRate)).toFixed(2)),
      marketErrorRate: parseFloat(avg(market.map((r) => r.errorRate)).toFixed(2)),
      myLatency: Math.round(avg(mine.map((r) => r.latency))),
      marketLatency: Math.round(avg(market.map((r) => r.latency))),
    });
  }
  rows.sort((a, b) => a.uptimePercentile - b.uptimePercentile);
  return { rows, marketTenants: tenants.size };
}
