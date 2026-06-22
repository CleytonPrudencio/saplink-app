import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  signatures: string;
  occurrences: string;
  learnedFixes: string;
  loading: string;
  empty: string;
  inNetwork: string;
  clients: string;
  winningFix: string;
  fixStats: (rate: number, count: number, minutes: number) => string;
  noProvenFix: string;
  privacyNote: string;
}> = {
  pt: {
    title: "Rede Federada de Falhas",
    subtitle: 'O "Waze do SAP": cada falha e a correção que funcionou viram conhecimento anonimizado da rede. Quanto mais clientes, mais inteligente fica.',
    signatures: "Assinaturas de falha",
    occurrences: "Ocorrências na rede",
    learnedFixes: "Correções aprendidas",
    loading: "Carregando...",
    empty: "A rede ainda está aprendendo. Cada falha detectada (CPI/AIF/IDoc) alimenta as assinaturas automaticamente.",
    inNetwork: "na rede",
    clients: "clientes",
    winningFix: "✓ Correção vencedora:",
    fixStats: (rate, count, minutes) => `${rate}% de sucesso · ${count} aplicações · ~${minutes}min`,
    noProvenFix: "Ainda sem correção comprovada para esta assinatura.",
    privacyNote: "Dados 100% anonimizados: as falhas são agrupadas por assinatura (sem ids/números) e os clientes contados por hash — nenhuma identidade é exposta entre tenants.",
  },
  en: {
    title: "Federated Failure Network",
    subtitle: 'The "Waze for SAP": every failure and the fix that worked become anonymized network knowledge. The more clients, the smarter it gets.',
    signatures: "Failure signatures",
    occurrences: "Occurrences in the network",
    learnedFixes: "Learned fixes",
    loading: "Loading...",
    empty: "The network is still learning. Every detected failure (CPI/AIF/IDoc) feeds the signatures automatically.",
    inNetwork: "in the network",
    clients: "clients",
    winningFix: "✓ Winning fix:",
    fixStats: (rate, count, minutes) => `${rate}% success · ${count} applications · ~${minutes}min`,
    noProvenFix: "No proven fix for this signature yet.",
    privacyNote: "100% anonymized data: failures are grouped by signature (no ids/numbers) and clients counted by hash — no identity is exposed across tenants.",
  },
  es: {
    title: "Red Federada de Fallas",
    subtitle: 'El "Waze del SAP": cada falla y la corrección que funcionó se convierten en conocimiento anonimizado de la red. Cuantos más clientes, más inteligente se vuelve.',
    signatures: "Firmas de falla",
    occurrences: "Ocurrencias en la red",
    learnedFixes: "Correcciones aprendidas",
    loading: "Cargando...",
    empty: "La red todavía está aprendiendo. Cada falla detectada (CPI/AIF/IDoc) alimenta las firmas automáticamente.",
    inNetwork: "en la red",
    clients: "clientes",
    winningFix: "✓ Corrección ganadora:",
    fixStats: (rate, count, minutes) => `${rate}% de éxito · ${count} aplicaciones · ~${minutes}min`,
    noProvenFix: "Aún sin corrección comprobada para esta firma.",
    privacyNote: "Datos 100% anonimizados: las fallas se agrupan por firma (sin ids/números) y los clientes se cuentan por hash — no se expone ninguna identidad entre tenants.",
  },
};
