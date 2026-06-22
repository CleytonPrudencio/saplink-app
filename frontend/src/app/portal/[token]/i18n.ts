import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  loading: string;
  unavailableTitle: string;
  unavailableBody: string;
  headerHealthPortal: string;
  realtimeSubtitle: string;
  healthScore: string;
  avgUptime: string;
  integrations: string;
  openIncidents: string;
  integrationsSection: string;
  uptime: string;
  noIntegrations: string;
  openIncidentsSection: string;
  monitoredBy: (name: string) => string;
  locale: string;
}> = {
  pt: {
    loading: "Carregando...",
    unavailableTitle: "Portal indisponível",
    unavailableBody: "Este link de portal não existe ou foi desativado.",
    headerHealthPortal: "Portal de saúde",
    realtimeSubtitle: "Visão de integrações SAP em tempo real · somente leitura",
    healthScore: "Health score",
    avgUptime: "Uptime médio",
    integrations: "Integrações",
    openIncidents: "Incidentes abertos",
    integrationsSection: "Integrações",
    uptime: "uptime",
    noIntegrations: "Nenhuma integração cadastrada.",
    openIncidentsSection: "Incidentes abertos",
    monitoredBy: (name) => `Monitorado por ${name} · powered by SAPLINK`,
    locale: "pt-BR",
  },
  en: {
    loading: "Loading...",
    unavailableTitle: "Portal unavailable",
    unavailableBody: "This portal link does not exist or has been deactivated.",
    headerHealthPortal: "Health portal",
    realtimeSubtitle: "Real-time view of SAP integrations · read-only",
    healthScore: "Health score",
    avgUptime: "Avg uptime",
    integrations: "Integrations",
    openIncidents: "Open incidents",
    integrationsSection: "Integrations",
    uptime: "uptime",
    noIntegrations: "No integrations registered.",
    openIncidentsSection: "Open incidents",
    monitoredBy: (name) => `Monitored by ${name} · powered by SAPLINK`,
    locale: "en-US",
  },
  es: {
    loading: "Cargando...",
    unavailableTitle: "Portal no disponible",
    unavailableBody: "Este enlace de portal no existe o fue desactivado.",
    headerHealthPortal: "Portal de salud",
    realtimeSubtitle: "Vista de integraciones SAP en tiempo real · solo lectura",
    healthScore: "Health score",
    avgUptime: "Uptime promedio",
    integrations: "Integraciones",
    openIncidents: "Incidentes abiertos",
    integrationsSection: "Integraciones",
    uptime: "uptime",
    noIntegrations: "Ninguna integración registrada.",
    openIncidentsSection: "Incidentes abiertos",
    monitoredBy: (name) => `Monitoreado por ${name} · powered by SAPLINK`,
    locale: "es-ES",
  },
};
