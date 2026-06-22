import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  explainLabel: string;
  loading: string;
  empty: string;
  statChanges: string;
  statRemediations: string;
  statSodViolations: string;
  colWhen: string;
  colType: string;
  colWho: string;
  colWhat: string;
  colClient: string;
}> = {
  pt: {
    title: "Auditoria & Compliance",
    subtitle: "Trilha unificada de mudanças (transports) e remediações (quem pediu/aprovou), com checagem de segregação de função (SoD) — pronto para o auditor.",
    explainLabel: "Gerar pacote de evidências (IA)",
    loading: "Carregando...",
    empty: "Sem mudanças ou remediações registradas ainda.",
    statChanges: "Mudanças (STMS)",
    statRemediations: "Remediações",
    statSodViolations: "Violações SoD",
    colWhen: "Quando",
    colType: "Tipo",
    colWho: "Quem",
    colWhat: "O quê",
    colClient: "Cliente",
  },
  en: {
    title: "Audit & Compliance",
    subtitle: "Unified trail of changes (transports) and remediations (who requested/approved), with separation of duties (SoD) checks — auditor-ready.",
    explainLabel: "Generate evidence package (AI)",
    loading: "Loading...",
    empty: "No changes or remediations recorded yet.",
    statChanges: "Changes (STMS)",
    statRemediations: "Remediations",
    statSodViolations: "SoD Violations",
    colWhen: "When",
    colType: "Type",
    colWho: "Who",
    colWhat: "What",
    colClient: "Client",
  },
  es: {
    title: "Auditoría & Compliance",
    subtitle: "Traza unificada de cambios (transports) y remediaciones (quién solicitó/aprobó), con verificación de segregación de funciones (SoD) — lista para el auditor.",
    explainLabel: "Generar paquete de evidencias (IA)",
    loading: "Cargando...",
    empty: "Aún no hay cambios ni remediaciones registrados.",
    statChanges: "Cambios (STMS)",
    statRemediations: "Remediaciones",
    statSodViolations: "Violaciones SoD",
    colWhen: "Cuándo",
    colType: "Tipo",
    colWho: "Quién",
    colWhat: "Qué",
    colClient: "Cliente",
  },
};
