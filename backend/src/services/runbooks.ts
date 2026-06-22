import prisma from '../lib/prisma';
import { normalizeError } from './federated';

// Marketplace de runbooks: playbooks de correção publicados/instalados entre consultorias.

interface Step { kind: 'DIAGNOSE' | 'ACTION' | 'VALIDATE'; title: string; detail?: string }
interface RbInput { name: string; description?: string; category?: string; triggerKeywords?: string; steps: Step[]; published?: boolean }

function avg(sum: number, count: number) { return count ? Math.round((sum / count) * 10) / 10 : 0; }

async function authorName(consultancyId: string) {
  const c = await prisma.consultancy.findUnique({ where: { id: consultancyId }, select: { name: true } });
  return c?.name || 'Consultoria';
}

/** Vitrine: runbooks publicados (de qualquer consultoria) + flag de instalado. */
export async function marketplace(consultancyId: string, f: { q?: string; category?: string } = {}) {
  const where: Record<string, unknown> = { published: true };
  if (f.category) where.category = f.category;
  if (f.q) where.OR = [{ name: { contains: f.q, mode: 'insensitive' } }, { description: { contains: f.q, mode: 'insensitive' } }, { triggerKeywords: { contains: f.q, mode: 'insensitive' } }];
  const rbs = await prisma.runbook.findMany({ where: where as any, orderBy: [{ installs: 'desc' }], take: 200 });
  const installed = new Set((await prisma.runbookInstall.findMany({ where: { consultancyId }, select: { runbookId: true } })).map((i) => i.runbookId));
  return rbs.map((r) => ({
    id: r.id, name: r.name, description: r.description, category: r.category,
    author: r.authorName, mine: r.authorConsultancyId === consultancyId,
    steps: (r.steps as any as Step[]).length, installs: r.installs, rating: avg(r.ratingSum, r.ratingCount), ratingCount: r.ratingCount,
    installed: installed.has(r.id),
  }));
}

/** Meus runbooks: criados por mim (rascunhos+publicados) + instalados. */
export async function mine(consultancyId: string) {
  const authored = await prisma.runbook.findMany({ where: { authorConsultancyId: consultancyId }, orderBy: { updatedAt: 'desc' } });
  const installs = await prisma.runbookInstall.findMany({ where: { consultancyId }, orderBy: { installedAt: 'desc' } });
  const instIds = installs.map((i) => i.runbookId);
  const installedRbs = instIds.length ? await prisma.runbook.findMany({ where: { id: { in: instIds } } }) : [];
  const map = (r: any, extra: object = {}) => ({ id: r.id, name: r.name, description: r.description, category: r.category, author: r.authorName, published: r.published, installs: r.installs, rating: avg(r.ratingSum, r.ratingCount), steps: (r.steps as Step[]), ...extra });
  return {
    authored: authored.map((r) => map(r, { mine: true })),
    installed: installedRbs.filter((r) => r.authorConsultancyId !== consultancyId).map((r) => { const ins = installs.find((i) => i.runbookId === r.id); return map(r, { myRating: ins?.rating ?? null }); }),
  };
}

export async function getRunbook(consultancyId: string, id: string) {
  const r = await prisma.runbook.findUnique({ where: { id } });
  if (!r) return { error: 'NOT_FOUND' as const };
  const installed = !!(await prisma.runbookInstall.findUnique({ where: { consultancyId_runbookId: { consultancyId, runbookId: id } } }));
  if (!r.published && r.authorConsultancyId !== consultancyId && !installed) return { error: 'NOT_FOUND' as const };
  return { ok: true, runbook: { id: r.id, name: r.name, description: r.description, category: r.category, triggerKeywords: r.triggerKeywords, author: r.authorName, mine: r.authorConsultancyId === consultancyId, published: r.published, installs: r.installs, rating: avg(r.ratingSum, r.ratingCount), ratingCount: r.ratingCount, steps: r.steps as any as Step[], installed } };
}

