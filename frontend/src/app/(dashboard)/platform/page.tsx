"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getConsultancies, suspendConsultancy, activateConsultancy, getPlatformStats } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Stats {
  consultancies: number;
  users: number;
  clients: number;
  integrations: number;
  mrrCents: number;
  active: number;
  trialing: number;
  pastDue: number;
  suspended: number;
}

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]">
      <p className="text-xs text-[#9b95ad]">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {hint && <p className="text-xs text-[#9b95ad] mt-0.5">{hint}</p>}
    </div>
  );
}

interface Consultancy {
  id: string;
  name: string;
  createdAt: string;
  subscription?: {
    status: string;
    planKey: string;
    currentPeriodEnd?: string | null;
    plan?: { name: string } | null;
  } | null;
  _count?: { users: number; clients: number };
}

function statusColor(s?: string) {
  if (s === "ACTIVE" || s === "TRIALING") return "text-emerald-400 bg-emerald-500/10";
  if (s === "PAST_DUE") return "text-amber-400 bg-amber-500/10";
  return "text-rose-400 bg-rose-500/10";
}

export default function PlatformPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang];
  const [list, setList] = useState<Consultancy[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try {
      const [l, s] = await Promise.all([getConsultancies(), getPlatformStats()]);
      setList(l);
      setStats(s);
    } catch {
      notify(t.loadError, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSuspend(id: string, name: string) {
    if (!window.confirm(t.confirmSuspend(name))) return;
    setBusy(id);
    try {
      await suspendConsultancy(id);
      notify(t.suspended, "success");
      await load();
    } catch {
      notify(t.suspendFail, "error");
    } finally {
      setBusy("");
    }
  }

  async function onActivate(id: string) {
    setBusy(id);
    try {
      await activateConsultancy(id);
      notify(t.reactivated, "success");
      await load();
    } catch {
      notify(t.reactivateFail, "error");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm text-[#9b95ad] mt-1">
          {t.subtitle}
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label={t.kpiMrr} value={`R$ ${(stats.mrrCents / 100).toFixed(2)}`} hint={t.kpiMrrHint(stats.active, stats.pastDue)} />
          <KpiCard label={t.kpiConsultancies} value={stats.consultancies} hint={t.kpiConsultanciesHint(stats.trialing, stats.suspended)} />
          <KpiCard label={t.kpiUsers} value={stats.users} />
          <KpiCard label={t.kpiClients} value={stats.clients} hint={t.kpiClientsHint(stats.integrations)} />
        </div>
      )}

      <h2 className="text-lg font-semibold pt-2">{t.consultancies}</h2>

      <div className="overflow-x-auto bg-[#1a1527] rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#9b95ad] border-b border-white/[0.06]">
              <th className="px-4 py-3">{t.colConsultancy}</th>
              <th className="px-4 py-3">{t.colPlan}</th>
              <th className="px-4 py-3">{t.colStatus}</th>
              <th className="px-4 py-3">{t.colUsers}</th>
              <th className="px-4 py-3">{t.colClients}</th>
              <th className="px-4 py-3 text-right">{t.colAction}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const st = c.subscription?.status;
              const cut = st === "SUSPENDED" || st === "CANCELED";
              return (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/platform/consultancies/${c.id}`)}
                  className="border-b border-white/[0.04] hover:bg-[#231d35] cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-purple-300">{c.name}</td>
                  <td className="px-4 py-3">{c.subscription?.plan?.name || c.subscription?.planKey || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(st)}`}>
                      {t.status[st as keyof typeof t.status] || st || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c._count?.users ?? "-"}</td>
                  <td className="px-4 py-3">{c._count?.clients ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {cut ? (
                      <button
                        disabled={busy === c.id}
                        onClick={(e) => { e.stopPropagation(); onActivate(c.id); }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40"
                      >
                        {t.reactivate}
                      </button>
                    ) : (
                      <button
                        disabled={busy === c.id}
                        onClick={(e) => { e.stopPropagation(); onSuspend(c.id, c.name); }}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 disabled:opacity-40"
                      >
                        {t.suspend}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[#9b95ad]">{t.empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
