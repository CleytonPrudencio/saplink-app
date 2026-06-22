import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitleBefore: string;
  subtitleBold: string;
  subtitleAfter: string;
  loading: string;
  emptyIncidents: string;
  whatIfTitle: string;
  realImpact: (min: number | string) => string;
  ifDetectedInBefore: string;
  ifDetectedInAfter: string;
  savingsWithSaplink: string;
  defineCostHint: string;
  timelineTitle: string;
  noEvents: string;
}> = {
  pt: {
    title: "Time machine de incidente",
    subtitleBefore: "Reconstrói a linha do tempo do incidente (mudanças, falhas, alertas) e mostra o",
    subtitleBold: "contrafactual",
    subtitleAfter: ": quanto teria sido economizado com detecção mais rápida.",
    loading: "Carregando...",
    emptyIncidents: "Sem incidentes registrados ainda.",
    whatIfTitle: "E se tivéssemos detectado antes?",
    realImpact: (min) => `Impacto real (${min} min parado)`,
    ifDetectedInBefore: "Se detectado em",
    ifDetectedInAfter: "min",
    savingsWithSaplink: "Economia com SAPLINK",
    defineCostHint: "Defina o custo/hora da integração (em SLA & Impacto) para o cálculo em R$ ficar real.",
    timelineTitle: "Linha do tempo do incidente",
    noEvents: "Sem eventos correlacionados na janela.",
  },
  en: {
    title: "Incident time machine",
    subtitleBefore: "Rebuilds the incident timeline (changes, failures, alerts) and shows the",
    subtitleBold: "counterfactual",
    subtitleAfter: ": how much would have been saved with faster detection.",
    loading: "Loading...",
    emptyIncidents: "No incidents recorded yet.",
    whatIfTitle: "What if we had detected it earlier?",
    realImpact: (min) => `Actual impact (${min} min down)`,
    ifDetectedInBefore: "If detected in",
    ifDetectedInAfter: "min",
    savingsWithSaplink: "Savings with SAPLINK",
    defineCostHint: "Set the integration's cost/hour (in SLA & Impact) for the R$ calculation to be real.",
    timelineTitle: "Incident timeline",
    noEvents: "No correlated events in the window.",
  },
  es: {
    title: "Time machine de incidente",
    subtitleBefore: "Reconstruye la línea de tiempo del incidente (cambios, fallas, alertas) y muestra el",
    subtitleBold: "contrafactual",
    subtitleAfter: ": cuánto se habría ahorrado con una detección más rápida.",
    loading: "Cargando...",
    emptyIncidents: "Sin incidentes registrados aún.",
    whatIfTitle: "¿Y si lo hubiéramos detectado antes?",
    realImpact: (min) => `Impacto real (${min} min detenido)`,
    ifDetectedInBefore: "Si se detecta en",
    ifDetectedInAfter: "min",
    savingsWithSaplink: "Ahorro con SAPLINK",
    defineCostHint: "Define el costo/hora de la integración (en SLA & Impacto) para que el cálculo en R$ sea real.",
    timelineTitle: "Línea de tiempo del incidente",
    noEvents: "Sin eventos correlacionados en la ventana.",
  },
};
