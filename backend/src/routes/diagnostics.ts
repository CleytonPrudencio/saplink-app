import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';
import { diagnose } from '../services/ai';

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

const PRESET_QUERIES = [
  'Analisar erros de IDoc nos últimos 7 dias',
  'Diagnosticar dump ABAP mais recente',
  'Verificar status das integrações com Protheus',
  'Analisar latência das conexões RFC',
  'Verificar certificados próximos do vencimento',
  'Relatório de saúde geral do ambiente SAP',
];

// GET /presets — return preset diagnostic queries
router.get('/presets', (_req: Request, res: Response) => {
  res.json(PRESET_QUERIES.map((query, index) => ({ id: index + 1, query })));
});

// POST / — send query to AI, save response
router.post('/', async (req: Request, res: Response) => {
  try {
    const { query, clientId } = req.body;

    if (!query || !clientId) {
      res.status(400).json({ error: 'Campos obrigatórios: query, clientId' });
      return;
    }

    // Verify client belongs to consultancy
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        consultancyId: req.consultancyId!,
      },
      include: {
        integrations: true,
        alerts: {
          where: { resolved: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    // Build context for AI
    const context = {
      clientName: client.name,
      healthScore: client.healthScore,
      integrations: client.integrations.map((i: any) => ({
        name: i.name,
        type: i.type,
        status: i.status,
        latency: i.latency,
        errorRate: i.errorRate,
        uptime: i.uptime,
      })),
      recentAlerts: client.alerts.map((a: any) => ({
        type: a.type,
        severity: a.severity,
        message: a.message,
      })),
    };

    const response = await diagnose(query, context);

    // Save diagnostic
    const diagnostic = await prisma.diagnostic.create({
      data: {
        query,
        response,
        clientId,
      },
    });

    res.status(201).json(diagnostic);
  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({ error: 'Erro ao processar diagnóstico' });
  }
});

// GET /client/:clientId — list diagnostic history
router.get('/client/:clientId', async (req: Request, res: Response) => {
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

    const diagnostics = await prisma.diagnostic.findMany({
      where: { clientId: req.params.clientId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(diagnostics);
  } catch (error) {
    console.error('List diagnostics error:', error);
    res.status(500).json({ error: 'Erro ao listar diagnósticos' });
  }
});

export default router;
