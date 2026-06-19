import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePlatformAdmin } from '../middleware/roles';

// Leads — manifestação de interesse (cadastro público fechado por enquanto).
// POST é público; listagem/gestão é exclusiva do PLATFORM_ADMIN.
const router = Router();

// POST /api/leads — público (formulário de interesse na landing)
router.post('/', async (req: Request, res: Response) => {
  const { name, email, phone, company, role, employees, message, source } = req.body || {};
  if (!name || !email) { res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' }); return; }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) { res.status(400).json({ error: 'E-mail inválido.' }); return; }
  try {
    await prisma.lead.create({
      data: {
        name: String(name).slice(0, 160), email: String(email).slice(0, 160),
        phone: phone ? String(phone).slice(0, 40) : null,
        company: company ? String(company).slice(0, 160) : null,
        role: role ? String(role).slice(0, 80) : null,
        employees: employees ? String(employees).slice(0, 40) : null,
        message: message ? String(message).slice(0, 1000) : null,
        source: source ? String(source).slice(0, 40) : 'landing',
      },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error('Lead create error:', e);
    res.status(500).json({ error: 'Não foi possível registrar o interesse.' });
  }
});

// GET /api/leads — platform admin
router.get('/', authMiddleware, requirePlatformAdmin, async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const leads = await prisma.lead.findMany({ where: status ? { status } : {}, orderBy: { createdAt: 'desc' }, take: 500 });
  const counts = await prisma.lead.groupBy({ by: ['status'], _count: { _all: true } });
  res.json({ leads, counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])) });
});

// PATCH /api/leads/:id — atualizar status (platform admin)
router.patch('/:id', authMiddleware, requirePlatformAdmin, async (req: Request, res: Response) => {
  const { status } = req.body || {};
  if (!['NEW', 'CONTACTED', 'QUALIFIED', 'DISCARDED'].includes(status)) { res.status(400).json({ error: 'Status inválido.' }); return; }
  await prisma.lead.update({ where: { id: req.params.id }, data: { status } });
  res.json({ ok: true });
});

export default router;
