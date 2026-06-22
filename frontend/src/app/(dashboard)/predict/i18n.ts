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
  },
};
