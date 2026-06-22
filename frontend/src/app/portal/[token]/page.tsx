"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPortal } from "@/lib/api";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface PortalData {
  consultancy: { name: string; logoUrl?: string | null; primaryColor?: string | null };
  client: { name: string; healthScore: number };
  summary: { integrations: number; byStatus: Record<string, number>; avgUptime: number; openIncidents: number };
  integrations: { name: string; type: string; status: string; uptime: number; errorRate: number; latency: number }[];
  incidents: { severity: string; message: string; createdAt: string }[];
}

function statusCls(s: string) {
  const u = (s || "").toUpperCase();
  if (u === "ACTIVE") return "text-emerald-400";
  if (u === "ERROR") return "text-amber-400";
  if (u === "OFFLINE") return "text-rose-400";
  return "text-[#9b95ad]";
}

export default function PortalPage() {
  const { lang } = useLang();
  const t = T[lang];
  const params = useParams();
  const token = String(params?.token || "");
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getPortal(token).then(setData).catch(() => setError(true)).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#9b95ad]">{t.loading}</div>;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0b1a] text-center px-4">
      <div>
        <h1 className="text-xl font-bold text-[#e2e0ea]">{t.unavailableTitle}</h1>
        <p className="text-[#9b95ad] mt-2">{t.unavailableBody}</p>
      </div>
    </div>
  );

  const accent = data.consultancy.primaryColor || "#a78bfa";

  return (
    <div className="min-h-screen bg-transparent text-[#e2e0ea]">
      <header className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
        {data.consultancy.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.consultancy.logoUrl} alt={data.consultancy.name} className="max-h-9 max-w-[160px] object-contain" />
        ) : (
          <span className="text-lg font-bold" style={{ color: accent }}>◆ {data.consultancy.name}</span>
        )}
        <span className="text-sm text-[#9b95ad]">{t.headerHealthPortal} · {data.client.name}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{data.client.name}</h1>
          <p className="text-[#9b95ad] text-sm mt-1">{t.realtimeSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card label={t.healthScore} value={`${data.client.healthScore}`} accent={accent} />
          <Card label={t.avgUptime} value={`${data.summary.avgUptime}%`} accent="#34d399" />
          <Card label={t.integrations} value={`${data.summary.integrations}`} accent="#e2e0ea" />
          <Card label={t.openIncidents} value={`${data.summary.openIncidents}`} accent={data.summary.openIncidents ? "#f87171" : "#34d399"} />
        </div>

        <section>
          <h2 className="text-sm font-semibold text-[#9b95ad] uppercase tracking-wider mb-2">{t.integrationsSection}</h2>
          <div className="border border-white/[0.08] rounded-xl overflow-hidden">
            {data.integrations.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{i.name}</p>
                  <p className="text-xs text-[#9b95ad]">{i.type} · {t.uptime} {i.uptime}% · {i.latency}ms</p>
                </div>
                <span className={`text-sm font-semibold ${statusCls(i.status)}`}>{i.status}</span>
              </div>
            ))}
            {data.integrations.length === 0 && <p className="px-4 py-3 text-sm text-[#9b95ad]">{t.noIntegrations}</p>}
          </div>
        </section>

        {data.incidents.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-[#9b95ad] uppercase tracking-wider mb-2">{t.openIncidentsSection}</h2>
            <div className="space-y-2">
              {data.incidents.map((a, idx) => (
                <div key={idx} className="bg-[#1a1527] border border-white/[0.08] rounded-lg px-3 py-2">
                  <p className="text-sm"><span className="text-rose-300 font-semibold">{a.severity}</span> · {a.message}</p>
                  <p className="text-xs text-[#9b95ad] mt-0.5">{new Date(a.createdAt).toLocaleString(t.locale)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="text-center text-xs text-[#6b6580] pt-6">
          {t.monitoredBy(data.consultancy.name)}
        </footer>
      </main>
    </div>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 text-center">
      <div className="text-2xl font-bold" style={{ color: accent }}>{value}</div>
      <div className="text-[11px] text-[#9b95ad] mt-0.5">{label}</div>
    </div>
  );
}
