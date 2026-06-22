import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import * as rb from '../services/runbooks';

// Marketplace de runbooks. Sob tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json({ runbooks: await rb.marketplace(req.consultancyId!, { q: req.query.q as string, category: req.query.category as string }) }); }
  catch (e) { console.error('rb market', e); res.status(500).json({ error: 'Erro no marketplace.' }); }
});

router.get('/mine', async (req: Request, res: Response) => {
  try { res.json(await rb.mine(req.consultancyId!)); } catch (e) { console.error('rb mine', e); res.status(500).json({ error: 'Erro.' }); }
});

router.get('/recommend', async (req: Request, res: Response) => {
  try { res.json({ runbooks: await rb.recommend(req.consultancyId!, String(req.query.source || ''), String(req.query.message || '')) }); }
  catch (e) { console.error('rb rec', e); res.status(500).json({ error: 'Erro.' }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  const r = await rb.getRunbook(req.consultancyId!, req.params.id);
  if ('error' in r) { res.status(404).json({ error: 'Runbook não encontrado.' }); return; }
  res.json(r);
});

router.post('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await rb.create(req.consultancyId!, req.body || {});
  if ('error' in r) { res.status(400).json({ error: 'Informe nome e ao menos 1 passo.' }); return; }
  res.json(r);
});
router.put('/:id', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await rb.update(req.consultancyId!, req.params.id, req.body || {});
  if ('error' in r) { res.status(404).json({ error: 'Não encontrado.' }); return; }
  res.json(r);
});
router.post('/:id/publish', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await rb.setPublished(req.consultancyId!, req.params.id, req.body?.published !== false);
  if ('error' in r) { res.status(404).json({ error: 'Não encontrado.' }); return; }
  res.json(r);
});
router.delete('/:id', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await rb.remove(req.consultancyId!, req.params.id);
  if ('error' in r) { res.status(404).json({ error: 'Não encontrado.' }); return; }
  res.json(r);
});
router.post('/:id/install', async (req: Request, res: Response) => {
  const r = await rb.install(req.consultancyId!, req.params.id);
  if ('error' in r) { res.status(404).json({ error: 'Não encontrado.' }); return; }
  res.json(r);
});
router.delete('/:id/install', async (req: Request, res: Response) => {
  res.json(await rb.uninstall(req.consultancyId!, req.params.id));
});
router.post('/:id/rate', async (req: Request, res: Response) => {
  const r = await rb.rate(req.consultancyId!, req.params.id, Number(req.body?.rating));
  if ('error' in r) { res.status(400).json({ error: 'Instale o runbook antes de avaliar.' }); return; }
  res.json(r);
});

export default router;
