import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { CORS_ORIGINS } from './config';
import { logger } from './lib/logger';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import integrationRoutes from './routes/integrations';
import alertRoutes from './routes/alerts';
import diagnosticRoutes from './routes/diagnostics';
import deadCodeRoutes from './routes/dead-code';
import billingRoutes from './routes/billing';
import platformRoutes from './routes/platform';
import consultancyRoutes from './routes/consultancy';
import userRoutes from './routes/users';
import agentRoutes from './routes/agent';
import askRoutes from './routes/ask';
import digestRoutes from './routes/digest';
import validityRoutes from './routes/validity';
import cockpitRoutes from './routes/cockpit';
import remediationRoutes from './routes/remediation';
import catalogRoutes from './routes/catalog';
import channelRoutes from './routes/channels';
import ticketRoutes from './routes/tickets';
import portalRoutes from './routes/portal';
import slaRoutes from './routes/sla';
import transportRoutes from './routes/transports';
import predictRoutes from './routes/predict';
import cloudRoutes from './routes/cloud';
import s4Routes from './routes/s4';
import leadRoutes from './routes/leads';
import innovateRoutes from './routes/innovate';
import chatopsInRoutes from './routes/chatops-in';
import aiConfigRoutes from './routes/ai-config';
import { authMiddleware } from './middleware/auth';
import { tenancyMiddleware } from './middleware/tenancy';
import { requireActiveSubscription } from './middleware/subscription';
import { simulateIntegrationData } from './services/simulator';
import { syncIntegration, isMonitorable } from './services/connectors';
import { markStaleAgents } from './services/agent';
import { runDueDigests } from './services/digest';
import { refreshAllCerts } from './services/validity';
import { processAlerts } from './services/alertproc';
import { snapshotMetrics } from './services/predict';
import { recomputeHealthScores } from './services/health';
import { syncAllCpi } from './services/cpi';
import { stripeWebhookHandler } from './services/stripe';
import prisma from './lib/prisma';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const SIMULATION_INTERVAL = parseInt(process.env.SIMULATION_INTERVAL || '30000'); // 30s default

app.use(pinoHttp({ logger }));
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));

// Webhook Stripe precisa do corpo CRU (assinatura HMAC) — montar ANTES do express.json
app.post('/api/billing/webhook/stripe', express.raw({ type: '*/*' }), stripeWebhookHandler);

app.use(express.json({ limit: '1mb' }));

// Health check com verificação do banco
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'SAPLINK Backend', version: '1.0.0', timestamp: new Date().toISOString() });
});
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'up' });
  } catch {
    res.status(503).json({ status: 'error', db: 'down' });
  }
});

// Público: catálogo de planos para a landing page (sem auth)
app.get('/api/plans', async (_req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } });
    res.json(plans);
  } catch {
    res.status(500).json({ error: 'Erro ao listar planos' });
  }
});

// Healthcheck público (uptime externo / load balancer)
app.get('/api/health', async (_req: Request, res: Response) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ status: 'ok', db: true, ts: new Date().toISOString() }); }
  catch { res.status(503).json({ status: 'degraded', db: false }); }
});

// Auth e billing: acessíveis sem assinatura ativa (login, regularizar pagamento)
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/consultancy', consultancyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agent', agentRoutes); // agente on-premise: auth por token próprio, sem JWT
app.use('/api/portal', portalRoutes); // portal público do cliente final: auth por token na URL
app.use('/api/leads', leadRoutes); // POST público (interesse); GET/PATCH só platform admin
app.use('/api/chatops', chatopsInRoutes); // webhook público do ChatOps (auth por token)

// Rotas de negócio: exigem assinatura ATIVA (corte do inadimplente)
const tenantGate = [authMiddleware, tenancyMiddleware, requireActiveSubscription];
app.use('/api/clients', ...tenantGate, clientRoutes);
app.use('/api/integrations', ...tenantGate, integrationRoutes);
app.use('/api/alerts', ...tenantGate, alertRoutes);
app.use('/api/diagnostics', ...tenantGate, diagnosticRoutes);
app.use('/api/dead-code', ...tenantGate, deadCodeRoutes);
app.use('/api/ask', ...tenantGate, askRoutes);
app.use('/api/digest', ...tenantGate, digestRoutes);
app.use('/api/validity', ...tenantGate, validityRoutes);
app.use('/api/cockpit', ...tenantGate, cockpitRoutes);
app.use('/api/remediation', ...tenantGate, remediationRoutes);
app.use('/api/catalog', ...tenantGate, catalogRoutes);
app.use('/api/channels', ...tenantGate, channelRoutes);
app.use('/api/tickets', ...tenantGate, ticketRoutes);
app.use('/api/sla', ...tenantGate, slaRoutes);
app.use('/api/transports', ...tenantGate, transportRoutes);
app.use('/api/predict', ...tenantGate, predictRoutes);
app.use('/api/cloud', ...tenantGate, cloudRoutes);
app.use('/api/s4', ...tenantGate, s4Routes);
app.use('/api/innovate', ...tenantGate, innovateRoutes);
app.use('/api/ai-config', ...tenantGate, aiConfigRoutes);

