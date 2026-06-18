import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import { computeSla, setSlaTargets, slaReport } from '../services/sla';
import { computeImpact, setCost, listForCost } from '../services/impact';

// D1 + D2 — SLA por cliente e impacto em R$. Sob o tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json(await computeSla(req.consultancyId!)); }
  catch (e) { console.error('SLA error:', e); res.status(500).json({ error: 'Erro ao calcular SLA.' }); }
});

router.put('/:clientId', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await setSlaTargets(req.consultancyId!, req.params.clientId, Number(req.body?.uptimeTarget), Number(req.body?.maxLatencyMs));
  if ('error' in r) { res.status(404).json({ error: 'Cliente não encontrado.' }); return; }
  res.json(r);
});

router.get('/:clientId/report', async (req: Request, res: Response) => {
  const r = await slaReport(req.consultancyId!, req.params.clientId);
  if ('error' in r) { res.status(404).json({ error: 'Cliente não encontrado.' }); return; }
  res.json(r);
});

// Impacto em R$
router.get('/impact/all', async (req: Request, res: Response) => {
  try { res.json(await computeImpact(req.consultancyId!)); }
  catch (e) { console.error('Impact error:', e); res.status(500).json({ error: 'Erro ao calcular impacto.' }); }
});

router.get('/impact/integrations', requireConsultancyAdmin, async (req: Request, res: Response) => {
  res.json({ integrations: await listForCost(req.consultancyId!) });
});

router.put('/impact/:integrationId', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await setCost(req.consultancyId!, req.params.integrationId, Number(req.body?.costPerHourCents), req.body?.businessProcess);
  if ('error' in r) { res.status(404).json({ error: 'Integração não encontrada.' }); return; }
  res.json(r);
});

export default router;
