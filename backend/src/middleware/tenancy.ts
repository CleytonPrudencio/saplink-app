import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { scopeStore } from '../lib/scope';
import { ROLES } from './roles';

declare global {
  namespace Express {
    interface Request {
      consultancyId?: string;
      allowedClientIds?: string[] | null; // null = todos
      canWrite?: boolean;
    }
  }
}

export async function tenancyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }
  req.consultancyId = req.user.consultancyId || undefined;

  const role = req.user.role;
  const canWrite = role !== ROLES.CONSULTANCY_VIEWER;

  // Admin (consultoria/plataforma) vê todos os clientes; analista/consulta podem ser restritos.
  let allowedClientIds: string[] | null = null;
  if (role !== ROLES.PLATFORM_ADMIN && role !== ROLES.CONSULTANCY_ADMIN) {
    const u = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { allClients: true, clientAccess: { select: { clientId: true } } },
    });
    allowedClientIds = u && u.allClients === false ? u.clientAccess.map((a) => a.clientId) : null;
  }

  req.allowedClientIds = allowedClientIds;
  req.canWrite = canWrite;

  // Disponibiliza o escopo pros serviços (via consultancyClientIds) durante todo o request.
  scopeStore.run({ allowedClientIds, canWrite }, () => next());
}
