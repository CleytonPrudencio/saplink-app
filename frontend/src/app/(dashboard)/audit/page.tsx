"use client";

import { useEffect, useState } from "react";
import { getAudit } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { usePaginate, Pagination } from "@/components/Pagination";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

export default function AuditPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [data, setData] = useState<{ summary: { changes: number; remediations: number; sodViolations: number }; ledger: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<any>(null);
  useEffect(() => { getAudit().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);
  const pag = usePaginate<any>(data?.ledger || [], 25);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🛡️ {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        {data && <div className="mt-3"><ExplainData screen="Auditoria & Compliance" data={{ resumo: data.summary, amostra: data.ledger.slice(0, 15) }} label={t.explainLabel} /></div>}
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-3 max-w-lg">
          <Stat label={t.statChanges} value={data.summary.changes} accent="text-[#e2e0ea]" />
          <Stat label={t.statRemediations} value={data.summary.remediations} accent="text-cyan-300" />
          <Stat label={t.statSodViolations} value={data.summary.sodViolations} accent={data.summary.sodViolations ? "text-rose-400" : "text-emerald-400"} />
        </div>
      )}

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : !data || data.ledger.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">{t.empty}</div>
      ) : (
        <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-3 py-2 font-medium">{t.colWhen}</th><th className="px-3 py-2 font-medium">{t.colType}</th>
              <th className="px-3 py-2 font-medium">{t.colWho}</th><th className="px-3 py-2 font-medium">{t.colWhat}</th><th className="px-3 py-2 font-medium">{t.colClient}</th>
            </tr></thead>
            <tbody>
              {pag.pageItems.map((e: any, i: number) => (
                <tr key={i} onClick={() => setSel(e)} className={`border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors ${e.flag ? "bg-rose-500/[0.05]" : ""}`}>
                  <td className="px-3 py-2 text-xs text-[#9b95ad] whitespace-nowrap">{e.at ? new Date(e.at).toLocaleString("pt-BR") : "—"}</td>
                  <td className="px-3 py-2"><span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06]">{e.kind}</span></td>
                  <td className="px-3 py-2 text-[#c9c5d6]">{e.who}</td>
                  <td className="px-3 py-2 text-[#e2e0ea]">{e.what}{e.flag && <span className="block text-[11px] text-rose-300 mt-0.5">⚠ {e.flag}</span>}</td>
                  <td className="px-3 py-2 text-[#9b95ad]">{e.client}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 pb-3"><Pagination {...pag} /></div>
        </div>
      )}

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon="🛡️"
          title={sel.what}
          subtitle={t.sheetSub}
          badge={<span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] shrink-0">{sel.kind}</span>}
          fields={[
            { label: t.fldWhen, value: sel.at ? new Date(sel.at).toLocaleString("pt-BR") : "—" },
            { label: t.fldType, value: sel.kind },
            { label: t.fldWho, value: sel.who },
            { label: t.fldWhat, value: sel.what },
            { label: t.fldClient, value: sel.client },
            { label: t.fldFlag, value: sel.flag ? <span className="text-rose-300">⚠ {sel.flag}</span> : undefined },
          ]}
          guideTitle={sel.flag ? t.guideTitle : undefined}
          guideSteps={sel.flag ? t.guideSod : undefined}
        >
          <ExplainData screen="Auditoria & Compliance — item" data={{ evento: sel }} />
        </DetailSheet>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 text-center"><div className={`text-2xl font-bold ${accent}`}>{value}</div><div className="text-[11px] text-[#9b95ad] mt-0.5">{label}</div></div>;
}
