import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';
import { diagnose } from '../services/ai';
import { assertWithinLimit, incrementAiUsage, LimitError } from '../services/billing';
import { reqEnv } from '../lib/env';

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

    // Limite mensal do plano (antes de criar o job)
    await assertWithinLimit(req.consultancyId!, 'aiDiagnostics');

    // Cria o job PENDENTE e responde NA HORA (202). A IA roda em background.
    const consultancyId = req.consultancyId!;
    const diagnostic = await prisma.diagnostic.create({
      data: { query, clientId, status: 'PENDING', response: '' },
    });
    res.status(202).json(diagnostic);

    // Processamento assíncrono (não bloqueia a resposta)
    (async () => {
      try {
        const response = await diagnose(query, context, consultancyId);
        await prisma.diagnostic.update({ where: { id: diagnostic.id }, data: { response, status: 'DONE' } });
        await incrementAiUsage(consultancyId);
      } catch (e) {
        console.error('Diagnostic async error:', e);
        await prisma.diagnostic.update({
          where: { id: diagnostic.id },
          data: { status: 'FAILED', response: 'Não foi possível gerar o diagnóstico. Tente novamente.' },
        });
      }
    })();
  } catch (error) {
    if (error instanceof LimitError) {
      res.status(402).json({ error: error.message });
      return;
    }
    console.error('Diagnostic error:', error);
    res.status(500).json({ error: 'Erro ao processar diagnóstico' });
  }
});

// GET /:id — status/resultado de um diagnóstico (para polling). Escopo do tenant.
router.get('/:id', async (req: Request, res: Response) => {
  const d = await prisma.diagnostic.findFirst({
    where: { id: req.params.id, client: { consultancyId: req.consultancyId! } },
  });
  if (!d) {
    res.status(404).json({ error: 'Diagnóstico não encontrado' });
    return;
  }
  res.json(d);
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

    const dEnv = reqEnv(req);
    const diagnostics = await prisma.diagnostic.findMany({
      where: { clientId: req.params.clientId, ...(dEnv ? { environment: dEnv } : {}) },
      orderBy: { createdAt: 'desc' },
    });

    res.json(diagnostics);
  } catch (error) {
    console.error('List diagnostics error:', error);
    res.status(500).json({ error: 'Erro ao listar diagnósticos' });
  }
});

export default router;
