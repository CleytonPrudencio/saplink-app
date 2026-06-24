import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  newUser: string;
  cancel: string;
  loading: string;
  loadError: string;
  adminOnlyTitle: string;
  adminOnlyText: string;
  // colunas / badges
  colUser: string;
  colRole: string;
  colScope: string;
  roleAdmin: string;
  roleAnalyst: string;
  roleViewer: string;
  scopeAll: string;
  scopeN: (n: number) => string;
  // form
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  roleLabel: string;
  allClientsToggle: string;
  allClientsHint: string;
  clientsLabel: string;
  noClients: string;
  create: string;
  save: string;
  saving: string;
  createError: string;
  updateError: string;
  // ações
  edit: string;
  remove: string;
  confirmDelete: (name: string) => string;
  deleteError: string;
  // resultado criação
  invitedTitle: string;
  invitedText: string;
  tempPasswordTitle: string;
  tempPasswordText: string;
  copy: string;
  copied: string;
  done: string;
  emptyTitle: string;
  // reset de senha
  resetPassword: string;
  resetting: string;
  resetError: string;
  ssoManaged: string;
  resetInvitedTitle: string;
  resetInvitedText: string;
  resetTempTitle: string;
  resetTempText: string;
  confirmReset: (name: string) => string;
}> = {
  pt: {
    title: "Usuários",
    subtitle: "Gerencie perfis e o escopo de clientes de cada usuário da sua consultoria.",
    newUser: "+ Novo usuário",
    cancel: "Cancelar",
    loading: "Carregando...",
    loadError: "Erro ao carregar usuários.",
    adminOnlyTitle: "Apenas administradores",
    adminOnlyText: "Esta página é exclusiva do administrador da consultoria.",
    colUser: "Usuário",
    colRole: "Papel",
    colScope: "Escopo",
    roleAdmin: "Admin",
    roleAnalyst: "Analista",
    roleViewer: "Consulta",
    scopeAll: "Todos os clientes",
    scopeN: (n) => `${n} ${n === 1 ? "cliente" : "clientes"}`,
    nameLabel: "Nome *",
    namePlaceholder: "Ex.: Maria Silva",
    emailLabel: "E-mail *",
    emailPlaceholder: "pessoa@empresa.com",
    roleLabel: "Papel",
    allClientsToggle: "Todos os clientes",
    allClientsHint: "Quando desligado, escolha quais clientes este usuário pode ver.",
    clientsLabel: "Clientes com acesso",
    noClients: "Nenhum cliente cadastrado.",
    create: "Criar usuário",
    save: "Salvar alterações",
    saving: "Salvando...",
    createError: "Não foi possível criar o usuário.",
    updateError: "Não foi possível salvar as alterações.",
    edit: "Editar",
    remove: "Excluir",
    confirmDelete: (name) => `Excluir o usuário "${name}"? Esta ação não pode ser desfeita.`,
    deleteError: "Não foi possível excluir.",
    invitedTitle: "Convite enviado",
    invitedText: "Um convite por e-mail foi enviado para o usuário definir a senha.",
    tempPasswordTitle: "Senha temporária",
    tempPasswordText: "Compartilhe esta senha com o usuário. Ela não será mostrada novamente.",
    copy: "Copiar",
    copied: "✓ Copiado",
    done: "Concluir",
    emptyTitle: "Nenhum usuário cadastrado ainda.",
    resetPassword: "Redefinir senha",
    resetting: "Redefinindo...",
    resetError: "Não foi possível redefinir a senha.",
    ssoManaged: "Senha gerida via SSO",
    resetInvitedTitle: "Redefinição enviada",
    resetInvitedText: "Um e-mail de convite/redefinição de senha foi enviado ao usuário.",
    resetTempTitle: "Nova senha temporária",
    resetTempText: "Compartilhe esta senha com o usuário. Ela não será mostrada novamente.",
    confirmReset: (name) => `Redefinir a senha de "${name}"?`,
  },
  en: {
    title: "Users",
    subtitle: "Manage roles and the client scope of each user in your consultancy.",
    newUser: "+ New user",
    cancel: "Cancel",
    loading: "Loading...",
    loadError: "Failed to load users.",
    adminOnlyTitle: "Admins only",
    adminOnlyText: "This page is exclusive to the consultancy administrator.",
    colUser: "User",
    colRole: "Role",
    colScope: "Scope",
    roleAdmin: "Admin",
    roleAnalyst: "Analyst",
    roleViewer: "Viewer",
    scopeAll: "All clients",
    scopeN: (n) => `${n} ${n === 1 ? "client" : "clients"}`,
    nameLabel: "Name *",
    namePlaceholder: "e.g. Mary Smith",
    emailLabel: "Email *",
    emailPlaceholder: "person@company.com",
    roleLabel: "Role",
    allClientsToggle: "All clients",
    allClientsHint: "When off, choose which clients this user can see.",
    clientsLabel: "Clients with access",
    noClients: "No clients registered.",
    create: "Create user",
    save: "Save changes",
    saving: "Saving...",
    createError: "Could not create the user.",
    updateError: "Could not save the changes.",
    edit: "Edit",
    remove: "Delete",
    confirmDelete: (name) => `Delete the user "${name}"? This action cannot be undone.`,
    deleteError: "Could not delete.",
    invitedTitle: "Invite sent",
    invitedText: "An email invite was sent for the user to set their password.",
    tempPasswordTitle: "Temporary password",
    tempPasswordText: "Share this password with the user. It will not be shown again.",
    copy: "Copy",
    copied: "✓ Copied",
    done: "Done",
    emptyTitle: "No users registered yet.",
    resetPassword: "Reset password",
    resetting: "Resetting...",
    resetError: "Could not reset the password.",
    ssoManaged: "Password managed via SSO",
    resetInvitedTitle: "Reset sent",
    resetInvitedText: "A password invite/reset email was sent to the user.",
    resetTempTitle: "New temporary password",
    resetTempText: "Share this password with the user. It will not be shown again.",
    confirmReset: (name) => `Reset the password for "${name}"?`,
  },
  es: {
    title: "Usuarios",
    subtitle: "Gestiona los perfiles y el alcance de clientes de cada usuario de tu consultora.",
    newUser: "+ Nuevo usuario",
    cancel: "Cancelar",
    loading: "Cargando...",
    loadError: "Error al cargar los usuarios.",
    adminOnlyTitle: "Solo administradores",
    adminOnlyText: "Esta página es exclusiva del administrador de la consultora.",
    colUser: "Usuario",
    colRole: "Rol",
    colScope: "Alcance",
    roleAdmin: "Admin",
    roleAnalyst: "Analista",
    roleViewer: "Consulta",
    scopeAll: "Todos los clientes",
    scopeN: (n) => `${n} ${n === 1 ? "cliente" : "clientes"}`,
    nameLabel: "Nombre *",
    namePlaceholder: "Ej.: María Pérez",
    emailLabel: "Correo *",
    emailPlaceholder: "persona@empresa.com",
    roleLabel: "Rol",
    allClientsToggle: "Todos los clientes",
    allClientsHint: "Cuando está apagado, elige qué clientes puede ver este usuario.",
    clientsLabel: "Clientes con acceso",
    noClients: "No hay clientes registrados.",
    create: "Crear usuario",
    save: "Guardar cambios",
    saving: "Guardando...",
    createError: "No se pudo crear el usuario.",
    updateError: "No se pudieron guardar los cambios.",
    edit: "Editar",
    remove: "Eliminar",
    confirmDelete: (name) => `¿Eliminar el usuario "${name}"? Esta acción no se puede deshacer.`,
    deleteError: "No se pudo eliminar.",
    invitedTitle: "Invitación enviada",
    invitedText: "Se envió una invitación por correo para que el usuario defina su contraseña.",
    tempPasswordTitle: "Contraseña temporal",
    tempPasswordText: "Comparte esta contraseña con el usuario. No se mostrará de nuevo.",
    copy: "Copiar",
    copied: "✓ Copiado",
    done: "Listo",
    emptyTitle: "Aún no hay usuarios registrados.",
    resetPassword: "Restablecer contraseña",
    resetting: "Restableciendo...",
    resetError: "No se pudo restablecer la contraseña.",
    ssoManaged: "Contraseña gestionada vía SSO",
    resetInvitedTitle: "Restablecimiento enviado",
    resetInvitedText: "Se envió un correo de invitación/restablecimiento de contraseña al usuario.",
    resetTempTitle: "Nueva contraseña temporal",
    resetTempText: "Comparte esta contraseña con el usuario. No se mostrará de nuevo.",
    confirmReset: (name) => `¿Restablecer la contraseña de "${name}"?`,
  },
};
