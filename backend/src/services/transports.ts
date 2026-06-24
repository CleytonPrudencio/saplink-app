import prisma from '../lib/prisma';
import { consultancyClientIds, scopeWithClient } from '../lib/scope';

const DAY_MS = 24 * 3600 * 1000;

export interface TransportInput {
  trNumber: string;
  description?: string;
  owner?: string;
  status?: string;
  target?: string;
  importedAt?: string;
}

/** Ingere transportes reportados pelo agente (upsert por cliente+TR). */
export async function ingestTransports(integrationId: string, clientId: string, items: TransportInput[]) {
  const integ = await prisma.integration.findUnique({ where: { id: integrationId }, select: { environment: true } });
  const environment = integ?.environment || 'PRD';
  let n = 0;
  for (const t of items || []) {
    if (!t.trNumber) continue;
    const data = {
      description: t.description ?? null,
      owner: t.owner ?? null,
      status: t.status ?? null,
      target: t.target ?? null,
      importedAt: t.importedAt ? new Date(t.importedAt) : null,
      integrationId, environment,
    };
    await prisma.transport.upsert({
      where: { clientId_trNumber: { clientId, trNumber: t.trNumber } },
      update: data,
      create: { clientId, trNumber: t.trNumber, ...data },
    });
    n++;
  }
  return { upserted: n };
}

/** Lista transportes da consultoria + correlaciona incidentes abertos com transportes
 *  importados nas 24h anteriores ao alerta (provável causa). */
export async function getTransports(consultancyId: string, clientId?: string, env?: string) {
  const clientIds = await consultancyClientIds(consultancyId);
  const scope = scopeWithClient(clientId, clientIds);
  const envW = env ? { environment: env } : {};

  const [transports, alerts] = await Promise.all([
    prisma.transport.findMany({
      where: { clientId: { in: scope }, ...envW },
      orderBy: { importedAt: 'desc' },
      take: 300,
      include: { client: { select: { name: true } } },
    }),
    prisma.alert.findMany({
      where: { clientId: { in: scope }, resolved: false, ...envW },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { client: { select: { name: true } } },
    }),
  ]);

  const correlations = alerts.map((a) => {
    const suspects = transports.filter((t) => {
      if (t.clientId !== a.clientId || !t.importedAt) return false;
      const dt = a.createdAt.getTime() - new Date(t.importedAt).getTime();
      return dt >= 0 && dt <= DAY_MS; // importado até 24h antes do alerta
    }).map((t) => ({ trNumber: t.trNumber, description: t.description, owner: t.owner, importedAt: t.importedAt, target: t.target }));
    return {
      alert: { id: a.id, severity: a.severity, message: a.message, createdAt: a.createdAt, client: a.client?.name },
      suspects,
    };
  }).filter((c) => c.suspects.length > 0);

  return {
    transports: transports.map((t) => ({
      id: t.id, trNumber: t.trNumber, description: t.description, owner: t.owner,
      status: t.status, target: t.target, importedAt: t.importedAt, client: t.client?.name,
    })),
    correlations,
    summary: { transports: transports.length, openIncidents: alerts.length, correlated: correlations.length },
  };
}
