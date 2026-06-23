import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  total: string;
  atRisk: string;
  warn: string;
  exposure: string;
  allClients: string;
  loading: string;
  metrics: string;
  empty: string;
  colMetric: string;
  colUsage: string;
  colRisk: string;
  colExposure: string;
  colClient: string;
  riskOk: string;
  riskWarn: string;
  riskRisk: string;
  sheetTitle: string;
  fMetric: string;
  fUsage: string;
  fPct: string;
  fRisk: string;
  fExposure: string;
  fClient: string;
  fEnvironment: string;
  guideTitle: string;
  steps: string[];
}> = {
  pt: {
    title: "Licenciamento & Acesso Indireto",
    subtitle: "Monitora uso x direito de licença e a exposição de acesso indireto (Digital Access) antes de uma auditoria SAP.",
    total: "Métricas",
    atRisk: "Em risco",
    warn: "Alerta",
    exposure: "Exposição estimada",
    allClients: "Todos os clientes",
    loading: "Carregando...",
    metrics: "Métricas de licenciamento",
    empty: "Nenhuma métrica de licença registrada. Os dados vêm da medição de uso e acesso indireto do Agente on-premise.",
    colMetric: "Métrica",
    colUsage: "Uso",
    colRisk: "Risco",
    colExposure: "Exposição",
    colClient: "Cliente",
    riskOk: "OK",
    riskWarn: "Alerta",
    riskRisk: "Risco",
    sheetTitle: "Detalhes da métrica",
    fMetric: "Métrica",
    fUsage: "Uso / Direito",
    fPct: "% de uso",
    fRisk: "Risco",
    fExposure: "Exposição estimada",
    fClient: "Cliente",
    fEnvironment: "Ambiente",
    guideTitle: "O que fazer",
    steps: [
      "Revisar contratos e medição de Digital Access/uso indireto.",
      "Identificar sistemas externos que geram documentos no SAP.",
      "Renegociar pacote ou conter origem antes de auditoria SAP.",
    ],
  },
  en: {
    title: "Licensing & Indirect Access",
    subtitle: "Monitors usage vs. license entitlement and indirect access (Digital Access) exposure ahead of a SAP audit.",
    total: "Metrics",
    atRisk: "At risk",
    warn: "Warning",
    exposure: "Estimated exposure",
    allClients: "All clients",
    loading: "Loading...",
    metrics: "Licensing metrics",
    empty: "No license metric recorded. Data comes from the on-premise Agent's usage and indirect access metering.",
    colMetric: "Metric",
    colUsage: "Usage",
    colRisk: "Risk",
    colExposure: "Exposure",
    colClient: "Client",
    riskOk: "OK",
    riskWarn: "Warning",
    riskRisk: "Risk",
    sheetTitle: "Metric details",
    fMetric: "Metric",
    fUsage: "Usage / Entitlement",
    fPct: "Usage %",
    fRisk: "Risk",
    fExposure: "Estimated exposure",
    fClient: "Client",
    fEnvironment: "Environment",
    guideTitle: "What to do",
    steps: [
      "Review contracts and Digital Access / indirect usage metering.",
      "Identify external systems that create documents in SAP.",
      "Renegotiate the package or contain the source before a SAP audit.",
    ],
  },
  es: {
    title: "Licenciamiento y Acceso Indirecto",
    subtitle: "Monitorea uso vs. derecho de licencia y la exposición de acceso indirecto (Digital Access) antes de una auditoría SAP.",
    total: "Métricas",
    atRisk: "En riesgo",
    warn: "Alerta",
    exposure: "Exposición estimada",
    allClients: "Todos los clientes",
    loading: "Cargando...",
    metrics: "Métricas de licenciamiento",
    empty: "Ninguna métrica de licencia registrada. Los datos provienen de la medición de uso y acceso indirecto del Agente on-premise.",
    colMetric: "Métrica",
    colUsage: "Uso",
    colRisk: "Riesgo",
    colExposure: "Exposición",
    colClient: "Cliente",
    riskOk: "OK",
    riskWarn: "Alerta",
    riskRisk: "Riesgo",
    sheetTitle: "Detalles de la métrica",
    fMetric: "Métrica",
    fUsage: "Uso / Derecho",
    fPct: "% de uso",
    fRisk: "Riesgo",
    fExposure: "Exposición estimada",
    fClient: "Cliente",
    fEnvironment: "Entorno",
    guideTitle: "Qué hacer",
    steps: [
      "Revisar contratos y medición de Digital Access / uso indirecto.",
      "Identificar sistemas externos que generan documentos en SAP.",
      "Renegociar el paquete o contener el origen antes de la auditoría SAP.",
    ],
  },
};
