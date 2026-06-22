import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  loading: string;
  loadError: string;
  notFound: string;
  integrationsCount: (n: number) => string;
  alertsCount: (n: number) => string;
  tabIntegrations: string;
  tabAlerts: string;
  tabDiagnostics: string;
  metricLatency: string;
  metricErrorRate: string;
  metricUptime: string;
  agentMonitored: string;
  agentNotInstalled: string;
  agentAwaitingFirst: string;
  agentOffline: (min: number) => string;
  agentActiveSec: (s: number) => string;
  agentActiveMin: (min: number) => string;
  agentNewToken: string;
  agentInstall: string;
  integrationErrorTitle: string;
  integrationOfflineTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  sevCritical: string;
  sevHigh: string;
  sevMedium: string;
  issueErrorCriticalTitle: string;
  issueErrorCritical: (rate: number) => string;
  issueErrorCriticalAction: string;
  issueErrorHighTitle: string;
  issueErrorHigh: (rate: number) => string;
  issueErrorHighAction: string;
  issueErrorMediumTitle: string;
  issueErrorMedium: (rate: number) => string;
  issueErrorMediumAction: string;
  issueLatencyHighTitle: string;
  issueLatencyHigh: (ms: number) => string;
  issueLatencyHighAction: string;
  issueLatencyMediumTitle: string;
  issueLatencyMedium: (ms: number) => string;
  issueLatencyMediumAction: string;
  issueUptimeHighTitle: string;
  issueUptimeHigh: (pct: number) => string;
  issueUptimeHighAction: string;
  issueUptimeMediumTitle: string;
  issueUptimeMedium: (pct: number) => string;
  issueUptimeMediumAction: string;
  noIntegrations: string;
  resolve: string;
  resolved: string;
  noAlerts: string;
  newDiagnostic: string;
  noDiagnostics: string;
  modalTitle: string;
  modalIntroAfterName: (type: string) => string;
  modalStep1Label: string;
  modalGeneratingToken: string;
  modalTokenWarn: string;
  modalTokenError: string;
  modalStep2Label: string;
  copy: string;
  copied: string;
  modalRfcNoteBefore: string;
  modalRfcNoteMiddle: string;
  modalRfcNoteAfter: string;
}> = {
  pt: {
    loading: "Carregando...",
    loadError: "Erro ao carregar dados do cliente.",
    notFound: "Cliente não encontrado.",
    integrationsCount: (n) => `${n} integrações`,
    alertsCount: (n) => `${n} alertas`,
    tabIntegrations: "Integrações",
    tabAlerts: "Alertas",
    tabDiagnostics: "Diagnósticos",
    metricLatency: "Latência",
    metricErrorRate: "Taxa de Erro",
    metricUptime: "Uptime",
    agentMonitored: "Monitorado por Agente on-premise",
    agentNotInstalled: "Agente não instalado",
    agentAwaitingFirst: "Aguardando 1ª leitura do agente",
    agentOffline: (min) => `Agente offline (última leitura há ${min} min)`,
    agentActiveSec: (s) => `Agente ativo · última leitura há ${s}s`,
    agentActiveMin: (min) => `Agente ativo · última leitura há ${min} min`,
    agentNewToken: "Novo token / instruções",
    agentInstall: "Instalar agente",
    integrationErrorTitle: "Integração com erro — ação necessária",
    integrationOfflineTitle: "Integração offline",
    step1Title: "Ver alertas relacionados",
    step1Desc: "Confira os alertas gerados por esta integração",
    step2Title: "Diagnosticar com IA",
    step2Desc: "A IA analisa o erro e sugere causa raiz + correção",
    step3Title: "Resolver e monitorar",
    step3Desc: "Após corrigir, o sistema detecta automaticamente a recuperação",
    sevCritical: "CRÍTICO",
    sevHigh: "ALTO",
    sevMedium: "MÉDIO",
    issueErrorCriticalTitle: "Taxa de erro crítica",
    issueErrorCritical: (rate) => `${rate}% dos requests estão falhando. Isso indica um problema grave que precisa de atenção imediata.`,
    issueErrorCriticalAction: "Diagnosticar com IA agora",
    issueErrorHighTitle: "Taxa de erro elevada",
    issueErrorHigh: (rate) => `${rate}% de erros. Pode indicar configuração incorreta de campos ou timeout em BAPIs.`,
    issueErrorHighAction: "Verificar mapeamento de campos",
    issueErrorMediumTitle: "Taxa de erro acima do normal",
    issueErrorMedium: (rate) => `${rate}% de erros. Recomendado investigar antes que escale.`,
    issueErrorMediumAction: "Monitorar nas próximas horas",
    issueLatencyHighTitle: "Latência muito alta",
    issueLatencyHigh: (ms) => `${ms}ms de latência média. O normal é abaixo de 300ms. Pode haver gargalo na rede ou no servidor SAP.`,
    issueLatencyHighAction: "Verificar conexão RFC e rede",
    issueLatencyMediumTitle: "Latência elevada",
    issueLatencyMedium: (ms) => `${ms}ms. Acima do ideal (300ms). Pode impactar a performance de integrações síncronas.`,
    issueLatencyMediumAction: "Otimizar queries ou aumentar timeout",
    issueUptimeHighTitle: "Uptime abaixo do SLA",
    issueUptimeHigh: (pct) => `${pct}% de disponibilidade. A meta mínima é 95%. Verifique estabilidade do servidor.`,
    issueUptimeHighAction: "Revisar infraestrutura",
    issueUptimeMediumTitle: "Uptime precisa melhorar",
    issueUptimeMedium: (pct) => `${pct}% de disponibilidade. Está próximo do limite aceitável (95%).`,
    issueUptimeMediumAction: "Acompanhar tendência",
    noIntegrations: "Nenhuma integração encontrada.",
    resolve: "Resolver",
    resolved: "Resolvido",
    noAlerts: "Nenhum alerta para este cliente.",
    newDiagnostic: "Novo Diagnóstico",
    noDiagnostics: "Nenhum diagnóstico realizado.",
    modalTitle: "Agente on-premise",
    modalIntroAfterName: (type) => ` (${type}) é monitorada por um agente que roda na rede do cliente e fala com o SAP localmente — só tráfego de saída (HTTPS), sem abrir porta.`,
    modalStep1Label: "1. Token desta integração",
    modalGeneratingToken: "Gerando token...",
    modalTokenWarn: "⚠️ Mostrado uma única vez. Copie agora — não fica salvo em claro.",
    modalTokenError: "Não foi possível gerar o token.",
    modalStep2Label: "2. Rode o agente no servidor do cliente",
    copy: "copiar",
    copied: "✓ copiado",
    modalRfcNoteBefore: "Para conexão RFC real, troque ",
    modalRfcNoteMiddle: " por ",
    modalRfcNoteAfter: " e informe host/sysnr/client/usuário (requer o SAP NW RFC SDK na imagem). Detalhes no README do agente.",
  },
  en: {
    loading: "Loading...",
    loadError: "Failed to load client data.",
    notFound: "Client not found.",
    integrationsCount: (n) => `${n} integrations`,
    alertsCount: (n) => `${n} alerts`,
    tabIntegrations: "Integrations",
    tabAlerts: "Alerts",
    tabDiagnostics: "Diagnostics",
    metricLatency: "Latency",
    metricErrorRate: "Error Rate",
    metricUptime: "Uptime",
    agentMonitored: "Monitored by on-premise Agent",
    agentNotInstalled: "Agent not installed",
    agentAwaitingFirst: "Awaiting agent's 1st reading",
    agentOffline: (min) => `Agent offline (last reading ${min} min ago)`,
    agentActiveSec: (s) => `Agent active · last reading ${s}s ago`,
    agentActiveMin: (min) => `Agent active · last reading ${min} min ago`,
    agentNewToken: "New token / instructions",
    agentInstall: "Install agent",
    integrationErrorTitle: "Integration in error — action required",
    integrationOfflineTitle: "Integration offline",
    step1Title: "View related alerts",
    step1Desc: "Check the alerts generated by this integration",
    step2Title: "Diagnose with AI",
    step2Desc: "AI analyzes the error and suggests root cause + fix",
    step3Title: "Resolve and monitor",
    step3Desc: "After fixing, the system automatically detects the recovery",
    sevCritical: "CRITICAL",
    sevHigh: "HIGH",
    sevMedium: "MEDIUM",
    issueErrorCriticalTitle: "Critical error rate",
    issueErrorCritical: (rate) => `${rate}% of requests are failing. This indicates a serious problem that needs immediate attention.`,
    issueErrorCriticalAction: "Diagnose with AI now",
    issueErrorHighTitle: "High error rate",
    issueErrorHigh: (rate) => `${rate}% errors. May indicate incorrect field mapping or BAPI timeouts.`,
    issueErrorHighAction: "Check field mapping",
    issueErrorMediumTitle: "Error rate above normal",
    issueErrorMedium: (rate) => `${rate}% errors. Recommended to investigate before it escalates.`,
    issueErrorMediumAction: "Monitor over the next few hours",
    issueLatencyHighTitle: "Very high latency",
    issueLatencyHigh: (ms) => `${ms}ms average latency. Normal is below 300ms. There may be a bottleneck in the network or the SAP server.`,
    issueLatencyHighAction: "Check RFC connection and network",
    issueLatencyMediumTitle: "Elevated latency",
    issueLatencyMedium: (ms) => `${ms}ms. Above ideal (300ms). May impact the performance of synchronous integrations.`,
    issueLatencyMediumAction: "Optimize queries or increase timeout",
    issueUptimeHighTitle: "Uptime below SLA",
    issueUptimeHigh: (pct) => `${pct}% availability. The minimum target is 95%. Check server stability.`,
    issueUptimeHighAction: "Review infrastructure",
    issueUptimeMediumTitle: "Uptime needs improvement",
    issueUptimeMedium: (pct) => `${pct}% availability. It's close to the acceptable limit (95%).`,
    issueUptimeMediumAction: "Track the trend",
    noIntegrations: "No integrations found.",
    resolve: "Resolve",
    resolved: "Resolved",
    noAlerts: "No alerts for this client.",
    newDiagnostic: "New Diagnostic",
    noDiagnostics: "No diagnostics performed.",
    modalTitle: "On-premise Agent",
    modalIntroAfterName: (type) => ` (${type}) is monitored by an agent that runs on the client's network and talks to SAP locally — outbound traffic only (HTTPS), no open port.`,
    modalStep1Label: "1. Token for this integration",
    modalGeneratingToken: "Generating token...",
    modalTokenWarn: "⚠️ Shown only once. Copy it now — it is not stored in plaintext.",
    modalTokenError: "Could not generate the token.",
    modalStep2Label: "2. Run the agent on the client's server",
    copy: "copy",
    copied: "✓ copied",
    modalRfcNoteBefore: "For a real RFC connection, change ",
    modalRfcNoteMiddle: " to ",
    modalRfcNoteAfter: " and provide host/sysnr/client/user (requires the SAP NW RFC SDK in the image). Details in the agent's README.",
  },
  es: {
    loading: "Cargando...",
    loadError: "Error al cargar los datos del cliente.",
    notFound: "Cliente no encontrado.",
    integrationsCount: (n) => `${n} integraciones`,
    alertsCount: (n) => `${n} alertas`,
    tabIntegrations: "Integraciones",
    tabAlerts: "Alertas",
    tabDiagnostics: "Diagnósticos",
    metricLatency: "Latencia",
    metricErrorRate: "Tasa de Error",
    metricUptime: "Uptime",
    agentMonitored: "Monitoreado por Agente on-premise",
    agentNotInstalled: "Agente no instalado",
    agentAwaitingFirst: "Esperando la 1ª lectura del agente",
    agentOffline: (min) => `Agente offline (última lectura hace ${min} min)`,
    agentActiveSec: (s) => `Agente activo · última lectura hace ${s}s`,
    agentActiveMin: (min) => `Agente activo · última lectura hace ${min} min`,
    agentNewToken: "Nuevo token / instrucciones",
    agentInstall: "Instalar agente",
    integrationErrorTitle: "Integración con error — acción necesaria",
    integrationOfflineTitle: "Integración offline",
    step1Title: "Ver alertas relacionadas",
    step1Desc: "Revisa las alertas generadas por esta integración",
    step2Title: "Diagnosticar con IA",
    step2Desc: "La IA analiza el error y sugiere causa raíz + corrección",
    step3Title: "Resolver y monitorear",
    step3Desc: "Tras corregir, el sistema detecta automáticamente la recuperación",
    sevCritical: "CRÍTICO",
    sevHigh: "ALTO",
    sevMedium: "MEDIO",
    issueErrorCriticalTitle: "Tasa de error crítica",
    issueErrorCritical: (rate) => `${rate}% de los requests están fallando. Esto indica un problema grave que necesita atención inmediata.`,
    issueErrorCriticalAction: "Diagnosticar con IA ahora",
    issueErrorHighTitle: "Tasa de error elevada",
    issueErrorHigh: (rate) => `${rate}% de errores. Puede indicar configuración incorrecta de campos o timeout en BAPIs.`,
    issueErrorHighAction: "Verificar mapeo de campos",
    issueErrorMediumTitle: "Tasa de error por encima de lo normal",
    issueErrorMedium: (rate) => `${rate}% de errores. Se recomienda investigar antes de que escale.`,
    issueErrorMediumAction: "Monitorear en las próximas horas",
    issueLatencyHighTitle: "Latencia muy alta",
    issueLatencyHigh: (ms) => `${ms}ms de latencia media. Lo normal es por debajo de 300ms. Puede haber un cuello de botella en la red o en el servidor SAP.`,
    issueLatencyHighAction: "Verificar conexión RFC y red",
    issueLatencyMediumTitle: "Latencia elevada",
    issueLatencyMedium: (ms) => `${ms}ms. Por encima de lo ideal (300ms). Puede impactar el rendimiento de integraciones síncronas.`,
    issueLatencyMediumAction: "Optimizar queries o aumentar timeout",
    issueUptimeHighTitle: "Uptime por debajo del SLA",
    issueUptimeHigh: (pct) => `${pct}% de disponibilidad. La meta mínima es 95%. Verifica la estabilidad del servidor.`,
    issueUptimeHighAction: "Revisar infraestructura",
    issueUptimeMediumTitle: "El uptime necesita mejorar",
    issueUptimeMedium: (pct) => `${pct}% de disponibilidad. Está cerca del límite aceptable (95%).`,
    issueUptimeMediumAction: "Seguir la tendencia",
    noIntegrations: "Ninguna integración encontrada.",
    resolve: "Resolver",
    resolved: "Resuelto",
    noAlerts: "Ninguna alerta para este cliente.",
    newDiagnostic: "Nuevo Diagnóstico",
    noDiagnostics: "Ningún diagnóstico realizado.",
    modalTitle: "Agente on-premise",
    modalIntroAfterName: (type) => ` (${type}) es monitoreada por un agente que corre en la red del cliente y habla con SAP localmente — solo tráfico de salida (HTTPS), sin abrir puerto.`,
    modalStep1Label: "1. Token de esta integración",
    modalGeneratingToken: "Generando token...",
    modalTokenWarn: "⚠️ Mostrado una sola vez. Cópialo ahora — no se guarda en texto plano.",
    modalTokenError: "No se pudo generar el token.",
    modalStep2Label: "2. Ejecuta el agente en el servidor del cliente",
    copy: "copiar",
    copied: "✓ copiado",
    modalRfcNoteBefore: "Para una conexión RFC real, cambia ",
    modalRfcNoteMiddle: " por ",
    modalRfcNoteAfter: " e informa host/sysnr/client/usuario (requiere el SAP NW RFC SDK en la imagen). Detalles en el README del agente.",
  },
};
