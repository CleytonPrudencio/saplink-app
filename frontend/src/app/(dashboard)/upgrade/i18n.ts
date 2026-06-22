import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  releasePrefix: (release: string) => string;
  subtitle: string;
  explainScreen: string;
  explainLabel: string;
  loading: string;
  impactBreaking: string;
  impactDeprecated: string;
  impactChanged: string;
  impactOk: string;
  statBreaking: string;
  statDeprecated: string;
  statChanged: string;
  statCompatible: string;
  colImpact: string;
  colArea: string;
  colObject: string;
  colRecommendation: string;
  colClient: string;
  noFindings: string;
  deprecatedApisTitle: (n: number) => string;
  migrateFallback: string;
  deprecatesIn: (release: string) => string;
  noDeprecated: string;
}> = {
  pt: {
    title: "Radar de Upgrade",
    releasePrefix: (release) => `· release ${release}`,
    subtitle: "O que vai quebrar/mudar no próximo upgrade do S/4HANA Cloud — mapeado ao que você realmente usa.",
    explainScreen: "Radar de Upgrade S/4HANA",
    explainLabel: "Gerar plano de upgrade (IA)",
    loading: "Carregando...",
    impactBreaking: "Quebra",
    impactDeprecated: "Depreciado",
    impactChanged: "Mudou",
    impactOk: "OK",
    statBreaking: "Quebram",
    statDeprecated: "Depreciados",
    statChanged: "Mudam",
    statCompatible: "Compatíveis",
    colImpact: "Impacto",
    colArea: "Área",
    colObject: "Objeto",
    colRecommendation: "Recomendação",
    colClient: "Cliente",
    noFindings: "Sem achados — conecte o S/4HANA Cloud para o radar rodar.",
    deprecatedApisTitle: (n) => `APIs depreciadas em uso (${n})`,
    migrateFallback: "migrar",
    deprecatesIn: (release) => `depreca em ${release}`,
    noDeprecated: "Nenhuma API depreciada em uso. 🎉",
  },
  en: {
    title: "Upgrade Radar",
    releasePrefix: (release) => `· release ${release}`,
    subtitle: "What will break/change in the next S/4HANA Cloud upgrade — mapped to what you actually use.",
    explainScreen: "S/4HANA Upgrade Radar",
    explainLabel: "Generate upgrade plan (AI)",
    loading: "Loading...",
    impactBreaking: "Breaking",
    impactDeprecated: "Deprecated",
    impactChanged: "Changed",
    impactOk: "OK",
    statBreaking: "Breaking",
    statDeprecated: "Deprecated",
    statChanged: "Changing",
    statCompatible: "Compatible",
    colImpact: "Impact",
    colArea: "Area",
    colObject: "Object",
    colRecommendation: "Recommendation",
    colClient: "Client",
    noFindings: "No findings — connect S/4HANA Cloud for the radar to run.",
    deprecatedApisTitle: (n) => `Deprecated APIs in use (${n})`,
    migrateFallback: "migrate",
    deprecatesIn: (release) => `deprecated in ${release}`,
    noDeprecated: "No deprecated APIs in use. 🎉",
  },
  es: {
    title: "Radar de Upgrade",
    releasePrefix: (release) => `· release ${release}`,
    subtitle: "Qué se romperá/cambiará en el próximo upgrade de S/4HANA Cloud — mapeado a lo que realmente usas.",
    explainScreen: "Radar de Upgrade S/4HANA",
    explainLabel: "Generar plan de upgrade (IA)",
    loading: "Cargando...",
    impactBreaking: "Ruptura",
    impactDeprecated: "Obsoleto",
    impactChanged: "Cambió",
    impactOk: "OK",
    statBreaking: "Se rompen",
    statDeprecated: "Obsoletos",
    statChanged: "Cambian",
    statCompatible: "Compatibles",
    colImpact: "Impacto",
    colArea: "Área",
    colObject: "Objeto",
    colRecommendation: "Recomendación",
    colClient: "Cliente",
    noFindings: "Sin hallazgos — conecta S/4HANA Cloud para que el radar funcione.",
    deprecatedApisTitle: (n) => `APIs obsoletas en uso (${n})`,
    migrateFallback: "migrar",
    deprecatesIn: (release) => `obsoleta en ${release}`,
    noDeprecated: "Ninguna API obsoleta en uso. 🎉",
  },
};
