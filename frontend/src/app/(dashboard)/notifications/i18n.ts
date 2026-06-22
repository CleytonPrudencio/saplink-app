import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  emailType: string;
  title: string;
  subtitle: string;
  loading: string;
  adminRestricted: string;
  channelsHeading: string;
  channelMeta: (level: number, minSeverity: string) => string;
  test: string;
  remove: string;
  noChannels: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  webhookPlaceholder: string;
  sevMedium: string;
  sevHigh: string;
  sevCritical: string;
  level1: string;
  level2: string;
  addChannel: string;
  escalateBefore: string;
  minLabel: string;
  save: string;
  createChannelError: string;
  testSent: string;
  testFailed: string;
  removeConfirm: string;
  escalationSaved: string;
  ticketHeading: string;
  ticketSubtitle: string;
  configured: string;
  openMedium: string;
  openHigh: string;
  openCritical: string;
  ticketBaseUrlPlaceholder: string;
  jiraUserPlaceholder: string;
  serviceNowUserPlaceholder: string;
  keepTokenPlaceholder: string;
  tokenPlaceholder: string;
  projectKeyPlaceholder: string;
  active: string;
  testing: string;
  createTestTicket: string;
  saveError: string;
  configSaved: string;
  testTicketCreated: (key: string) => string;
  ticketFailed: string;
}> = {
  pt: {
    emailType: "E-mail",
    title: "Alertas, on-call & tickets",
    subtitle: "Para onde os alertas vão, quando escalam e como viram chamado.",
    loading: "Carregando...",
    adminRestricted: "Acesso restrito ao administrador.",
    channelsHeading: "Canais de notificação",
    channelMeta: (level, minSeverity) => `· nível ${level} · ≥ ${minSeverity}`,
    test: "Testar",
    remove: "Remover",
    noChannels: "Nenhum canal ainda.",
    namePlaceholder: "Nome (ex.: #plantão-sap)",
    emailPlaceholder: "email@empresa.com",
    webhookPlaceholder: "https://hooks.slack.com/...",
    sevMedium: "Severidade ≥ Média",
    sevHigh: "Severidade ≥ Alta",
    sevCritical: "Só Crítica",
    level1: "Nível 1 (imediato)",
    level2: "Nível 2 (escalonamento)",
    addChannel: "Adicionar canal",
    escalateBefore: "Escalar para o nível 2 após",
    minLabel: "min",
    save: "Salvar",
    createChannelError: "Erro ao criar canal.",
    testSent: "Teste enviado com sucesso.",
    testFailed: "Falha no envio (verifique a URL/destino).",
    removeConfirm: "Remover este canal?",
    escalationSaved: "Tempo de escalonamento salvo.",
    ticketHeading: "Ticket sync (Jira / ServiceNow)",
    ticketSubtitle: "Alertas viram chamado automaticamente e fecham ao resolver.",
    configured: "Configurado.",
    openMedium: "Abrir p/ ≥ Média",
    openHigh: "Abrir p/ ≥ Alta",
    openCritical: "Abrir só Crítica",
    ticketBaseUrlPlaceholder: "https://empresa.atlassian.net",
    jiraUserPlaceholder: "email do Jira",
    serviceNowUserPlaceholder: "usuário ServiceNow",
    keepTokenPlaceholder: "•••• (manter atual)",
    tokenPlaceholder: "API token / senha",
    projectKeyPlaceholder: "Project key (ex.: SAP)",
    active: "Ativo",
    testing: "Testando...",
    createTestTicket: "Criar chamado de teste",
    saveError: "Erro ao salvar.",
    configSaved: "Configuração salva.",
    testTicketCreated: (key) => `Chamado de teste criado: ${key}`,
    ticketFailed: "Falha ao criar chamado.",
  },
  en: {
    emailType: "Email",
    title: "Alerts, on-call & tickets",
    subtitle: "Where alerts go, when they escalate and how they turn into tickets.",
    loading: "Loading...",
    adminRestricted: "Restricted to administrators.",
    channelsHeading: "Notification channels",
    channelMeta: (level, minSeverity) => `· level ${level} · ≥ ${minSeverity}`,
    test: "Test",
    remove: "Remove",
    noChannels: "No channels yet.",
    namePlaceholder: "Name (e.g.: #sap-oncall)",
    emailPlaceholder: "email@company.com",
    webhookPlaceholder: "https://hooks.slack.com/...",
    sevMedium: "Severity ≥ Medium",
    sevHigh: "Severity ≥ High",
    sevCritical: "Critical only",
    level1: "Level 1 (immediate)",
    level2: "Level 2 (escalation)",
    addChannel: "Add channel",
    escalateBefore: "Escalate to level 2 after",
    minLabel: "min",
    save: "Save",
    createChannelError: "Failed to create channel.",
    testSent: "Test sent successfully.",
    testFailed: "Send failed (check the URL/target).",
    removeConfirm: "Remove this channel?",
    escalationSaved: "Escalation time saved.",
    ticketHeading: "Ticket sync (Jira / ServiceNow)",
    ticketSubtitle: "Alerts automatically become tickets and close when resolved.",
    configured: "Configured.",
    openMedium: "Open for ≥ Medium",
    openHigh: "Open for ≥ High",
    openCritical: "Open Critical only",
    ticketBaseUrlPlaceholder: "https://company.atlassian.net",
    jiraUserPlaceholder: "Jira email",
    serviceNowUserPlaceholder: "ServiceNow user",
    keepTokenPlaceholder: "•••• (keep current)",
    tokenPlaceholder: "API token / password",
    projectKeyPlaceholder: "Project key (e.g.: SAP)",
    active: "Active",
    testing: "Testing...",
    createTestTicket: "Create test ticket",
    saveError: "Failed to save.",
    configSaved: "Configuration saved.",
    testTicketCreated: (key) => `Test ticket created: ${key}`,
    ticketFailed: "Failed to create ticket.",
  },
  es: {
    emailType: "Correo",
    title: "Alertas, on-call y tickets",
    subtitle: "A dónde van las alertas, cuándo escalan y cómo se convierten en ticket.",
    loading: "Cargando...",
    adminRestricted: "Acceso restringido al administrador.",
    channelsHeading: "Canales de notificación",
    channelMeta: (level, minSeverity) => `· nivel ${level} · ≥ ${minSeverity}`,
    test: "Probar",
    remove: "Eliminar",
    noChannels: "Aún no hay canales.",
    namePlaceholder: "Nombre (ej.: #guardia-sap)",
    emailPlaceholder: "correo@empresa.com",
    webhookPlaceholder: "https://hooks.slack.com/...",
    sevMedium: "Severidad ≥ Media",
    sevHigh: "Severidad ≥ Alta",
    sevCritical: "Solo Crítica",
    level1: "Nivel 1 (inmediato)",
    level2: "Nivel 2 (escalamiento)",
    addChannel: "Agregar canal",
    escalateBefore: "Escalar al nivel 2 después de",
    minLabel: "min",
    save: "Guardar",
    createChannelError: "Error al crear el canal.",
    testSent: "Prueba enviada con éxito.",
    testFailed: "Falló el envío (verifica la URL/destino).",
    removeConfirm: "¿Eliminar este canal?",
    escalationSaved: "Tiempo de escalamiento guardado.",
    ticketHeading: "Ticket sync (Jira / ServiceNow)",
    ticketSubtitle: "Las alertas se convierten en ticket automáticamente y se cierran al resolver.",
    configured: "Configurado.",
    openMedium: "Abrir p/ ≥ Media",
    openHigh: "Abrir p/ ≥ Alta",
    openCritical: "Abrir solo Crítica",
    ticketBaseUrlPlaceholder: "https://empresa.atlassian.net",
    jiraUserPlaceholder: "correo de Jira",
    serviceNowUserPlaceholder: "usuario ServiceNow",
    keepTokenPlaceholder: "•••• (mantener actual)",
    tokenPlaceholder: "API token / contraseña",
    projectKeyPlaceholder: "Project key (ej.: SAP)",
    active: "Activo",
    testing: "Probando...",
    createTestTicket: "Crear ticket de prueba",
    saveError: "Error al guardar.",
    configSaved: "Configuración guardada.",
    testTicketCreated: (key) => `Ticket de prueba creado: ${key}`,
    ticketFailed: "Error al crear el ticket.",
  },
};
