import { Router, Request, Response } from 'express';
import { getCloud } from '../services/cloud';

// F1/F2 — CPI / AIF. Sob o tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await getCloud(req.consultancyId!, {
      source: req.query.source as string | undefined,
      status: req.query.status as string | undefined,
      q: req.query.q as string | undefined,
      clientId: req.query.clientId as string | undefined,
    }));
  } catch (e) {
    console.error('Cloud error:', e);
    res.status(500).json({ error: 'Erro ao carregar CPI/AIF.' });
  }
});

export default router;
