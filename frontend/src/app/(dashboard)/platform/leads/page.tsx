"use client";

import { useEffect, useState, useCallback } from "react";
import { getLeads, updateLeadStatus } from "@/lib/api";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

const ST_CLS: Record<string, string> = {
  NEW: "bg-cyan-500/15 text-cyan-300",
  CONTACTED: "bg-amber-500/15 text-amber-300",
  QUALIFIED: "bg-emerald-500/15 text-emerald-300",
  DISCARDED: "bg-white/[0.06] text-[#9b95ad]",
};

export default function LeadsPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [data, setData] = useState<{ leads: any[]; counts: Record<string, number> } | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => { setData(await getLeads(filter || undefined)); }, [filter]);
  useEffect(() => { setLoading(true); load().catch(() => {}).finally(() => setLoading(false)); }, [load]);

  async function setStatus(id: string, status: string) {
    await updateLeadStatus(id, status).catch(() => {});
    load();
  }

  const c = data?.counts || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">📥 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${filter === "" ? "bg-purple-500/20 text-purple-200" : "bg-white/[0.06] text-[#9b95ad]"}`}>{t.all}</button>
        {Object.keys(ST_CLS).map((k) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer ${filter === k ? "bg-purple-500/20 text-purple-200" : "bg-white/[0.06] text-[#9b95ad]"}`}>
            {t.status[k as keyof typeof t.status]} <span className="opacity-70">{c[k] || 0}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : !data || data.leads.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">{t.empty}</div>
      ) : (
        <div className="space-y-3">
          {data.leads.map((l) => (
            <div key={l.id} className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-[#e2e0ea]">{l.name} <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${ST_CLS[l.status]}`}>{t.status[l.status as keyof typeof t.status]}</span></p>
                  <p className="text-sm text-[#c9c5d6] mt-1">
                    <a href={`mailto:${l.email}`} className="text-cyan-300 hover:underline">{l.email}</a>
                    {l.phone && <> · <a href={`tel:${l.phone}`} className="text-cyan-300 hover:underline">{l.phone}</a></>}
                  </p>
                  <p className="text-xs text-[#9b95ad] mt-1">
                    {[l.company, l.role, l.employees && t.clients(l.employees)].filter(Boolean).join(" · ") || t.dash}
                  </p>
                  {l.message && <p className="text-sm text-[#c9c5d6] mt-2 bg-[#0f0b1a] rounded-lg p-2">{l.message}</p>}
                  <p className="text-[11px] text-[#6b6580] mt-1">{new Date(l.createdAt).toLocaleString(t.locale)}</p>
                </div>
                <select value={l.status} onChange={(e) => setStatus(l.id, e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-2 py-1.5 text-sm shrink-0">
                  {Object.keys(ST_CLS).map((k) => <option key={k} value={k}>{t.status[k as keyof typeof t.status]}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
