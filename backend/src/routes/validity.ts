import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireConsultancyAdmin } from '../middleware/roles';
import { scanValidity, refreshCert, refreshAllCerts, httpsHost, severityFor } from '../services/validity';
import { decryptConfig } from '../lib/crypto';

// A4 — Radar de validade. Sob o tenantGate.
const router = Router();

// Radar da consultoria (cert TLS + segredos), ordenado por urgência
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await scanValidity(req.consultancyId!);
    res.json({ items });
  } catch (e) {
    console.error('Validity scan error:', e);
    res.status(500).json({ error: 'Erro ao montar o radar de validade.' });
  }
});

// Reavalia o cert TLS de UMA integração agora (admin)
router.post('/:id/refresh', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const integration = await prisma.integration.findUnique({ where: { id: req.params.id }, include: { client: true } });
  if (!integration || integration.client.consultancyId !== req.consultancyId!) {
    res.status(404).json({ error: 'Integração não encontrada' });
    return;
  }
  const config = (decryptConfig(integration.config) || {}) as Record<string, string>;
  if (!httpsHost(integration.type, config)) {
    res.status(409).json({ error: 'Esta integração não tem endpoint HTTPS para ler certificado.' });
    return;
  }
  const info = await refreshCert(integration.id);
  if (!info) { res.json({ ok: false, reason: 'Não foi possível ler o certificado do endpoint.' }); return; }
  const daysLeft = Math.floor((info.validTo.getTime() - Date.now()) / 86400000);
  res.json({ ok: true, expiresAt: info.validTo.toISOString(), daysLeft, severity: severityFor(daysLeft), subject: info.subject, issuer: info.issuer });
});

// Reavalia todos os certs da consultoria (admin)
router.post('/refresh-all', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await refreshAllCerts(req.consultancyId!);
  const items = await scanValidity(req.consultancyId!);
  res.json({ ...r, items });
});

// Define/limpa a expiração manual de um segredo (admin)
router.put('/:id/secret', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const integration = await prisma.integration.findUnique({ where: { id: req.params.id }, include: { client: true } });
  if (!integration || integration.client.consultancyId !== req.consultancyId!) {
    res.status(404).json({ error: 'Integração não encontrada' });
    return;
  }
  const { secretExpiresAt, secretLabel } = req.body || {};
  const expires = secretExpiresAt ? new Date(secretExpiresAt) : null;
  if (secretExpiresAt && isNaN(expires!.getTime())) {
    res.status(400).json({ error: 'Data de expiração inválida.' });
    return;
  }
  await prisma.integration.update({
    where: { id: integration.id },
    data: { secretExpiresAt: expires, secretLabel: secretLabel?.trim() || null },
  });
  res.json({ ok: true });
});

export default router;
