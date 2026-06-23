import prisma from '../lib/prisma';
import { consultancyClientIds, scopeWithClient } from '../lib/scope';

// Grafo dinheiro↔técnico: traduz sinal técnico em R$ em risco AGORA.
// Junta custo de parada por hora (Integration) + docs fiscais bloqueados, agrupado por processo.

export async function moneyGraph(consultancyId: string) {
  const ids = await consultancyClientIds(consultancyId);
  const clients = await prisma.client.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } });
  const ids = clients.map((c) => c.id);
  const names = new Map(clients.map((c) => [c.id, c.name]));

  const integrations = await prisma.integration.findMany({
    where: { clientId: { in: ids } },
    select: { id: true, name: true, clientId: true, status: true, costPerHourCents: true, businessProcess: true },
  });

  // alerta aberto mais antigo por integração → tempo de parada
  const openAlerts = await prisma.alert.findMany({
    where: { integrationId: { in: integrations.map((i) => i.id) }, resolved: false },
    select: { integrationId: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  const downSince = new Map<string, Date>();
  for (const a of openAlerts) if (a.integrationId && !downSince.has(a.integrationId)) downSince.set(a.integrationId, a.createdAt);

  const now = Date.now();
  const nodes = integrations
    .filter((i) => i.status !== 'ACTIVE' && (i.costPerHourCents || 0) > 0)
    .map((i) => {
      const since = downSince.get(i.id);
      const hours = since ? Math.max(0.1, (now - since.getTime()) / 3600000) : 0.5;
      const atRiskCents = Math.round((i.costPerHourCents || 0) * hours);
      return {
        integration: i.name, client: names.get(i.clientId), process: i.businessProcess || 'Não classificado',
        status: i.status, hoursDown: Math.round(hours * 10) / 10, costPerHourCents: i.costPerHourCents, atRiskCents,
      };
    });

  // fiscal bloqueado (docs não resolvidos)
  const fiscal = await prisma.fiscalDoc.findMany({ where: { clientId: { in: ids }, resolved: false }, select: { clientId: true, amountCents: true } });
  const fiscalAtRisk = fiscal.reduce((s, d) => s + d.amountCents, 0);

  // agrega por processo
  const byProcess: Record<string, { atRiskCents: number; integrations: number }> = {};
  for (const n of nodes) {
    byProcess[n.process] = byProcess[n.process] || { atRiskCents: 0, integrations: 0 };
    byProcess[n.process].atRiskCents += n.atRiskCents;
    byProcess[n.process].integrations += 1;
  }
  const downtimeAtRisk = nodes.reduce((s, n) => s + n.atRiskCents, 0);

  return {
    summary: {
      totalAtRiskCents: downtimeAtRisk + fiscalAtRisk,
      downtimeAtRiskCents: downtimeAtRisk,
      fiscalAtRiskCents: fiscalAtRisk,
      integrationsDown: nodes.length,
    },
    byProcess: Object.entries(byProcess).map(([process, v]) => ({ process, ...v })).sort((a, b) => b.atRiskCents - a.atRiskCents),
    nodes: nodes.sort((a, b) => b.atRiskCents - a.atRiskCents),
  };
}
