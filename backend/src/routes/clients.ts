import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';
import { requireConsultancyAdmin } from '../middleware/roles';
import { assertWithinLimit, LimitError } from '../services/billing';

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

// GET / — list clients for current consultancy
router.get('/', async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      where: { consultancyId: req.consultancyId! },
      include: {
        integrations: true,
        _count: { select: { alerts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(clients);
  } catch (error) {
    console.error('List clients error:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// GET /:id — client detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        consultancyId: req.consultancyId!,
      },
      include: {
        integrations: true,
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// POST / — create client (só admin do tenant; respeita limite do plano)
router.post('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try {
    const { name, cnpj } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Nome do cliente é obrigatório' });
      return;
    }

    await assertWithinLimit(req.consultancyId!, 'clients');

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        cnpj: cnpj || null,
        consultancyId: req.consultancyId!,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    if (error instanceof LimitError) {
      res.status(402).json({ error: error.message });
      return;
    }
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// PUT /:id — update client (só admin do tenant)
router.put('/:id', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        consultancyId: req.consultancyId!,
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    const { name, cnpj, healthScore } = req.body;

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(cnpj !== undefined && { cnpj }),
        ...(healthScore !== undefined && { healthScore }),
      },
    });

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// DELETE /:id — delete client (só admin do tenant)
router.delete('/:id', requireConsultancyAdmin, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.client.findFirst({
      where: {
        id: req.params.id,
        consultancyId: req.consultancyId!,
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    // Delete related records first
    await prisma.alert.deleteMany({ where: { clientId: req.params.id } });
    await prisma.diagnostic.deleteMany({ where: { clientId: req.params.id } });
    await prisma.integration.deleteMany({ where: { clientId: req.params.id } });
    await prisma.client.delete({ where: { id: req.params.id } });

    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Erro ao remover cliente' });
  }
});

export default router;
