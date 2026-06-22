import type { Lang } from "@/i18n/I18n";

export const T: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    loading: string;
    noData: string;
    loadError: string;
    kpiMrr: string;
    kpiArr: string;
    kpiTotalPaid: string;
    kpiTotalPaidHint: (count: number) => string;
    kpiAvgTicket: string;
    mrrByPlan: string;
    subsByStatus: string;
    billing6m: string;
    recentInvoices: string;
    colDate: string;
    colConsultancy: string;
    colAmount: string;
    noInvoices: string;
    dash: string;
    status: {
      TRIALING: string;
      ACTIVE: string;
      PAST_DUE: string;
      SUSPENDED: string;
      CANCELED: string;
    };
    locale: string;
  }
> = {
  pt: {
    title: "Receita",
    subtitle: "Visão financeira da plataforma.",
    loading: "Carregando...",
    noData: "Sem dados.",
    loadError: "Erro ao carregar receita.",
    kpiMrr: "MRR (mensal recorrente)",
    kpiArr: "ARR (anual projetado)",
    kpiTotalPaid: "Total faturado (pago)",
    kpiTotalPaidHint: (count) => `${count} faturas`,
    kpiAvgTicket: "Ticket médio",
    mrrByPlan: "MRR por plano",
    subsByStatus: "Assinaturas por status",
    billing6m: "Faturamento (últimos 6 meses)",
    recentInvoices: "Faturas recentes",
    colDate: "Data",
    colConsultancy: "Consultoria",
    colAmount: "Valor",
    noInvoices: "Nenhuma fatura paga ainda.",
    dash: "-",
    status: {
      TRIALING: "Em teste",
      ACTIVE: "Ativa",
      PAST_DUE: "Pendente",
      SUSPENDED: "Suspensa",
      CANCELED: "Cancelada",
    },
    locale: "pt-BR",
  },
  en: {
    title: "Revenue",
    subtitle: "Platform financial overview.",
    loading: "Loading...",
    noData: "No data.",
    loadError: "Error loading revenue.",
    kpiMrr: "MRR (monthly recurring)",
    kpiArr: "ARR (projected annual)",
    kpiTotalPaid: "Total billed (paid)",
    kpiTotalPaidHint: (count) => `${count} invoices`,
    kpiAvgTicket: "Average ticket",
    mrrByPlan: "MRR by plan",
    subsByStatus: "Subscriptions by status",
    billing6m: "Billing (last 6 months)",
    recentInvoices: "Recent invoices",
    colDate: "Date",
    colConsultancy: "Consultancy",
    colAmount: "Amount",
    noInvoices: "No paid invoices yet.",
    dash: "-",
    status: {
      TRIALING: "Trialing",
      ACTIVE: "Active",
      PAST_DUE: "Past due",
      SUSPENDED: "Suspended",
      CANCELED: "Canceled",
    },
    locale: "en-US",
  },
  es: {
    title: "Ingresos",
    subtitle: "Visión financiera de la plataforma.",
    loading: "Cargando...",
    noData: "Sin datos.",
    loadError: "Error al cargar los ingresos.",
    kpiMrr: "MRR (mensual recurrente)",
    kpiArr: "ARR (anual proyectado)",
    kpiTotalPaid: "Total facturado (pagado)",
    kpiTotalPaidHint: (count) => `${count} facturas`,
    kpiAvgTicket: "Ticket promedio",
    mrrByPlan: "MRR por plan",
    subsByStatus: "Suscripciones por estado",
    billing6m: "Facturación (últimos 6 meses)",
    recentInvoices: "Facturas recientes",
    colDate: "Fecha",
    colConsultancy: "Consultora",
    colAmount: "Monto",
    noInvoices: "Aún no hay facturas pagadas.",
    dash: "-",
    status: {
      TRIALING: "En prueba",
      ACTIVE: "Activa",
      PAST_DUE: "Pendiente",
      SUSPENDED: "Suspendida",
      CANCELED: "Cancelada",
    },
    locale: "es-419",
  },
};
