"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import Link from "next/link";
import { getCloud, diagnoseCloud, fixCloud, recommendRunbooks, type CloudItem } from "@/lib/api";
import { AiReport } from "@/components/AiReport";
import { usePaginate, Pagination } from "@/components/Pagination";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

function statusCls(s?: string | null) {
  const u = (s || "").toUpperCase();
  if (u === "COMPLETED") return "bg-emerald-500/15 text-emerald-300";
  if (u === "FAILED") return "bg-rose-500/15 text-rose-300";
  if (u === "ESCALATED") return "bg-orange-500/15 text-orange-300";
  if (u === "RETRY") return "bg-amber-500/15 text-amber-300";
  return "bg-white/[0.06] text-[#9b95ad]";
}
const isFail = (s?: string | null) => /FAIL|ERROR|ESCAL|RETRY/i.test(s || "");

export default function CloudPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [data, setData] = useState<{ items: CloudItem[]; summary: { total: number; failed: number; bySource: Record<string, number> } } | null>(null);
  const [filters, setFilters] = useState({ source: "", status: "", q: "" });
  const [loading, setLoading] = useState(true);
  const [diag, setDiag] = useState<Record<string, { loading: boolean; text?: string; at?: string | null; err?: boolean }>>({});
  const [fix, setFix] = useState<Record<string, { loading: boolean; text?: string; err?: boolean }>>({});
  const [rbs, setRbs] = useState<Record<string, any[]>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => { setData(await getCloud(filters)); }, [filters]);
  useEffect(() => { setLoading(true); load().catch(() => {}).finally(() => setLoading(false)); }, [load]);

  const runDiagnose = useCallback(async (it: CloudItem, force = false) => {
    setOpen((o) => ({ ...o, [it.id]: true }));
    recommendRunbooks(it.source, it.error || it.status || "").then((r) => setRbs((m) => ({ ...m, [it.id]: r.runbooks }))).catch(() => {});
    if (!force && it.aiDiagnosis) { setDiag((d) => ({ ...d, [it.id]: { loading: false, text: it.aiDiagnosis!, at: it.aiDiagnosedAt } })); return; }
    setDiag((d) => ({ ...d, [it.id]: { loading: true } }));
    try {
      const r = await diagnoseCloud(it.id, force);
      setDiag((d) => ({ ...d, [it.id]: { loading: false, text: r.diagnosis, at: r.diagnosedAt } }));
    } catch {
      setDiag((d) => ({ ...d, [it.id]: { loading: false, err: true } }));
    }
  }, []);

  const runFix = useCallback(async (it: CloudItem, force = false) => {
    if (!force && it.aiFix) { setFix((f) => ({ ...f, [it.id]: { loading: false, text: it.aiFix! } })); return; }
    setFix((f) => ({ ...f, [it.id]: { loading: true } }));
    try { const r = await fixCloud(it.id, force); setFix((f) => ({ ...f, [it.id]: { loading: false, text: r.fix } })); }
    catch { setFix((f) => ({ ...f, [it.id]: { loading: false, err: true } })); }
  }, []);

  const pag = usePaginate<CloudItem>(data?.items || [], 20);
  const s = data?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">☁️ {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
      </div>

      {s && (
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <Stat label={t.statMessages} value={s.total} accent="text-[#e2e0ea]" />
          <Stat label={t.statCpiAif} value={`${s.bySource.CPI || 0} / ${s.bySource.AIF || 0}`} accent="text-cyan-300" />
          <Stat label={t.statFailed} value={s.failed} accent={s.failed ? "text-rose-300" : "text-emerald-300"} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">{t.allSources}</option><option value="CPI">CPI</option><option value="AIF">AIF</option>
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">{t.allStatuses}</option><option value="COMPLETED">{t.statusCompleted}</option><option value="FAILED">{t.statusFailed}</option><option value="RETRY">{t.statusRetry}</option><option value="ESCALATED">{t.statusEscalated}</option>
        </select>
        <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder={t.searchPlaceholder} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
      </div>

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          {t.empty}
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-3 py-2 font-medium">{t.colSource}</th><th className="px-3 py-2 font-medium">{t.colArtifact}</th>
              <th className="px-3 py-2 font-medium">{t.colMessageId}</th><th className="px-3 py-2 font-medium">{t.colStatus}</th>
              <th className="px-3 py-2 font-medium">{t.colWhen}</th><th className="px-3 py-2 font-medium">{t.colAi}</th>
            </tr></thead>
            <tbody>
              {pag.pageItems.map((i) => {
                const d = diag[i.id];
                const failed = isFail(i.status) && !i.resolved;
                return (
                <Fragment key={i.id}>
                <tr className="border-b border-white/[0.04]">
                  <td className="px-3 py-2"><span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.06]">{i.source}</span></td>
                  <td className="px-3 py-2 text-[#e2e0ea]">{i.artifact}{i.direction && <span className="text-[10px] text-[#9b95ad] ml-1">{i.direction === "INBOUND" ? "↓" : "↑"}</span>}</td>
                  <td className="px-3 py-2 font-mono text-xs text-[#9b95ad]">{i.messageId}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${statusCls(i.status)}`}>{i.status}</span>
                    {i.error && <span className="block text-xs text-[#9b95ad] mt-0.5 max-w-xs">{i.error}</span>}
                  </td>
                  <td className="px-3 py-2 text-xs text-[#9b95ad]">{i.occurredAt ? new Date(i.occurredAt).toLocaleString("pt-BR") : "—"}</td>
                  <td className="px-3 py-2">
                    {failed ? (
                      <button
                        onClick={() => (open[i.id] ? setOpen((o) => ({ ...o, [i.id]: false })) : runDiagnose(i))}
                        className="text-xs px-2 py-1 rounded-lg bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 whitespace-nowrap"
                      >
                        {d?.loading ? t.analyzing : i.aiDiagnosis || d?.text ? (open[i.id] ? t.hide : t.viewSolution) : t.diagnoseWithAi}
                      </button>
                    ) : <span className="text-xs text-[#9b95ad]">—</span>}
                  </td>
                </tr>
                {open[i.id] && (
                  <tr className="border-b border-white/[0.04] bg-violet-500/[0.04]">
                    <td colSpan={6} className="px-4 py-3">
                      {d?.loading ? (
                        <div className="text-sm text-violet-300">{t.diagnoseRunning}</div>
                      ) : d?.err ? (
                        <div className="text-sm text-rose-300">{t.diagnoseError}</div>
                      ) : (
                        <div className="space-y-3">
                          <AiReport
                            text={(d?.text || i.aiDiagnosis) as string}
                            title={t.diagnosisTitle}
                            subtitle={`${i.source} · ${i.artifact} · ${i.status || "FAILED"}`}
                            meta={[
                              { label: t.artifactLabel, value: i.artifact },
                              ...((d?.at || i.aiDiagnosedAt) ? [{ label: t.generatedAt, value: new Date((d?.at || i.aiDiagnosedAt)!).toLocaleString("pt-BR") }] : []),
                            ]}
                            onRefresh={() => runDiagnose(i, true)}
                            refreshing={d?.loading}
                          />
                          {(() => { const fx = fix[i.id]; const hasFix = fx?.text || i.aiFix; return (
                            !fx && !i.aiFix ? (
                              <button onClick={() => runFix(i)} className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 cursor-pointer">{t.generateFix}</button>
                            ) : fx?.loading ? (
                              <div className="text-sm text-cyan-300">{t.fixRunning}</div>
                            ) : fx?.err ? (
                              <div className="text-sm text-rose-300">{t.fixError}</div>
                            ) : hasFix ? (
                              <AiReport text={(fx?.text || i.aiFix) as string} title={t.fixTitle} subtitle={t.fixSubtitle} onRefresh={() => runFix(i, true)} refreshing={fx?.loading} />
                            ) : null
                          ); })()}
                          {rbs[i.id]?.length > 0 && (
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
                              <p className="text-xs font-semibold text-emerald-300 mb-2">{t.runbooksTitle}</p>
                              <div className="space-y-1.5">
                                {rbs[i.id].map((r: any) => (
                                  <Link key={r.id} href="/marketplace" className="flex items-center justify-between gap-2 bg-[#0f0b1a] rounded px-2.5 py-1.5 hover:bg-white/[0.04]">
                                    <span className="text-sm text-[#e2e0ea]">{r.name} <span className="text-xs text-[#9b95ad]">· {r.category}</span></span>
                                    <span className="text-xs text-[#9b95ad] shrink-0">{r.installs}↓ · ★{r.rating} →</span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
                </Fragment>
              ); })}
            </tbody>
          </table>
          <div className="px-3 pb-3"><Pagination {...pag} /></div>
        </div>
      )}
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
