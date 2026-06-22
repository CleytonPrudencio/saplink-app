"use client";

import { useEffect, useState } from "react";
import { getIncidents, getTimeline } from "@/lib/api";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }
const TONE: Record<string, string> = { bad: "border-rose-500/40 bg-rose-500/[0.06]", warn: "border-amber-500/40 bg-amber-500/[0.06]", ok: "border-emerald-500/40 bg-emerald-500/[0.06]" };

export default function TimeMachinePage() {
  const { lang } = useLang();
  const t = T[lang];
  const [incidents, setIncidents] = useState<any[]>([]);
  const [sel, setSel] = useState<string>("");
  const [tl, setTl] = useState<any>(null);
  const [detectMin, setDetectMin] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getIncidents().then((d) => { setIncidents(d.incidents); if (d.incidents[0]) setSel(d.incidents[0].id); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (sel) getTimeline(sel).then(setTl).catch(() => setTl(null)); }, [sel]);

  const actual = tl?.cost?.actualCents || 0;
  const perMin = (tl?.cost?.costPerHourCents || 0) / 60;
  const counterfactual = Math.round(perMin * detectMin);
  const saved = Math.max(0, actual - counterfactual);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">⏪ {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitleBefore} <b>{t.subtitleBold}</b>{t.subtitleAfter}</p>
      </div>

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : incidents.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">{t.emptyIncidents}</div>
      ) : (
        <>
          <select value={sel} onChange={(e) => setSel(e.target.value)} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm w-full max-w-2xl">
            {incidents.map((a) => <option key={a.id} value={a.id}>[{a.severity}] {a.message.slice(0, 70)} — {a.client}</option>)}
          </select>

          {tl?.ok && (
            <>
              {/* Contrafactual */}
              <div className="bg-gradient-to-br from-purple-600/15 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-5">
                <h2 className="font-semibold mb-3">💰 {t.whatIfTitle}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div><div className="text-xs text-[#9b95ad]">{t.realImpact(tl.cost.durationMin)}</div><div className="text-2xl font-bold text-rose-300">{brl(actual)}</div></div>
                  <div>
                    <div className="text-xs text-[#9b95ad]">{t.ifDetectedInBefore} <b className="text-cyan-300">{detectMin} {t.ifDetectedInAfter}</b></div>
                    <input type="range" min={1} max={60} value={detectMin} onChange={(e) => setDetectMin(Number(e.target.value))} className="w-full accent-cyan-500 mt-1" />
                    <div className="text-2xl font-bold text-amber-300">{brl(counterfactual)}</div>
                  </div>
                  <div className="text-center rounded-xl p-3 bg-emerald-500/[0.08] border border-emerald-500/20"><div className="text-xs text-[#9b95ad]">{t.savingsWithSaplink}</div><div className="text-3xl font-extrabold text-emerald-300">{brl(saved)}</div></div>
                </div>
                {!tl.cost.costPerHourCents && <p className="text-xs text-[#6b6580] mt-3">{t.defineCostHint}</p>}
              </div>

              {/* Timeline */}
              <div>
                <h2 className="font-semibold mb-3">{t.timelineTitle}</h2>
                <div className="space-y-2 border-l-2 border-white/[0.08] pl-4">
                  {tl.events.map((e: any, i: number) => (
                    <div key={i} className={`rounded-lg border px-3 py-2 ${TONE[e.tone] || "border-white/[0.08] bg-white/[0.02]"}`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06]">{e.kind}</span>
                        <span className="text-sm text-[#e2e0ea]">{e.label}</span>
                      </div>
                      <span className="text-[11px] text-[#6b6580]">{new Date(e.at).toLocaleString("pt-BR")}</span>
                    </div>
                  ))}
                  {tl.events.length === 0 && <p className="text-sm text-[#9b95ad]">{t.noEvents}</p>}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
