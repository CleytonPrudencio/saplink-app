import type { Lang } from "@/i18n/I18n";

export const T: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    loading: string;
    loadError: string;
    kpiMrr: string;
    kpiMrrHint: (active: number, pastDue: number) => string;
    kpiConsultancies: string;
    kpiConsultanciesHint: (trialing: number, suspended: number) => string;
    kpiUsers: string;
    kpiClients: string;
    kpiClientsHint: (integrations: number) => string;
    consultancies: string;
    colConsultancy: string;
    colPlan: string;
    colStatus: string;
    colUsers: string;
    colClients: string;
    colAction: string;
    empty: string;
    reactivate: string;
    suspend: string;
    confirmSuspend: (name: string) => string;
    suspended: string;
    reactivated: string;
    suspendFail: string;
    reactivateFail: string;
    status: {
      TRIALING: string;
      ACTIVE: string;
      PAST_DUE: string;
      SUSPENDED: string;
      CANCELED: string;
    };
  }
> = {
  pt: {
    title: "Painel da plataforma",
    subtitle: "Visão geral do negócio — consultorias, receita e uso. Clique numa linha para ver detalhes.",
    loading: "Carregando...",
    loadError: "Erro ao carregar painel (precisa ser super-admin).",
    kpiMrr: "MRR (receita recorrente)",
    kpiMrrHint: (active, pastDue) => `${active} ativas + ${pastDue} pendentes`,
    kpiConsultancies: "Consultorias",
    kpiConsultanciesHint: (trialing, suspended) => `${trialing} em teste · ${suspended} suspensas`,
    kpiUsers: "Usuários",
    kpiClients: "Clientes monitorados",
    kpiClientsHint: (integrations) => `${integrations} integrações`,
    consultancies: "Consultorias",
    colConsultancy: "Consultoria",
    colPlan: "Plano",
    colStatus: "Status",
    colUsers: "Usuários",
    colClients: "Clientes",
    colAction: "Ação",
    empty: "Nenhuma consultoria.",
    reactivate: "Reativar",
    suspend: "Suspender",
    confirmSuspend: (name) => `Suspender o acesso de "${name}"?`,
    suspended: "Acesso suspenso.",
    reactivated: "Acesso reativado.",
    suspendFail: "Não foi possível suspender.",
    reactivateFail: "Não foi possível reativar.",
    status: {
      TRIALING: "Em teste",
      ACTIVE: "Ativa",
      PAST_DUE: "Pagamento pendente",
      SUSPENDED: "Suspensa",
      CANCELED: "Cancelada",
    },
  },
  en: {
    title: "Platform dashboard",
    subtitle: "Business overview — consultancies, revenue and usage. Click a row to see details.",
    loading: "Loading...",
    loadError: "Failed to load dashboard (super-admin required).",
    kpiMrr: "MRR (recurring revenue)",
    kpiMrrHint: (active, pastDue) => `${active} active + ${pastDue} past due`,
    kpiConsultancies: "Consultancies",
    kpiConsultanciesHint: (trialing, suspended) => `${trialing} trialing · ${suspended} suspended`,
    kpiUsers: "Users",
    kpiClients: "Monitored clients",
    kpiClientsHint: (integrations) => `${integrations} integrations`,
    consultancies: "Consultancies",
    colConsultancy: "Consultancy",
    colPlan: "Plan",
    colStatus: "Status",
    colUsers: "Users",
    colClients: "Clients",
    colAction: "Action",
    empty: "No consultancies.",
    reactivate: "Reactivate",
    suspend: "Suspend",
    confirmSuspend: (name) => `Suspend access for "${name}"?`,
    suspended: "Access suspended.",
    reactivated: "Access reactivated.",
    suspendFail: "Could not suspend.",
    reactivateFail: "Could not reactivate.",
    status: {
      TRIALING: "Trialing",
      ACTIVE: "Active",
      PAST_DUE: "Past due",
      SUSPENDED: "Suspended",
      CANCELED: "Canceled",
    },
  },
  es: {
    title: "Panel de la plataforma",
    subtitle: "Visión general del negocio — consultoras, ingresos y uso. Haz clic en una fila para ver detalles.",
    loading: "Cargando...",
    loadError: "Error al cargar el panel (se requiere super-admin).",
    kpiMrr: "MRR (ingresos recurrentes)",
    kpiMrrHint: (active, pastDue) => `${active} activas + ${pastDue} pendientes`,
    kpiConsultancies: "Consultoras",
    kpiConsultanciesHint: (trialing, suspended) => `${trialing} en prueba · ${suspended} suspendidas`,
    kpiUsers: "Usuarios",
    kpiClients: "Clientes monitoreados",
    kpiClientsHint: (integrations) => `${integrations} integraciones`,
    consultancies: "Consultoras",
    colConsultancy: "Consultora",
    colPlan: "Plan",
    colStatus: "Estado",
    colUsers: "Usuarios",
    colClients: "Clientes",
    colAction: "Acción",
    empty: "Sin consultoras.",
    reactivate: "Reactivar",
    suspend: "Suspender",
    confirmSuspend: (name) => `¿Suspender el acceso de "${name}"?`,
    suspended: "Acceso suspendido.",
    reactivated: "Acceso reactivado.",
    suspendFail: "No se pudo suspender.",
    reactivateFail: "No se pudo reactivar.",
    status: {
      TRIALING: "En prueba",
      ACTIVE: "Activa",
      PAST_DUE: "Pago pendiente",
      SUSPENDED: "Suspendida",
      CANCELED: "Cancelada",
    },
  },
};
