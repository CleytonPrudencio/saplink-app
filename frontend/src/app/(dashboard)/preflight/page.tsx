"use client";

import { useEffect, useState } from "react";
import { getPreflightList, getBlastRadius } from "@/lib/api";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }
const LV: Record<string, string> = { ALTO: "text-rose-400", "MÉDIO": "text-amber-300", BAIXO: "text-emerald-400" };

export default function PreflightPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [transports, setTransports] = useState<any[]>([]);
  const [sel, setSel] = useState<string>("");
  const [r, setR] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getPreflightList().then((d) => { setTransports(d.transports); if (d.transports[0]) setSel(d.transports[0].id); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (sel) getBlastRadius(sel).then(setR).catch(() => setR(null)); }, [sel]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🧨 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitleBefore} <b>{t.subtitleBold1}</b> {t.subtitleMid} <b>{t.subtitleBold2}</b> {t.subtitleAfter}</p>
      </div>

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : transports.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">{t.emptyTransports}</div>
      ) : (
        <>
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm w-full max-w-xl">
            {transports.map((tr) => <option key={tr.id} value={tr.id}>{tr.trNumber} — {tr.description || t.noDescription} → {tr.target} ({tr.client})</option>)}
          </select>

          {r?.ok && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5 border" style={{ borderColor: r.riskScore >= 70 ? "#f8717140" : r.riskScore >= 40 ? "#fbbf2440" : "#34d39940", background: "rgba(255,255,255,0.02)" }}>
                  <div className="text-xs text-[#9b95ad]">{t.riskScore}</div>
                  <div className={`text-5xl font-extrabold mt-1 ${LV[r.riskLevel]}`}>{r.riskScore}</div>
                  <div className={`text-sm font-semibold ${LV[r.riskLevel]}`}>{r.riskLevel}</div>
                  <ul className="mt-3 space-y-1">{r.riskFactors.map((f: string, i: number) => <li key={i} className="text-xs text-[#c9c5d6] flex gap-1.5"><span className="text-amber-400">•</span>{f}</li>)}</ul>
                </div>
                <Stat label={t.interfacesInRadius} value={r.affected.interfaces.length} sub={t.clientCatalog} />
                <Stat label={t.atRiskPerHour} value={brl(r.affected.atRiskPerHourCents)} sub={t.processesIntegrations(r.affected.processes.length, r.affected.integrations.length)} amber />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
                  <h2 className="font-semibold mb-3">{t.affectedTitle}</h2>
                  <div className="flex flex-wrap gap-1.5 mb-3">{r.affected.processes.map((p: string) => <span key={p} className="text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-200">{p}</span>)}{r.affected.processes.length === 0 && <span className="text-xs text-[#6b6580]">{t.noProcessClassified}</span>}</div>
                  <div className="space-y-1.5">{r.affected.integrations.slice(0, 8).map((i: any, k: number) => <div key={k} className="flex justify-between text-sm bg-[#0f0b1a] rounded px-2.5 py-1.5"><span className="text-[#e2e0ea]">{i.name}</span><span className="text-xs text-[#9b95ad]">{i.type} · {i.status}</span></div>)}</div>
                </div>
                <div className="bg-[#1a1527] rounded-xl p-5 border border-emerald-500/20">
                  <h2 className="font-semibold mb-3">✅ {t.testPlanTitle}</h2>
                  <ol className="space-y-2">{r.testPlan.map((s: string, i: number) => <li key={i} className="flex gap-2 text-sm text-[#d6d3e0]"><span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-300 flex items-center justify-center text-xs shrink-0">{i + 1}</span>{s}</li>)}</ol>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub, amber }: { label: string; value: number | string; sub?: string; amber?: boolean }) {
  return <div className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-5"><div className="text-xs text-[#9b95ad]">{label}</div><div className={`text-3xl font-extrabold mt-1 ${amber ? "text-amber-300" : "text-[#e2e0ea]"}`}>{value}</div>{sub && <div className="text-xs text-[#9b95ad] mt-1">{sub}</div>}</div>;
}
