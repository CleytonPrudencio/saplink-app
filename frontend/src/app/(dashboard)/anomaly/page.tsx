"use client";

import { useEffect, useState } from "react";
import { getAnomalies } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

type StKey = "stStopped" | "stDrop" | "stOk";
const ST: Record<string, { c: string; l: StKey }> = {
  STOPPED: { c: "text-rose-400", l: "stStopped" },
  DROP: { c: "text-amber-400", l: "stDrop" },
  OK: { c: "text-emerald-400", l: "stOk" },
};

const SHEET_T: Record<Lang, {
  client: string; flow: string; source: string; artifact: string; expected: string; current: string; drop: string; status: string;
  guideTitle: string; guideStepsStopped: string[]; guideStepsDrop: string[];
}> = {
  pt: {
    client: "Cliente", flow: "Fluxo", source: "Origem", artifact: "Artefato", expected: "Esperado (~2h)", current: "Atual", drop: "Queda", status: "Status",
    guideTitle: "O que fazer",
    guideStepsStopped: ["O fluxo parou: investigue a integração imediatamente (sem volume nas últimas ~2h).", "Compare o esperado vs. atual para confirmar a interrupção real.", "Verifique agendamentos, conectividade e o IFlow/artefato de origem."],
    guideStepsDrop: ["Queda de volume relevante: investigue o fluxo comparando esperado vs. atual.", "Confira upstream (origem) por gargalos, filtros ou rejeições silenciosas.", "Acompanhe se a queda persiste antes de virar perda de receita."],
  },
  en: {
    client: "Client", flow: "Flow", source: "Source", artifact: "Artifact", expected: "Expected (~2h)", current: "Current", drop: "Drop", status: "Status",
    guideTitle: "What to do",
    guideStepsStopped: ["The flow stopped: investigate the integration immediately (no volume in the last ~2h).", "Compare expected vs. current to confirm the real interruption.", "Check schedules, connectivity and the source IFlow/artifact."],
    guideStepsDrop: ["Relevant volume drop: investigate the flow comparing expected vs. current.", "Check upstream (source) for bottlenecks, filters or silent rejections.", "Monitor whether the drop persists before it turns into lost revenue."],
  },
  es: {
    client: "Cliente", flow: "Flujo", source: "Origen", artifact: "Artefacto", expected: "Esperado (~2h)", current: "Actual", drop: "Caída", status: "Estado",
    guideTitle: "Qué hacer",
    guideStepsStopped: ["El flujo se detuvo: investigue la integración de inmediato (sin volumen en las últimas ~2h).", "Compare esperado vs. actual para confirmar la interrupción real.", "Verifique programaciones, conectividad y el IFlow/artefacto de origen."],
    guideStepsDrop: ["Caída de volumen relevante: investigue el flujo comparando esperado vs. actual.", "Revise upstream (origen) por cuellos de botella, filtros o rechazos silenciosos.", "Monitoree si la caída persiste antes de que se convierta en pérdida de ingresos."],
  },
};

export default function AnomalyPage() {
  const { lang } = useLang();
  const t = T[lang];
  const st = SHEET_T[lang];
  const [data, setData] = useState<{ summary: { tracked: number; anomalies: number }; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<any>(null);

  useEffect(() => { getAnomalies().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">📉 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitleBefore} <b>{t.subtitleBold}</b> {t.subtitleAfter}</p>
        <div className="mt-3"><ExplainData screen={t.explainScreen} data={{ summary: data?.summary, fluxos: data?.items?.slice(0, 10) }} /></div>
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <Stat label={t.statTracked} value={data.summary.tracked} accent="text-[#e2e0ea]" />
          <Stat label={t.statAnomaliesNow} value={data.summary.anomalies} accent={data.summary.anomalies ? "text-amber-300" : "text-emerald-300"} />
        </div>
      )}

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          {t.emptyBaseline}
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-3 py-2 font-medium">{t.thClient}</th><th className="px-3 py-2 font-medium">{t.thFlow}</th>
              <th className="px-3 py-2 font-medium">{t.thExpected}</th><th className="px-3 py-2 font-medium">{t.thCurrent}</th>
              <th className="px-3 py-2 font-medium">{t.thDrop}</th><th className="px-3 py-2 font-medium">{t.thStatus}</th>
            </tr></thead>
            <tbody>
              {data.items.map((a, i) => (
                <tr key={i} onClick={() => setSel(a)} className="border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors">
                  <td className="px-3 py-2 text-[#9b95ad]">{a.client}</td>
                  <td className="px-3 py-2 text-[#e2e0ea]"><span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.06] mr-1">{a.source}</span>{a.artifact}</td>
                  <td className="px-3 py-2 text-[#9b95ad]">{a.expected}</td>
                  <td className="px-3 py-2 text-[#e2e0ea]">{a.current}</td>
                  <td className={`px-3 py-2 ${a.dropPct >= 40 ? "text-amber-300" : "text-[#9b95ad]"}`}>{a.dropPct > 0 ? `${a.dropPct}%` : "—"}</td>
                  <td className="px-3 py-2"><span className={`text-xs font-semibold ${(ST[a.status] || ST.OK).c}`}>{t[(ST[a.status] || ST.OK).l]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon="📉"
          title={`${sel.source} · ${sel.artifact}`}
          subtitle={sel.client}
          badge={<span className={`text-xs font-semibold shrink-0 ${(ST[sel.status] || ST.OK).c}`}>{t[(ST[sel.status] || ST.OK).l]}</span>}
          fields={[
            { label: st.client, value: sel.client },
            { label: st.source, value: <span className="font-mono">{sel.source}</span> },
            { label: st.artifact, value: <span className="font-mono break-all">{sel.artifact}</span> },
            { label: st.expected, value: sel.expected },
            { label: st.current, value: sel.current },
            { label: st.drop, value: sel.dropPct > 0 ? `${sel.dropPct}%` : "—" },
            { label: st.status, value: <span className={`font-semibold ${(ST[sel.status] || ST.OK).c}`}>{t[(ST[sel.status] || ST.OK).l]}</span> },
          ]}
          guideTitle={sel.status === "OK" ? undefined : st.guideTitle}
          guideSteps={sel.status === "STOPPED" ? st.guideStepsStopped : sel.status === "DROP" ? st.guideStepsDrop : undefined}
        >
          <ExplainData screen={`${t.explainScreen} — item`} data={{ client: sel.client, source: sel.source, artifact: sel.artifact, expected: sel.expected, current: sel.current, dropPct: sel.dropPct, status: sel.status }} />
        </DetailSheet>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 text-center">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[11px] text-[#9b95ad] mt-0.5">{label}</div>
    </div>
  );
}