// Error handler global (último middleware)
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  (req as any).log?.error({ err }, 'unhandled error');
  logger.error({ err: err.message }, 'unhandled error');
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT, simulationIntervalS: SIMULATION_INTERVAL / 1000 }, 'SAPLINK Backend running');

  // Simulador de métricas: DESLIGADO por padrão (produção). Liga só com SIMULATION_ENABLED=true
  // para demos. Em produção os dados vêm do conector OData/REST real e do Agente on-premise.
  if (process.env.SIMULATION_ENABLED === 'true') {
    logger.warn('SIMULAÇÃO LIGADA — gerando métricas aleatórias (apenas para demo, não usar em produção).');
    setInterval(async () => {
      try {
        const result = await simulateIntegrationData();
        logger.debug({ updated: result.updated }, 'simulator tick');
      } catch (error) {
        logger.error({ err: (error as Error).message }, 'simulator error');
      }
    }, SIMULATION_INTERVAL);
  }

  // Auto-sync REAL: integrações monitoráveis (OData/REST) coletadas de verdade do endpoint
  const REAL_SYNC_INTERVAL = parseInt(process.env.REAL_SYNC_INTERVAL || '120000'); // 2 min
  setInterval(async () => {
    try {
      const list = await prisma.integration.findMany();
      const monitorable = list.filter(isMonitorable);
      for (const i of monitorable) await syncIntegration(i.id);
      if (monitorable.length) logger.debug({ synced: monitorable.length }, 'real-sync tick');
    } catch (error) {
      logger.error({ err: (error as Error).message }, 'real-sync error');
    }
  }, REAL_SYNC_INTERVAL);

  // Heartbeat do Agente on-premise: marca OFFLINE quem parou de reportar
  const AGENT_STALE_MS = parseInt(process.env.AGENT_STALE_MS || '180000'); // 3 min
  setInterval(async () => {
    try {
      const n = await markStaleAgents(AGENT_STALE_MS);
      if (n) logger.warn({ offline: n }, 'agentes offline (sem heartbeat)');
    } catch (error) {
      logger.error({ err: (error as Error).message }, 'agent heartbeat error');
    }
  }, 60000);

  // Recálculo automático do health score (dados reais) — substitui o cálculo estático
  const HEALTH_INTERVAL = parseInt(process.env.HEALTH_INTERVAL || '180000'); // 3 min
  const runHealth = async () => {
    try { const n = await recomputeHealthScores(); if (n) logger.debug({ updated: n }, 'health recompute'); }
    catch (error) { logger.error({ err: (error as Error).message }, 'health recompute error'); }
  };
  runHealth();
  setInterval(runHealth, HEALTH_INTERVAL);

  // Digest semanal por IA: verifica periodicamente quem está com a janela de 7 dias vencida.
  // O envio em si só ocorre quando há RESEND_API_KEY; o check é leve e idempotente.
  const DIGEST_CHECK_MS = parseInt(process.env.DIGEST_CHECK_MS || '21600000'); // 6h
  setInterval(async () => {
    try {
      const n = await runDueDigests();
      if (n) logger.info({ sent: n }, 'digest semanal enviado');
    } catch (error) {
      logger.error({ err: (error as Error).message }, 'digest scheduler error');
    }
  }, DIGEST_CHECK_MS);

  // A4 — Radar de validade: reavalia certificados TLS dos endpoints HTTPS e abre alertas
  // de expiração. Roda no boot (após 30s) e depois a cada 12h.
  const CERT_CHECK_MS = parseInt(process.env.CERT_CHECK_MS || '43200000'); // 12h
  const runCertScan = async () => {
    try {
      const r = await refreshAllCerts();
      if (r.checked) logger.info(r, 'radar de validade — certs verificados');
    } catch (error) {
      logger.error({ err: (error as Error).message }, 'cert scan error');
    }
  };
  setTimeout(runCertScan, 30000);
  setInterval(runCertScan, CERT_CHECK_MS);

  // C1/C2 — processa alertas: notifica canais (Slack/Teams/Webhook/Email), escala
  // não resolvidos e abre/fecha tickets (Jira/ServiceNow). A cada 60s.
  const ALERT_PROC_MS = parseInt(process.env.ALERT_PROC_MS || '60000');
  setInterval(async () => {
    try {
      const r = await processAlerts();
      if (r.notified || r.escalated || r.closed) logger.info(r, 'alertas processados (notify/ticket)');
    } catch (error) {
      logger.error({ err: (error as Error).message }, 'alert processor error');
    }
  }, ALERT_PROC_MS);

  // E1 — snapshot de métricas para previsão de falha (tendência). A cada 5 min.
  const SAMPLE_MS = parseInt(process.env.METRIC_SAMPLE_MS || '300000');
  const runSnapshot = async () => {
    try {
      const n = await snapshotMetrics();
      if (n) logger.debug({ sampled: n }, 'snapshot de métricas');
    } catch (error) {
      logger.error({ err: (error as Error).message }, 'metric snapshot error');
    }
  };
  setTimeout(runSnapshot, 45000);
  setInterval(runSnapshot, SAMPLE_MS);

  // Conector CPI (Integration Suite): sincroniza os MPL reais das configs habilitadas. A cada 10 min.
  const CPI_SYNC_MS = parseInt(process.env.CPI_SYNC_MS || '600000');
  setInterval(async () => {
    try { const n = await syncAllCpi(); if (n) logger.info({ synced: n }, 'CPI sync'); }
    catch (error) { logger.error({ err: (error as Error).message }, 'cpi sync error'); }
  }, CPI_SYNC_MS);
});

export default app;
