"use client";

import { useEffect, useState } from "react";
import { getAnomalies } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

type StKey = "stStopped" | "stDrop" | "stOk";
const ST: Record<string, { c: string; l: StKey }> = {
  STOPPED: { c: "text-rose-400", l: "stStopped" },
  DROP: { c: "text-amber-400", l: "stDrop" },
  OK: { c: "text-emerald-400", l: "stOk" },
};

export default function AnomalyPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [data, setData] = useState<{ summary: { tracked: number; anomalies: number }; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getAnomalies().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">📉 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitleBefore} <b>{t.subtitleBold}</b> {t.subtitleAfter}</p>
        <div className="mt-3"><ExplainData screen={t.explainScreen} data={{ summary: data?.summary, fluxos: data?.items?.slice(0, 10) }} /></div>
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <Stat label={t.statTracked} value={data.summary.tracked} accent="text-[#e2e0ea]" />
          <Stat label={t.statAnomaliesNow} value={data.summary.anomalies} accent={data.summary.anomalies ? "text-amber-300" : "text-emerald-300"} />
        </div>
      )}

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          {t.emptyBaseline}
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-3 py-2 font-medium">{t.thClient}</th><th className="px-3 py-2 font-medium">{t.thFlow}</th>
              <th className="px-3 py-2 font-medium">{t.thExpected}</th><th className="px-3 py-2 font-medium">{t.thCurrent}</th>
              <th className="px-3 py-2 font-medium">{t.thDrop}</th><th className="px-3 py-2 font-medium">{t.thStatus}</th>
            </tr></thead>
            <tbody>
              {data.items.map((a, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  <td className="px-3 py-2 text-[#9b95ad]">{a.client}</td>
                  <td className="px-3 py-2 text-[#e2e0ea]"><span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.06] mr-1">{a.source}</span>{a.artifact}</td>
                  <td className="px-3 py-2 text-[#9b95ad]">{a.expected}</td>
                  <td className="px-3 py-2 text-[#e2e0ea]">{a.current}</td>
                  <td className={`px-3 py-2 ${a.dropPct >= 40 ? "text-amber-300" : "text-[#9b95ad]"}`}>{a.dropPct > 0 ? `${a.dropPct}%` : "—"}</td>
                  <td className="px-3 py-2"><span className={`text-xs font-semibold ${(ST[a.status] || ST.OK).c}`}>{t[(ST[a.status] || ST.OK).l]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 text-center">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[11px] text-[#9b95ad] mt-0.5">{label}</div>
    </div>
  );
}
