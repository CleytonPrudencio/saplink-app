import crypto from 'node:crypto';
import prisma from '../lib/prisma';

const APP_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

export function portalUrl(token: string): string {
  return `${APP_URL}/portal/${token}`;
}

/** Habilita o portal de um cliente da consultoria e garante um token. */
export async function enablePortal(consultancyId: string, clientId: string) {
  const client = await prisma.client.findFirst({ where: { id: clientId, consultancyId } });
  if (!client) return { error: 'NOT_FOUND' as const };
  const token = client.portalToken || crypto.randomBytes(24).toString('hex');
  await prisma.client.update({ where: { id: clientId }, data: { portalEnabled: true, portalToken: token } });
  return { token, url: portalUrl(token), portalEnabled: true };
}

export async function disablePortal(consultancyId: string, clientId: string) {
  const client = await prisma.client.findFirst({ where: { id: clientId, consultancyId } });
  if (!client) return { error: 'NOT_FOUND' as const };
  await prisma.client.update({ where: { id: clientId }, data: { portalEnabled: false } });
  return { portalEnabled: false };
}

export async function regenerateToken(consultancyId: string, clientId: string) {
  const client = await prisma.client.findFirst({ where: { id: clientId, consultancyId } });
  if (!client) return { error: 'NOT_FOUND' as const };
  const token = crypto.randomBytes(24).toString('hex');
  await prisma.client.update({ where: { id: clientId }, data: { portalToken: token, portalEnabled: true } });
  return { token, url: portalUrl(token), portalEnabled: true };
}

/** Dados read-only do portal público (resolvidos por token). Branding da consultoria. */
export async function getPortalData(token: string) {
  if (!token) return null;
  const client = await prisma.client.findFirst({
    where: { portalToken: token, portalEnabled: true },
    include: {
      consultancy: { select: { name: true, logoUrl: true, primaryColor: true } },
      integrations: { select: { name: true, type: true, status: true, uptime: true, errorRate: true, latency: true } },
    },
  });
  if (!client) return null;

  const alerts = await prisma.alert.findMany({
    where: { clientId: client.id, resolved: false },
    orderBy: { createdAt: 'desc' }, take: 20,
    select: { severity: true, message: true, createdAt: true },
  });

  const integrations = client.integrations;
  const byStatus: Record<string, number> = {};
  for (const i of integrations) {
    const s = (i.status || 'PENDING').toUpperCase();
    byStatus[s] = (byStatus[s] || 0) + 1;
  }
  const avgUptime = integrations.length
    ? parseFloat((integrations.reduce((s, i) => s + (i.uptime ?? 0), 0) / integrations.length).toFixed(2))
    : 100;

  return {
    consultancy: client.consultancy,
    client: { name: client.name, healthScore: client.healthScore },
    summary: { integrations: integrations.length, byStatus, avgUptime, openIncidents: alerts.length },
    integrations: integrations.map((i) => ({
      name: i.name, type: i.type, status: i.status, uptime: i.uptime, errorRate: i.errorRate, latency: i.latency,
    })),
    incidents: alerts,
  };
}
