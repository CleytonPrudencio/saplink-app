import { Router, Request, Response } from 'express';
import { getReform } from '../services/reform';
import { reqEnv } from '../lib/env';

// Reform Readiness Radar — prontidão CBS/IBS. Sob o tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await getReform(req.consultancyId!, req.query.clientId as string | undefined, reqEnv(req)));
  } catch (e) {
    console.error('Reform error:', e);
    res.status(500).json({ error: 'Erro ao carregar prontidão da reforma.' });
  }
});

export default router;
