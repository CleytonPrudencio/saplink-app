"use client";

import { useEffect, useState, useCallback } from "react";
import { getOps, resolveOps, getMe } from "@/lib/api";
import { usePaginate, Pagination } from "@/components/Pagination";
import ExplainData from "@/components/ExplainData";

const CATS: [string, string, string][] = [
  ["", "Tudo", "🗂️"],
  ["PIPO", "PI/PO", "🔁"],
  ["JOB", "Jobs (SM37)", "⏱️"],
  ["DUMP", "Dumps (ST22)", "💥"],
  ["UPDATE_ERR", "Update (SM13)", "✖️"],
  ["LOCK", "Locks (SM12)", "🔒"],
  ["GATEWAY", "Gateway/OData", "🚪"],
  ["HANA", "HANA", "🗄️"],
  ["SECURITY", "Segurança/Patch", "🛡️"],
  ["PAYMENT", "Pagamentos (F110)", "💳"],
  ["BANK", "Extrato (MT940)", "🏦"],
  ["MASTERDATA", "Dados mestre (BP)", "🗃️"],
];
const sevCls: Record<string, string> = { CRITICAL: "bg-rose-500/15 text-rose-300", HIGH: "bg-orange-500/15 text-orange-300", MEDIUM: "bg-amber-500/15 text-amber-300", LOW: "bg-white/[0.06] text-[#9b95ad]" };

export default function OpsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("");

  const load = useCallback(async () => { try { setData(await getOps(cat ? { category: cat } : {})); } finally { setLoading(false); } }, [cat]);
  useEffect(() => { getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  const pag = usePaginate<any>(data?.items || [], 20);

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  const s = data?.summary;
  const counts: Record<string, number> = Object.fromEntries((s?.byCategory || []).map((b: any) => [b.category, b.count]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🩺 Basis & Operações</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Saúde do landscape SAP coletada pelo agente: PI/PO, jobs, dumps ABAP, update errors, locks, Gateway/OData, HANA e segurança/patch — multi-cliente, numa tela só.</p>
        <ExplainData screen="Basis & Operações" data={{ resumo: s, itens: (data?.items || []).slice(0, 15) }} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card label="Sinais abertos" value={s?.total ?? 0} />
        <Card label="Críticos" value={s?.critical ?? 0} tone="rose" />
        <Card label="Altos" value={s?.high ?? 0} tone="orange" />
      </div>

      <div className="flex flex-wrap gap-2">
        {CATS.map(([k, l, ic]) => (
          <button key={k} onClick={() => setCat(k)} className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer ${cat === k ? "bg-purple-500/20 text-purple-300" : "bg-[#1a1527] text-[#9b95ad] hover:text-white"}`}>
            {ic} {l}{k && counts[k] ? ` (${counts[k]})` : ""}
          </button>
        ))}
      </div>

      <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[#9b95ad] text-xs"><tr><th className="text-left px-3 py-2">Cliente</th><th className="text-left px-3 py-2">Categoria</th><th className="text-left px-3 py-2">Sinal</th><th className="text-left px-3 py-2">Quando</th><th className="text-left px-3 py-2">Sev.</th>{isAdmin && <th></th>}</tr></thead>
          <tbody>
            {pag.pageItems.map((i: any) => (
              <tr key={i.id} className="border-t border-white/[0.05]">
                <td className="px-3 py-2">{i.client}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{(CATS.find((c) => c[0] === i.category) || [])[1] || i.category}</td>
                <td className="px-3 py-2"><span className="text-[#e2e0ea]">{i.title}</span>{i.object && <span className="text-xs text-[#6b6580] font-mono"> · {i.object}</span>}{i.detail && <div className="text-xs text-[#9b95ad]">{i.detail}</div>}</td>
                <td className="px-3 py-2 text-[#9b95ad] whitespace-nowrap">{i.occurredAt ? new Date(i.occurredAt).toLocaleString("pt-BR") : "—"}</td>
                <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${sevCls[i.severity] || ""}`}>{i.severity}</span></td>
                {isAdmin && <td className="px-3 py-2 text-right"><button onClick={async () => { await resolveOps(i.id); load(); }} className="text-xs px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 cursor-pointer">Resolver</button></td>}
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && <tr><td colSpan={isAdmin ? 6 : 5} className="px-3 py-6 text-center text-[#9b95ad]">Sem sinais abertos. O agente envia estes dados via /api/agent/ops-signals.</td></tr>}
          </tbody>
        </table>
        <div className="px-3 pb-3"><Pagination {...pag} /></div>
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: number; tone?: string }) {
  const c = tone === "rose" ? "text-rose-300" : tone === "orange" ? "text-orange-300" : "text-[#e2e0ea]";
  return <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3"><div className={`text-2xl font-bold ${c}`}>{value}</div><div className="text-xs text-[#9b95ad]">{label}</div></div>;
}
