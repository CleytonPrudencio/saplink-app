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
  // DetailSheet
  sheetSub: string;
  fldWhen: string;
  fldType: string;
  fldWho: string;
  fldWhat: string;
  fldClient: string;
  fldFlag: string;
  guideTitle: string;
  guideSod: string[];
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
    sheetSub: "Registro de auditoria",
    fldWhen: "Quando",
    fldType: "Tipo",
    fldWho: "Quem",
    fldWhat: "O quê",
    fldClient: "Cliente",
    fldFlag: "Alerta",
    guideTitle: "O que fazer",
    guideSod: [
      "Violação de SoD: revisar se quem pediu a mudança é diferente de quem aprovou/executou.",
      "Confirmar a justificativa de negócio e a aprovação formal correspondente.",
      "Gerar o pacote de evidências (botão IA acima) e anexar ao chamado/auditoria.",
      "Se não houver segregação adequada, escalar ao responsável de compliance.",
    ],
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
    sheetSub: "Audit record",
    fldWhen: "When",
    fldType: "Type",
    fldWho: "Who",
    fldWhat: "What",
    fldClient: "Client",
    fldFlag: "Alert",
    guideTitle: "What to do",
    guideSod: [
      "SoD violation: review whether the requester differs from who approved/executed the change.",
      "Confirm the business justification and the corresponding formal approval.",
      "Generate the evidence package (AI button above) and attach it to the ticket/audit.",
      "If proper segregation is missing, escalate to the compliance owner.",
    ],
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
    sheetSub: "Registro de auditoría",
    fldWhen: "Cuándo",
    fldType: "Tipo",
    fldWho: "Quién",
    fldWhat: "Qué",
    fldClient: "Cliente",
    fldFlag: "Alerta",
    guideTitle: "Qué hacer",
    guideSod: [
      "Violación de SoD: revisar si quien solicitó el cambio es distinto de quien aprobó/ejecutó.",
      "Confirmar la justificación de negocio y la aprobación formal correspondiente.",
      "Generar el paquete de evidencias (botón IA arriba) y adjuntarlo al ticket/auditoría.",
      "Si no hay segregación adecuada, escalar al responsable de compliance.",
    ],
  },
};
