import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Você é um especialista SAP com profundo conhecimento em integrações, módulos SAP ERP (MM, SD, FI, CO, PP, WM), SAP PI/PO, SAP CPI, IDocs, BAPIs, RFCs, e conexões com sistemas legados.

Responda em português brasileiro de forma clara e estruturada.

Para cada diagnóstico, forneça:
1) **Causa Raiz** — Identifique a origem do problema com base nos dados fornecidos
2) **Passos de Correção** — Instruções detalhadas e práticas para resolver o problema, incluindo transações SAP quando aplicável
3) **Prevenção** — Recomendações para evitar recorrência do problema`;

// Mensagem honesta quando NENHUM provedor de IA está disponível — não fabrica uma análise
// que pareça real. Indica claramente a indisponibilidade do serviço.
const AI_UNAVAILABLE = `⚠️ Diagnóstico automático indisponível no momento.

O serviço de IA não respondeu. Nenhuma análise foi gerada — isto não é um resultado real.

O que fazer:
- Tente novamente em alguns instantes.
- Se persistir, verifique o serviço de IA (Ollama/Claude) na configuração do ambiente.

Enquanto isso, use os dados de monitoramento (status, latência, taxa de erro, alertas) e as transações SAP de praxe (BD87, ST22, SMQ1/SMQ2, SM58) para a análise manual.`;

export async function diagnose(query: string, context: object): Promise<string> {
  const userMessage = `Contexto do cliente:
${JSON.stringify(context, null, 2)}

Consulta do usuário:
${query}`;

  // 1) Ollama local (grátis), se OLLAMA_URL estiver configurado
  const ollamaUrl = process.env.OLLAMA_URL;
  if (ollamaUrl) {
    const model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
    try {
      const resp = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          stream: false,
          // num_predict limita o tamanho da resposta -> muito mais rápido em CPU
          options: { num_predict: 450, temperature: 0.4 },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage },
          ],
        }),
        // CPU pode demorar; mas sem timeout um Ollama travado deixaria o job PENDING pra sempre.
        signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS) || 180000),
      });
      if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
      const data = (await resp.json()) as { message?: { content?: string } };
      const text = data?.message?.content?.trim();
      return text && text.length > 0 ? text : AI_UNAVAILABLE;
    } catch (error) {
      console.error('Ollama diagnosis error:', error);
      return AI_UNAVAILABLE;
    }
  }

  // 2) Claude (Anthropic), se houver chave
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Return mock response when no API key is configured
    return AI_UNAVAILABLE;
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock ? textBlock.text : 'Não foi possível gerar o diagnóstico.';
  } catch (error) {
    console.error('AI diagnosis error:', error);
    // Fallback to mock on error
    return AI_UNAVAILABLE;
  }
}
