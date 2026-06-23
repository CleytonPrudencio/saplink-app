"use client";

import { useEffect, useState, useCallback } from "react";
import { getReconProcesses, saveReconProcess, deleteReconProcess, reconcile, getMe, getClients } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

const SHEET_T: Record<Lang, {
  stage: string; source: string; artifact: string; ok: string; failed: string; total: string;
  advanced: string; lostToNext: string; guideTitle: string;
  guideStepsGap: (lost: number, to: string) => string[]; guideStepsOk: string[];
}> = {
  pt: {
    stage: "Estágio", source: "Origem", artifact: "Artefato/IFlow", ok: "OK", failed: "Falhas", total: "Total",
    advanced: "Avançou p/ o próximo", lostToNext: "Perdido até o próximo", guideTitle: "O que fazer",
    guideStepsGap: (lost, to) => [`Investigue este trecho: ${lost} documento(s) não avançaram para "${to}".`, "Compare os artefatos de entrada e saída para achar onde o volume some.", "Verifique filtros, erros de mapeamento ou rejeições no estágio seguinte."],
    guideStepsOk: ["Este estágio não apresenta vazamento relevante.", "Use-o como referência de fluxo saudável ao comparar com os demais."],
  },
  en: {
    stage: "Stage", source: "Source", artifact: "Artifact/IFlow", ok: "OK", failed: "Failed", total: "Total",
    advanced: "Advanced to next", lostToNext: "Lost to next", guideTitle: "What to do",
    guideStepsGap: (lost, to) => [`Investigate this segment: ${lost} document(s) did not advance to "${to}".`, "Compare input and output artifacts to find where volume disappears.", "Check filters, mapping errors or rejections in the next stage."],
    guideStepsOk: ["This stage shows no relevant leak.", "Use it as a healthy-flow reference when comparing the others."],
  },
  es: {
    stage: "Etapa", source: "Origen", artifact: "Artefacto/IFlow", ok: "OK", failed: "Fallas", total: "Total",
    advanced: "Avanzó a la siguiente", lostToNext: "Perdido hasta la siguiente", guideTitle: "Qué hacer",
    guideStepsGap: (lost, to) => [`Investigue este tramo: ${lost} documento(s) no avanzaron a "${to}".`, "Compare los artefactos de entrada y salida para hallar dónde se pierde el volumen.", "Revise filtros, errores de mapeo o rechazos en la etapa siguiente."],
    guideStepsOk: ["Esta etapa no presenta fuga relevante.", "Úsela como referencia de flujo sano al comparar con las demás."],
  },
};

