import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { ask, askStream } from '../services/ai';
import { reqLang } from '../lib/env';

// Copiloto "Pergunte ao SAPLINK" — Q&A em linguagem natural sobre a carteira da consultoria.
// Montado sob o tenantGate (auth + tenancy + assinatura ativa).
const router = Router();

async function buildAskContext(consultancyId: string) {
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

  return {
    resumo: { clientes: clients.length, integracoes: integrations.length, integracoesPorStatus: porStatus, alertasAbertos: alerts.length },
    problemas,
    alertas: alerts.map((a) => ({ cliente: a.client?.name, severidade: a.severity, mensagem: a.message, quando: a.createdAt })),
    clientes: clients.map((c) => ({ nome: c.name, healthScore: c.healthScore })),
  };
}

router.post('/', async (req: Request, res: Response) => {
  const consultancyId = req.consultancyId!;
  const question = String(req.body?.question || '').trim();
  if (!question) { res.status(400).json({ error: 'Pergunta é obrigatória.' }); return; }
  try {
    const context = await buildAskContext(consultancyId);
    const answer = await ask(question, context, consultancyId, reqLang(req));
    res.json({ answer });
  } catch (error) {
    console.error('Ask error:', error);
    res.status(500).json({ error: 'Erro ao consultar o copiloto.' });
  }
});

// Streaming (SSE): o texto chega aos poucos. no-transform impede o Caddy de bufferizar.
router.post('/stream', async (req: Request, res: Response) => {
  const consultancyId = req.consultancyId!;
  const question = String(req.body?.question || '').trim();
  if (!question) { res.status(400).json({ error: 'Pergunta é obrigatória.' }); return; }
  try {
    const context = await buildAskContext(consultancyId);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    (res as Response & { flushHeaders?: () => void }).flushHeaders?.();
    await askStream(question, context, consultancyId, reqLang(req), (t) => res.write(`data: ${JSON.stringify(t)}\n\n`));
    res.write('event: done\ndata: 1\n\n'); // fim — o texto já foi inteiro pelos data:
    res.end();
  } catch (error) {
    console.error('Ask stream error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Erro ao consultar o copiloto.' });
    else { res.write(`event: error\ndata: ${JSON.stringify('erro')}\n\n`); res.end(); }
  }
});

export default router;
