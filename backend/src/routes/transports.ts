import { Router, Request, Response } from 'express';
import { getTransports } from '../services/transports';

// D3 — radar de transports (STMS). Sob o tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await getTransports(req.consultancyId!, req.query.clientId as string | undefined));
  } catch (e) {
    console.error('Transports error:', e);
    res.status(500).json({ error: 'Erro ao carregar transports.' });
  }
});

export default router;
