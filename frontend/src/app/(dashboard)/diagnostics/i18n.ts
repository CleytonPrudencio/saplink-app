import type { Lang } from "@/i18n/I18n";

export const T: Record<
  Lang,
  {
    loading: string;
    errLoadData: string;
    errCannotDiagnose: string;
    errCannotFix: string;
    errCannotStart: string;
    errInvalidResponse: string;
    errAiFailed: string;
    errUnstable: string;
    errTooLong: string;
    pageTitle: string;
    autoDiagTitle: string;
    autoDiagWithName: (name: string) => string;
    reanalyze: string;
    aiTesting: string;
    rootCause: string;
    recommendation: string;
    steps: string;
    sapNotesSuggested: string;
    searchNote: string;
    sapNotesFooter: string;
    autoFixAvailable: string;
    aiFixes: string;
    applyingFix: string;
    noAutoFix: string;
    fixRecovered: string;
    fixNotRecovered: string;
    whatChanged: string;
    where: string;
    integrationRegistry: (name: string, type: string) => string;
    before: string;
    after: string;
    statusLabel: string;
    uptimeLabel: string;
    presets: string;
    noPresets: string;
    client: string;
    selectClient: string;
    queryLabel: string;
    queryPlaceholder: string;
    analyze: string;
    analyzing: string;
    resultTitle: string;
    analyzingEnv: string;
    reportTitle: string;
    generatedAt: string;
    historyTitle: string;
    clickForDetails: string;
  }
