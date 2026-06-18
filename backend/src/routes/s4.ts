import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import * as s4 from '../services/s4';

// S/4HANA Cloud — Upgrade, Clean Core, APIs, Comm, Fiscal (DRC), Eventos. Sob o tenantGate.
const router = Router();

router.get('/overview', async (req: Request, res: Response) => {
  try { res.json(await s4.getOverview(req.consultancyId!)); } catch (e) { console.error('s4 overview', e); res.status(500).json({ error: 'Erro no overview S/4.' }); }
});
router.get('/upgrade', async (req: Request, res: Response) => {
  try { res.json(await s4.getUpgrade(req.consultancyId!, req.query.clientId as string | undefined)); } catch (e) { console.error(e); res.status(500).json({ error: 'Erro no upgrade radar.' }); }
});
router.get('/cleancore', async (req: Request, res: Response) => {
  try { res.json(await s4.getCleanCore(req.consultancyId!)); } catch (e) { console.error(e); res.status(500).json({ error: 'Erro no clean core.' }); }
});
router.get('/apis', async (req: Request, res: Response) => {
  try { res.json(await s4.getApis(req.consultancyId!)); } catch (e) { console.error(e); res.status(500).json({ error: 'Erro nas APIs.' }); }
});
router.get('/comm', async (req: Request, res: Response) => {
  try { res.json(await s4.getComm(req.consultancyId!)); } catch (e) { console.error(e); res.status(500).json({ error: 'Erro nas comm arrangements.' }); }
});
router.get('/events', async (req: Request, res: Response) => {
  try { res.json(await s4.getEvents(req.consultancyId!)); } catch (e) { console.error(e); res.status(500).json({ error: 'Erro nos eventos.' }); }
});
router.get('/fiscal', async (req: Request, res: Response) => {
  try { res.json(await s4.getFiscal(req.consultancyId!, req.query.clientId as string | undefined)); } catch (e) { console.error(e); res.status(500).json({ error: 'Erro no fiscal.' }); }
});
router.post('/fiscal/:id/reprocess', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await s4.reprocessFiscal(req.consultancyId!, req.params.id);
  if ('error' in r) { res.status(r.error === 'NOT_FOUND' ? 404 : 409).json({ error: r.error === 'NOT_REMEDIABLE' ? 'Documento não é reprocessável.' : 'Não encontrado.' }); return; }
  res.json(r);
});

// Conector (admin)
router.get('/connections', requireConsultancyAdmin, async (req: Request, res: Response) => {
  res.json({ connections: await s4.getConnections(req.consultancyId!) });
});
router.put('/connections/:clientId', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const { baseUrl, authType, commUser, authToken, release } = req.body || {};
  if (!baseUrl) { res.status(400).json({ error: 'baseUrl é obrigatório.' }); return; }
  const r = await s4.saveConnection(req.consultancyId!, req.params.clientId, { baseUrl, authType, commUser, authToken, release });
  if ('error' in r) { res.status(404).json({ error: 'Cliente não encontrado.' }); return; }
  res.json(r);
});

export default router;
