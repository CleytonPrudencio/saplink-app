import { Request, Response, NextFunction } from 'express';
import prisma from './prisma';

// Grava um evento de atividade. Fire-and-forget — nunca derruba o request.
export async function recordActivity(data: {
  consultancyId: string; userId?: string | null; userEmail?: string | null;
  action: string; method?: string; path: string; detail?: string | null; status?: number; ip?: string | null;
}): Promise<void> {
  try {
    await prisma.activityLog.create({ data });
  } catch { /* log de auditoria não pode quebrar a aplicação */ }
}

function actionFromMethod(method: string): string {
  if (method === 'POST') return 'create';
  if (method === 'PATCH' || method === 'PUT') return 'edit';
  if (method === 'DELETE') return 'delete';
  return 'other';
}

// Middleware: registra mutações (POST/PATCH/PUT/DELETE) bem-sucedidas. GET fica de fora
// (acesso a página vem do beacon do front em /api/activity/page).
export function activityLogger(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== 'GET' && !req.baseUrl.endsWith('/activity')) {
    res.on('finish', () => {
      if (res.statusCode < 400 && req.consultancyId && req.user) {
        void recordActivity({
          consultancyId: req.consultancyId,
          userId: req.user.userId,
          userEmail: req.user.email,
          action: actionFromMethod(req.method),
          method: req.method,
          path: req.baseUrl + req.path,
          status: res.statusCode,
          ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || null,
        });
      }
    });
  }
  next();
}
