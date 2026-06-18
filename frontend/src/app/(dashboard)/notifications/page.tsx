"use client";

import { useEffect, useState } from "react";
import {
  getMe, getChannels, createChannel, deleteChannel, testChannel, setEscalation,
  getTicketConfig, saveTicketConfig, testTicketConfig,
  type NotificationChannel, type TicketConfigView,
} from "@/lib/api";

const TYPE_LABEL: Record<string, string> = { SLACK: "Slack", TEAMS: "Teams", WEBHOOK: "Webhook", EMAIL: "E-mail" };

export default function NotificationsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [escMin, setEscMin] = useState(30);
  const [nc, setNc] = useState({ type: "SLACK", name: "", target: "", minSeverity: "MEDIUM", level: 1 });
  const [chMsg, setChMsg] = useState("");

  const [tc, setTc] = useState<TicketConfigView | null>(null);
  const [tform, setTform] = useState({ provider: "JIRA", baseUrl: "", authUser: "", authToken: "", projectKey: "", minSeverity: "HIGH", enabled: true });
  const [tMsg, setTMsg] = useState("");
  const [busy, setBusy] = useState("");

  async function loadAll() {
    const c = await getChannels();
    setChannels(c.channels); setEscMin(c.escalateAfterMin);
    const t = await getTicketConfig();
    setTc(t.config);
    if (t.config) setTform((f) => ({ ...f, provider: t.config!.provider, baseUrl: t.config!.baseUrl, authUser: t.config!.authUser, projectKey: t.config!.projectKey || "", minSeverity: t.config!.minSeverity, enabled: t.config!.enabled, authToken: "" }));
  }

  useEffect(() => {
    getMe().then((u) => {
      const admin = u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN";
      setIsAdmin(admin);
      if (admin) loadAll().catch(() => {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function onAddChannel(e: React.FormEvent) {
    e.preventDefault();
    setChMsg("");
    try {
      await createChannel(nc);
      setNc({ type: "SLACK", name: "", target: "", minSeverity: "MEDIUM", level: 1 });
      await loadAll();
    } catch (err: any) { setChMsg(err?.response?.data?.error || "Erro ao criar canal."); }
  }
  async function onTest(id: string) {
    setBusy(id);
    try { const r = await testChannel(id); setChMsg(r.ok ? "Teste enviado com sucesso." : "Falha no envio (verifique a URL/destino)."); }
    finally { setBusy(""); }
  }
  async function onDelete(id: string) {
    if (!confirm("Remover este canal?")) return;
    await deleteChannel(id); await loadAll();
  }
  async function onSaveEsc() {
    await setEscalation(escMin); setChMsg("Tempo de escalonamento salvo.");
  }

  async function onSaveTicket(e: React.FormEvent) {
    e.preventDefault();
    setTMsg("");
    try { await saveTicketConfig(tform); await loadAll(); setTMsg("Configuração salva."); }
    catch (err: any) { setTMsg(err?.response?.data?.error || "Erro ao salvar."); }
  }
  async function onTestTicket() {
    setBusy("ticket"); setTMsg("");
    try {
      const r = await testTicketConfig();
      setTMsg(r.ok ? `Chamado de teste criado: ${r.key}` : (r.reason || "Falha ao criar chamado."));
    } finally { setBusy(""); }
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  if (!isAdmin) return <div className="text-[#9b95ad]">Acesso restrito ao administrador.</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🔔 Alertas, on-call & tickets</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Para onde os alertas vão, quando escalam e como viram chamado.</p>
      </div>

      {/* Canais */}
      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] space-y-4">
        <h2 className="text-lg font-semibold">Canais de notificação</h2>
        <div className="space-y-2">
          {channels.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 bg-[#0f0b1a] rounded-lg px-3 py-2 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm text-[#e2e0ea]">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/[0.06] mr-2">{TYPE_LABEL[c.type] || c.type}</span>
                  {c.name} <span className="text-[#9b95ad]">· nível {c.level} · ≥ {c.minSeverity}</span>
                </p>
                <p className="text-xs text-[#9b95ad] truncate max-w-md">{c.target}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onTest(c.id)} disabled={busy === c.id} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer disabled:opacity-40">{busy === c.id ? "..." : "Testar"}</button>
                <button onClick={() => onDelete(c.id)} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer">Remover</button>
              </div>
            </div>
          ))}
          {channels.length === 0 && <p className="text-sm text-[#9b95ad]">Nenhum canal ainda.</p>}
        </div>

        <form onSubmit={onAddChannel} className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-white/[0.06]">
          <select value={nc.type} onChange={(e) => setNc({ ...nc, type: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            {Object.keys(TYPE_LABEL).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
          <input value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} required placeholder="Nome (ex.: #plantão-sap)" className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          <input value={nc.target} onChange={(e) => setNc({ ...nc, target: e.target.value })} required placeholder={nc.type === "EMAIL" ? "email@empresa.com" : "https://hooks.slack.com/..."} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-2" />
          <select value={nc.minSeverity} onChange={(e) => setNc({ ...nc, minSeverity: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            <option value="MEDIUM">Severidade ≥ Média</option>
            <option value="HIGH">Severidade ≥ Alta</option>
            <option value="CRITICAL">Só Crítica</option>
          </select>
          <select value={nc.level} onChange={(e) => setNc({ ...nc, level: Number(e.target.value) })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            <option value={1}>Nível 1 (imediato)</option>
            <option value={2}>Nível 2 (escalonamento)</option>
          </select>
          <button type="submit" className="sm:col-span-2 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold cursor-pointer">Adicionar canal</button>
        </form>

        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
          <span className="text-sm text-[#9b95ad]">Escalar para o nível 2 após</span>
          <input type="number" min={1} max={1440} value={escMin} onChange={(e) => setEscMin(Number(e.target.value))} className="w-20 bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-2 py-1 text-sm" />
          <span className="text-sm text-[#9b95ad]">min</span>
          <button onClick={onSaveEsc} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer">Salvar</button>
        </div>
        {chMsg && <p className="text-sm text-emerald-400">{chMsg}</p>}
      </div>

      {/* Tickets */}
      <form onSubmit={onSaveTicket} className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] space-y-3">
        <h2 className="text-lg font-semibold">Ticket sync (Jira / ServiceNow)</h2>
        <p className="text-sm text-[#9b95ad]">Alertas viram chamado automaticamente e fecham ao resolver. {tc?.hasToken && <span className="text-emerald-400">Configurado.</span>}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select value={tform.provider} onChange={(e) => setTform({ ...tform, provider: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            <option value="JIRA">Jira</option>
            <option value="SERVICENOW">ServiceNow</option>
          </select>
          <select value={tform.minSeverity} onChange={(e) => setTform({ ...tform, minSeverity: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            <option value="MEDIUM">Abrir p/ ≥ Média</option>
            <option value="HIGH">Abrir p/ ≥ Alta</option>
            <option value="CRITICAL">Abrir só Crítica</option>
          </select>
          <input value={tform.baseUrl} onChange={(e) => setTform({ ...tform, baseUrl: e.target.value })} required placeholder="https://empresa.atlassian.net" className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-2" />
          <input value={tform.authUser} onChange={(e) => setTform({ ...tform, authUser: e.target.value })} required placeholder={tform.provider === "JIRA" ? "email do Jira" : "usuário ServiceNow"} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          <input value={tform.authToken} onChange={(e) => setTform({ ...tform, authToken: e.target.value })} type="password" placeholder={tc?.hasToken ? "•••• (manter atual)" : "API token / senha"} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          {tform.provider === "JIRA" && (
            <input value={tform.projectKey} onChange={(e) => setTform({ ...tform, projectKey: e.target.value })} placeholder="Project key (ex.: SAP)" className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          )}
          <label className="flex items-center gap-2 text-sm text-[#c9c5d6]">
            <input type="checkbox" checked={tform.enabled} onChange={(e) => setTform({ ...tform, enabled: e.target.checked })} /> Ativo
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold cursor-pointer">Salvar</button>
          <button type="button" onClick={onTestTicket} disabled={busy === "ticket"} className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-sm font-semibold cursor-pointer disabled:opacity-40">{busy === "ticket" ? "Testando..." : "Criar chamado de teste"}</button>
        </div>
        {tMsg && <p className="text-sm text-emerald-400">{tMsg}</p>}
      </form>
    </div>
  );
}
