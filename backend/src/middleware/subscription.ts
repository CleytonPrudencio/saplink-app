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
      // Autenticado, mas sem consultoria (ex.: super-admin). É 403 (forbidden),
      // NÃO 401 — senão o front trata como sessão expirada e desloga em loop.
      res.status(403).json({ error: 'no_tenant', message: 'Usuário sem consultoria associada.' });
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
