"use client";

import { useEffect, useState } from "react";
import { getAudit } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { usePaginate, Pagination } from "@/components/Pagination";

export default function AuditPage() {
  const [data, setData] = useState<{ summary: { changes: number; remediations: number; sodViolations: number }; ledger: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getAudit().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);
  const pag = usePaginate<any>(data?.ledger || [], 25);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🛡️ Auditoria & Compliance</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Trilha unificada de <b>mudanças</b> (transports) e <b>remediações</b> (quem pediu/aprovou), com checagem de segregação de função (SoD) — pronto para o auditor.</p>
        {data && <div className="mt-3"><ExplainData screen="Auditoria & Compliance" data={{ resumo: data.summary, amostra: data.ledger.slice(0, 15) }} label="Gerar pacote de evidências (IA)" /></div>}
      </div>

      {data && (
        <div className="grid grid-cols-3 gap-3 max-w-lg">
          <Stat label="Mudanças (STMS)" value={data.summary.changes} accent="text-[#e2e0ea]" />
          <Stat label="Remediações" value={data.summary.remediations} accent="text-cyan-300" />
          <Stat label="Violações SoD" value={data.summary.sodViolations} accent={data.summary.sodViolations ? "text-rose-400" : "text-emerald-400"} />
        </div>
      )}

      {loading ? <div className="text-[#9b95ad]">Carregando...</div> : !data || data.ledger.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">Sem mudanças ou remediações registradas ainda.</div>
      ) : (
        <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-3 py-2 font-medium">Quando</th><th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Quem</th><th className="px-3 py-2 font-medium">O quê</th><th className="px-3 py-2 font-medium">Cliente</th>
            </tr></thead>
            <tbody>
              {pag.pageItems.map((e: any, i: number) => (
                <tr key={i} className={`border-b border-white/[0.04] ${e.flag ? "bg-rose-500/[0.05]" : ""}`}>
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
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 text-center"><div className={`text-2xl font-bold ${accent}`}>{value}</div><div className="text-[11px] text-[#9b95ad] mt-0.5">{label}</div></div>;
}
