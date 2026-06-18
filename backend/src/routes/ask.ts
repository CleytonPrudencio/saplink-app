import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { ask } from '../services/ai';

// Copiloto "Pergunte ao SAPLINK" — Q&A em linguagem natural sobre a carteira da consultoria.
// Montado sob o tenantGate (auth + tenancy + assinatura ativa).
const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const consultancyId = req.consultancyId!;
  const question = String(req.body?.question || '').trim();
  if (!question) { res.status(400).json({ error: 'Pergunta é obrigatória.' }); return; }

  try {
    const [clients, integrations, alerts] = await Promise.all([
      prisma.client.findMany({ where: { consultancyId }, select: { id: true, name: true, healthScore: true } }),
      prisma.integration.findMany({
        where: { client: { consultancyId } },
        select: { name: true, type: true, status: true, errorRate: true, uptime: true, latency: true, client: { select: { name: true } } },
      }),
      prisma.alert.findMany({
        where: { client: { consultancyId }, resolved: false },
        orderBy: { createdAt: 'desc' }, take: 20,
        select: { type: true, severity: true, message: true, createdAt: true, client: { select: { name: true } } },
      }),
    ]);

    const porStatus = integrations.reduce((acc: Record<string, number>, i) => {
      const s = (i.status || 'PENDING').toUpperCase();
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const problemas = integrations
      .filter((i) => (i.status || '').toUpperCase() !== 'ACTIVE' || (i.errorRate ?? 0) > 5 || (i.uptime ?? 100) < 95)
      .slice(0, 25)
      .map((i) => ({ cliente: i.client?.name, integracao: i.name, tipo: i.type, status: i.status, erro: `${i.errorRate}%`, uptime: `${i.uptime}%`, latencia: `${i.latency}ms` }));

    const context = {
      resumo: {
        clientes: clients.length,
        integracoes: integrations.length,
        integracoesPorStatus: porStatus,
        alertasAbertos: alerts.length,
      },
      problemas,
      alertas: alerts.map((a) => ({ cliente: a.client?.name, severidade: a.severity, mensagem: a.message, quando: a.createdAt })),
      clientes: clients.map((c) => ({ nome: c.name, healthScore: c.healthScore })),
    };

    const answer = await ask(question, context);
    res.json({ answer });
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'Erro ao consultar o copiloto.' });
  }
});

export default router;
