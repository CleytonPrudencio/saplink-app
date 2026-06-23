import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { tenancyMiddleware } from '../middleware/tenancy';
import { clientInScope } from '../lib/scope';
import { syncIntegration, isMonitorable, probe, probeUrl, analyzeFix } from '../services/connectors';
import { encryptConfig, decryptConfig, maskConfig, SENSITIVE, generateAgentToken } from '../lib/crypto';
import { requireConsultancyAdmin } from '../middleware/roles';
import { reqEnv } from '../lib/env';

// Tipos que exigem o Agente on-premise (não monitoráveis por HTTP direto)
const AGENT_TYPES = new Set(['RFC', 'IDOC', 'BAPI', 'SOAP', 'FILE', 'DATABASE']);

// Serializa para o cliente: nunca expõe agentTokenHash; mascara config; deriva agentConfigured
function publicIntegration<T extends { config?: unknown; agentTokenHash?: string | null }>(i: T) {
  const { agentTokenHash, ...rest } = i as T & { agentTokenHash?: string | null };
  return { ...rest, config: maskConfig(i.config), agentConfigured: !!agentTokenHash };
}

const router = Router();
router.use(authMiddleware, tenancyMiddleware);

// POST /:id/diagnose — analisa o erro REAL e propõe correção (auto-corrigível ou não)
router.post('/:id/diagnose', async (req: Request, res: Response) => {
  const integration = await prisma.integration.findUnique({
    where: { id: req.params.id },
    include: { client: true },
  });
  if (!integration || integration.client.consultancyId !== req.consultancyId! || !clientInScope(integration.clientId)) {
    res.status(404).json({ error: 'Integração não encontrada' });
    return;
  }
  try {
    const proposal = await analyzeFix(integration);
    res.json({ integration: { id: integration.id, name: integration.name, type: integration.type, status: integration.status }, ...proposal });
  } catch (error) {
    console.error('Diagnose integration error:', error);
    res.status(500).json({ error: 'Erro ao diagnosticar integração' });
  }
});

// POST /:id/agent-token — gera (ou regenera) o token de ingestão do Agente on-premise (só admin)
router.post('/:id/agent-token', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const integration = await prisma.integration.findUnique({
    where: { id: req.params.id },
    include: { client: true },
  });
  if (!integration || integration.client.consultancyId !== req.consultancyId! || !clientInScope(integration.clientId)) {
    res.status(404).json({ error: 'Integração não encontrada' });
    return;
  }
  const { token, hash, hint } = generateAgentToken();
  await prisma.integration.update({
    where: { id: integration.id },
    data: { agentTokenHash: hash, agentTokenHint: hint },
  });
  // token bruto retornado UMA vez — não é armazenado em claro
  res.json({ token, hint, agentUrl: process.env.PUBLIC_API_URL || '' });
});

// POST /:id/auto-fix — a IA aplica a correção proposta (só admin) e re-sincroniza
router.post('/:id/auto-fix', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const integration = await prisma.integration.findUnique({
    where: { id: req.params.id },
    include: { client: true },
  });
  if (!integration || integration.client.consultancyId !== req.consultancyId! || !clientInScope(integration.clientId)) {
    res.status(404).json({ error: 'Integração não encontrada' });
    return;
  }
  try {
    // Recalcula a proposta no servidor (não confia no cliente)
    const proposal = await analyzeFix(integration);
    if (!proposal.autoFix.available) {
      res.status(409).json({ error: 'Esta integração não tem correção automática disponível.', reason: proposal.autoFix.reason });
      return;
    }

    const before = { status: integration.status, uptime: integration.uptime, errorRate: integration.errorRate, latency: integration.latency };
    const current = (decryptConfig(integration.config) || {}) as Record<string, unknown>;
    const merged = { ...current };
    for (const c of proposal.autoFix.changes) merged[c.field] = c.to;

    await prisma.integration.update({ where: { id: integration.id }, data: { config: encryptConfig(merged) } });

    // Re-sincroniza para confirmar a recuperação
    const probeResult = await syncIntegration(integration.id);
    const updated = await prisma.integration.findUnique({ where: { id: integration.id } });
    const after = updated
      ? { status: updated.status, uptime: updated.uptime, errorRate: updated.errorRate, latency: updated.latency }
      : before;

    res.json({
      applied: true,
      changes: proposal.autoFix.changes,
      summary: proposal.autoFix.summary,
      recovered: updated?.status === 'ACTIVE',
      before,
      after,
      probe: probeResult,
    });
  } catch (error) {
    console.error('Auto-fix integration error:', error);
    res.status(500).json({ error: 'Erro ao aplicar correção automática' });
  }
});

