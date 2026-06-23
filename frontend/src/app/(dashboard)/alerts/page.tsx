"use client";

import { useEffect, useState } from "react";
import { getAlerts, resolveAlert, resolveAlertGroup, diagnoseAlert } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { AiReport } from "@/components/AiReport";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

const SHEET_T: Record<Lang, {
  occurrences: string; severity: string; type: string; message: string; client: string;
  integration: string; first: string; last: string; status: string; active: string; resolved: string;
  guideTitle: string; guideSteps: string[]; guideTx: string;
}> = {
  pt: {
    occurrences: "Ocorrências", severity: "Severidade", type: "Tipo", message: "Mensagem", client: "Cliente",
    integration: "Integração", first: "Primeira", last: "Última", status: "Status", active: "Ativo", resolved: "Resolvido",
    guideTitle: "O que fazer",
    guideSteps: [
      "Investigue a integração afetada e a causa na origem (SAP/agente).",
      "Trate a causa raiz antes de fechar o alerta.",
      "Resolva o alerta aqui só depois de confirmar a correção.",
      "Se persistir, um novo alerta é criado no próximo ciclo.",
    ],
    guideTx: "SM21 · SLG1 (logs)",
  },
  en: {
    occurrences: "Occurrences", severity: "Severity", type: "Type", message: "Message", client: "Client",
    integration: "Integration", first: "First", last: "Last", status: "Status", active: "Active", resolved: "Resolved",
    guideTitle: "What to do",
    guideSteps: [
      "Investigate the affected integration and the source cause (SAP/agent).",
      "Handle the root cause before closing the alert.",
      "Resolve the alert here only after confirming the fix.",
      "If it persists, a new alert is created on the next cycle.",
    ],
    guideTx: "SM21 · SLG1 (logs)",
  },
  es: {
    occurrences: "Ocurrencias", severity: "Severidad", type: "Tipo", message: "Mensaje", client: "Cliente",
    integration: "Integración", first: "Primera", last: "Última", status: "Status", active: "Activo", resolved: "Resuelto",
    guideTitle: "Qué hacer",
    guideSteps: [
      "Investiga la integración afectada y la causa en el origen (SAP/agente).",
      "Trata la causa raíz antes de cerrar la alerta.",
      "Resuelve la alerta aquí solo tras confirmar la corrección.",
      "Si persiste, se crea una nueva alerta en el próximo ciclo.",
    ],
    guideTx: "SM21 · SLG1 (logs)",
  },
};

interface Alert {
  id: string; severity: string; type: string; message: string; resolved: boolean;
  createdAt: string; client?: { id: string; name: string }; integration?: { id: string; name: string; type: string };
}
interface Group {
  key: string; severity: string; type: string; message: string; count: number;
  first: string; last: string; ids: string[]; client?: string; integrationId?: string | null; integrationName?: string;
}

const SEV_RANK: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
function sevBadge(s: string) {
  const c: Record<string, string> = { CRITICAL: "bg-rose-500/20 text-rose-400", HIGH: "bg-orange-500/20 text-orange-400", MEDIUM: "bg-amber-500/20 text-amber-400", LOW: "bg-blue-500/20 text-blue-400" };
  return c[s?.toUpperCase()] || "bg-gray-500/20 text-gray-400";
}

