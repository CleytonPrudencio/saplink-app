import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  adminOnly: string;
  providerLabel: string;
  registerRedirect: string;
  clientId: string;
  clientSecret: string;
  secretSaved: string;
  issuer: string;
  example: (hint: string) => string;
  emailDomain: string;
  emailDomainPlaceholder: string;
  emailDomainHint: (domain: string) => string;
  enableSso: string;
  saving: string;
  saveSso: string;
  saved: string;
  saveError: string;
  providers: {
    azure: { label: string; doc: string };
    google: { label: string; doc: string };
    okta: { label: string; doc: string };
  };
}> = {
  pt: {
    title: "SSO / Login corporativo",
    subtitle: "Conecte seu provedor de identidade (Azure AD, Google ou Okta) e seu time entra com a conta da empresa. Os usuários precisam já existir no SAPLINK (mesmo e-mail).",
    adminOnly: "Apenas administradores configuram o SSO.",
    providerLabel: "Provedor",
    registerRedirect: "Cadastre este Redirect URI no seu IdP:",
    clientId: "Client ID",
    clientSecret: "Client Secret",
    secretSaved: "(salvo — deixe em branco p/ manter)",
    issuer: "Issuer (OIDC)",
    example: (hint) => `Ex.: ${hint}`,
    emailDomain: "Domínio de e-mail",
    emailDomainPlaceholder: "suaempresa.com",
    emailDomainHint: (domain) => `Quem digitar um e-mail @${domain} na tela de login será direcionado a este IdP.`,
    enableSso: "Habilitar SSO para esta conta",
    saving: "Salvando…",
    saveSso: "Salvar SSO",
    saved: "SSO salvo.",
    saveError: "Erro ao salvar.",
    providers: {
      azure: { label: "Microsoft / Azure AD (Entra ID)", doc: "Entra ID → App registrations → Redirect URI (Web) → adicione o callback abaixo. Issuer usa o Directory (tenant) ID." },
      google: { label: "Google Workspace", doc: "Google Cloud Console → APIs & Services → Credentials → OAuth client (Web). Adicione o redirect URI abaixo. Issuer é fixo." },
      okta: { label: "Okta", doc: "Okta Admin → Applications → Create App Integration → OIDC Web. Adicione o redirect URI abaixo no Sign-in redirect URIs." },
    },
  },
  en: {
    title: "SSO / Corporate login",
    subtitle: "Connect your identity provider (Azure AD, Google or Okta) and your team logs in with the company account. Users must already exist in SAPLINK (same email).",
    adminOnly: "Only administrators configure SSO.",
    providerLabel: "Provider",
    registerRedirect: "Register this Redirect URI in your IdP:",
    clientId: "Client ID",
    clientSecret: "Client Secret",
    secretSaved: "(saved — leave blank to keep)",
    issuer: "Issuer (OIDC)",
    example: (hint) => `e.g.: ${hint}`,
    emailDomain: "Email domain",
    emailDomainPlaceholder: "yourcompany.com",
    emailDomainHint: (domain) => `Anyone entering an @${domain} email on the login screen will be routed to this IdP.`,
    enableSso: "Enable SSO for this account",
    saving: "Saving…",
    saveSso: "Save SSO",
    saved: "SSO saved.",
    saveError: "Failed to save.",
    providers: {
      azure: { label: "Microsoft / Azure AD (Entra ID)", doc: "Entra ID → App registrations → Redirect URI (Web) → add the callback below. Issuer uses the Directory (tenant) ID." },
      google: { label: "Google Workspace", doc: "Google Cloud Console → APIs & Services → Credentials → OAuth client (Web). Add the redirect URI below. Issuer is fixed." },
      okta: { label: "Okta", doc: "Okta Admin → Applications → Create App Integration → OIDC Web. Add the redirect URI below under Sign-in redirect URIs." },
    },
  },
  es: {
    title: "SSO / Inicio de sesión corporativo",
    subtitle: "Conecta tu proveedor de identidad (Azure AD, Google u Okta) y tu equipo inicia sesión con la cuenta de la empresa. Los usuarios deben existir ya en SAPLINK (mismo correo).",
    adminOnly: "Solo los administradores configuran el SSO.",
    providerLabel: "Proveedor",
    registerRedirect: "Registra este Redirect URI en tu IdP:",
    clientId: "Client ID",
    clientSecret: "Client Secret",
    secretSaved: "(guardado — déjalo en blanco para mantener)",
    issuer: "Issuer (OIDC)",
    example: (hint) => `Ej.: ${hint}`,
    emailDomain: "Dominio de correo",
    emailDomainPlaceholder: "tuempresa.com",
    emailDomainHint: (domain) => `Quien ingrese un correo @${domain} en la pantalla de inicio de sesión será dirigido a este IdP.`,
    enableSso: "Habilitar SSO para esta cuenta",
    saving: "Guardando…",
    saveSso: "Guardar SSO",
    saved: "SSO guardado.",
    saveError: "Error al guardar.",
    providers: {
      azure: { label: "Microsoft / Azure AD (Entra ID)", doc: "Entra ID → App registrations → Redirect URI (Web) → agrega el callback de abajo. El Issuer usa el Directory (tenant) ID." },
      google: { label: "Google Workspace", doc: "Google Cloud Console → APIs & Services → Credentials → OAuth client (Web). Agrega el redirect URI de abajo. El Issuer es fijo." },
      okta: { label: "Okta", doc: "Okta Admin → Applications → Create App Integration → OIDC Web. Agrega el redirect URI de abajo en Sign-in redirect URIs." },
    },
  },
};
