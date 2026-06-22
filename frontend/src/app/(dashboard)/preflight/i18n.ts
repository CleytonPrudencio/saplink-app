import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitleBefore: string;
  subtitleBold1: string;
  subtitleMid: string;
  subtitleBold2: string;
  subtitleAfter: string;
  loading: string;
  emptyTransports: string;
  noDescription: string;
  riskScore: string;
  interfacesInRadius: string;
  clientCatalog: string;
  atRiskPerHour: string;
  processesIntegrations: (p: number | string, i: number | string) => string;
  affectedTitle: string;
  noProcessClassified: string;
  testPlanTitle: string;
}> = {
  pt: {
    title: "Pré-voo de mudança",
    subtitleBefore: "Antes de um transport ir pra produção, veja o",
    subtitleBold1: "raio de impacto",
    subtitleMid: "(interfaces, processos, R$/h em risco) e o",
    subtitleBold2: "score de risco",
    subtitleAfter: "— para testar o que importa primeiro.",
    loading: "Carregando...",
    emptyTransports: "Sem transports recentes. Conecte o agente (STMS) para ver as mudanças.",
    noDescription: "(sem descrição)",
    riskScore: "Score de risco da mudança",
    interfacesInRadius: "Interfaces no raio",
    clientCatalog: "catálogo do cliente",
    atRiskPerHour: "R$/h em risco",
    processesIntegrations: (p, i) => `${p} processo(s) · ${i} integrações`,
    affectedTitle: "Processos & integrações afetados",
    noProcessClassified: "Sem processo classificado nas integrações.",
    testPlanTitle: "Plano de teste recomendado",
  },
  en: {
    title: "Change pre-flight",
    subtitleBefore: "Before a transport goes to production, see the",
    subtitleBold1: "blast radius",
    subtitleMid: "(interfaces, processes, R$/h at risk) and the",
    subtitleBold2: "risk score",
    subtitleAfter: "— to test what matters first.",
    loading: "Loading...",
    emptyTransports: "No recent transports. Connect the agent (STMS) to see the changes.",
    noDescription: "(no description)",
    riskScore: "Change risk score",
    interfacesInRadius: "Interfaces in radius",
    clientCatalog: "client catalog",
    atRiskPerHour: "R$/h at risk",
    processesIntegrations: (p, i) => `${p} process(es) · ${i} integrations`,
    affectedTitle: "Affected processes & integrations",
    noProcessClassified: "No process classified on the integrations.",
    testPlanTitle: "Recommended test plan",
  },
  es: {
    title: "Pre-vuelo de cambio",
    subtitleBefore: "Antes de que un transport vaya a producción, mira el",
    subtitleBold1: "radio de impacto",
    subtitleMid: "(interfaces, procesos, R$/h en riesgo) y el",
    subtitleBold2: "score de riesgo",
    subtitleAfter: "— para probar lo que importa primero.",
    loading: "Cargando...",
    emptyTransports: "Sin transports recientes. Conecta el agente (STMS) para ver los cambios.",
    noDescription: "(sin descripción)",
    riskScore: "Score de riesgo del cambio",
    interfacesInRadius: "Interfaces en el radio",
    clientCatalog: "catálogo del cliente",
    atRiskPerHour: "R$/h en riesgo",
    processesIntegrations: (p, i) => `${p} proceso(s) · ${i} integraciones`,
    affectedTitle: "Procesos e integraciones afectados",
    noProcessClassified: "Sin proceso clasificado en las integraciones.",
    testPlanTitle: "Plan de prueba recomendado",
  },
};
