"use client";

import { useEffect, useState } from "react";
import { getPredict, getBenchmark, type Prediction, type BenchmarkRow } from "@/lib/api";

const LEVEL: Record<string, { label: string; cls: string; bar: string }> = {
  HIGH: { label: "Alto", cls: "text-rose-300 border-rose-500/30 bg-rose-500/[0.06]", bar: "bg-rose-500" },
  MEDIUM: { label: "Médio", cls: "text-amber-300 border-amber-500/30 bg-amber-500/[0.06]", bar: "bg-amber-400" },
  LOW: { label: "Baixo", cls: "text-emerald-300 border-emerald-500/20 bg-emerald-500/[0.04]", bar: "bg-emerald-500" },
};

export default function PredictPage() {
  const [pred, setPred] = useState<{ predictions: Prediction[]; summary: { high: number; medium: number; low: number } } | null>(null);
  const [bench, setBench] = useState<{ rows: BenchmarkRow[]; marketTenants: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPredict(), getBenchmark()])
      .then(([p, b]) => { setPred(p); setBench(b); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🔮 Previsão & Benchmark</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Risco de falha por integração (estado + tendência) e comparação com o mercado.</p>
      </div>

      {/* E1 — Previsão */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Risco de falha</h2>
          {pred && <span className="text-sm text-[#9b95ad]">{pred.summary.high} alto · {pred.summary.medium} médio · {pred.summary.low} baixo</span>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {pred?.predictions.filter((p) => p.level !== "LOW").concat(pred.predictions.filter((p) => p.level === "LOW")).map((p) => {
            const lv = LEVEL[p.level];
            return (
              <div key={p.integrationId} className={`rounded-xl border p-4 ${lv.cls}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#e2e0ea] truncate">{p.integration}</p>
                    <p className="text-xs text-[#9b95ad]">{p.client} · {p.status}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold">{p.riskScore}</div>
                    <div className="text-[11px]">{lv.label}</div>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.08] rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${lv.bar}`} style={{ width: `${p.riskScore}%` }} />
                </div>
                <p className="text-xs text-[#c9c5d6] mt-2">{p.forecast}</p>
                {p.signals.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.signals.map((s, i) => <span key={i} className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[#9b95ad]">{s}</span>)}
                  </div>
                )}
                <p className="text-[10px] text-[#6b6580] mt-1">{p.samples} amostra(s) de histórico</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* E2 — Benchmark */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Benchmark de mercado</h2>
          {bench && <span className="text-xs text-[#9b95ad]">agregado anônimo · {bench.marketTenants} consultoria(s) na base</span>}
        </div>
        {bench && bench.rows.length > 0 ? (
          <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-3 py-2 font-medium">Tipo</th><th className="px-3 py-2 font-medium text-right">Seu uptime</th>
                <th className="px-3 py-2 font-medium text-right">Mercado</th><th className="px-3 py-2 font-medium text-right">Percentil</th>
                <th className="px-3 py-2 font-medium text-right">Seu erro</th><th className="px-3 py-2 font-medium text-right">Lat. (você/mkt)</th>
              </tr></thead>
              <tbody>
                {bench.rows.map((r) => (
                  <tr key={r.type} className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 font-mono text-[#e2e0ea]">{r.type} <span className="text-xs text-[#9b95ad]">({r.count})</span></td>
                    <td className="px-3 py-2 text-right">{r.myUptime}%</td>
                    <td className="px-3 py-2 text-right text-[#9b95ad]">{r.marketUptime}%</td>
                    <td className={`px-3 py-2 text-right font-semibold ${r.uptimePercentile >= 50 ? "text-emerald-400" : "text-amber-300"}`}>P{r.uptimePercentile}</td>
                    <td className="px-3 py-2 text-right text-[#9b95ad]">{r.myErrorRate}%</td>
                    <td className="px-3 py-2 text-right text-[#9b95ad]">{r.myLatency}/{r.marketLatency}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#9b95ad]">Sem dados de mercado suficientes ainda.</p>
        )}
        <p className="text-[11px] text-[#6b6580]">Percentil de uptime: % da base que está no seu nível ou abaixo (maior = melhor). Fica mais rico conforme mais consultorias entram.</p>
      </section>
    </div>
  );
}
