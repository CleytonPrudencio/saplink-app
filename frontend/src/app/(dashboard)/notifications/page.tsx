"use client";

import { useEffect, useState } from "react";
import {
  getMe, getChannels, createChannel, deleteChannel, testChannel, setEscalation,
  getTicketConfig, saveTicketConfig, testTicketConfig,
  type NotificationChannel, type TicketConfigView,
} from "@/lib/api";
import DetailSheet from "@/components/DetailSheet";
import ExplainData from "@/components/ExplainData";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

const SHEET_T: Record<Lang, {
  fType: string; fName: string; fTarget: string; fLevel: string; fMinSeverity: string;
  guideTitle: string; testAction: string; removeAction: string; steps: string[];
}> = {
  pt: {
    fType: "Tipo", fName: "Nome", fTarget: "Destino", fLevel: "Nível", fMinSeverity: "Severidade mín.",
    guideTitle: "O que fazer", testAction: "Testar canal", removeAction: "Remover canal",
    steps: [
      "Ajuste a severidade mínima para filtrar o ruído deste canal.",
      "Use nível 1 para resposta imediata e nível 2 para escalonamento.",
      "Confirme o destino com um teste antes de confiar no on-call.",
    ],
  },
  en: {
    fType: "Type", fName: "Name", fTarget: "Target", fLevel: "Level", fMinSeverity: "Min. severity",
    guideTitle: "What to do", testAction: "Test channel", removeAction: "Remove channel",
    steps: [
      "Adjust the minimum severity to filter this channel's noise.",
      "Use level 1 for immediate response and level 2 for escalation.",
      "Confirm the target with a test before relying on it for on-call.",
    ],
  },
  es: {
    fType: "Tipo", fName: "Nombre", fTarget: "Destino", fLevel: "Nivel", fMinSeverity: "Severidad mín.",
    guideTitle: "Qué hacer", testAction: "Probar canal", removeAction: "Eliminar canal",
    steps: [
      "Ajusta la severidad mínima para filtrar el ruido de este canal.",
      "Usa nivel 1 para respuesta inmediata y nivel 2 para escalamiento.",
      "Confirma el destino con una prueba antes de confiar en el on-call.",
    ],
  },
};

