import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Você é um especialista SAP com profundo conhecimento em integrações, módulos SAP ERP (MM, SD, FI, CO, PP, WM), SAP PI/PO, SAP CPI, IDocs, BAPIs, RFCs, e conexões com sistemas legados.

Responda em português brasileiro de forma clara e estruturada.

Para cada diagnóstico, forneça:
1) **Causa Raiz** — Identifique a origem do problema com base nos dados fornecidos
2) **Passos de Correção** — Instruções detalhadas e práticas para resolver o problema, incluindo transações SAP quando aplicável
3) **Prevenção** — Recomendações para evitar recorrência do problema`;

const MOCK_RESPONSE = `**Causa Raiz:** [Simulação] Erro de configuração no campo CHARG (lote) da tabela MSEG durante o processamento do IDoc MATMAS05. O campo obrigatório WERKS (centro) não está sendo preenchido corretamente pelo sistema emissor, causando falha na validação do segmento E1MARAM.

**Correção:**
1. Acesse a transação WE19 para testar o IDoc individualmente
2. Verifique o mapeamento na transação BD87 para identificar IDocs com erro
3. Na transação SALE, valide o modelo de distribuição entre os sistemas
4. Corrija o preenchimento do campo WERKS no segmento E1MARCM do IDoc
5. Reprocesse os IDocs pendentes via transação BD87 com status 51

**Prevenção:**
- Configure validação automática no SAP PI/PO para verificar campos obrigatórios antes do envio
- Implemente monitoramento proativo via transação SMQR para filas qRFC
- Ative alertas no Solution Manager (SOLMAN) para falhas de IDoc acima de 5 por hora
- Documente o mapeamento de campos no Integration Directory para referência da equipe`;

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
      return text && text.length > 0 ? text : MOCK_RESPONSE;
    } catch (error) {
      console.error('Ollama diagnosis error:', error);
      return MOCK_RESPONSE;
    }
  }

  // 2) Claude (Anthropic), se houver chave
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Return mock response when no API key is configured
    return MOCK_RESPONSE;
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
    return MOCK_RESPONSE;
  }
}
