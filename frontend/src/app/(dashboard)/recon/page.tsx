"use client";

import { useEffect, useState, useCallback } from "react";
import { getReconProcesses, saveReconProcess, deleteReconProcess, reconcile, getMe, getClients } from "@/lib/api";

export default function ReconPage() {
  const [procs, setProcs] = useState<any[]>([]);
  const [sel, setSel] = useState<string>("");
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
    catch (e: any) { setMsg(e?.response?.data?.error || "Erro ao salvar."); }
  }
  function setStage(i: number, k: string, v: string) { setForm((f) => ({ ...f, stages: f.stages.map((s, j) => j === i ? { ...s, [k]: v } : s) })); }

  const maxOk = Math.max(1, ...(result?.stages || []).map((s: any) => s.total));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">🔁 Reconciliação ponta-a-ponta</h1>
          <p className="text-[#9b95ad] text-sm mt-1">&quot;Entregue&quot; não é &quot;virou negócio&quot;. Rastreia o documento pela jornada e mostra onde o volume se perde no caminho.</p>
        </div>
        {isAdmin && <button onClick={() => setShowForm((v) => !v)} className="text-sm px-3 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 cursor-pointer">{showForm ? "Cancelar" : "+ Novo processo"}</button>}
      </div>

      {showForm && isAdmin && (
        <div className="bg-[#1a1527] border border-purple-500/20 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
              <option value="">Cliente...</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do processo (ex.: Pedido → Faturamento)" className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          </div>
          <p className="text-xs text-[#9b95ad]">Estágios na ordem esperada (label + fonte + artefato/IFlow):</p>
          {form.stages.map((s, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input value={s.label} onChange={(e) => setStage(i, "label", e.target.value)} placeholder={`Estágio ${i + 1} (ex.: Pedido)`} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
              <select value={s.source} onChange={(e) => setStage(i, "source", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"><option>CPI</option><option>AIF</option></select>
              <input value={s.artifact} onChange={(e) => setStage(i, "artifact", e.target.value)} placeholder="Artefato/IFlow exato" className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setForm((f) => ({ ...f, stages: [...f.stages, { label: "", source: "CPI", artifact: "" }] }))} className="text-xs px-2 py-1 rounded bg-white/[0.06] text-[#9b95ad] cursor-pointer">+ estágio</button>
            <button onClick={save} className="text-sm px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold cursor-pointer ml-auto">Salvar</button>
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
          {procs.length === 0 ? "Nenhum processo definido ainda. Crie um para mapear a jornada (ex.: Pedido CPI → Ordem → Fatura)." : "Selecione um processo."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <Stat label="Conclusão ponta-a-ponta" value={`${result.completion}%`} accent={result.completion >= 95 ? "text-emerald-400" : "text-amber-300"} />
            <Stat label="Maior perda" value={result.biggestGap ? `${result.biggestGap.lost}` : "0"} accent={result.biggestGap?.lost ? "text-rose-400" : "text-emerald-300"} />
          </div>

          {/* Funil */}
          <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold">{result.process} <span className="text-xs text-[#9b95ad]">· últimas {result.windowHours}h</span></h2>
            {result.stages.map((s: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#e2e0ea]">{s.label || s.artifact} <span className="text-xs text-[#9b95ad]">({s.source} · {s.artifact})</span></span>
                  <span className="text-[#9b95ad]"><b className="text-emerald-300">{s.ok}</b> ok{s.failed ? <> · <b className="text-rose-300">{s.failed}</b> falha</> : null}</span>
                </div>
                <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${(s.total / maxOk) * 100}%` }} /></div>
                {result.links[i] && (
                  <div className="text-[11px] text-center my-1 text-[#9b95ad]">↓ {result.links[i].rate}% avançou{result.links[i].lost ? <span className="text-rose-300"> · {result.links[i].lost} perdido(s) aqui</span> : null}</div>
                )}
              </div>
            ))}
          </div>
          {result.biggestGap?.lost > 0 && (
            <div className="bg-rose-500/[0.07] border border-rose-500/20 rounded-xl p-4 text-sm text-rose-200">
              ⚠️ Maior vazamento entre <b>{result.biggestGap.from}</b> → <b>{result.biggestGap.to}</b>: {result.biggestGap.lost} documento(s) não avançaram. Investigue esse trecho primeiro.
            </div>
          )}
        </>
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
