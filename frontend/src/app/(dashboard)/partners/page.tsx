"use client";

import { useEffect, useState } from "react";
import { getPartners } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { usePaginate, Pagination } from "@/components/Pagination";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function PartnersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getPartners().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);

  const pagP = usePaginate<any>(data?.partners || [], 15);
  const pagF = usePaginate<any>(data?.finops?.flows || [], 15);
  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  const fin = data?.finops;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🤝 Parceiros EDI & FinOps de BTP</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Quem manda dado ruim (ranking de confiabilidade de parceiro) e quanto cada IFlow custa de consumo no BTP.</p>
        <div className="mt-3"><ExplainData screen="Parceiros EDI & FinOps BTP" data={{ parceiros: data?.partners?.slice(0, 8), finops: fin?.summary }} /></div>
      </div>

      {/* Parceiros EDI */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Confiabilidade de parceiro EDI</h2>
        {(!data?.partners || data.partners.length === 0) ? (
          <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] text-center text-[#9b95ad] text-sm">Sem dados de parceiro ainda (vêm dos IDocs/itens do agente).</div>
        ) : (
          <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-3 py-2 font-medium">Parceiro</th><th className="px-3 py-2 font-medium">Itens</th><th className="px-3 py-2 font-medium">Erros</th>
                <th className="px-3 py-2 font-medium">Taxa de erro</th><th className="px-3 py-2 font-medium">% dos erros</th><th className="px-3 py-2 font-medium">Score</th>
              </tr></thead>
              <tbody>
                {pagP.pageItems.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 font-mono text-[#e2e0ea]">{p.partner}</td>
                    <td className="px-3 py-2 text-[#9b95ad]">{p.total}</td>
                    <td className="px-3 py-2 text-rose-300">{p.errors}</td>
                    <td className="px-3 py-2 text-amber-300">{p.errorRate}%</td>
                    <td className="px-3 py-2 text-[#c9c5d6]">{p.shareOfErrors}%</td>
                    <td className="px-3 py-2"><span className={`font-bold ${p.score >= 80 ? "text-emerald-400" : p.score >= 50 ? "text-amber-300" : "text-rose-400"}`}>{p.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 pb-3"><Pagination {...pagP} /></div>
          </div>
        )}
      </section>

      {/* FinOps BTP */}
      <section>
        <div className="flex items-end justify-between flex-wrap gap-2 mb-3">
          <h2 className="text-lg font-semibold">FinOps de BTP — custo estimado por IFlow</h2>
          {fin && <span className="text-sm text-[#9b95ad]">{fin.summary.totalMessages30d.toLocaleString("pt-BR")} msg/30d · <b className="text-amber-300">~{brl(fin.summary.estMonthlyCents)}/mês</b></span>}
        </div>
        {(!fin?.flows || fin.flows.length === 0) ? (
          <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] text-center text-[#9b95ad] text-sm">Conecte o CPI para estimar o consumo de BTP por IFlow.</div>
        ) : (
          <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-3 py-2 font-medium">Fonte</th><th className="px-3 py-2 font-medium">IFlow / artefato</th>
                <th className="px-3 py-2 font-medium text-right">Mensagens/30d</th><th className="px-3 py-2 font-medium text-right">Custo est./mês</th>
              </tr></thead>
              <tbody>
                {pagF.pageItems.map((f: any, i: number) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="px-3 py-2"><span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.06]">{f.source}</span></td>
                    <td className="px-3 py-2 text-[#e2e0ea]">{f.artifact}</td>
                    <td className="px-3 py-2 text-right text-[#c9c5d6]">{f.messages30d.toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2 text-right text-amber-300">{brl(f.estMonthlyCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 pb-3"><Pagination {...pagF} /></div>
          </div>
        )}
        <p className="text-xs text-[#6b6580] mt-2">Estimativa baseada no volume real × tarifa configurável (BTP_RATE_CENTS_PER_1K). Flagra IFlow desgovernado queimando crédito.</p>
      </section>
    </div>
  );
}
