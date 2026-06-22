"use client";

import { useEffect, useState, useCallback } from "react";
import { getMe, getS4Fiscal, reprocessFiscal } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { usePaginate, Pagination } from "@/components/Pagination";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
const ST: Record<string, { label: string; cls: string }> = {
  AUTHORIZED: { label: "Autorizada", cls: "bg-emerald-500/15 text-emerald-300" },
  REJECTED: { label: "Rejeitada", cls: "bg-rose-500/15 text-rose-300" },
  CONTINGENCY: { label: "Contingência", cls: "bg-orange-500/15 text-orange-300" },
  PENDING: { label: "Pendente", cls: "bg-amber-500/15 text-amber-300" },
  CANCELLED: { label: "Cancelada", cls: "bg-white/[0.06] text-[#9b95ad]" },
};

const FAM: Record<string, string> = { NFE: "NF-e", NFSE: "NFS-e", CTE: "CT-e", MDFE: "MDF-e", SPED: "SPED", ESOCIAL: "eSocial", EFDREINF: "EFD-Reinf", BILLING: "Faturas", OUTROS: "Outros" };

export default function FiscalPage() {
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
  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  const s = data?.summary || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🧾 Fiscal BR — DRC / eDocument / GRC</h1>
        <p className="text-[#9b95ad] text-sm mt-1">NF-e, NFS-e, CT-e, MDF-e e as obrigações SPED, eSocial e EFD-Reinf: rejeições da SEFAZ, contingência e fila — com reprocesso.</p>
        <div className="mt-3"><ExplainData screen="Cockpit Fiscal (DRC/GRC)" data={{ resumo: data?.summary, bloqueados: (data?.items || []).filter((d: any) => !d.resolved).slice(0, 12) }} /></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFamily("")} className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer ${family === "" ? "bg-purple-500/20 text-purple-300" : "bg-[#1a1527] text-[#9b95ad] hover:text-white"}`}>Todos ({s.total ?? 0})</button>
        {(s.byFamily || []).map((b: any) => (
          <button key={b.family} onClick={() => setFamily(b.family)} className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer ${family === b.family ? "bg-purple-500/20 text-purple-300" : "bg-[#1a1527] text-[#9b95ad] hover:text-white"}`}>{FAM[b.family] || b.family} ({b.count})</button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat l="Bloqueados" v={`${s.blocked ?? 0}`} c="text-rose-400" />
        <Stat l="R$ em risco" v={brl(s.atRiskCents ?? 0)} c="text-amber-300" />
        <Stat l="Rejeitadas" v={`${s.byStatus?.REJECTED ?? 0}`} c="text-rose-400" />
        <Stat l="Total" v={`${s.total ?? 0}`} c="text-[#e2e0ea]" />
      </div>

      <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
            <th className="px-3 py-2 font-medium">Tipo</th><th className="px-3 py-2 font-medium">Número</th>
            <th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2 font-medium">SEFAZ</th>
            <th className="px-3 py-2 font-medium text-right">Valor</th><th className="px-3 py-2 font-medium">Cliente</th>
            <th className="px-3 py-2 font-medium text-right">Ação</th>
          </tr></thead>
          <tbody>
            {pag.pageItems.map((d: any) => (
              <tr key={d.id} className="border-b border-white/[0.04]">
                <td className="px-3 py-2"><span className="text-xs px-1.5 py-0.5 rounded bg-white/[0.06] text-[#c9c5d6] mr-1">{FAM[d.family] || d.family}</span><span className="font-mono text-[10px] text-[#6b6580]">{d.docType}</span></td>
                <td className="px-3 py-2 font-mono text-[#e2e0ea]">{d.number}</td>
                <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${ST[d.status]?.cls || ""}`}>{ST[d.status]?.label || d.status}</span></td>
                <td className="px-3 py-2 text-[#9b95ad]">{d.sefazCode ? `${d.sefazCode}` : "—"}<span className="block text-xs max-w-xs">{d.message}</span></td>
                <td className="px-3 py-2 text-right text-[#c9c5d6]">{brl(d.amountCents)}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{d.client}</td>
                <td className="px-3 py-2 text-right">
                  {d.resolved ? <span className="text-[11px] text-emerald-300/70">ok</span>
                    : d.remediable && isAdmin ? <button onClick={() => onReprocess(d.id)} disabled={busy === d.id} className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 disabled:opacity-40 cursor-pointer">{busy === d.id ? "..." : "Reprocessar"}</button>
                    : <span className="text-[11px] text-[#6b6580]">{d.remediable ? "—" : "manual"}</span>}
                </td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && <tr><td colSpan={7} className="px-3 py-6 text-center text-[#9b95ad]">Sem documentos fiscais — conecte o S/4HANA Cloud (DRC).</td></tr>}
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
