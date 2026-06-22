import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  loading: string;
  partnersHeading: string;
  partnersEmpty: string;
  colPartner: string;
  colItems: string;
  colErrors: string;
  colErrorRate: string;
  colShareOfErrors: string;
  colScore: string;
  finopsHeading: string;
  finopsEmpty: string;
  colSource: string;
  colArtifact: string;
  colMessages30d: string;
  colEstMonthly: string;
  finopsNote: string;
  perMonthSuffix: string;
}> = {
  pt: {
    title: "Parceiros EDI & FinOps de BTP",
    subtitle: "Quem manda dado ruim (ranking de confiabilidade de parceiro) e quanto cada IFlow custa de consumo no BTP.",
    loading: "Carregando...",
    partnersHeading: "Confiabilidade de parceiro EDI",
    partnersEmpty: "Sem dados de parceiro ainda (vêm dos IDocs/itens do agente).",
    colPartner: "Parceiro",
    colItems: "Itens",
    colErrors: "Erros",
    colErrorRate: "Taxa de erro",
    colShareOfErrors: "% dos erros",
    colScore: "Score",
    finopsHeading: "FinOps de BTP — custo estimado por IFlow",
    finopsEmpty: "Conecte o CPI para estimar o consumo de BTP por IFlow.",
    colSource: "Fonte",
    colArtifact: "IFlow / artefato",
    colMessages30d: "Mensagens/30d",
    colEstMonthly: "Custo est./mês",
    finopsNote: "Estimativa baseada no volume real × tarifa configurável (BTP_RATE_CENTS_PER_1K). Flagra IFlow desgovernado queimando crédito.",
    perMonthSuffix: "/mês",
  },
  en: {
    title: "EDI Partners & BTP FinOps",
    subtitle: "Who sends bad data (partner reliability ranking) and how much each IFlow costs in BTP consumption.",
    loading: "Loading...",
    partnersHeading: "EDI partner reliability",
    partnersEmpty: "No partner data yet (it comes from the agent's IDocs/items).",
    colPartner: "Partner",
    colItems: "Items",
    colErrors: "Errors",
    colErrorRate: "Error rate",
    colShareOfErrors: "% of errors",
    colScore: "Score",
    finopsHeading: "BTP FinOps — estimated cost per IFlow",
    finopsEmpty: "Connect CPI to estimate BTP consumption per IFlow.",
    colSource: "Source",
    colArtifact: "IFlow / artifact",
    colMessages30d: "Messages/30d",
    colEstMonthly: "Est. cost/month",
    finopsNote: "Estimate based on actual volume × configurable rate (BTP_RATE_CENTS_PER_1K). Flags runaway IFlows burning credit.",
    perMonthSuffix: "/month",
  },
  es: {
    title: "Socios EDI & FinOps de BTP",
    subtitle: "Quién envía datos malos (ranking de confiabilidad de socio) y cuánto cuesta cada IFlow de consumo en BTP.",
    loading: "Cargando...",
    partnersHeading: "Confiabilidad de socio EDI",
    partnersEmpty: "Aún no hay datos de socio (provienen de los IDocs/ítems del agente).",
    colPartner: "Socio",
    colItems: "Ítems",
    colErrors: "Errores",
    colErrorRate: "Tasa de error",
    colShareOfErrors: "% de errores",
    colScore: "Score",
    finopsHeading: "FinOps de BTP — costo estimado por IFlow",
    finopsEmpty: "Conecte el CPI para estimar el consumo de BTP por IFlow.",
    colSource: "Fuente",
    colArtifact: "IFlow / artefacto",
    colMessages30d: "Mensajes/30d",
    colEstMonthly: "Costo est./mes",
    finopsNote: "Estimación basada en el volumen real × tarifa configurable (BTP_RATE_CENTS_PER_1K). Detecta IFlows descontrolados quemando crédito.",
    perMonthSuffix: "/mes",
  },
};
