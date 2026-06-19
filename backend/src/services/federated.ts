import crypto from 'node:crypto';
import prisma from '../lib/prisma';

// Rede Federada de Falhas — "Waze do SAP".
// Cada falha vira uma assinatura GLOBAL e anonimizada; cada correção que funcionou
// alimenta a taxa de sucesso. Quanto mais clientes na rede, mais inteligente fica.

const SALT = process.env.FEDERATION_SALT || 'saplink-federation';

/** Normaliza a mensagem de erro removendo ids/guids/números para agrupar falhas iguais. */
export function normalizeError(msg = ''): string {
  return String(msg)
    .toLowerCase()
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '<guid>')
    .replace(/\b\d{4,}\b/g, '<num>')
    .replace(/'[^']*'/g, "'<v>'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}
const keyOf = (source: string, errorNorm: string) =>
  crypto.createHash('sha1').update(`${source}|${errorNorm}`).digest('hex');
const clientHash = (clientId: string) =>
  crypto.createHash('sha256').update(`${SALT}|${clientId}`).digest('hex').slice(0, 16);

interface FixRow { action: string; count: number; successCount: number; avgMinutes: number }

/** Registra uma ocorrência de falha na rede (anonimizado por hash do cliente). */
export async function recordFailure(clientId: string, source: string, message?: string | null) {
  const errorNorm = normalizeError(message || '');
  if (!errorNorm) return;
  const sigKey = keyOf(source, errorNorm);
  const ch = clientHash(clientId);
  await prisma.failureSignatureClient.upsert({
    where: { sigKey_clientHash: { sigKey, clientHash: ch } },
    update: { lastSeenAt: new Date() },
    create: { sigKey, clientHash: ch },
  });
  const clientsCount = await prisma.failureSignatureClient.count({ where: { sigKey } });
  await prisma.failureSignature.upsert({
    where: { sigKey },
    update: { occurrences: { increment: 1 }, clientsCount, lastSeenAt: new Date(), sampleMessage: (message || '').slice(0, 300) },
    create: { sigKey, source, errorNorm, sampleMessage: (message || '').slice(0, 300), occurrences: 1, clientsCount },
  });
}

/** Registra o resultado de uma correção contra a assinatura da falha. */
export async function recordFix(source: string, message: string | null | undefined, action: string, success: boolean, minutes?: number) {
  const errorNorm = normalizeError(message || '');
  if (!errorNorm) return;
  const sig = await prisma.failureSignature.findUnique({ where: { sigKey: keyOf(source, errorNorm) } });
  if (!sig) return;
  const fixes: FixRow[] = Array.isArray(sig.fixes) ? (sig.fixes as any) : [];
  let f = fixes.find((x) => x.action === action);
  if (!f) { f = { action, count: 0, successCount: 0, avgMinutes: 0 }; fixes.push(f); }
  f.avgMinutes = Math.round((f.avgMinutes * f.count + (minutes || 0)) / (f.count + 1));
  f.count += 1;
  if (success) f.successCount += 1;
  await prisma.failureSignature.update({ where: { id: sig.id }, data: { fixes: fixes as any } });
}

function rankFixes(fixes: FixRow[]) {
  return fixes
    .map((f) => ({ ...f, successRate: f.count ? Math.round((f.successCount / f.count) * 100) : 0 }))
    .sort((a, b) => b.successRate - a.successRate || b.count - a.count);
}

/** Consulta a rede para uma falha: quantas vezes, em quantos clientes, e a correção vencedora. */
export async function lookup(source: string, message?: string | null) {
  const errorNorm = normalizeError(message || '');
  if (!errorNorm) return null;
  const sig = await prisma.failureSignature.findUnique({ where: { sigKey: keyOf(source, errorNorm) } });
  if (!sig) return null;
  const fixes = rankFixes(Array.isArray(sig.fixes) ? (sig.fixes as any) : []);
  return { occurrences: sig.occurrences, clientsCount: sig.clientsCount, sampleMessage: sig.sampleMessage, bestFix: fixes[0] || null, fixes };
}

/** Top assinaturas da rede (para a página da Rede Federada). */
export async function topSignatures(limit = 50) {
  const sigs = await prisma.failureSignature.findMany({ orderBy: [{ occurrences: 'desc' }], take: limit });
  const totals = await prisma.failureSignature.aggregate({ _sum: { occurrences: true }, _count: true });
  return {
    summary: {
      signatures: totals._count,
      occurrences: totals._sum.occurrences || 0,
    },
    items: sigs.map((s) => {
      const fixes = rankFixes(Array.isArray(s.fixes) ? (s.fixes as any) : []);
      return {
        source: s.source, errorNorm: s.errorNorm, sample: s.sampleMessage,
        occurrences: s.occurrences, clientsCount: s.clientsCount,
        bestFix: fixes[0] || null, lastSeenAt: s.lastSeenAt,
      };
    }),
  };
}
