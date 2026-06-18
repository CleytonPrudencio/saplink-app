import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import { saveConfig, getConfigPublic, createTicket } from '../services/tickets';
import prisma from '../lib/prisma';

// C2 — ticket sync (Jira/ServiceNow). Sob o tenantGate (admin).
const router = Router();
router.use(requireConsultancyAdmin);

router.get('/config', async (req: Request, res: Response) => {
  res.json({ config: await getConfigPublic(req.consultancyId!) });
});

router.put('/config', async (req: Request, res: Response) => {
  const { provider, baseUrl, authUser, authToken, projectKey, minSeverity, enabled } = req.body || {};
  if (!provider || !baseUrl || !authUser) { res.status(400).json({ error: 'provider, baseUrl e authUser são obrigatórios.' }); return; }
  if (!['JIRA', 'SERVICENOW'].includes(provider)) { res.status(400).json({ error: 'Provider inválido.' }); return; }
  try {
    await saveConfig(req.consultancyId!, { provider, baseUrl, authUser, authToken, projectKey, minSeverity, enabled });
    res.json({ config: await getConfigPublic(req.consultancyId!) });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// Testa criando um chamado real de teste (e informa a key)
router.post('/config/test', async (req: Request, res: Response) => {
  const t = await createTicket(req.consultancyId!, {
    id: 'test', severity: 'HIGH', type: 'TEST',
    message: 'Chamado de teste do SAPLINK — integração de tickets funcionando.',
    client: { name: 'Teste SAPLINK' },
  });
  if (!t) { res.json({ ok: false, reason: 'Não foi possível criar o chamado. Confira URL, usuário, token e projeto.' }); return; }
  res.json({ ok: true, key: t.key, url: t.url });
});

// Alertas com chamado vinculado (para exibir no front)
router.get('/linked', async (req: Request, res: Response) => {
  const clientIds = (await prisma.client.findMany({ where: { consultancyId: req.consultancyId! }, select: { id: true } })).map((c) => c.id);
  const alerts = await prisma.alert.findMany({
    where: { clientId: { in: clientIds }, ticketKey: { not: null } },
    orderBy: { createdAt: 'desc' }, take: 100,
    select: { id: true, message: true, severity: true, ticketKey: true, ticketUrl: true, resolved: true, ticketClosedAt: true },
  });
  res.json({ alerts });
});

export default router;
