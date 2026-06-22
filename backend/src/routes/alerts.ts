import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';
import { diagnose } from '../services/ai';

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

async function tenantClientIds(consultancyId: string) {
  return (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
}

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

// POST /resolve-group — resolve todos os alertas abertos de um mesmo agrupamento (integração+tipo)
router.post('/resolve-group', async (req: Request, res: Response) => {
  try {
    const { integrationId, type, message } = req.body || {};
    const clientIds = await tenantClientIds(req.consultancyId!);
    const where: Record<string, unknown> = { clientId: { in: clientIds }, resolved: false };
    if (integrationId) where.integrationId = integrationId; else if (message) where.message = message;
    if (type) where.type = type;
    const r = await prisma.alert.updateMany({ where: where as any, data: { resolved: true, resolvedAt: new Date() } });
    res.json({ resolved: r.count });
  } catch (error) {
    console.error('Resolve group error:', error);
    res.status(500).json({ error: 'Erro ao resolver o grupo.' });
  }
});

// POST /:id/diagnose — IA explica o alerta (causa provável + o que fazer)
router.post('/:id/diagnose', async (req: Request, res: Response) => {
  try {
    const alert = await prisma.alert.findUnique({ where: { id: req.params.id }, include: { client: true, integration: true } });
    if (!alert || alert.client.consultancyId !== req.consultancyId!) { res.status(404).json({ error: 'Alerta não encontrado' }); return; }
    const sameOpen = await prisma.alert.count({ where: { resolved: false, type: alert.type, integrationId: alert.integrationId, clientId: alert.clientId } });
    const context = {
      cliente: alert.client.name,
      integracao: alert.integration?.name, tipo_integracao: alert.integration?.type,
      tipo_alerta: alert.type, severidade: alert.severity, mensagem: alert.message,
      ocorrencias_abertas_iguais: sameOpen, desde: alert.createdAt,
    };
    const text = await diagnose(`Explique este alerta e diga o que fazer para resolver: ${alert.message}`, context, req.consultancyId!);
    res.json({ text });
  } catch (error) {
    console.error('Alert diagnose error:', error);
    res.status(500).json({ error: 'Erro ao diagnosticar o alerta.' });
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
