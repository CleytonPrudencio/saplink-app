import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import * as cc from '../services/cloudconn';

// Conectores SAP Cloud (Ariba / SuccessFactors). Sob tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json({ clients: await cc.listConnectors(req.consultancyId!) }); }
  catch (e) { console.error('cc list', e); res.status(500).json({ error: 'Erro.' }); }
});

router.post('/:clientId/:product', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await cc.saveConnector(req.consultancyId!, req.params.clientId, req.params.product.toUpperCase(), req.body || {});
  if ('error' in r) { res.status(r.error === 'NO_KEY' ? 400 : 404).json({ error: r.error === 'NO_KEY' ? 'Informe a API Key.' : 'Cliente/produto inválido.' }); return; }
  res.json(r);
});

router.post('/:clientId/:product/sync', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await cc.sync(req.consultancyId!, req.params.clientId, req.params.product.toUpperCase());
  if ('error' in r) { res.status(r.error === 'NO_KEY' ? 400 : 404).json({ error: r.error === 'NO_KEY' ? 'Conecte a API Key antes de sincronizar.' : 'Não encontrado.' }); return; }
  res.json(r);
});

export default router;