export async function create(consultancyId: string, input: RbInput) {
  if (!input.name || !Array.isArray(input.steps) || input.steps.length === 0) return { error: 'INVALID' as const };
  const r = await prisma.runbook.create({ data: { authorConsultancyId: consultancyId, authorName: await authorName(consultancyId), name: input.name, description: input.description ?? null, category: input.category ?? 'GERAL', triggerKeywords: input.triggerKeywords ?? null, steps: input.steps as any, published: !!input.published } });
  return { ok: true, id: r.id };
}

export async function update(consultancyId: string, id: string, input: Partial<RbInput>) {
  const r = await prisma.runbook.findUnique({ where: { id } });
  if (!r || r.authorConsultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  await prisma.runbook.update({ where: { id }, data: { name: input.name ?? r.name, description: input.description ?? r.description, category: input.category ?? r.category, triggerKeywords: input.triggerKeywords ?? r.triggerKeywords, steps: (input.steps as any) ?? r.steps, published: input.published ?? r.published } });
  return { ok: true };
}

export async function setPublished(consultancyId: string, id: string, published: boolean) {
  const r = await prisma.runbook.findUnique({ where: { id } });
  if (!r || r.authorConsultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  await prisma.runbook.update({ where: { id }, data: { published } });
  return { ok: true, published };
}

export async function remove(consultancyId: string, id: string) {
  const r = await prisma.runbook.findUnique({ where: { id } });
  if (!r || r.authorConsultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  await prisma.runbookInstall.deleteMany({ where: { runbookId: id } });
  await prisma.runbook.delete({ where: { id } });
  return { ok: true };
}

export async function install(consultancyId: string, id: string) {
  const r = await prisma.runbook.findUnique({ where: { id } });
  if (!r || (!r.published && r.authorConsultancyId !== consultancyId)) return { error: 'NOT_FOUND' as const };
  const existing = await prisma.runbookInstall.findUnique({ where: { consultancyId_runbookId: { consultancyId, runbookId: id } } });
  if (existing) return { ok: true, already: true };
  await prisma.runbookInstall.create({ data: { consultancyId, runbookId: id } });
  await prisma.runbook.update({ where: { id }, data: { installs: { increment: 1 } } });
  return { ok: true };
}

export async function uninstall(consultancyId: string, id: string) {
  const existing = await prisma.runbookInstall.findUnique({ where: { consultancyId_runbookId: { consultancyId, runbookId: id } } });
  if (!existing) return { ok: true };
  await prisma.runbookInstall.delete({ where: { consultancyId_runbookId: { consultancyId, runbookId: id } } });
  await prisma.runbook.update({ where: { id }, data: { installs: { decrement: 1 } } }).catch(() => {});
  return { ok: true };
}

export async function rate(consultancyId: string, id: string, rating: number) {
  rating = Math.max(1, Math.min(5, Math.round(rating)));
  const ins = await prisma.runbookInstall.findUnique({ where: { consultancyId_runbookId: { consultancyId, runbookId: id } } });
  if (!ins) return { error: 'NOT_INSTALLED' as const };
  // ajusta soma/contagem (substitui nota anterior se houver)
  const prev = ins.rating ?? null;
  await prisma.runbookInstall.update({ where: { consultancyId_runbookId: { consultancyId, runbookId: id } }, data: { rating } });
  await prisma.runbook.update({ where: { id }, data: prev == null ? { ratingSum: { increment: rating }, ratingCount: { increment: 1 } } : { ratingSum: { increment: rating - prev } } });
  return { ok: true };
}

/** Recomendação: runbooks publicados que casam com a assinatura de uma falha. */
export async function recommend(consultancyId: string, source: string, message: string) {
  const norm = normalizeError(`${source} ${message}`);
  const rbs = await prisma.runbook.findMany({ where: { published: true, triggerKeywords: { not: null } }, take: 200 });
  const scored = rbs.map((r) => {
    const kws = (r.triggerKeywords || '').toLowerCase().split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
    const hits = kws.filter((k) => norm.includes(k)).length;
    return { r, hits };
  }).filter((x) => x.hits > 0).sort((a, b) => b.hits - a.hits || b.r.installs - a.r.installs).slice(0, 5);
  return scored.map(({ r }) => ({ id: r.id, name: r.name, category: r.category, author: r.authorName, installs: r.installs, rating: avg(r.ratingSum, r.ratingCount) }));
}
