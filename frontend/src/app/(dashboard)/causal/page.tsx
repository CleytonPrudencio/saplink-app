"use client";

import { useEffect, useState } from "react";
import { getCausal } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

export default function CausalPage() {
  const [data, setData] = useState<{ window: number; summary: { correlated: number }; items: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();
  const t = T[lang];

  useEffect(() => { getCausal().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🔗 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitleA}<b>{t.subtitleB}</b>{t.subtitleC}<b>{t.subtitleD}</b>{t.subtitleE}</p>
        <div className="mt-3"><ExplainData screen="Causa raiz cross-camada" data={{ summary: data?.summary, links: data?.items?.slice(0, 8) }} /></div>
      </div>

      {data && (
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <Stat label={t.correlationsFound} value={data.summary.correlated} accent="text-orange-300" />
          <Stat label={t.analysisWindow} value={`${data.window}h`} accent="text-[#e2e0ea]" />
        </div>
      )}

      {loading ? <div className="text-[#9b95ad]">{t.loading}</div> : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          {t.empty(data?.window ?? 8)}
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((l, i) => (
            <div key={i} className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300">{l.source} {l.status}</span>
                <span className="text-[#e2e0ea] font-medium">{l.artifact}</span>
                <span className="text-[#9b95ad] text-xs">· {l.client} · {l.occurredAt ? new Date(l.occurredAt).toLocaleString("pt-BR") : ""}</span>
              </div>
              {l.error && <p className="text-xs text-[#9b95ad] mt-1">{l.error}</p>}
              <div className="mt-3 flex items-center gap-3 bg-orange-500/[0.07] border border-orange-500/20 rounded-lg px-3 py-2 flex-wrap">
                <span className="text-2xl">⬅️</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-orange-200">{t.probableCause} <b>{l.topCause.trNumber}</b> — {l.topCause.description || t.transportFallback}</p>
                  <p className="text-xs text-[#9b95ad]">{t.causeMeta(l.topCause.owner, l.topCause.gapHours, l.topCause.target || "—")}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-orange-300">{l.topCause.confidence}%</div>
                  <div className="text-[10px] text-[#9b95ad]">{t.confidence}</div>
                </div>
              </div>
              {l.otherCauses?.length > 0 && (
                <p className="text-[11px] text-[#6b6580] mt-2">{t.otherSuspects(l.otherCauses.map((c: any) => c.trNumber).join(", "))}</p>
              )}
            </div>
          ))}
        </div>
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
