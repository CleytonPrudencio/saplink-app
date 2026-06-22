import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  explainLabel: string;
  loading: string;
  loadError: string;
  totalClients: string;
  activeAlerts: string;
  avgScore: string;
  activeIntegrations: string;
  clients: string;
  integrations: string;
  alerts: string;
  noClients: string;
  recentAlerts: string;
  noRecentAlerts: string;
}> = {
  pt: {
    title: "Dashboard",
    explainLabel: "Resuma minha carteira (IA)",
    loading: "Carregando...",
    loadError: "Erro ao carregar dados do dashboard.",
    totalClients: "Total Clientes",
    activeAlerts: "Alertas Ativos",
    avgScore: "Score Medio",
    activeIntegrations: "Integracoes Ativas",
    clients: "Clientes",
    integrations: "integracoes",
    alerts: "alertas",
    noClients: "Nenhum cliente cadastrado.",
    recentAlerts: "Alertas Recentes",
    noRecentAlerts: "Nenhum alerta recente.",
  },
  en: {
    title: "Dashboard",
    explainLabel: "Summarize my portfolio (AI)",
    loading: "Loading...",
    loadError: "Failed to load dashboard data.",
    totalClients: "Total Clients",
    activeAlerts: "Active Alerts",
    avgScore: "Avg Score",
    activeIntegrations: "Active Integrations",
    clients: "Clients",
    integrations: "integrations",
    alerts: "alerts",
    noClients: "No clients registered.",
    recentAlerts: "Recent Alerts",
    noRecentAlerts: "No recent alerts.",
  },
  es: {
    title: "Dashboard",
    explainLabel: "Resumir mi cartera (IA)",
    loading: "Cargando...",
    loadError: "Error al cargar los datos del dashboard.",
    totalClients: "Total Clientes",
    activeAlerts: "Alertas Activas",
    avgScore: "Score Promedio",
    activeIntegrations: "Integraciones Activas",
    clients: "Clientes",
    integrations: "integraciones",
    alerts: "alertas",
    noClients: "Ningún cliente registrado.",
    recentAlerts: "Alertas Recientes",
    noRecentAlerts: "Ninguna alerta reciente.",
  },
};
