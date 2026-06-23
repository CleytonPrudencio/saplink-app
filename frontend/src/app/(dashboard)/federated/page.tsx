"use client";

import { useEffect, useState } from "react";
import { getFederated } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { usePaginate, Pagination } from "@/components/Pagination";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

const SHEET_T: Record<Lang, {
  source: string; sample: string; errorNorm: string; occurrences: string; clients: string;
  bestFix: string; successRate: string; applications: string; avgTime: string; noFix: string;
  guideTitle: string; guideSteps: (action: string) => string[]; guideStepsNoFix: string[];
}> = {
  pt: {
    source: "Origem", sample: "Amostra da falha", errorNorm: "Assinatura normalizada", occurrences: "Ocorrências na rede",
    clients: "Clientes afetados", bestFix: "Correção vencedora", successRate: "Taxa de sucesso", applications: "Aplicações",
    avgTime: "Tempo médio", noFix: "Ainda sem correção comprovada para esta assinatura.",
    guideTitle: "O que fazer",
    guideSteps: (a) => [`Aplique a correção vencedora sugerida: ${a}.`, "Confirme que a assinatura da falha bate com o caso atual (origem + mensagem).", "Após aplicar, registre o resultado para reforçar o aprendizado da rede."],
    guideStepsNoFix: ["Investigue a causa raiz pela origem (CPI/AIF/IDoc) e a mensagem normalizada.", "Ao resolver, registre a correção aplicada para alimentar a rede.", "Acompanhe se a assinatura volta a ocorrer em outros clientes."],
  },
  en: {
    source: "Source", sample: "Failure sample", errorNorm: "Normalized signature", occurrences: "Occurrences in the network",
    clients: "Affected clients", bestFix: "Winning fix", successRate: "Success rate", applications: "Applications",
    avgTime: "Avg. time", noFix: "No proven fix for this signature yet.",
    guideTitle: "What to do",
    guideSteps: (a) => [`Apply the suggested winning fix: ${a}.`, "Confirm the failure signature matches the current case (source + message).", "After applying, record the outcome to reinforce network learning."],
    guideStepsNoFix: ["Investigate the root cause by source (CPI/AIF/IDoc) and the normalized message.", "Once resolved, record the applied fix to feed the network.", "Watch whether the signature recurs at other clients."],
  },
  es: {
    source: "Origen", sample: "Muestra de la falla", errorNorm: "Firma normalizada", occurrences: "Ocurrencias en la red",
    clients: "Clientes afectados", bestFix: "Corrección ganadora", successRate: "Tasa de éxito", applications: "Aplicaciones",
    avgTime: "Tiempo medio", noFix: "Aún sin corrección comprobada para esta firma.",
    guideTitle: "Qué hacer",
    guideSteps: (a) => [`Aplique la corrección ganadora sugerida: ${a}.`, "Confirme que la firma de la falla coincide con el caso actual (origen + mensaje).", "Tras aplicar, registre el resultado para reforzar el aprendizaje de la red."],
    guideStepsNoFix: ["Investigue la causa raíz por origen (CPI/AIF/IDoc) y el mensaje normalizado.", "Al resolver, registre la corrección aplicada para alimentar la red.", "Observe si la firma vuelve a ocurrir en otros clientes."],
  },
};

export default function FederatedPage() {
  const [data, setData] = useState<{ summary: { signatures: number; occurrences: number }; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<any>(null);
  const { lang } = useLang();
  const t = T[lang];
  const st = SHEET_T[lang];

  useEffect(() => { getFederated().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);
  const pag = usePaginate<any>(data?.items || [], 15);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🛰️ {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen="Rede Federada de Falhas" data={{ summary: data?.summary, top: data?.items?.slice(0, 8) }} /></div>
      </div>

      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg">
          <Stat label={t.signatures} value={data.summary.signatures} accent="text-cyan-300" />
          <Stat label={t.occurrences} value={data.summary.occurrences} accent="text-purple-300" />
          <Stat label={t.learnedFixes} value={data.items.filter((i) => i.bestFix).length} accent="text-emerald-300" />
        </div>
      )}

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          {t.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {pag.pageItems.map((s: any, i: number) => (
            <div key={i} onClick={() => setSel(s)} className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08] cursor-pointer hover:bg-white/[0.03] transition-colors">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.06] mr-2">{s.source}</span>
                  <span className="text-sm text-[#e2e0ea]">{s.sample || s.errorNorm}</span>
                </div>
                <div className="flex gap-4 text-right shrink-0">
                  <div><div className="text-lg font-bold text-purple-300">{s.occurrences}×</div><div className="text-[10px] text-[#9b95ad]">{t.inNetwork}</div></div>
                  <div><div className="text-lg font-bold text-cyan-300">{s.clientsCount}</div><div className="text-[10px] text-[#9b95ad]">{t.clients}</div></div>
                </div>
              </div>
              {s.bestFix ? (
                <div className="mt-3 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-emerald-200">{t.winningFix} <b>{s.bestFix.action}</b></span>
                  <span className="text-xs text-[#9b95ad]">{t.fixStats(s.bestFix.successRate, s.bestFix.count, s.bestFix.avgMinutes)}</span>
                </div>
              ) : (
                <div className="mt-3 text-xs text-[#9b95ad]">{t.noProvenFix}</div>
              )}
            </div>
          ))}
          <Pagination {...pag} />
        </div>
      )}
      <p className="text-xs text-[#6b6580]">{t.privacyNote}</p>

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon="🛰️"
          title={sel.sample || sel.errorNorm || st.errorNorm}
          subtitle={`${sel.source} · ${sel.occurrences}× ${t.inNetwork}`}
          fields={[
            { label: st.source, value: <span className="font-mono">{sel.source}</span> },
            { label: st.errorNorm, value: <span className="font-mono break-all">{sel.errorNorm}</span> },
            { label: st.sample, value: sel.sample },
            { label: st.occurrences, value: `${sel.occurrences}×` },
            { label: st.clients, value: sel.clientsCount },
            { label: st.bestFix, value: sel.bestFix ? <b className="text-emerald-300">{sel.bestFix.action}</b> : st.noFix },
            { label: st.successRate, value: sel.bestFix ? `${sel.bestFix.successRate}%` : undefined },
            { label: st.applications, value: sel.bestFix ? sel.bestFix.count : undefined },
            { label: st.avgTime, value: sel.bestFix ? `~${sel.bestFix.avgMinutes}min` : undefined },
          ]}
          guideTitle={st.guideTitle}
          guideSteps={sel.bestFix ? st.guideSteps(sel.bestFix.action) : st.guideStepsNoFix}
        >
          <ExplainData screen="Rede Federada de Falhas — item" data={{ source: sel.source, errorNorm: sel.errorNorm, sample: sel.sample, occurrences: sel.occurrences, clientsCount: sel.clientsCount, bestFix: sel.bestFix }} />
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
