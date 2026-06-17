import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashAgentToken } from '../lib/crypto';
import { ingestAgentReport, AgentReport } from '../services/agent';

// Rotas do Agente on-premise. SEM JWT/tenancy: o agente autentica por token próprio
// (header x-agent-token), que mapeia direto para a integração.
const router = Router();

async function resolveIntegration(req: Request) {
  const token = (req.header('x-agent-token') || req.header('authorization')?.replace(/^Bearer\s+/i, '') || '').trim();
  if (!token) return null;
  const hash = hashAgentToken(token);
  return prisma.integration.findUnique({ where: { agentTokenHash: hash } });
}

// GET /api/agent/ping — o agente valida o token na inicialização
router.get('/ping', async (req: Request, res: Response) => {
  const integration = await resolveIntegration(req);
  if (!integration) {
    res.status(401).json({ error: 'Token do agente inválido' });
    return;
  }
  res.json({ ok: true, integration: { id: integration.id, name: integration.name, type: integration.type } });
});

// POST /api/agent/report — o agente empurra a saúde do SAP (RFC/IDoc)
router.post('/report', async (req: Request, res: Response) => {
  const integration = await resolveIntegration(req);
  if (!integration) {
    res.status(401).json({ error: 'Token do agente inválido' });
    return;
  }
  try {
    const result = await ingestAgentReport(integration.id, (req.body || {}) as AgentReport);
    res.json({ ok: true, ...result, nextPollSeconds: parseInt(process.env.AGENT_POLL_SECONDS || '60') });
  } catch (error) {
    console.error('Agent report error:', error);
    res.status(500).json({ error: 'Erro ao processar relatório do agente' });
  }
});

export default router;
