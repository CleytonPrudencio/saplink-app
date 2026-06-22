"use client";

import { useEffect, useState, useCallback } from "react";
import { getOps, resolveOps, getMe } from "@/lib/api";
import { usePaginate, Pagination } from "@/components/Pagination";
import ExplainData from "@/components/ExplainData";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

const CAT_ICONS: [string, string][] = [
  ["", "🗂️"],
  ["PIPO", "🔁"],
  ["JOB", "⏱️"],
  ["DUMP", "💥"],
  ["UPDATE_ERR", "✖️"],
  ["LOCK", "🔒"],
  ["GATEWAY", "🚪"],
  ["HANA", "🗄️"],
  ["SECURITY", "🛡️"],
  ["PAYMENT", "💳"],
  ["BANK", "🏦"],
  ["MASTERDATA", "🗃️"],
];
const sevCls: Record<string, string> = { CRITICAL: "bg-rose-500/15 text-rose-300", HIGH: "bg-orange-500/15 text-orange-300", MEDIUM: "bg-amber-500/15 text-amber-300", LOW: "bg-white/[0.06] text-[#9b95ad]" };

export default function OpsPage() {
  const { lang } = useLang();
  const t = T[lang];
  const CAT_LABEL: Record<string, string> = {
    "": t.catAll,
    PIPO: t.catPipo,
    JOB: t.catJob,
    DUMP: t.catDump,
    UPDATE_ERR: t.catUpdateErr,
    LOCK: t.catLock,
    GATEWAY: t.catGateway,
    HANA: t.catHana,
    SECURITY: t.catSecurity,
    PAYMENT: t.catPayment,
    BANK: t.catBank,
    MASTERDATA: t.catMasterdata,
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("");

  const load = useCallback(async () => { try { setData(await getOps(cat ? { category: cat } : {})); } finally { setLoading(false); } }, [cat]);
  useEffect(() => { getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  const pag = usePaginate<any>(data?.items || [], 20);

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  const s = data?.summary;
  const counts: Record<string, number> = Object.fromEntries((s?.byCategory || []).map((b: any) => [b.category, b.count]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">{t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <ExplainData screen="Basis & Operações" data={{ resumo: s, itens: (data?.items || []).slice(0, 15) }} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card label={t.openSignals} value={s?.total ?? 0} />
        <Card label={t.critical} value={s?.critical ?? 0} tone="rose" />
        <Card label={t.high} value={s?.high ?? 0} tone="orange" />
      </div>

      <div className="flex flex-wrap gap-2">
        {CAT_ICONS.map(([k, ic]) => (
          <button key={k} onClick={() => setCat(k)} className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer ${cat === k ? "bg-purple-500/20 text-purple-300" : "bg-[#1a1527] text-[#9b95ad] hover:text-white"}`}>
            {ic} {CAT_LABEL[k]}{k && counts[k] ? ` (${counts[k]})` : ""}
          </button>
        ))}
      </div>

      <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[#9b95ad] text-xs"><tr><th className="text-left px-3 py-2">{t.thClient}</th><th className="text-left px-3 py-2">{t.thCategory}</th><th className="text-left px-3 py-2">{t.thSignal}</th><th className="text-left px-3 py-2">{t.thWhen}</th><th className="text-left px-3 py-2">{t.thSev}</th>{isAdmin && <th></th>}</tr></thead>
          <tbody>
            {pag.pageItems.map((i: any) => (
              <tr key={i.id} className="border-t border-white/[0.05]">
                <td className="px-3 py-2">{i.client}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{CAT_LABEL[i.category] || i.category}</td>
                <td className="px-3 py-2"><span className="text-[#e2e0ea]">{i.title}</span>{i.object && <span className="text-xs text-[#6b6580] font-mono"> · {i.object}</span>}{i.detail && <div className="text-xs text-[#9b95ad]">{i.detail}</div>}</td>
                <td className="px-3 py-2 text-[#9b95ad] whitespace-nowrap">{i.occurredAt ? new Date(i.occurredAt).toLocaleString("pt-BR") : "—"}</td>
                <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${sevCls[i.severity] || ""}`}>{i.severity}</span></td>
                {isAdmin && <td className="px-3 py-2 text-right"><button onClick={async () => { await resolveOps(i.id); load(); }} className="text-xs px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 cursor-pointer">{t.resolve}</button></td>}
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && <tr><td colSpan={isAdmin ? 6 : 5} className="px-3 py-6 text-center text-[#9b95ad]">{t.empty}</td></tr>}
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
