import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireConsultancyAdmin } from '../middleware/roles';
import { topSignatures, lookup, recordFailure, recordFix } from '../services/federated';
import { causalOverview } from '../services/causal';
import { getPolicy, savePolicy, scoreboard } from '../services/autoheal';
import { moneyGraph } from '../services/moneygraph';
import { getProcesses, saveProcess, deleteProcess, reconcile } from '../services/recon';
import { detectAnomalies } from '../services/bizanomaly';
import { getConfig as getChatops, rotateToken, run as runChatops } from '../services/chatops';
import { explainScreen } from '../services/ai';
import { reqLang } from '../lib/env';
import { listTransports as pfList, blastRadius } from '../services/preflight';
import { listIncidents, timeline } from '../services/timemachine';
import { auditLedger } from '../services/audit';
import { partnerReliability, btpFinops } from '../services/partners';

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

// ── Reconciliação ponta-a-ponta ──
router.get('/recon', async (req: Request, res: Response) => {
  try { res.json({ processes: await getProcesses(req.consultancyId!) }); } catch (e) { console.error('recon', e); res.status(500).json({ error: 'Erro na reconciliação.' }); }
});
router.post('/recon', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const { clientId, name, stages } = req.body || {};
  const r = await saveProcess(req.consultancyId!, { clientId, name, stages });
  if ('error' in r) { res.status(r.error === 'INVALID' ? 400 : 404).json({ error: r.error === 'INVALID' ? 'Informe nome e ao menos 2 estágios.' : 'Cliente não encontrado.' }); return; }
  res.json(r);
});
router.delete('/recon/:id', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await deleteProcess(req.consultancyId!, req.params.id);
  if ('error' in r) { res.status(404).json({ error: 'Não encontrado.' }); return; }
  res.json(r);
});
router.get('/recon/:id', async (req: Request, res: Response) => {
  const r = await reconcile(req.consultancyId!, req.params.id, Number(req.query.h) || 24);
  if ('error' in r) { res.status(404).json({ error: 'Processo não encontrado.' }); return; }
  res.json(r);
});

// ── Perda silenciosa de negócio ──
router.get('/anomaly', async (req: Request, res: Response) => {
  try { res.json(await detectAnomalies(req.consultancyId!, req.query.clientId as string | undefined)); } catch (e) { console.error('anomaly', e); res.status(500).json({ error: 'Erro na detecção de anomalia.' }); }
});

// ── Explique esta tela (IA) ──
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { screen, data } = req.body || {};
    if (!screen) { res.status(400).json({ error: 'screen é obrigatório.' }); return; }
    res.json({ text: await explainScreen(String(screen), data || {}, req.consultancyId!, reqLang(req)) });
  } catch (e) { console.error('explain', e); res.status(500).json({ error: 'Erro ao explicar a tela.' }); }
});

// ── ChatOps ──
router.get('/chatops', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try { res.json(await getChatops(req.consultancyId!)); } catch (e) { console.error('chatops cfg', e); res.status(500).json({ error: 'Erro no ChatOps.' }); }
});
router.post('/chatops/token', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try { res.json(await rotateToken(req.consultancyId!, req.body?.channel)); } catch (e) { console.error('chatops token', e); res.status(500).json({ error: 'Erro ao gerar token.' }); }
});
router.post('/chatops/run', async (req: Request, res: Response) => {
  try { res.json(await runChatops(req.consultancyId!, String(req.body?.text || ''), req.user?.userId)); }
  catch (e) { console.error('chatops run', e); res.status(500).json({ error: 'Erro ao processar comando.' }); }
});

// ── Pré-voo de mudança (blast radius) ──
router.get('/preflight', async (req: Request, res: Response) => {
  try { res.json({ transports: await pfList(req.consultancyId!) }); } catch (e) { console.error('preflight', e); res.status(500).json({ error: 'Erro no pré-voo.' }); }
});
router.get('/preflight/:id', async (req: Request, res: Response) => {
  const r = await blastRadius(req.consultancyId!, req.params.id);
  if ('error' in r) { res.status(404).json({ error: 'Transport não encontrado.' }); return; }
  res.json(r);
});

// ── Time machine de incidente ──
router.get('/timemachine', async (req: Request, res: Response) => {
  try { res.json({ incidents: await listIncidents(req.consultancyId!) }); } catch (e) { console.error('timemachine', e); res.status(500).json({ error: 'Erro na time machine.' }); }
});
router.get('/timemachine/:id', async (req: Request, res: Response) => {
  const r = await timeline(req.consultancyId!, req.params.id);
  if ('error' in r) { res.status(404).json({ error: 'Incidente não encontrado.' }); return; }
  res.json(r);
});

// ── Auditoria / Compliance ──
router.get('/audit', async (req: Request, res: Response) => {
  try { res.json(await auditLedger(req.consultancyId!)); } catch (e) { console.error('audit', e); res.status(500).json({ error: 'Erro na auditoria.' }); }
});

// ── Parceiros EDI + FinOps BTP ──
router.get('/partners', async (req: Request, res: Response) => {
  try { res.json({ ...(await partnerReliability(req.consultancyId!)), finops: await btpFinops(req.consultancyId!) }); }
  catch (e) { console.error('partners', e); res.status(500).json({ error: 'Erro nos parceiros/FinOps.' }); }
});

export default router;
