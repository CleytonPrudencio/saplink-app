import type { Lang } from "@/i18n/I18n";

export const T: Record<
  Lang,
  {
    loading: string;
    title: string;
    subtitle: string;
    screenName: string;
    failureRisk: string;
    riskSummary: (high: number, medium: number, low: number) => string;
    levelHigh: string;
    levelMedium: string;
    levelLow: string;
    samples: (n: number) => string;
    marketBenchmark: string;
    benchmarkMeta: (tenants: number) => string;
    colType: string;
    colYourUptime: string;
    colMarket: string;
    colPercentile: string;
    colYourError: string;
    colLatency: string;
    noMarketData: string;
    percentileNote: string;
    // DetailSheet — previsão
    sheetPredSub: string;
    fldClient: string;
    fldStatus: string;
    fldRiskScore: string;
    fldLevel: string;
    fldForecast: string;
    fldSignals: string;
    fldErrorRate: string;
    fldUptime: string;
    fldLatency: string;
    fldQueueDepth: string;
    fldSamples: string;
    predGuideTitle: string;
    predGuideHigh: string[];
    predGuideMedium: string[];
    predGuideLow: string[];
    // DetailSheet — benchmark
    sheetBenchSub: string;
    fldCount: string;
    fldYourUptime: string;
    fldMarketUptime: string;
    fldPercentile: string;
    fldYourError: string;
    fldMarketError: string;
    fldYourLatency: string;
    fldMarketLatency: string;
    benchGuideTitle: string;
    benchGuideBelow: string[];
    benchGuideAbove: string[];
  }
