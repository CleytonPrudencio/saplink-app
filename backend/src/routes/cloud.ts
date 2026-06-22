import { Router, Request, Response } from 'express';
import { getCloud, diagnoseCloudItem, fixCloudItem } from '../services/cloud';
import { reqEnv } from '../lib/env';

// F1/F2 — CPI / AIF. Sob o tenantGate.
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    res.json(await getCloud(req.consultancyId!, {
      source: req.query.source as string | undefined,
      status: req.query.status as string | undefined,
      q: req.query.q as string | undefined,
      clientId: req.query.clientId as string | undefined,
      env: reqEnv(req),
    }));
  } catch (e) {
    console.error('Cloud error:', e);
    res.status(500).json({ error: 'Erro ao carregar CPI/AIF.' });
  }
});

// IA: diagnostica uma falha CPI/AIF (causa raiz + correção). ?force=1 refaz.
router.post('/:id/diagnose', async (req: Request, res: Response) => {
  try {
    const r = await diagnoseCloudItem(req.consultancyId!, req.params.id, req.query.force === '1');
    if ('error' in r) { res.status(404).json({ error: 'Mensagem não encontrada.' }); return; }
    res.json(r);
  } catch (e) {
    console.error('Cloud diagnose error:', e);
    res.status(500).json({ error: 'Erro ao diagnosticar a falha.' });
  }
});

// IA generativa: escreve a correção pronta para a falha. ?force=1 refaz.
router.post('/:id/fix', async (req: Request, res: Response) => {
  try {
    const r = await fixCloudItem(req.consultancyId!, req.params.id, req.query.force === '1');
    if ('error' in r) { res.status(404).json({ error: 'Mensagem não encontrada.' }); return; }
    res.json(r);
  } catch (e) {
    console.error('Cloud fix error:', e);
    res.status(500).json({ error: 'Erro ao gerar a correção.' });
  }
});

export default router;
