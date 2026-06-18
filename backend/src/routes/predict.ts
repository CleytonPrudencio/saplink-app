import { Router, Request, Response } from 'express';
import { predict } from '../services/predict';
import { benchmark } from '../services/benchmark';

// E1 (previsão) + E2 (benchmark). Sob o tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try { res.json(await predict(req.consultancyId!)); }
  catch (e) { console.error('Predict error:', e); res.status(500).json({ error: 'Erro ao calcular previsão.' }); }
});

router.get('/benchmark', async (req: Request, res: Response) => {
  try { res.json(await benchmark(req.consultancyId!)); }
  catch (e) { console.error('Benchmark error:', e); res.status(500).json({ error: 'Erro ao calcular benchmark.' }); }
});

export default router;
