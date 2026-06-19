import prisma from '../lib/prisma';

// Time machine de incidente: reconstrói a linha do tempo (transports, falhas, alertas)
// em torno de um alerta e calcula o contrafactual ("se detectado em X min, R$ salvo").

export async function listIncidents(consultancyId: string) {
  const ids = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const alerts = await prisma.alert.findMany({
    where: { clientId: { in: ids } }, orderBy: { createdAt: 'desc' }, take: 40,
    include: { client: { select: { name: true } }, integration: { select: { name: true } } },
  });
  return alerts.map((a) => ({ id: a.id, type: a.type, severity: a.severity, message: a.message, resolved: a.resolved, createdAt: a.createdAt, client: a.client?.name, integration: a.integration?.name }));
}

export async function timeline(consultancyId: string, alertId: string) {
  const alert = await prisma.alert.findUnique({ where: { id: alertId }, include: { client: true, integration: true } });
  if (!alert || alert.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  const clientId = alert.clientId;
  const start = new Date(alert.createdAt.getTime() - 6 * 3600000);
  const end = alert.resolvedAt || new Date();

  const [transports, fails, alerts] = await Promise.all([
    prisma.transport.findMany({ where: { clientId, importedAt: { gte: start, lte: end } }, select: { trNumber: true, description: true, owner: true, importedAt: true } }),
    prisma.cloudItem.findMany({ where: { clientId, occurredAt: { gte: start, lte: end } }, select: { source: true, artifact: true, status: true, occurredAt: true }, take: 100 }),
    prisma.alert.findMany({ where: { clientId, createdAt: { gte: start, lte: end } }, select: { type: true, severity: true, message: true, createdAt: true, resolvedAt: true } }),
  ]);

  const events: { at: Date; kind: string; label: string; tone: string }[] = [];
  for (const t of transports) if (t.importedAt) events.push({ at: t.importedAt, kind: 'TRANSPORT', label: `Transport ${t.trNumber} importado${t.description ? ` — ${t.description}` : ''}`, tone: 'warn' });
  for (const f of fails) if (f.occurredAt) events.push({ at: f.occurredAt, kind: 'MSG', label: `${f.source} ${f.artifact} — ${f.status}`, tone: /FAIL|ERROR|ESCAL/i.test(f.status || '') ? 'bad' : 'ok' });
  for (const a of alerts) {
    events.push({ at: a.createdAt, kind: 'ALERT', label: `Alerta ${a.severity}: ${a.message.slice(0, 70)}`, tone: 'bad' });
    if (a.resolvedAt) events.push({ at: a.resolvedAt, kind: 'RESOLVE', label: `Resolvido: ${a.message.slice(0, 50)}`, tone: 'ok' });
  }
  events.sort((a, b) => a.at.getTime() - b.at.getTime());

  const costPerHourCents = alert.integration?.costPerHourCents || 0;
  const durationMin = Math.max(1, Math.round((end.getTime() - alert.createdAt.getTime()) / 60000));
  const actualCents = Math.round((costPerHourCents / 60) * durationMin);

  return {
    ok: true,
    incident: { message: alert.message, severity: alert.severity, client: alert.client.name, integration: alert.integration?.name, createdAt: alert.createdAt, resolvedAt: alert.resolvedAt },
    events: events.map((e) => ({ at: e.at, kind: e.kind, label: e.label, tone: e.tone })),
    cost: { costPerHourCents, durationMin, actualCents },
  };
}
