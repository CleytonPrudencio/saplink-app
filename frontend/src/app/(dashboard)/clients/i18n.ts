import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  newClient: string;
  cancel: string;
  explainLabel: string;
  loading: string;
  loadError: string;
  nameLabel: string;
  namePlaceholder: string;
  cnpjLabel: string;
  cnpjPlaceholder: string;
  createError: string;
  saving: string;
  createClient: string;
  integrations: string;
  alerts: string;
  portalAria: (name: string) => string;
  portalTitle: string;
  deleteAria: (name: string) => string;
  deleteTitle: string;
  confirmDelete: (name: string) => string;
  deleteError: string;
  portalLoading: string;
  portalActive: string;
  copy: string;
  disablePortal: string;
  portalPitch: string;
  enablePortal: string;
  statusTitle: string;
  portalShort: string;
  statusShort: string;
  statusAria: (name: string) => string;
  statusActive: string;
  statusPitch: string;
  enableStatus: string;
  disableStatus: string;
  noClients: string;
  registerFirst: string;
}> = {
  pt: {
    title: "Clientes",
    newClient: "+ Novo cliente",
    cancel: "Cancelar",
    explainLabel: "Priorizar a carteira (IA)",
    loading: "Carregando...",
    loadError: "Erro ao carregar clientes.",
    nameLabel: "Nome do cliente *",
    namePlaceholder: "Ex.: Indústria Acme",
    cnpjLabel: "CNPJ (opcional)",
    cnpjPlaceholder: "00.000.000/0001-00",
    createError: "Não foi possível criar o cliente.",
    saving: "Salvando...",
    createClient: "Criar cliente",
    integrations: "integracoes",
    alerts: "alertas",
    portalAria: (name) => `Portal de ${name}`,
    portalTitle: "Portal do cliente",
    deleteAria: (name) => `Excluir ${name}`,
    deleteTitle: "Excluir cliente",
    confirmDelete: (name) => `Excluir o cliente "${name}"? Esta ação não pode ser desfeita.`,
    deleteError: "Não foi possível excluir.",
    portalLoading: "Carregando portal...",
    portalActive: "Portal ativo (read-only para o cliente).",
    copy: "Copiar",
    disablePortal: "Desativar portal",
    portalPitch: "Gere um link público read-only com a saúde deste cliente (white-label).",
    enablePortal: "Ativar portal do cliente",
    statusTitle: "Status page",
    portalShort: "Portal",
    statusShort: "Status",
    statusAria: (name) => `Status page de ${name}`,
    statusActive: "Status page ativo (público, com sua marca).",
    statusPitch: "Gere uma página pública de saúde das integrações deste cliente, com a sua marca.",
    enableStatus: "Ativar status page",
    disableStatus: "Desativar status page",
    noClients: "Nenhum cliente cadastrado ainda.",
    registerFirst: "+ Cadastrar primeiro cliente",
  },
  en: {
    title: "Clients",
    newClient: "+ New client",
    cancel: "Cancel",
    explainLabel: "Prioritize the portfolio (AI)",
    loading: "Loading...",
    loadError: "Failed to load clients.",
    nameLabel: "Client name *",
    namePlaceholder: "e.g. Acme Industries",
    cnpjLabel: "CNPJ (optional)",
    cnpjPlaceholder: "00.000.000/0001-00",
    createError: "Could not create the client.",
    saving: "Saving...",
    createClient: "Create client",
    integrations: "integrations",
    alerts: "alerts",
    portalAria: (name) => `${name}'s portal`,
    portalTitle: "Client portal",
    deleteAria: (name) => `Delete ${name}`,
    deleteTitle: "Delete client",
    confirmDelete: (name) => `Delete the client "${name}"? This action cannot be undone.`,
    deleteError: "Could not delete.",
    portalLoading: "Loading portal...",
    portalActive: "Portal active (read-only for the client).",
    copy: "Copy",
    disablePortal: "Disable portal",
    portalPitch: "Generate a public read-only link with this client's health (white-label).",
    enablePortal: "Enable client portal",
    statusTitle: "Status page",
    portalShort: "Portal",
    statusShort: "Status",
    statusAria: (name) => `${name}'s status page`,
    statusActive: "Status page active (public, your brand).",
    statusPitch: "Generate a public health page for this client's integrations, with your brand.",
    enableStatus: "Enable status page",
    disableStatus: "Disable status page",
    noClients: "No clients registered yet.",
    registerFirst: "+ Register first client",
  },
  es: {
    title: "Clientes",
    newClient: "+ Nuevo cliente",
    cancel: "Cancelar",
    explainLabel: "Priorizar la cartera (IA)",
    loading: "Cargando...",
    loadError: "Error al cargar los clientes.",
    nameLabel: "Nombre del cliente *",
    namePlaceholder: "Ej.: Industria Acme",
    cnpjLabel: "CNPJ (opcional)",
    cnpjPlaceholder: "00.000.000/0001-00",
    createError: "No se pudo crear el cliente.",
    saving: "Guardando...",
    createClient: "Crear cliente",
    integrations: "integraciones",
    alerts: "alertas",
    portalAria: (name) => `Portal de ${name}`,
    portalTitle: "Portal del cliente",
    deleteAria: (name) => `Eliminar ${name}`,
    deleteTitle: "Eliminar cliente",
    confirmDelete: (name) => `¿Eliminar el cliente "${name}"? Esta acción no se puede deshacer.`,
    deleteError: "No se pudo eliminar.",
    portalLoading: "Cargando portal...",
    portalActive: "Portal activo (solo lectura para el cliente).",
    copy: "Copiar",
    disablePortal: "Desactivar portal",
    portalPitch: "Genera un enlace público de solo lectura con la salud de este cliente (white-label).",
    enablePortal: "Activar portal del cliente",
    statusTitle: "Status page",
    portalShort: "Portal",
    statusShort: "Status",
    statusAria: (name) => `Status page de ${name}`,
    statusActive: "Status page activo (público, con tu marca).",
    statusPitch: "Genera una página pública de salud de las integraciones de este cliente, con tu marca.",
    enableStatus: "Activar status page",
    disableStatus: "Desactivar status page",
    noClients: "Aún no hay clientes registrados.",
    registerFirst: "+ Registrar el primer cliente",
  },
};
