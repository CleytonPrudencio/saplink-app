"use client";

import { useEffect, useState } from "react";
import { getMoneyGraph } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }

const SHEET_T: Record<Lang, {
  integration: string; client: string; process: string; downtime: string; perHour: string; atRisk: string;
  guideTitle: string; guideSteps: string[];
}> = {
  pt: {
    integration: "Integração", client: "Cliente", process: "Processo", downtime: "Parada", perHour: "Custo por hora", atRisk: "Em risco agora",
    guideTitle: "O que fazer",
    guideSteps: ["Priorize pelo maior impacto: esta é a integração com mais R$ parados agora.", "Restabeleça a integração para estancar a perda por hora.", "Revise o custo de parada por hora cadastrado para manter o cálculo fiel."],
  },
  en: {
    integration: "Integration", client: "Client", process: "Process", downtime: "Downtime", perHour: "Cost per hour", atRisk: "At risk now",
    guideTitle: "What to do",
    guideSteps: ["Prioritize by biggest impact: this is the integration with the most money stuck right now.", "Restore the integration to stop the per-hour loss.", "Review the configured downtime cost per hour to keep the calculation accurate."],
  },
  es: {
    integration: "Integración", client: "Cliente", process: "Proceso", downtime: "Parada", perHour: "Costo por hora", atRisk: "En riesgo ahora",
    guideTitle: "Qué hacer",
    guideSteps: ["Priorice por mayor impacto: esta es la integración con más dinero detenido ahora.", "Restablezca la integración para detener la pérdida por hora.", "Revise el costo de parada por hora configurado para mantener el cálculo fiel."],
  },
};

export default function MoneyPage() {
  const { lang } = useLang();
  const t = T[lang];
  const st = SHEET_T[lang];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<any>(null);

  useEffect(() => { getMoneyGraph().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);

  const s = data?.summary;
  const maxProc = Math.max(1, ...(data?.byProcess || []).map((p: any) => p.atRiskCents));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">💸 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen={t.explainScreen} data={{ summary: data?.summary, porProcesso: data?.byProcess, integracoes: data?.nodes?.slice(0, 8) }} /></div>
      </div>

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : (
        <>
          <div className="bg-gradient-to-br from-rose-500/15 to-purple-500/10 border border-rose-500/30 rounded-2xl p-6">
            <div className="text-[#9b95ad] text-sm">{t.totalAtRiskNow}</div>
            <div className="text-5xl font-extrabold text-rose-300 mt-1">{brl(s?.totalAtRiskCents ?? 0)}</div>
            <div className="flex gap-6 mt-4 text-sm flex-wrap">
              <span className="text-[#e2e0ea]">⏱️ {t.downtime}: <b className="text-amber-300">{brl(s?.downtimeAtRiskCents ?? 0)}</b></span>
              <span className="text-[#e2e0ea]">🧾 {t.fiscalBlocked}: <b className="text-amber-300">{brl(s?.fiscalAtRiskCents ?? 0)}</b></span>
              <span className="text-[#e2e0ea]">🔌 {t.integrationsDown}: <b className="text-rose-300">{s?.integrationsDown ?? 0}</b></span>
            </div>
          </div>

          {(data?.byProcess || []).length > 0 && (
            <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
              <h2 className="text-lg font-semibold mb-3">{t.byBusinessProcess}</h2>
              <div className="space-y-3">
                {data.byProcess.map((p: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#e2e0ea]">{p.process} <span className="text-xs text-[#9b95ad]">({p.integrations} {t.integrationsShort})</span></span>
                      <span className="text-rose-300 font-semibold">{brl(p.atRiskCents)}</span>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: `${(p.atRiskCents / maxProc) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(data?.nodes || []).length > 0 ? (
            <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-3 py-2 font-medium">{t.thIntegration}</th><th className="px-3 py-2 font-medium">{t.thClient}</th>
                  <th className="px-3 py-2 font-medium">{t.thProcess}</th><th className="px-3 py-2 font-medium">{t.thDowntime}</th>
                  <th className="px-3 py-2 font-medium">{t.thPerHour}</th><th className="px-3 py-2 font-medium">{t.thAtRisk}</th>
                </tr></thead>
                <tbody>
                  {data.nodes.map((n: any, i: number) => (
                    <tr key={i} onClick={() => setSel(n)} className="border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors">
                      <td className="px-3 py-2 text-[#e2e0ea]">{n.integration}</td>
                      <td className="px-3 py-2 text-[#9b95ad]">{n.client}</td>
                      <td className="px-3 py-2 text-[#9b95ad]">{n.process}</td>
                      <td className="px-3 py-2 text-amber-300">{t.hoursUnit(n.hoursDown)}</td>
                      <td className="px-3 py-2 text-[#9b95ad]">{brl(n.costPerHourCents)}</td>
                      <td className="px-3 py-2 text-rose-300 font-semibold">{brl(n.atRiskCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
              {t.emptyBefore} <b>{t.emptyBold1}</b> {t.emptyMid} <b>{t.emptyBold2}</b> {t.emptyAfter}
            </div>
          )}
        </>
      )}

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon="💸"
          title={sel.integration}
          subtitle={`${sel.client} · ${sel.process}`}
          badge={<span className="text-xs font-semibold text-rose-300 shrink-0">{brl(sel.atRiskCents)}</span>}
          fields={[
            { label: st.integration, value: sel.integration },
            { label: st.client, value: sel.client },
            { label: st.process, value: sel.process },
            { label: st.downtime, value: t.hoursUnit(sel.hoursDown) },
            { label: st.perHour, value: brl(sel.costPerHourCents) },
            { label: st.atRisk, value: <b className="text-rose-300">{brl(sel.atRiskCents)}</b> },
          ]}
          guideTitle={st.guideTitle}
          guideSteps={st.guideSteps}
        >
          <ExplainData screen={`${t.explainScreen} — item`} data={{ integration: sel.integration, client: sel.client, process: sel.process, hoursDown: sel.hoursDown, costPerHourCents: sel.costPerHourCents, atRiskCents: sel.atRiskCents }} />
        </DetailSheet>
      )}
    </div>
  );
}
