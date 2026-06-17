import crypto from 'crypto';

// Criptografia de segredos em repouso (AES-256-GCM).
// Chave derivada de ENCRYPTION_KEY (obrigatória). Valores ficam prefixados com "enc:".
const SECRET = process.env.ENCRYPTION_KEY;
if (!SECRET || SECRET.trim() === '') {
  throw new Error('[crypto] Variável de ambiente ENCRYPTION_KEY ausente');
}
const KEY = crypto.createHash('sha256').update(SECRET).digest(); // 32 bytes

// Campos de config considerados sensíveis
export const SENSITIVE = /pass|secret|apikey|api_key|authvalue|auth_value|token|client_secret/i;

export function encryptValue(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const ct = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return 'enc:' + Buffer.concat([iv, tag, ct]).toString('base64');
}

export function decryptValue(stored: unknown): unknown {
  if (typeof stored !== 'string' || !stored.startsWith('enc:')) return stored;
  try {
    const buf = Buffer.from(stored.slice(4), 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ct = buf.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
  } catch {
    return stored; // se falhar, devolve como está (não derruba o fluxo)
  }
}

type Cfg = Record<string, unknown>;

/** Criptografa apenas os campos sensíveis (idempotente: não re-encripta valores já "enc:"). */
export function encryptConfig(config: unknown): Cfg | null {
  if (!config || typeof config !== 'object') return config as null;
  const out: Cfg = {};
  for (const [k, v] of Object.entries(config as Cfg)) {
    out[k] = SENSITIVE.test(k) && typeof v === 'string' && v && !v.startsWith('enc:') ? encryptValue(v) : v;
  }
  return out;
}

/** Descriptografa os campos para USO (probe/conexão real). */
export function decryptConfig(config: unknown): Cfg | null {
  if (!config || typeof config !== 'object') return config as null;
  const out: Cfg = {};
  for (const [k, v] of Object.entries(config as Cfg)) {
    out[k] = decryptValue(v);
  }
  return out;
}

/** Mascara campos sensíveis para EXIBIÇÃO (nunca devolver o segredo). */
export function maskConfig(config: unknown): Cfg | null {
  if (!config || typeof config !== 'object') return config as null;
  const out: Cfg = {};
  for (const [k, v] of Object.entries(config as Cfg)) {
    out[k] = SENSITIVE.test(k) ? (v ? '••••••' : v) : v;
  }
  return out;
}
