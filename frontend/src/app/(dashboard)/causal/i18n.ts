import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitleA: string;
  subtitleB: string;
  subtitleC: string;
  subtitleD: string;
  subtitleE: string;
  correlationsFound: string;
  analysisWindow: string;
  loading: string;
  empty: (window: number) => string;
  probableCause: string;
  transportFallback: string;
  causeMeta: (owner: string | undefined, gapHours: number, target: string) => string;
  confidence: string;
  otherSuspects: (list: string) => string;
}> = {
  pt: {
    title: "Causa raiz cross-camada",
    subtitleA: "Cruza os ",
    subtitleB: "transports (STMS, on-prem)",
    subtitleC: " com as ",
    subtitleD: "falhas de CPI/IDoc",
    subtitleE: " que apareceram logo depois — e aponta a mudança que provavelmente causou. Só o SAPLINK tem as duas camadas juntas.",
    correlationsFound: "Correlações encontradas",
    analysisWindow: "Janela de análise",
    loading: "Carregando...",
    empty: (window) => `Nenhuma falha recente correlacionada a um transport. (Precisa de transports importados + falhas na janela de ${window}h.)`,
    probableCause: "Provável causa:",
    transportFallback: "transport",
    causeMeta: (owner, gapHours, target) => `${owner ? `por ${owner} · ` : ""}importado ${gapHours}h antes da falha · alvo ${target}`,
    confidence: "confiança",
    otherSuspects: (list) => `Outros suspeitos: ${list}`,
  },
  en: {
    title: "Cross-layer root cause",
    subtitleA: "Cross-references ",
    subtitleB: "transports (STMS, on-prem)",
    subtitleC: " with the ",
    subtitleD: "CPI/IDoc failures",
    subtitleE: " that appeared right after — and points to the change that probably caused them. Only SAPLINK has both layers together.",
    correlationsFound: "Correlations found",
    analysisWindow: "Analysis window",
    loading: "Loading...",
    empty: (window) => `No recent failure correlated to a transport. (Requires imported transports + failures within the ${window}h window.)`,
    probableCause: "Probable cause:",
    transportFallback: "transport",
    causeMeta: (owner, gapHours, target) => `${owner ? `by ${owner} · ` : ""}imported ${gapHours}h before the failure · target ${target}`,
    confidence: "confidence",
    otherSuspects: (list) => `Other suspects: ${list}`,
  },
  es: {
    title: "Causa raíz cross-capa",
    subtitleA: "Cruza los ",
    subtitleB: "transports (STMS, on-prem)",
    subtitleC: " con las ",
    subtitleD: "fallas de CPI/IDoc",
    subtitleE: " que aparecieron justo después — y señala el cambio que probablemente las causó. Solo SAPLINK tiene las dos capas juntas.",
    correlationsFound: "Correlaciones encontradas",
    analysisWindow: "Ventana de análisis",
    loading: "Cargando...",
    empty: (window) => `Ninguna falla reciente correlacionada con un transport. (Requiere transports importados + fallas en la ventana de ${window}h.)`,
    probableCause: "Causa probable:",
    transportFallback: "transport",
    causeMeta: (owner, gapHours, target) => `${owner ? `por ${owner} · ` : ""}importado ${gapHours}h antes de la falla · destino ${target}`,
    confidence: "confianza",
    otherSuspects: (list) => `Otros sospechosos: ${list}`,
  },
};