export default function NotificationsPage() {
  const { lang } = useLang();
  const t = T[lang];
  const st = SHEET_T[lang];
  const TYPE_LABEL: Record<string, string> = { SLACK: "Slack", TEAMS: "Teams", WEBHOOK: "Webhook", EMAIL: t.emailType };

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
  const [sel, setSel] = useState<NotificationChannel | null>(null);

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
    } catch (err: any) { setChMsg(err?.response?.data?.error || t.createChannelError); }
  }
  async function onTest(id: string) {
    setBusy(id);
    try { const r = await testChannel(id); setChMsg(r.ok ? t.testSent : t.testFailed); }
    finally { setBusy(""); }
  }
  async function onDelete(id: string) {
    if (!confirm(t.removeConfirm)) return;
    await deleteChannel(id); await loadAll();
  }
  async function onSaveEsc() {
    await setEscalation(escMin); setChMsg(t.escalationSaved);
  }

  async function onSaveTicket(e: React.FormEvent) {
    e.preventDefault();
    setTMsg("");
    try { await saveTicketConfig(tform); await loadAll(); setTMsg(t.configSaved); }
    catch (err: any) { setTMsg(err?.response?.data?.error || t.saveError); }
  }
  async function onTestTicket() {
    setBusy("ticket"); setTMsg("");
    try {
      const r = await testTicketConfig();
      setTMsg(r.ok ? t.testTicketCreated(r.key) : (r.reason || t.ticketFailed));
    } finally { setBusy(""); }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  if (!isAdmin) return <div className="text-[#9b95ad]">{t.adminRestricted}</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🔔 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Canais */}
      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] space-y-4">
        <h2 className="text-lg font-semibold">{t.channelsHeading}</h2>
        <div className="space-y-2">
          {channels.map((c) => (
            <div key={c.id} onClick={() => setSel(c)} className="flex items-center justify-between gap-3 bg-[#0f0b1a] rounded-lg px-3 py-2 flex-wrap cursor-pointer hover:bg-white/[0.03] transition-colors">
              <div className="min-w-0">
                <p className="text-sm text-[#e2e0ea]">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/[0.06] mr-2">{TYPE_LABEL[c.type] || c.type}</span>
                  {c.name} <span className="text-[#9b95ad]">{t.channelMeta(c.level, c.minSeverity)}</span>
                </p>
                <p className="text-xs text-[#9b95ad] truncate max-w-md">{c.target}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); onTest(c.id); }} disabled={busy === c.id} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer disabled:opacity-40">{busy === c.id ? "..." : t.test}</button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer">{t.remove}</button>
              </div>
            </div>
          ))}
          {channels.length === 0 && <p className="text-sm text-[#9b95ad]">{t.noChannels}</p>}
        </div>

        <form onSubmit={onAddChannel} className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-white/[0.06]">
          <select value={nc.type} onChange={(e) => setNc({ ...nc, type: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            {Object.keys(TYPE_LABEL).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
          </select>
          <input value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} required placeholder={t.namePlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          <input value={nc.target} onChange={(e) => setNc({ ...nc, target: e.target.value })} required placeholder={nc.type === "EMAIL" ? t.emailPlaceholder : t.webhookPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-2" />
          <select value={nc.minSeverity} onChange={(e) => setNc({ ...nc, minSeverity: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            <option value="MEDIUM">{t.sevMedium}</option>
            <option value="HIGH">{t.sevHigh}</option>
            <option value="CRITICAL">{t.sevCritical}</option>
          </select>
          <select value={nc.level} onChange={(e) => setNc({ ...nc, level: Number(e.target.value) })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            <option value={1}>{t.level1}</option>
            <option value={2}>{t.level2}</option>
          </select>
          <button type="submit" className="sm:col-span-2 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold cursor-pointer">{t.addChannel}</button>
        </form>

        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
          <span className="text-sm text-[#9b95ad]">{t.escalateBefore}</span>
          <input type="number" min={1} max={1440} value={escMin} onChange={(e) => setEscMin(Number(e.target.value))} className="w-20 bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-2 py-1 text-sm" />
          <span className="text-sm text-[#9b95ad]">{t.minLabel}</span>
          <button onClick={onSaveEsc} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer">{t.save}</button>
        </div>
        {chMsg && <p className="text-sm text-emerald-400">{chMsg}</p>}
      </div>

      {/* Tickets */}
      <form onSubmit={onSaveTicket} className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] space-y-3">
        <h2 className="text-lg font-semibold">{t.ticketHeading}</h2>
        <p className="text-sm text-[#9b95ad]">{t.ticketSubtitle} {tc?.hasToken && <span className="text-emerald-400">{t.configured}</span>}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select value={tform.provider} onChange={(e) => setTform({ ...tform, provider: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            <option value="JIRA">Jira</option>
            <option value="SERVICENOW">ServiceNow</option>
          </select>
          <select value={tform.minSeverity} onChange={(e) => setTform({ ...tform, minSeverity: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
            <option value="MEDIUM">{t.openMedium}</option>
            <option value="HIGH">{t.openHigh}</option>
            <option value="CRITICAL">{t.openCritical}</option>
          </select>
          <input value={tform.baseUrl} onChange={(e) => setTform({ ...tform, baseUrl: e.target.value })} required placeholder={t.ticketBaseUrlPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-2" />
          <input value={tform.authUser} onChange={(e) => setTform({ ...tform, authUser: e.target.value })} required placeholder={tform.provider === "JIRA" ? t.jiraUserPlaceholder : t.serviceNowUserPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          <input value={tform.authToken} onChange={(e) => setTform({ ...tform, authToken: e.target.value })} type="password" placeholder={tc?.hasToken ? t.keepTokenPlaceholder : t.tokenPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          {tform.provider === "JIRA" && (
            <input value={tform.projectKey} onChange={(e) => setTform({ ...tform, projectKey: e.target.value })} placeholder={t.projectKeyPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          )}
          <label className="flex items-center gap-2 text-sm text-[#c9c5d6]">
            <input type="checkbox" checked={tform.enabled} onChange={(e) => setTform({ ...tform, enabled: e.target.checked })} /> {t.active}
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold cursor-pointer">{t.save}</button>
          <button type="button" onClick={onTestTicket} disabled={busy === "ticket"} className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-sm font-semibold cursor-pointer disabled:opacity-40">{busy === "ticket" ? t.testing : t.createTestTicket}</button>
        </div>
        {tMsg && <p className="text-sm text-emerald-400">{tMsg}</p>}
      </form>

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon="🔔"
          title={sel.name}
          subtitle={TYPE_LABEL[sel.type] || sel.type}
          fields={[
            { label: st.fType, value: TYPE_LABEL[sel.type] || sel.type },
            { label: st.fName, value: sel.name },
            { label: st.fTarget, value: <span className="font-mono text-xs break-all">{sel.target}</span> },
            { label: st.fLevel, value: sel.level === 2 ? t.level2 : t.level1 },
            { label: st.fMinSeverity, value: sel.minSeverity },
          ]}
          guideTitle={st.guideTitle}
          guideSteps={st.steps}
          actions={
            <>
              <button onClick={() => { onTest(sel.id); }} disabled={busy === sel.id} className="text-sm px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer disabled:opacity-40">{busy === sel.id ? "..." : st.testAction}</button>
              <button onClick={async () => { const id = sel.id; setSel(null); if (confirm(t.removeConfirm)) { await deleteChannel(id); await loadAll(); } }} className="text-sm px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer">{st.removeAction}</button>
            </>
          }
        >
          <ExplainData screen="Alertas, on-call & tickets — item" data={{ type: sel.type, name: sel.name, target: sel.target, level: sel.level, minSeverity: sel.minSeverity, enabled: sel.enabled }} />
        </DetailSheet>
      )}
    </div>
  );
}
