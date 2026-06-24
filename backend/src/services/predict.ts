import prisma from '../lib/prisma';
import { consultancyClientIds } from '../lib/scope';

/** Snapshot periódico das métricas de todas as integrações (alimenta a previsão). */
export async function snapshotMetrics(): Promise<number> {
  const integrations = await prisma.integration.findMany({ select: { id: true, clientId: true, latency: true, errorRate: true, uptime: true } });
  if (!integrations.length) return 0;
  // profundidade de fila = itens operacionais abertos por integração
  const items = await prisma.sapItem.groupBy({ by: ['integrationId'], where: { resolved: false }, _count: { _all: true } });
  const depthMap = new Map(items.map((i) => [i.integrationId, i._count._all]));
  for (const i of integrations) {
    await prisma.metricSample.create({
      data: {
        integrationId: i.id, clientId: i.clientId,
        latency: i.latency, errorRate: i.errorRate, uptime: i.uptime,
        queueDepth: depthMap.get(i.id) || 0,
      },
    });
  }
  // retenção: remove amostras com mais de 14 dias
  await prisma.metricSample.deleteMany({ where: { capturedAt: { lt: new Date(Date.now() - 14 * 864e5) } } });
  return integrations.length;
}

function avg(ns: number[]): number { return ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0; }

export interface Prediction {
  integrationId: string; integration: string; client: string; status: string;
  riskScore: number; level: 'LOW' | 'MEDIUM' | 'HIGH'; forecast: string;
  signals: string[]; samples: number;
  errorRate: number; uptime: number; latency: number; queueDepth: number;
}

/** Calcula o risco de falha por integração: estado atual + tendência (quando há histórico). */
export async function predict(consultancyId: string, env?: string): Promise<{ predictions: Prediction[]; summary: { high: number; medium: number; low: number } }> {
  const scoped = await consultancyClientIds(consultancyId);
  const integrations = await prisma.integration.findMany({
    where: { client: { id: { in: scoped } }, ...(env ? { environment: env } : {}) },
    select: { id: true, name: true, status: true, latency: true, errorRate: true, uptime: true, client: { select: { name: true } } },
  });

  const since = new Date(Date.now() - 24 * 3600 * 1000);
  const predictions: Prediction[] = [];

  for (const i of integrations) {
    const samples = await prisma.metricSample.findMany({
      where: { integrationId: i.id, capturedAt: { gte: since } },
      orderBy: { capturedAt: 'asc' }, take: 60,
    });
    const queueDepth = samples.length ? samples[samples.length - 1].queueDepth : 0;
    const signals: string[] = [];
    let score = 0;

    // estado atual
    const er = i.errorRate ?? 0, up = i.uptime ?? 100;
    score += Math.min(50, er * 0.5);
    score += Math.min(40, (100 - up) * 0.4);
    score += Math.min(15, queueDepth * 2);
    if (er > 10) signals.push(`taxa de erro em ${er}%`);
    if (up < 95) signals.push(`uptime em ${up}%`);
    if (queueDepth > 0) signals.push(`${queueDepth} item(ns) na fila`);

    // tendência (precisa de histórico)
    if (samples.length >= 4) {
      const third = Math.max(1, Math.floor(samples.length / 3));
      const firstErr = avg(samples.slice(0, third).map((s) => s.errorRate));
      const lastErr = avg(samples.slice(-third).map((s) => s.errorRate));
      const firstLat = avg(samples.slice(0, third).map((s) => s.latency));
      const lastLat = avg(samples.slice(-third).map((s) => s.latency));
      if (lastErr - firstErr > 3) { score += 15; signals.push('taxa de erro em alta'); }
      if (firstLat > 0 && lastLat > firstLat * 1.5) { score += 10; signals.push('latência subindo'); }
      const firstQ = avg(samples.slice(0, third).map((s) => s.queueDepth));
      const lastQ = avg(samples.slice(-third).map((s) => s.queueDepth));
      if (lastQ - firstQ > 2) { score += 10; signals.push('fila crescendo'); }
    }

    score = Math.min(100, Math.round(score));
    const level: Prediction['level'] = score >= 66 ? 'HIGH' : score >= 33 ? 'MEDIUM' : 'LOW';
    const forecast = level === 'HIGH'
      ? 'Risco alto de falha — agir preventivamente agora.'
      : level === 'MEDIUM'
        ? 'Sinais de degradação — monitorar de perto.'
        : samples.length < 4 ? 'Estável (coletando histórico para tendência).' : 'Estável.';

    predictions.push({
      integrationId: i.id, integration: i.name, client: i.client?.name || '-', status: i.status,
      riskScore: score, level, forecast, signals, samples: samples.length,
      errorRate: er, uptime: up, latency: i.latency ?? 0, queueDepth,
    });
  }

  predictions.sort((a, b) => b.riskScore - a.riskScore);
  return {
    predictions,
    summary: {
      high: predictions.filter((p) => p.level === 'HIGH').length,
      medium: predictions.filter((p) => p.level === 'MEDIUM').length,
      low: predictions.filter((p) => p.level === 'LOW').length,
    },
  };
}
