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
import { authMiddleware } from './middleware/auth';
import { tenancyMiddleware } from './middleware/tenancy';
import { requireActiveSubscription } from './middleware/subscription';
import { simulateIntegrationData } from './services/simulator';
import prisma from './lib/prisma';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const SIMULATION_INTERVAL = parseInt(process.env.SIMULATION_INTERVAL || '30000'); // 30s default

app.use(pinoHttp({ logger }));
app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
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

// Auth e billing: acessíveis sem assinatura ativa (login, regularizar pagamento)
app.use('/api/auth', authRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/consultancy', consultancyRoutes);
app.use('/api/users', userRoutes);

// Rotas de negócio: exigem assinatura ATIVA (corte do inadimplente)
const tenantGate = [authMiddleware, tenancyMiddleware, requireActiveSubscription];
app.use('/api/clients', ...tenantGate, clientRoutes);
app.use('/api/integrations', ...tenantGate, integrationRoutes);
app.use('/api/alerts', ...tenantGate, alertRoutes);
app.use('/api/diagnostics', ...tenantGate, diagnosticRoutes);
app.use('/api/dead-code', ...tenantGate, deadCodeRoutes);

// Error handler global (último middleware)
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  (req as any).log?.error({ err }, 'unhandled error');
  logger.error({ err: err.message }, 'unhandled error');
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT, simulationIntervalS: SIMULATION_INTERVAL / 1000 }, 'SAPLINK Backend running');

  // Auto-simulate every N seconds
  setInterval(async () => {
    try {
      const result = await simulateIntegrationData();
      logger.debug({ updated: result.updated }, 'simulator tick');
    } catch (error) {
      logger.error({ err: (error as Error).message }, 'simulator error');
    }
  }, SIMULATION_INTERVAL);
});

export default app;
