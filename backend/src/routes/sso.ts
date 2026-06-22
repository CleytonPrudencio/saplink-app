import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import * as sso from '../services/ssoauth';

// Config SSO da consultoria (admin). Sob tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json(await sso.getConfig(req.consultancyId!)); }
  catch (e) { console.error('sso cfg get', e); res.status(500).json({ error: 'Erro.' }); }
});

router.post('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await sso.saveConfig(req.consultancyId!, req.body || {});
  if ('error' in r) { res.status(400).json({ error: r.error === 'NO_SECRET' ? 'Informe o Client Secret.' : 'Informe Client ID e Issuer.' }); return; }
  res.json(r);
});

export default router;
