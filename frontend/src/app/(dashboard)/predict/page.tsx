"use client";

import { useEffect, useState } from "react";
import { getPredict, getBenchmark, type Prediction, type BenchmarkRow } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

const LEVEL: Record<string, { cls: string; bar: string }> = {
  HIGH: { cls: "text-rose-300 border-rose-500/30 bg-rose-500/[0.06]", bar: "bg-rose-500" },
  MEDIUM: { cls: "text-amber-300 border-amber-500/30 bg-amber-500/[0.06]", bar: "bg-amber-400" },
  LOW: { cls: "text-emerald-300 border-emerald-500/20 bg-emerald-500/[0.04]", bar: "bg-emerald-500" },
};

export default function PredictPage() {
  const { lang } = useLang();
  const t = T[lang];
  const LEVEL_LABEL: Record<string, string> = { HIGH: t.levelHigh, MEDIUM: t.levelMedium, LOW: t.levelLow };
  const [pred, setPred] = useState<{ predictions: Prediction[]; summary: { high: number; medium: number; low: number } } | null>(null);
  const [bench, setBench] = useState<{ rows: BenchmarkRow[]; marketTenants: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPredict(), getBenchmark()])
      .then(([p, b]) => { setPred(p); setBench(b); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🔮 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen={t.screenName} data={{ previsao: pred?.summary, topRiscos: pred?.predictions?.slice(0, 8), benchmark: bench?.rows?.slice(0, 8) }} /></div>
      </div>

      {/* E1 — Previsão */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{t.failureRisk}</h2>
          {pred && <span className="text-sm text-[#9b95ad]">{t.riskSummary(pred.summary.high, pred.summary.medium, pred.summary.low)}</span>}
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
                    <div className="text-[11px]">{LEVEL_LABEL[p.level]}</div>
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
                <p className="text-[10px] text-[#6b6580] mt-1">{t.samples(p.samples)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* E2 — Benchmark */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{t.marketBenchmark}</h2>
          {bench && <span className="text-xs text-[#9b95ad]">{t.benchmarkMeta(bench.marketTenants)}</span>}
        </div>
        {bench && bench.rows.length > 0 ? (
          <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-3 py-2 font-medium">{t.colType}</th><th className="px-3 py-2 font-medium text-right">{t.colYourUptime}</th>
                <th className="px-3 py-2 font-medium text-right">{t.colMarket}</th><th className="px-3 py-2 font-medium text-right">{t.colPercentile}</th>
                <th className="px-3 py-2 font-medium text-right">{t.colYourError}</th><th className="px-3 py-2 font-medium text-right">{t.colLatency}</th>
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
          <p className="text-sm text-[#9b95ad]">{t.noMarketData}</p>
        )}
        <p className="text-[11px] text-[#6b6580]">{t.percentileNote}</p>
      </section>
    </div>
  );
}
