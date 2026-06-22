import prisma from '../lib/prisma';

// Recalcula o healthScore de cada cliente a partir dos dados REAIS (sem simular):
// disponibilidade das integrações + latência + erro + alertas abertos.
export async function recomputeHealthScores(consultancyId?: string): Promise<number> {
  const clients = await prisma.client.findMany({
    where: consultancyId ? { consultancyId } : {},
    include: {
      integrations: { select: { status: true, latency: true, errorRate: true } },
      alerts: { where: { resolved: false }, select: { id: true } },
    },
  });
  let updated = 0;
  for (const c of clients) {
    const ints = c.integrations;
    let score: number;
    if (ints.length === 0) {
      // sem integrações: penaliza só por alertas abertos
      score = Math.max(0, 100 - c.alerts.length * 10);
    } else {
      const availability = (ints.filter((i) => i.status === 'ACTIVE').length / ints.length) * 100;
      const avgLatency = ints.reduce((s, i) => s + (i.latency || 0), 0) / ints.length;
      const performance = Math.max(0, 100 - avgLatency / 10);
      const avgErr = ints.reduce((s, i) => s + (i.errorRate || 0), 0) / ints.length;
      const errors = Math.max(0, 100 - avgErr * 2);
      const compliance = Math.max(0, 100 - c.alerts.length * 10);
      score = Math.round(availability * 0.3 + performance * 0.25 + errors * 0.25 + compliance * 0.2);
    }
    score = Math.min(100, Math.max(0, score));
    if (score !== c.healthScore) { await prisma.client.update({ where: { id: c.id }, data: { healthScore: score } }); updated++; }
  }
  return updated;
}
