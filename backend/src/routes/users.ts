import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';
import { requireConsultancyAdmin, ROLES } from '../middleware/roles';
import { assertWithinLimit, LimitError } from '../services/billing';
import { sendUserInvite } from '../services/email';

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

const ASSIGNABLE_ROLES = [ROLES.CONSULTANCY_ADMIN, ROLES.CONSULTANCY_ANALYST, ROLES.CONSULTANCY_VIEWER] as const;

// Garante que os clientIds pertencem à consultoria; retorna só os válidos.
async function validClientIds(consultancyId: string, clientIds: string[]): Promise<string[]> {
  if (!clientIds.length) return [];
  const found = await prisma.client.findMany({ where: { consultancyId, id: { in: clientIds } }, select: { id: true } });
  return found.map((c) => c.id);
}

// Lista usuários do tenant (com papel e escopo de clientes)
router.get('/', async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { consultancyId: req.consultancyId! },
    select: { id: true, name: true, email: true, role: true, allClients: true, createdAt: true, clientAccess: { select: { clientId: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(users.map((u) => ({ ...u, clientIds: u.clientAccess.map((a) => a.clientId), clientAccess: undefined })));
});

const createSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  role: z.enum(ASSIGNABLE_ROLES).default(ROLES.CONSULTANCY_ANALYST),
  allClients: z.boolean().default(true),
  clientIds: z.array(z.string()).default([]),
});

router.post('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const { name, email, role } = parsed.data;
  // Admin sempre vê todos; analista/consulta podem ser restritos.
  const allClients = role === ROLES.CONSULTANCY_ADMIN ? true : parsed.data.allClients;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'E-mail já cadastrado' });
      return;
    }
    await assertWithinLimit(req.consultancyId!, 'users');

    const ids = allClients ? [] : await validClientIds(req.consultancyId!, parsed.data.clientIds);
    const tempPassword = crypto.randomBytes(6).toString('base64url');
    const user = await prisma.user.create({
      data: {
        name, email, role, allClients,
        consultancyId: req.consultancyId!,
        password: await bcrypt.hash(tempPassword, 10),
        ...(ids.length ? { clientAccess: { create: ids.map((clientId) => ({ clientId })) } } : {}),
      },
      select: { id: true, name: true, email: true, role: true, allClients: true },
    });
    const sent = await sendUserInvite(email, name, tempPassword);
    res.status(201).json({ ...user, ...(sent ? { invited: true } : { tempPassword }) });
  } catch (error) {
    if (error instanceof LimitError) {
      res.status(402).json({ error: error.message });
      return;
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Atualiza papel e escopo de clientes de um usuário (admin).
const patchSchema = z.object({
  role: z.enum(ASSIGNABLE_ROLES).optional(),
  allClients: z.boolean().optional(),
  clientIds: z.array(z.string()).optional(),
});

router.patch('/:id', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const target = await prisma.user.findFirst({ where: { id: req.params.id, consultancyId: req.consultancyId! } });
  if (!target) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }

  const role = parsed.data.role ?? target.role;
  const allClients = role === ROLES.CONSULTANCY_ADMIN ? true : (parsed.data.allClients ?? target.allClients);

  await prisma.user.update({ where: { id: target.id }, data: { role, allClients } });

  // Reaplica o escopo de clientes quando enviado (ou quando virou allClients).
  if (parsed.data.clientIds !== undefined || allClients) {
    await prisma.userClient.deleteMany({ where: { userId: target.id } });
    if (!allClients && parsed.data.clientIds?.length) {
      const ids = await validClientIds(req.consultancyId!, parsed.data.clientIds);
      if (ids.length) await prisma.userClient.createMany({ data: ids.map((clientId) => ({ userId: target.id, clientId })) });
    }
  }
  res.json({ status: 'ok' });
});

// Redefine a senha de um usuário (admin). Bloqueado se a consultoria usa SSO.
// Não altera o e-mail (imutável). Gera senha temporária e envia/retorna.
router.post('/:id/reset-password', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const target = await prisma.user.findFirst({ where: { id: req.params.id, consultancyId: req.consultancyId! } });
  if (!target) { res.status(404).json({ error: 'Usuário não encontrado' }); return; }
  const sso = await prisma.ssoConfig.findUnique({ where: { consultancyId: req.consultancyId! } }).catch(() => null);
  if (sso?.enabled) {
    res.status(400).json({ error: 'SSO ativo: a senha é gerida pelo provedor de identidade.' });
    return;
  }
  const tempPassword = crypto.randomBytes(6).toString('base64url');
  await prisma.user.update({ where: { id: target.id }, data: { password: await bcrypt.hash(tempPassword, 10) } });
  const sent = await sendUserInvite(target.email, target.name, tempPassword);
  res.json({ reset: true, ...(sent ? { invited: true } : { tempPassword }) });
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
