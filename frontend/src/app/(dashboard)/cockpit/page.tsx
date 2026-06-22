"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getCockpit, getClients, getMe, requestRemediation, listRemediations,
  approveRemediation, rejectRemediation,
  type CockpitData, type SapItemView, type RemediationAction,
} from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { usePaginate, Pagination } from "@/components/Pagination";

interface Client { id: string; name: string }

const ACTION_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING_APPROVAL: { label: "Aguardando aprovação", cls: "bg-amber-500/15 text-amber-300" },
  APPROVED: { label: "Aprovada", cls: "bg-cyan-500/15 text-cyan-300" },
  EXECUTING: { label: "Executando", cls: "bg-purple-500/15 text-purple-300" },
  DONE: { label: "Concluída", cls: "bg-emerald-500/15 text-emerald-300" },
  FAILED: { label: "Falhou", cls: "bg-rose-500/15 text-rose-300" },
  REJECTED: { label: "Rejeitada", cls: "bg-white/[0.06] text-[#9b95ad]" },
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
            const ok = window.confirm("⚠️ PRODUÇÃO\n\nEsta remediação vai executar no SAP de PRODUÇÃO do cliente. Confirmar a aprovação?");
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
        <h1 className="text-2xl font-bold flex items-center gap-2">🛰️ Cockpit de operação</h1>
        <p className="text-[#9b95ad] text-sm mt-1">
          IDocs em erro e filas qRFC/tRFC de toda a carteira num só painel (BD87 · SMQ1/2 · SM58).
        </p>
        <div className="mt-3"><ExplainData screen="Cockpit de IDoc & filas" data={{ resumo: data?.summary, itens: data?.items?.slice(0, 15) }} /></div>
      </div>

      {/* Resumo */}
      {s && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <Stat label="Itens abertos" value={s.total} accent="text-white" />
          <Stat label="IDocs" value={s.byKind.IDOC || 0} accent="text-rose-300" />
          <Stat label="qRFC" value={s.byKind.QRFC || 0} accent="text-amber-300" />
          <Stat label="tRFC" value={s.byKind.TRFC || 0} accent="text-orange-300" />
          <Stat label="Profund. filas" value={s.queueDepth} accent="text-cyan-300" />
          <Stat label="Remediáveis" value={s.remediable} accent="text-emerald-300" />
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <select value={filters.clientId} onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">Todos os clientes</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.kind} onChange={(e) => setFilters({ ...filters, kind: e.target.value })}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">Todos os tipos</option>
          <option value="IDOC">IDoc</option>
          <option value="QRFC">qRFC</option>
          <option value="TRFC">tRFC</option>
        </select>
        <input value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          placeholder="Status (51, SYSFAIL...)"
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm w-40" />
        <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder="Buscar ref / msg type / parceiro"
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-[#9b95ad]">Carregando...</div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          Nenhum item em erro nos filtros atuais. 🎉
          <p className="text-xs mt-2">Os dados chegam pelo Agente on-premise (IDocs/filas do SAP do cliente).</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Referência</th>
                <th className="px-3 py-2 font-medium">Cliente</th>
                <th className="px-3 py-2 font-medium">Msg / Parceiro</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Profund.</th>
                <th className="px-3 py-2 font-medium text-right">Ação</th>
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
                      <span className="text-[11px] text-[#6b6580]">manual</span>
                    ) : openItemIds.has(i.id) ? (
                      <span className="text-[11px] text-amber-300">em andamento</span>
                    ) : isAdmin ? (
                      <button onClick={() => onRemediate(i)} disabled={busy === i.id}
                        className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 disabled:opacity-40 cursor-pointer">
                        {busy === i.id ? "..." : "✨ Remediar"}
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-300/70">remediável</span>
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
          <h2 className="text-lg font-semibold mb-3">⚠️ Remediações aguardando aprovação</h2>
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
                    {busy === a.id ? "..." : "Aprovar e executar"}
                  </button>
                  <button onClick={() => onDecide(a.id, "reject")} disabled={busy === a.id}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-40 cursor-pointer">
                    Rejeitar
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
          <h2 className="text-lg font-semibold mb-3">Histórico de remediações</h2>
          <div className="space-y-2">
            {recent.map((a) => {
              const st = ACTION_STATUS[a.status] || { label: a.status, cls: "bg-white/[0.06] text-[#9b95ad]" };
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
