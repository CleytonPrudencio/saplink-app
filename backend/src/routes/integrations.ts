import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

// GET /client/:clientId — list integrations for a client
router.get('/client/:clientId', async (req: Request, res: Response) => {
  try {
    // Verify client belongs to consultancy
    const client = await prisma.client.findFirst({
      where: {
        id: req.params.clientId,
        consultancyId: req.consultancyId!,
      },
    });

    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    const integrations = await prisma.integration.findMany({
      where: { clientId: req.params.clientId },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(integrations);
  } catch (error) {
    console.error('List integrations error:', error);
    res.status(500).json({ error: 'Erro ao listar integrações' });
  }
});

// POST / — create integration
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, clientId, status, latency, errorRate, uptime } = req.body;

    if (!name || !type || !clientId) {
      res.status(400).json({ error: 'Campos obrigatórios: name, type, clientId' });
      return;
    }

    // Verify client belongs to consultancy
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        consultancyId: req.consultancyId!,
      },
    });

    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    const integration = await prisma.integration.create({
      data: {
        name,
        type,
        clientId,
        status: status || 'ACTIVE',
        latency: latency || 0,
        errorRate: errorRate || 0,
        uptime: uptime || 100,
      },
    });

    res.status(201).json(integration);
  } catch (error) {
    console.error('Create integration error:', error);
    res.status(500).json({ error: 'Erro ao criar integração' });
  }
});

// PUT /:id — update integration
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const integration = await prisma.integration.findUnique({
      where: { id: req.params.id },
      include: { client: true },
    });

    if (!integration || integration.client.consultancyId !== req.consultancyId!) {
      res.status(404).json({ error: 'Integração não encontrada' });
      return;
    }

    const { name, type, status, latency, errorRate, uptime } = req.body;

    const updated = await prisma.integration.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(latency !== undefined && { latency }),
        ...(errorRate !== undefined && { errorRate }),
        ...(uptime !== undefined && { uptime }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({ error: 'Erro ao atualizar integração' });
  }
});

// DELETE /:id — delete integration
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const integration = await prisma.integration.findUnique({
      where: { id: req.params.id },
      include: { client: true },
    });

    if (!integration || integration.client.consultancyId !== req.consultancyId!) {
      res.status(404).json({ error: 'Integração não encontrada' });
      return;
    }

    await prisma.alert.deleteMany({ where: { integrationId: req.params.id } });
    await prisma.integration.delete({ where: { id: req.params.id } });

    res.json({ message: 'Integração removida com sucesso' });
  } catch (error) {
    console.error('Delete integration error:', error);
    res.status(500).json({ error: 'Erro ao remover integração' });
  }
});

export default router;
