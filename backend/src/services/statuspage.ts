import crypto from 'crypto';
import prisma from '../lib/prisma';

// Status page white-label — página PÚBLICA de saúde das integrações, com a marca da consultoria.

export async function setStatusPage(consultancyId: string, clientId: string, enable: boolean) {
  const client = await prisma.client.findFirst({ where: { id: clientId, consultancyId } });
  if (!client) throw new Error('Cliente não encontrado');
  const token = client.statusToken || (enable ? crypto.randomBytes(16).toString('hex') : null);
  const updated = await prisma.client.update({
    where: { id: clientId },
    data: { statusEnabled: enable, statusToken: token },
  });
  return { enabled: updated.statusEnabled, token: updated.statusToken };
}

export async function getStatusByToken(token: string) {
  const client = await prisma.client.findFirst({
    where: { statusToken: token, statusEnabled: true },
    include: {
      consultancy: { select: { name: true, logoUrl: true, primaryColor: true } },
      integrations: true,
    },
  });
  if (!client) return null;

  const integrations = client.integrations.map((i) => {
    const state = i.status !== 'ACTIVE' ? 'down' : i.uptime >= 99 ? 'operational' : 'degraded';
    return { name: i.name, type: i.type, environment: i.environment, state, uptime: i.uptime };
  });
  const down = integrations.filter((i) => i.state === 'down').length;
  const degraded = integrations.filter((i) => i.state === 'degraded').length;
  const overall = down ? 'down' : degraded ? 'degraded' : 'operational';

  const alerts = await prisma.alert.findMany({
    where: { clientId: client.id }, orderBy: { createdAt: 'desc' }, take: 8,
  });
  const incidents = alerts.map((a) => ({
    severity: a.severity, message: a.message, createdAt: a.createdAt, resolvedAt: a.resolvedAt,
  }));

  return {
    client: client.name,
    brand: {
      name: client.consultancy?.name || 'SAPLINK',
      logoUrl: client.consultancy?.logoUrl || null,
      primaryColor: client.consultancy?.primaryColor || '#7c3aed',
    },
    overall,
    uptimeAvg: integrations.length ? +(integrations.reduce((s, i) => s + i.uptime, 0) / integrations.length).toFixed(2) : 100,
    integrations,
    incidents,
  };
}
