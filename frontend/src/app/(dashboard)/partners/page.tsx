"use client";

import { useEffect, useState } from "react";
import { getPartners } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { usePaginate, Pagination } from "@/components/Pagination";
import { useLang } from "@/i18n/I18n";
import { UI, tUI } from "@/i18n/ui";
import { T } from "./i18n";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function PartnersPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selP, setSelP] = useState<any>(null);
  const [selF, setSelF] = useState<any>(null);
  useEffect(() => { getPartners().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);

  const pagP = usePaginate<any>(data?.partners || [], 15);
  const pagF = usePaginate<any>(data?.finops?.flows || [], 15);
  if (loading) return <div className="text-[#9b95ad]">{tUI(UI.comp.loading, lang)}</div>;
  const fin = data?.finops;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🤝 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen="Parceiros EDI & FinOps BTP" data={{ parceiros: data?.partners?.slice(0, 8), finops: fin?.summary }} /></div>
      </div>

      {/* Parceiros EDI */}
      <section>
        <h2 className="text-lg font-semibold mb-3">{t.partnersHeading}</h2>
        {(!data?.partners || data.partners.length === 0) ? (
          <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] text-center text-[#9b95ad] text-sm">{t.partnersEmpty}</div>
        ) : (
          <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-3 py-2 font-medium">{t.colPartner}</th><th className="px-3 py-2 font-medium">{t.colItems}</th><th className="px-3 py-2 font-medium">{t.colErrors}</th>
                <th className="px-3 py-2 font-medium">{t.colErrorRate}</th><th className="px-3 py-2 font-medium">{t.colShareOfErrors}</th><th className="px-3 py-2 font-medium">{t.colScore}</th>
              </tr></thead>
              <tbody>
                {pagP.pageItems.map((p: any, i: number) => (
                  <tr key={i} onClick={() => setSelP(p)} className="border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors">
                    <td className="px-3 py-2 font-mono text-[#e2e0ea]">{p.partner}</td>
                    <td className="px-3 py-2 text-[#9b95ad]">{p.total}</td>
                    <td className="px-3 py-2 text-rose-300">{p.errors}</td>
                    <td className="px-3 py-2 text-amber-300">{p.errorRate}%</td>
                    <td className="px-3 py-2 text-[#c9c5d6]">{p.shareOfErrors}%</td>
                    <td className="px-3 py-2"><span className={`font-bold ${p.score >= 80 ? "text-emerald-400" : p.score >= 50 ? "text-amber-300" : "text-rose-400"}`}>{p.score}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 pb-3"><Pagination {...pagP} /></div>
          </div>
        )}
      </section>

      {/* FinOps BTP */}
      <section>
        <div className="flex items-end justify-between flex-wrap gap-2 mb-3">
          <h2 className="text-lg font-semibold">{t.finopsHeading}</h2>
          {fin && <span className="text-sm text-[#9b95ad]">{fin.summary.totalMessages30d.toLocaleString("pt-BR")} msg/30d · <b className="text-amber-300">~{brl(fin.summary.estMonthlyCents)}{t.perMonthSuffix}</b></span>}
        </div>
        {(!fin?.flows || fin.flows.length === 0) ? (
          <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] text-center text-[#9b95ad] text-sm">{t.finopsEmpty}</div>
        ) : (
          <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-3 py-2 font-medium">{t.colSource}</th><th className="px-3 py-2 font-medium">{t.colArtifact}</th>
                <th className="px-3 py-2 font-medium text-right">{t.colMessages30d}</th><th className="px-3 py-2 font-medium text-right">{t.colEstMonthly}</th>
              </tr></thead>
              <tbody>
                {pagF.pageItems.map((f: any, i: number) => (
                  <tr key={i} onClick={() => setSelF(f)} className="border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors">
                    <td className="px-3 py-2"><span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/[0.06]">{f.source}</span></td>
                    <td className="px-3 py-2 text-[#e2e0ea]">{f.artifact}</td>
                    <td className="px-3 py-2 text-right text-[#c9c5d6]">{f.messages30d.toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-2 text-right text-amber-300">{brl(f.estMonthlyCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 pb-3"><Pagination {...pagF} /></div>
          </div>
        )}
        <p className="text-xs text-[#6b6580] mt-2">{t.finopsNote}</p>
      </section>

      {selP && (
        <DetailSheet
          open={!!selP}
          onClose={() => setSelP(null)}
          icon="🤝"
          title={selP.partner}
          subtitle={t.sheetPartnerSub}
          badge={<span className={`text-sm font-bold px-2 py-0.5 rounded ${selP.score >= 80 ? "text-emerald-400" : selP.score >= 50 ? "text-amber-300" : "text-rose-400"}`}>{selP.score}</span>}
          fields={[
            { label: t.fldItems, value: selP.total },
            { label: t.fldErrors, value: selP.errors },
            { label: t.fldErrorRate, value: `${selP.errorRate}%` },
            { label: t.fldShareOfErrors, value: `${selP.shareOfErrors}%` },
            { label: t.fldScore, value: selP.score },
          ]}
          guideTitle={t.partnerGuideTitle}
          guideSteps={(selP.errorRate >= 5 || selP.score < 80) ? t.partnerGuideBad : t.partnerGuideOk}
        >
          <ExplainData screen="Parceiros EDI & FinOps BTP — parceiro" data={{ parceiro: selP }} />
        </DetailSheet>
      )}

      {selF && (
        <DetailSheet
          open={!!selF}
          onClose={() => setSelF(null)}
          icon="☁️"
          title={selF.artifact}
          subtitle={t.sheetFlowSub}
          badge={<span className="text-sm font-bold text-amber-300">{brl(selF.estMonthlyCents)}</span>}
          fields={[
            { label: t.fldSource, value: selF.source },
            { label: t.fldArtifact, value: selF.artifact },
            { label: t.fldMessages30d, value: selF.messages30d.toLocaleString("pt-BR") },
            { label: t.fldEstMonthly, value: brl(selF.estMonthlyCents) },
          ]}
          guideTitle={t.flowGuideTitle}
          guideSteps={(fin && selF.estMonthlyCents >= (fin.summary.estMonthlyCents / Math.max(fin.flows.length, 1))) ? t.flowGuideExpensive : t.flowGuideOk}
        >
          <ExplainData screen="Parceiros EDI & FinOps BTP — IFlow" data={{ iflow: selF }} />
        </DetailSheet>
      )}
    </div>
  );
}
