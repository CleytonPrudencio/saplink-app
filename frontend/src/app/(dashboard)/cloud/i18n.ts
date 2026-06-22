import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  loading: string;
  statMessages: string;
  statCpiAif: string;
  statFailed: string;
  allSources: string;
  allStatuses: string;
  statusCompleted: string;
  statusFailed: string;
  statusRetry: string;
  statusEscalated: string;
  searchPlaceholder: string;
  empty: string;
  colSource: string;
  colArtifact: string;
  colMessageId: string;
  colStatus: string;
  colWhen: string;
  colAi: string;
  analyzing: string;
  hide: string;
  viewSolution: string;
  diagnoseWithAi: string;
  diagnoseRunning: string;
  diagnoseError: string;
  diagnosisTitle: string;
  artifactLabel: string;
  generatedAt: string;
  generateFix: string;
  fixRunning: string;
  fixError: string;
  fixTitle: string;
  fixSubtitle: string;
  runbooksTitle: string;
}> = {
  pt: {
    title: "CPI & AIF",
    subtitle: "Mensagens do SAP Cloud Integration (MPL/IFlows) e do Application Interface Framework.",
    loading: "Carregando...",
    statMessages: "Mensagens",
    statCpiAif: "CPI / AIF",
    statFailed: "Com falha",
    allSources: "Todas as fontes",
    allStatuses: "Todos os status",
    statusCompleted: "Completo",
    statusFailed: "Falha",
    statusRetry: "Retry",
    statusEscalated: "Escalado",
    searchPlaceholder: "Buscar IFlow / interface / messageId",
    empty: "Nenhuma mensagem CPI/AIF. Os dados vêm da descoberta do Agente (ou conector CPI/AIF).",
    colSource: "Fonte",
    colArtifact: "Artefato",
    colMessageId: "Message ID",
    colStatus: "Status",
    colWhen: "Quando",
    colAi: "IA",
    analyzing: "Analisando…",
    hide: "Ocultar",
    viewSolution: "Ver solução",
    diagnoseWithAi: "Diagnosticar com IA",
    diagnoseRunning: "A IA está analisando a causa raiz e os passos de correção…",
    diagnoseError: "Não foi possível gerar o diagnóstico agora. Tente novamente.",
    diagnosisTitle: "Diagnóstico de falha — CPI/AIF",
    artifactLabel: "Artefato",
    generatedAt: "Gerado em",
    generateFix: "⚙️ Gerar correção pronta (IA)",
    fixRunning: "A IA está escrevendo a correção pronta…",
    fixError: "Não foi possível gerar a correção. Tente novamente.",
    fixTitle: "Correção pronta (generativa)",
    fixSubtitle: "Artefato pronto para aplicar",
    runbooksTitle: "🛒 Runbooks que resolvem isso",
  },
  en: {
    title: "CPI & AIF",
    subtitle: "Messages from SAP Cloud Integration (MPL/IFlows) and the Application Interface Framework.",
    loading: "Loading...",
    statMessages: "Messages",
    statCpiAif: "CPI / AIF",
    statFailed: "Failed",
    allSources: "All sources",
    allStatuses: "All statuses",
    statusCompleted: "Completed",
    statusFailed: "Failed",
    statusRetry: "Retry",
    statusEscalated: "Escalated",
    searchPlaceholder: "Search IFlow / interface / messageId",
    empty: "No CPI/AIF messages. Data comes from Agent discovery (or the CPI/AIF connector).",
    colSource: "Source",
    colArtifact: "Artifact",
    colMessageId: "Message ID",
    colStatus: "Status",
    colWhen: "When",
    colAi: "AI",
    analyzing: "Analyzing…",
    hide: "Hide",
    viewSolution: "View solution",
    diagnoseWithAi: "Diagnose with AI",
    diagnoseRunning: "AI is analyzing the root cause and the fix steps…",
    diagnoseError: "Could not generate the diagnosis right now. Please try again.",
    diagnosisTitle: "Failure diagnosis — CPI/AIF",
    artifactLabel: "Artifact",
    generatedAt: "Generated at",
    generateFix: "⚙️ Generate ready-to-apply fix (AI)",
    fixRunning: "AI is writing the ready-to-apply fix…",
    fixError: "Could not generate the fix. Please try again.",
    fixTitle: "Ready-to-apply fix (generative)",
    fixSubtitle: "Artifact ready to apply",
    runbooksTitle: "🛒 Runbooks that solve this",
  },
  es: {
    title: "CPI & AIF",
    subtitle: "Mensajes de SAP Cloud Integration (MPL/IFlows) y del Application Interface Framework.",
    loading: "Cargando...",
    statMessages: "Mensajes",
    statCpiAif: "CPI / AIF",
    statFailed: "Con falla",
    allSources: "Todas las fuentes",
    allStatuses: "Todos los status",
    statusCompleted: "Completo",
    statusFailed: "Falla",
    statusRetry: "Retry",
    statusEscalated: "Escalado",
    searchPlaceholder: "Buscar IFlow / interface / messageId",
    empty: "Ningún mensaje CPI/AIF. Los datos provienen del descubrimiento del Agente (o conector CPI/AIF).",
    colSource: "Fuente",
    colArtifact: "Artefacto",
    colMessageId: "Message ID",
    colStatus: "Status",
    colWhen: "Cuándo",
    colAi: "IA",
    analyzing: "Analizando…",
    hide: "Ocultar",
    viewSolution: "Ver solución",
    diagnoseWithAi: "Diagnosticar con IA",
    diagnoseRunning: "La IA está analizando la causa raíz y los pasos de corrección…",
    diagnoseError: "No se pudo generar el diagnóstico ahora. Inténtalo de nuevo.",
    diagnosisTitle: "Diagnóstico de falla — CPI/AIF",
    artifactLabel: "Artefacto",
    generatedAt: "Generado el",
    generateFix: "⚙️ Generar corrección lista (IA)",
    fixRunning: "La IA está escribiendo la corrección lista…",
    fixError: "No se pudo generar la corrección. Inténtalo de nuevo.",
    fixTitle: "Corrección lista (generativa)",
    fixSubtitle: "Artefacto listo para aplicar",
    runbooksTitle: "🛒 Runbooks que resuelven esto",
  },
};
