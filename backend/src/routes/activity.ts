import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireConsultancyAdmin } from '../middleware/roles';
import { recordActivity } from '../lib/activity';

const router = Router();

// Beacon do front: registra acesso a uma página (action=view). Qualquer usuário logado.
router.post('/page', async (req: Request, res: Response) => {
  if (req.consultancyId && req.user) {
    void recordActivity({
      consultancyId: req.consultancyId,
      userId: req.user.userId,
      userEmail: req.user.email,
      action: 'view',
      method: 'GET',
      path: String(req.body?.path || '').slice(0, 200),
      detail: req.body?.label ? String(req.body.label).slice(0, 120) : null,
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
    });
  }
  res.json({ ok: true });
});

// Listagem paginada (admin da consultoria).
router.get('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const pageSize = Math.min(100, Math.max(5, parseInt(String(req.query.pageSize || '30'), 10) || 30));
  const { action, userId, from, to } = req.query as Record<string, string | undefined>;
  const where: any = { consultancyId: req.consultancyId! };
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from + 'T00:00:00');
    if (to) where.createdAt.lte = new Date(to + 'T23:59:59.999');
  }

  const [total, rows, users] = await Promise.all([
    prisma.activityLog.count({ where }),
    prisma.activityLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.user.findMany({ where: { consultancyId: req.consultancyId! }, select: { id: true, name: true, email: true } }),
  ]);
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  res.json({
    items: rows.map((r) => ({
      id: r.id, action: r.action, method: r.method, path: r.path, detail: r.detail, status: r.status,
      userEmail: r.userEmail, userName: (r.userId && nameById.get(r.userId)) || r.userEmail || '—',
      createdAt: r.createdAt,
    })),
    total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

export default router;
