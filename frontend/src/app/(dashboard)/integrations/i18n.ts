import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  // estados
  loading: string;
  loadError: string;
  // header
  title: string;
  subtitle: string;
  syncAll: string;
  syncingAll: string;
  syncAllTooltip: string;
  newIntegration: string;
  explainLabel: string;
  // stats
  statTotal: string;
  statActive: string;
  statError: string;
  statOffline: string;
  // filtros
  searchPlaceholder: string;
  allClients: string;
  allTypes: string;
  allStatuses: string;
  statusActive: string;
  statusError: string;
  statusOffline: string;
  statusPending: string;
  allEnvironments: string;
  clear: string;
  showing: (filtered: number, total: number) => string;
  // status badges
  badgeActive: string;
  badgeError: string;
  badgePending: string;
  badgeOffline: string;
  // card actions
  sync: string;
  syncTooltip: string;
  edit: string;
  test: string;
  testing: string;
  delete: string;
  environmentTooltip: string;
  // toasts/alerts
  syncOk: string;
  syncFail: string;
  syncError: string;
  syncedCount: (n: number) => string;
  syncAllError: string;
  updated: string;
  saveError: string;
  confirmDelete: string;
  deleteError: string;
  // test result
  connectionOk: string;
  connectionError: string;
  // expanded details
  detailType: string;
  detailClient: string;
  detailAlerts: string;
  detailUpdated: string;
  metricLatency: string;
  latencyExcellent: string;
  latencyNormal: string;
  latencyHigh: string;
  metricErrorRate: string;
  errorRateHealthy: string;
  errorRateAcceptable: string;
  errorRateCritical: string;
  metricUptime: string;
  uptimeExcellent: string;
  uptimeWithinSla: string;
  uptimeBelowSla: string;
  detailDescription: string;
  connectionConfig: string;
  noConfig: string;
  diagnoseAi: string;
  viewClient: string;
  // empty states
  noMatch: string;
  clearFilters: string;
  noneRegistered: string;
  createFirst: string;
  // modal de edição
  editTitle: string;
  fieldName: string;
  fieldDescription: string;
  editConnectionConfig: string;
  keepBlankSuffix: string;
  keepCurrentPlaceholder: string;
  noConfigShort: string;
  cancel: string;
  save: string;
}> = {
  pt: {
    loading: "Carregando...",
    loadError: "Erro ao carregar integracoes.",
    title: "Integracoes",
    subtitle: "Gerencie todas as integracoes SAP dos seus clientes",
    syncAll: "↻ Sincronizar tudo",
    syncingAll: "Sincronizando...",
    syncAllTooltip: "Coleta dados reais das integrações OData/REST",
    newIntegration: "+ Nova Integracao",
    explainLabel: "Integrações",
    statTotal: "Total",
    statActive: "Ativas",
    statError: "Com Erro",
    statOffline: "Offline",
    searchPlaceholder: "Buscar por nome ou cliente...",
    allClients: "Todos os clientes",
    allTypes: "Todos os tipos",
    allStatuses: "Todos os status",
    statusActive: "Ativas",
    statusError: "Com erro",
    statusOffline: "Offline",
    statusPending: "Pendentes",
    allEnvironments: "Todos os ambientes",
    clear: "Limpar",
    showing: (filtered, total) => `Mostrando ${filtered} de ${total} integrações`,
    badgeActive: "Ativa",
    badgeError: "Erro",
    badgePending: "Pendente",
    badgeOffline: "Offline",
    sync: "Sincronizar",
    syncTooltip: "Coleta dados reais (OData/REST)",
    edit: "Editar",
    test: "Testar",
    testing: "Testando...",
    delete: "Excluir",
    environmentTooltip: "Ambiente",
    syncOk: "Sincronizado: integração no ar.",
    syncFail: "Sincronizado: integração com falha/offline.",
    syncError: "Não foi possível sincronizar.",
    syncedCount: (n) => `Sincronizadas ${n} integração(ões) reais.`,
    syncAllError: "Falha ao sincronizar.",
    updated: "Integração atualizada.",
    saveError: "Falha ao salvar.",
    confirmDelete: "Tem certeza que deseja excluir esta integracao?",
    deleteError: "Erro ao excluir integracao.",
    connectionOk: "Conexao OK",
    connectionError: "Erro na conexao",
    detailType: "Tipo",
    detailClient: "Cliente",
    detailAlerts: "Alertas",
    detailUpdated: "Atualizado",
    metricLatency: "Latência",
    latencyExcellent: "✅ Excelente",
    latencyNormal: "⚡ Normal",
    latencyHigh: "⚠️ Elevada",
    metricErrorRate: "Taxa de Erro",
    errorRateHealthy: "✅ Saudável",
    errorRateAcceptable: "⚡ Aceitável",
    errorRateCritical: "🔴 Crítico",
    metricUptime: "Uptime",
    uptimeExcellent: "✅ Excelente",
    uptimeWithinSla: "⚡ Dentro do SLA",
    uptimeBelowSla: "⚠️ Abaixo do SLA",
    detailDescription: "Descrição",
    connectionConfig: "Configuração de Conexão",
    noConfig: "⚠️ Esta integração não possui configuração de conexão. Foi criada como simulação.",
    diagnoseAi: "🤖 Diagnosticar com IA",
    viewClient: "👁️ Ver cliente",
    noMatch: "Nenhuma integração corresponde aos filtros.",
    clearFilters: "Limpar filtros",
    noneRegistered: "Nenhuma integracao cadastrada.",
    createFirst: "+ Criar primeira integracao",
    editTitle: "Editar integração",
    fieldName: "Nome",
    fieldDescription: "Descrição",
    editConnectionConfig: "Configuração de conexão",
    keepBlankSuffix: " (deixe em branco p/ manter)",
    keepCurrentPlaceholder: "•••••• (mantém o atual)",
    noConfigShort: "Sem configuração.",
    cancel: "Cancelar",
    save: "Salvar",
  },
  en: {
    loading: "Loading...",
    loadError: "Failed to load integrations.",
    title: "Integrations",
    subtitle: "Manage all SAP integrations for your clients",
    syncAll: "↻ Sync all",
    syncingAll: "Syncing...",
    syncAllTooltip: "Collects real data from OData/REST integrations",
    newIntegration: "+ New Integration",
    explainLabel: "Integrations",
    statTotal: "Total",
    statActive: "Active",
    statError: "With Errors",
    statOffline: "Offline",
    searchPlaceholder: "Search by name or client...",
    allClients: "All clients",
    allTypes: "All types",
    allStatuses: "All statuses",
    statusActive: "Active",
    statusError: "With errors",
    statusOffline: "Offline",
    statusPending: "Pending",
    allEnvironments: "All environments",
    clear: "Clear",
    showing: (filtered, total) => `Showing ${filtered} of ${total} integrations`,
    badgeActive: "Active",
    badgeError: "Error",
    badgePending: "Pending",
    badgeOffline: "Offline",
    sync: "Sync",
    syncTooltip: "Collects real data (OData/REST)",
    edit: "Edit",
    test: "Test",
    testing: "Testing...",
    delete: "Delete",
    environmentTooltip: "Environment",
    syncOk: "Synced: integration is up.",
    syncFail: "Synced: integration failed/offline.",
    syncError: "Could not sync.",
    syncedCount: (n) => `Synced ${n} real integration(s).`,
    syncAllError: "Sync failed.",
    updated: "Integration updated.",
    saveError: "Failed to save.",
    confirmDelete: "Are you sure you want to delete this integration?",
    deleteError: "Failed to delete integration.",
    connectionOk: "Connection OK",
    connectionError: "Connection error",
    detailType: "Type",
    detailClient: "Client",
    detailAlerts: "Alerts",
    detailUpdated: "Updated",
    metricLatency: "Latency",
    latencyExcellent: "✅ Excellent",
    latencyNormal: "⚡ Normal",
    latencyHigh: "⚠️ High",
    metricErrorRate: "Error Rate",
    errorRateHealthy: "✅ Healthy",
    errorRateAcceptable: "⚡ Acceptable",
    errorRateCritical: "🔴 Critical",
    metricUptime: "Uptime",
    uptimeExcellent: "✅ Excellent",
    uptimeWithinSla: "⚡ Within SLA",
    uptimeBelowSla: "⚠️ Below SLA",
    detailDescription: "Description",
    connectionConfig: "Connection Configuration",
    noConfig: "⚠️ This integration has no connection configuration. It was created as a simulation.",
    diagnoseAi: "🤖 Diagnose with AI",
    viewClient: "👁️ View client",
    noMatch: "No integration matches the filters.",
    clearFilters: "Clear filters",
    noneRegistered: "No integrations registered.",
    createFirst: "+ Create first integration",
    editTitle: "Edit integration",
    fieldName: "Name",
    fieldDescription: "Description",
    editConnectionConfig: "Connection configuration",
    keepBlankSuffix: " (leave blank to keep)",
    keepCurrentPlaceholder: "•••••• (keeps current)",
    noConfigShort: "No configuration.",
    cancel: "Cancel",
    save: "Save",
  },
  es: {
    loading: "Cargando...",
    loadError: "Error al cargar las integraciones.",
    title: "Integraciones",
    subtitle: "Gestione todas las integraciones SAP de sus clientes",
    syncAll: "↻ Sincronizar todo",
    syncingAll: "Sincronizando...",
    syncAllTooltip: "Recopila datos reales de las integraciones OData/REST",
    newIntegration: "+ Nueva Integración",
    explainLabel: "Integraciones",
    statTotal: "Total",
    statActive: "Activas",
    statError: "Con Errores",
    statOffline: "Offline",
    searchPlaceholder: "Buscar por nombre o cliente...",
    allClients: "Todos los clientes",
    allTypes: "Todos los tipos",
    allStatuses: "Todos los estados",
    statusActive: "Activas",
    statusError: "Con errores",
    statusOffline: "Offline",
    statusPending: "Pendientes",
    allEnvironments: "Todos los ambientes",
    clear: "Limpiar",
    showing: (filtered, total) => `Mostrando ${filtered} de ${total} integraciones`,
    badgeActive: "Activa",
    badgeError: "Error",
    badgePending: "Pendiente",
    badgeOffline: "Offline",
    sync: "Sincronizar",
    syncTooltip: "Recopila datos reales (OData/REST)",
    edit: "Editar",
    test: "Probar",
    testing: "Probando...",
    delete: "Eliminar",
    environmentTooltip: "Ambiente",
    syncOk: "Sincronizado: integración en línea.",
    syncFail: "Sincronizado: integración con falla/offline.",
    syncError: "No se pudo sincronizar.",
    syncedCount: (n) => `Sincronizadas ${n} integración(es) reales.`,
    syncAllError: "Error al sincronizar.",
    updated: "Integración actualizada.",
    saveError: "Error al guardar.",
    confirmDelete: "¿Está seguro de que desea eliminar esta integración?",
    deleteError: "Error al eliminar la integración.",
    connectionOk: "Conexión OK",
    connectionError: "Error de conexión",
    detailType: "Tipo",
    detailClient: "Cliente",
    detailAlerts: "Alertas",
    detailUpdated: "Actualizado",
    metricLatency: "Latencia",
    latencyExcellent: "✅ Excelente",
    latencyNormal: "⚡ Normal",
    latencyHigh: "⚠️ Elevada",
    metricErrorRate: "Tasa de Error",
    errorRateHealthy: "✅ Saludable",
    errorRateAcceptable: "⚡ Aceptable",
    errorRateCritical: "🔴 Crítico",
    metricUptime: "Uptime",
    uptimeExcellent: "✅ Excelente",
    uptimeWithinSla: "⚡ Dentro del SLA",
    uptimeBelowSla: "⚠️ Por debajo del SLA",
    detailDescription: "Descripción",
    connectionConfig: "Configuración de Conexión",
    noConfig: "⚠️ Esta integración no tiene configuración de conexión. Fue creada como simulación.",
    diagnoseAi: "🤖 Diagnosticar con IA",
    viewClient: "👁️ Ver cliente",
    noMatch: "Ninguna integración coincide con los filtros.",
    clearFilters: "Limpiar filtros",
    noneRegistered: "Ninguna integración registrada.",
    createFirst: "+ Crear primera integración",
    editTitle: "Editar integración",
    fieldName: "Nombre",
    fieldDescription: "Descripción",
    editConnectionConfig: "Configuración de conexión",
    keepBlankSuffix: " (deje en blanco para mantener)",
    keepCurrentPlaceholder: "•••••• (mantiene el actual)",
    noConfigShort: "Sin configuración.",
    cancel: "Cancelar",
    save: "Guardar",
  },
};
