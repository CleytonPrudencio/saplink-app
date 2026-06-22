"use client";

import { useEffect, useState } from "react";
import { getAiConfig, saveAiConfig, testAiProvider, getMe } from "@/lib/api";

const PROVIDERS = [
  { id: "ollama", label: "SAPLINK (IA inclusa)", note: "Ollama local, grátis. Sempre disponível como reserva." },
  { id: "anthropic", label: "Claude (Anthropic)", note: "Cole sua API key do console.anthropic.com." },
  { id: "openai", label: "ChatGPT (OpenAI)", note: "Cole sua API key do platform.openai.com." },
  { id: "azure", label: "Copilot (Azure OpenAI)", note: "Endpoint + deployment + chave do seu recurso Azure OpenAI." },
];

export default function IaConfigPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cfg, setCfg] = useState<any>(null);
  const [form, setForm] = useState<any>({ primary: "ollama", fallback: "", learnFromExternal: false, anthropicKey: "", anthropicModel: "", openaiKey: "", openaiModel: "", azureKey: "", azureEndpoint: "", azureDeployment: "" });
  const [test, setTest] = useState<Record<string, { ok?: boolean; ms?: number; error?: string; loading?: boolean }>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {});
    getAiConfig().then((c) => { setCfg(c); setForm((f: any) => ({ ...f, primary: c.primary, fallback: c.fallback || "", learnFromExternal: c.learnFromExternal, anthropicModel: c.anthropic.model, openaiModel: c.openai.model, azureEndpoint: c.azure.endpoint, azureDeployment: c.azure.deployment })); }).catch(() => {});
  }, []);

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }
  async function runTest(p: string) {
    setTest((t) => ({ ...t, [p]: { loading: true } }));
    const payload: any = { provider: p };
    if (p === "anthropic") { payload.key = form.anthropicKey; payload.model = form.anthropicModel; }
    if (p === "openai") { payload.key = form.openaiKey; payload.model = form.openaiModel; }
    if (p === "azure") { payload.key = form.azureKey; payload.endpoint = form.azureEndpoint; payload.deployment = form.azureDeployment; }
    try { const r = await testAiProvider(payload); setTest((t) => ({ ...t, [p]: r })); } catch { setTest((t) => ({ ...t, [p]: { ok: false, error: "Erro no teste." } })); }
  }
  async function save() {
    setBusy(true); setMsg("");
    try { const c = await saveAiConfig(form); setCfg(c); setMsg("Configuração salva."); setForm((f: any) => ({ ...f, anthropicKey: "", openaiKey: "", azureKey: "" })); }
    catch (e: any) { setMsg(e?.response?.data?.error || "Erro ao salvar."); } finally { setBusy(false); }
  }

  const ord = PROVIDERS.map((p) => ({ value: p.id, label: p.label }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🧠 IA — sua própria inteligência</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Conecte a IA da sua empresa (Claude, ChatGPT, Copilot), defina a ordem de uso e deixe o SAPLINK aprender com ela. A IA inclusa (Ollama) é sempre a reserva.</p>
      </div>

      {!isAdmin && <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5 text-[#9b95ad] text-sm">Apenas o administrador da conta configura a IA.</div>}

      {isAdmin && cfg && (
        <>
          {/* Ordem / plano de IA */}
          <div className="bg-[#1a1527] border border-purple-500/20 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Plano de uso (ordem)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm">Principal
                <select value={form.primary} onChange={(e) => set("primary", e.target.value)} className="mt-1 w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">{ord.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              </label>
              <label className="text-sm">Reserva (fallback)
                <select value={form.fallback} onChange={(e) => set("fallback", e.target.value)} className="mt-1 w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"><option value="">(nenhuma)</option>{ord.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              </label>
            </div>
            <label className="flex items-center gap-2 mt-4 text-sm cursor-pointer">
              <input type="checkbox" checked={form.learnFromExternal} onChange={(e) => set("learnFromExternal", e.target.checked)} className="accent-purple-500" />
              <span className="text-[#e2e0ea]">🎓 Deixar o SAPLINK <b>aprender</b> com a IA externa (as respostas dela ensinam a IA inclusa — fica mais esperta com o tempo).</span>
            </label>
          </div>

          {/* Provedores */}
          <div className="space-y-3">
            {PROVIDERS.filter((p) => p.id !== "ollama").map((p) => {
              const t = test[p.id]; const has = cfg[p.id]?.hasKey;
              return (
                <div key={p.id} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div><h3 className="font-semibold">{p.label} {has && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 ml-1">conectado</span>}</h3><p className="text-xs text-[#9b95ad]">{p.note}</p></div>
                    <button onClick={() => runTest(p.id)} className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25 cursor-pointer">{t?.loading ? "Testando…" : "Testar conexão"}</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {p.id === "anthropic" && <>
                      <input type="password" placeholder={has ? "API key (•••• salva — deixe em branco p/ manter)" : "API key"} value={form.anthropicKey} onChange={(e) => set("anthropicKey", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
                      <input placeholder="modelo (ex.: claude-sonnet-4-20250514)" value={form.anthropicModel} onChange={(e) => set("anthropicModel", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
                    </>}
                    {p.id === "openai" && <>
                      <input type="password" placeholder={has ? "API key (•••• salva)" : "API key"} value={form.openaiKey} onChange={(e) => set("openaiKey", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
                      <input placeholder="modelo (ex.: gpt-4o-mini)" value={form.openaiModel} onChange={(e) => set("openaiModel", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
                    </>}
                    {p.id === "azure" && <>
                      <input type="password" placeholder={has ? "API key (•••• salva)" : "API key"} value={form.azureKey} onChange={(e) => set("azureKey", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
                      <input placeholder="endpoint (https://...openai.azure.com)" value={form.azureEndpoint} onChange={(e) => set("azureEndpoint", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
                      <input placeholder="deployment (nome do modelo no Azure)" value={form.azureDeployment} onChange={(e) => set("azureDeployment", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-2" />
                    </>}
                  </div>
                  {t && !t.loading && <p className={`text-xs mt-2 ${t.ok ? "text-emerald-400" : "text-rose-400"}`}>{t.ok ? `✓ Conexão OK (${t.ms}ms)` : `✗ ${t.error}`}</p>}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={save} disabled={busy} className="px-5 py-2.5 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer">{busy ? "Salvando…" : "Salvar configuração"}</button>
            {msg && <span className="text-sm text-emerald-400">{msg}</span>}
          </div>
          <p className="text-xs text-[#6b6580]">As chaves são cifradas em repouso e usadas só para as chamadas de IA do seu tenant. Cada cliente usa a própria IA e arca com o próprio custo de uso.</p>
        </>
      )}
    </div>
  );
}
