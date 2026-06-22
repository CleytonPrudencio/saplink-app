import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  // page header
  title: string;
  subtitle: string;
  cnpjLabel: string;
  cnpjNotInformed: string;
  loading: string;
  loadingData: string;
  back: string;
  exportPdf: string;
  generateReport: string;

  // report type cards
  monthlyTitle: string;
  monthlyDesc: string;
  migrationTitle: string;
  migrationDesc: string;
  roiTitle: string;
  roiDesc: string;
  executiveTitle: string;
  executiveDesc: string;

  // monthly report
  monthlyHeading: string;
  healthScoreSection: string;
  overallScore: string;
  avgUptime: string;
  avgLatency: string;
  errorRate: string;
  integrationsSection: (n: number) => string;
  colIntegration: string;
  colType: string;
  colStatus: string;
  colLatency: string;
  colError: string;
  colUptime: string;
  alertsSummarySection: string;
  alertTotal: string;
  alertCritical: string;
  alertHigh: string;
  alertResolved: string;
  alertPending: string;
  resolved: string;
  pending: string;
  analysisSection: string;
  // analysis sentences split around bold values
  analysisScorePre: string; // "The environment of client "
  analysisScoreMid: string; // " shows a Health Score of "
  analysisScorePost: string; // " this period."
  analysisIntegrations: (active: number, total: number, pct: number) => string;
  analysisHighErrorRate: (rate: string) => string;
  analysisHighLatency: (latency: number) => string;
  analysisPendingAlerts: (n: number) => string;
  analysisAllResolved: string;

  // migration report
  migrationHeading: string;
  generatedOn: (date: string) => string;
  deadCodeSection: string;
  objectsAnalyzed: string;
  toRetire: string;
  toReview: string;
  toKeep: string;
  colObject: string;
  colLastUsed: string;
  colExecutions: string;
  colAction: string;
  never: string;
  riskSection: string;
  migrationComplexity: string;
  complexityHigh: string;
  complexityMedium: string;
  complexityLow: string;
  complexityDesc: (total: number, retire: number) => string;
  envStability: string;
  stable: string;
  attention: string;
  unstable: string;
  stabilityDesc: (score: number, advice: string) => string;
  stabilityStabilize: string;
  stabilityReady: string;
  effortEstimate: string;
  effortDesc: (total: number) => string;
  recommendationsSection: string;
  rec1: (retire: number) => string;
  rec2: (review: number) => string;
  rec3: (keep: number) => string;
  rec4: string;
  rec5: string;
  priorityLabel: (p: string) => string;
  priorityHigh: string;
  priorityMedium: string;
  priorityNormal: string;

  // roi report
  roiHeading: string;
  roiSection: string;
  estimatedSavings: string;
  hoursSaved: string;
  alertsResolved: string;
  preventedDowntime: string;
  methodologySection: string;
  methodDiagnosisWithout: string;
  perIncidentHours: (h: number) => string;
  methodDiagnosisWith: string;
  perIncidentMin: (m: number) => string;
  methodHourlyRate: string;
  hourlyRateValue: (r: number) => string;
  methodAlertsHandled: string;
  totalSavings: string;
  benefitsSection: string;
  benefit1Title: string;
  benefit1Desc: (h: number, m: number) => string;
  benefit2Title: string;
  benefit2Desc: string;
  benefit3Title: string;
  benefit3Desc: (n: number) => string;
  benefit4Title: string;
  benefit4Desc: string;
  benefit5Title: string;
  benefit5Desc: string;
  benefit6Title: string;
  benefit6Desc: (n: number) => string;

  // executive report
  executiveHeading: string;
  executiveDocNote: string;
  execGeneralSituation: string;
  execSituationPre: string; // "The SAP environment of "
  execSituationMid: string; // " has a score of "
  execSituationPost: (month: string) => string; // " in <month>."
  execHealthy: string;
  execNeedsAttention: string;
  execProblems: string;
  execKeyNumbers: string;
  execMonitoredIntegrations: string;
  execAvgAvailability: string;
  execResolvedIncidents: string;
  execHoursSaved: string;
  execEstSavings: string;
  execPreventedDowntime: string;
  execActionsTaken: string;
  execAction1: (n: number) => string;
  execAction2: (n: number) => string;
  execAction3: string;
  execAction4: (n: number) => string;
  execNextSteps: string;
  execNextResolve: (n: number) => string;
  execNextMaintain: string;
  execNextReduceError: string;
  execNextErrorOk: string;
  execNextRetire: (n: number) => string;
  execNextClean: string;
  execNextReview: string;
}> = {
  pt: {
    title: "Relatórios",
    subtitle: "Gere relatórios detalhados para seus clientes com a marca da sua consultoria",
    cnpjLabel: "CNPJ:",
    cnpjNotInformed: "Não informado",
    loading: "Carregando...",
    loadingData: "Carregando dados...",
    back: "← Voltar aos relatórios",
    exportPdf: "Exportar PDF",
    generateReport: "Gerar relatório →",

    monthlyTitle: "Relatório Mensal",
    monthlyDesc: "Visão geral da saúde das integrações, alertas e métricas de performance do mês.",
    migrationTitle: "Análise de Migração S/4HANA",
    migrationDesc: "Relatório completo de dead code, customizações e riscos para migração.",
    roiTitle: "Relatório de ROI",
    roiDesc: "Retorno sobre investimento: tempo economizado, alertas prevenidos e economia.",
    executiveTitle: "Resumo Executivo",
    executiveDesc: "Resumo de alto nível para apresentar ao cliente final.",

    monthlyHeading: "Relatório Mensal de Integrações",
    healthScoreSection: "Health Score",
    overallScore: "Score Geral",
    avgUptime: "Uptime Médio",
    avgLatency: "Latência Média",
    errorRate: "Taxa de Erro",
    integrationsSection: (n) => `Integrações (${n})`,
    colIntegration: "Integração",
    colType: "Tipo",
    colStatus: "Status",
    colLatency: "Latência",
    colError: "Erro",
    colUptime: "Uptime",
    alertsSummarySection: "Resumo de Alertas",
    alertTotal: "Total",
    alertCritical: "Críticos",
    alertHigh: "Altos",
    alertResolved: "Resolvidos",
    alertPending: "Pendentes",
    resolved: "Resolvido",
    pending: "Pendente",
    analysisSection: "Análise",
    analysisScorePre: "O ambiente do cliente ",
    analysisScoreMid: " apresenta Health Score de ",
    analysisScorePost: " neste período.",
    analysisIntegrations: (active, total, pct) => `Das ${total} integrações monitoradas, ${active} estão ativas (${pct}% de disponibilidade).`,
    analysisHighErrorRate: (rate) => `⚠️ A taxa de erro média (${rate}%) está acima do recomendado (5%). Investigação necessária.`,
    analysisHighLatency: (latency) => `⚠️ A latência média (${latency}ms) está elevada. Recomendado verificar infraestrutura.`,
    analysisPendingAlerts: (n) => `🔴 Existem ${n} alertas pendentes que requerem atenção.`,
    analysisAllResolved: "✅ Todos os alertas foram resolvidos neste período.",

    migrationHeading: "Análise de Migração S/4HANA",
    generatedOn: (date) => `Gerado em ${date}`,
    deadCodeSection: "Análise de Dead Code",
    objectsAnalyzed: "Objetos Analisados",
    toRetire: "Para Aposentar",
    toReview: "Para Revisar",
    toKeep: "Para Manter",
    colObject: "Objeto",
    colLastUsed: "Último Uso",
    colExecutions: "Execuções",
    colAction: "Ação",
    never: "Nunca",
    riskSection: "Avaliação de Risco",
    migrationComplexity: "Complexidade da Migração",
    complexityHigh: "ALTA",
    complexityMedium: "MÉDIA",
    complexityLow: "BAIXA",
    complexityDesc: (total, retire) => `${total} objetos customizados identificados. ${retire} podem ser removidos antes da migração.`,
    envStability: "Estabilidade do Ambiente",
    stable: "ESTÁVEL",
    attention: "ATENÇÃO",
    unstable: "INSTÁVEL",
    stabilityDesc: (score, advice) => `Health Score atual: ${score}/100. ${advice}`,
    stabilityStabilize: "Recomendado estabilizar antes de iniciar migração.",
    stabilityReady: "Ambiente pronto para iniciar migração.",
    effortEstimate: "Estimativa de Esforço",
    effortDesc: (total) => `Baseado em ${total} objetos × 4-8h por objeto (análise, teste, migração).`,
    recommendationsSection: "Recomendações",
    rec1: (retire) => `Remover ${retire} objetos classificados como APOSENTAR antes de iniciar a migração`,
    rec2: (review) => `Revisar ${review} objetos com uso esporádico — confirmar necessidade com equipe funcional`,
    rec3: (keep) => `Documentar ${keep} objetos ativos para inclusão no escopo de testes`,
    rec4: "Criar ambiente sandbox S/4HANA para testes de compatibilidade",
    rec5: "Definir janela de migração com mínimo impacto operacional",
    priorityLabel: (p) => `Prioridade: ${p}`,
    priorityHigh: "Alta",
    priorityMedium: "Média",
    priorityNormal: "Normal",

    roiHeading: "Relatório de ROI — SAPLINK",
    roiSection: "Retorno sobre Investimento",
    estimatedSavings: "Economia Estimada",
    hoursSaved: "Horas Economizadas",
    alertsResolved: "Alertas Resolvidos",
    preventedDowntime: "Downtime Prevenido",
    methodologySection: "Metodologia de Cálculo",
    methodDiagnosisWithout: "Tempo médio de diagnóstico sem SAPLINK",
    perIncidentHours: (h) => `${h}h por incidente`,
    methodDiagnosisWith: "Tempo médio com SAPLINK (IA + alertas)",
    perIncidentMin: (m) => `${m} min por incidente`,
    methodHourlyRate: "Custo/hora consultor sênior",
    hourlyRateValue: (r) => `R$ ${r}/h`,
    methodAlertsHandled: "Alertas tratados no período",
    totalSavings: "Economia total",
    benefitsSection: "Benefícios Tangíveis",
    benefit1Title: "Diagnóstico 90% mais rápido",
    benefit1Desc: (h, m) => `De ${h}h para ${m}min com IA`,
    benefit2Title: "Alertas proativos",
    benefit2Desc: "Problemas detectados antes do cliente perceber",
    benefit3Title: "Visibilidade total",
    benefit3Desc: (n) => `${n} integrações monitoradas 24/7`,
    benefit4Title: "Escalabilidade da equipe",
    benefit4Desc: "Júnior resolve o que só sênior resolvia",
    benefit5Title: "Prova de valor mensal",
    benefit5Desc: "Relatórios com ROI visível para renovação",
    benefit6Title: "Migração acelerada",
    benefit6Desc: (n) => `${n} objetos mapeados para S/4HANA`,

    executiveHeading: "Resumo Executivo",
    executiveDocNote: "Documento para apresentação ao cliente final",
    execGeneralSituation: "1. Situação Geral",
    execSituationPre: "O ambiente SAP do ",
    execSituationMid: " apresenta nota ",
    execSituationPost: (month) => ` no mês de ${month}.`,
    execHealthy: "✅ O ambiente está saudável e estável.",
    execNeedsAttention: "⚠️ O ambiente requer atenção em alguns pontos.",
    execProblems: "🔴 O ambiente apresenta problemas que necessitam ação imediata.",
    execKeyNumbers: "2. Números Chave",
    execMonitoredIntegrations: "Integrações monitoradas",
    execAvgAvailability: "Disponibilidade média",
    execResolvedIncidents: "Incidentes resolvidos",
    execHoursSaved: "Horas economizadas",
    execEstSavings: "Economia estimada",
    execPreventedDowntime: "Downtime prevenido",
    execActionsTaken: "3. Ações Realizadas",
    execAction1: (n) => `Monitoramento contínuo de ${n} integrações com coleta a cada 30 segundos`,
    execAction2: (n) => `${n} alertas identificados e resolvidos proativamente`,
    execAction3: "Diagnósticos com IA para resolução acelerada de problemas",
    execAction4: (n) => `Análise de ${n} objetos customizados para preparação de migração`,
    execNextSteps: "4. Próximos Passos",
    execNextResolve: (n) => `Resolver ${n} alertas pendentes`,
    execNextMaintain: "Manter monitoramento contínuo",
    execNextReduceError: "Investigar e reduzir taxa de erro das integrações",
    execNextErrorOk: "Manter taxa de erro dentro do aceitável",
    execNextRetire: (n) => `Iniciar remoção de ${n} objetos inativos`,
    execNextClean: "Ambiente limpo — pronto para próxima fase",
    execNextReview: "Agendar revisão mensal com equipe técnica",
  },
  en: {
    title: "Reports",
    subtitle: "Generate detailed reports for your clients with your consultancy's branding",
    cnpjLabel: "CNPJ:",
    cnpjNotInformed: "Not provided",
    loading: "Loading...",
    loadingData: "Loading data...",
    back: "← Back to reports",
    exportPdf: "Export PDF",
    generateReport: "Generate report →",

    monthlyTitle: "Monthly Report",
    monthlyDesc: "Overview of integration health, alerts and performance metrics for the month.",
    migrationTitle: "S/4HANA Migration Analysis",
    migrationDesc: "Complete report on dead code, customizations and migration risks.",
    roiTitle: "ROI Report",
    roiDesc: "Return on investment: time saved, alerts prevented and savings.",
    executiveTitle: "Executive Summary",
    executiveDesc: "High-level summary to present to the end client.",

    monthlyHeading: "Monthly Integrations Report",
    healthScoreSection: "Health Score",
    overallScore: "Overall Score",
    avgUptime: "Avg Uptime",
    avgLatency: "Avg Latency",
    errorRate: "Error Rate",
    integrationsSection: (n) => `Integrations (${n})`,
    colIntegration: "Integration",
    colType: "Type",
    colStatus: "Status",
    colLatency: "Latency",
    colError: "Error",
    colUptime: "Uptime",
    alertsSummarySection: "Alerts Summary",
    alertTotal: "Total",
    alertCritical: "Critical",
    alertHigh: "High",
    alertResolved: "Resolved",
    alertPending: "Pending",
    resolved: "Resolved",
    pending: "Pending",
    analysisSection: "Analysis",
    analysisScorePre: "The environment of client ",
    analysisScoreMid: " shows a Health Score of ",
    analysisScorePost: " this period.",
    analysisIntegrations: (active, total, pct) => `Of the ${total} monitored integrations, ${active} are active (${pct}% availability).`,
    analysisHighErrorRate: (rate) => `⚠️ The average error rate (${rate}%) is above the recommended threshold (5%). Investigation required.`,
    analysisHighLatency: (latency) => `⚠️ The average latency (${latency}ms) is high. Checking infrastructure is recommended.`,
    analysisPendingAlerts: (n) => `🔴 There are ${n} pending alerts that require attention.`,
    analysisAllResolved: "✅ All alerts were resolved this period.",

    migrationHeading: "S/4HANA Migration Analysis",
    generatedOn: (date) => `Generated on ${date}`,
    deadCodeSection: "Dead Code Analysis",
    objectsAnalyzed: "Objects Analyzed",
    toRetire: "To Retire",
    toReview: "To Review",
    toKeep: "To Keep",
    colObject: "Object",
    colLastUsed: "Last Used",
    colExecutions: "Executions",
    colAction: "Action",
    never: "Never",
    riskSection: "Risk Assessment",
    migrationComplexity: "Migration Complexity",
    complexityHigh: "HIGH",
    complexityMedium: "MEDIUM",
    complexityLow: "LOW",
    complexityDesc: (total, retire) => `${total} custom objects identified. ${retire} can be removed before migration.`,
    envStability: "Environment Stability",
    stable: "STABLE",
    attention: "ATTENTION",
    unstable: "UNSTABLE",
    stabilityDesc: (score, advice) => `Current Health Score: ${score}/100. ${advice}`,
    stabilityStabilize: "Stabilizing before starting the migration is recommended.",
    stabilityReady: "Environment ready to start migration.",
    effortEstimate: "Effort Estimate",
    effortDesc: (total) => `Based on ${total} objects × 4-8h per object (analysis, testing, migration).`,
    recommendationsSection: "Recommendations",
    rec1: (retire) => `Remove ${retire} objects classified as RETIRE before starting the migration`,
    rec2: (review) => `Review ${review} objects with sporadic usage — confirm need with the functional team`,
    rec3: (keep) => `Document ${keep} active objects for inclusion in the test scope`,
    rec4: "Create an S/4HANA sandbox environment for compatibility testing",
    rec5: "Define a migration window with minimal operational impact",
    priorityLabel: (p) => `Priority: ${p}`,
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityNormal: "Normal",

    roiHeading: "ROI Report — SAPLINK",
    roiSection: "Return on Investment",
    estimatedSavings: "Estimated Savings",
    hoursSaved: "Hours Saved",
    alertsResolved: "Alerts Resolved",
    preventedDowntime: "Prevented Downtime",
    methodologySection: "Calculation Methodology",
    methodDiagnosisWithout: "Average diagnosis time without SAPLINK",
    perIncidentHours: (h) => `${h}h per incident`,
    methodDiagnosisWith: "Average time with SAPLINK (AI + alerts)",
    perIncidentMin: (m) => `${m} min per incident`,
    methodHourlyRate: "Senior consultant hourly cost",
    hourlyRateValue: (r) => `R$ ${r}/h`,
    methodAlertsHandled: "Alerts handled in the period",
    totalSavings: "Total savings",
    benefitsSection: "Tangible Benefits",
    benefit1Title: "Diagnosis 90% faster",
    benefit1Desc: (h, m) => `From ${h}h to ${m}min with AI`,
    benefit2Title: "Proactive alerts",
    benefit2Desc: "Issues detected before the client notices",
    benefit3Title: "Full visibility",
    benefit3Desc: (n) => `${n} integrations monitored 24/7`,
    benefit4Title: "Team scalability",
    benefit4Desc: "Juniors handle what only seniors used to",
    benefit5Title: "Monthly proof of value",
    benefit5Desc: "Reports with visible ROI for renewal",
    benefit6Title: "Accelerated migration",
    benefit6Desc: (n) => `${n} objects mapped for S/4HANA`,

    executiveHeading: "Executive Summary",
    executiveDocNote: "Document for presentation to the end client",
    execGeneralSituation: "1. General Situation",
    execSituationPre: "The SAP environment of ",
    execSituationMid: " has a score of ",
    execSituationPost: (month) => ` in ${month}.`,
    execHealthy: "✅ The environment is healthy and stable.",
    execNeedsAttention: "⚠️ The environment requires attention in some areas.",
    execProblems: "🔴 The environment has issues that require immediate action.",
    execKeyNumbers: "2. Key Numbers",
    execMonitoredIntegrations: "Monitored integrations",
    execAvgAvailability: "Average availability",
    execResolvedIncidents: "Resolved incidents",
    execHoursSaved: "Hours saved",
    execEstSavings: "Estimated savings",
    execPreventedDowntime: "Prevented downtime",
    execActionsTaken: "3. Actions Taken",
    execAction1: (n) => `Continuous monitoring of ${n} integrations with collection every 30 seconds`,
    execAction2: (n) => `${n} alerts identified and resolved proactively`,
    execAction3: "AI-powered diagnostics for accelerated problem resolution",
    execAction4: (n) => `Analysis of ${n} custom objects for migration preparation`,
    execNextSteps: "4. Next Steps",
    execNextResolve: (n) => `Resolve ${n} pending alerts`,
    execNextMaintain: "Maintain continuous monitoring",
    execNextReduceError: "Investigate and reduce the integrations' error rate",
    execNextErrorOk: "Keep the error rate within acceptable limits",
    execNextRetire: (n) => `Start removing ${n} inactive objects`,
    execNextClean: "Clean environment — ready for the next phase",
    execNextReview: "Schedule a monthly review with the technical team",
  },
  es: {
    title: "Informes",
    subtitle: "Genere informes detallados para sus clientes con la marca de su consultoría",
    cnpjLabel: "CNPJ:",
    cnpjNotInformed: "No informado",
    loading: "Cargando...",
    loadingData: "Cargando datos...",
    back: "← Volver a los informes",
    exportPdf: "Exportar PDF",
    generateReport: "Generar informe →",

    monthlyTitle: "Informe Mensual",
    monthlyDesc: "Visión general de la salud de las integraciones, alertas y métricas de rendimiento del mes.",
    migrationTitle: "Análisis de Migración S/4HANA",
    migrationDesc: "Informe completo de dead code, personalizaciones y riesgos para la migración.",
    roiTitle: "Informe de ROI",
    roiDesc: "Retorno de la inversión: tiempo ahorrado, alertas prevenidas y ahorro.",
    executiveTitle: "Resumen Ejecutivo",
    executiveDesc: "Resumen de alto nivel para presentar al cliente final.",

    monthlyHeading: "Informe Mensual de Integraciones",
    healthScoreSection: "Health Score",
    overallScore: "Score General",
    avgUptime: "Uptime Promedio",
    avgLatency: "Latencia Promedio",
    errorRate: "Tasa de Error",
    integrationsSection: (n) => `Integraciones (${n})`,
    colIntegration: "Integración",
    colType: "Tipo",
    colStatus: "Status",
    colLatency: "Latencia",
    colError: "Error",
    colUptime: "Uptime",
    alertsSummarySection: "Resumen de Alertas",
    alertTotal: "Total",
    alertCritical: "Críticas",
    alertHigh: "Altas",
    alertResolved: "Resueltas",
    alertPending: "Pendientes",
    resolved: "Resuelto",
    pending: "Pendiente",
    analysisSection: "Análisis",
    analysisScorePre: "El ambiente del cliente ",
    analysisScoreMid: " presenta un Health Score de ",
    analysisScorePost: " en este período.",
    analysisIntegrations: (active, total, pct) => `De las ${total} integraciones monitoreadas, ${active} están activas (${pct}% de disponibilidad).`,
    analysisHighErrorRate: (rate) => `⚠️ La tasa de error promedio (${rate}%) está por encima de lo recomendado (5%). Se requiere investigación.`,
    analysisHighLatency: (latency) => `⚠️ La latencia promedio (${latency}ms) está elevada. Se recomienda verificar la infraestructura.`,
    analysisPendingAlerts: (n) => `🔴 Existen ${n} alertas pendientes que requieren atención.`,
    analysisAllResolved: "✅ Todas las alertas fueron resueltas en este período.",

    migrationHeading: "Análisis de Migración S/4HANA",
    generatedOn: (date) => `Generado el ${date}`,
    deadCodeSection: "Análisis de Dead Code",
    objectsAnalyzed: "Objetos Analizados",
    toRetire: "Para Retirar",
    toReview: "Para Revisar",
    toKeep: "Para Mantener",
    colObject: "Objeto",
    colLastUsed: "Último Uso",
    colExecutions: "Ejecuciones",
    colAction: "Acción",
    never: "Nunca",
    riskSection: "Evaluación de Riesgo",
    migrationComplexity: "Complejidad de la Migración",
    complexityHigh: "ALTA",
    complexityMedium: "MEDIA",
    complexityLow: "BAJA",
    complexityDesc: (total, retire) => `${total} objetos personalizados identificados. ${retire} pueden eliminarse antes de la migración.`,
    envStability: "Estabilidad del Ambiente",
    stable: "ESTABLE",
    attention: "ATENCIÓN",
    unstable: "INESTABLE",
    stabilityDesc: (score, advice) => `Health Score actual: ${score}/100. ${advice}`,
    stabilityStabilize: "Se recomienda estabilizar antes de iniciar la migración.",
    stabilityReady: "Ambiente listo para iniciar la migración.",
    effortEstimate: "Estimación de Esfuerzo",
    effortDesc: (total) => `Basado en ${total} objetos × 4-8h por objeto (análisis, prueba, migración).`,
    recommendationsSection: "Recomendaciones",
    rec1: (retire) => `Eliminar ${retire} objetos clasificados como RETIRAR antes de iniciar la migración`,
    rec2: (review) => `Revisar ${review} objetos con uso esporádico — confirmar necesidad con el equipo funcional`,
    rec3: (keep) => `Documentar ${keep} objetos activos para incluir en el alcance de pruebas`,
    rec4: "Crear un ambiente sandbox S/4HANA para pruebas de compatibilidad",
    rec5: "Definir una ventana de migración con mínimo impacto operativo",
    priorityLabel: (p) => `Prioridad: ${p}`,
    priorityHigh: "Alta",
    priorityMedium: "Media",
    priorityNormal: "Normal",

    roiHeading: "Informe de ROI — SAPLINK",
    roiSection: "Retorno de la Inversión",
    estimatedSavings: "Ahorro Estimado",
    hoursSaved: "Horas Ahorradas",
    alertsResolved: "Alertas Resueltas",
    preventedDowntime: "Downtime Prevenido",
    methodologySection: "Metodología de Cálculo",
    methodDiagnosisWithout: "Tiempo promedio de diagnóstico sin SAPLINK",
    perIncidentHours: (h) => `${h}h por incidente`,
    methodDiagnosisWith: "Tiempo promedio con SAPLINK (IA + alertas)",
    perIncidentMin: (m) => `${m} min por incidente`,
    methodHourlyRate: "Costo/hora consultor sénior",
    hourlyRateValue: (r) => `R$ ${r}/h`,
    methodAlertsHandled: "Alertas atendidas en el período",
    totalSavings: "Ahorro total",
    benefitsSection: "Beneficios Tangibles",
    benefit1Title: "Diagnóstico 90% más rápido",
    benefit1Desc: (h, m) => `De ${h}h a ${m}min con IA`,
    benefit2Title: "Alertas proactivas",
    benefit2Desc: "Problemas detectados antes de que el cliente los note",
    benefit3Title: "Visibilidad total",
    benefit3Desc: (n) => `${n} integraciones monitoreadas 24/7`,
    benefit4Title: "Escalabilidad del equipo",
    benefit4Desc: "Junior resuelve lo que solo el sénior resolvía",
    benefit5Title: "Prueba de valor mensual",
    benefit5Desc: "Informes con ROI visible para la renovación",
    benefit6Title: "Migración acelerada",
    benefit6Desc: (n) => `${n} objetos mapeados para S/4HANA`,

    executiveHeading: "Resumen Ejecutivo",
    executiveDocNote: "Documento para presentación al cliente final",
    execGeneralSituation: "1. Situación General",
    execSituationPre: "El ambiente SAP del ",
    execSituationMid: " presenta una nota ",
    execSituationPost: (month) => ` en el mes de ${month}.`,
    execHealthy: "✅ El ambiente está saludable y estable.",
    execNeedsAttention: "⚠️ El ambiente requiere atención en algunos puntos.",
    execProblems: "🔴 El ambiente presenta problemas que necesitan acción inmediata.",
    execKeyNumbers: "2. Números Clave",
    execMonitoredIntegrations: "Integraciones monitoreadas",
    execAvgAvailability: "Disponibilidad promedio",
    execResolvedIncidents: "Incidentes resueltos",
    execHoursSaved: "Horas ahorradas",
    execEstSavings: "Ahorro estimado",
    execPreventedDowntime: "Downtime prevenido",
    execActionsTaken: "3. Acciones Realizadas",
    execAction1: (n) => `Monitoreo continuo de ${n} integraciones con recolección cada 30 segundos`,
    execAction2: (n) => `${n} alertas identificadas y resueltas proactivamente`,
    execAction3: "Diagnósticos con IA para resolución acelerada de problemas",
    execAction4: (n) => `Análisis de ${n} objetos personalizados para preparación de la migración`,
    execNextSteps: "4. Próximos Pasos",
    execNextResolve: (n) => `Resolver ${n} alertas pendientes`,
    execNextMaintain: "Mantener monitoreo continuo",
    execNextReduceError: "Investigar y reducir la tasa de error de las integraciones",
    execNextErrorOk: "Mantener la tasa de error dentro de lo aceptable",
    execNextRetire: (n) => `Iniciar la eliminación de ${n} objetos inactivos`,
    execNextClean: "Ambiente limpio — listo para la próxima fase",
    execNextReview: "Programar una revisión mensual con el equipo técnico",
  },
};
