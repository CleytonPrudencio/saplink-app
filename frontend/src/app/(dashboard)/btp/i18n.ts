import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  add: string;
  cancel: string;
  total: string;
  expired: string;
  warn: string;
  down: string;
  clientPlaceholder: string;
  namePlaceholder: string;
  subaccountPlaceholder: string;
  detailPlaceholder: string;
  expiresLabel: string;
  addBtn: string;
  error: string;
  loading: string;
  colClient: string;
  colKind: string;
  colResource: string;
  colSubaccount: string;
  colExpires: string;
  colStatus: string;
  removeConfirm: string;
  empty: string;
}> = {
  pt: {
    title: "BTP Cockpit",
    subtitle: "Inventário e radar de validade dos recursos da SAP BTP de cada cliente: service keys, bindings, destinations, quotas e apps. Evita o apagão por secret/destination vencida.",
    add: "+ Adicionar recurso",
    cancel: "Cancelar",
    total: "Total",
    expired: "Expirados",
    warn: "Vencem ≤30d",
    down: "Indisponíveis",
    clientPlaceholder: "Cliente…",
    namePlaceholder: "Nome (ex.: cpi-iflow-key, S4_DEST)",
    subaccountPlaceholder: "Subaccount (opcional)",
    detailPlaceholder: "Detalhe (opcional)",
    expiresLabel: "Vence em",
    addBtn: "Adicionar",
    error: "Erro.",
    loading: "Carregando...",
    colClient: "Cliente",
    colKind: "Tipo",
    colResource: "Recurso",
    colSubaccount: "Subaccount",
    colExpires: "Vence",
    colStatus: "Status",
    removeConfirm: "Remover?",
    empty: "Sem recursos BTP. Adicione service keys, destinations e quotas dos clientes para acompanhar a validade.",
  },
  en: {
    title: "BTP Cockpit",
    subtitle: "Inventory and expiration radar for each client's SAP BTP resources: service keys, bindings, destinations, quotas and apps. Avoids outages from an expired secret/destination.",
    add: "+ Add resource",
    cancel: "Cancel",
    total: "Total",
    expired: "Expired",
    warn: "Expiring ≤30d",
    down: "Unavailable",
    clientPlaceholder: "Client…",
    namePlaceholder: "Name (e.g.: cpi-iflow-key, S4_DEST)",
    subaccountPlaceholder: "Subaccount (optional)",
    detailPlaceholder: "Detail (optional)",
    expiresLabel: "Expires on",
    addBtn: "Add",
    error: "Error.",
    loading: "Loading...",
    colClient: "Client",
    colKind: "Type",
    colResource: "Resource",
    colSubaccount: "Subaccount",
    colExpires: "Expires",
    colStatus: "Status",
    removeConfirm: "Remove?",
    empty: "No BTP resources. Add clients' service keys, destinations and quotas to track expiration.",
  },
  es: {
    title: "BTP Cockpit",
    subtitle: "Inventario y radar de vencimiento de los recursos de SAP BTP de cada cliente: service keys, bindings, destinations, quotas y apps. Evita la caída por un secret/destination vencido.",
    add: "+ Agregar recurso",
    cancel: "Cancelar",
    total: "Total",
    expired: "Vencidos",
    warn: "Vencen ≤30d",
    down: "No disponibles",
    clientPlaceholder: "Cliente…",
    namePlaceholder: "Nombre (ej.: cpi-iflow-key, S4_DEST)",
    subaccountPlaceholder: "Subaccount (opcional)",
    detailPlaceholder: "Detalle (opcional)",
    expiresLabel: "Vence el",
    addBtn: "Agregar",
    error: "Error.",
    loading: "Cargando...",
    colClient: "Cliente",
    colKind: "Tipo",
    colResource: "Recurso",
    colSubaccount: "Subaccount",
    colExpires: "Vence",
    colStatus: "Estado",
    removeConfirm: "¿Eliminar?",
    empty: "Sin recursos BTP. Agrega service keys, destinations y quotas de los clientes para controlar el vencimiento.",
  },
};