export default function ReconPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [procs, setProcs] = useState<any[]>([]);
  const [sel, setSel] = useState<string>("");
  const [stageSel, setStageSel] = useState<any>(null);
  const st = SHEET_T[lang];
  const [result, setResult] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: "", name: "", stages: [{ label: "", source: "CPI", artifact: "" }, { label: "", source: "CPI", artifact: "" }] });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const r = await getReconProcesses(); setProcs(r.processes);
    if (r.processes[0] && !sel) setSel(r.processes[0].id);
  }, [sel]);

  useEffect(() => { load().catch(() => {}); getMe().then((u) => { const a = u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN"; setIsAdmin(a); if (a) getClients().then((cs: any[]) => setClients(cs.map((c) => ({ id: c.id, name: c.name })))).catch(() => {}); }).catch(() => {}); }, [load]);
  useEffect(() => { if (sel) reconcile(sel).then(setResult).catch(() => setResult(null)); }, [sel]);

  async function save() {
    setMsg("");
    try { await saveReconProcess(form); setShowForm(false); setForm({ clientId: "", name: "", stages: [{ label: "", source: "CPI", artifact: "" }, { label: "", source: "CPI", artifact: "" }] }); await load(); }
    catch (e: any) { setMsg(e?.response?.data?.error || t.saveError); }
  }
  function setStage(i: number, k: string, v: string) { setForm((f) => ({ ...f, stages: f.stages.map((s, j) => j === i ? { ...s, [k]: v } : s) })); }

  const maxOk = Math.max(1, ...(result?.stages || []).map((s: any) => s.total));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">🔁 {t.title}</h1>
          <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        </div>
        {isAdmin && <button onClick={() => setShowForm((v) => !v)} className="text-sm px-3 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 cursor-pointer">{showForm ? t.cancel : t.newProcess}</button>}
      </div>

      {showForm && isAdmin && (
        <div className="bg-[#1a1527] border border-purple-500/20 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
              <option value="">{t.clientPlaceholder}</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.processNamePlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          </div>
          <p className="text-xs text-[#9b95ad]">{t.stagesHint}</p>
          {form.stages.map((s, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input value={s.label} onChange={(e) => setStage(i, "label", e.target.value)} placeholder={t.stagePlaceholder(i + 1)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
              <select value={s.source} onChange={(e) => setStage(i, "source", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"><option>CPI</option><option>AIF</option></select>
              <input value={s.artifact} onChange={(e) => setStage(i, "artifact", e.target.value)} placeholder={t.artifactPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setForm((f) => ({ ...f, stages: [...f.stages, { label: "", source: "CPI", artifact: "" }] }))} className="text-xs px-2 py-1 rounded bg-white/[0.06] text-[#9b95ad] cursor-pointer">{t.addStage}</button>
            <button onClick={save} className="text-sm px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold cursor-pointer ml-auto">{t.save}</button>
          </div>
          {msg && <p className="text-sm text-rose-300">{msg}</p>}
        </div>
      )}

      {procs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {procs.map((p) => <button key={p.id} onClick={() => setSel(p.id)} className={`text-sm px-3 py-1.5 rounded-lg cursor-pointer ${sel === p.id ? "bg-purple-500/20 text-purple-300" : "bg-[#1a1527] text-[#9b95ad] border border-white/[0.08]"}`}>{p.name} <span className="text-xs">· {p.client}</span></button>)}
        </div>
      )}

      {!result ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          {procs.length === 0 ? t.emptyNoProcess : t.selectProcess}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <Stat label={t.statCompletion} value={`${result.completion}%`} accent={result.completion >= 95 ? "text-emerald-400" : "text-amber-300"} />
            <Stat label={t.statBiggestLoss} value={result.biggestGap ? `${result.biggestGap.lost}` : "0"} accent={result.biggestGap?.lost ? "text-rose-400" : "text-emerald-300"} />
          </div>

          {/* Funil */}
          <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold">{result.process} <span className="text-xs text-[#9b95ad]">· {t.lastHours(result.windowHours)}</span></h2>
            {result.stages.map((s: any, i: number) => (
              <div key={i} onClick={() => setStageSel({ ...s, _link: result.links[i] || null, _idx: i })} className="cursor-pointer hover:bg-white/[0.03] transition-colors rounded-lg -mx-2 px-2 py-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#e2e0ea]">{s.label || s.artifact} <span className="text-xs text-[#9b95ad]">({s.source} · {s.artifact})</span></span>
                  <span className="text-[#9b95ad]"><b className="text-emerald-300">{s.ok}</b> {t.okSuffix}{s.failed ? <> · <b className="text-rose-300">{s.failed}</b> {t.failSuffix}</> : null}</span>
                </div>
                <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${(s.total / maxOk) * 100}%` }} /></div>
                {result.links[i] && (
                  <div className="text-[11px] text-center my-1 text-[#9b95ad]">↓ {t.advanced(result.links[i].rate)}{result.links[i].lost ? <span className="text-rose-300"> · {t.lostHere(result.links[i].lost)}</span> : null}</div>
                )}
              </div>
            ))}
          </div>
          {result.biggestGap?.lost > 0 && (
            <div className="bg-rose-500/[0.07] border border-rose-500/20 rounded-xl p-4 text-sm text-rose-200">
              ⚠️ {t.gapBefore} <b>{result.biggestGap.from}</b> → <b>{result.biggestGap.to}</b>: {t.gapDocs(result.biggestGap.lost)} {t.gapAfter}
            </div>
          )}
        </>
      )}

      {stageSel && (
        <DetailSheet
          open={!!stageSel}
          onClose={() => setStageSel(null)}
          icon="🔁"
          title={stageSel.label || stageSel.artifact}
          subtitle={`${stageSel.source} · ${stageSel.artifact}`}
          fields={[
            { label: st.stage, value: stageSel.label || stageSel.artifact },
            { label: st.source, value: <span className="font-mono">{stageSel.source}</span> },
            { label: st.artifact, value: <span className="font-mono break-all">{stageSel.artifact}</span> },
            { label: st.ok, value: <b className="text-emerald-300">{stageSel.ok}</b> },
            { label: st.failed, value: stageSel.failed ? <b className="text-rose-300">{stageSel.failed}</b> : 0 },
            { label: st.total, value: stageSel.total },
            { label: st.advanced, value: stageSel._link ? `${stageSel._link.rate}%` : undefined },
            { label: st.lostToNext, value: stageSel._link?.lost ? <b className="text-rose-300">{stageSel._link.lost}</b> : undefined },
          ]}
          guideTitle={st.guideTitle}
          guideSteps={stageSel._link?.lost ? st.guideStepsGap(stageSel._link.lost, result.stages[stageSel._idx + 1]?.label || result.stages[stageSel._idx + 1]?.artifact || "—") : st.guideStepsOk}
        >
          <ExplainData screen="Reconciliação E2E — item" data={{ process: result.process, stage: stageSel.label || stageSel.artifact, source: stageSel.source, artifact: stageSel.artifact, ok: stageSel.ok, failed: stageSel.failed, total: stageSel.total, link: stageSel._link }} />
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
