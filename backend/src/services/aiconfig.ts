import prisma from '../lib/prisma';
import { encryptValue, decryptValue } from '../lib/crypto';
import { testProvider, Provider } from './aiProviders';

export async function getConfig(consultancyId: string) {
  const c = await prisma.aiProviderConfig.findUnique({ where: { consultancyId } });
  return {
    primary: c?.primary || 'ollama',
    fallback: c?.fallback || '',
    learnFromExternal: c?.learnFromExternal || false,
    anthropic: { hasKey: !!c?.anthropicKey, model: c?.anthropicModel || '' },
    openai: { hasKey: !!c?.openaiKey, model: c?.openaiModel || '' },
    azure: { hasKey: !!c?.azureKey, endpoint: c?.azureEndpoint || '', deployment: c?.azureDeployment || '' },
  };
}

interface SaveInput {
  primary?: string; fallback?: string; learnFromExternal?: boolean;
  anthropicKey?: string; anthropicModel?: string;
  openaiKey?: string; openaiModel?: string;
  azureKey?: string; azureEndpoint?: string; azureDeployment?: string;
}

export async function saveConfig(consultancyId: string, input: SaveInput) {
  const ex = await prisma.aiProviderConfig.findUnique({ where: { consultancyId } });
  const enc = (v: string | undefined, prev: string | null | undefined) => (v ? encryptValue(v) : (prev ?? null));
  const data = {
    primary: input.primary || 'ollama',
    fallback: input.fallback || null,
    learnFromExternal: !!input.learnFromExternal,
    anthropicKey: enc(input.anthropicKey, ex?.anthropicKey), anthropicModel: input.anthropicModel ?? ex?.anthropicModel ?? null,
    openaiKey: enc(input.openaiKey, ex?.openaiKey), openaiModel: input.openaiModel ?? ex?.openaiModel ?? null,
    azureKey: enc(input.azureKey, ex?.azureKey), azureEndpoint: input.azureEndpoint ?? ex?.azureEndpoint ?? null, azureDeployment: input.azureDeployment ?? ex?.azureDeployment ?? null,
  };
  await prisma.aiProviderConfig.upsert({ where: { consultancyId }, update: data, create: { consultancyId, ...data } });
  return getConfig(consultancyId);
}

/** Testa um provedor. Usa a chave enviada ou, se vazia, a já salva (decifrada). */
export async function test(consultancyId: string, provider: Provider, creds: { key?: string; model?: string; endpoint?: string; deployment?: string }) {
  if (provider === 'ollama') return testProvider('ollama', {});
  let { key, endpoint, deployment } = creds;
  if (!key) {
    const c = await prisma.aiProviderConfig.findUnique({ where: { consultancyId } });
    if (provider === 'anthropic') key = c?.anthropicKey ? String(decryptValue(c.anthropicKey) ?? '') : '';
    if (provider === 'openai') key = c?.openaiKey ? String(decryptValue(c.openaiKey) ?? '') : '';
    if (provider === 'azure') { key = c?.azureKey ? String(decryptValue(c.azureKey) ?? '') : ''; endpoint = endpoint || c?.azureEndpoint || ''; deployment = deployment || c?.azureDeployment || ''; }
  }
  if (!key) return { ok: false, error: 'Informe a chave para testar.' };
  return testProvider(provider, { key, model: creds.model, endpoint, deployment });
}
