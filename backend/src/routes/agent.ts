import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashAgentToken } from '../lib/crypto';
import { ingestAgentReport, AgentReport } from '../services/agent';
import { ingestSapItems, SapItemInput } from '../services/cockpit';
import { claimCommands, recordResult } from '../services/remediation';
import { ingestCatalog, CatalogItemInput } from '../services/catalog';
import { ingestTransports, TransportInput } from '../services/transports';
import { ingestCloud, CloudItemInput } from '../services/cloud';
import { ingestS4 } from '../services/s4';
import { autoHealClient } from '../services/autoheal';

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

// POST /api/agent/sap-items — o agente empurra o snapshot de IDocs/filas (B1)
router.post('/sap-items', async (req: Request, res: Response) => {
  const integration = await resolveIntegration(req);
  if (!integration) {
    res.status(401).json({ error: 'Token do agente inválido' });
    return;
  }
  try {
    const items = (req.body?.items || []) as SapItemInput[];
    const result = await ingestSapItems(integration.id, integration.clientId, items);
    // AMS Autônomo: tenta auto-corrigir itens de alta confiança (assíncrono, não bloqueia)
    let autoHealed = 0;
    try {
      const client = await prisma.client.findUnique({ where: { id: integration.clientId }, select: { consultancyId: true } });
      if (client) autoHealed = await autoHealClient(client.consultancyId, integration.clientId);
    } catch (e) { console.error('autoHeal error:', e); }
    res.json({ ok: true, ...result, autoHealed });
  } catch (error) {
    console.error('Agent sap-items error:', error);
    res.status(500).json({ error: 'Erro ao processar itens do agente' });
  }
});

// GET /api/agent/commands — o agente busca remediações aprovadas (vira EXECUTING) (B2)
router.get('/commands', async (req: Request, res: Response) => {
  const integration = await resolveIntegration(req);
  if (!integration) { res.status(401).json({ error: 'Token do agente inválido' }); return; }
  try {
    const commands = await claimCommands(integration.id);
    res.json({ commands });
  } catch (error) {
    console.error('Agent commands error:', error);
    res.status(500).json({ error: 'Erro ao buscar comandos' });
  }
});

// POST /api/agent/commands/:id/result — o agente reporta o resultado da execução (B2)
router.post('/commands/:id/result', async (req: Request, res: Response) => {
  const integration = await resolveIntegration(req);
  if (!integration) { res.status(401).json({ error: 'Token do agente inválido' }); return; }
  try {
    const r = await recordResult(integration.id, req.params.id, {
      ok: !!req.body?.ok,
      resultText: req.body?.resultText,
      afterText: req.body?.afterText,
    });
    if (r.error) { res.status(404).json({ error: 'Comando não encontrado' }); return; }
    res.json({ ok: true, status: r.action.status });
  } catch (error) {
    console.error('Agent command result error:', error);
    res.status(500).json({ error: 'Erro ao registrar resultado' });
  }
});

// POST /api/agent/catalog — o agente empurra o catálogo de interfaces descoberto (B3)
router.post('/catalog', async (req: Request, res: Response) => {
  const integration = await resolveIntegration(req);
  if (!integration) { res.status(401).json({ error: 'Token do agente inválido' }); return; }
  try {
    const items = (req.body?.items || []) as CatalogItemInput[];
    const result = await ingestCatalog(integration.id, integration.clientId, items);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('Agent catalog error:', error);
    res.status(500).json({ error: 'Erro ao processar catálogo' });
  }
});

// POST /api/agent/transports — o agente empurra transportes STMS descobertos (D3)
router.post('/transports', async (req: Request, res: Response) => {
  const integration = await resolveIntegration(req);
  if (!integration) { res.status(401).json({ error: 'Token do agente inválido' }); return; }
  try {
    const items = (req.body?.items || []) as TransportInput[];
    const result = await ingestTransports(integration.id, integration.clientId, items);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('Agent transports error:', error);
    res.status(500).json({ error: 'Erro ao processar transports' });
  }
});

// POST /api/agent/s4 — bundle do conector S/4HANA Cloud (upgrade, clean core, APIs, comm, fiscal, eventos)
router.post('/s4', async (req: Request, res: Response) => {
  const integration = await resolveIntegration(req);
  if (!integration) { res.status(401).json({ error: 'Token do agente inválido' }); return; }
  try {
    const result = await ingestS4(integration.clientId, (req.body || {}) as Record<string, unknown>);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('Agent s4 error:', error);
    res.status(500).json({ error: 'Erro ao processar dados S/4HANA Cloud' });
  }
});

// POST /api/agent/cloud-items — mensagens CPI/AIF descobertas pelo agente (F1/F2)
router.post('/cloud-items', async (req: Request, res: Response) => {
  const integration = await resolveIntegration(req);
  if (!integration) { res.status(401).json({ error: 'Token do agente inválido' }); return; }
  try {
    const items = (req.body?.items || []) as CloudItemInput[];
    const result = await ingestCloud(integration.id, integration.clientId, items);
    res.json({ ok: true, ...result });
  } catch (error) {
    console.error('Agent cloud-items error:', error);
    res.status(500).json({ error: 'Erro ao processar mensagens cloud' });
  }
});

export default router;
