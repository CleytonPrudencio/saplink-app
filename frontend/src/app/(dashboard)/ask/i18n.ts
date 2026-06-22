import type { Lang } from "@/i18n/I18n";

export const T: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    suggestions: string[];
    startWith: string;
    noAnswer: string;
    errorAsk: string;
    analyzing: string;
    inputPlaceholder: string;
    send: string;
  }
> = {
  pt: {
    title: "Pergunte ao SAPLINK",
    subtitle: "Copiloto de operação — pergunte em linguagem natural sobre toda a sua carteira.",
    suggestions: [
      "Quais clientes têm integração com erro agora?",
      "Resumo da saúde da minha carteira",
      "Quais integrações estão com uptime abaixo do SLA?",
      "Onde estão os alertas mais críticos?",
      "Qual cliente precisa de atenção urgente?",
    ],
    startWith: "Comece com uma pergunta:",
    noAnswer: "Sem resposta.",
    errorAsk: "Erro ao consultar o copiloto.",
    analyzing: "Analisando a carteira... pode levar até ~1 min.",
    inputPlaceholder: "Pergunte sobre clientes, integrações, alertas...",
    send: "Enviar",
  },
  en: {
    title: "Ask SAPLINK",
    subtitle: "Operations copilot — ask in natural language about your entire portfolio.",
    suggestions: [
      "Which clients have an integration in error right now?",
      "Summary of my portfolio's health",
      "Which integrations have uptime below the SLA?",
      "Where are the most critical alerts?",
      "Which client needs urgent attention?",
    ],
    startWith: "Start with a question:",
    noAnswer: "No answer.",
    errorAsk: "Error querying the copilot.",
    analyzing: "Analyzing the portfolio... this can take up to ~1 min.",
    inputPlaceholder: "Ask about clients, integrations, alerts...",
    send: "Send",
  },
  es: {
    title: "Pregunta a SAPLINK",
    subtitle: "Copiloto de operación — pregunta en lenguaje natural sobre toda tu cartera.",
    suggestions: [
      "¿Qué clientes tienen una integración con error ahora?",
      "Resumen de la salud de mi cartera",
      "¿Qué integraciones tienen disponibilidad por debajo del SLA?",
      "¿Dónde están las alertas más críticas?",
      "¿Qué cliente necesita atención urgente?",
    ],
    startWith: "Comienza con una pregunta:",
    noAnswer: "Sin respuesta.",
    errorAsk: "Error al consultar el copiloto.",
    analyzing: "Analizando la cartera... puede tardar hasta ~1 min.",
    inputPlaceholder: "Pregunta sobre clientes, integraciones, alertas...",
    send: "Enviar",
  },
};
