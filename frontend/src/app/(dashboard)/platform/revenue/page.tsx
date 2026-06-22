"use client";

import { useEffect, useState } from "react";
import { getRevenue } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Revenue {
  mrrCents: number;
  arrCents: number;
  totalPaidCents: number;
  paidInvoicesCount: number;
  byStatus: Record<string, number>;
  byPlan: { name: string; priceCents: number; count: number; mrrCents: number }[];
  monthly: { month: string; cents: number }[];
  recentInvoices: { id: string; amountCents: number; paidAt?: string; createdAt: string; consultancy?: string }[];
}

const brl = (c: number) => `R$ ${(c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]">
      <p className="text-xs text-[#9b95ad]">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {hint && <p className="text-xs text-[#9b95ad] mt-0.5">{hint}</p>}
    </div>
  );
}

function Bars({ data, color = "from-purple-500 to-cyan-400", fmt, emptyLabel }: { data: { label: string; value: number }[]; color?: string; fmt: (v: number) => string; emptyLabel: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-sm text-[#9b95ad] truncate">{d.label}</span>
          <div className="flex-1 bg-[#0f0b1a] rounded h-6 overflow-hidden">
            <div className={`h-6 rounded bg-gradient-to-r ${color}`} style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? "2px" : 0 }} />
          </div>
          <span className="w-28 shrink-0 text-sm text-right">{fmt(d.value)}</span>
        </div>
      ))}
      {data.length === 0 && <p className="text-sm text-[#9b95ad]">{emptyLabel}</p>}
    </div>
  );
}

export default function RevenuePage() {
  const { lang } = useLang();
  const t = T[lang];
  const [r, setR] = useState<Revenue | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  useEffect(() => {
    getRevenue()
      .then(setR)
      .catch(() => notify(t.loadError, "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  if (!r) return <div className="text-rose-400">{t.noData}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm text-[#9b95ad] mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label={t.kpiMrr} value={brl(r.mrrCents)} />
        <Kpi label={t.kpiArr} value={brl(r.arrCents)} />
        <Kpi label={t.kpiTotalPaid} value={brl(r.totalPaidCents)} hint={t.kpiTotalPaidHint(r.paidInvoicesCount)} />
        <Kpi label={t.kpiAvgTicket} value={brl(r.paidInvoicesCount ? Math.round(r.totalPaidCents / r.paidInvoicesCount) : 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-4">{t.mrrByPlan}</h2>
          <Bars data={r.byPlan.map((p) => ({ label: `${p.name} (${p.count})`, value: p.mrrCents }))} fmt={brl} emptyLabel={t.noData} />
        </div>

        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-4">{t.subsByStatus}</h2>
          <Bars
            data={Object.entries(r.byStatus).map(([k, v]) => ({ label: t.status[k as keyof typeof t.status] || k, value: v }))}
            color="from-emerald-500 to-cyan-400"
            fmt={(v) => String(v)}
            emptyLabel={t.noData}
          />
        </div>
      </div>

      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
        <h2 className="text-lg font-semibold mb-4">{t.billing6m}</h2>
        <Bars data={r.monthly.map((m) => ({ label: m.month, value: m.cents }))} fmt={brl} emptyLabel={t.noData} />
      </div>

      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
        <h2 className="text-lg font-semibold mb-4">{t.recentInvoices}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.06]">
              <th className="py-2 pr-4">{t.colDate}</th><th className="py-2 pr-4">{t.colConsultancy}</th><th className="py-2 text-right">{t.colAmount}</th>
            </tr></thead>
            <tbody>
              {r.recentInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/[0.04]">
                  <td className="py-2 pr-4">{new Date(inv.paidAt || inv.createdAt).toLocaleDateString(t.locale)}</td>
                  <td className="py-2 pr-4">{inv.consultancy || t.dash}</td>
                  <td className="py-2 text-right">{brl(inv.amountCents)}</td>
                </tr>
              ))}
              {r.recentInvoices.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-[#9b95ad]">{t.noInvoices}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
