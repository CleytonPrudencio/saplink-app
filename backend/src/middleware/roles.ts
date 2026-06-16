import { Request, Response, NextFunction } from 'express';

export const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  CONSULTANCY_ADMIN: 'CONSULTANCY_ADMIN',
  CONSULTANCY_USER: 'CONSULTANCY_USER',
} as const;

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
