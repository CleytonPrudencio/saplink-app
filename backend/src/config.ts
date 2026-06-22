// Configuração central com validação no boot (fail-fast).
// Importar este módulo lança erro na subida se faltar segredo obrigatório.

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`[config] Variável de ambiente obrigatória ausente: ${name}`);
  }
  return v;
}

export const JWT_SECRET: string = required('JWT_SECRET');
// Sessão expira em 2 dias SEM atividade (sliding: renova a cada request — ver middleware/auth).
export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '2d';

// Origens permitidas no CORS (lista separada por vírgula). Default: front local.
export const CORS_ORIGINS: string[] = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
