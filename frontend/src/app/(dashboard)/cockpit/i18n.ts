import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  // status de remediação
  statusPendingApproval: string;
  statusApproved: string;
  statusExecuting: string;
  statusDone: string;
  statusFailed: string;
  statusRejected: string;
  // produção / confirmação
  prodConfirm: string;
  // header
  title: string;
  subtitle: string;
  // resumo
  openItems: string;
  queueDepth: string;
  remediable: string;
  // filtros
  allClients: string;
  allKinds: string;
  statusPlaceholder: string;
  searchPlaceholder: string;
  // lista
  loading: string;
  emptyTitle: string;
  emptyHint: string;
  thKind: string;
  thRef: string;
  thClient: string;
  thMsgPartner: string;
  thStatus: string;
  thDepth: string;
  thAction: string;
  manual: string;
  inProgress: string;
  remediate: string;
  remediableTag: string;
  // remediação admin
  pendingTitle: string;
  approveAndExecute: string;
  reject: string;
  // log
  historyTitle: string;
}> = {
  pt: {
    statusPendingApproval: "Aguardando aprovação",
    statusApproved: "Aprovada",
    statusExecuting: "Executando",
    statusDone: "Concluída",
    statusFailed: "Falhou",
    statusRejected: "Rejeitada",
    prodConfirm: "⚠️ PRODUÇÃO\n\nEsta remediação vai executar no SAP de PRODUÇÃO do cliente. Confirmar a aprovação?",
    title: "🛰️ Cockpit de operação",
    subtitle: "IDocs em erro e filas qRFC/tRFC de toda a carteira num só painel (BD87 · SMQ1/2 · SM58).",
    openItems: "Itens abertos",
    queueDepth: "Profund. filas",
    remediable: "Remediáveis",
    allClients: "Todos os clientes",
    allKinds: "Todos os tipos",
    statusPlaceholder: "Status (51, SYSFAIL...)",
    searchPlaceholder: "Buscar ref / msg type / parceiro",
    loading: "Carregando...",
    emptyTitle: "Nenhum item em erro nos filtros atuais. 🎉",
    emptyHint: "Os dados chegam pelo Agente on-premise (IDocs/filas do SAP do cliente).",
    thKind: "Tipo",
    thRef: "Referência",
    thClient: "Cliente",
    thMsgPartner: "Msg / Parceiro",
    thStatus: "Status",
    thDepth: "Profund.",
    thAction: "Ação",
    manual: "manual",
    inProgress: "em andamento",
    remediate: "✨ Remediar",
    remediableTag: "remediável",
    pendingTitle: "⚠️ Remediações aguardando aprovação",
    approveAndExecute: "Aprovar e executar",
    reject: "Rejeitar",
    historyTitle: "Histórico de remediações",
  },
  en: {
    statusPendingApproval: "Awaiting approval",
    statusApproved: "Approved",
    statusExecuting: "Executing",
    statusDone: "Done",
    statusFailed: "Failed",
    statusRejected: "Rejected",
    prodConfirm: "⚠️ PRODUCTION\n\nThis remediation will run on the client's PRODUCTION SAP. Confirm the approval?",
    title: "🛰️ Operations cockpit",
    subtitle: "IDocs in error and qRFC/tRFC queues across the whole portfolio in a single panel (BD87 · SMQ1/2 · SM58).",
    openItems: "Open items",
    queueDepth: "Queue depth",
    remediable: "Remediable",
    allClients: "All clients",
    allKinds: "All kinds",
    statusPlaceholder: "Status (51, SYSFAIL...)",
    searchPlaceholder: "Search ref / msg type / partner",
    loading: "Loading...",
    emptyTitle: "No items in error for the current filters. 🎉",
    emptyHint: "Data arrives via the on-premise Agent (IDocs/queues from the client's SAP).",
    thKind: "Kind",
    thRef: "Reference",
    thClient: "Client",
    thMsgPartner: "Msg / Partner",
    thStatus: "Status",
    thDepth: "Depth",
    thAction: "Action",
    manual: "manual",
    inProgress: "in progress",
    remediate: "✨ Remediate",
    remediableTag: "remediable",
    pendingTitle: "⚠️ Remediations awaiting approval",
    approveAndExecute: "Approve and execute",
    reject: "Reject",
    historyTitle: "Remediation history",
  },
  es: {
    statusPendingApproval: "En espera de aprobación",
    statusApproved: "Aprobada",
    statusExecuting: "Ejecutando",
    statusDone: "Completada",
    statusFailed: "Falló",
    statusRejected: "Rechazada",
    prodConfirm: "⚠️ PRODUCCIÓN\n\nEsta remediación se ejecutará en el SAP de PRODUCCIÓN del cliente. ¿Confirmar la aprobación?",
    title: "🛰️ Cockpit de operación",
    subtitle: "IDocs en error y colas qRFC/tRFC de toda la cartera en un solo panel (BD87 · SMQ1/2 · SM58).",
    openItems: "Ítems abiertos",
    queueDepth: "Prof. colas",
    remediable: "Remediables",
    allClients: "Todos los clientes",
    allKinds: "Todos los tipos",
    statusPlaceholder: "Status (51, SYSFAIL...)",
    searchPlaceholder: "Buscar ref / msg type / socio",
    loading: "Cargando...",
    emptyTitle: "Ningún ítem en error con los filtros actuales. 🎉",
    emptyHint: "Los datos llegan mediante el Agente on-premise (IDocs/colas del SAP del cliente).",
    thKind: "Tipo",
    thRef: "Referencia",
    thClient: "Cliente",
    thMsgPartner: "Msg / Socio",
    thStatus: "Status",
    thDepth: "Prof.",
    thAction: "Acción",
    manual: "manual",
    inProgress: "en curso",
    remediate: "✨ Remediar",
    remediableTag: "remediable",
    pendingTitle: "⚠️ Remediaciones en espera de aprobación",
    approveAndExecute: "Aprobar y ejecutar",
    reject: "Rechazar",
    historyTitle: "Historial de remediaciones",
  },
};
