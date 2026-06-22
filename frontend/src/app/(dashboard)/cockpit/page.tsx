"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCockpit, getClients, getMe, requestRemediation, listRemediations,
  approveRemediation, rejectRemediation,
  type CockpitData, type SapItemView, type RemediationAction,
} from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { usePaginate, Pagination } from "@/components/Pagination";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Client { id: string; name: string }

const ACTION_STATUS_CLS: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-500/15 text-amber-300",
  APPROVED: "bg-cyan-500/15 text-cyan-300",
  EXECUTING: "bg-purple-500/15 text-purple-300",
  DONE: "bg-emerald-500/15 text-emerald-300",
  FAILED: "bg-rose-500/15 text-rose-300",
  REJECTED: "bg-white/[0.06] text-[#9b95ad]",
};

const KIND_LABEL: Record<string, string> = { IDOC: "IDoc", QRFC: "qRFC", TRFC: "tRFC" };

function statusCls(code?: string | null) {
  const c = (code || "").toUpperCase();
  if (["51", "SYSFAIL", "CPICERR"].includes(c)) return "bg-rose-500/15 text-rose-300";
  if (["56"].includes(c)) return "bg-orange-500/15 text-orange-300";
  if (["64", "RETRY"].includes(c)) return "bg-amber-500/15 text-amber-300";
  return "bg-white/[0.06] text-[#9b95ad]";
}

