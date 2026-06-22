import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  explainScreen: string;
  loading: string;
  totalAtRiskNow: string;
  downtime: string;
  fiscalBlocked: string;
  integrationsDown: string;
  byBusinessProcess: string;
  integrationsShort: string;
  thIntegration: string;
  thClient: string;
  thProcess: string;
  thDowntime: string;
  thPerHour: string;
  thAtRisk: string;
  hoursUnit: (h: number | string) => string;
  emptyBefore: string;
  emptyBold1: string;
  emptyMid: string;
  emptyBold2: string;
  emptyAfter: string;
}> = {
  pt: {
    title: "Dinheiro em risco (ao vivo)",
    subtitle: "Traduz cada falha técnica em R$ parados agora — custo de parada por hora das integrações + documentos fiscais bloqueados. O dashboard que o diretor entende.",
    explainScreen: "Dinheiro em risco",
    loading: "Carregando...",
    totalAtRiskNow: "Total em risco neste momento",
    downtime: "Parada",
    fiscalBlocked: "Fiscal bloqueado",
    integrationsDown: "Integrações fora",
    byBusinessProcess: "Por processo de negócio",
    integrationsShort: "integr.",
    thIntegration: "Integração",
    thClient: "Cliente",
    thProcess: "Processo",
    thDowntime: "Parada",
    thPerHour: "R$/h",
    thAtRisk: "Em risco",
    hoursUnit: (h) => `${h}h`,
    emptyBefore: "Nenhuma integração parada com custo configurado. Defina o",
    emptyBold1: "custo de parada por hora",
    emptyMid: "e o",
    emptyBold2: "processo de negócio",
    emptyAfter: "nas integrações para o cálculo ao vivo.",
  },
  en: {
    title: "Money at risk (live)",
    subtitle: "Translates every technical failure into money stuck right now — downtime cost per hour of integrations + blocked fiscal documents. The dashboard your director understands.",
    explainScreen: "Money at risk",
    loading: "Loading...",
    totalAtRiskNow: "Total at risk right now",
    downtime: "Downtime",
    fiscalBlocked: "Fiscal blocked",
    integrationsDown: "Integrations down",
    byBusinessProcess: "By business process",
    integrationsShort: "integr.",
    thIntegration: "Integration",
    thClient: "Client",
    thProcess: "Process",
    thDowntime: "Downtime",
    thPerHour: "R$/h",
    thAtRisk: "At risk",
    hoursUnit: (h) => `${h}h`,
    emptyBefore: "No down integration has a configured cost. Set the",
    emptyBold1: "downtime cost per hour",
    emptyMid: "and the",
    emptyBold2: "business process",
    emptyAfter: "on the integrations for the live calculation.",
  },
  es: {
    title: "Dinero en riesgo (en vivo)",
    subtitle: "Traduce cada falla técnica en dinero detenido ahora — costo de parada por hora de las integraciones + documentos fiscales bloqueados. El panel que el director entiende.",
    explainScreen: "Dinero en riesgo",
    loading: "Cargando...",
    totalAtRiskNow: "Total en riesgo en este momento",
    downtime: "Parada",
    fiscalBlocked: "Fiscal bloqueado",
    integrationsDown: "Integraciones caídas",
    byBusinessProcess: "Por proceso de negocio",
    integrationsShort: "integr.",
    thIntegration: "Integración",
    thClient: "Cliente",
    thProcess: "Proceso",
    thDowntime: "Parada",
    thPerHour: "R$/h",
    thAtRisk: "En riesgo",
    hoursUnit: (h) => `${h}h`,
    emptyBefore: "Ninguna integración caída con costo configurado. Defina el",
    emptyBold1: "costo de parada por hora",
    emptyMid: "y el",
    emptyBold2: "proceso de negocio",
    emptyAfter: "en las integraciones para el cálculo en vivo.",
  },
};
