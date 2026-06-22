"use client";

import { useEffect, useState } from "react";
import {
  getMe, getSla, setSlaTargets, getSlaReport, getImpact, getImpactIntegrations, setIntegrationCost,
  type SlaClient, type ImpactItem,
} from "@/lib/api";
import { AiReport } from "@/components/AiReport";
import ExplainData from "@/components/ExplainData";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

type Dict = (typeof T)[Lang];

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function compCls(c: number, target = 100) {
  if (c >= target) return "text-emerald-400";
  if (c >= 90) return "text-amber-300";
  return "text-rose-400";
}

export default function SlaPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sla, setSla] = useState<{ clients: SlaClient[]; overall: number } | null>(null);
  const [impact, setImpact] = useState<{ items: ImpactItem[]; totals: { monitoredWithCost: number; atRisk: number; riskPerHourCents: number; accumulatedCents: number } } | null>(null);
  const [costList, setCostList] = useState<{ id: string; name: string; type: string; client?: string; costPerHourCents: number; businessProcess: string | null }[]>([]);
  const [report, setReport] = useState<{ client: string; text: string } | null>(null);
  const [busy, setBusy] = useState("");

  async function load() {
    setSla(await getSla());
    setImpact(await getImpact());
  }
  useEffect(() => {
    getMe().then((u) => {
      const admin = u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN";
      setIsAdmin(admin);
      if (admin) getImpactIntegrations().then((r) => setCostList(r.integrations)).catch(() => {});
    }).catch(() => {});
    load().catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function onSaveTarget(clientId: string, uptimeTarget: number, maxLatencyMs: number) {
    setBusy(clientId);
    try { await setSlaTargets(clientId, { uptimeTarget, maxLatencyMs }); await load(); } finally { setBusy(""); }
  }
  async function onReport(clientId: string, name: string) {
    setBusy("report-" + clientId); setReport(null);
    try { const r = await getSlaReport(clientId); setReport({ client: name, text: r.narrative || t.reportUnavailable }); }
    finally { setBusy(""); }
  }
  async function onSaveCost(id: string, cents: number, bp: string) {
    setBusy("cost-" + id);
    try { await setIntegrationCost(id, { costPerHourCents: cents, businessProcess: bp }); await Promise.all([load(), getImpactIntegrations().then((r) => setCostList(r.integrations))]); }
    finally { setBusy(""); }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">📊 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen="SLA & Impacto financeiro" data={{ sla, impacto: impact?.totals }} /></div>
      </div>

      {/* SLA */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{t.slaSection}</h2>
          {sla && <span className={`text-sm font-bold ${compCls(sla.overall)}`}>{t.overallCompliance(sla.overall)}</span>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {sla?.clients.map((c) => (
            <SlaCard key={c.clientId} c={c} isAdmin={isAdmin} busy={busy} onSave={onSaveTarget} onReport={onReport} t={t} />
          ))}
        </div>
        {report && (
          <AiReport text={report.text} title={t.reportTitle(report.client)} subtitle={t.reportSubtitle} meta={[{ label: t.reportClientLabel, value: report.client }, { label: t.reportGeneratedLabel, value: new Date().toLocaleString("pt-BR") }]} />
        )}
      </section>

      {/* Impacto R$ */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t.impactSection}</h2>
        {impact && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label={t.statRiskPerHour} value={brl(impact.totals.riskPerHourCents)} accent="text-rose-300" />
            <Stat label={t.statAccumulated} value={brl(impact.totals.accumulatedCents)} accent="text-orange-300" />
            <Stat label={t.statDown} value={String(impact.totals.atRisk)} accent="text-amber-300" />
            <Stat label={t.statMonitoredWithCost} value={String(impact.totals.monitoredWithCost)} accent="text-[#e2e0ea]" />
          </div>
        )}
        {impact && impact.items.length > 0 && (
          <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-3 py-2 font-medium">{t.colIntegration}</th><th className="px-3 py-2 font-medium">{t.colProcess}</th>
                <th className="px-3 py-2 font-medium">{t.colStatus}</th><th className="px-3 py-2 font-medium text-right">{t.colPerHour}</th>
                <th className="px-3 py-2 font-medium text-right">{t.colHours}</th><th className="px-3 py-2 font-medium text-right">{t.colAccumulated}</th>
              </tr></thead>
              <tbody>
                {impact.items.map((i) => (
                  <tr key={i.integrationId} className="border-b border-white/[0.04]">
                    <td className="px-3 py-2 text-[#e2e0ea]">{i.integration}<span className="block text-xs text-[#9b95ad]">{i.client}</span></td>
                    <td className="px-3 py-2 text-[#9b95ad]">{i.businessProcess || "—"}</td>
                    <td className="px-3 py-2"><span className={i.atRisk ? "text-rose-400" : "text-emerald-400"}>{i.status}</span></td>
                    <td className="px-3 py-2 text-right text-[#c9c5d6]">{brl(i.costPerHourCents)}</td>
                    <td className="px-3 py-2 text-right text-[#9b95ad]">{i.hoursDown}h</td>
                    <td className="px-3 py-2 text-right font-semibold text-orange-300">{brl(i.accumulatedCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isAdmin && (
          <details className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]">
            <summary className="cursor-pointer text-sm font-semibold">{t.setCostSummary}</summary>
            <div className="space-y-2 mt-3">
              {costList.map((i) => <CostRow key={i.id} i={i} busy={busy} onSave={onSaveCost} t={t} />)}
            </div>
          </details>
        )}
      </section>
    </div>
  );
}

function SlaCard({ c, isAdmin, busy, onSave, onReport, t }: {
  c: SlaClient; isAdmin: boolean; busy: string;
  onSave: (id: string, up: number, lat: number) => void; onReport: (id: string, name: string) => void; t: Dict;
}) {
  const [up, setUp] = useState(c.uptimeTarget);
  const [lat, setLat] = useState(c.maxLatencyMs);
  return (
    <div className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{c.client}</h3>
        <span className={`text-lg font-bold ${compCls(c.compliance)}`}>{c.compliance}%</span>
      </div>
      <p className="text-xs text-[#9b95ad] mt-1">{t.cardSlaSummary(c.meeting, c.integrations, c.avgUptime, c.avgLatency)}</p>
      {c.breaches.length > 0 && (
        <ul className="mt-2 space-y-1">
          {c.breaches.slice(0, 4).map((b, i) => <li key={i} className="text-xs text-rose-300">• {b.name}: {b.reason}</li>)}
        </ul>
      )}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {isAdmin && (
          <>
            <label className="text-xs text-[#9b95ad]">{t.uptimeTargetLabel}</label>
            <input type="number" step="0.1" value={up} onChange={(e) => setUp(Number(e.target.value))} className="w-16 bg-[#0f0b1a] border border-white/[0.1] rounded px-2 py-1 text-xs" />
            <label className="text-xs text-[#9b95ad]">{t.maxLatencyLabel}</label>
            <input type="number" value={lat} onChange={(e) => setLat(Number(e.target.value))} className="w-20 bg-[#0f0b1a] border border-white/[0.1] rounded px-2 py-1 text-xs" />
            <button onClick={() => onSave(c.clientId, up, lat)} disabled={busy === c.clientId} className="text-xs px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer">{t.save}</button>
          </>
        )}
        <button onClick={() => onReport(c.clientId, c.client)} disabled={busy === "report-" + c.clientId} className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 cursor-pointer ml-auto">
          {busy === "report-" + c.clientId ? t.generating : t.aiReport}
        </button>
      </div>
    </div>
  );
}

function CostRow({ i, busy, onSave, t }: {
  i: { id: string; name: string; client?: string; costPerHourCents: number; businessProcess: string | null };
  busy: string; onSave: (id: string, cents: number, bp: string) => void; t: Dict;
}) {
  const [reais, setReais] = useState((i.costPerHourCents / 100).toString());
  const [bp, setBp] = useState(i.businessProcess || "");
  return (
    <div className="flex items-center gap-2 flex-wrap bg-[#0f0b1a] rounded-lg px-3 py-2">
      <span className="text-sm text-[#e2e0ea] flex-1 min-w-[140px]">{i.name} <span className="text-xs text-[#9b95ad]">{i.client}</span></span>
      <input value={bp} onChange={(e) => setBp(e.target.value)} placeholder={t.businessProcessPlaceholder} className="bg-[#1a1527] border border-white/[0.1] rounded px-2 py-1 text-xs w-44" />
      <span className="text-xs text-[#9b95ad]">{t.perHour}</span>
      <input type="number" value={reais} onChange={(e) => setReais(e.target.value)} className="bg-[#1a1527] border border-white/[0.1] rounded px-2 py-1 text-xs w-24" />
      <button onClick={() => onSave(i.id, Math.round(Number(reais) * 100), bp)} disabled={busy === "cost-" + i.id} className="text-xs px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer">{t.save}</button>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 text-center">
      <div className={`text-xl font-bold ${accent}`}>{value}</div>
      <div className="text-[11px] text-[#9b95ad] mt-0.5">{label}</div>
    </div>
  );
}
