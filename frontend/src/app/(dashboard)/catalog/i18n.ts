import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  explainScreen: string;
  statInterfaces: string;
  statActive: string;
  statPartners: string;
  statRfcDest: string;
  allClients: string;
  allKinds: string;
  searchPlaceholder: string;
  loading: string;
  emptyTitle: string;
  emptyHint: string;
  inactive: string;
  kindLabel: Record<string, string>;
}> = {
  pt: {
    title: "Catálogo de interfaces",
    subtitle: "O landscape de integração vivo, auto-descoberto pelo agente: parceiros, destinos RFC, message types e serviços OData.",
    explainScreen: "Catálogo de interfaces",
    statInterfaces: "Interfaces",
    statActive: "Ativas",
    statPartners: "Parceiros",
    statRfcDest: "Destinos RFC",
    allClients: "Todos os clientes",
    allKinds: "Todos os tipos",
    searchPlaceholder: "Buscar nome / descrição",
    loading: "Carregando...",
    emptyTitle: "Nenhuma interface catalogada ainda.",
    emptyHint: "O catálogo é preenchido pela auto-descoberta do Agente on-premise.",
    inactive: "inativo",
    kindLabel: {
      PARTNER_PROFILE: "Parceiro (WE20)",
      RFC_DEST: "Destino RFC (SM59)",
      MESSAGE_TYPE: "Message Type",
      ODATA_SERVICE: "Serviço OData",
      IDOC_PORT: "Porta IDoc (WE21)",
    },
  },
  en: {
    title: "Interface catalog",
    subtitle: "The live integration landscape, auto-discovered by the agent: partners, RFC destinations, message types and OData services.",
    explainScreen: "Interface catalog",
    statInterfaces: "Interfaces",
    statActive: "Active",
    statPartners: "Partners",
    statRfcDest: "RFC destinations",
    allClients: "All clients",
    allKinds: "All types",
    searchPlaceholder: "Search name / description",
    loading: "Loading...",
    emptyTitle: "No interfaces cataloged yet.",
    emptyHint: "The catalog is populated by the on-premise Agent's auto-discovery.",
    inactive: "inactive",
    kindLabel: {
      PARTNER_PROFILE: "Partner (WE20)",
      RFC_DEST: "RFC destination (SM59)",
      MESSAGE_TYPE: "Message Type",
      ODATA_SERVICE: "OData service",
      IDOC_PORT: "IDoc port (WE21)",
    },
  },
  es: {
    title: "Catálogo de interfaces",
    subtitle: "El landscape de integración vivo, auto-descubierto por el agente: socios, destinos RFC, message types y servicios OData.",
    explainScreen: "Catálogo de interfaces",
    statInterfaces: "Interfaces",
    statActive: "Activas",
    statPartners: "Socios",
    statRfcDest: "Destinos RFC",
    allClients: "Todos los clientes",
    allKinds: "Todos los tipos",
    searchPlaceholder: "Buscar nombre / descripción",
    loading: "Cargando...",
    emptyTitle: "Ninguna interfaz catalogada todavía.",
    emptyHint: "El catálogo se llena con el auto-descubrimiento del Agente on-premise.",
    inactive: "inactivo",
    kindLabel: {
      PARTNER_PROFILE: "Socio (WE20)",
      RFC_DEST: "Destino RFC (SM59)",
      MESSAGE_TYPE: "Message Type",
      ODATA_SERVICE: "Servicio OData",
      IDOC_PORT: "Puerto IDoc (WE21)",
    },
  },
};
