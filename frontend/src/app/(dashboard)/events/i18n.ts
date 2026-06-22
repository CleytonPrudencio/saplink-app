import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  explainScreen: string;
  loading: string;
  statDelivered: string;
  statDeadLetter: string;
  statRetry: string;
  statPending: string;
  colTopic: string;
  colStatus: string;
  colSubscriber: string;
  colLag: string;
  colClient: string;
  colWhen: string;
  emptyTable: string;
}> = {
  pt: {
    title: "Event Mesh — eventos de negócio",
    subtitle: "Observabilidade da integração orientada a eventos do S/4HANA Cloud: entrega, dead-letter, retry e lag.",
    explainScreen: "Event Mesh — eventos",
    loading: "Carregando...",
    statDelivered: "Entregues",
    statDeadLetter: "Dead-letter",
    statRetry: "Retry",
    statPending: "Pendentes",
    colTopic: "Tópico",
    colStatus: "Status",
    colSubscriber: "Assinante",
    colLag: "Lag",
    colClient: "Cliente",
    colWhen: "Quando",
    emptyTable: "Sem eventos — conecte o Event Mesh do S/4HANA Cloud.",
  },
  en: {
    title: "Event Mesh — business events",
    subtitle: "Observability of S/4HANA Cloud event-driven integration: delivery, dead-letter, retry and lag.",
    explainScreen: "Event Mesh — events",
    loading: "Loading...",
    statDelivered: "Delivered",
    statDeadLetter: "Dead-letter",
    statRetry: "Retry",
    statPending: "Pending",
    colTopic: "Topic",
    colStatus: "Status",
    colSubscriber: "Subscriber",
    colLag: "Lag",
    colClient: "Client",
    colWhen: "When",
    emptyTable: "No events — connect the S/4HANA Cloud Event Mesh.",
  },
  es: {
    title: "Event Mesh — eventos de negocio",
    subtitle: "Observabilidad de la integración orientada a eventos de S/4HANA Cloud: entrega, dead-letter, retry y lag.",
    explainScreen: "Event Mesh — eventos",
    loading: "Cargando...",
    statDelivered: "Entregados",
    statDeadLetter: "Dead-letter",
    statRetry: "Retry",
    statPending: "Pendientes",
    colTopic: "Tópico",
    colStatus: "Status",
    colSubscriber: "Suscriptor",
    colLag: "Lag",
    colClient: "Cliente",
    colWhen: "Cuándo",
    emptyTable: "Sin eventos — conecta el Event Mesh de S/4HANA Cloud.",
  },
};
