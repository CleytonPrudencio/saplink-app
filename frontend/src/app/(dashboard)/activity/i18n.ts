import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  loading: string;
  loadError: string;
  adminOnlyTitle: string;
  adminOnlyText: string;
  // colunas
  colDate: string;
  colUser: string;
  colAction: string;
  colPath: string;
  colStatus: string;
  // ações (badges)
  actView: string;
  actCreate: string;
  actEdit: string;
  actDelete: string;
  actOther: string;
  // paginação
  prev: string;
  next: string;
  pageOf: (page: number, total: number) => string;
  totalRecords: (n: number) => string;
  // vazio
  emptyTitle: string;
  // locale para datas
  locale: string;
  // filtros
  filterUser: string;
  filterUserAll: string;
  filterAction: string;
  filterActionAll: string;
  filterFrom: string;
  filterTo: string;
  filterClear: string;
}> = {
  pt: {
    title: "Log de atividade",
    subtitle: "Histórico de acessos e ações dos usuários da sua consultoria.",
    loading: "Carregando...",
    loadError: "Erro ao carregar o log de atividade.",
    adminOnlyTitle: "Apenas administradores",
    adminOnlyText: "Esta página é exclusiva do administrador da consultoria.",
    colDate: "Data/hora",
    colUser: "Usuário",
    colAction: "Ação",
    colPath: "Caminho",
    colStatus: "Status",
    actView: "Visualizar",
    actCreate: "Criar",
    actEdit: "Editar",
    actDelete: "Excluir",
    actOther: "Outro",
    prev: "‹ Anterior",
    next: "Próxima ›",
    pageOf: (page, total) => `Página ${page} de ${total}`,
    totalRecords: (n) => `${n} ${n === 1 ? "registro" : "registros"}`,
    emptyTitle: "Nenhuma atividade registrada ainda.",
    locale: "pt-BR",
    filterUser: "Usuário",
    filterUserAll: "Todos",
    filterAction: "Ação",
    filterActionAll: "Todas",
    filterFrom: "De",
    filterTo: "Até",
    filterClear: "Limpar",
  },
  en: {
    title: "Activity log",
    subtitle: "History of accesses and actions by users in your consultancy.",
    loading: "Loading...",
    loadError: "Failed to load the activity log.",
    adminOnlyTitle: "Admins only",
    adminOnlyText: "This page is exclusive to the consultancy administrator.",
    colDate: "Date/time",
    colUser: "User",
    colAction: "Action",
    colPath: "Path",
    colStatus: "Status",
    actView: "View",
    actCreate: "Create",
    actEdit: "Edit",
    actDelete: "Delete",
    actOther: "Other",
    prev: "‹ Previous",
    next: "Next ›",
    pageOf: (page, total) => `Page ${page} of ${total}`,
    totalRecords: (n) => `${n} ${n === 1 ? "record" : "records"}`,
    emptyTitle: "No activity recorded yet.",
    locale: "en-US",
    filterUser: "User",
    filterUserAll: "All",
    filterAction: "Action",
    filterActionAll: "All",
    filterFrom: "From",
    filterTo: "To",
    filterClear: "Clear",
  },
  es: {
    title: "Registro de actividad",
    subtitle: "Historial de accesos y acciones de los usuarios de tu consultora.",
    loading: "Cargando...",
    loadError: "Error al cargar el registro de actividad.",
    adminOnlyTitle: "Solo administradores",
    adminOnlyText: "Esta página es exclusiva del administrador de la consultora.",
    colDate: "Fecha/hora",
    colUser: "Usuario",
    colAction: "Acción",
    colPath: "Ruta",
    colStatus: "Estado",
    actView: "Ver",
    actCreate: "Crear",
    actEdit: "Editar",
    actDelete: "Eliminar",
    actOther: "Otro",
    prev: "‹ Anterior",
    next: "Siguiente ›",
    pageOf: (page, total) => `Página ${page} de ${total}`,
    totalRecords: (n) => `${n} ${n === 1 ? "registro" : "registros"}`,
    emptyTitle: "Aún no hay actividad registrada.",
    locale: "es-ES",
    filterUser: "Usuario",
    filterUserAll: "Todos",
    filterAction: "Acción",
    filterActionAll: "Todas",
    filterFrom: "Desde",
    filterTo: "Hasta",
    filterClear: "Limpiar",
  },
};
