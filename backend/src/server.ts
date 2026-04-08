import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import integrationRoutes from './routes/integrations';
import alertRoutes from './routes/alerts';
import diagnosticRoutes from './routes/diagnostics';
import deadCodeRoutes from './routes/dead-code';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'SAPLINK Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
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
});

export default app;
