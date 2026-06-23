import { Request, Response, NextFunction } from 'express';

export const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  CONSULTANCY_ADMIN: 'CONSULTANCY_ADMIN',
  CONSULTANCY_ANALYST: 'CONSULTANCY_ANALYST', // corrige/resolve/IA/edita conexão (nos clientes do escopo)
  CONSULTANCY_VIEWER: 'CONSULTANCY_VIEWER',   // só observa — não edita nada
  CONSULTANCY_USER: 'CONSULTANCY_USER',       // legado: tratado como ANALYST (write)
} as const;

/** Bloqueia qualquer método != GET para o perfil Consulta (read-only). Use no tenantGate. */
export function blockViewerWrites(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role === ROLES.CONSULTANCY_VIEWER && req.method !== 'GET') {
    res.status(403).json({ error: 'Perfil Consulta: acesso somente leitura.' });
    return;
  }
  next();
}

/** Exige que o usuário tenha um dos papéis informados. PLATFORM_ADMIN passa em tudo. */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }
    if (role === ROLES.PLATFORM_ADMIN || roles.includes(role)) {
      next();
      return;
    }
    res.status(403).json({ error: 'Sem permissão para esta ação' });
  };
}

/** Atalho: só admin da consultoria (ou platform admin). */
export const requireConsultancyAdmin = requireRole(ROLES.CONSULTANCY_ADMIN);

/** Atalho: só super-admin da plataforma. */
export const requirePlatformAdmin = requireRole(ROLES.PLATFORM_ADMIN);
