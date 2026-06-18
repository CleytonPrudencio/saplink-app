import { Router, Request, Response } from 'express';
import { getCatalog } from '../services/catalog';

// B3 — Catálogo vivo de interfaces. Sob o tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await getCatalog(req.consultancyId!, {
      clientId: req.query.clientId as string | undefined,
      kind: req.query.kind as string | undefined,
      q: req.query.q as string | undefined,
    });
    res.json(data);
  } catch (error) {
    console.error('Catalog error:', error);
    res.status(500).json({ error: 'Erro ao carregar o catálogo.' });
  }
});

export default router;
