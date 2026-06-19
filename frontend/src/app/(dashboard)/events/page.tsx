"use client";

import { useEffect, useState } from "react";
import { getS4Events } from "@/lib/api";
import ExplainData from "@/components/ExplainData";

const ST: Record<string, string> = {
  DELIVERED: "bg-emerald-500/15 text-emerald-300", DEAD_LETTER: "bg-rose-500/15 text-rose-300",
  RETRY: "bg-amber-500/15 text-amber-300", PENDING: "bg-white/[0.06] text-[#9b95ad]",
};

export default function EventsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getS4Events().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  const s = data?.summary?.byStatus || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">📨 Event Mesh — eventos de negócio</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Observabilidade da integração orientada a eventos do S/4HANA Cloud: entrega, dead-letter, retry e lag.</p>
        <div className="mt-3"><ExplainData screen="Event Mesh — eventos" data={{ summary: data?.summary, amostra: data?.items?.slice(0, 12) }} /></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["DELIVERED", "Entregues", "text-emerald-400"], ["DEAD_LETTER", "Dead-letter", "text-rose-400"], ["RETRY", "Retry", "text-amber-300"], ["PENDING", "Pendentes", "text-[#9b95ad]"]].map(([k, l, c]) => (
          <div key={k} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${c}`}>{s[k] || 0}</div>
            <div className="text-[11px] text-[#9b95ad] mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
            <th className="px-3 py-2 font-medium">Tópico</th><th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Assinante</th><th className="px-3 py-2 font-medium text-right">Lag</th>
            <th className="px-3 py-2 font-medium">Cliente</th><th className="px-3 py-2 font-medium">Quando</th>
          </tr></thead>
          <tbody>
            {(data?.items || []).map((e: any, i: number) => (
              <tr key={i} className="border-b border-white/[0.04]">
                <td className="px-3 py-2 font-mono text-xs text-[#e2e0ea]">{e.topic}</td>
                <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${ST[e.status] || ""}`}>{e.status}</span></td>
                <td className="px-3 py-2 text-[#9b95ad]">{e.subscriber || "—"}</td>
                <td className="px-3 py-2 text-right text-[#9b95ad]">{e.lagMs}ms</td>
                <td className="px-3 py-2 text-[#9b95ad]">{e.client}</td>
                <td className="px-3 py-2 text-xs text-[#9b95ad]">{e.occurredAt ? new Date(e.occurredAt).toLocaleString("pt-BR") : "—"}</td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && <tr><td colSpan={6} className="px-3 py-6 text-center text-[#9b95ad]">Sem eventos — conecte o Event Mesh do S/4HANA Cloud.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
