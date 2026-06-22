import { Router, Request, Response } from 'express';
import { getCockpit } from '../services/cockpit';
import { reqEnv } from '../lib/env';

// B1 — Cockpit de IDoc/filas multi-cliente. Sob o tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await getCockpit(req.consultancyId!, {
      clientId: req.query.clientId as string | undefined,
      kind: req.query.kind as string | undefined,
      status: req.query.status as string | undefined,
      q: req.query.q as string | undefined,
      env: reqEnv(req),
    });
    res.json(data);
  } catch (error) {
    console.error('Cockpit error:', error);
    res.status(500).json({ error: 'Erro ao carregar o cockpit.' });
  }
});

export default router;
