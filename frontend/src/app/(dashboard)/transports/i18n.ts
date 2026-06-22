import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  transports: string;
  incidents: string;
  correlated: string;
  allClients: string;
  loading: string;
  probableCause: string;
  importedLast24h: string;
  recentTransports: string;
  empty: string;
  colTr: string;
  colDescription: string;
  colClient: string;
  colTarget: string;
  colOwner: string;
  colImported: string;
}> = {
  pt: {
    title: "Radar de transports (STMS)",
    subtitle: "Transportes importados e correlação automática com incidentes abertos (provável causa).",
    transports: "Transports",
    incidents: "Incidentes",
    correlated: "Correlacionados",
    allClients: "Todos os clientes",
    loading: "Carregando...",
    probableCause: "🔎 Provável causa de incidentes",
    importedLast24h: "Transportes importados nas 24h anteriores:",
    recentTransports: "Transportes recentes",
    empty: "Nenhum transporte registrado. Os dados vêm da descoberta STMS do Agente on-premise.",
    colTr: "TR",
    colDescription: "Descrição",
    colClient: "Cliente",
    colTarget: "Alvo",
    colOwner: "Owner",
    colImported: "Importado",
  },
  en: {
    title: "Transport radar (STMS)",
    subtitle: "Imported transports and automatic correlation with open incidents (probable cause).",
    transports: "Transports",
    incidents: "Incidents",
    correlated: "Correlated",
    allClients: "All clients",
    loading: "Loading...",
    probableCause: "🔎 Probable cause of incidents",
    importedLast24h: "Transports imported in the previous 24h:",
    recentTransports: "Recent transports",
    empty: "No transports recorded. Data comes from the on-premise Agent's STMS discovery.",
    colTr: "TR",
    colDescription: "Description",
    colClient: "Client",
    colTarget: "Target",
    colOwner: "Owner",
    colImported: "Imported",
  },
  es: {
    title: "Radar de transports (STMS)",
    subtitle: "Transportes importados y correlación automática con incidentes abiertos (causa probable).",
    transports: "Transports",
    incidents: "Incidentes",
    correlated: "Correlacionados",
    allClients: "Todos los clientes",
    loading: "Cargando...",
    probableCause: "🔎 Causa probable de incidentes",
    importedLast24h: "Transportes importados en las 24h anteriores:",
    recentTransports: "Transportes recientes",
    empty: "Ningún transporte registrado. Los datos provienen del descubrimiento STMS del Agente on-premise.",
    colTr: "TR",
    colDescription: "Descripción",
    colClient: "Cliente",
    colTarget: "Destino",
    colOwner: "Owner",
    colImported: "Importado",
  },
};
