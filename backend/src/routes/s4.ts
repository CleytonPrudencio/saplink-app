import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import * as s4 from '../services/s4';
import { saveCpiConfig, getCpiConfigs, syncCpi } from '../services/cpi';

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
// Sync ao vivo via sandbox do SAP Business Accelerator Hub (APIKey) — dados reais sem S-user.
router.post('/connections/:clientId/sync', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await s4.syncS4Sandbox(req.consultancyId!, req.params.clientId);
  if ('error' in r) { res.status(r.error === 'NO_KEY' ? 400 : 404).json({ error: r.error === 'NO_KEY' ? 'Salve a conexão com a API Key antes de sincronizar.' : 'Conexão não encontrada.' }); return; }
  res.json(r);
});

// ───── Conector REAL CPI (Integration Suite) ─────
router.get('/cpi', requireConsultancyAdmin, async (req: Request, res: Response) => {
  res.json({ configs: await getCpiConfigs(req.consultancyId!) });
});
router.put('/cpi/:clientId', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const { baseUrl, tokenUrl, oauthClientId, oauthSecret, enabled } = req.body || {};
  if (!baseUrl || !tokenUrl || !oauthClientId) { res.status(400).json({ error: 'baseUrl, tokenUrl e oauthClientId são obrigatórios.' }); return; }
  const r = await saveCpiConfig(req.consultancyId!, req.params.clientId, { baseUrl, tokenUrl, oauthClientId, oauthSecret, enabled });
  if ('error' in r) { res.status(r.error === 'NO_SECRET' ? 400 : 404).json({ error: r.error === 'NO_SECRET' ? 'Informe o secret na primeira configuração.' : 'Cliente não encontrado.' }); return; }
  res.json(r);
});
router.post('/cpi/:clientId/sync', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await syncCpi(req.consultancyId!, req.params.clientId);
  if ('error' in r) { res.status(404).json({ error: 'Configuração não encontrada.' }); return; }
  res.json(r);
});

export default router;
