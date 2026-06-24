import prisma from '../lib/prisma';
import { consultancyClientIds } from '../lib/scope';

// Score de confiabilidade de parceiro EDI + FinOps de BTP (custo estimado por IFlow).

const BTP_RATE_CENTS = Number(process.env.BTP_RATE_CENTS_PER_1K || 30); // R$ 0,30 por 1.000 mensagens (estimativa)

export async function partnerReliability(consultancyId: string) {
  const ids = await consultancyClientIds(consultancyId);
  const items = await prisma.sapItem.findMany({ where: { clientId: { in: ids }, partner: { not: null } }, select: { partner: true, resolved: true } });
  const map = new Map<string, { total: number; errors: number }>();
  for (const it of items) {
    const p = it.partner as string;
    const g = map.get(p) || { total: 0, errors: 0 };
    g.total++; if (!it.resolved) g.errors++;
    map.set(p, g);
  }
  const totalErrors = Array.from(map.values()).reduce((s, g) => s + g.errors, 0) || 1;
  const partners = Array.from(map.entries()).map(([partner, g]) => ({
    partner, total: g.total, errors: g.errors,
    errorRate: g.total ? Math.round((g.errors / g.total) * 100) : 0,
    shareOfErrors: Math.round((g.errors / totalErrors) * 100),
    score: Math.max(0, 100 - Math.round((g.errors / Math.max(1, g.total)) * 100) - g.errors * 2),
  })).sort((a, b) => b.errors - a.errors);
  return { partners, summary: { partners: partners.length, totalErrors } };
}

export async function btpFinops(consultancyId: string) {
  const ids = await consultancyClientIds(consultancyId);
  const since = new Date(Date.now() - 30 * 864e5);
  const items = await prisma.cloudItem.findMany({ where: { clientId: { in: ids }, occurredAt: { gte: since } }, select: { source: true, artifact: true } });
  const map = new Map<string, number>();
  for (const it of items) { const k = `${it.source}|${it.artifact}`; map.set(k, (map.get(k) || 0) + 1); }
  const flows = Array.from(map.entries()).map(([k, count]) => {
    const [source, artifact] = k.split('|');
    const monthlyCents = Math.round((count / 1000) * BTP_RATE_CENTS);
    return { source, artifact, messages30d: count, estMonthlyCents: monthlyCents };
  }).sort((a, b) => b.messages30d - a.messages30d);
  const totalMsgs = flows.reduce((s, f) => s + f.messages30d, 0);
  const totalCents = flows.reduce((s, f) => s + f.estMonthlyCents, 0);
  return { flows, summary: { totalMessages30d: totalMsgs, estMonthlyCents: totalCents, ratePer1kCents: BTP_RATE_CENTS } };
}
