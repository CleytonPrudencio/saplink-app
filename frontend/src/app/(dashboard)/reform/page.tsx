"use client";

import { useEffect, useState, useCallback } from "react";
import { usePersistedState } from "@/lib/usePersistedState";
import { getReform, getClients } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Client { id: string; name: string }
type RData = Awaited<ReturnType<typeof getReform>>;

const statusBadge: Record<string, string> = {
  OK: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  PENDING: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  RISK: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function ReformPage() {
  const [data, setData] = useState<RData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = usePersistedState("slk:reform:clientId", "");
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<any>(null);
  const { lang } = useLang();
  const t = T[lang];

  const statusLabel = (s: string) => s === "OK" ? t.statusOk : s === "PENDING" ? t.statusPending : s === "RISK" ? t.statusRisk : s;

  const load = useCallback(async () => { setData(await getReform(clientId || undefined)); }, [clientId]);
  useEffect(() => { getClients().then(setClients).catch(() => {}); }, []);
  useEffect(() => { setLoading(true); load().catch(() => {}).finally(() => setLoading(false)); }, [load]);

  const s = data?.summary;
  const byClient = s ? [...s.byClient].sort((a, b) => a.readiness - b.readiness) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🧾 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen="Reform readiness" data={{ summary: data?.summary, amostra: data?.items?.slice(0, 12) }} /></div>
      </div>

      {s && (
        <div className="grid gap-3 md:grid-cols-[minmax(0,260px)_1fr] items-stretch">
          <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold text-[#e2e0ea]">{s.readiness}<span className="text-2xl text-[#9b95ad]">%</span></div>
            <div className="text-xs text-[#9b95ad] mt-1 uppercase tracking-wider">{t.readiness}</div>
            <div className="w-full h-2 rounded-full bg-white/[0.08] mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400" style={{ width: `${s.readiness}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label={t.total} value={s.total} accent="text-[#e2e0ea]" />
            <Stat label={t.ok} value={s.ok} accent="text-emerald-300" />
            <Stat label={t.pending} value={s.pending} accent="text-amber-300" />
            <Stat label={t.risk} value={s.risk} accent="text-rose-300" />
          </div>
        </div>
      )}

      {byClient.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">{t.byClient}</h2>
          <div className="space-y-2">
            {byClient.map((c) => (
              <div key={c.client} className="bg-[#1a1527] border border-white/[0.08] rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-40 shrink-0 text-sm text-[#c9c5d6] truncate">{c.client}</div>
                <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div className={`h-full rounded-full ${c.readiness >= 80 ? "bg-emerald-400" : c.readiness >= 50 ? "bg-amber-300" : "bg-rose-400"}`} style={{ width: `${c.readiness}%` }} />
                </div>
                <div className="w-16 shrink-0 text-right text-sm font-semibold text-[#e2e0ea]">{c.readiness}%</div>
                <div className="w-14 shrink-0 text-right text-xs text-[#6b6580]">{c.ok}/{c.total}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
        <option value="">{t.allClients}</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : (
        <section>
          <h2 className="text-lg font-semibold mb-2">{t.checks}</h2>
          {!data || data.items.length === 0 ? (
            <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
              {t.empty}
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-3 py-2 font-medium">{t.colArea}</th><th className="px-3 py-2 font-medium">{t.colCheck}</th>
                  <th className="px-3 py-2 font-medium">{t.colStatus}</th><th className="px-3 py-2 font-medium">{t.colPhase}</th>
                  <th className="px-3 py-2 font-medium">{t.colClient}</th>
                </tr></thead>
                <tbody>
                  {data.items.map((it) => (
                    <tr key={it.id} onClick={() => setSel(it)} className="border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors">
                      <td className="px-3 py-2 text-[#9b95ad]">{it.areaLabel}</td>
                      <td className="px-3 py-2 text-[#c9c5d6]">{it.title}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge[it.status] || "bg-white/[0.06] text-[#9b95ad] border-white/[0.1]"}`}>{statusLabel(it.status)}</span>
                      </td>
                      <td className="px-3 py-2 text-[#9b95ad]">{it.phase || "—"}</td>
                      <td className="px-3 py-2 text-[#9b95ad]">{it.client || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon="🧾"
          title={sel.title}
          subtitle={sel.areaLabel}
          badge={<span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge[sel.status] || "bg-white/[0.06] text-[#9b95ad] border-white/[0.1]"}`}>{statusLabel(sel.status)}</span>}
          fields={[
            { label: t.fArea, value: sel.areaLabel },
            { label: t.fCheck, value: sel.title },
            { label: t.fStatus, value: statusLabel(sel.status) },
            { label: t.fPhase, value: sel.phase || "—" },
            { label: t.fClient, value: sel.client || "—" },
            { label: t.fEnvironment, value: sel.environment || "—" },
          ]}
          guideTitle={t.guideTitle}
          guideSteps={t.steps}
          guideTx="SNOTE / SM30"
        >
          <ExplainData screen="Reform — item" data={sel} />
        </DetailSheet>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 text-center">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[11px] text-[#9b95ad] mt-0.5">{label}</div>
    </div>
  );
}
