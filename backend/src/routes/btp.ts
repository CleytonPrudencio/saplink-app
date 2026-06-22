import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import * as btp from '../services/btp';

// BTP Cockpit. Sob tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json(await btp.listBtp(req.consultancyId!, req.query.clientId as string)); }
  catch (e) { console.error('btp list', e); res.status(500).json({ error: 'Erro.' }); }
});

router.post('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await btp.createBtp(req.consultancyId!, req.body || {});
  if ('error' in r) { res.status(r.error === 'INVALID' ? 400 : 404).json({ error: r.error === 'INVALID' ? 'Informe tipo e nome.' : 'Cliente inválido.' }); return; }
  res.json(r);
});

router.put('/:id', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await btp.updateBtp(req.consultancyId!, req.params.id, req.body || {});
  if ('error' in r) { res.status(404).json({ error: 'Não encontrado.' }); return; }
  res.json(r);
});

router.delete('/:id', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await btp.removeBtp(req.consultancyId!, req.params.id);
  if ('error' in r) { res.status(404).json({ error: 'Não encontrado.' }); return; }
  res.json(r);
});

export default router;
