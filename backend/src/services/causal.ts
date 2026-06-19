import prisma from '../lib/prisma';

// Correlação causal cross-camada: liga TRANSPORTS (STMS/on-prem) a FALHAS (CPI/IDoc/alertas)
// que apareceram logo depois. Usa dados que só o SAPLINK tem nas duas camadas juntas.

const WINDOW_H = Number(process.env.CAUSAL_WINDOW_HOURS || 8); // janela: falha até Nh após o import

/** Para uma falha (cliente + instante), acha o transport mais provável como causa. */
export async function causeForFailure(clientId: string, occurredAt: Date) {
  const from = new Date(occurredAt.getTime() - WINDOW_H * 3600000);
  const transports = await prisma.transport.findMany({
    where: { clientId, importedAt: { gte: from, lte: occurredAt } },
    orderBy: { importedAt: 'desc' },
  });
  return transports.map((t) => {
    const gapH = (occurredAt.getTime() - new Date(t.importedAt!).getTime()) / 3600000;
    // confiança decai com a distância no tempo (mais perto do import = mais provável)
    const confidence = Math.max(20, Math.round(100 - (gapH / WINDOW_H) * 70));
    return { trNumber: t.trNumber, description: t.description, owner: t.owner, target: t.target, importedAt: t.importedAt, gapHours: Math.round(gapH * 10) / 10, confidence };
  });
}

/** Visão geral: falhas recentes com a mudança que provavelmente as causou. */
export async function causalOverview(consultancyId: string, clientId?: string) {
  const ids = clientId
    ? [clientId]
    : (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);

  // falhas recentes de nuvem (CPI/AIF)
  const fails = await prisma.cloudItem.findMany({
    where: { clientId: { in: ids }, resolved: false },
    orderBy: { occurredAt: 'desc' }, take: 60,
    select: { id: true, clientId: true, source: true, artifact: true, status: true, error: true, occurredAt: true },
  });

  const clientNames = new Map((await prisma.client.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })).map((c) => [c.id, c.name]));
  const links: any[] = [];
  for (const f of fails) {
    if (!f.occurredAt) continue;
    const causes = await causeForFailure(f.clientId, f.occurredAt);
    if (!causes.length) continue;
    links.push({
      client: clientNames.get(f.clientId), source: f.source, artifact: f.artifact, status: f.status,
      error: f.error, occurredAt: f.occurredAt, topCause: causes[0], otherCauses: causes.slice(1, 3),
    });
  }
  // dedup por artefato+transport (1 link por par)
  const seen = new Set<string>();
  const deduped = links.filter((l) => { const k = `${l.artifact}|${l.topCause.trNumber}`; if (seen.has(k)) return false; seen.add(k); return true; });
  return { window: WINDOW_H, summary: { correlated: deduped.length }, items: deduped.slice(0, 30) };
}
