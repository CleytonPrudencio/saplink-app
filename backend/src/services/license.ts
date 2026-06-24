import prisma from '../lib/prisma';
import { consultancyClientIds, scopeWithClient } from '../lib/scope';

// Indirect Access / Licensing Radar — uso x direito de licença. Puro monitoramento.
export async function getLicense(consultancyId: string, clientId?: string, env?: string) {
  const clientIds = await consultancyClientIds(consultancyId);
  const scope = scopeWithClient(clientId, clientIds);
  const where: any = { clientId: { in: scope } };
  if (env) where.environment = env;

  const rank: Record<string, number> = { RISK: 0, WARN: 1, OK: 2 };
  const rows = await prisma.licenseItem.findMany({
    where, take: 500,
    include: { client: { select: { name: true } } },
  });

  const items = rows.map((i) => ({
    id: i.id, metric: i.metric, used: i.used, entitled: i.entitled, unit: i.unit,
    riskLevel: i.riskLevel, estCostBrl: i.estCostBrl, detail: i.detail,
    client: i.client?.name, environment: i.environment,
    pct: i.entitled ? Math.round((i.used / i.entitled) * 100) : 0,
  })).sort((a, b) => (rank[a.riskLevel] ?? 9) - (rank[b.riskLevel] ?? 9) || b.estCostBrl - a.estCostBrl);

  const totalExposure = items.reduce((s, i) => s + (i.estCostBrl || 0), 0);
  const atRisk = items.filter((i) => i.riskLevel === 'RISK').length;
  const warn = items.filter((i) => i.riskLevel === 'WARN').length;

  return { items, summary: { total: items.length, atRisk, warn, totalExposure } };
}
