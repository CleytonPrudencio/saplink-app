import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

// GET /client/:clientId — list dead code objects
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

    const deadCode = await prisma.deadCode.findMany({
      where: { clientId: req.params.clientId },
      orderBy: { usageCount: 'asc' },
    });

    res.json(deadCode);
  } catch (error) {
    console.error('List dead code error:', error);
    res.status(500).json({ error: 'Erro ao listar código morto' });
  }
});

// GET /stats/:clientId — summary counts
router.get('/stats/:clientId', async (req: Request, res: Response) => {
  try {
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

    const [total, retire, review, keep] = await Promise.all([
      prisma.deadCode.count({ where: { clientId: req.params.clientId } }),
      prisma.deadCode.count({ where: { clientId: req.params.clientId, recommendation: 'RETIRE' } }),
      prisma.deadCode.count({ where: { clientId: req.params.clientId, recommendation: 'REVIEW' } }),
      prisma.deadCode.count({ where: { clientId: req.params.clientId, recommendation: 'KEEP' } }),
    ]);

    res.json({ total, retire, review, keep });
  } catch (error) {
    console.error('Dead code stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// PUT /:id — update recommendation
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { recommendation } = req.body;

    if (!recommendation || !['RETIRE', 'REVIEW', 'KEEP'].includes(recommendation)) {
      res.status(400).json({ error: 'Recomendação deve ser: RETIRE, REVIEW ou KEEP' });
      return;
    }

    const deadCode = await prisma.deadCode.findUnique({
      where: { id: req.params.id },
    });

    if (!deadCode) {
      res.status(404).json({ error: 'Objeto não encontrado' });
      return;
    }

    // Verify client belongs to consultancy
    const client = await prisma.client.findFirst({
      where: {
        id: deadCode.clientId,
        consultancyId: req.consultancyId!,
      },
    });

    if (!client) {
      res.status(404).json({ error: 'Objeto não encontrado' });
      return;
    }

    const updated = await prisma.deadCode.update({
      where: { id: req.params.id },
      data: { recommendation },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update dead code error:', error);
    res.status(500).json({ error: 'Erro ao atualizar recomendação' });
  }
});

export default router;
