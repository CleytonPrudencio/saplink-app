"use client";

import { useEffect, useState } from "react";
import { getMoneyGraph } from "@/lib/api";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }

export default function MoneyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getMoneyGraph().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);

  const s = data?.summary;
  const maxProc = Math.max(1, ...(data?.byProcess || []).map((p: any) => p.atRiskCents));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">💸 Dinheiro em risco (ao vivo)</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Traduz cada falha técnica em R$ parados agora — custo de parada por hora das integrações + documentos fiscais bloqueados. O dashboard que o diretor entende.</p>
      </div>

      {loading ? <div className="text-[#9b95ad]">Carregando...</div> : (
        <>
          <div className="bg-gradient-to-br from-rose-500/15 to-purple-500/10 border border-rose-500/30 rounded-2xl p-6">
            <div className="text-[#9b95ad] text-sm">Total em risco neste momento</div>
            <div className="text-5xl font-extrabold text-rose-300 mt-1">{brl(s?.totalAtRiskCents ?? 0)}</div>
            <div className="flex gap-6 mt-4 text-sm flex-wrap">
              <span className="text-[#e2e0ea]">⏱️ Parada: <b className="text-amber-300">{brl(s?.downtimeAtRiskCents ?? 0)}</b></span>
              <span className="text-[#e2e0ea]">🧾 Fiscal bloqueado: <b className="text-amber-300">{brl(s?.fiscalAtRiskCents ?? 0)}</b></span>
              <span className="text-[#e2e0ea]">🔌 Integrações fora: <b className="text-rose-300">{s?.integrationsDown ?? 0}</b></span>
            </div>
          </div>

          {(data?.byProcess || []).length > 0 && (
            <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
              <h2 className="text-lg font-semibold mb-3">Por processo de negócio</h2>
              <div className="space-y-3">
                {data.byProcess.map((p: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#e2e0ea]">{p.process} <span className="text-xs text-[#9b95ad]">({p.integrations} integr.)</span></span>
                      <span className="text-rose-300 font-semibold">{brl(p.atRiskCents)}</span>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${(p.atRiskCents / maxProc) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(data?.nodes || []).length > 0 ? (
            <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-3 py-2 font-medium">Integração</th><th className="px-3 py-2 font-medium">Cliente</th>
                  <th className="px-3 py-2 font-medium">Processo</th><th className="px-3 py-2 font-medium">Parada</th>
                  <th className="px-3 py-2 font-medium">R$/h</th><th className="px-3 py-2 font-medium">Em risco</th>
                </tr></thead>
                <tbody>
                  {data.nodes.map((n: any, i: number) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      <td className="px-3 py-2 text-[#e2e0ea]">{n.integration}</td>
                      <td className="px-3 py-2 text-[#9b95ad]">{n.client}</td>
                      <td className="px-3 py-2 text-[#9b95ad]">{n.process}</td>
                      <td className="px-3 py-2 text-amber-300">{n.hoursDown}h</td>
                      <td className="px-3 py-2 text-[#9b95ad]">{brl(n.costPerHourCents)}</td>
                      <td className="px-3 py-2 text-rose-300 font-semibold">{brl(n.atRiskCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
              Nenhuma integração parada com custo configurado. Defina o <b>custo de parada por hora</b> e o <b>processo de negócio</b> nas integrações para o cálculo ao vivo.
            </div>
          )}
        </>
      )}
    </div>
  );
}
