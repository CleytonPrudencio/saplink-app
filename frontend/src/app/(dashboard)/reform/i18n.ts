import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  readiness: string;
  total: string;
  ok: string;
  pending: string;
  risk: string;
  byClient: string;
  allClients: string;
  loading: string;
  checks: string;
  empty: string;
  colArea: string;
  colCheck: string;
  colStatus: string;
  colPhase: string;
  colClient: string;
  statusOk: string;
  statusPending: string;
  statusRisk: string;
  fArea: string;
  fCheck: string;
  fStatus: string;
  fPhase: string;
  fClient: string;
  fEnvironment: string;
  guideTitle: string;
  steps: string[];
}> = {
  pt: {
    title: "Prontidão da Reforma (CBS/IBS)",
    subtitle: "Mede a prontidão do ambiente SAP para a reforma tributária CBS/IBS. Apenas monitora — não calcula nem transmite imposto.",
    readiness: "Prontidão geral",
    total: "Total",
    ok: "OK",
    pending: "Pendente",
    risk: "Risco",
    byClient: "Por cliente",
    allClients: "Todos os clientes",
    loading: "Carregando...",
    checks: "Verificações de prontidão",
    empty: "Nenhuma verificação registrada. Os dados vêm da descoberta do Agente on-premise.",
    colArea: "Área",
    colCheck: "Verificação",
    colStatus: "Status",
    colPhase: "Fase",
    colClient: "Cliente",
    statusOk: "OK",
    statusPending: "Pendente",
    statusRisk: "Risco",
    fArea: "Área",
    fCheck: "Verificação",
    fStatus: "Status",
    fPhase: "Fase",
    fClient: "Cliente",
    fEnvironment: "Ambiente",
    guideTitle: "O que fazer",
    steps: [
      "Aplicar/checar as SAP Notes da reforma via SNOTE.",
      "Validar campos CBS/IBS e determinação tributária.",
      "Confirmar layout NF-e/NFS-e e DRC adaptados.",
    ],
  },
  en: {
    title: "Tax Reform Readiness (CBS/IBS)",
    subtitle: "Measures how ready the SAP landscape is for the CBS/IBS tax reform. Monitoring only — it does not calculate or transmit tax.",
    readiness: "Overall readiness",
    total: "Total",
    ok: "OK",
    pending: "Pending",
    risk: "Risk",
    byClient: "By client",
    allClients: "All clients",
    loading: "Loading...",
    checks: "Readiness checks",
    empty: "No checks recorded. Data comes from the on-premise Agent discovery.",
    colArea: "Area",
    colCheck: "Check",
    colStatus: "Status",
    colPhase: "Phase",
    colClient: "Client",
    statusOk: "OK",
    statusPending: "Pending",
    statusRisk: "Risk",
    fArea: "Area",
    fCheck: "Check",
    fStatus: "Status",
    fPhase: "Phase",
    fClient: "Client",
    fEnvironment: "Environment",
    guideTitle: "What to do",
    steps: [
      "Apply/check the reform SAP Notes via SNOTE.",
      "Validate CBS/IBS fields and tax determination.",
      "Confirm NF-e/NFS-e layout and DRC are adapted.",
    ],
  },
  es: {
    title: "Preparación de la Reforma (CBS/IBS)",
    subtitle: "Mide qué tan preparado está el entorno SAP para la reforma tributaria CBS/IBS. Solo monitorea — no calcula ni transmite impuesto.",
    readiness: "Preparación general",
    total: "Total",
    ok: "OK",
    pending: "Pendiente",
    risk: "Riesgo",
    byClient: "Por cliente",
    allClients: "Todos los clientes",
    loading: "Cargando...",
    checks: "Verificaciones de preparación",
    empty: "Ninguna verificación registrada. Los datos provienen del descubrimiento del Agente on-premise.",
    colArea: "Área",
    colCheck: "Verificación",
    colStatus: "Estado",
    colPhase: "Fase",
    colClient: "Cliente",
    statusOk: "OK",
    statusPending: "Pendiente",
    statusRisk: "Riesgo",
    fArea: "Área",
    fCheck: "Verificación",
    fStatus: "Estado",
    fPhase: "Fase",
    fClient: "Cliente",
    fEnvironment: "Entorno",
    guideTitle: "Qué hacer",
    steps: [
      "Aplicar/comprobar las SAP Notes de la reforma vía SNOTE.",
      "Validar campos CBS/IBS y determinación tributaria.",
      "Confirmar layout NF-e/NFS-e y DRC adaptados.",
    ],
  },
};
