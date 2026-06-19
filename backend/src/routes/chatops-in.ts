import { Router, Request, Response } from 'express';
import { resolveByToken, run } from '../services/chatops';

// Webhook PÚBLICO de entrada do ChatOps. Autentica por token (header x-chatops-token
// ou ?token=). Funciona com WhatsApp Cloud API / Twilio / Telegram / cURL.
const router = Router();

router.post('/in', async (req: Request, res: Response) => {
  const token = (req.headers['x-chatops-token'] as string) || (req.query.token as string) || '';
  const consultancyId = await resolveByToken(token);
  if (!consultancyId) { res.status(401).json({ error: 'token inválido' }); return; }
  // aceita {text} ou formato de provedores comuns
  const text = req.body?.text || req.body?.message?.text || req.body?.Body || '';
  try {
    const r = await run(consultancyId, String(text));
    res.json({ reply: r.reply, action: r.action });
  } catch (e) {
    console.error('chatops-in', e);
    res.status(500).json({ error: 'erro ao processar' });
  }
});

export default router;
