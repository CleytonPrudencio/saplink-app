"use client";

import { useEffect, useState, useCallback } from "react";
import { getMe, getS4Fiscal, reprocessFiscal } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { usePaginate, Pagination } from "@/components/Pagination";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
const ST_CLS: Record<string, string> = {
  AUTHORIZED: "bg-emerald-500/15 text-emerald-300",
  REJECTED: "bg-rose-500/15 text-rose-300",
  CONTINGENCY: "bg-orange-500/15 text-orange-300",
  PENDING: "bg-amber-500/15 text-amber-300",
  CANCELLED: "bg-white/[0.06] text-[#9b95ad]",
};

export default function FiscalPage() {
  const { lang } = useLang();
  const t = T[lang];
  const ST_LABEL: Record<string, string> = {
    AUTHORIZED: t.stAuthorized, REJECTED: t.stRejected, CONTINGENCY: t.stContingency, PENDING: t.stPending, CANCELLED: t.stCancelled,
  };
  const FAM: Record<string, string> = { NFE: "NF-e", NFSE: "NFS-e", CTE: "CT-e", MDFE: "MDF-e", SPED: "SPED", ESOCIAL: "eSocial", EFDREINF: "EFD-Reinf", BILLING: t.famBilling, OUTROS: t.famOther };
  const [data, setData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState("");

  const load = useCallback(async () => { setData(await getS4Fiscal(family ? { family } : {})); }, [family]);
  useEffect(() => {
    getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {});
    load().catch(() => {}).finally(() => setLoading(false));
  }, [load]);

  async function onReprocess(id: string) {
    setBusy(id);
    try { await reprocessFiscal(id); await load(); } catch { /* ignore */ } finally { setBusy(""); }
  }

  const pag = usePaginate<any>(data?.items || [], 20);
  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  const s = data?.summary || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🧾 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen={t.explainScreen} data={{ resumo: data?.summary, bloqueados: (data?.items || []).filter((d: any) => !d.resolved).slice(0, 12) }} /></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFamily("")} className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer ${family === "" ? "bg-purple-500/20 text-purple-300" : "bg-[#1a1527] text-[#9b95ad] hover:text-white"}`}>{t.filterAll(s.total ?? 0)}</button>
        {(s.byFamily || []).map((b: any) => (
          <button key={b.family} onClick={() => setFamily(b.family)} className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer ${family === b.family ? "bg-purple-500/20 text-purple-300" : "bg-[#1a1527] text-[#9b95ad] hover:text-white"}`}>{FAM[b.family] || b.family} ({b.count})</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat l={t.statBlocked} v={`${s.blocked ?? 0}`} c="text-rose-400" />
        <Stat l={t.statAtRisk} v={brl(s.atRiskCents ?? 0)} c="text-amber-300" />
        <Stat l={t.statRejected} v={`${s.byStatus?.REJECTED ?? 0}`} c="text-rose-400" />
        <Stat l={t.statTotal} v={`${s.total ?? 0}`} c="text-[#e2e0ea]" />
      </div>

      <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
            <th className="px-3 py-2 font-medium">{t.colType}</th><th className="px-3 py-2 font-medium">{t.colNumber}</th>
            <th className="px-3 py-2 font-medium">{t.colStatus}</th><th className="px-3 py-2 font-medium">{t.colSefaz}</th>
            <th className="px-3 py-2 font-medium text-right">{t.colValue}</th><th className="px-3 py-2 font-medium">{t.colClient}</th>
            <th className="px-3 py-2 font-medium text-right">{t.colAction}</th>
          </tr></thead>
          <tbody>
            {pag.pageItems.map((d: any) => (
              <tr key={d.id} className="border-b border-white/[0.04]">
                <td className="px-3 py-2"><span className="text-xs px-1.5 py-0.5 rounded bg-white/[0.06] text-[#c9c5d6] mr-1">{FAM[d.family] || d.family}</span><span className="font-mono text-[10px] text-[#6b6580]">{d.docType}</span></td>
                <td className="px-3 py-2 font-mono text-[#e2e0ea]">{d.number}</td>
                <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${ST_CLS[d.status] || ""}`}>{ST_LABEL[d.status] || d.status}</span></td>
                <td className="px-3 py-2 text-[#9b95ad]">{d.sefazCode ? `${d.sefazCode}` : "—"}<span className="block text-xs max-w-xs">{d.message}</span></td>
                <td className="px-3 py-2 text-right text-[#c9c5d6]">{brl(d.amountCents)}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{d.client}</td>
                <td className="px-3 py-2 text-right">
                  {d.resolved ? <span className="text-[11px] text-emerald-300/70">{t.actionOk}</span>
                    : d.remediable && isAdmin ? <button onClick={() => onReprocess(d.id)} disabled={busy === d.id} className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 disabled:opacity-40 cursor-pointer">{busy === d.id ? t.reprocessing : t.actionReprocess}</button>
                    : <span className="text-[11px] text-[#6b6580]">{d.remediable ? "—" : t.actionManual}</span>}
                </td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && <tr><td colSpan={7} className="px-3 py-6 text-center text-[#9b95ad]">{t.emptyTable}</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination {...pag} />
    </div>
  );
}

function Stat({ l, v, c }: { l: string; v: string; c: string }) {
  return <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 text-center"><div className={`text-xl font-bold ${c}`}>{v}</div><div className="text-[11px] text-[#9b95ad] mt-0.5">{l}</div></div>;
}
