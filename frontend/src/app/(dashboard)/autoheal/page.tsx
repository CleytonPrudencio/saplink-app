"use client";

import { useEffect, useState } from "react";
import { getAutoheal, saveAutohealPolicy, getMe } from "@/lib/api";

const ACTIONS = [
  { key: "REPROCESS_IDOC", label: "Reprocessar IDoc (BD87)" },
  { key: "RETRY_TRFC", label: "Reexecutar tRFC (SM58)" },
  { key: "UNLOCK_QUEUE", label: "Destravar fila qRFC (SMQ2)" },
  { key: "REACTIVATE_RFC", label: "Reativar destino RFC (SM59)" },
];

export default function AutohealPage() {
  const [data, setData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [policy, setPolicy] = useState<{ enabled: boolean; minConfidence: number; allowedActions: string[] }>({ enabled: false, minConfidence: 85, allowedActions: [] });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() { const d = await getAutoheal(); setData(d); setPolicy(d.policy); }
  useEffect(() => {
    load().catch(() => {});
    getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {});
  }, []);

  async function save() {
    setBusy(true); setMsg("");
    try { await saveAutohealPolicy(policy); setMsg("Política salva."); await load(); }
    catch { setMsg("Erro ao salvar."); } finally { setBusy(false); }
  }
  function toggleAction(k: string) {
    setPolicy((p) => ({ ...p, allowedActions: p.allowedActions.includes(k) ? p.allowedActions.filter((a) => a !== k) : [...p.allowedActions, k] }));
  }

  const sb = data?.scoreboard;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🤖 AMS Autônomo</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Detecta → diagnostica → corrige → mede → aprende. A confiança vem da Rede Federada; acima do limiar, a correção é aplicada sozinha (com rastro e rollback no agente).</p>
        <p className="text-xs text-amber-300/90 mt-2 inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1">🔒 Trava de produção: em integrações <b className="mx-1">PRD</b> o AMS <b className="mx-1">não executa sozinho</b> — gera sugestão pendente de aprovação. DEV/HML seguem automáticos.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="% resolvido sem humano" value={`${sb?.autonomyRate ?? 0}%`} accent="text-emerald-400" />
        <Stat label="MTTR médio" value={`${sb?.mttrMin ?? 0}min`} accent="text-cyan-300" />
        <Stat label="Auto-corrigidas" value={sb?.autoResolved ?? 0} accent="text-purple-300" />
        <Stat label="Aguardando aprovação" value={sb?.pending ?? 0} accent={(sb?.pending ?? 0) ? "text-amber-300" : "text-[#e2e0ea]"} />
      </div>

      <div className={`rounded-xl p-5 border ${policy.enabled ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-white/[0.08] bg-[#1a1527]"}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-semibold">Piloto automático {policy.enabled ? <span className="text-emerald-400">LIGADO</span> : <span className="text-[#9b95ad]">desligado</span>}</h2>
            <p className="text-xs text-[#9b95ad]">Quando ligado, correções com confiança ≥ limiar são aplicadas automaticamente.</p>
          </div>
          {isAdmin && (
            <button onClick={() => setPolicy((p) => ({ ...p, enabled: !p.enabled }))} className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${policy.enabled ? "bg-rose-500/20 text-rose-200" : "bg-emerald-500 text-white"}`}>
              {policy.enabled ? "Desligar" : "Ligar piloto automático"}
            </button>
          )}
        </div>

        {isAdmin && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-[#e2e0ea]">Confiança mínima para auto-executar: <b className="text-cyan-300">{policy.minConfidence}%</b></label>
              <input type="range" min={50} max={100} value={policy.minConfidence} onChange={(e) => setPolicy((p) => ({ ...p, minConfidence: Number(e.target.value) }))} className="w-full mt-2 accent-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-[#e2e0ea] mb-2">Ações permitidas para auto-correção:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ACTIONS.map((a) => (
                  <label key={a.key} className="flex items-center gap-2 bg-[#0f0b1a] rounded-lg px-3 py-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={policy.allowedActions.includes(a.key)} onChange={() => toggleAction(a.key)} className="accent-emerald-500" />
                    <span className="text-[#e2e0ea]">{a.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={save} disabled={busy} className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer">{busy ? "Salvando..." : "Salvar política"}</button>
            {msg && <span className="text-sm text-emerald-400 ml-3">{msg}</span>}
          </div>
        )}
      </div>

      <p className="text-xs text-[#6b6580]">Guardrails: só auto-executa ações da lista permitida, acima do limiar de confiança, e sempre deixa rastro (quem/quando/antes/depois). Correções de baixa confiança continuam exigindo aprovação humana.</p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[11px] text-[#9b95ad] mt-1">{label}</div>
    </div>
  );
}
