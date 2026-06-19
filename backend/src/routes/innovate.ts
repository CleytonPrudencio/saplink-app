import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireConsultancyAdmin } from '../middleware/roles';
import { topSignatures, lookup, recordFailure, recordFix } from '../services/federated';
import { causalOverview } from '../services/causal';
import { getPolicy, savePolicy, scoreboard } from '../services/autoheal';
import { moneyGraph } from '../services/moneygraph';

// Inovações unicórnio. Montado sob o tenantGate (auth + tenancy já aplicados).
const router = Router();

// ── Rede Federada de Falhas ──
router.get('/federated', async (_req: Request, res: Response) => {
  try { res.json(await topSignatures()); } catch (e) { console.error('federated', e); res.status(500).json({ error: 'Erro na rede federada.' }); }
});
router.get('/federated/lookup', async (req: Request, res: Response) => {
  try { res.json(await lookup(String(req.query.source || ''), String(req.query.message || '')) || { occurrences: 0 }); }
  catch (e) { console.error('federated lookup', e); res.status(500).json({ error: 'Erro na consulta.' }); }
});
// Backfill: alimenta a rede com o histórico de falhas/correções já existente (admin, idempotente).
router.post('/federated/backfill', requireConsultancyAdmin, async (_req: Request, res: Response) => {
  try {
    let failures = 0, fixes = 0;
    const cloud = await prisma.cloudItem.findMany({ where: { resolved: false }, select: { clientId: true, source: true, error: true, status: true }, take: 2000 });
    for (const c of cloud) { await recordFailure(c.clientId, c.source, c.error || c.status); failures++; }
    const items = await prisma.sapItem.findMany({ where: { resolved: false }, select: { clientId: true, kind: true, statusText: true, statusCode: true }, take: 2000 });
    for (const it of items) { await recordFailure(it.clientId, it.kind, it.statusText || it.statusCode); failures++; }
    const actions = await prisma.remediationAction.findMany({ where: { status: { in: ['DONE', 'FAILED'] }, sapItemId: { not: null } }, select: { actionType: true, status: true, sapItemId: true, requestedAt: true, executedAt: true }, take: 2000 });
    for (const a of actions) {
      const item = a.sapItemId ? await prisma.sapItem.findUnique({ where: { id: a.sapItemId }, select: { kind: true, statusText: true } }) : null;
      if (!item) continue;
      const mins = a.executedAt && a.requestedAt ? Math.round((a.executedAt.getTime() - a.requestedAt.getTime()) / 60000) : undefined;
      await recordFix(item.kind, item.statusText, a.actionType, a.status === 'DONE', mins); fixes++;
    }
    res.json({ ok: true, failures, fixes });
  } catch (e) { console.error('backfill', e); res.status(500).json({ error: 'Erro no backfill.' }); }
});

// ── Correlação causal transport→falha ──
router.get('/causal', async (req: Request, res: Response) => {
  try { res.json(await causalOverview(req.consultancyId!, req.query.clientId as string | undefined)); }
  catch (e) { console.error('causal', e); res.status(500).json({ error: 'Erro na correlação causal.' }); }
});

// ── AMS Autônomo ──
router.get('/autoheal', async (req: Request, res: Response) => {
  try { res.json({ policy: await getPolicy(req.consultancyId!), scoreboard: await scoreboard(req.consultancyId!) }); }
  catch (e) { console.error('autoheal', e); res.status(500).json({ error: 'Erro no AMS autônomo.' }); }
});
router.put('/autoheal/policy', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try {
    const { enabled, minConfidence, allowedActions } = req.body || {};
    res.json({ policy: await savePolicy(req.consultancyId!, { enabled, minConfidence, allowedActions }) });
  } catch (e) { console.error('autoheal policy', e); res.status(500).json({ error: 'Erro ao salvar política.' }); }
});

// ── Grafo dinheiro↔técnico ──
router.get('/money', async (req: Request, res: Response) => {
  try { res.json(await moneyGraph(req.consultancyId!)); } catch (e) { console.error('money', e); res.status(500).json({ error: 'Erro no grafo de dinheiro.' }); }
});

export default router;
