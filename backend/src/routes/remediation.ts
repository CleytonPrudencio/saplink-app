import { Router, Request, Response } from 'express';
import { requireConsultancyAdmin } from '../middleware/roles';
import { createAction, setStatus, listActions, ACTION_LABEL } from '../services/remediation';

// B2 — Remediação autônoma (lado plataforma). Sob o tenantGate.
const router = Router();

// Log/lista de ações
router.get('/', async (req: Request, res: Response) => {
  try {
    const actions = await listActions(req.consultancyId!, req.query.status as string | undefined);
    res.json({ actions, labels: ACTION_LABEL });
  } catch (e) {
    console.error('Remediation list error:', e);
    res.status(500).json({ error: 'Erro ao listar ações.' });
  }
});

// Solicita uma remediação para um item (admin) → PENDING_APPROVAL
router.post('/', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const { sapItemId, actionType } = req.body || {};
  if (!sapItemId) { res.status(400).json({ error: 'sapItemId é obrigatório.' }); return; }
  const r = await createAction(req.consultancyId!, req.user?.userId, sapItemId, actionType);
  if (r.error) {
    const map: Record<string, [number, string]> = {
      NOT_FOUND: [404, 'Item não encontrado.'],
      RESOLVED: [409, 'Item já resolvido.'],
      NOT_REMEDIABLE: [409, 'Este item não é remediável automaticamente.'],
    };
    const [code, msg] = map[r.error] || [400, 'Não foi possível criar a ação.'];
    res.status(code).json({ error: msg });
    return;
  }
  res.json({ action: r.action, duplicate: r.duplicate || false });
});

// Aprova (admin) → APPROVED (o agente pega no próximo poll)
router.post('/:id/approve', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await setStatus(req.consultancyId!, req.user?.userId, req.params.id, 'APPROVED');
  if (r.error) { res.status(r.error === 'NOT_FOUND' ? 404 : 409).json({ error: r.error === 'NOT_PENDING' ? 'Ação não está pendente.' : 'Ação não encontrada.' }); return; }
  res.json({ action: r.action });
});

// Rejeita (admin) → REJECTED
router.post('/:id/reject', requireConsultancyAdmin, async (req: Request, res: Response) => {
  const r = await setStatus(req.consultancyId!, req.user?.userId, req.params.id, 'REJECTED');
  if (r.error) { res.status(r.error === 'NOT_FOUND' ? 404 : 409).json({ error: r.error === 'NOT_PENDING' ? 'Ação não está pendente.' : 'Ação não encontrada.' }); return; }
  res.json({ action: r.action });
});

export default router;