> = {
  pt: {
    loading: "Carregando...",
    errLoadData: "Erro ao carregar dados.",
    errCannotDiagnose: "Não foi possível diagnosticar a integração.",
    errCannotFix: "Não foi possível aplicar a correção.",
    errCannotStart: "Não foi possível iniciar o diagnóstico.",
    errInvalidResponse: "Não foi possível iniciar o diagnóstico (resposta inválida do servidor).",
    errAiFailed: "A IA não conseguiu gerar o diagnóstico. Tente novamente.",
    errUnstable:
      "Conexão instável ao acompanhar o diagnóstico — ele continua processando e aparecerá no histórico em instantes.",
    errTooLong: "O diagnóstico está demorando mais que o esperado — aparecerá no histórico em instantes.",
    pageTitle: "Diagnostico IA",
    autoDiagTitle: "Diagnóstico automático",
    autoDiagWithName: (name) => `Diagnóstico automático: ${name}`,
    reanalyze: "↻ Reanalisar",
    aiTesting: "A IA está testando a integração e analisando o erro...",
    rootCause: "Causa raiz",
    recommendation: "Recomendação",
    steps: "Passos",
    sapNotesSuggested: "SAP Notes sugeridas",
    searchNote: "Buscar a Note no suporte SAP ↗",
    sapNotesFooter:
      "Sugestões por área/sintoma — confirme a Note/KBA aplicável no SAP ONE Support Launchpad.",
    autoFixAvailable: "Correção automática disponível",
    aiFixes: "✨ IA corrige",
    applyingFix: "Aplicando correção...",
    noAutoFix: "Sem correção automática.",
    fixRecovered: "✓ Correção aplicada — integração recuperada",
    fixNotRecovered: "Correção aplicada — ainda não recuperou",
    whatChanged: "O que foi alterado",
    where: "Onde",
    integrationRegistry: (name, type) => `Cadastro da integração ${name} (${type})`,
    before: "Antes",
    after: "Depois",
    statusLabel: "Status",
    uptimeLabel: "Uptime",
    presets: "Presets",
    noPresets: "Nenhum preset disponivel.",
    client: "Cliente",
    selectClient: "Selecione um cliente",
    queryLabel: "Consulta",
    queryPlaceholder: "Descreva o que deseja analisar...",
    analyze: "Analisar",
    analyzing: "Analisando...",
    resultTitle: "Resultado",
    analyzingEnv:
      "A IA está analisando o ambiente... isso pode levar até ~2 min. Pode continuar usando o sistema.",
    reportTitle: "Diagnóstico do ambiente SAP",
    generatedAt: "Gerado em",
    historyTitle: "Historico de Diagnosticos",
    clickForDetails: "Clique para ver detalhes",
  },
  en: {
    loading: "Loading...",
    errLoadData: "Error loading data.",
    errCannotDiagnose: "Could not diagnose the integration.",
    errCannotFix: "Could not apply the fix.",
    errCannotStart: "Could not start the diagnosis.",
    errInvalidResponse: "Could not start the diagnosis (invalid server response).",
    errAiFailed: "The AI could not generate the diagnosis. Please try again.",
    errUnstable:
      "Unstable connection while tracking the diagnosis — it keeps processing and will appear in the history shortly.",
    errTooLong: "The diagnosis is taking longer than expected — it will appear in the history shortly.",
    pageTitle: "AI Diagnosis",
    autoDiagTitle: "Automatic diagnosis",
    autoDiagWithName: (name) => `Automatic diagnosis: ${name}`,
    reanalyze: "↻ Re-analyze",
    aiTesting: "The AI is testing the integration and analyzing the error...",
    rootCause: "Root cause",
    recommendation: "Recommendation",
    steps: "Steps",
    sapNotesSuggested: "Suggested SAP Notes",
    searchNote: "Search the Note in SAP support ↗",
    sapNotesFooter:
      "Suggestions by area/symptom — confirm the applicable Note/KBA in the SAP ONE Support Launchpad.",
    autoFixAvailable: "Automatic fix available",
    aiFixes: "✨ AI fixes it",
    applyingFix: "Applying fix...",
    noAutoFix: "No automatic fix.",
    fixRecovered: "✓ Fix applied — integration recovered",
    fixNotRecovered: "Fix applied — not recovered yet",
    whatChanged: "What changed",
    where: "Where",
    integrationRegistry: (name, type) => `Integration registry ${name} (${type})`,
    before: "Before",
    after: "After",
    statusLabel: "Status",
    uptimeLabel: "Uptime",
    presets: "Presets",
    noPresets: "No presets available.",
    client: "Client",
    selectClient: "Select a client",
    queryLabel: "Query",
    queryPlaceholder: "Describe what you want to analyze...",
    analyze: "Analyze",
    analyzing: "Analyzing...",
    resultTitle: "Result",
    analyzingEnv:
      "The AI is analyzing the environment... this can take up to ~2 min. You can keep using the system.",
    reportTitle: "SAP environment diagnosis",
    generatedAt: "Generated at",
    historyTitle: "Diagnosis History",
    clickForDetails: "Click to see details",
  },
  es: {
    loading: "Cargando...",
    errLoadData: "Error al cargar los datos.",
    errCannotDiagnose: "No se pudo diagnosticar la integración.",
    errCannotFix: "No se pudo aplicar la corrección.",
    errCannotStart: "No se pudo iniciar el diagnóstico.",
    errInvalidResponse: "No se pudo iniciar el diagnóstico (respuesta inválida del servidor).",
    errAiFailed: "La IA no pudo generar el diagnóstico. Inténtalo de nuevo.",
    errUnstable:
      "Conexión inestable al seguir el diagnóstico — sigue procesándose y aparecerá en el historial en breve.",
    errTooLong: "El diagnóstico está tardando más de lo esperado — aparecerá en el historial en breve.",
    pageTitle: "Diagnóstico IA",
    autoDiagTitle: "Diagnóstico automático",
    autoDiagWithName: (name) => `Diagnóstico automático: ${name}`,
    reanalyze: "↻ Reanalizar",
    aiTesting: "La IA está probando la integración y analizando el error...",
    rootCause: "Causa raíz",
    recommendation: "Recomendación",
    steps: "Pasos",
    sapNotesSuggested: "SAP Notes sugeridas",
    searchNote: "Buscar la Note en el soporte SAP ↗",
    sapNotesFooter:
      "Sugerencias por área/síntoma — confirma la Note/KBA aplicable en el SAP ONE Support Launchpad.",
    autoFixAvailable: "Corrección automática disponible",
    aiFixes: "✨ La IA corrige",
    applyingFix: "Aplicando corrección...",
    noAutoFix: "Sin corrección automática.",
    fixRecovered: "✓ Corrección aplicada — integración recuperada",
    fixNotRecovered: "Corrección aplicada — aún no se recuperó",
    whatChanged: "Qué se cambió",
    where: "Dónde",
    integrationRegistry: (name, type) => `Registro de la integración ${name} (${type})`,
    before: "Antes",
    after: "Después",
    statusLabel: "Status",
    uptimeLabel: "Uptime",
    presets: "Presets",
    noPresets: "No hay presets disponibles.",
    client: "Cliente",
    selectClient: "Selecciona un cliente",
    queryLabel: "Consulta",
    queryPlaceholder: "Describe lo que deseas analizar...",
    analyze: "Analizar",
    analyzing: "Analizando...",
    resultTitle: "Resultado",
    analyzingEnv:
      "La IA está analizando el entorno... esto puede tardar hasta ~2 min. Puedes seguir usando el sistema.",
    reportTitle: "Diagnóstico del entorno SAP",
    generatedAt: "Generado el",
    historyTitle: "Historial de Diagnósticos",
    clickForDetails: "Haz clic para ver detalles",
  },
};
