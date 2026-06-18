import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireConsultancyAdmin } from '../middleware/roles';
import { sendDigest, gatherDigestData } from '../services/digest';
import { narrateDigest, aiEnabled } from '../services/ai';
import { emailEnabled } from '../services/email';

// Digest semanal por IA — preferências + envio sob demanda. Sob o tenantGate.
const router = Router();

// Status do digest da consultoria (admin)
router.get('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const c = await prisma.consultancy.findUnique({
    where: { id: req.consultancyId! },
    select: { weeklyDigest: true, lastDigestAt: true },
  });
  res.json({
    weeklyDigest: c?.weeklyDigest ?? true,
    lastDigestAt: c?.lastDigestAt ?? null,
    emailEnabled: emailEnabled(),
    aiEnabled: aiEnabled(),
  });
});

// Liga/desliga o digest semanal (admin)
router.post('/toggle', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const enabled = !!req.body?.enabled;
  await prisma.consultancy.update({ where: { id: req.consultancyId! }, data: { weeklyDigest: enabled } });
  res.json({ weeklyDigest: enabled });
});

// Prévia do digest sem enviar (admin) — dados + narração da IA
router.get('/preview', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try {
    const data = await gatherDigestData(req.consultancyId!);
    const narrative = aiEnabled() ? await narrateDigest(data) : '';
    res.json({ data, narrative });
  } catch (e) {
    console.error('Digest preview error:', e);
    res.status(500).json({ error: 'Erro ao gerar prévia do digest.' });
  }
});

// Envia o digest agora (admin) — para teste/sob demanda
router.post('/send-now', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try {
    const r = await sendDigest(req.consultancyId!, { force: true });
    res.json(r);
  } catch (e) {
    console.error('Digest send error:', e);
    res.status(500).json({ error: 'Erro ao enviar o digest.' });
  }
});

export default router;
