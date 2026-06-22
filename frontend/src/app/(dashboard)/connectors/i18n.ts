import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  envPrefix: string;
  subtitle: string;
  adminOnly: string;
  registerClientsFirst: string;
  keyConfigured: string;
  noKey: string;
  lastSync: (when: string) => string;
  records: (n: number) => string;
  ok: string;
  httpStatus: (status: string) => string;
  apiKeyPlaceholder: string;
  saving: string;
  save: string;
  cancel: string;
  edit: string;
  connect: string;
  syncing: string;
  sync: string;
  syncResult: (reachable: number, total: number) => string;
  error: string;
  syncError: string;
  loading: string;
}> = {
  pt: {
    title: "Conectores SAP Cloud",
    envPrefix: "Configurando",
    subtitle: "Conecte Ariba e SuccessFactors de cada cliente com a chave dele (igual ao S/4), por ambiente. As APIs alcançadas entram no inventário (Catálogo vivo).",
    adminOnly: "Apenas administradores conectam produtos.",
    registerClientsFirst: "Cadastre clientes primeiro.",
    keyConfigured: "Chave configurada",
    noKey: "Sem chave",
    lastSync: (when) => ` · último sync ${when}`,
    records: (n) => `${n} reg.`,
    ok: "OK",
    httpStatus: (status) => `HTTP ${status}`,
    apiKeyPlaceholder: "API Key do cliente",
    saving: "…",
    save: "Salvar",
    cancel: "Cancelar",
    edit: "Editar",
    connect: "Conectar",
    syncing: "Sincronizando…",
    sync: "Sincronizar",
    syncResult: (reachable, total) => `Sync: ${reachable}/${total} APIs alcançadas`,
    error: "Erro.",
    syncError: "Erro no sync.",
    loading: "Carregando...",
  },
  en: {
    title: "SAP Cloud Connectors",
    envPrefix: "Configuring",
    subtitle: "Connect each client's Ariba and SuccessFactors with their own key (just like S/4), per environment. Reached APIs go into the inventory (live Catalog).",
    adminOnly: "Only administrators can connect products.",
    registerClientsFirst: "Register clients first.",
    keyConfigured: "Key configured",
    noKey: "No key",
    lastSync: (when) => ` · last sync ${when}`,
    records: (n) => `${n} rec.`,
    ok: "OK",
    httpStatus: (status) => `HTTP ${status}`,
    apiKeyPlaceholder: "Client API Key",
    saving: "…",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    connect: "Connect",
    syncing: "Syncing…",
    sync: "Sync",
    syncResult: (reachable, total) => `Sync: ${reachable}/${total} APIs reached`,
    error: "Error.",
    syncError: "Sync error.",
    loading: "Loading...",
  },
  es: {
    title: "Conectores SAP Cloud",
    envPrefix: "Configurando",
    subtitle: "Conecta Ariba y SuccessFactors de cada cliente con su propia clave (igual que S/4), por ambiente. Las APIs alcanzadas entran al inventario (Catálogo vivo).",
    adminOnly: "Solo los administradores conectan productos.",
    registerClientsFirst: "Registra los clientes primero.",
    keyConfigured: "Clave configurada",
    noKey: "Sin clave",
    lastSync: (when) => ` · último sync ${when}`,
    records: (n) => `${n} reg.`,
    ok: "OK",
    httpStatus: (status) => `HTTP ${status}`,
    apiKeyPlaceholder: "API Key del cliente",
    saving: "…",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    connect: "Conectar",
    syncing: "Sincronizando…",
    sync: "Sincronizar",
    syncResult: (reachable, total) => `Sync: ${reachable}/${total} APIs alcanzadas`,
    error: "Error.",
    syncError: "Error en el sync.",
    loading: "Cargando...",
  },
};
