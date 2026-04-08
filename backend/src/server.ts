import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import integrationRoutes from './routes/integrations';
import alertRoutes from './routes/alerts';
import diagnosticRoutes from './routes/diagnostics';
import deadCodeRoutes from './routes/dead-code';
import { simulateIntegrationData } from './services/simulator';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const SIMULATION_INTERVAL = parseInt(process.env.SIMULATION_INTERVAL || '30000'); // 30s default

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SAPLINK Backend',
    version: '1.0.0',
    simulation: 'active',
    interval: `${SIMULATION_INTERVAL / 1000}s`,
    timestamp: new Date().toISOString(),
  });
});

// Manual simulation trigger
app.post('/api/simulate', async (_req, res) => {
  try {
    const result = await simulateIntegrationData();
    res.json({ status: 'ok', ...result });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Erro na simulação' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/dead-code', deadCodeRoutes);

app.listen(PORT, () => {
  console.log(`SAPLINK Backend running on port ${PORT}`);
  console.log(`Simulation interval: ${SIMULATION_INTERVAL / 1000}s`);

  // Auto-simulate every N seconds
  setInterval(async () => {
    try {
      const result = await simulateIntegrationData();
      console.log(`[Simulator] Updated ${result.updated} integrations at ${result.timestamp}`);
    } catch (error) {
      console.error('[Simulator] Error:', error);
    }
  }, SIMULATION_INTERVAL);
});

export default app;
