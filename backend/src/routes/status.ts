import { Router, Request, Response } from 'express';
import { getStatusByToken, setStatusPage } from '../services/statuspage';

// Status page white-label.
// Público (sem auth): GET /api/status/:token
export const statusPublic = Router();
statusPublic.get('/:token', async (req: Request, res: Response) => {
  try {
    const data = await getStatusByToken(req.params.token);
    if (!data) { res.status(404).json({ error: 'Status page não encontrado.' }); return; }
    res.json(data);
  } catch (e) {
    console.error('Status public error:', e);
    res.status(500).json({ error: 'Erro ao carregar status.' });
  }
});

// Admin (sob tenantGate): POST /api/status-admin/:clientId  { enable: boolean }
export const statusAdmin = Router();
statusAdmin.post('/:clientId', async (req: Request, res: Response) => {
  try {
    res.json(await setStatusPage(req.consultancyId!, req.params.clientId, !!req.body?.enable));
  } catch (e: any) {
    res.status(400).json({ error: e?.message || 'Falha ao configurar o status page.' });
  }
});
