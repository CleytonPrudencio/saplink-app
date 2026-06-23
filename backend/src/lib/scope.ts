import { AsyncLocalStorage } from 'async_hooks';
import prisma from './prisma';

// Escopo de acesso por request (clientes que o usuário pode ver + se pode escrever).
// Setado no tenancyMiddleware e lido pelos serviços via consultancyClientIds().
interface Scope {
  allowedClientIds: string[] | null; // null = todos os clientes da consultoria
  canWrite: boolean;
}

export const scopeStore = new AsyncLocalStorage<Scope>();

export function currentScope(): Scope {
  return scopeStore.getStore() || { allowedClientIds: null, canWrite: true };
}

/**
 * IDs dos clientes da consultoria, JÁ filtrados pelo escopo do usuário atual.
 * Admin/allClients → todos; analista/consulta restrito → só os atribuídos.
 * Substitui o antigo `prisma.client.findMany({ where: { consultancyId } }).map(c=>c.id)`.
 */
export async function consultancyClientIds(consultancyId: string): Promise<string[]> {
  const all = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const allowed = currentScope().allowedClientIds;
  if (allowed == null) return all;
  const set = new Set(allowed);
  return all.filter((id) => set.has(id));
}

/** O cliente está no escopo do usuário atual? (usar antes de ações de escrita por cliente) */
export function clientInScope(clientId: string): boolean {
  const allowed = currentScope().allowedClientIds;
  return allowed == null || allowed.includes(clientId);
}

/**
 * Resolve o escopo final de leitura considerando um clientId explícito.
 * Se o clientId pedido estiver fora do escopo do usuário → retorna [] (não vaza).
 * Substitui o antigo `clientId ? [clientId] : clientIds`.
 */
export function scopeWithClient(clientId: string | undefined, scoped: string[]): string[] {
  if (!clientId) return scoped;
  return scoped.includes(clientId) ? [clientId] : [];
}
