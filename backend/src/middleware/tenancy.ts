import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      consultancyId?: string;
    }
  }
}

export function tenancyMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }

  req.consultancyId = req.user.consultancyId;
  next();
}
