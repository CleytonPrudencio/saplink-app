import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  prodLockBefore: string;
  prodLockMid: string;
  prodLockBold: string;
  prodLockAfter: string;
  statAutonomy: string;
  statMttr: string;
  mttrUnit: (m: number | string) => string;
  statAutoResolved: string;
  statPending: string;
  autopilot: string;
  on: string;
  off: string;
  autopilotHint: string;
  turnOff: string;
  turnOn: string;
  minConfidenceLabel: string;
  allowedActions: string;
  saving: string;
  savePolicy: string;
  policySaved: string;
  saveError: string;
  guardrails: string;
  actReprocessIdoc: string;
  actRetryTrfc: string;
  actUnlockQueue: string;
  actReactivateRfc: string;
}> = {
  pt: {
    title: "AMS Autônomo",
    subtitle: "Detecta → diagnostica → corrige → mede → aprende. A confiança vem da Rede Federada; acima do limiar, a correção é aplicada sozinha (com rastro e rollback no agente).",
    prodLockBefore: "Trava de produção: em integrações",
    prodLockMid: "o AMS",
    prodLockBold: "não executa sozinho",
    prodLockAfter: "— gera sugestão pendente de aprovação. DEV/HML seguem automáticos.",
    statAutonomy: "% resolvido sem humano",
    statMttr: "MTTR médio",
    mttrUnit: (m) => `${m}min`,
    statAutoResolved: "Auto-corrigidas",
    statPending: "Aguardando aprovação",
    autopilot: "Piloto automático",
    on: "LIGADO",
    off: "desligado",
    autopilotHint: "Quando ligado, correções com confiança ≥ limiar são aplicadas automaticamente.",
    turnOff: "Desligar",
    turnOn: "Ligar piloto automático",
    minConfidenceLabel: "Confiança mínima para auto-executar",
    allowedActions: "Ações permitidas para auto-correção:",
    saving: "Salvando...",
    savePolicy: "Salvar política",
    policySaved: "Política salva.",
    saveError: "Erro ao salvar.",
    guardrails: "Guardrails: só auto-executa ações da lista permitida, acima do limiar de confiança, e sempre deixa rastro (quem/quando/antes/depois). Correções de baixa confiança continuam exigindo aprovação humana.",
    actReprocessIdoc: "Reprocessar IDoc (BD87)",
    actRetryTrfc: "Reexecutar tRFC (SM58)",
    actUnlockQueue: "Destravar fila qRFC (SMQ2)",
    actReactivateRfc: "Reativar destino RFC (SM59)",
  },
  en: {
    title: "Autonomous AMS",
    subtitle: "Detects → diagnoses → fixes → measures → learns. Confidence comes from the Federated Network; above the threshold, the fix is applied on its own (with an audit trail and rollback in the agent).",
    prodLockBefore: "Production lock: on",
    prodLockMid: "integrations the AMS",
    prodLockBold: "does not run on its own",
    prodLockAfter: "— it generates a suggestion pending approval. DEV/HML stay automatic.",
    statAutonomy: "% resolved without humans",
    statMttr: "Average MTTR",
    mttrUnit: (m) => `${m}min`,
    statAutoResolved: "Auto-fixed",
    statPending: "Awaiting approval",
    autopilot: "Autopilot",
    on: "ON",
    off: "off",
    autopilotHint: "When on, fixes with confidence ≥ threshold are applied automatically.",
    turnOff: "Turn off",
    turnOn: "Turn on autopilot",
    minConfidenceLabel: "Minimum confidence to auto-run",
    allowedActions: "Actions allowed for auto-fix:",
    saving: "Saving...",
    savePolicy: "Save policy",
    policySaved: "Policy saved.",
    saveError: "Failed to save.",
    guardrails: "Guardrails: it only auto-runs actions from the allowed list, above the confidence threshold, and always leaves an audit trail (who/when/before/after). Low-confidence fixes still require human approval.",
    actReprocessIdoc: "Reprocess IDoc (BD87)",
    actRetryTrfc: "Retry tRFC (SM58)",
    actUnlockQueue: "Unlock qRFC queue (SMQ2)",
    actReactivateRfc: "Reactivate RFC destination (SM59)",
  },
  es: {
    title: "AMS Autónomo",
    subtitle: "Detecta → diagnostica → corrige → mide → aprende. La confianza viene de la Red Federada; por encima del umbral, la corrección se aplica sola (con traza y rollback en el agente).",
    prodLockBefore: "Bloqueo de producción: en integraciones",
    prodLockMid: "el AMS",
    prodLockBold: "no ejecuta solo",
    prodLockAfter: "— genera una sugerencia pendiente de aprobación. DEV/HML siguen automáticos.",
    statAutonomy: "% resuelto sin humanos",
    statMttr: "MTTR promedio",
    mttrUnit: (m) => `${m}min`,
    statAutoResolved: "Autocorregidas",
    statPending: "Esperando aprobación",
    autopilot: "Piloto automático",
    on: "ACTIVADO",
    off: "desactivado",
    autopilotHint: "Cuando está activado, las correcciones con confianza ≥ umbral se aplican automáticamente.",
    turnOff: "Desactivar",
    turnOn: "Activar piloto automático",
    minConfidenceLabel: "Confianza mínima para autoejecutar",
    allowedActions: "Acciones permitidas para autocorrección:",
    saving: "Guardando...",
    savePolicy: "Guardar política",
    policySaved: "Política guardada.",
    saveError: "Error al guardar.",
    guardrails: "Guardrails: solo autoejecuta acciones de la lista permitida, por encima del umbral de confianza, y siempre deja traza (quién/cuándo/antes/después). Las correcciones de baja confianza siguen requiriendo aprobación humana.",
    actReprocessIdoc: "Reprocesar IDoc (BD87)",
    actRetryTrfc: "Reejecutar tRFC (SM58)",
    actUnlockQueue: "Desbloquear cola qRFC (SMQ2)",
    actReactivateRfc: "Reactivar destino RFC (SM59)",
  },
};
