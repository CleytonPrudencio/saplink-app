import type { Lang } from "@/i18n/I18n";

export const T: Record<
  Lang,
  {
    loading: string;
    loadError: string;
    notFound: string;
    back: string;
    editProfile: string;
    reactivateAccess: string;
    suspendAccess: string;
    accessSuspended: string;
    accessReactivated: string;
    accessOpFail: string;
    // subscription card
    subscription: string;
    status: string;
    plan: string;
    monthlyFee: string;
    cnpj: string;
    dash: string;
    // users card
    users: (n: number) => string;
    manage: string;
    noUsers: string;
    // clients card
    clients: (n: number, integrations: number) => string;
    health: string;
    noClients: string;
    // invoices card
    invoices: string;
    noInvoices: string;
    // modal: edit consultancy
    editConsTitle: string;
    name: string;
    cnpjPlaceholder: string;
    cancel: string;
    save: string;
    consSaved: string;
    saveFail: string;
    // modal: edit user
    editUserTitle: string;
    email: string;
    role: string;
    roleConsAdmin: string;
    roleConsUser: string;
    resetPassword: string;
    userSaved: string;
    tempPasswordMsg: (email: string, pwd: string) => string;
    resetPwdFail: string;
    // modal: client detail
    healthScore: string;
    integrationsLabel: string;
    openAlerts: string;
    clientLoadError: string;
    integrationsHeading: string;
    noIntegrations: string;
    latency: string;
    error: string;
    uptime: string;
    config: string;
    openAlertsHeading: string;
    // subscription status labels
    statusLabel: {
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
    loading: "Carregando...",
    loadError: "Erro ao carregar detalhes.",
    notFound: "Consultoria não encontrada.",
    back: "← Voltar",
    editProfile: "Editar cadastro",
    reactivateAccess: "Reativar acesso",
    suspendAccess: "Suspender acesso",
    accessSuspended: "Acesso suspenso.",
    accessReactivated: "Acesso reativado.",
    accessOpFail: "Operação falhou.",
    subscription: "Assinatura",
    status: "Status",
    plan: "Plano",
    monthlyFee: "Mensalidade",
    cnpj: "CNPJ",
    dash: "-",
    users: (n) => `Usuários (${n})`,
    manage: "Gerenciar",
    noUsers: "Nenhum usuário.",
    clients: (n, integrations) => `Clientes (${n}) · ${integrations} integrações`,
    health: "health",
    noClients: "Nenhum cliente.",
    invoices: "Faturas",
    noInvoices: "Nenhuma fatura ainda.",
    editConsTitle: "Editar cadastro da consultoria",
    name: "Nome",
    cnpjPlaceholder: "00.000.000/0001-00",
    cancel: "Cancelar",
    save: "Salvar",
    consSaved: "Cadastro atualizado.",
    saveFail: "Falha ao salvar.",
    editUserTitle: "Gerenciar usuário",
    email: "E-mail",
    role: "Papel",
    roleConsAdmin: "Admin da consultoria",
    roleConsUser: "Usuário",
    resetPassword: "Resetar senha",
    userSaved: "Usuário atualizado.",
    tempPasswordMsg: (email, pwd) => `Senha temporária de ${email}: ${pwd}`,
    resetPwdFail: "Falha ao resetar senha.",
    healthScore: "Health score",
    integrationsLabel: "Integrações",
    openAlerts: "Alertas abertos",
    clientLoadError: "Erro ao carregar cliente.",
    integrationsHeading: "Integrações",
    noIntegrations: "Nenhuma integração.",
    latency: "Latência",
    error: "Erro",
    uptime: "Uptime",
    config: "Configuração (segredos mascarados)",
    openAlertsHeading: "Alertas abertos",
    statusLabel: {
      TRIALING: "Em teste",
      ACTIVE: "Ativa",
      PAST_DUE: "Pagamento pendente",
      SUSPENDED: "Suspensa",
      CANCELED: "Cancelada",
    },
    locale: "pt-BR",
  },
  en: {
    loading: "Loading...",
    loadError: "Error loading details.",
    notFound: "Consultancy not found.",
    back: "← Back",
    editProfile: "Edit profile",
    reactivateAccess: "Reactivate access",
    suspendAccess: "Suspend access",
    accessSuspended: "Access suspended.",
    accessReactivated: "Access reactivated.",
    accessOpFail: "Operation failed.",
    subscription: "Subscription",
    status: "Status",
    plan: "Plan",
    monthlyFee: "Monthly fee",
    cnpj: "Tax ID (CNPJ)",
    dash: "-",
    users: (n) => `Users (${n})`,
    manage: "Manage",
    noUsers: "No users.",
    clients: (n, integrations) => `Clients (${n}) · ${integrations} integrations`,
    health: "health",
    noClients: "No clients.",
    invoices: "Invoices",
    noInvoices: "No invoices yet.",
    editConsTitle: "Edit consultancy profile",
    name: "Name",
    cnpjPlaceholder: "00.000.000/0001-00",
    cancel: "Cancel",
    save: "Save",
    consSaved: "Profile updated.",
    saveFail: "Failed to save.",
    editUserTitle: "Manage user",
    email: "Email",
    role: "Role",
    roleConsAdmin: "Consultancy admin",
    roleConsUser: "User",
    resetPassword: "Reset password",
    userSaved: "User updated.",
    tempPasswordMsg: (email, pwd) => `Temporary password for ${email}: ${pwd}`,
    resetPwdFail: "Failed to reset password.",
    healthScore: "Health score",
    integrationsLabel: "Integrations",
    openAlerts: "Open alerts",
    clientLoadError: "Error loading client.",
    integrationsHeading: "Integrations",
    noIntegrations: "No integrations.",
    latency: "Latency",
    error: "Error",
    uptime: "Uptime",
    config: "Configuration (secrets masked)",
    openAlertsHeading: "Open alerts",
    statusLabel: {
      TRIALING: "Trialing",
      ACTIVE: "Active",
      PAST_DUE: "Past due",
      SUSPENDED: "Suspended",
      CANCELED: "Canceled",
    },
    locale: "en-US",
  },
  es: {
    loading: "Cargando...",
    loadError: "Error al cargar los detalles.",
    notFound: "Consultora no encontrada.",
    back: "← Volver",
    editProfile: "Editar registro",
    reactivateAccess: "Reactivar acceso",
    suspendAccess: "Suspender acceso",
    accessSuspended: "Acceso suspendido.",
    accessReactivated: "Acceso reactivado.",
    accessOpFail: "La operación falló.",
    subscription: "Suscripción",
    status: "Estado",
    plan: "Plan",
    monthlyFee: "Mensualidad",
    cnpj: "CNPJ",
    dash: "-",
    users: (n) => `Usuarios (${n})`,
    manage: "Gestionar",
    noUsers: "Sin usuarios.",
    clients: (n, integrations) => `Clientes (${n}) · ${integrations} integraciones`,
    health: "health",
    noClients: "Sin clientes.",
    invoices: "Facturas",
    noInvoices: "Aún no hay facturas.",
    editConsTitle: "Editar registro de la consultora",
    name: "Nombre",
    cnpjPlaceholder: "00.000.000/0001-00",
    cancel: "Cancelar",
    save: "Guardar",
    consSaved: "Registro actualizado.",
    saveFail: "Error al guardar.",
    editUserTitle: "Gestionar usuario",
    email: "Correo electrónico",
    role: "Rol",
    roleConsAdmin: "Admin de la consultora",
    roleConsUser: "Usuario",
    resetPassword: "Restablecer contraseña",
    userSaved: "Usuario actualizado.",
    tempPasswordMsg: (email, pwd) => `Contraseña temporal de ${email}: ${pwd}`,
    resetPwdFail: "Error al restablecer la contraseña.",
    healthScore: "Health score",
    integrationsLabel: "Integraciones",
    openAlerts: "Alertas abiertas",
    clientLoadError: "Error al cargar el cliente.",
    integrationsHeading: "Integraciones",
    noIntegrations: "Sin integraciones.",
    latency: "Latencia",
    error: "Error",
    uptime: "Uptime",
    config: "Configuración (secretos enmascarados)",
    openAlertsHeading: "Alertas abiertas",
    statusLabel: {
      TRIALING: "En prueba",
      ACTIVE: "Activa",
      PAST_DUE: "Pago pendiente",
      SUSPENDED: "Suspendida",
      CANCELED: "Cancelada",
    },
    locale: "es-419",
  },
};
