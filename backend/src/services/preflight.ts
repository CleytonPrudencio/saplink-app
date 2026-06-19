import prisma from '../lib/prisma';

// Pré-voo de mudança (blast radius): antes de um transport ir pra PRD, calcula o raio
// de impacto — interfaces, processos de negócio e R$/h em risco — e um score de risco.

const brlH = (cents: number) => cents;

export async function listTransports(consultancyId: string) {
  const ids = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const ts = await prisma.transport.findMany({ where: { clientId: { in: ids } }, orderBy: { importedAt: 'desc' }, take: 50 });
  const names = new Map((await prisma.client.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })).map((c) => [c.id, c.name]));
  return ts.map((t) => ({ id: t.id, trNumber: t.trNumber, description: t.description, owner: t.owner, target: t.target, importedAt: t.importedAt, client: names.get(t.clientId) }));
}

export async function blastRadius(consultancyId: string, transportId: string) {
  const t = await prisma.transport.findUnique({ where: { id: transportId } });
  if (!t) return { error: 'NOT_FOUND' as const };
  const client = await prisma.client.findFirst({ where: { id: t.clientId, consultancyId }, select: { id: true, name: true } });
  if (!client) return { error: 'NOT_FOUND' as const };

  const integrations = await prisma.integration.findMany({ where: { clientId: client.id }, select: { name: true, type: true, status: true, costPerHourCents: true, businessProcess: true } });
  const catalog = await prisma.interfaceCatalogItem.findMany({ where: { clientId: client.id, active: true }, select: { kind: true, name: true, detail: true }, take: 50 });
  const processes = Array.from(new Set(integrations.map((i) => i.businessProcess).filter(Boolean))) as string[];
  const atRiskPerHourCents = integrations.reduce((s, i) => s + (i.costPerHourCents || 0), 0);

  // score heurístico
  const desc = (t.description || '').toLowerCase();
  let score = 15; const factors: string[] = [];
  if (/user-?exit|badi|enhancement|exit|abap/.test(desc)) { score += 30; factors.push('Mexe em user-exit/enhancement ABAP (alto risco)'); }
  if (/idoc|estrutura|segment|we/.test(desc)) { score += 20; factors.push('Altera estrutura/processamento de IDoc'); }
  if (/map|cpi|interface|destino|rfc|sm59/.test(desc)) { score += 15; factors.push('Toca mapeamento/interface/destino'); }
  if (/config|param|tabela|customiz/.test(desc)) { score += 8; factors.push('Mudança de configuração'); }
  if (t.target === 'PRD') { score += 12; factors.push('Alvo é PRODUÇÃO'); }
  score += Math.min(20, integrations.length * 4);
  score = Math.min(100, score);
  if (!factors.length) factors.push('Mudança de baixo impacto aparente');

  // recorrência: já houve falha correlacionada a transports nesse cliente?
  const recentFails = await prisma.cloudItem.count({ where: { clientId: client.id, resolved: false } });

  return {
    ok: true,
    transport: { trNumber: t.trNumber, description: t.description, owner: t.owner, target: t.target, client: client.name },
    riskScore: score,
    riskLevel: score >= 70 ? 'ALTO' : score >= 40 ? 'MÉDIO' : 'BAIXO',
    riskFactors: factors,
    affected: {
      integrations: integrations.map((i) => ({ name: i.name, type: i.type, status: i.status, process: i.businessProcess })),
      interfaces: catalog,
      processes,
      atRiskPerHourCents: brlH(atRiskPerHourCents),
    },
    openFailures: recentFails,
    testPlan: [
      'Smoke test das interfaces do processo afetado logo após o import',
      processes.length ? `Validar ponta-a-ponta o(s) processo(s): ${processes.join(', ')}` : 'Validar o processo de negócio afetado ponta-a-ponta',
      'Comparar volume/latência antes e depois (baseline)',
      'Monitorar alertas e MPL nas 2h seguintes ao import',
    ],
  };
}
