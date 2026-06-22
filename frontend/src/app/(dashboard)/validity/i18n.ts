import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  refreshAll: string;
  refreshing: string;
  explainScreen: string;
  explainLabel: string;
  sevExpired: string;
  sevCritical: string;
  sevWarn: string;
  sevOk: string;
  loading: string;
  empty: string;
  certTls: string;
  refreshRow: string;
  registerTitle: string;
  registerHint: string;
  integrationPlaceholder: string;
  secretLabelPlaceholder: string;
  saveSecret: string;
  saving: string;
  checkedMsg: (checked: number, expiring: number) => string;
  refreshAllError: string;
  secretSaved: string;
  secretError: string;
  expiredAgo: (n: number) => string;
  expiresToday: string;
  daysLeft: (n: number) => string;
}> = {
  pt: {
    title: "Radar de validade",
    subtitle: "Certificados TLS (detectados automaticamente) e segredos com expiração — antes de virarem incidente.",
    refreshAll: "Reavaliar certificados",
    refreshing: "Verificando...",
    explainScreen: "Radar de validade (certificados/segredos)",
    explainLabel: "O que renovar primeiro (IA)",
    sevExpired: "Expirado",
    sevCritical: "Crítico",
    sevWarn: "Atenção",
    sevOk: "OK",
    loading: "Carregando...",
    empty: "Nenhuma validade monitorada ainda. Reavalie os certificados ou registre a expiração de um segredo abaixo.",
    certTls: "Certificado TLS",
    refreshRow: "Reavaliar",
    registerTitle: "Registrar validade de um segredo",
    registerHint: "Para o que a plataforma não lê sozinha: senha de usuário RFC, client secret OAuth, certificado SNC.",
    integrationPlaceholder: "Integração...",
    secretLabelPlaceholder: "Ex.: Senha do usuário RFC",
    saveSecret: "Registrar validade",
    saving: "Salvando...",
    checkedMsg: (checked, expiring) => `Verificados ${checked} certificado(s); ${expiring} expirando em breve.`,
    refreshAllError: "Erro ao reavaliar certificados.",
    secretSaved: "Validade do segredo registrada.",
    secretError: "Erro ao registrar a validade do segredo.",
    expiredAgo: (n) => `expirou há ${n} dia(s)`,
    expiresToday: "expira hoje",
    daysLeft: (n) => `${n} dia(s)`,
  },
  en: {
    title: "Validity radar",
    subtitle: "TLS certificates (auto-detected) and expiring secrets — before they turn into an incident.",
    refreshAll: "Recheck certificates",
    refreshing: "Checking...",
    explainScreen: "Validity radar (certificates/secrets)",
    explainLabel: "What to renew first (AI)",
    sevExpired: "Expired",
    sevCritical: "Critical",
    sevWarn: "Warning",
    sevOk: "OK",
    loading: "Loading...",
    empty: "No validity monitored yet. Recheck the certificates or register a secret's expiration below.",
    certTls: "TLS certificate",
    refreshRow: "Recheck",
    registerTitle: "Register a secret's expiration",
    registerHint: "For what the platform can't read on its own: RFC user password, OAuth client secret, SNC certificate.",
    integrationPlaceholder: "Integration...",
    secretLabelPlaceholder: "E.g.: RFC user password",
    saveSecret: "Register expiration",
    saving: "Saving...",
    checkedMsg: (checked, expiring) => `Checked ${checked} certificate(s); ${expiring} expiring soon.`,
    refreshAllError: "Failed to recheck certificates.",
    secretSaved: "Secret expiration registered.",
    secretError: "Failed to register the secret's expiration.",
    expiredAgo: (n) => `expired ${n} day(s) ago`,
    expiresToday: "expires today",
    daysLeft: (n) => `${n} day(s)`,
  },
  es: {
    title: "Radar de validez",
    subtitle: "Certificados TLS (detectados automáticamente) y secretos con expiración — antes de que se vuelvan un incidente.",
    refreshAll: "Reevaluar certificados",
    refreshing: "Verificando...",
    explainScreen: "Radar de validez (certificados/secretos)",
    explainLabel: "Qué renovar primero (IA)",
    sevExpired: "Expirado",
    sevCritical: "Crítico",
    sevWarn: "Atención",
    sevOk: "OK",
    loading: "Cargando...",
    empty: "Ninguna validez monitoreada todavía. Reevalúa los certificados o registra la expiración de un secreto abajo.",
    certTls: "Certificado TLS",
    refreshRow: "Reevaluar",
    registerTitle: "Registrar la validez de un secreto",
    registerHint: "Para lo que la plataforma no lee por sí sola: contraseña de usuario RFC, client secret OAuth, certificado SNC.",
    integrationPlaceholder: "Integración...",
    secretLabelPlaceholder: "Ej.: Contraseña del usuario RFC",
    saveSecret: "Registrar validez",
    saving: "Guardando...",
    checkedMsg: (checked, expiring) => `Verificados ${checked} certificado(s); ${expiring} por expirar pronto.`,
    refreshAllError: "Error al reevaluar los certificados.",
    secretSaved: "Validez del secreto registrada.",
    secretError: "Error al registrar la validez del secreto.",
    expiredAgo: (n) => `expiró hace ${n} día(s)`,
    expiresToday: "expira hoy",
    daysLeft: (n) => `${n} día(s)`,
  },
};
