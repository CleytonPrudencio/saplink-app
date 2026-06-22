import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  loading: string;
  genericError: string;
  loadError: string;
  // Perfil
  profile: string;
  name: string;
  email: string;
  consultancy: string;
  role: string;
  // Marca / white-label
  branding: string;
  displayName: string;
  logoUrl: string;
  primaryColor: string;
  brandSaved: string;
  brandSaveError: string;
  saving: string;
  saveBrand: string;
  // Digest semanal
  digestTitle: string;
  digestDesc: string;
  lastSent: string;
  never: string;
  emailNotConfigured: string;
  aiUnavailable: string;
  previewing: string;
  previewAi: string;
  sending: string;
  sendNow: string;
  previewUnavailable: string;
  previewError: string;
  sentTo: (to: string) => string;
  notSent: string;
  sendError: string;
  // Equipe
  teamUsers: string;
  noUsers: string;
  userCreated: (pwd: string) => string;
  createUserError: string;
  removeError: string;
  removeConfirm: (name: string) => string;
  removeUserAria: (name: string) => string;
  namePlaceholder: string;
  emailPlaceholder: string;
  roleUser: string;
  roleAdmin: string;
  adding: string;
  addUser: string;
}> = {
  pt: {
    title: "Configuracoes",
    loading: "Carregando...",
    genericError: "Erro.",
    loadError: "Erro ao carregar dados do usuario.",
    profile: "Perfil",
    name: "Nome",
    email: "Email",
    consultancy: "Consultoria",
    role: "Papel",
    branding: "Marca (white-label)",
    displayName: "Nome exibido",
    logoUrl: "URL do logo (PNG/SVG)",
    primaryColor: "Cor primária",
    brandSaved: "Marca atualizada. Recarregue para ver no menu.",
    brandSaveError: "Não foi possível salvar a marca.",
    saving: "Salvando...",
    saveBrand: "Salvar marca",
    digestTitle: "📬 Digest semanal por IA",
    digestDesc: "Toda semana, um resumo de saúde da carteira narrado pela IA é enviado por e-mail aos admins.",
    lastSent: "Último envio:",
    never: "nunca",
    emailNotConfigured: "⚠️ E-mail não configurado (RESEND_API_KEY ausente) — o envio fica em modo log.",
    aiUnavailable: "⚠️ IA indisponível — o digest sai só com os números.",
    previewing: "Gerando...",
    previewAi: "Ver prévia da IA",
    sending: "Enviando...",
    sendNow: "Enviar agora",
    previewUnavailable: "(IA indisponível — o e-mail traz os números mesmo assim.)",
    previewError: "Erro ao gerar prévia.",
    sentTo: (to) => `Enviado para: ${to}`,
    notSent: "Não enviado.",
    sendError: "Erro ao enviar o digest.",
    teamUsers: "Usuários da equipe",
    noUsers: "Nenhum usuário ainda.",
    userCreated: (pwd) => `Usuário criado. Senha temporária: ${pwd}`,
    createUserError: "Não foi possível criar o usuário.",
    removeError: "Não foi possível remover.",
    removeConfirm: (name) => `Remover ${name}?`,
    removeUserAria: (name) => `Remover ${name}`,
    namePlaceholder: "Nome",
    emailPlaceholder: "email@empresa.com",
    roleUser: "Usuário",
    roleAdmin: "Admin",
    adding: "...",
    addUser: "Adicionar",
  },
  en: {
    title: "Settings",
    loading: "Loading...",
    genericError: "Error.",
    loadError: "Failed to load user data.",
    profile: "Profile",
    name: "Name",
    email: "Email",
    consultancy: "Consultancy",
    role: "Role",
    branding: "Branding (white-label)",
    displayName: "Display name",
    logoUrl: "Logo URL (PNG/SVG)",
    primaryColor: "Primary color",
    brandSaved: "Branding updated. Reload to see it in the menu.",
    brandSaveError: "Could not save branding.",
    saving: "Saving...",
    saveBrand: "Save branding",
    digestTitle: "📬 Weekly AI digest",
    digestDesc: "Every week, an AI-narrated portfolio health summary is emailed to admins.",
    lastSent: "Last sent:",
    never: "never",
    emailNotConfigured: "⚠️ Email not configured (RESEND_API_KEY missing) — sending stays in log mode.",
    aiUnavailable: "⚠️ AI unavailable — the digest goes out with the numbers only.",
    previewing: "Generating...",
    previewAi: "Preview the AI",
    sending: "Sending...",
    sendNow: "Send now",
    previewUnavailable: "(AI unavailable — the email still includes the numbers.)",
    previewError: "Failed to generate preview.",
    sentTo: (to) => `Sent to: ${to}`,
    notSent: "Not sent.",
    sendError: "Failed to send the digest.",
    teamUsers: "Team members",
    noUsers: "No users yet.",
    userCreated: (pwd) => `User created. Temporary password: ${pwd}`,
    createUserError: "Could not create the user.",
    removeError: "Could not remove.",
    removeConfirm: (name) => `Remove ${name}?`,
    removeUserAria: (name) => `Remove ${name}`,
    namePlaceholder: "Name",
    emailPlaceholder: "email@company.com",
    roleUser: "User",
    roleAdmin: "Admin",
    adding: "...",
    addUser: "Add",
  },
  es: {
    title: "Configuración",
    loading: "Cargando...",
    genericError: "Error.",
    loadError: "Error al cargar los datos del usuario.",
    profile: "Perfil",
    name: "Nombre",
    email: "Email",
    consultancy: "Consultoría",
    role: "Rol",
    branding: "Marca (white-label)",
    displayName: "Nombre mostrado",
    logoUrl: "URL del logo (PNG/SVG)",
    primaryColor: "Color primario",
    brandSaved: "Marca actualizada. Recarga para verla en el menú.",
    brandSaveError: "No se pudo guardar la marca.",
    saving: "Guardando...",
    saveBrand: "Guardar marca",
    digestTitle: "📬 Resumen semanal por IA",
    digestDesc: "Cada semana, un resumen de salud de la cartera narrado por la IA se envía por correo a los administradores.",
    lastSent: "Último envío:",
    never: "nunca",
    emailNotConfigured: "⚠️ Correo no configurado (RESEND_API_KEY ausente) — el envío queda en modo log.",
    aiUnavailable: "⚠️ IA no disponible — el resumen sale solo con los números.",
    previewing: "Generando...",
    previewAi: "Ver vista previa de la IA",
    sending: "Enviando...",
    sendNow: "Enviar ahora",
    previewUnavailable: "(IA no disponible — el correo incluye los números de todos modos.)",
    previewError: "Error al generar la vista previa.",
    sentTo: (to) => `Enviado a: ${to}`,
    notSent: "No enviado.",
    sendError: "Error al enviar el resumen.",
    teamUsers: "Usuarios del equipo",
    noUsers: "Ningún usuario todavía.",
    userCreated: (pwd) => `Usuario creado. Contraseña temporal: ${pwd}`,
    createUserError: "No se pudo crear el usuario.",
    removeError: "No se pudo eliminar.",
    removeConfirm: (name) => `¿Eliminar ${name}?`,
    removeUserAria: (name) => `Eliminar ${name}`,
    namePlaceholder: "Nombre",
    emailPlaceholder: "email@empresa.com",
    roleUser: "Usuario",
    roleAdmin: "Admin",
    adding: "...",
    addUser: "Agregar",
  },
};