export default function CockpitPage() {
  const { lang } = useLang();
  const t = T[lang];
  const ACTION_STATUS_LABEL: Record<string, string> = {
    PENDING_APPROVAL: t.statusPendingApproval,
    APPROVED: t.statusApproved,
    EXECUTING: t.statusExecuting,
    DONE: t.statusDone,
    FAILED: t.statusFailed,
    REJECTED: t.statusRejected,
  };
  const [data, setData] = useState<CockpitData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ clientId: "", kind: "", status: "", q: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [actions, setActions] = useState<RemediationAction[]>([]);
  const [busy, setBusy] = useState<string>("");

  const load = useCallback(async () => {
    const d = await getCockpit(filters);
    setData(d);
  }, [filters]);

  const loadActions = useCallback(async () => {
    try { setActions((await listRemediations()).actions); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    getClients().then(setClients).catch(() => {});
    getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {});
    loadActions();
  }, [loadActions]);

  async function onRemediate(item: SapItemView) {
    setBusy(item.id);
    try {
      await requestRemediation(item.id);
      await loadActions();
    } catch { /* ignore */ } finally {
      setBusy("");
    }
  }

  async function onDecide(id: string, decision: "approve" | "reject") {
    setBusy(id);
    try {
      if (decision === "approve") {
        try {
          await approveRemediation(id);
        } catch (e: any) {
          // Trava de produção: backend exige confirmação explícita p/ PRD (HTTP 428)
          if (e?.response?.status === 428) {
            const ok = window.confirm(t.prodConfirm);
            if (!ok) { setBusy(""); return; }
            await approveRemediation(id, true);
          } else { throw e; }
        }
      } else {
        await rejectRemediation(id);
      }
      await loadActions();
      // o item será resolvido após a execução do agente; recarrega o cockpit em seguida
      setTimeout(() => { load().catch(() => {}); loadActions().catch(() => {}); }, 2500);
    } catch { /* ignore */ } finally {
      setBusy("");
    }
  }

  const openItemIds = new Set(
    actions.filter((a) => ["PENDING_APPROVAL", "APPROVED", "EXECUTING"].includes(a.status)).map((a) => a.sapItemId)
  );
  const pending = actions.filter((a) => a.status === "PENDING_APPROVAL");
  const recent = actions.slice(0, 12);

  useEffect(() => {
    setLoading(true);
    load().catch(() => {}).finally(() => setLoading(false));
  }, [load]);

  const s = data?.summary;
  const pag = usePaginate<SapItemView>(data?.items || [], 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">{t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">
          {t.subtitle}
        </p>
        <div className="mt-3"><ExplainData screen="Cockpit de IDoc & filas" data={{ resumo: data?.summary, itens: data?.items?.slice(0, 15) }} /></div>
      </div>

      {/* Resumo */}
      {s && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <Stat label={t.openItems} value={s.total} accent="text-white" />
          <Stat label="IDocs" value={s.byKind.IDOC || 0} accent="text-rose-300" />
          <Stat label="qRFC" value={s.byKind.QRFC || 0} accent="text-amber-300" />
          <Stat label="tRFC" value={s.byKind.TRFC || 0} accent="text-orange-300" />
          <Stat label={t.queueDepth} value={s.queueDepth} accent="text-cyan-300" />
          <Stat label={t.remediable} value={s.remediable} accent="text-emerald-300" />
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select value={filters.clientId} onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">{t.allClients}</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.kind} onChange={(e) => setFilters({ ...filters, kind: e.target.value })}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">{t.allKinds}</option>
          <option value="IDOC">IDoc</option>
          <option value="QRFC">qRFC</option>
          <option value="TRFC">tRFC</option>
        </select>
        <input value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          placeholder={t.statusPlaceholder}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm w-40" />
        <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder={t.searchPlaceholder}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-[#9b95ad]">{t.loading}</div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          {t.emptyTitle}
          <p className="text-xs mt-2">{t.emptyHint}</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-3 py-2 font-medium">{t.thKind}</th>
                <th className="px-3 py-2 font-medium">{t.thRef}</th>
                <th className="px-3 py-2 font-medium">{t.thClient}</th>
                <th className="px-3 py-2 font-medium">{t.thMsgPartner}</th>
                <th className="px-3 py-2 font-medium">{t.thStatus}</th>
                <th className="px-3 py-2 font-medium text-right">{t.thDepth}</th>
                <th className="px-3 py-2 font-medium text-right">{t.thAction}</th>
              </tr>
            </thead>
            <tbody>
              {pag.pageItems.map((i: SapItemView) => (
                <tr key={i.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-3 py-2">
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#c9c5d6]">{KIND_LABEL[i.kind] || i.kind}</span>
                    {i.direction && <span className="text-[10px] text-[#9b95ad] ml-1">{i.direction === "INBOUND" ? "↓" : "↑"}</span>}
                  </td>
                  <td className="px-3 py-2 font-mono text-[#e2e0ea]">{i.ref}</td>
                  <td className="px-3 py-2 text-[#c9c5d6]">{i.client}</td>
                  <td className="px-3 py-2 text-[#9b95ad]">
                    {i.messageType && <span className="text-[#c9c5d6]">{i.messageType}</span>}
                    {i.partner && <span className="block text-xs">{i.partner}</span>}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${statusCls(i.statusCode)}`}>{i.statusCode}</span>
                    {i.statusText && <span className="block text-xs text-[#9b95ad] mt-0.5 max-w-xs">{i.statusText}</span>}
                  </td>
                  <td className="px-3 py-2 text-right text-[#9b95ad]">{i.kind === "IDOC" ? "—" : i.depth}</td>
                  <td className="px-3 py-2 text-right">
                    {!i.remediable ? (
                      <span className="text-[11px] text-[#6b6580]">{t.manual}</span>
                    ) : openItemIds.has(i.id) ? (
                      <span className="text-[11px] text-amber-300">{t.inProgress}</span>
                    ) : isAdmin ? (
                      <button onClick={() => onRemediate(i)} disabled={busy === i.id}
                        className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 disabled:opacity-40 cursor-pointer">
                        {busy === i.id ? "..." : t.remediate}
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-300/70">{t.remediableTag}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 pb-3"><Pagination {...pag} /></div>
        </div>
      )}
      {/* B2 — Remediação: fila de aprovação (admin) */}
      {isAdmin && pending.length > 0 && (
        <div className="bg-[#1a1527] rounded-xl p-5 border border-amber-500/20">
          <h2 className="text-lg font-semibold mb-3">{t.pendingTitle}</h2>
          <div className="space-y-2">
            {pending.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 bg-[#0f0b1a] rounded-lg px-3 py-2 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm text-[#e2e0ea]">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white/[0.06] mr-2">{a.actionType}</span>
                    {a.sapItem?.kind} {a.target}
                  </p>
                  {a.beforeText && <p className="text-xs text-[#9b95ad] mt-0.5">{a.beforeText}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onDecide(a.id, "approve")} disabled={busy === a.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-40 cursor-pointer">
                    {busy === a.id ? "..." : t.approveAndExecute}
                  </button>
                  <button onClick={() => onDecide(a.id, "reject")} disabled={busy === a.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-40 cursor-pointer">
                    {t.reject}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B2 — Log de remediações */}
      {recent.length > 0 && (
        <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-3">{t.historyTitle}</h2>
          <div className="space-y-2">
            {recent.map((a) => {
              const st = { label: ACTION_STATUS_LABEL[a.status] || a.status, cls: ACTION_STATUS_CLS[a.status] || "bg-white/[0.06] text-[#9b95ad]" };
              return (
                <div key={a.id} className="bg-[#0f0b1a] rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm text-[#e2e0ea]">
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white/[0.06] mr-2">{a.actionType}</span>
                      {a.sapItem?.kind} {a.target}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded ${st.cls}`}>{st.label}</span>
                  </div>
                  {a.afterText && <p className="text-xs text-emerald-300/80 mt-1">→ {a.afterText}</p>}
                  {a.resultText && !a.afterText && <p className="text-xs text-[#9b95ad] mt-1">{a.resultText}</p>}
                </div>
              );
            })}
          </div>
        </div>
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
