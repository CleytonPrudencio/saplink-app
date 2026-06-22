import prisma from '../lib/prisma';

const HOUR_MS = 3600000;

export interface ImpactItem {
  integrationId: string;
  integration: string;
  client: string;
  status: string;
  businessProcess: string | null;
  costPerHourCents: number;
  atRisk: boolean;              // fora do ar agora
  hoursDown: number;           // estimativa pela idade do alerta aberto
  accumulatedCents: number;    // exposição acumulada estimada
}

/** Calcula a exposição financeira: R$/h em risco (integrações fora do ar) e
 *  exposição acumulada estimada pela idade dos alertas abertos. */
export async function computeImpact(consultancyId: string, env?: string) {
  const integrations = await prisma.integration.findMany({
    where: { client: { consultancyId }, costPerHourCents: { gt: 0 }, ...(env ? { environment: env } : {}) },
    select: {
      id: true, name: true, status: true, costPerHourCents: true, businessProcess: true,
      client: { select: { name: true } },
      alerts: { where: { resolved: false }, orderBy: { createdAt: 'asc' }, take: 1, select: { createdAt: true } },
    },
  });

  let riskPerHourCents = 0;
  let accumulatedCents = 0;
  const items: ImpactItem[] = integrations.map((i) => {
    const atRisk = (i.status || '').toUpperCase() !== 'ACTIVE';
    const openAlert = i.alerts[0];
    const hoursDown = atRisk && openAlert ? Math.max(0, (Date.now() - new Date(openAlert.createdAt).getTime()) / HOUR_MS) : 0;
    const accumulated = Math.round(hoursDown * i.costPerHourCents);
    if (atRisk) riskPerHourCents += i.costPerHourCents;
    accumulatedCents += accumulated;
    return {
      integrationId: i.id, integration: i.name, client: i.client?.name || '-', status: i.status,
      businessProcess: i.businessProcess, costPerHourCents: i.costPerHourCents,
      atRisk, hoursDown: parseFloat(hoursDown.toFixed(1)), accumulatedCents: accumulated,
    };
  });

  items.sort((a, b) => b.accumulatedCents - a.accumulatedCents || b.costPerHourCents - a.costPerHourCents);
  return {
    items,
    totals: {
      monitoredWithCost: items.length,
      atRisk: items.filter((i) => i.atRisk).length,
      riskPerHourCents,
      accumulatedCents,
    },
  };
}

export async function setCost(consultancyId: string, integrationId: string, costPerHourCents?: number, businessProcess?: string) {
  const integ = await prisma.integration.findFirst({ where: { id: integrationId, client: { consultancyId } } });
  if (!integ) return { error: 'NOT_FOUND' as const };
  const data: Record<string, unknown> = {};
  if (typeof costPerHourCents === 'number' && costPerHourCents >= 0) data.costPerHourCents = Math.round(costPerHourCents);
  if (businessProcess !== undefined) data.businessProcess = businessProcess?.trim() || null;
  const u = await prisma.integration.update({ where: { id: integrationId }, data });
  return { integration: { costPerHourCents: u.costPerHourCents, businessProcess: u.businessProcess } };
}

/** Lista integrações da consultoria (para o admin definir custo). */
export async function listForCost(consultancyId: string) {
  const list = await prisma.integration.findMany({
    where: { client: { consultancyId } },
    select: { id: true, name: true, type: true, costPerHourCents: true, businessProcess: true, client: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });
  return list.map((i) => ({ id: i.id, name: i.name, type: i.type, client: i.client?.name, costPerHourCents: i.costPerHourCents, businessProcess: i.businessProcess }));
}