export default function AlertsPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [diag, setDiag] = useState<Record<string, { loading: boolean; text?: string }>>({});
  const [confirm, setConfirm] = useState<Group | null>(null);
  const [sel, setSel] = useState<Group | null>(null);
  const { notify } = useToast();
  const st = SHEET_T[lang];

  useEffect(() => { load(); }, []);
  async function load() {
    try { const data = await getAlerts(); setAlerts(Array.isArray(data) ? data : data.data || []); }
    catch { notify(t.loadError, "error"); } finally { setLoading(false); }
  }

  // Agrupa por integração+tipo+mensagem (colapsa a enxurrada)
  const visible = alerts.filter((a) => {
    if (severityFilter !== "ALL" && a.severity?.toUpperCase() !== severityFilter) return false;
    if (statusFilter === "ACTIVE" && a.resolved) return false;
    if (statusFilter === "RESOLVED" && !a.resolved) return false;
    return true;
  });
  const groupsMap = new Map<string, Group>();
  for (const a of visible) {
    const key = `${a.integration?.id || a.message}|${a.type}`;
    const g = groupsMap.get(key);
    if (!g) groupsMap.set(key, { key, severity: a.severity, type: a.type, message: a.message, count: 1, first: a.createdAt, last: a.createdAt, ids: [a.id], client: a.client?.name, integrationId: a.integration?.id, integrationName: a.integration?.name });
    else { g.count++; g.ids.push(a.id); if (a.createdAt < g.first) g.first = a.createdAt; if (a.createdAt > g.last) g.last = a.createdAt; if ((SEV_RANK[a.severity] || 0) > (SEV_RANK[g.severity] || 0)) g.severity = a.severity; }
  }
  const groups = Array.from(groupsMap.values()).sort((a, b) => (SEV_RANK[b.severity] || 0) - (SEV_RANK[a.severity] || 0) || b.last.localeCompare(a.last));

  async function runDiagnose(g: Group) {
    const id = g.ids[0];
    setDiag((d) => ({ ...d, [g.key]: { loading: true } }));
    try { const r = await diagnoseAlert(id); setDiag((d) => ({ ...d, [g.key]: { loading: false, text: r.text } })); }
    catch { setDiag((d) => ({ ...d, [g.key]: { loading: false, text: t.diagnoseFallback } })); }
  }
  async function doResolve(g: Group) {
    setConfirm(null);
    try {
      if (g.count > 1) { const r = await resolveAlertGroup({ integrationId: g.integrationId, type: g.type, message: g.integrationId ? undefined : g.message }); notify(t.resolvedCount(r.resolved), "success"); }
      else { await resolveAlert(g.ids[0]); notify(t.resolvedOne, "success"); }
      await load();
    } catch { notify(t.resolveError, "error"); }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  const openCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <ExplainData screen="Alertas" data={{ abertos: openCount, grupos: groups.slice(0, 12).map((g) => ({ severidade: g.severity, tipo: g.type, mensagem: g.message, ocorrencias: g.count, cliente: g.client, integracao: g.integrationName })) }} label={t.explainLabel} />
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="px-4 py-2 bg-[#1a1527] border border-white/[0.08] rounded-lg text-sm">
          <option value="ALL">{t.allSeverities}</option><option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
        </select>
        <div className="flex bg-[#1a1527] rounded-lg p-1 border border-white/[0.08]">
          {[{ key: "ACTIVE", label: t.statusActive }, { key: "RESOLVED", label: t.statusResolved }, { key: "ALL", label: t.statusAll }].map((o) => (
            <button key={o.key} onClick={() => setStatusFilter(o.key)} className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer ${statusFilter === o.key ? "bg-purple-500/20 text-purple-400" : "text-[#9b95ad] hover:text-white"}`}>{o.label}</button>
          ))}
        </div>
        <span className="text-sm text-[#9b95ad] self-center">{t.groupsCount(groups.length, visible.length)}</span>
      </div>

      <div className="space-y-3">
        {groups.map((g) => {
          const d = diag[g.key];
          return (
            <div key={g.key} className="bg-[#1a1527] rounded-xl border border-white/[0.08] overflow-hidden">
              <div onClick={() => setSel(g)} className="p-4 flex items-start gap-4 flex-wrap cursor-pointer hover:bg-white/[0.03] transition-colors">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase shrink-0 ${sevBadge(g.severity)}`}>{g.severity}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e2e0ea]">{g.message}{g.count > 1 && <span className="ml-2 text-xs font-bold text-rose-300">×{g.count}</span>}</p>
                  <p className="text-xs text-[#9b95ad] mt-1">
                    <span className="font-mono px-1.5 py-0.5 rounded bg-white/[0.06] mr-1">{g.type}</span>
                    {g.client ? `${g.client} · ` : ""}{g.integrationName || ""}
                  </p>
                  <p className="text-xs text-[#6b6580] mt-1">
                    {g.count > 1 ? t.firstLast(new Date(g.first).toLocaleString("pt-BR"), new Date(g.last).toLocaleString("pt-BR")) : new Date(g.last).toLocaleString("pt-BR")}
                  </p>
                </div>
                {statusFilter !== "RESOLVED" && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); d ? setDiag((x) => { const c = { ...x }; delete c[g.key]; return c; }) : runDiagnose(g); }} className="px-3 py-1.5 text-xs font-medium bg-violet-500/15 text-violet-300 rounded-lg hover:bg-violet-500/25 cursor-pointer">{d ? t.hide : t.diagnose}</button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirm(g); }} className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 cursor-pointer">{t.resolve}{g.count > 1 ? ` (${g.count})` : ""}</button>
                  </div>
                )}
              </div>
              {d && (
                <div className="px-4 pb-4">
                  {d.loading ? <div className="text-sm text-violet-300">{t.analyzing}</div> : <AiReport text={d.text || ""} title={t.diagReportTitle} subtitle={g.message} onRefresh={() => runDiagnose(g)} refreshing={d.loading} />}
                </div>
              )}
            </div>
          );
        })}
        {groups.length === 0 && <p className="text-[#9b95ad] text-sm">{t.noAlerts(statusFilter === "ACTIVE")}</p>}
      </div>

      {/* Confirmação de resolução */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-[#1a1527] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">{t.confirmTitle(confirm.count)}</h3>
            <p className="text-sm text-[#9b95ad] mb-1">{confirm.message}</p>
            <p className="text-xs text-[#6b6580] mb-4">
              {t.confirmHint}
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirm(null)} className="px-4 py-2 rounded-lg text-sm bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.12] cursor-pointer">{t.cancel}</button>
              <button onClick={() => doResolve(confirm)} className="px-4 py-2 rounded-lg text-sm bg-emerald-500 text-white font-semibold cursor-pointer">{t.confirm}</button>
            </div>
          </div>
        </div>
      )}

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon="🔔"
          title={sel.message}
          subtitle={`${sel.type}${sel.integrationName ? ` · ${sel.integrationName}` : ""}`}
          badge={<span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase shrink-0 ${sevBadge(sel.severity)}`}>{sel.severity}</span>}
          fields={[
            { label: st.severity, value: sel.severity },
            { label: st.type, value: sel.type },
            { label: st.message, value: sel.message },
            { label: st.occurrences, value: sel.count },
            { label: st.client, value: sel.client },
            { label: st.integration, value: sel.integrationName },
            { label: st.first, value: new Date(sel.first).toLocaleString("pt-BR") },
            { label: st.last, value: new Date(sel.last).toLocaleString("pt-BR") },
          ]}
          guideTitle={st.guideTitle}
          guideSteps={st.guideSteps}
          guideTx={st.guideTx}
          actions={statusFilter !== "RESOLVED" ? (
            <>
              <button onClick={() => runDiagnose(sel)} className="px-3 py-1.5 text-xs font-medium bg-violet-500/15 text-violet-300 rounded-lg hover:bg-violet-500/25 cursor-pointer">{t.diagnose}</button>
              <button onClick={() => { setConfirm(sel); setSel(null); }} className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 cursor-pointer">{t.resolve}{sel.count > 1 ? ` (${sel.count})` : ""}</button>
            </>
          ) : undefined}
        >
          <ExplainData screen="Alertas — item" data={{ severidade: sel.severity, tipo: sel.type, mensagem: sel.message, ocorrencias: sel.count, cliente: sel.client, integracao: sel.integrationName, primeira: sel.first, ultima: sel.last }} />
        </DetailSheet>
      )}
    </div>
  );
}
