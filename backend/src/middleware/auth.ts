import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  consultancyId?: string | null; // PLATFORM_ADMIN não tem consultoria
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload & { exp?: number };
    req.user = decoded;
    // Sliding session: se faltam menos de 24h para expirar, renova o token (atividade estende a sessão).
    // Quem ficar >2 dias sem usar, o token expira e cai no login — sem incomodar quem está ativo.
    if (decoded.exp && decoded.exp * 1000 - Date.now() < 24 * 3600000) {
      const { userId, email, role, consultancyId } = decoded;
      const fresh = jwt.sign({ userId, email, role, consultancyId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
      res.setHeader('x-refresh-token', fresh);
      res.setHeader('Access-Control-Expose-Headers', 'x-refresh-token');
    }
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}
