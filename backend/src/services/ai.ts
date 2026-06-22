import { generate } from './aiProviders';

type AiCtx = { consultancyId?: string; learnKey?: string };

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

/** Chamada genérica de IA — roteia pela cadeia de provedores do tenant (BYO) + aprendizado. */
async function runAI(systemPrompt: string, userMessage: string, numPredict = 450, ctx: AiCtx = {}): Promise<string> {
  const text = await generate(systemPrompt, userMessage, numPredict, ctx);
  return text && text.length > 0 ? text : AI_UNAVAILABLE;
}

export async function diagnose(query: string, context: object, consultancyId?: string): Promise<string> {
  const userMessage = `Contexto do cliente:\n${JSON.stringify(context, null, 2)}\n\nConsulta do usuário:\n${query}`;
  return runAI(SYSTEM_PROMPT, userMessage, 450, { consultancyId, learnKey: query });
}

/** Copiloto: pergunta em linguagem natural sobre a carteira inteira da consultoria. */
export async function ask(question: string, context: object, consultancyId?: string): Promise<string> {
  const userMessage = `Dados da carteira (resumo):\n${JSON.stringify(context, null, 2)}\n\nPergunta: ${question}`;
  return runAI(ASK_PROMPT, userMessage, 500, { consultancyId });
}

/** Digest semanal: narra o resumo de saúde da carteira para o gestor. */
export async function narrateDigest(context: object, consultancyId?: string): Promise<string> {
  const userMessage = `Dados da carteira nesta semana:\n${JSON.stringify(context, null, 2)}\n\nEscreva o resumo semanal.`;
  return runAI(DIGEST_PROMPT, userMessage, 450, { consultancyId });
}

const SLA_PROMPT = `Você é um analista de níveis de serviço (SLA) de integrações SAP, escrevendo o
relatório mensal de SLA de um cliente para apresentação executiva. Português brasileiro, tom formal e objetivo.
Estruture: 1) Resultado do mês (cumpriu ou não a meta, com números); 2) Principais quebras (integrações que
ficaram abaixo da meta, com nomes); 3) Recomendações para o próximo período. Máx ~180 palavras. Use só os dados do contexto.`;

/** Relatório mensal de SLA narrado por IA. */
export async function narrateSla(context: object, consultancyId?: string): Promise<string> {
  const userMessage = `Dados de SLA do cliente:\n${JSON.stringify(context, null, 2)}\n\nEscreva o relatório mensal de SLA.`;
  return runAI(SLA_PROMPT, userMessage, 420, { consultancyId });
}

const FIX_PROMPT = `Você é um engenheiro SAP de integração sênior. Dada uma falha, gere a CORREÇÃO PRONTA
para aplicar — não explique demais, entregue o artefato. Responda em português brasileiro, neste formato:

### Resumo
(1 linha: o que a correção faz)

### Correção
\`\`\`
(o trecho pronto: Groovy do CPI, mapeamento, filtro OData, ou comando/transação SAP — o que resolver o caso)
\`\`\`

### Onde aplicar
(passos curtos e objetivos de onde colar/configurar)

### Validação
(como confirmar que resolveu)

Seja concreto e seguro. Se faltar dado, assuma o caso mais comum e diga a premissa.`;

/** Remediação generativa: a IA escreve a correção pronta (snippet/config), não só descreve. */
export async function generateFix(query: string, context: object, consultancyId?: string): Promise<string> {
  const userMessage = `Contexto da falha:\n${JSON.stringify(context, null, 2)}\n\nGere a correção pronta para: ${query}`;
  return runAI(FIX_PROMPT, userMessage, 600, { consultancyId, learnKey: query });
}

/** Interpreta um comando em linguagem natural (ChatOps) e retorna a intenção em JSON. */
export async function parseIntent(text: string, context: object, consultancyId?: string): Promise<string> {
  const sys = `Você converte um comando em português sobre operação SAP em JSON de intenção. Responda APENAS JSON válido,
sem texto extra, no formato {"action":"...","clientName":"...","filter":"..."}. Ações válidas:
"list_failures" (o que está falhando), "client_health" (saúde de um cliente), "request_remediation" (pedir correção de itens de um cliente),
"portfolio_summary" (resumo da carteira), "unknown". Use clientName quando o comando citar um cliente.`;
  const userMessage = `Clientes disponíveis: ${JSON.stringify(context)}\n\nComando: ${text}`;
  return runAI(sys, userMessage, 150, { consultancyId });
}

const EXPLAIN_PROMPT = `Você é o copiloto de operações SAP do SAPLINK. O usuário está olhando uma tela e te enviou
os dados que ela mostra. Explique em português, de forma OBJETIVA e prática, em 3 blocos curtos (sem markdown pesado):

### Leitura
2-3 frases: o que esses números querem dizer, em linguagem de negócio (não repita os dados, interprete).

### Pontos de atenção
Bullets curtos com o que está pior / merece olhar (cite nomes/valores reais do contexto). Se está tudo bem, diga isso.

### O que fazer agora
2-3 ações priorizadas e concretas (qual tela/transação/passo). Sempre acionável.

Não invente dados fora do contexto. Seja direto — o usuário quer saber "e daí?".`;

/** Explica os dados de uma tela e recomenda ações. Torna qualquer tela de dados acionável. */
export async function explainScreen(screen: string, data: object, consultancyId?: string): Promise<string> {
  const userMessage = `Tela: ${screen}\n\nDados que a tela está mostrando:\n${JSON.stringify(data, null, 2)}\n\nExplique e recomende.`;
  return runAI(EXPLAIN_PROMPT, userMessage, 480, { consultancyId });
}

/** Indica se algum provedor de IA está configurado (Ollama ou Claude). */
export function aiEnabled(): boolean {
  return !!(process.env.OLLAMA_URL || process.env.ANTHROPIC_API_KEY);
}
