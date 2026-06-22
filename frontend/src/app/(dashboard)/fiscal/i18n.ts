import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  explainScreen: string;
  loading: string;
  stAuthorized: string;
  stRejected: string;
  stContingency: string;
  stPending: string;
  stCancelled: string;
  famBilling: string;
  famOther: string;
  filterAll: (n: number) => string;
  statBlocked: string;
  statAtRisk: string;
  statRejected: string;
  statTotal: string;
  colType: string;
  colNumber: string;
  colStatus: string;
  colSefaz: string;
  colValue: string;
  colClient: string;
  colAction: string;
  actionOk: string;
  actionReprocess: string;
  reprocessing: string;
  actionManual: string;
  emptyTable: string;
}> = {
  pt: {
    title: "Fiscal BR — DRC / eDocument / GRC",
    subtitle: "NF-e, NFS-e, CT-e, MDF-e e as obrigações SPED, eSocial e EFD-Reinf: rejeições da SEFAZ, contingência e fila — com reprocesso.",
    explainScreen: "Cockpit Fiscal (DRC/GRC)",
    loading: "Carregando...",
    stAuthorized: "Autorizada",
    stRejected: "Rejeitada",
    stContingency: "Contingência",
    stPending: "Pendente",
    stCancelled: "Cancelada",
    famBilling: "Faturas",
    famOther: "Outros",
    filterAll: (n) => `Todos (${n})`,
    statBlocked: "Bloqueados",
    statAtRisk: "R$ em risco",
    statRejected: "Rejeitadas",
    statTotal: "Total",
    colType: "Tipo",
    colNumber: "Número",
    colStatus: "Status",
    colSefaz: "SEFAZ",
    colValue: "Valor",
    colClient: "Cliente",
    colAction: "Ação",
    actionOk: "ok",
    actionReprocess: "Reprocessar",
    reprocessing: "...",
    actionManual: "manual",
    emptyTable: "Sem documentos fiscais — conecte o S/4HANA Cloud (DRC).",
  },
  en: {
    title: "Tax BR — DRC / eDocument / GRC",
    subtitle: "NF-e, NFS-e, CT-e, MDF-e and the SPED, eSocial and EFD-Reinf obligations: SEFAZ rejections, contingency and queue — with reprocessing.",
    explainScreen: "Tax Cockpit (DRC/GRC)",
    loading: "Loading...",
    stAuthorized: "Authorized",
    stRejected: "Rejected",
    stContingency: "Contingency",
    stPending: "Pending",
    stCancelled: "Cancelled",
    famBilling: "Invoices",
    famOther: "Other",
    filterAll: (n) => `All (${n})`,
    statBlocked: "Blocked",
    statAtRisk: "Value at risk",
    statRejected: "Rejected",
    statTotal: "Total",
    colType: "Type",
    colNumber: "Number",
    colStatus: "Status",
    colSefaz: "SEFAZ",
    colValue: "Value",
    colClient: "Client",
    colAction: "Action",
    actionOk: "ok",
    actionReprocess: "Reprocess",
    reprocessing: "...",
    actionManual: "manual",
    emptyTable: "No tax documents — connect S/4HANA Cloud (DRC).",
  },
  es: {
    title: "Fiscal BR — DRC / eDocument / GRC",
    subtitle: "NF-e, NFS-e, CT-e, MDF-e y las obligaciones SPED, eSocial y EFD-Reinf: rechazos de la SEFAZ, contingencia y cola — con reproceso.",
    explainScreen: "Cockpit Fiscal (DRC/GRC)",
    loading: "Cargando...",
    stAuthorized: "Autorizada",
    stRejected: "Rechazada",
    stContingency: "Contingencia",
    stPending: "Pendiente",
    stCancelled: "Cancelada",
    famBilling: "Facturas",
    famOther: "Otros",
    filterAll: (n) => `Todos (${n})`,
    statBlocked: "Bloqueados",
    statAtRisk: "Valor en riesgo",
    statRejected: "Rechazadas",
    statTotal: "Total",
    colType: "Tipo",
    colNumber: "Número",
    colStatus: "Status",
    colSefaz: "SEFAZ",
    colValue: "Valor",
    colClient: "Cliente",
    colAction: "Acción",
    actionOk: "ok",
    actionReprocess: "Reprocesar",
    reprocessing: "...",
    actionManual: "manual",
    emptyTable: "Sin documentos fiscales — conecta S/4HANA Cloud (DRC).",
  },
};
