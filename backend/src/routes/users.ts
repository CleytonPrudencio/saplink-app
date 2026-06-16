import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';
import { requireConsultancyAdmin, ROLES } from '../middleware/roles';
import { assertWithinLimit, LimitError } from '../services/billing';

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

// Lista usuários do tenant
router.get('/', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { consultancyId: req.consultancyId! },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(users);
});

// Cria usuário no tenant (só admin; respeita limite do plano).
// Sem SMTP, devolve uma senha temporária (em produção, enviar convite por e-mail).
const createSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  role: z.enum([ROLES.CONSULTANCY_ADMIN, ROLES.CONSULTANCY_USER]).default(ROLES.CONSULTANCY_USER),
});

router.post('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const { name, email, role } = parsed.data;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'E-mail já cadastrado' });
      return;
    }
    await assertWithinLimit(req.consultancyId!, 'users');

    const tempPassword = crypto.randomBytes(6).toString('base64url'); // ~8 chars
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        consultancyId: req.consultancyId!,
        password: await bcrypt.hash(tempPassword, 10),
      },
      select: { id: true, name: true, email: true, role: true },
    });
    // tempPassword volta só nesta resposta (admin repassa ao convidado)
    res.status(201).json({ ...user, tempPassword });
  } catch (error) {
    if (error instanceof LimitError) {
      res.status(402).json({ error: error.message });
      return;
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Remove usuário do tenant (admin; não pode remover a si mesmo)
router.delete('/:id', requireConsultancyAdmin, async (req: Request, res: Response) => {
  if (req.params.id === req.user!.userId) {
    res.status(400).json({ error: 'Você não pode remover a si mesmo.' });
    return;
  }
  const target = await prisma.user.findFirst({
    where: { id: req.params.id, consultancyId: req.consultancyId! },
  });
  if (!target) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  await prisma.passwordResetToken.deleteMany({ where: { userId: target.id } });
  await prisma.user.delete({ where: { id: target.id } });
  res.json({ status: 'ok' });
});

export default router;
