import { Router, Request, Response } from 'express';
import { getLicense } from '../services/license';
import { reqEnv } from '../lib/env';

// Indirect Access / Licensing Radar. Sob o tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await getLicense(req.consultancyId!, req.query.clientId as string | undefined, reqEnv(req)));
  } catch (e) {
    console.error('License error:', e);
    res.status(500).json({ error: 'Erro ao carregar licenciamento.' });
  }
});

export default router;
