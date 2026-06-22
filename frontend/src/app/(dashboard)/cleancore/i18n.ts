import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  explainScreen: string;
  explainLabel: string;
  loading: string;
  catDeprecatedApi: string;
  catCustomCds: string;
  catSideBySide: string;
  catInApp: string;
  catModification: string;
  overallScore: string;
  scorePerClient: string;
  itemsSuffix: (n: number) => string;
  noData: string;
  colCategory: string;
  colObject: string;
  colSeverity: string;
  colPoints: string;
  colRecommendation: string;
  colClient: string;
  emptyTable: string;
}> = {
  pt: {
    title: "Clean Core Score",
    subtitle: "O quão \"limpo\" está o core do S/4HANA Cloud — a métrica que a SAP cobra, com plano de remediação.",
    explainScreen: "Clean Core Score",
    explainLabel: "Plano de remediação (IA)",
    loading: "Carregando...",
    catDeprecatedApi: "API depreciada",
    catCustomCds: "CDS custom",
    catSideBySide: "Side-by-side (BTP)",
    catInApp: "Extensão in-app",
    catModification: "Modificação",
    overallScore: "Score geral da carteira",
    scorePerClient: "Score por cliente",
    itemsSuffix: (n) => `${n} itens`,
    noData: "Sem dados ainda.",
    colCategory: "Categoria",
    colObject: "Objeto",
    colSeverity: "Severidade",
    colPoints: "-pts",
    colRecommendation: "Recomendação",
    colClient: "Cliente",
    emptyTable: "Core limpo ou sem dados ainda.",
  },
  en: {
    title: "Clean Core Score",
    subtitle: "How \"clean\" the S/4HANA Cloud core is — the metric SAP measures, with a remediation plan.",
    explainScreen: "Clean Core Score",
    explainLabel: "Remediation plan (AI)",
    loading: "Loading...",
    catDeprecatedApi: "Deprecated API",
    catCustomCds: "Custom CDS",
    catSideBySide: "Side-by-side (BTP)",
    catInApp: "In-app extension",
    catModification: "Modification",
    overallScore: "Overall portfolio score",
    scorePerClient: "Score per client",
    itemsSuffix: (n) => `${n} items`,
    noData: "No data yet.",
    colCategory: "Category",
    colObject: "Object",
    colSeverity: "Severity",
    colPoints: "-pts",
    colRecommendation: "Recommendation",
    colClient: "Client",
    emptyTable: "Clean core or no data yet.",
  },
  es: {
    title: "Clean Core Score",
    subtitle: "Qué tan \"limpio\" está el core de S/4HANA Cloud — la métrica que SAP exige, con plan de remediación.",
    explainScreen: "Clean Core Score",
    explainLabel: "Plan de remediación (IA)",
    loading: "Cargando...",
    catDeprecatedApi: "API obsoleta",
    catCustomCds: "CDS custom",
    catSideBySide: "Side-by-side (BTP)",
    catInApp: "Extensión in-app",
    catModification: "Modificación",
    overallScore: "Score general de la cartera",
    scorePerClient: "Score por cliente",
    itemsSuffix: (n) => `${n} ítems`,
    noData: "Aún no hay datos.",
    colCategory: "Categoría",
    colObject: "Objeto",
    colSeverity: "Severidad",
    colPoints: "-pts",
    colRecommendation: "Recomendación",
    colClient: "Cliente",
    emptyTable: "Core limpio o aún sin datos.",
  },
};
