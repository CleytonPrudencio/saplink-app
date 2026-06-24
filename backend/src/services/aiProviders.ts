import crypto from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../lib/prisma';
import { decryptValue } from '../lib/crypto';

// IA multi-provedor (BYO por consultoria) + aprendizado: o cliente conecta a própria IA
// (Claude/ChatGPT/Copilot), define a ordem, e pode deixar o Ollama aprender com a externa.

export type Provider = 'ollama' | 'anthropic' | 'openai' | 'azure';
interface Step { provider: Provider; key?: string; model?: string; endpoint?: string; deployment?: string }
interface Chain { steps: Step[]; learn: boolean }

// Haiku como padrão: rápido e barato (a consultoria pode escolher Sonnet no BYO via cfg.anthropicModel).
const DEF_MODELS = { anthropic: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001', openai: 'gpt-4o-mini', ollama: process.env.OLLAMA_MODEL || 'qwen2.5:7b' };

export function normalizeKey(s = ''): string {
  return String(s).toLowerCase()
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '')
    .replace(/\b\d{3,}\b/g, '#').replace(/\s+/g, ' ').trim().slice(0, 160);
}

async function resolveChain(consultancyId?: string): Promise<Chain> {
  const cfg = consultancyId ? await prisma.aiProviderConfig.findUnique({ where: { consultancyId } }) : null;
  const build = (p?: string | null): Step | null => {
    if (!p) return null;
    if (p === 'ollama') return process.env.OLLAMA_URL ? { provider: 'ollama', model: DEF_MODELS.ollama } : null;
    if (p === 'anthropic') { const key = cfg?.anthropicKey ? String(decryptValue(cfg.anthropicKey) ?? '') : process.env.ANTHROPIC_API_KEY; return key ? { provider: 'anthropic', key, model: cfg?.anthropicModel || DEF_MODELS.anthropic } : null; }
    if (p === 'openai') { const key = cfg?.openaiKey ? String(decryptValue(cfg.openaiKey) ?? '') : undefined; return key ? { provider: 'openai', key, model: cfg?.openaiModel || DEF_MODELS.openai } : null; }
    if (p === 'azure') { const key = cfg?.azureKey ? String(decryptValue(cfg.azureKey) ?? '') : undefined; return key && cfg?.azureEndpoint && cfg?.azureDeployment ? { provider: 'azure', key, endpoint: cfg.azureEndpoint, deployment: cfg.azureDeployment } : null; }
    return null;
  };
  // Sem config da consultoria: se a plataforma tem chave Claude, ele é o primário (rápido);
  // o Ollama (CPU, lento) fica só como reserva. Sem chave, mantém Ollama primário.
  const order = cfg ? [cfg.primary, cfg.fallback] : (process.env.ANTHROPIC_API_KEY ? ['anthropic', 'ollama'] : ['ollama', 'anthropic']);
  const steps: Step[] = [];
  for (const p of order) { const s = build(p); if (s && !steps.find((x) => x.provider === s.provider)) steps.push(s); }
  // garante o Ollama como último recurso
  const ol = build('ollama'); if (ol && !steps.find((s) => s.provider === 'ollama')) steps.push(ol);
  return { steps, learn: !!cfg?.learnFromExternal };
}

async function callProvider(step: Step, sys: string, user: string, numPredict: number): Promise<string | null> {
  if (step.provider === 'ollama') {
    const resp = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: step.model, stream: false, keep_alive: process.env.OLLAMA_KEEP_ALIVE || '1h', options: { num_predict: numPredict, temperature: 0.4 }, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }),
      signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS) || 180000),
    });
    if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
    const d = (await resp.json()) as { message?: { content?: string } };
    return d?.message?.content?.trim() || null;
  }
  if (step.provider === 'anthropic') {
    const client = new Anthropic({ apiKey: step.key });
    const r = await client.messages.create({ model: step.model!, max_tokens: 2048, system: sys, messages: [{ role: 'user', content: user }] });
    const b = r.content.find((x) => x.type === 'text');
    return b && b.type === 'text' ? b.text.trim() : null;
  }
  if (step.provider === 'openai' || step.provider === 'azure') {
    const url = step.provider === 'openai'
      ? 'https://api.openai.com/v1/chat/completions'
      : `${step.endpoint!.replace(/\/$/, '')}/openai/deployments/${step.deployment}/chat/completions?api-version=2024-02-15-preview`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (step.provider === 'openai') headers.Authorization = `Bearer ${step.key}`; else headers['api-key'] = step.key!;
    const body: Record<string, unknown> = { messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], max_tokens: 2048, temperature: 0.4 };
    if (step.provider === 'openai') body.model = step.model;
    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
    if (!resp.ok) throw new Error(`${step.provider} HTTP ${resp.status}`);
    const d = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
    return d?.choices?.[0]?.message?.content?.trim() || null;
  }
  return null;
}

async function recall(consultancyId: string, topicKey: string): Promise<string | null> {
  if (!topicKey) return null;
  const rows = await prisma.aiKnowledge.findMany({ where: { consultancyId, topicKey }, orderBy: { createdAt: 'desc' }, take: 2, select: { answer: true } });
  if (!rows.length) return null;
  return rows.map((r) => r.answer).join('\n---\n').slice(0, 1500);
}
async function store(consultancyId: string, topicKey: string, question: string, answer: string, source: string) {
  await prisma.aiKnowledge.create({ data: { consultancyId, topicKey, question: question.slice(0, 1000), answer: answer.slice(0, 4000), source } });
}

/** Gera texto pela cadeia de provedores do tenant. Retorna null se todos falharem. */
export async function generate(sys: string, user: string, numPredict = 450, ctx: { consultancyId?: string; learnKey?: string } = {}): Promise<string | null> {
  const { steps, learn } = await resolveChain(ctx.consultancyId);
  const key = ctx.learnKey ? normalizeKey(ctx.learnKey) : normalizeKey(user);
  for (const step of steps) {
    try {
      let u = user;
      if (step.provider === 'ollama' && ctx.consultancyId) {
        const learned = await recall(ctx.consultancyId, key).catch(() => null);
        if (learned) u = `Casos anteriores já resolvidos (use como referência confiável):\n${learned}\n\n${user}`;
      }
      const text = await callProvider(step, sys, u, numPredict);
      if (text && text.length > 0) {
        if (learn && step.provider !== 'ollama' && ctx.consultancyId) await store(ctx.consultancyId, key, user, text, step.provider).catch(() => {});
        return text;
      }
    } catch (e) { console.error(`[ai] provider ${step.provider}:`, (e as Error).message); }
  }
  return null;
}

/** Testa um provedor com as credenciais informadas (botão "testar"). */
export async function testProvider(provider: Provider, creds: { key?: string; model?: string; endpoint?: string; deployment?: string }): Promise<{ ok: boolean; ms?: number; error?: string }> {
  const t0 = Date.now();
  try {
    const step: Step = { provider, key: creds.key, model: creds.model || (DEF_MODELS as any)[provider], endpoint: creds.endpoint, deployment: creds.deployment };
    const r = await callProvider(step, 'Você é um teste de conexão.', 'Responda apenas: OK', 10);
    if (r) return { ok: true, ms: Date.now() - t0 };
    return { ok: false, error: 'Sem resposta do provedor.' };
  } catch (e) { return { ok: false, error: (e as Error).message }; }
}
