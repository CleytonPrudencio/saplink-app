import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

// GET / — list alerts for consultancy with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { severity, resolved, clientId } = req.query;

    // Get all client IDs for this consultancy
    const clients = await prisma.client.findMany({
      where: { consultancyId: req.consultancyId! },
      select: { id: true },
    });
    const clientIds = clients.map((c: { id: string }) => c.id);

    const where: Record<string, unknown> = {
      clientId: { in: clientIds },
    };

    if (severity) {
      where.severity = severity as string;
    }
    if (resolved !== undefined) {
      where.resolved = resolved === 'true';
    }
    if (clientId) {
      where.clientId = clientId as string;
    }

    const alerts = await prisma.alert.findMany({
      where: where as any,
      include: {
        client: { select: { id: true, name: true } },
        integration: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(alerts);
  } catch (error) {
    console.error('List alerts error:', error);
    res.status(500).json({ error: 'Erro ao listar alertas' });
  }
});

// GET /stats — alert counts by severity and status
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      where: { consultancyId: req.consultancyId! },
      select: { id: true },
    });
    const clientIds = clients.map((c: { id: string }) => c.id);

    const [total, critical, high, medium, low, resolved, unresolved] = await Promise.all([
      prisma.alert.count({ where: { clientId: { in: clientIds } } }),
      prisma.alert.count({ where: { clientId: { in: clientIds }, severity: 'CRITICAL' } }),
      prisma.alert.count({ where: { clientId: { in: clientIds }, severity: 'HIGH' } }),
      prisma.alert.count({ where: { clientId: { in: clientIds }, severity: 'MEDIUM' } }),
      prisma.alert.count({ where: { clientId: { in: clientIds }, severity: 'LOW' } }),
      prisma.alert.count({ where: { clientId: { in: clientIds }, resolved: true } }),
      prisma.alert.count({ where: { clientId: { in: clientIds }, resolved: false } }),
    ]);

    res.json({
      total,
      bySeverity: { critical, high, medium, low },
      byStatus: { resolved, unresolved },
    });
  } catch (error) {
    console.error('Alert stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de alertas' });
  }
});

// PUT /:id/resolve — mark alert as resolved
router.put('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: req.params.id },
      include: { client: true },
    });

    if (!alert || alert.client.consultancyId !== req.consultancyId!) {
      res.status(404).json({ error: 'Alerta não encontrado' });
      return;
    }

    const updated = await prisma.alert.update({
      where: { id: req.params.id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({ error: 'Erro ao resolver alerta' });
  }
});

// POST / — create alert
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, severity, message, clientId, integrationId } = req.body;

    if (!type || !severity || !message || !clientId) {
      res.status(400).json({ error: 'Campos obrigatórios: type, severity, message, clientId' });
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

    const alert = await prisma.alert.create({
      data: {
        type,
        severity,
        message,
        clientId,
        integrationId: integrationId || null,
      },
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Erro ao criar alerta' });
  }
});

export default router;
