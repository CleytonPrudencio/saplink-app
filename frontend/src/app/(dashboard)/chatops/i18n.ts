import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  suggestFailing: string;
  suggestPortfolio: string;
  suggestHealth: string;
  suggestReprocess: string;
  emptyConsole: string;
  processing: string;
  commandError: string;
  inputPlaceholder: string;
  send: string;
  connectTitle: string;
  connectDesc: string;
  endpointPost: string;
  header: string;
  body: string;
  rotateToken: string;
  genToken: string;
}> = {
  pt: {
    title: "ChatOps",
    subtitle: "Opere o SAP por mensagem (WhatsApp/Telegram). Comandos que mexem no SAP criam pedido com aprovação — nada destrutivo roda direto.",
    suggestFailing: "O que está falhando agora?",
    suggestPortfolio: "Resumo da carteira",
    suggestHealth: "Saúde do cliente Agro",
    suggestReprocess: "Reprocessa os itens do cliente Agro",
    emptyConsole: "Teste aqui como se fosse o WhatsApp. Ex.: “o que está falhando agora?”",
    processing: "processando…",
    commandError: "Erro ao processar o comando.",
    inputPlaceholder: "Digite um comando…",
    send: "Enviar",
    connectTitle: "Conectar WhatsApp / Telegram",
    connectDesc: "Gere um token e aponte o webhook do seu provedor (WhatsApp Cloud API, Twilio, Telegram) para o endpoint abaixo. As mensagens passam a ser respondidas automaticamente.",
    endpointPost: "Endpoint (POST):",
    header: "Header:",
    body: "Body:",
    rotateToken: "Gerar novo token (invalida o anterior)",
    genToken: "Gerar token de canal",
  },
  en: {
    title: "ChatOps",
    subtitle: "Operate SAP via message (WhatsApp/Telegram). Commands that touch SAP create an approval request — nothing destructive runs directly.",
    suggestFailing: "What is failing right now?",
    suggestPortfolio: "Portfolio summary",
    suggestHealth: "Agro client health",
    suggestReprocess: "Reprocess the Agro client items",
    emptyConsole: "Test here as if it were WhatsApp. E.g. “what is failing right now?”",
    processing: "processing…",
    commandError: "Failed to process the command.",
    inputPlaceholder: "Type a command…",
    send: "Send",
    connectTitle: "Connect WhatsApp / Telegram",
    connectDesc: "Generate a token and point your provider's webhook (WhatsApp Cloud API, Twilio, Telegram) to the endpoint below. Messages will then be answered automatically.",
    endpointPost: "Endpoint (POST):",
    header: "Header:",
    body: "Body:",
    rotateToken: "Generate a new token (invalidates the previous one)",
    genToken: "Generate channel token",
  },
  es: {
    title: "ChatOps",
    subtitle: "Opera SAP por mensaje (WhatsApp/Telegram). Los comandos que tocan SAP crean una solicitud con aprobación — nada destructivo se ejecuta directamente.",
    suggestFailing: "¿Qué está fallando ahora?",
    suggestPortfolio: "Resumen de la cartera",
    suggestHealth: "Salud del cliente Agro",
    suggestReprocess: "Reprocesa los ítems del cliente Agro",
    emptyConsole: "Prueba aquí como si fuera WhatsApp. Ej.: “¿qué está fallando ahora?”",
    processing: "procesando…",
    commandError: "Error al procesar el comando.",
    inputPlaceholder: "Escribe un comando…",
    send: "Enviar",
    connectTitle: "Conectar WhatsApp / Telegram",
    connectDesc: "Genera un token y apunta el webhook de tu proveedor (WhatsApp Cloud API, Twilio, Telegram) al endpoint de abajo. Los mensajes pasan a responderse automáticamente.",
    endpointPost: "Endpoint (POST):",
    header: "Header:",
    body: "Body:",
    rotateToken: "Generar un nuevo token (invalida el anterior)",
    genToken: "Generar token de canal",
  },
};
