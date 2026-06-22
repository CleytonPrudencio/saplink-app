import { Router, Request, Response } from 'express';
import { vapidPublicKey, saveSubscription } from '../services/push';

// Web Push (PWA). Sob tenantGate (usuário logado).
const router = Router();

router.get('/vapid', (_req: Request, res: Response) => {
  res.json({ key: vapidPublicKey() });
});

router.post('/subscribe', async (req: Request, res: Response) => {
  const sub = req.body?.subscription || req.body;
  const r = await saveSubscription(req.consultancyId!, req.user?.userId, sub);
  if ('error' in r) { res.status(400).json({ error: 'Inscrição inválida.' }); return; }
  res.json({ ok: true });
});

export default router;