> = {
  pt: {
    loading: "Carregando...",
    title: "Previsão & Benchmark",
    subtitle: "Risco de falha por integração (estado + tendência) e comparação com o mercado.",
    screenName: "Previsão & Benchmark",
    failureRisk: "Risco de falha",
    riskSummary: (high, medium, low) => `${high} alto · ${medium} médio · ${low} baixo`,
    levelHigh: "Alto",
    levelMedium: "Médio",
    levelLow: "Baixo",
    samples: (n) => `${n} amostra(s) de histórico`,
    marketBenchmark: "Benchmark de mercado",
    benchmarkMeta: (tenants) => `agregado anônimo · ${tenants} consultoria(s) na base`,
    colType: "Tipo",
    colYourUptime: "Seu uptime",
    colMarket: "Mercado",
    colPercentile: "Percentil",
    colYourError: "Seu erro",
    colLatency: "Lat. (você/mkt)",
    noMarketData: "Sem dados de mercado suficientes ainda.",
    percentileNote:
      "Percentil de uptime: % da base que está no seu nível ou abaixo (maior = melhor). Fica mais rico conforme mais consultorias entram.",
    sheetPredSub: "Risco de falha da integração",
    fldClient: "Cliente",
    fldStatus: "Status",
    fldRiskScore: "Score de risco",
    fldLevel: "Nível",
    fldForecast: "Previsão",
    fldSignals: "Sinais",
    fldErrorRate: "Taxa de erro",
    fldUptime: "Uptime",
    fldLatency: "Latência",
    fldQueueDepth: "Fila",
    fldSamples: "Amostras de histórico",
    predGuideTitle: "O que fazer",
    predGuideHigh: [
      "Risco alto: agir agora, antes do incidente — abrir a integração e tratar os sinais listados (erro/latência/fila).",
      "Se a fila está crescendo, verificar travamento de processamento e reprocessar pendências.",
      "Avisar o cliente proativamente e registrar a remediação na Auditoria.",
    ],
    predGuideMedium: [
      "Risco médio: monitorar de perto e planejar ação na janela antes que escale para alto.",
      "Revisar os sinais e corrigir a causa raiz (ex.: pico de latência, erros intermitentes).",
    ],
    predGuideLow: [
      "Risco baixo: sem ação imediata, manter no monitoramento normal.",
    ],
    sheetBenchSub: "Benchmark de mercado por tipo",
    fldCount: "Suas integrações",
    fldYourUptime: "Seu uptime",
    fldMarketUptime: "Uptime do mercado",
    fldPercentile: "Percentil de uptime",
    fldYourError: "Seu erro",
    fldMarketError: "Erro do mercado",
    fldYourLatency: "Sua latência",
    fldMarketLatency: "Latência do mercado",
    benchGuideTitle: "O que fazer",
    benchGuideBelow: [
      "Você está abaixo do mercado neste tipo: priorizar melhoria — comparar seu erro/latência com a referência do mercado.",
      "Identificar as integrações deste tipo com pior desempenho e tratá-las primeiro.",
    ],
    benchGuideAbove: [
      "Acima da mediana do mercado: bom desempenho, manter o padrão atual.",
    ],
  },
  en: {
    loading: "Loading...",
    title: "Forecast & Benchmark",
    subtitle: "Failure risk per integration (state + trend) and comparison with the market.",
    screenName: "Forecast & Benchmark",
    failureRisk: "Failure risk",
    riskSummary: (high, medium, low) => `${high} high · ${medium} medium · ${low} low`,
    levelHigh: "High",
    levelMedium: "Medium",
    levelLow: "Low",
    samples: (n) => `${n} history sample(s)`,
    marketBenchmark: "Market benchmark",
    benchmarkMeta: (tenants) => `anonymous aggregate · ${tenants} consultancy(ies) in the base`,
    colType: "Type",
    colYourUptime: "Your uptime",
    colMarket: "Market",
    colPercentile: "Percentile",
    colYourError: "Your error",
    colLatency: "Lat. (you/mkt)",
    noMarketData: "Not enough market data yet.",
    percentileNote:
      "Uptime percentile: % of the base at your level or below (higher = better). It gets richer as more consultancies join.",
    sheetPredSub: "Integration failure risk",
    fldClient: "Client",
    fldStatus: "Status",
    fldRiskScore: "Risk score",
    fldLevel: "Level",
    fldForecast: "Forecast",
    fldSignals: "Signals",
    fldErrorRate: "Error rate",
    fldUptime: "Uptime",
    fldLatency: "Latency",
    fldQueueDepth: "Queue",
    fldSamples: "History samples",
    predGuideTitle: "What to do",
    predGuideHigh: [
      "High risk: act now, before the incident — open the integration and address the listed signals (error/latency/queue).",
      "If the queue is growing, check for processing stalls and reprocess pending items.",
      "Proactively notify the client and log the remediation in Audit.",
    ],
    predGuideMedium: [
      "Medium risk: watch closely and plan action in the window before it escalates to high.",
      "Review the signals and fix the root cause (e.g., latency spike, intermittent errors).",
    ],
    predGuideLow: [
      "Low risk: no immediate action, keep normal monitoring.",
    ],
    sheetBenchSub: "Market benchmark by type",
    fldCount: "Your integrations",
    fldYourUptime: "Your uptime",
    fldMarketUptime: "Market uptime",
    fldPercentile: "Uptime percentile",
    fldYourError: "Your error",
    fldMarketError: "Market error",
    fldYourLatency: "Your latency",
    fldMarketLatency: "Market latency",
    benchGuideTitle: "What to do",
    benchGuideBelow: [
      "You are below the market for this type: prioritize improvement — compare your error/latency against the market reference.",
      "Identify the worst-performing integrations of this type and address them first.",
    ],
    benchGuideAbove: [
      "Above the market median: good performance, keep the current standard.",
    ],
  },
  es: {
    loading: "Cargando...",
    title: "Pronóstico & Benchmark",
    subtitle: "Riesgo de fallo por integración (estado + tendencia) y comparación con el mercado.",
    screenName: "Pronóstico & Benchmark",
    failureRisk: "Riesgo de fallo",
    riskSummary: (high, medium, low) => `${high} alto · ${medium} medio · ${low} bajo`,
    levelHigh: "Alto",
    levelMedium: "Medio",
    levelLow: "Bajo",
    samples: (n) => `${n} muestra(s) de historial`,
    marketBenchmark: "Benchmark de mercado",
    benchmarkMeta: (tenants) => `agregado anónimo · ${tenants} consultoría(s) en la base`,
    colType: "Tipo",
    colYourUptime: "Tu disponibilidad",
    colMarket: "Mercado",
    colPercentile: "Percentil",
    colYourError: "Tu error",
    colLatency: "Lat. (tú/mkt)",
    noMarketData: "Aún no hay suficientes datos de mercado.",
    percentileNote:
      "Percentil de disponibilidad: % de la base que está en tu nivel o por debajo (mayor = mejor). Se enriquece a medida que entran más consultorías.",
    sheetPredSub: "Riesgo de fallo de la integración",
    fldClient: "Cliente",
    fldStatus: "Estado",
    fldRiskScore: "Score de riesgo",
    fldLevel: "Nivel",
    fldForecast: "Pronóstico",
    fldSignals: "Señales",
    fldErrorRate: "Tasa de error",
    fldUptime: "Disponibilidad",
    fldLatency: "Latencia",
    fldQueueDepth: "Cola",
    fldSamples: "Muestras de historial",
    predGuideTitle: "Qué hacer",
    predGuideHigh: [
      "Riesgo alto: actuar ahora, antes del incidente — abrir la integración y tratar las señales listadas (error/latencia/cola).",
      "Si la cola está creciendo, verificar bloqueos de procesamiento y reprocesar pendientes.",
      "Avisar al cliente proactivamente y registrar la remediación en Auditoría.",
    ],
    predGuideMedium: [
      "Riesgo medio: monitorear de cerca y planear acción en la ventana antes de que escale a alto.",
      "Revisar las señales y corregir la causa raíz (p. ej., pico de latencia, errores intermitentes).",
    ],
    predGuideLow: [
      "Riesgo bajo: sin acción inmediata, mantener el monitoreo normal.",
    ],
    sheetBenchSub: "Benchmark de mercado por tipo",
    fldCount: "Tus integraciones",
    fldYourUptime: "Tu disponibilidad",
    fldMarketUptime: "Disponibilidad del mercado",
    fldPercentile: "Percentil de disponibilidad",
    fldYourError: "Tu error",
    fldMarketError: "Error del mercado",
    fldYourLatency: "Tu latencia",
    fldMarketLatency: "Latencia del mercado",
    benchGuideTitle: "Qué hacer",
    benchGuideBelow: [
      "Estás por debajo del mercado en este tipo: priorizar la mejora — comparar tu error/latencia con la referencia del mercado.",
      "Identificar las integraciones de este tipo con peor desempeño y tratarlas primero.",
    ],
    benchGuideAbove: [
      "Por encima de la mediana del mercado: buen desempeño, mantener el estándar actual.",
    ],
  },
};
