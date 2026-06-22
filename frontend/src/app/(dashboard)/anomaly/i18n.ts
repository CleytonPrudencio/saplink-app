import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitleBefore: string;
  subtitleBold: string;
  subtitleAfter: string;
  explainScreen: string;
  statTracked: string;
  statAnomaliesNow: string;
  loading: string;
  emptyBaseline: string;
  thClient: string;
  thFlow: string;
  thExpected: string;
  thCurrent: string;
  thDrop: string;
  thStatus: string;
  stStopped: string;
  stDrop: string;
  stOk: string;
}> = {
  pt: {
    title: "Perda silenciosa de negócio",
    subtitleBefore: "Detecta quando o",
    subtitleBold: "volume",
    subtitleAfter: "de mensagens cai muito abaixo do normal — mesmo com tudo “verde” tecnicamente. O alerta que captura receita parando antes de virar reclamação.",
    explainScreen: "Perda silenciosa de negócio",
    statTracked: "Fluxos monitorados",
    statAnomaliesNow: "Anomalias agora",
    loading: "Carregando...",
    emptyBaseline: "Ainda sem volume suficiente para baseline. Conforme as mensagens fluem, o radar aprende o normal de cada fluxo.",
    thClient: "Cliente",
    thFlow: "Fluxo",
    thExpected: "Esperado (~2h)",
    thCurrent: "Atual",
    thDrop: "Queda",
    thStatus: "Status",
    stStopped: "PAROU",
    stDrop: "QUEDA",
    stOk: "normal",
  },
  en: {
    title: "Silent business loss",
    subtitleBefore: "Detects when the message",
    subtitleBold: "volume",
    subtitleAfter: "drops well below normal — even when everything is technically “green”. The alert that catches revenue stalling before it turns into a complaint.",
    explainScreen: "Silent business loss",
    statTracked: "Monitored flows",
    statAnomaliesNow: "Anomalies now",
    loading: "Loading...",
    emptyBaseline: "Not enough volume for a baseline yet. As messages flow, the radar learns what is normal for each flow.",
    thClient: "Client",
    thFlow: "Flow",
    thExpected: "Expected (~2h)",
    thCurrent: "Current",
    thDrop: "Drop",
    thStatus: "Status",
    stStopped: "STOPPED",
    stDrop: "DROP",
    stOk: "normal",
  },
  es: {
    title: "Pérdida silenciosa de negocio",
    subtitleBefore: "Detecta cuando el",
    subtitleBold: "volumen",
    subtitleAfter: "de mensajes cae muy por debajo de lo normal — incluso con todo “verde” técnicamente. La alerta que capta los ingresos detenidos antes de que se conviertan en un reclamo.",
    explainScreen: "Pérdida silenciosa de negocio",
    statTracked: "Flujos monitoreados",
    statAnomaliesNow: "Anomalías ahora",
    loading: "Cargando...",
    emptyBaseline: "Aún no hay volumen suficiente para una línea base. A medida que fluyen los mensajes, el radar aprende lo normal de cada flujo.",
    thClient: "Cliente",
    thFlow: "Flujo",
    thExpected: "Esperado (~2h)",
    thCurrent: "Actual",
    thDrop: "Caída",
    thStatus: "Estado",
    stStopped: "DETENIDO",
    stDrop: "CAÍDA",
    stOk: "normal",
  },
};
