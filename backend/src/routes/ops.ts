import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import * as ops from '../services/ops';

// Basis & Operações. Sob tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json(await ops.listOps(req.consultancyId!, { clientId: req.query.clientId as string, category: req.query.category as string })); }
  catch (e) { console.error('ops list', e); res.status(500).json({ error: 'Erro.' }); }
});

router.post('/:id/resolve', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await ops.resolveOps(req.consultancyId!, req.params.id);
  if ('error' in r) { res.status(404).json({ error: 'Não encontrado.' }); return; }
  res.json(r);
});

export default router;
