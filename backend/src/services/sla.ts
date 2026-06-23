import prisma from '../lib/prisma';
import { consultancyClientIds } from '../lib/scope';
import { narrateSla, aiEnabled, type Lang } from './ai';

export interface SlaClient {
  clientId: string;
  client: string;
  uptimeTarget: number;
  maxLatencyMs: number;
  avgUptime: number;
  avgLatency: number;
  integrations: number;
  meeting: number;
  compliance: number; // %
  breaches: { name: string; type: string; uptime: number; latency: number; reason: string }[];
}

/** Calcula o SLA de cada cliente da consultoria (uptime/latência vs meta). */
export async function computeSla(consultancyId: string, env?: string): Promise<{ clients: SlaClient[]; overall: number }> {
  const scoped = await consultancyClientIds(consultancyId);
  const clients = await prisma.client.findMany({
    where: { id: { in: scoped } },
    select: {
      id: true, name: true, slaUptimeTarget: true, slaMaxLatencyMs: true,
      integrations: { where: env ? { environment: env } : {}, select: { name: true, type: true, uptime: true, latency: true, status: true } },
    },
  });

  const out: SlaClient[] = clients.map((c) => {
    const ints = c.integrations;
    const n = ints.length;
    const avgUptime = n ? parseFloat((ints.reduce((s, i) => s + (i.uptime ?? 0), 0) / n).toFixed(2)) : 100;
    const avgLatency = n ? Math.round(ints.reduce((s, i) => s + (i.latency ?? 0), 0) / n) : 0;
    const breaches = ints
      .filter((i) => (i.uptime ?? 100) < c.slaUptimeTarget || (i.latency ?? 0) > c.slaMaxLatencyMs)
      .map((i) => ({
        name: i.name, type: i.type, uptime: i.uptime ?? 0, latency: i.latency ?? 0,
        reason: (i.uptime ?? 100) < c.slaUptimeTarget
          ? `uptime ${i.uptime}% < meta ${c.slaUptimeTarget}%`
          : `latência ${i.latency}ms > meta ${c.slaMaxLatencyMs}ms`,
      }));
    const meeting = n - breaches.length;
    const compliance = n ? parseFloat(((meeting / n) * 100).toFixed(1)) : 100;
    return {
      clientId: c.id, client: c.name, uptimeTarget: c.slaUptimeTarget, maxLatencyMs: c.slaMaxLatencyMs,
      avgUptime, avgLatency, integrations: n, meeting, compliance, breaches,
    };
  });

  const withInts = out.filter((c) => c.integrations > 0);
  const overall = withInts.length
    ? parseFloat((withInts.reduce((s, c) => s + c.compliance, 0) / withInts.length).toFixed(1))
    : 100;
  return { clients: out, overall };
}

export async function setSlaTargets(consultancyId: string, clientId: string, uptimeTarget?: number, maxLatencyMs?: number) {
  const client = await prisma.client.findFirst({ where: { id: clientId, consultancyId } });
  if (!client) return { error: 'NOT_FOUND' as const };
  const data: Record<string, number> = {};
  if (typeof uptimeTarget === 'number' && uptimeTarget > 0 && uptimeTarget <= 100) data.slaUptimeTarget = uptimeTarget;
  if (typeof maxLatencyMs === 'number' && maxLatencyMs > 0) data.slaMaxLatencyMs = maxLatencyMs;
  const updated = await prisma.client.update({ where: { id: clientId }, data });
  return { client: { slaUptimeTarget: updated.slaUptimeTarget, slaMaxLatencyMs: updated.slaMaxLatencyMs } };
}

/** Relatório mensal narrado por IA para um cliente. */
export async function slaReport(consultancyId: string, clientId: string, lang: Lang = 'pt') {
  const { clients } = await computeSla(consultancyId);
  const c = clients.find((x) => x.clientId === clientId);
  if (!c) return { error: 'NOT_FOUND' as const };
  const narrative = aiEnabled() ? await narrateSla(c, consultancyId, lang) : '';
  return { data: c, narrative };
}
