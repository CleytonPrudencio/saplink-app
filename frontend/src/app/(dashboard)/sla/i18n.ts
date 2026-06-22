import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  loading: string;
  slaSection: string;
  overallCompliance: (pct: number) => string;
  reportTitle: (client: string) => string;
  reportSubtitle: string;
  reportClientLabel: string;
  reportGeneratedLabel: string;
  reportUnavailable: string;
  impactSection: string;
  statRiskPerHour: string;
  statAccumulated: string;
  statDown: string;
  statMonitoredWithCost: string;
  colIntegration: string;
  colProcess: string;
  colStatus: string;
  colPerHour: string;
  colHours: string;
  colAccumulated: string;
  setCostSummary: string;
  cardSlaSummary: (meeting: number, total: number, uptime: number, latency: number) => string;
  uptimeTargetLabel: string;
  maxLatencyLabel: string;
  save: string;
  aiReport: string;
  generating: string;
  businessProcessPlaceholder: string;
  perHour: string;
}> = {
  pt: {
    title: "SLA & Impacto financeiro",
    subtitle: "Cumprimento de SLA por cliente e exposição em R$ — para apresentar ao C-level.",
    loading: "Carregando...",
    slaSection: "SLA por cliente",
    overallCompliance: (pct) => `Compliance geral: ${pct}%`,
    reportTitle: (client) => `Relatório de SLA — ${client}`,
    reportSubtitle: "Análise mensal de níveis de serviço",
    reportClientLabel: "Cliente",
    reportGeneratedLabel: "Gerado em",
    reportUnavailable: "(IA indisponível.)",
    impactSection: "Impacto financeiro",
    statRiskPerHour: "R$/hora em risco",
    statAccumulated: "Exposição acumulada",
    statDown: "Fora do ar",
    statMonitoredWithCost: "Monitoradas c/ custo",
    colIntegration: "Integração",
    colProcess: "Processo",
    colStatus: "Status",
    colPerHour: "R$/h",
    colHours: "Horas",
    colAccumulated: "Acumulado",
    setCostSummary: "Definir custo de parada por integração",
    cardSlaSummary: (meeting, total, uptime, latency) => `${meeting}/${total} integrações no SLA · uptime médio ${uptime}% · ${latency}ms`,
    uptimeTargetLabel: "Meta uptime",
    maxLatencyLabel: "Lat máx",
    save: "Salvar",
    aiReport: "Relatório IA",
    generating: "Gerando...",
    businessProcessPlaceholder: "Processo de negócio",
    perHour: "R$/h",
  },
  en: {
    title: "SLA & Financial Impact",
    subtitle: "SLA compliance per client and exposure in R$ — ready to present to the C-level.",
    loading: "Loading...",
    slaSection: "SLA per client",
    overallCompliance: (pct) => `Overall compliance: ${pct}%`,
    reportTitle: (client) => `SLA Report — ${client}`,
    reportSubtitle: "Monthly service-level analysis",
    reportClientLabel: "Client",
    reportGeneratedLabel: "Generated on",
    reportUnavailable: "(AI unavailable.)",
    impactSection: "Financial impact",
    statRiskPerHour: "R$/hour at risk",
    statAccumulated: "Accumulated exposure",
    statDown: "Down",
    statMonitoredWithCost: "Monitored w/ cost",
    colIntegration: "Integration",
    colProcess: "Process",
    colStatus: "Status",
    colPerHour: "R$/h",
    colHours: "Hours",
    colAccumulated: "Accumulated",
    setCostSummary: "Set downtime cost per integration",
    cardSlaSummary: (meeting, total, uptime, latency) => `${meeting}/${total} integrations within SLA · avg uptime ${uptime}% · ${latency}ms`,
    uptimeTargetLabel: "Uptime target",
    maxLatencyLabel: "Max latency",
    save: "Save",
    aiReport: "AI Report",
    generating: "Generating...",
    businessProcessPlaceholder: "Business process",
    perHour: "R$/h",
  },
  es: {
    title: "SLA & Impacto financiero",
    subtitle: "Cumplimiento de SLA por cliente y exposición en R$ — para presentar al C-level.",
    loading: "Cargando...",
    slaSection: "SLA por cliente",
    overallCompliance: (pct) => `Compliance general: ${pct}%`,
    reportTitle: (client) => `Informe de SLA — ${client}`,
    reportSubtitle: "Análisis mensual de niveles de servicio",
    reportClientLabel: "Cliente",
    reportGeneratedLabel: "Generado el",
    reportUnavailable: "(IA no disponible.)",
    impactSection: "Impacto financiero",
    statRiskPerHour: "R$/hora en riesgo",
    statAccumulated: "Exposición acumulada",
    statDown: "Fuera de servicio",
    statMonitoredWithCost: "Monitoreadas c/ costo",
    colIntegration: "Integración",
    colProcess: "Proceso",
    colStatus: "Status",
    colPerHour: "R$/h",
    colHours: "Horas",
    colAccumulated: "Acumulado",
    setCostSummary: "Definir costo de parada por integración",
    cardSlaSummary: (meeting, total, uptime, latency) => `${meeting}/${total} integraciones en SLA · uptime promedio ${uptime}% · ${latency}ms`,
    uptimeTargetLabel: "Meta uptime",
    maxLatencyLabel: "Lat máx",
    save: "Guardar",
    aiReport: "Informe IA",
    generating: "Generando...",
    businessProcessPlaceholder: "Proceso de negocio",
    perHour: "R$/h",
  },
};
