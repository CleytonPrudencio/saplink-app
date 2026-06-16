import { Request, Response, NextFunction } from 'express';
import { getEffectiveStatus } from '../services/billing';

/**
 * Corta o acesso de tenants inadimplentes/suspensos. Aplicar DEPOIS de auth+tenancy
 * e ANTES das rotas de negócio. As rotas de /api/billing NÃO usam este middleware,
 * para o cliente poder regularizar o pagamento mesmo suspenso.
 */
export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const consultancyId = req.consultancyId;
    if (!consultancyId) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    const eff = await getEffectiveStatus(consultancyId);
    if (!eff.allowed) {
      res.status(403).json({
        error: 'subscription_inactive',
        message: eff.reason || 'Assinatura inativa.',
        status: eff.status,
      });
      return;
    }
    next();
  } catch (e) {
    next(e);
  }
}
