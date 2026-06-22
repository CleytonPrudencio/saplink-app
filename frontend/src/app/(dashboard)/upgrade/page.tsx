"use client";

import { useEffect, useState } from "react";
import { getS4Upgrade, getS4Apis } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { usePaginate, Pagination } from "@/components/Pagination";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

const IMPACT_CLS: Record<string, string> = {
  BREAKING: "bg-rose-500/15 text-rose-300",
  DEPRECATED: "bg-orange-500/15 text-orange-300",
  CHANGED: "bg-amber-500/15 text-amber-300",
  OK: "bg-emerald-500/15 text-emerald-300",
};

export default function UpgradePage() {
  const { lang } = useLang();
  const t = T[lang];
  const [data, setData] = useState<any>(null);
  const [apis, setApis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getS4Upgrade(), getS4Apis()]).then(([u, a]) => { setData(u); setApis(a); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const IMPACT_LABEL: Record<string, string> = {
    BREAKING: t.impactBreaking, DEPRECATED: t.impactDeprecated, CHANGED: t.impactChanged, OK: t.impactOk,
  };

  const pag = usePaginate<any>(data?.findings || [], 20);
  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  const s = data?.summary?.byImpact || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🚀 {t.title} <span className="text-sm font-normal text-[#9b95ad]">{t.releasePrefix(data?.release)}</span></h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen={t.explainScreen} data={{ release: data?.release, resumo: data?.summary, achados: data?.findings?.slice(0, 12), apisDepreciadas: apis?.items?.filter((a: any) => a.deprecated) }} label={t.explainLabel} /></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["BREAKING", t.statBreaking, "text-rose-400"], ["DEPRECATED", t.statDeprecated, "text-orange-400"], ["CHANGED", t.statChanged, "text-amber-300"], ["OK", t.statCompatible, "text-emerald-400"]].map(([k, l, c]) => (
          <div key={k} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${c}`}>{s[k] || 0}</div>
            <div className="text-[11px] text-[#9b95ad] mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
            <th className="px-3 py-2 font-medium">{t.colImpact}</th><th className="px-3 py-2 font-medium">{t.colArea}</th>
            <th className="px-3 py-2 font-medium">{t.colObject}</th><th className="px-3 py-2 font-medium">{t.colRecommendation}</th><th className="px-3 py-2 font-medium">{t.colClient}</th>
          </tr></thead>
          <tbody>
            {pag.pageItems.map((f: any) => (
              <tr key={f.id} className="border-b border-white/[0.04]">
                <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${IMPACT_CLS[f.impact] || ""}`}>{IMPACT_LABEL[f.impact] || f.impact}</span></td>
                <td className="px-3 py-2 text-[#9b95ad]">{f.area}</td>
                <td className="px-3 py-2 font-mono text-[#e2e0ea]">{f.object}<span className="block text-xs text-[#9b95ad] font-sans">{f.detail}</span></td>
                <td className="px-3 py-2 text-[#c9c5d6]">{f.recommendation || "—"}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{f.client}</td>
              </tr>
            ))}
            {(!data?.findings || data.findings.length === 0) && <tr><td colSpan={5} className="px-3 py-6 text-center text-[#9b95ad]">{t.noFindings}</td></tr>}
          </tbody>
        </table>
        <div className="px-3 pb-3"><Pagination {...pag} /></div>
      </div>

      <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
        <h2 className="text-lg font-semibold mb-3">{t.deprecatedApisTitle(apis?.summary?.deprecated ?? 0)}</h2>
        <div className="space-y-2">
          {(apis?.items || []).filter((a: any) => a.deprecated).map((a: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2">
              <p className="text-sm font-mono text-[#e2e0ea]">{a.apiName} {a.version} <span className="text-xs text-[#9b95ad] font-sans">→ {a.replacement || t.migrateFallback}</span></p>
              <span className="text-[11px] text-rose-300">{t.deprecatesIn(a.deprecationRelease)}</span>
            </div>
          ))}
          {(apis?.summary?.deprecated ?? 0) === 0 && <p className="text-sm text-[#9b95ad]">{t.noDeprecated}</p>}
        </div>
      </div>
    </div>
  );
}
