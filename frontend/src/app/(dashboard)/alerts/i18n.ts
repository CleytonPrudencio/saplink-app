import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  loading: string;
  loadError: string;
  title: string;
  explainLabel: string;
  allSeverities: string;
  statusActive: string;
  statusResolved: string;
  statusAll: string;
  groupsCount: (groups: number, alerts: number) => string;
  diagnoseFallback: string;
  resolvedCount: (n: number) => string;
  resolvedOne: string;
  resolveError: string;
  hide: string;
  diagnose: string;
  resolve: string;
  firstLast: (first: string, last: string) => string;
  analyzing: string;
  diagReportTitle: string;
  noAlerts: (active: boolean) => string;
  confirmTitle: (n: number) => string;
  confirmHint: string;
  cancel: string;
  confirm: string;
}> = {
  pt: {
    loading: "Carregando...",
    loadError: "Erro ao carregar alertas.",
    title: "Alertas",
    explainLabel: "Explique e priorize (IA)",
    allSeverities: "Todas severidades",
    statusActive: "Ativos",
    statusResolved: "Resolvidos",
    statusAll: "Todos",
    groupsCount: (groups, alerts) => `${groups} grupo(s) · ${alerts} alerta(s)`,
    diagnoseFallback: "Não foi possível diagnosticar agora.",
    resolvedCount: (n) => `${n} alerta(s) resolvido(s).`,
    resolvedOne: "Alerta resolvido.",
    resolveError: "Não foi possível resolver. Tente novamente.",
    hide: "Ocultar",
    diagnose: "🤖 Diagnosticar",
    resolve: "Resolver",
    firstLast: (first, last) => `primeiro ${first} · último ${last}`,
    analyzing: "A IA está analisando o alerta…",
    diagReportTitle: "Diagnóstico do alerta",
    noAlerts: (active) => `Nenhum alerta ${active ? "ativo" : ""} no momento. 🎉`,
    confirmTitle: (n) => `Resolver ${n > 1 ? `${n} alertas` : "alerta"}?`,
    confirmHint: "Marcar como resolvido só fecha o alerta no SAPLINK — confirme que a causa foi tratada. Se a falha persistir no SAP, um novo alerta será criado no próximo ciclo.",
    cancel: "Cancelar",
    confirm: "Confirmar",
  },
  en: {
    loading: "Loading...",
    loadError: "Failed to load alerts.",
    title: "Alerts",
    explainLabel: "Explain and prioritize (AI)",
    allSeverities: "All severities",
    statusActive: "Active",
    statusResolved: "Resolved",
    statusAll: "All",
    groupsCount: (groups, alerts) => `${groups} group(s) · ${alerts} alert(s)`,
    diagnoseFallback: "Could not run a diagnosis right now.",
    resolvedCount: (n) => `${n} alert(s) resolved.`,
    resolvedOne: "Alert resolved.",
    resolveError: "Could not resolve. Please try again.",
    hide: "Hide",
    diagnose: "🤖 Diagnose",
    resolve: "Resolve",
    firstLast: (first, last) => `first ${first} · last ${last}`,
    analyzing: "AI is analyzing the alert…",
    diagReportTitle: "Alert diagnosis",
    noAlerts: (active) => `No ${active ? "active " : ""}alerts at the moment. 🎉`,
    confirmTitle: (n) => `Resolve ${n > 1 ? `${n} alerts` : "alert"}?`,
    confirmHint: "Marking as resolved only closes the alert in SAPLINK — confirm the root cause has been handled. If the failure persists in SAP, a new alert will be created on the next cycle.",
    cancel: "Cancel",
    confirm: "Confirm",
  },
  es: {
    loading: "Cargando...",
    loadError: "Error al cargar las alertas.",
    title: "Alertas",
    explainLabel: "Explicar y priorizar (IA)",
    allSeverities: "Todas las severidades",
    statusActive: "Activas",
    statusResolved: "Resueltas",
    statusAll: "Todas",
    groupsCount: (groups, alerts) => `${groups} grupo(s) · ${alerts} alerta(s)`,
    diagnoseFallback: "No se pudo diagnosticar en este momento.",
    resolvedCount: (n) => `${n} alerta(s) resuelta(s).`,
    resolvedOne: "Alerta resuelta.",
    resolveError: "No se pudo resolver. Inténtalo de nuevo.",
    hide: "Ocultar",
    diagnose: "🤖 Diagnosticar",
    resolve: "Resolver",
    firstLast: (first, last) => `primera ${first} · última ${last}`,
    analyzing: "La IA está analizando la alerta…",
    diagReportTitle: "Diagnóstico de la alerta",
    noAlerts: (active) => `Ninguna alerta ${active ? "activa" : ""} por el momento. 🎉`,
    confirmTitle: (n) => `¿Resolver ${n > 1 ? `${n} alertas` : "alerta"}?`,
    confirmHint: "Marcar como resuelta solo cierra la alerta en SAPLINK — confirma que la causa fue tratada. Si la falla persiste en SAP, se creará una nueva alerta en el próximo ciclo.",
    cancel: "Cancelar",
    confirm: "Confirmar",
  },
};
