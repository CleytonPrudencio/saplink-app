import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireConsultancyAdmin } from '../middleware/roles';
import { sendToChannel } from '../services/notify';

// C1 — canais de notificação + on-call. Sob o tenantGate (todas exigem admin).
const router = Router();
router.use(requireConsultancyAdmin);

router.get('/', async (req: Request, res: Response) => {
  const [channels, consultancy] = await Promise.all([
    prisma.notificationChannel.findMany({ where: { consultancyId: req.consultancyId! }, orderBy: [{ level: 'asc' }, { createdAt: 'asc' }] }),
    prisma.consultancy.findUnique({ where: { id: req.consultancyId! }, select: { escalateAfterMin: true } }),
  ]);
  res.json({ channels, escalateAfterMin: consultancy?.escalateAfterMin ?? 30 });
});

router.post('/', async (req: Request, res: Response) => {
  const { type, name, target, minSeverity, level } = req.body || {};
  if (!type || !name || !target) { res.status(400).json({ error: 'type, name e target são obrigatórios.' }); return; }
  if (!['SLACK', 'TEAMS', 'WEBHOOK', 'EMAIL'].includes(type)) { res.status(400).json({ error: 'Tipo inválido.' }); return; }
  const channel = await prisma.notificationChannel.create({
    data: {
      consultancyId: req.consultancyId!, type, name, target,
      minSeverity: ['MEDIUM', 'HIGH', 'CRITICAL'].includes(minSeverity) ? minSeverity : 'MEDIUM',
      level: level === 2 ? 2 : 1,
    },
  });
  res.json({ channel });
});

router.put('/:id', async (req: Request, res: Response) => {
  const existing = await prisma.notificationChannel.findFirst({ where: { id: req.params.id, consultancyId: req.consultancyId! } });
  if (!existing) { res.status(404).json({ error: 'Canal não encontrado.' }); return; }
  const { name, target, minSeverity, level, enabled } = req.body || {};
  const channel = await prisma.notificationChannel.update({
    where: { id: existing.id },
    data: {
      name: name ?? existing.name, target: target ?? existing.target,
      minSeverity: minSeverity ?? existing.minSeverity,
      level: level === 1 || level === 2 ? level : existing.level,
      enabled: typeof enabled === 'boolean' ? enabled : existing.enabled,
    },
  });
  res.json({ channel });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const existing = await prisma.notificationChannel.findFirst({ where: { id: req.params.id, consultancyId: req.consultancyId! } });
  if (!existing) { res.status(404).json({ error: 'Canal não encontrado.' }); return; }
  await prisma.notificationChannel.delete({ where: { id: existing.id } });
  res.json({ ok: true });
});

router.post('/:id/test', async (req: Request, res: Response) => {
  const ch = await prisma.notificationChannel.findFirst({ where: { id: req.params.id, consultancyId: req.consultancyId! } });
  if (!ch) { res.status(404).json({ error: 'Canal não encontrado.' }); return; }
  const ok = await sendToChannel(ch, {
    id: 'test', severity: 'MEDIUM', type: 'TEST',
    message: 'Mensagem de teste do SAPLINK — canal configurado com sucesso.',
    client: { name: 'Teste' },
  });
  res.json({ ok });
});

router.put('/settings/escalation', async (req: Request, res: Response) => {
  const n = parseInt(req.body?.escalateAfterMin);
  if (isNaN(n) || n < 1 || n > 1440) { res.status(400).json({ error: 'escalateAfterMin inválido (1–1440).' }); return; }
  await prisma.consultancy.update({ where: { id: req.consultancyId! }, data: { escalateAfterMin: n } });
  res.json({ escalateAfterMin: n });
});

export default router;
