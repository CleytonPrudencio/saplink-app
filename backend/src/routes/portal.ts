import { Router, Request, Response } from 'express';
import { getPortalData } from '../services/portal';

// C3 — portal público read-only do cliente final. SEM auth (resolvido por token).
const router = Router();

router.get('/:token', async (req: Request, res: Response) => {
  try {
    const data = await getPortalData(req.params.token);
    if (!data) { res.status(404).json({ error: 'Portal não encontrado ou desativado.' }); return; }
    res.json(data);
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Erro ao carregar o portal.' });
  }
});

export default router;
