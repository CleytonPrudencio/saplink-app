import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import { getConfig, saveConfig, test } from '../services/aiconfig';
import { Provider } from '../services/aiProviders';

// Config de IA BYO por consultoria (sob tenantGate). Admin-only.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json(await getConfig(req.consultancyId!)); } catch (e) { console.error('ai-config get', e); res.status(500).json({ error: 'Erro ao carregar config de IA.' }); }
});

router.put('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try { res.json(await saveConfig(req.consultancyId!, req.body || {})); } catch (e) { console.error('ai-config save', e); res.status(500).json({ error: 'Erro ao salvar config de IA.' }); }
});

router.post('/test', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try {
    const { provider, key, model, endpoint, deployment } = req.body || {};
    if (!provider) { res.status(400).json({ error: 'provider é obrigatório.' }); return; }
    res.json(await test(req.consultancyId!, provider as Provider, { key, model, endpoint, deployment }));
  } catch (e) { console.error('ai-config test', e); res.status(500).json({ error: 'Erro no teste.' }); }
});

export default router;
