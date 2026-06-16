import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';
import { requireConsultancyAdmin } from '../middleware/roles';

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

// Dados da consultoria atual (inclui white-label)
router.get('/', async (req: Request, res: Response) => {
  const c = await prisma.consultancy.findUnique({ where: { id: req.consultancyId! } });
  if (!c) {
    res.status(404).json({ error: 'Consultoria não encontrada' });
    return;
  }
  res.json({ id: c.id, name: c.name, cnpj: c.cnpj, logoUrl: c.logoUrl, primaryColor: c.primaryColor });
});

// Atualiza marca (white-label): nome, logo, cor primária. Só admin do tenant.
const brandingSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  primaryColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, 'Cor deve ser hex #RRGGBB')
    .nullable()
    .optional(),
});

router.put('/branding', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const parsed = brandingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors });
    return;
  }
  const c = await prisma.consultancy.update({
    where: { id: req.consultancyId! },
    data: parsed.data,
  });
  res.json({ id: c.id, name: c.name, logoUrl: c.logoUrl, primaryColor: c.primaryColor });
});

export default router;
