"use client";

import { useEffect, useState } from "react";
import { getS4CleanCore } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

const SEV: Record<string, string> = { HIGH: "bg-rose-500/15 text-rose-300", MEDIUM: "bg-amber-500/15 text-amber-300", LOW: "bg-emerald-500/15 text-emerald-300" };
function scoreColor(n: number) { return n >= 80 ? "text-emerald-400" : n >= 50 ? "text-amber-300" : "text-rose-400"; }

export default function CleanCorePage() {
  const { lang } = useLang();
  const t = T[lang];
  const CAT: Record<string, string> = {
    DEPRECATED_API: t.catDeprecatedApi, CUSTOM_CDS: t.catCustomCds, SIDE_BY_SIDE: t.catSideBySide, IN_APP: t.catInApp, MODIFICATION: t.catModification,
  };
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getS4CleanCore().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🧼 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen={t.explainScreen} data={{ score: data?.overall, porCategoria: data?.byCategory, itens: data?.items?.slice(0, 12) }} label={t.explainLabel} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] text-center">
          <div className={`text-6xl font-bold ${scoreColor(data?.overall ?? 0)}`}>{data?.overall ?? 0}</div>
          <div className="text-sm text-[#9b95ad] mt-2">{t.overallScore}</div>
          <div className="h-2 bg-white/[0.08] rounded-full mt-4 overflow-hidden">
            <div className={`h-full ${(data?.overall ?? 0) >= 80 ? "bg-emerald-500" : (data?.overall ?? 0) >= 50 ? "bg-amber-400" : "bg-rose-500"}`} style={{ width: `${data?.overall ?? 0}%` }} />
          </div>
        </div>
        <div className="lg:col-span-2 bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
          <h2 className="text-sm font-semibold text-[#9b95ad] mb-3">{t.scorePerClient}</h2>
          <div className="space-y-2">
            {(data?.perClient || []).map((c: any) => (
              <div key={c.clientId} className="flex items-center gap-3">
                <span className="text-sm text-[#e2e0ea] w-48 truncate">{c.client}</span>
                <div className="flex-1 h-2 bg-white/[0.08] rounded-full overflow-hidden">
                  <div className={`h-full ${c.score >= 80 ? "bg-emerald-500" : c.score >= 50 ? "bg-amber-400" : "bg-rose-500"}`} style={{ width: `${c.score}%` }} />
                </div>
                <span className={`text-sm font-bold w-10 text-right ${scoreColor(c.score)}`}>{c.score}</span>
                <span className="text-xs text-[#9b95ad] w-20 text-right">{t.itemsSuffix(c.items)}</span>
              </div>
            ))}
            {(!data?.perClient || data.perClient.length === 0) && <p className="text-sm text-[#9b95ad]">{t.noData}</p>}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
            <th className="px-3 py-2 font-medium">{t.colCategory}</th><th className="px-3 py-2 font-medium">{t.colObject}</th>
            <th className="px-3 py-2 font-medium">{t.colSeverity}</th><th className="px-3 py-2 font-medium text-right">{t.colPoints}</th>
            <th className="px-3 py-2 font-medium">{t.colRecommendation}</th><th className="px-3 py-2 font-medium">{t.colClient}</th>
          </tr></thead>
          <tbody>
            {(data?.items || []).map((i: any, k: number) => (
              <tr key={k} className="border-b border-white/[0.04]">
                <td className="px-3 py-2 text-[#c9c5d6]">{CAT[i.category] || i.category}</td>
                <td className="px-3 py-2 font-mono text-[#e2e0ea]">{i.object}</td>
                <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${SEV[i.severity] || ""}`}>{i.severity}</span></td>
                <td className="px-3 py-2 text-right text-rose-300">-{i.points}</td>
                <td className="px-3 py-2 text-[#c9c5d6]">{i.recommendation || "—"}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{i.client}</td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && <tr><td colSpan={6} className="px-3 py-6 text-center text-[#9b95ad]">{t.emptyTable}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