// POST /:id/sync — coleta dados REAIS do endpoint (OData/REST) e atualiza métricas
router.post('/:id/sync', async (req: Request, res: Response) => {
  const integration = await prisma.integration.findUnique({
    where: { id: req.params.id },
    include: { client: true },
  });
  if (!integration || integration.client.consultancyId !== req.consultancyId! || !clientInScope(integration.clientId)) {
    res.status(404).json({ error: 'Integração não encontrada' });
    return;
  }
  if (!isMonitorable(integration)) {
    res.status(400).json({ error: 'Integração não monitorável diretamente (depende do agente on-premise).' });
    return;
  }
  const result = await syncIntegration(integration.id);
  const updated = await prisma.integration.findUnique({ where: { id: integration.id } });
  res.json({ probe: result, integration: updated });
});

// POST /sync-all — sincroniza todas as integrações monitoráveis do tenant
router.post('/sync-all', async (req: Request, res: Response) => {
  const list = await prisma.integration.findMany({ where: { client: { consultancyId: req.consultancyId! } } });
  const monitorable = list.filter(isMonitorable);
  let synced = 0;
  for (const i of monitorable) {
    await syncIntegration(i.id);
    synced++;
  }
  res.json({ synced, total: list.length });
});

// GET /all — list ALL integrations for consultancy
router.get('/all', async (req: Request, res: Response) => {
  try {
    const qEnv = req.query.environment as string | undefined;
    const envFilter = (qEnv && ['DEV', 'HML', 'PRD'].includes(qEnv)) ? qEnv : reqEnv(req);
    const integrations = await prisma.integration.findMany({
      where: { client: { consultancyId: req.consultancyId! }, ...(envFilter ? { environment: envFilter } : {}) },
      include: { client: { select: { id: true, name: true } }, _count: { select: { alerts: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(integrations.map(publicIntegration));
  } catch (error) {
    console.error('List all integrations error:', error);
    res.status(500).json({ error: 'Erro ao listar integrações' });
  }
});

// GET /types — available integration types with config schema
router.get('/types', async (_req: Request, res: Response) => {
  res.json([
    {
      type: 'RFC', icon: '🔌', name: 'RFC (Remote Function Call)',
      description: 'Chamadas de função remota para BAPIs e consultas SAP',
      fields: [
        { key: 'host', label: 'Host SAP', placeholder: '192.168.1.100', required: true },
        { key: 'systemNumber', label: 'System Number', placeholder: '00', required: true },
        { key: 'client', label: 'Client (Mandante)', placeholder: '100', required: true },
        { key: 'user', label: 'Usuário RFC', placeholder: 'RFC_USER', required: true },
        { key: 'password', label: 'Senha', placeholder: '********', required: true, type: 'password' },
        { key: 'instanceNumber', label: 'Instance Number', placeholder: '00', required: false },
        { key: 'language', label: 'Idioma', placeholder: 'PT', required: false },
      ],
    },
    {
      type: 'IDoc', icon: '📄', name: 'IDoc (Intermediate Document)',
      description: 'Documentos intermediários SAP — pedidos, faturas, avisos de expedição',
      fields: [
        { key: 'host', label: 'Host SAP', placeholder: '192.168.1.100', required: true },
        { key: 'systemNumber', label: 'System Number', placeholder: '00', required: true },
        { key: 'client', label: 'Client (Mandante)', placeholder: '100', required: true },
        { key: 'partnerNumber', label: 'Partner Number', placeholder: 'PARTNER001', required: true },
        { key: 'partnerType', label: 'Partner Type', placeholder: 'LS', required: true },
        { key: 'messageType', label: 'Message Type', placeholder: 'ORDERS', required: true },
        { key: 'port', label: 'Porta IDoc', placeholder: 'SAPPORT', required: false },
        { key: 'user', label: 'Usuário', placeholder: 'IDOC_USER', required: true },
        { key: 'password', label: 'Senha', placeholder: '********', required: true, type: 'password' },
      ],
    },
    {
      type: 'REST', icon: '🌐', name: 'REST API',
      description: 'APIs REST — SAP CPI, S/4HANA Cloud, Salesforce, sistemas externos',
      fields: [
        { key: 'baseUrl', label: 'URL Base', placeholder: 'https://api.exemplo.com/v1', required: true },
        { key: 'authType', label: 'Tipo de Autenticação', placeholder: 'Bearer / Basic / API Key', required: true, options: ['Bearer Token', 'Basic Auth', 'API Key', 'OAuth2', 'Nenhuma'] },
        { key: 'authValue', label: 'Token / Credenciais', placeholder: 'Bearer eyJhbG...', required: false, type: 'password' },
        { key: 'headers', label: 'Headers Adicionais (JSON)', placeholder: '{"X-Custom": "value"}', required: false },
        { key: 'healthEndpoint', label: 'Endpoint de Health Check', placeholder: '/health', required: false },
      ],
    },
    {
      type: 'SOAP', icon: '🧼', name: 'SOAP Web Service',
      description: 'Web services SOAP — SAP PI/PO, integrações legadas',
      fields: [
        { key: 'wsdlUrl', label: 'URL do WSDL', placeholder: 'https://sap.exemplo.com/wsdl', required: true },
        { key: 'user', label: 'Usuário', placeholder: 'WS_USER', required: true },
        { key: 'password', label: 'Senha', placeholder: '********', required: true, type: 'password' },
        { key: 'namespace', label: 'Namespace', placeholder: 'urn:sap-com:document:sap', required: false },
        { key: 'soapAction', label: 'SOAP Action', placeholder: 'urn:executeQuery', required: false },
      ],
    },
    {
      type: 'OData', icon: '📊', name: 'OData Service',
      description: 'SAP OData Services — Fiori Apps, S/4HANA APIs, Gateway, SAP API Hub',
      fields: [
        { key: 'serviceUrl', label: 'URL do Serviço OData', placeholder: 'https://sandbox.api.sap.com/.../odata/v2', required: true },
        { key: 'apiKey', label: 'API Key (SAP Business Accelerator Hub)', placeholder: 'cole sua APIKey do api.sap.com', required: false, type: 'password' },
        { key: 'user', label: 'Usuário (Basic Auth — SAP on-premise)', placeholder: 'ODATA_USER', required: false },
        { key: 'password', label: 'Senha (Basic Auth — SAP on-premise)', placeholder: '********', required: false, type: 'password' },
        { key: 'entitySet', label: 'Entity Set', placeholder: 'Companies / A_BusinessPartner', required: false },
        { key: 'sapClient', label: 'SAP Client', placeholder: '100', required: false },
      ],
    },
    {
      type: 'FILE', icon: '📁', name: 'File / CNAB / EDI',
      description: 'Transferência de arquivos — CNAB bancário, EDI, flat files',
      fields: [
        { key: 'protocol', label: 'Protocolo', placeholder: 'FTP / SFTP / S3', required: true, options: ['FTP', 'SFTP', 'S3', 'Local'] },
        { key: 'host', label: 'Host / Bucket', placeholder: 'ftp.banco.com.br', required: true },
        { key: 'port', label: 'Porta', placeholder: '22', required: false },
        { key: 'path', label: 'Diretório', placeholder: '/cnab/retorno/', required: true },
        { key: 'user', label: 'Usuário', placeholder: 'ftp_user', required: false },
        { key: 'password', label: 'Senha / Access Key', placeholder: '********', required: false, type: 'password' },
        { key: 'filePattern', label: 'Padrão de Arquivo', placeholder: '*.RET', required: false },
      ],
    },
    {
      type: 'DATABASE', icon: '🗄️', name: 'Database (Banco de Dados)',
      description: 'Conexão direta — Protheus (SQL Server), WMS, sistemas legados',
      fields: [
        { key: 'driver', label: 'Driver', placeholder: 'SQL Server / PostgreSQL / MySQL / Oracle', required: true, options: ['SQL Server', 'PostgreSQL', 'MySQL', 'Oracle', 'SQLite'] },
        { key: 'host', label: 'Host', placeholder: '192.168.1.200', required: true },
        { key: 'port', label: 'Porta', placeholder: '1433', required: true },
        { key: 'database', label: 'Database', placeholder: 'PROTHEUS_PROD', required: true },
        { key: 'user', label: 'Usuário', placeholder: 'db_reader', required: true },
        { key: 'password', label: 'Senha', placeholder: '********', required: true, type: 'password' },
        { key: 'query', label: 'Query de Teste', placeholder: 'SELECT 1', required: false },
      ],
    },
    {
      type: 'CUSTOM', icon: '🔗', name: 'Custom (Personalizado)',
      description: 'Integração customizada — qualquer protocolo ou sistema',
      fields: [
        { key: 'url', label: 'URL / Endpoint', placeholder: 'https://sistema.exemplo.com/api', required: true },
        { key: 'method', label: 'Método HTTP', placeholder: 'GET / POST', required: false, options: ['GET', 'POST', 'PUT', 'PATCH'] },
        { key: 'headers', label: 'Headers (JSON)', placeholder: '{"Authorization": "Bearer ..."}', required: false },
        { key: 'body', label: 'Body Template (JSON)', placeholder: '{"action": "ping"}', required: false },
        { key: 'expectedStatus', label: 'Status Esperado', placeholder: '200', required: false },
      ],
    },
  ]);
});

// GET /client/:clientId — list integrations for a client
router.get('/client/:clientId', async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.clientId, consultancyId: req.consultancyId! },
    });
    if (!client) { res.status(404).json({ error: 'Cliente não encontrado' }); return; }

    const integrations = await prisma.integration.findMany({
      where: { clientId: req.params.clientId },
      include: { _count: { select: { alerts: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(integrations.map(publicIntegration));
  } catch (error) {
    console.error('List integrations error:', error);
    res.status(500).json({ error: 'Erro ao listar integrações' });
  }
});

// POST / — create integration
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, type, clientId, config, status, environment } = req.body;
    if (!name || !type || !clientId) {
      res.status(400).json({ error: 'Campos obrigatórios: name, type, clientId' });
      return;
    }
    const env = ['DEV', 'HML', 'PRD'].includes(environment) ? environment : 'PRD';

    const client = await prisma.client.findFirst({
      where: { id: clientId, consultancyId: req.consultancyId! },
    });
    if (!client) { res.status(404).json({ error: 'Cliente não encontrado' }); return; }

    const integration = await prisma.integration.create({
      data: {
        name, description: description || null, type, clientId, environment: env,
        config: config ? encryptConfig(config) : null,
        status: status || 'PENDING',
        latency: 0, errorRate: 0, uptime: 0,
      },
    });

    res.status(201).json(integration);
  } catch (error) {
    console.error('Create integration error:', error);
    res.status(500).json({ error: 'Erro ao criar integração' });
  }
});

// POST /:id/test — test integration connection
router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const integration = await prisma.integration.findUnique({
      where: { id: req.params.id },
      include: { client: true },
    });
    if (!integration || integration.client.consultancyId !== req.consultancyId! || !clientInScope(integration.clientId)) {
      res.status(404).json({ error: 'Integração não encontrada' }); return;
    }

    const config = (decryptConfig(integration.config) || {}) as Record<string, string>;
    const type = integration.type?.toUpperCase();
    let success = false;
    let message = '';
    let details: Record<string, unknown> = {};
    let updateStatus = true; // tipos por agente não têm status sobrescrito pelo teste
    const startTime = Date.now();

    // Teste via conector real (OData/REST/CUSTOM) — usa APIKey/Bearer/Basic e Accept correto
    const probeTarget = probeUrl(integration.type, config);
    if (probeTarget) {
      const r = await probe(probeTarget, config);
      success = r.ok;
      message = r.ok
        ? `Conexão estabelecida (HTTP ${r.httpStatus}, ${r.latencyMs}ms)`
        : r.httpStatus
          ? `Servidor respondeu com status ${r.httpStatus}`
          : `Falha na conexão: ${r.error || 'sem resposta'}`;
      details = { status: r.httpStatus, latency: `${r.latencyMs}ms`, url: probeTarget };
    } else {
      // RFC/IDoc/SOAP/FILE/DATABASE: a plataforma NÃO testa diretamente — quem mede é o Agente.
      // Reflete o estado real do agente em vez de fingir uma conexão bem-sucedida.
      updateStatus = false; // o status é do agente; o teste não inventa
      const last = integration.lastAgentReportAt ? new Date(integration.lastAgentReportAt).getTime() : 0;
      const fresh = last && Date.now() - last < Number(process.env.AGENT_STALE_MS || 180000);
      if (integration.agentTokenHash && fresh) {
        success = integration.status === 'ACTIVE';
        message = `Última leitura do Agente: status ${integration.status} (há ${Math.round((Date.now() - last) / 1000)}s).`;
        details = { type, fonte: 'agente', status: integration.status, uptime: `${integration.uptime}%` };
      } else if (integration.agentTokenHash) {
        message = 'Agente instalado, mas sem leitura recente. Verifique o container do agente no servidor do cliente.';
        details = { type, fonte: 'agente', ultimaLeitura: integration.lastAgentReportAt || 'nunca' };
      } else {
        message = 'Tipo monitorado pelo Agente on-premise. Gere o token e instale o Agente para o teste/monitoramento reais — a plataforma não conecta diretamente a RFC/IDoc.';
        details = { type, proximoPasso: 'Instalar o Agente on-premise' };
      }
    }

    // Atualiza status só para tipos testáveis por HTTP (agente é a fonte para os demais)
    if (updateStatus) {
      await prisma.integration.update({
        where: { id: req.params.id },
        data: { status: success ? 'ACTIVE' : 'ERROR', latency: Date.now() - startTime },
      });
    }

    res.json({ success, message, details, duration: `${Date.now() - startTime}ms` });
  } catch (error) {
    console.error('Test integration error:', error);
    res.status(500).json({ error: 'Erro ao testar integração' });
  }
});

// PUT /:id — update integration
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const integration = await prisma.integration.findUnique({
      where: { id: req.params.id },
      include: { client: true },
    });
    if (!integration || integration.client.consultancyId !== req.consultancyId! || !clientInScope(integration.clientId)) {
      res.status(404).json({ error: 'Integração não encontrada' }); return;
    }

    const { name, description, type, status, config, latency, errorRate, uptime } = req.body;

    // Ao editar config: campo sensível vazio/mascarado mantém o valor atual (não apaga segredo)
    let configData: Record<string, unknown> | null | undefined;
    if (config !== undefined) {
      const existing = (integration.config || {}) as Record<string, unknown>;
      const merged: Record<string, unknown> = { ...(config as Record<string, unknown>) };
      for (const k of Object.keys(merged)) {
        if (SENSITIVE.test(k) && (merged[k] === '' || merged[k] === '••••••' || merged[k] == null)) {
          merged[k] = existing[k];
        }
      }
      configData = encryptConfig(merged);
    }

    const updated = await prisma.integration.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(config !== undefined && { config: configData }),
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
    if (!integration || integration.client.consultancyId !== req.consultancyId! || !clientInScope(integration.clientId)) {
      res.status(404).json({ error: 'Integração não encontrada' }); return;
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
