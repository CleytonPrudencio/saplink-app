"use client";

import { useEffect, useState } from "react";
import { getMe, getActivity, getUsers, type ActivityItem, type TenantUser } from "@/lib/api";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

const PAGE_SIZE = 30;

export default function ActivityPage() {
  const { lang } = useLang();
  const t = T[lang];

  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // filtros
  const [usersList, setUsersList] = useState<TenantUser[]>([]);
  const [fAction, setFAction] = useState("");
  const [fUserId, setFUserId] = useState("");
  const [fFrom, setFFrom] = useState("");
  const [fTo, setFTo] = useState("");

  function actionLabel(a: ActivityItem["action"]) {
    switch (a) {
      case "view": return t.actView;
      case "create": return t.actCreate;
      case "edit": return t.actEdit;
      case "delete": return t.actDelete;
      default: return t.actOther;
    }
  }
  function actionBadge(a: ActivityItem["action"]) {
    switch (a) {
      case "create": return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "edit": return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "delete": return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "view": return "bg-white/[0.06] text-[#9b95ad] border-white/[0.1]";
      default: return "bg-white/[0.06] text-[#9b95ad] border-white/[0.1]";
    }
  }

  function fmtDate(iso: string) {
    try {
      return new Date(iso).toLocaleString(t.locale);
    } catch {
      return iso;
    }
  }

  async function load(
    p: number,
    filters: { action?: string; userId?: string; from?: string; to?: string } = {
      action: fAction,
      userId: fUserId,
      from: fFrom,
      to: fTo,
    },
  ) {
    setLoading(true);
    try {
      const res = await getActivity({ page: p, pageSize: PAGE_SIZE, ...filters });
      setItems(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(res.page || p);
      setError("");
    } catch {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }

  // Aplica um novo conjunto de filtros: atualiza estado e recarrega na página 1
  function applyFilters(next: { action?: string; userId?: string; from?: string; to?: string }) {
    const action = next.action ?? fAction;
    const userId = next.userId ?? fUserId;
    const from = next.from ?? fFrom;
    const to = next.to ?? fTo;
    setFAction(action);
    setFUserId(userId);
    setFFrom(from);
    setFTo(to);
    load(1, { action, userId, from, to });
  }

  function clearFilters() {
    setFAction("");
    setFUserId("");
    setFFrom("");
    setFTo("");
    load(1, { action: "", userId: "", from: "", to: "" });
  }

  useEffect(() => {
    getMe()
      .then((me) => {
        const admin = me?.role === "CONSULTANCY_ADMIN";
        setIsAdmin(admin);
        setAuthReady(true);
        if (admin) {
          load(1, { action: "", userId: "", from: "", to: "" });
          getUsers().then((u) => setUsersList(Array.isArray(u) ? u : [])).catch(() => {});
        } else setLoading(false);
      })
      .catch(() => {
        setAuthReady(true);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authReady) return <div className="text-[#9b95ad]">{t.loading}</div>;

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-[#1a1527] border border-white/[0.08] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-xl font-bold text-[#e2e0ea] mb-2">{t.adminOnlyTitle}</h1>
        <p className="text-[#9b95ad] leading-relaxed">{t.adminOnlyText}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm text-[#9b95ad] mt-1 max-w-2xl">{t.subtitle}</p>
      </div>

      {error && <div className="text-rose-400">{error}</div>}

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-[#6b6580] mb-1">{t.filterUser}</label>
          <select
            value={fUserId}
            onChange={(e) => applyFilters({ userId: e.target.value })}
            className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{t.filterUserAll}</option>
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#6b6580] mb-1">{t.filterAction}</label>
          <select
            value={fAction}
            onChange={(e) => applyFilters({ action: e.target.value })}
            className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
          >
            <option value="">{t.filterActionAll}</option>
            <option value="view">{t.actView}</option>
            <option value="create">{t.actCreate}</option>
            <option value="edit">{t.actEdit}</option>
            <option value="delete">{t.actDelete}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-[#6b6580] mb-1">{t.filterFrom}</label>
          <input
            type="date"
            value={fFrom}
            onChange={(e) => applyFilters({ from: e.target.value })}
            className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-[#6b6580] mb-1">{t.filterTo}</label>
          <input
            type="date"
            value={fTo}
            onChange={(e) => applyFilters({ to: e.target.value })}
            className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {(fAction || fUserId || fFrom || fTo) && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-lg bg-white/[0.06] text-[#e2e0ea] text-sm hover:bg-white/[0.12] cursor-pointer transition"
          >
            {t.filterClear}
          </button>
        )}
      </div>

      <div className="bg-[#1a1527] rounded-xl border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="text-[#9b95ad] p-8 text-center">{t.loading}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#9b95ad]">{t.emptyTitle}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#6b6580] border-b border-white/[0.08]">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">{t.colDate}</th>
                  <th className="px-4 py-3 font-semibold">{t.colUser}</th>
                  <th className="px-4 py-3 font-semibold">{t.colAction}</th>
                  <th className="px-4 py-3 font-semibold">{t.colPath}</th>
                  <th className="px-4 py-3 font-semibold text-right">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-[#9b95ad] whitespace-nowrap">{fmtDate(it.createdAt)}</td>
                    <td className="px-4 py-3 text-[#e2e0ea]">{it.userName || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${actionBadge(it.action)}`}>
                        {actionLabel(it.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[#c9c5d6] truncate max-w-[280px]">{it.path}</td>
                    <td className="px-4 py-3 text-right text-[#9b95ad]">{it.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação server-side */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#6b6580]">{t.totalRecords(total)}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(page - 1)}
            disabled={loading || page <= 1}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-[#e2e0ea] text-sm hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
          >
            {t.prev}
          </button>
          <span className="text-sm text-[#9b95ad]">{t.pageOf(page, totalPages)}</span>
          <button
            onClick={() => load(page + 1)}
            disabled={loading || page >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] text-[#e2e0ea] text-sm hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
