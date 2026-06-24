"use client";

import { useEffect, useState, useCallback } from "react";
import { usePersistedState } from "@/lib/usePersistedState";
import { usePaginate, Pagination } from "@/components/Pagination";
import { getLicense, getClients } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Client { id: string; name: string }
type LData = Awaited<ReturnType<typeof getLicense>>;
type LItem = LData["items"][number];

const brl = (c: number) => c.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const RISK_BADGE: Record<string, string> = {
  OK: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  WARN: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
  RISK: "bg-rose-500/15 text-rose-300 border border-rose-500/25",
};

function pctColor(pct: number) {
  if (pct >= 100) return "bg-rose-400";
  if (pct >= 85) return "bg-amber-400";
  return "bg-emerald-400";
}

export default function LicensingPage() {
  const [data, setData] = useState<LData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = usePersistedState("slk:licensing:clientId", "");
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<LItem | null>(null);
  const { lang } = useLang();
  const t = T[lang];

  const load = useCallback(async () => { setData(await getLicense(clientId || undefined)); }, [clientId]);
  useEffect(() => { getClients().then(setClients).catch(() => {}); }, []);
  useEffect(() => { setLoading(true); load().catch(() => {}).finally(() => setLoading(false)); }, [load]);

  const s = data?.summary;
  const itemsPag = usePaginate<LItem>(data?.items || [], 20);
  const riskLabel = (r: string) => r === "OK" ? t.riskOk : r === "WARN" ? t.riskWarn : t.riskRisk;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🔑 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen="Licensing" data={{ summary: data?.summary, amostra: data?.items?.slice(0, 12) }} /></div>
      </div>

      {s && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
          <Stat label={t.total} value={String(s.total)} accent="text-[#e2e0ea]" />
          <Stat label={t.atRisk} value={String(s.atRisk)} accent="text-rose-300" />
          <Stat label={t.warn} value={String(s.warn)} accent="text-amber-300" />
          <Stat label={t.exposure} value={brl(s.totalExposure)} accent="text-amber-300" highlight small />
        </div>
      )}

      <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
        <option value="">{t.allClients}</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : (
        <section>
          <h2 className="text-lg font-semibold mb-2">{t.metrics}</h2>
          {!data || data.items.length === 0 ? (
            <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
              {t.empty}
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-3 py-2 font-medium">{t.colMetric}</th><th className="px-3 py-2 font-medium">{t.colUsage}</th>
                  <th className="px-3 py-2 font-medium">{t.colRisk}</th><th className="px-3 py-2 font-medium">{t.colExposure}</th>
                  <th className="px-3 py-2 font-medium">{t.colClient}</th>
                </tr></thead>
                <tbody>
                  {itemsPag.pageItems.map((it) => (
                    <tr key={it.id} onClick={() => setSel(it)} className="border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors">
                      <td className="px-3 py-2 text-[#e2e0ea]">{it.metric}</td>
                      <td className="px-3 py-2 min-w-[180px]">
                        <div className="flex items-center justify-between gap-2 text-xs text-[#c9c5d6] mb-1">
                          <span>{it.used.toLocaleString("pt-BR")} / {it.entitled.toLocaleString("pt-BR")} {it.unit || ""}</span>
                          <span className="text-[#9b95ad]">{Math.round(it.pct)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                          <div className={`h-full rounded-full ${pctColor(it.pct)}`} style={{ width: `${Math.min(it.pct, 100)}%` }} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${RISK_BADGE[it.riskLevel] || RISK_BADGE.OK}`}>{riskLabel(it.riskLevel)}</span>
                      </td>
                      <td className="px-3 py-2 font-mono text-amber-300">{brl(it.estCostBrl)}</td>
                      <td className="px-3 py-2 text-[#9b95ad]">{it.client || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 pb-3 pt-2"><Pagination {...itemsPag} /></div>
            </div>
          )}
        </section>
      )}

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon="🔑"
          title={sel.metric}
          subtitle={sel.detail || undefined}
          badge={<span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${RISK_BADGE[sel.riskLevel] || RISK_BADGE.OK}`}>{riskLabel(sel.riskLevel)}</span>}
          fields={[
            { label: t.fMetric, value: sel.metric },
            { label: t.fUsage, value: `${sel.used} / ${sel.entitled} ${sel.unit || ""}`.trim() },
            { label: t.fPct, value: `${Math.round(sel.pct)}%` },
            { label: t.fRisk, value: riskLabel(sel.riskLevel) },
            { label: t.fExposure, value: <span className="font-mono text-amber-300">{brl(sel.estCostBrl)}</span> },
            { label: t.fClient, value: sel.client || "—" },
            { label: t.fEnvironment, value: sel.environment || "—" },
          ]}
          guideTitle={t.guideTitle}
          guideSteps={t.steps}
          guideTx="SLAW / USMM / LAW"
        >
          <ExplainData screen="Licensing — item" data={sel} />
        </DetailSheet>
      )}
    </div>
  );
}

function Stat({ label, value, accent, highlight, small }: { label: string; value: string; accent: string; highlight?: boolean; small?: boolean }) {
  return (
    <div className={`bg-[#1a1527] rounded-xl p-4 text-center flex flex-col justify-center min-w-0 ${highlight ? "border border-amber-500/30" : "border border-white/[0.08]"}`}>
      <div className={`font-bold ${accent} leading-tight tabular-nums break-words ${small ? "text-lg sm:text-xl" : "text-3xl"}`}>{value}</div>
      <div className="text-xs text-[#9b95ad] mt-1">{label}</div>
    </div>
  );
}
