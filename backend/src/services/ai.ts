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

const ASK_PROMPT = `Você é o copiloto de operações SAP de uma consultoria, dentro do SAPLINK.
Você enxerga a carteira inteira (clientes, integrações, status, métricas e alertas).
Responda em português brasileiro, de forma OBJETIVA e acionável, citando clientes e integrações
específicos pelo nome quando relevante. Se a pergunta pedir uma ação, sugira a transação SAP ou o
passo no SAPLINK. Não invente dados que não estão no contexto.`;

const DIGEST_PROMPT = `Você é o analista de operações SAP do SAPLINK, escrevendo o resumo SEMANAL
de saúde da carteira para o gestor de uma consultoria. Escreva em português brasileiro, tom executivo,
direto e profissional. Estruture em 3 blocos curtos, sem markdown pesado:
1) Panorama — uma frase sobre o estado geral da carteira na semana.
2) Pontos de atenção — bullets curtos com os clientes/integrações que pioraram ou seguem críticos (cite nomes).
3) Recomendações — 2 a 3 ações priorizadas para a próxima semana (transação SAP ou passo no SAPLINK quando couber).
Seja conciso (máx ~180 palavras). NÃO invente dados fora do contexto. Se a carteira está saudável, diga isso com clareza.`;

/** Chamada genérica de IA (Ollama → Claude → fallback). Retorna texto. */
async function runAI(systemPrompt: string, userMessage: string, numPredict = 450): Promise<string> {
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
          options: { num_predict: numPredict, temperature: 0.4 },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
        signal: AbortSignal.timeout(Number(process.env.OLLAMA_TIMEOUT_MS) || 180000),
      });
      if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
      const data = (await resp.json()) as { message?: { content?: string } };
      const text = data?.message?.content?.trim();
      return text && text.length > 0 ? text : AI_UNAVAILABLE;
    } catch (error) {
      console.error('Ollama error:', error);
      return AI_UNAVAILABLE;
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return AI_UNAVAILABLE;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    const textBlock = response.content.find((block) => block.type === 'text');
    return textBlock && textBlock.type === 'text' ? textBlock.text : AI_UNAVAILABLE;
  } catch (error) {
    console.error('AI error:', error);
    return AI_UNAVAILABLE;
  }
}

export async function diagnose(query: string, context: object): Promise<string> {
  const userMessage = `Contexto do cliente:\n${JSON.stringify(context, null, 2)}\n\nConsulta do usuário:\n${query}`;
  return runAI(SYSTEM_PROMPT, userMessage, 450);
}

/** Copiloto: pergunta em linguagem natural sobre a carteira inteira da consultoria. */
export async function ask(question: string, context: object): Promise<string> {
  const userMessage = `Dados da carteira (resumo):\n${JSON.stringify(context, null, 2)}\n\nPergunta: ${question}`;
  return runAI(ASK_PROMPT, userMessage, 500);
}

/** Digest semanal: narra o resumo de saúde da carteira para o gestor. */
export async function narrateDigest(context: object): Promise<string> {
  const userMessage = `Dados da carteira nesta semana:\n${JSON.stringify(context, null, 2)}\n\nEscreva o resumo semanal.`;
  return runAI(DIGEST_PROMPT, userMessage, 450);
}

/** Indica se algum provedor de IA está configurado (Ollama ou Claude). */
export function aiEnabled(): boolean {
  return !!(process.env.OLLAMA_URL || process.env.ANTHROPIC_API_KEY);
}
