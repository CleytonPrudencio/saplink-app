import { Request } from 'express';

// Lê o ambiente selecionado no header global (x-environment). Vazio/Todos = sem filtro.
export function reqEnv(req: Request): string | undefined {
  const e = (req.header('x-environment') || '').toUpperCase();
  return ['DEV', 'HML', 'PRD'].includes(e) ? e : undefined;
}

// Fragmento de where do Prisma para filtrar por ambiente (ou {} quando "Todos").
export function envWhere(req: Request): { environment?: string } {
  const e = reqEnv(req);
  return e ? { environment: e } : {};
}
