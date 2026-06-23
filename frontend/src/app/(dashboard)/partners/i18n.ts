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
  // DetailSheet — parceiro EDI
  sheetPartnerSub: string;
  fldItems: string;
  fldErrors: string;
  fldErrorRate: string;
  fldShareOfErrors: string;
  fldScore: string;
  partnerGuideTitle: string;
  partnerGuideBad: string[];
  partnerGuideOk: string[];
  // DetailSheet — IFlow FinOps
  sheetFlowSub: string;
  fldSource: string;
  fldArtifact: string;
  fldMessages30d: string;
  fldEstMonthly: string;
  flowGuideTitle: string;
  flowGuideExpensive: string[];
  flowGuideOk: string[];
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
    sheetPartnerSub: "Confiabilidade de parceiro EDI",
    fldItems: "Itens recebidos",
    fldErrors: "Itens com erro",
    fldErrorRate: "Taxa de erro",
    fldShareOfErrors: "Participação nos erros",
    fldScore: "Score de confiabilidade",
    partnerGuideTitle: "O que fazer",
    partnerGuideBad: [
      "Parceiro com alta taxa de erro: acionar o contato EDI dele e cobrar correção no envio (mapeamento/segmentos do IDoc).",
      "Anexar os itens com erro como evidência ao abrir o chamado com o parceiro.",
      "Se concentra grande parte dos erros da base, priorizar; cada erro custa retrabalho de suporte.",
    ],
    partnerGuideOk: [
      "Confiabilidade saudável: manter monitorando, sem ação imediata.",
    ],
    sheetFlowSub: "FinOps de BTP — custo por IFlow",
    fldSource: "Fonte",
    fldArtifact: "IFlow / artefato",
    fldMessages30d: "Mensagens (30d)",
    fldEstMonthly: "Custo estimado/mês",
    flowGuideTitle: "O que fazer",
    flowGuideExpensive: [
      "IFlow caro: revisar o consumo no BTP — checar polling agressivo, retries em loop e payloads grandes.",
      "Confirmar se o volume é legítimo ou se há reprocessamento descontrolado queimando crédito.",
      "Ajustar agendamento/lote e validar a tarifa em BTP_RATE_CENTS_PER_1K.",
    ],
    flowGuideOk: [
      "Consumo dentro do esperado: sem ação, manter acompanhamento mensal.",
    ],
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
    sheetPartnerSub: "EDI partner reliability",
    fldItems: "Items received",
    fldErrors: "Items with error",
    fldErrorRate: "Error rate",
    fldShareOfErrors: "Share of errors",
    fldScore: "Reliability score",
    partnerGuideTitle: "What to do",
    partnerGuideBad: [
      "Partner with a high error rate: reach out to their EDI contact and require a fix on their side (IDoc mapping/segments).",
      "Attach the failing items as evidence when opening the ticket with the partner.",
      "If it concentrates a large share of the base errors, prioritize it; each error costs support rework.",
    ],
    partnerGuideOk: [
      "Healthy reliability: keep monitoring, no immediate action.",
    ],
    sheetFlowSub: "BTP FinOps — cost per IFlow",
    fldSource: "Source",
    fldArtifact: "IFlow / artifact",
    fldMessages30d: "Messages (30d)",
    fldEstMonthly: "Est. cost/month",
    flowGuideTitle: "What to do",
    flowGuideExpensive: [
      "Expensive IFlow: review BTP consumption — check aggressive polling, retry loops and large payloads.",
      "Confirm whether the volume is legitimate or runaway reprocessing burning credit.",
      "Tune scheduling/batching and validate the rate in BTP_RATE_CENTS_PER_1K.",
    ],
    flowGuideOk: [
      "Consumption within expectations: no action, keep monthly tracking.",
    ],
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
    sheetPartnerSub: "Confiabilidad de socio EDI",
    fldItems: "Ítems recibidos",
    fldErrors: "Ítems con error",
    fldErrorRate: "Tasa de error",
    fldShareOfErrors: "Participación en errores",
    fldScore: "Score de confiabilidad",
    partnerGuideTitle: "Qué hacer",
    partnerGuideBad: [
      "Socio con alta tasa de error: contactar a su responsable EDI y exigir corrección en el envío (mapeo/segmentos del IDoc).",
      "Adjuntar los ítems con error como evidencia al abrir el ticket con el socio.",
      "Si concentra gran parte de los errores de la base, priorizar; cada error cuesta retrabajo de soporte.",
    ],
    partnerGuideOk: [
      "Confiabilidad saludable: seguir monitoreando, sin acción inmediata.",
    ],
    sheetFlowSub: "FinOps de BTP — costo por IFlow",
    fldSource: "Fuente",
    fldArtifact: "IFlow / artefacto",
    fldMessages30d: "Mensajes (30d)",
    fldEstMonthly: "Costo estimado/mes",
    flowGuideTitle: "Qué hacer",
    flowGuideExpensive: [
      "IFlow caro: revisar el consumo en BTP — verificar polling agresivo, retries en bucle y payloads grandes.",
      "Confirmar si el volumen es legítimo o si hay reprocesamiento descontrolado quemando crédito.",
      "Ajustar la programación/lote y validar la tarifa en BTP_RATE_CENTS_PER_1K.",
    ],
    flowGuideOk: [
      "Consumo dentro de lo esperado: sin acción, mantener seguimiento mensual.",
    ],
  },
};
