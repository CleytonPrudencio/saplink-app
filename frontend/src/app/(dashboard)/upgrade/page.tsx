"use client";

import { useEffect, useState } from "react";
import { getS4Upgrade, getS4Apis } from "@/lib/api";

const IMPACT: Record<string, { label: string; cls: string }> = {
  BREAKING: { label: "Quebra", cls: "bg-rose-500/15 text-rose-300" },
  DEPRECATED: { label: "Depreciado", cls: "bg-orange-500/15 text-orange-300" },
  CHANGED: { label: "Mudou", cls: "bg-amber-500/15 text-amber-300" },
  OK: { label: "OK", cls: "bg-emerald-500/15 text-emerald-300" },
};

export default function UpgradePage() {
  const [data, setData] = useState<any>(null);
  const [apis, setApis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getS4Upgrade(), getS4Apis()]).then(([u, a]) => { setData(u); setApis(a); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  const s = data?.summary?.byImpact || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🚀 Radar de Upgrade <span className="text-sm font-normal text-[#9b95ad]">· release {data?.release}</span></h1>
        <p className="text-[#9b95ad] text-sm mt-1">O que vai quebrar/mudar no próximo upgrade do S/4HANA Cloud — mapeado ao que você realmente usa.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["BREAKING", "Quebram", "text-rose-400"], ["DEPRECATED", "Depreciados", "text-orange-400"], ["CHANGED", "Mudam", "text-amber-300"], ["OK", "Compatíveis", "text-emerald-400"]].map(([k, l, c]) => (
          <div key={k} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${c}`}>{s[k] || 0}</div>
            <div className="text-[11px] text-[#9b95ad] mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
            <th className="px-3 py-2 font-medium">Impacto</th><th className="px-3 py-2 font-medium">Área</th>
            <th className="px-3 py-2 font-medium">Objeto</th><th className="px-3 py-2 font-medium">Recomendação</th><th className="px-3 py-2 font-medium">Cliente</th>
          </tr></thead>
          <tbody>
            {(data?.findings || []).map((f: any) => (
              <tr key={f.id} className="border-b border-white/[0.04]">
                <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${IMPACT[f.impact]?.cls || ""}`}>{IMPACT[f.impact]?.label || f.impact}</span></td>
                <td className="px-3 py-2 text-[#9b95ad]">{f.area}</td>
                <td className="px-3 py-2 font-mono text-[#e2e0ea]">{f.object}<span className="block text-xs text-[#9b95ad] font-sans">{f.detail}</span></td>
                <td className="px-3 py-2 text-[#c9c5d6]">{f.recommendation || "—"}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{f.client}</td>
              </tr>
            ))}
            {(!data?.findings || data.findings.length === 0) && <tr><td colSpan={5} className="px-3 py-6 text-center text-[#9b95ad]">Sem achados — conecte o S/4HANA Cloud para o radar rodar.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
        <h2 className="text-lg font-semibold mb-3">APIs depreciadas em uso ({apis?.summary?.deprecated ?? 0})</h2>
        <div className="space-y-2">
          {(apis?.items || []).filter((a: any) => a.deprecated).map((a: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2">
              <p className="text-sm font-mono text-[#e2e0ea]">{a.apiName} {a.version} <span className="text-xs text-[#9b95ad] font-sans">→ {a.replacement || "migrar"}</span></p>
              <span className="text-[11px] text-rose-300">depreca em {a.deprecationRelease}</span>
            </div>
          ))}
          {(apis?.summary?.deprecated ?? 0) === 0 && <p className="text-sm text-[#9b95ad]">Nenhuma API depreciada em uso. 🎉</p>}
        </div>
      </div>
    </div>
  );
}
