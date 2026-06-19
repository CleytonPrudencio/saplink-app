"use client";

import { useEffect, useState } from "react";
import { getFederated } from "@/lib/api";
import ExplainData from "@/components/ExplainData";

export default function FederatedPage() {
  const [data, setData] = useState<{ summary: { signatures: number; occurrences: number }; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getFederated().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🛰️ Rede Federada de Falhas</h1>
        <p className="text-[#9b95ad] text-sm mt-1">O &quot;Waze do SAP&quot;: cada falha e a correção que funcionou viram conhecimento anonimizado da rede. Quanto mais clientes, mais inteligente fica.</p>
        <div className="mt-3"><ExplainData screen="Rede Federada de Falhas" data={{ summary: data?.summary, top: data?.items?.slice(0, 8) }} /></div>
      </div>

      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg">
          <Stat label="Assinaturas de falha" value={data.summary.signatures} accent="text-cyan-300" />
          <Stat label="Ocorrências na rede" value={data.summary.occurrences} accent="text-purple-300" />
          <Stat label="Correções aprendidas" value={data.items.filter((i) => i.bestFix).length} accent="text-emerald-300" />
        </div>
      )}

      {loading ? <div className="text-[#9b95ad]">Carregando...</div> : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          A rede ainda está aprendendo. Cada falha detectada (CPI/AIF/IDoc) alimenta as assinaturas automaticamente.
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((s, i) => (
            <div key={i} className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.06] mr-2">{s.source}</span>
                  <span className="text-sm text-[#e2e0ea]">{s.sample || s.errorNorm}</span>
                </div>
                <div className="flex gap-4 text-right shrink-0">
                  <div><div className="text-lg font-bold text-purple-300">{s.occurrences}×</div><div className="text-[10px] text-[#9b95ad]">na rede</div></div>
                  <div><div className="text-lg font-bold text-cyan-300">{s.clientsCount}</div><div className="text-[10px] text-[#9b95ad]">clientes</div></div>
                </div>
              </div>
              {s.bestFix ? (
                <div className="mt-3 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-emerald-200">✓ Correção vencedora: <b>{s.bestFix.action}</b></span>
                  <span className="text-xs text-[#9b95ad]">{s.bestFix.successRate}% de sucesso · {s.bestFix.count} aplicações · ~{s.bestFix.avgMinutes}min</span>
                </div>
              ) : (
                <div className="mt-3 text-xs text-[#9b95ad]">Ainda sem correção comprovada para esta assinatura.</div>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-[#6b6580]">Dados 100% anonimizados: as falhas são agrupadas por assinatura (sem ids/números) e os clientes contados por hash — nenhuma identidade é exposta entre tenants.</p>
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
