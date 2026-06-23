import type { Lang } from "@/i18n/I18n";

interface RecText { label: string; title: string; description: string; action: string; risk: string }

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  loading: string;
  loadClientsError: string;
  loadDataError: string;
  selectClient: string;
  statTotal: string;
  statTotalSub: string;
  statRetire: string;
  statRetireSub: string;
  statReview: string;
  statReviewSub: string;
  statKeep: string;
  statKeepSub: string;
  filterAll: string;
  filterRetire: string;
  filterReview: string;
  filterKeep: string;
  execShort: string;
  detailsTitle: string;
  fieldName: string;
  fieldType: string;
  fieldLastUse: string;
  fieldExecutions: string;
  fieldInactivity: string;
  executionsUnit: (n: number) => string;
  neverExecuted: string;
  recommendationTitle: string;
  suggestedActionTitle: string;
  riskTitle: string;
  analyzeWithAi: string;
  copyObjectName: string;
  noDeadCode: string;
  legendTitle: string;
  neverUsed: string;
  yearsNoUse: (n: number) => string;
  monthsNoUse: (n: number) => string;
  daysNoUse: (n: number) => string;
  customAbapObject: string;
  sheetGuideTitle: string;
  sheetSteps: string[];
  rec: Record<string, RecText>;
  typeDescriptions: Record<string, string>;
}> = {
  pt: {
    title: "Dead Code Scanner",
    subtitle: "Identifique objetos ABAP inativos para limpeza e migração S/4HANA",
    loading: "Carregando...",
    loadClientsError: "Erro ao carregar clientes.",
    loadDataError: "Erro ao carregar dados.",
    selectClient: "Selecione um cliente",
    statTotal: "Total de Objetos",
    statTotalSub: "Analisados neste cliente",
    statRetire: "Aposentar",
    statRetireSub: "Sem uso — podem ser removidos",
    statReview: "Revisar",
    statReviewSub: "Uso esporádico — investigar",
    statKeep: "Manter",
    statKeepSub: "Em uso ativo — não remover",
    filterAll: "Todos",
    filterRetire: "🗑️ Aposentar",
    filterReview: "🔍 Revisar",
    filterKeep: "✅ Manter",
    execShort: "exec.",
    detailsTitle: "Detalhes do Objeto",
    fieldName: "Nome",
    fieldType: "Tipo",
    fieldLastUse: "Último uso",
    fieldExecutions: "Execuções",
    fieldInactivity: "Inatividade",
    executionsUnit: (n) => `${n} vezes`,
    neverExecuted: "Nunca executado",
    recommendationTitle: "Recomendação",
    suggestedActionTitle: "Ação Sugerida",
    riskTitle: "Risco",
    analyzeWithAi: "🤖 Analisar com IA",
    copyObjectName: "📋 Copiar nome do objeto",
    noDeadCode: "Nenhum dead code encontrado para este cliente.",
    legendTitle: "📖 Legenda das Recomendações",
    neverUsed: "Nunca utilizado",
    yearsNoUse: (n) => `${n} anos sem uso`,
    monthsNoUse: (n) => `${n} meses sem uso`,
    daysNoUse: (n) => `${n} dias sem uso`,
    customAbapObject: "Objeto ABAP customizado",
    sheetGuideTitle: "O que fazer",
    sheetSteps: [
      "Verifique onde o objeto é chamado (Where-Used List) antes de qualquer decisão.",
      "Confirme com a equipe funcional se ainda há processo dependente.",
      "Se confirmado sem uso, mova para $TMP ou aposente após backup.",
    ],
    rec: {
      RETIRE: {
        label: "APOSENTAR",
        title: "Recomendado aposentar",
        description: "Este objeto não é utilizado há muito tempo ou nunca foi executado em produção. Mantê-lo aumenta a complexidade do sistema e dificulta manutenção e migração.",
        action: "Mover para pacote de objetos inativos ($TMP) ou deletar após backup. Validar com equipe funcional antes de remover.",
        risk: "Risco baixo — objeto sem uso. Faça backup antes de remover por segurança.",
      },
      REVIEW: {
        label: "REVISAR",
        title: "Recomendado revisar",
        description: "Este objeto tem uso esporádico ou foi utilizado recentemente mas com baixa frequência. Pode estar sendo chamado por jobs noturnos ou processos pontuais.",
        action: "Investigar quem chama este objeto (SE24/SE37 → Where-Used). Se confirmado que é necessário, reclassificar como MANTER.",
        risk: "Risco médio — pode estar em uso por processos não óbvios. Não remover sem análise.",
      },
      KEEP: {
        label: "MANTER",
        title: "Manter em produção",
        description: "Este objeto é utilizado ativamente em produção. Faz parte dos processos operacionais do cliente e deve ser mantido.",
        action: "Nenhuma ação necessária. Documentar e incluir no escopo de testes de migração S/4HANA.",
        risk: "Sem risco — objeto ativo e necessário.",
      },
    },
    typeDescriptions: {
      PROGRAM: "Programa ABAP (report ou module pool)",
      FUNCTION: "Function Module (RFC ou local)",
      CLASS: "Classe ABAP (OO)",
      INCLUDE: "Include de código compartilhado",
      FORM: "Form routine (subrotina)",
      ENHANCEMENT: "Enhancement / User Exit",
    },
  },
  en: {
    title: "Dead Code Scanner",
    subtitle: "Identify inactive ABAP objects for cleanup and S/4HANA migration",
    loading: "Loading...",
    loadClientsError: "Failed to load clients.",
    loadDataError: "Failed to load data.",
    selectClient: "Select a client",
    statTotal: "Total Objects",
    statTotalSub: "Analyzed for this client",
    statRetire: "Retire",
    statRetireSub: "Unused — can be removed",
    statReview: "Review",
    statReviewSub: "Occasional use — investigate",
    statKeep: "Keep",
    statKeepSub: "Actively used — do not remove",
    filterAll: "All",
    filterRetire: "🗑️ Retire",
    filterReview: "🔍 Review",
    filterKeep: "✅ Keep",
    execShort: "exec.",
    detailsTitle: "Object Details",
    fieldName: "Name",
    fieldType: "Type",
    fieldLastUse: "Last use",
    fieldExecutions: "Executions",
    fieldInactivity: "Inactivity",
    executionsUnit: (n) => `${n} times`,
    neverExecuted: "Never executed",
    recommendationTitle: "Recommendation",
    suggestedActionTitle: "Suggested Action",
    riskTitle: "Risk",
    analyzeWithAi: "🤖 Analyze with AI",
    copyObjectName: "📋 Copy object name",
    noDeadCode: "No dead code found for this client.",
    legendTitle: "📖 Recommendations Legend",
    neverUsed: "Never used",
    yearsNoUse: (n) => `${n} years unused`,
    monthsNoUse: (n) => `${n} months unused`,
    daysNoUse: (n) => `${n} days unused`,
    customAbapObject: "Custom ABAP object",
    sheetGuideTitle: "What to do",
    sheetSteps: [
      "Check where the object is called (Where-Used List) before any decision.",
      "Confirm with the functional team whether any dependent process remains.",
      "If confirmed unused, move it to $TMP or retire it after a backup.",
    ],
    rec: {
      RETIRE: {
        label: "RETIRE",
        title: "Recommended to retire",
        description: "This object hasn't been used for a long time or was never executed in production. Keeping it increases system complexity and makes maintenance and migration harder.",
        action: "Move to an inactive objects package ($TMP) or delete after backup. Validate with the functional team before removing.",
        risk: "Low risk — unused object. Back it up before removing, just in case.",
      },
      REVIEW: {
        label: "REVIEW",
        title: "Recommended to review",
        description: "This object has occasional use or was used recently but with low frequency. It may be called by nightly jobs or one-off processes.",
        action: "Investigate who calls this object (SE24/SE37 → Where-Used). If confirmed necessary, reclassify as KEEP.",
        risk: "Medium risk — may be used by non-obvious processes. Do not remove without analysis.",
      },
      KEEP: {
        label: "KEEP",
        title: "Keep in production",
        description: "This object is actively used in production. It is part of the client's operational processes and should be kept.",
        action: "No action needed. Document it and include it in the scope of S/4HANA migration tests.",
        risk: "No risk — active and necessary object.",
      },
    },
    typeDescriptions: {
      PROGRAM: "ABAP program (report or module pool)",
      FUNCTION: "Function Module (RFC or local)",
      CLASS: "ABAP class (OO)",
      INCLUDE: "Shared code include",
      FORM: "Form routine (subroutine)",
      ENHANCEMENT: "Enhancement / User Exit",
    },
  },
  es: {
    title: "Dead Code Scanner",
    subtitle: "Identifica objetos ABAP inactivos para limpieza y migración S/4HANA",
    loading: "Cargando...",
    loadClientsError: "Error al cargar los clientes.",
    loadDataError: "Error al cargar los datos.",
    selectClient: "Selecciona un cliente",
    statTotal: "Total de Objetos",
    statTotalSub: "Analizados en este cliente",
    statRetire: "Retirar",
    statRetireSub: "Sin uso — pueden eliminarse",
    statReview: "Revisar",
    statReviewSub: "Uso esporádico — investigar",
    statKeep: "Mantener",
    statKeepSub: "En uso activo — no eliminar",
    filterAll: "Todos",
    filterRetire: "🗑️ Retirar",
    filterReview: "🔍 Revisar",
    filterKeep: "✅ Mantener",
    execShort: "ejec.",
    detailsTitle: "Detalles del Objeto",
    fieldName: "Nombre",
    fieldType: "Tipo",
    fieldLastUse: "Último uso",
    fieldExecutions: "Ejecuciones",
    fieldInactivity: "Inactividad",
    executionsUnit: (n) => `${n} veces`,
    neverExecuted: "Nunca ejecutado",
    recommendationTitle: "Recomendación",
    suggestedActionTitle: "Acción Sugerida",
    riskTitle: "Riesgo",
    analyzeWithAi: "🤖 Analizar con IA",
    copyObjectName: "📋 Copiar nombre del objeto",
    noDeadCode: "No se encontró dead code para este cliente.",
    legendTitle: "📖 Leyenda de Recomendaciones",
    neverUsed: "Nunca utilizado",
    yearsNoUse: (n) => `${n} años sin uso`,
    monthsNoUse: (n) => `${n} meses sin uso`,
    daysNoUse: (n) => `${n} días sin uso`,
    customAbapObject: "Objeto ABAP personalizado",
    sheetGuideTitle: "Qué hacer",
    sheetSteps: [
      "Verifica dónde se llama el objeto (Where-Used List) antes de cualquier decisión.",
      "Confirma con el equipo funcional si todavía hay algún proceso dependiente.",
      "Si se confirma sin uso, muévelo a $TMP o retíralo después de un backup.",
    ],
    rec: {
      RETIRE: {
        label: "RETIRAR",
        title: "Recomendado retirar",
        description: "Este objeto no se utiliza desde hace mucho tiempo o nunca se ejecutó en producción. Mantenerlo aumenta la complejidad del sistema y dificulta el mantenimiento y la migración.",
        action: "Mover a un paquete de objetos inactivos ($TMP) o eliminar después de un backup. Validar con el equipo funcional antes de eliminar.",
        risk: "Riesgo bajo — objeto sin uso. Haz un backup antes de eliminar por seguridad.",
      },
      REVIEW: {
        label: "REVISAR",
        title: "Recomendado revisar",
        description: "Este objeto tiene uso esporádico o se utilizó recientemente pero con baja frecuencia. Puede estar siendo llamado por jobs nocturnos o procesos puntuales.",
        action: "Investigar quién llama a este objeto (SE24/SE37 → Where-Used). Si se confirma que es necesario, reclasificar como MANTENER.",
        risk: "Riesgo medio — puede estar en uso por procesos no evidentes. No eliminar sin análisis.",
      },
      KEEP: {
        label: "MANTENER",
        title: "Mantener en producción",
        description: "Este objeto se utiliza activamente en producción. Forma parte de los procesos operativos del cliente y debe mantenerse.",
        action: "Ninguna acción necesaria. Documentar e incluir en el alcance de las pruebas de migración S/4HANA.",
        risk: "Sin riesgo — objeto activo y necesario.",
      },
    },
    typeDescriptions: {
      PROGRAM: "Programa ABAP (report o module pool)",
      FUNCTION: "Function Module (RFC o local)",
      CLASS: "Clase ABAP (OO)",
      INCLUDE: "Include de código compartido",
      FORM: "Form routine (subrutina)",
      ENHANCEMENT: "Enhancement / User Exit",
    },
  },
};
