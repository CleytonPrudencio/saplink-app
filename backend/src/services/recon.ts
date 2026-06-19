import prisma from '../lib/prisma';

// Reconciliação ponta-a-ponta: rastreia o documento de negócio pela jornada esperada
// (ex.: Pedido no CPI → Ordem no S/4 → Fatura) e mostra onde o volume se perde.
// Usa as mensagens reais (CloudItem) por artefato, numa janela de tempo.

interface Stage { label: string; source: string; artifact: string }

async function ownsClient(consultancyId: string, clientId: string) {
  return !!(await prisma.client.findFirst({ where: { id: clientId, consultancyId }, select: { id: true } }));
}

export async function getProcesses(consultancyId: string) {
  const ids = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const procs = await prisma.reconProcess.findMany({ where: { clientId: { in: ids } }, orderBy: { createdAt: 'desc' } });
  const names = new Map((await prisma.client.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })).map((c) => [c.id, c.name]));
  return procs.map((p) => ({ id: p.id, clientId: p.clientId, client: names.get(p.clientId), name: p.name, stages: p.stages }));
}

export async function saveProcess(consultancyId: string, input: { clientId: string; name: string; stages: Stage[] }) {
  if (!(await ownsClient(consultancyId, input.clientId))) return { error: 'NOT_FOUND' as const };
  if (!input.name || !Array.isArray(input.stages) || input.stages.length < 2) return { error: 'INVALID' as const };
  const p = await prisma.reconProcess.create({ data: { clientId: input.clientId, name: input.name, stages: input.stages as any } });
  return { id: p.id };
}

export async function deleteProcess(consultancyId: string, id: string) {
  const p = await prisma.reconProcess.findUnique({ where: { id } });
  if (!p || !(await ownsClient(consultancyId, p.clientId))) return { error: 'NOT_FOUND' as const };
  await prisma.reconProcess.delete({ where: { id } });
  return { ok: true };
}

/** Calcula o funil do processo: quantas mensagens chegaram a cada estágio e onde se perdeu. */
export async function reconcile(consultancyId: string, id: string, windowHours = 24) {
  const p = await prisma.reconProcess.findUnique({ where: { id } });
  if (!p || !(await ownsClient(consultancyId, p.clientId))) return { error: 'NOT_FOUND' as const };
  const stages = (p.stages as any as Stage[]) || [];
  const since = new Date(Date.now() - windowHours * 3600000);

  const computed = [];
  for (const s of stages) {
    const total = await prisma.cloudItem.count({ where: { clientId: p.clientId, source: s.source, artifact: s.artifact, occurredAt: { gte: since } } });
    const ok = await prisma.cloudItem.count({ where: { clientId: p.clientId, source: s.source, artifact: s.artifact, occurredAt: { gte: since }, resolved: true } });
    computed.push({ ...s, total, ok, failed: total - ok });
  }
  // perdas entre estágios (quanto não avançou)
  const links = [];
  for (let i = 1; i < computed.length; i++) {
    const prev = computed[i - 1].ok; // só o que teve sucesso deveria seguir
    const cur = computed[i].total;
    const lost = Math.max(0, prev - cur);
    links.push({ from: computed[i - 1].label, to: computed[i].label, lost, rate: prev ? Math.round((cur / prev) * 100) : 0 });
  }
  const first = computed[0]?.ok || 0;
  const last = computed[computed.length - 1]?.ok || 0;
  const completion = first ? Math.round((last / first) * 100) : 0;
  const biggestGap = links.slice().sort((a, b) => b.lost - a.lost)[0] || null;
  return { ok: true, process: p.name, windowHours, stages: computed, links, completion, biggestGap };
}
