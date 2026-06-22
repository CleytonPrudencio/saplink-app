"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  getClient,
  getIntegrations,
  getAlerts,
  getDiagnosticHistory,
  resolveAlert,
  generateAgentToken,
} from "@/lib/api";
import HealthScoreRing from "@/components/HealthScoreRing";
import { Modal } from "@/components/Modal";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

// Tipos monitorados pelo Agente on-premise (sem endpoint HTTP direto)
const AGENT_TYPES = new Set(["RFC", "IDOC", "BAPI", "SOAP", "FILE", "DATABASE"]);

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  latency?: number;
  errorRate?: number;
  uptime?: number;
  agentConfigured?: boolean;
  lastAgentReportAt?: string | null;
}

interface Alert {
  id: string;
  severity: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Diagnostic {
  id: string;
  query: string;
  response: string;
  createdAt: string;
}

interface ClientDetail {
  id: string;
  name: string;
  healthScore: number;
  integrationCount: number;
  alertCount: number;
}

type Tab = "integrations" | "alerts" | "diagnostics";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lang } = useLang();
  const t = T[lang];
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("integrations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Enrollment do Agente on-premise
  const [agentModal, setAgentModal] = useState<Integration | null>(null);
  const [agentToken, setAgentToken] = useState<string>("");
  const [agentBusy, setAgentBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function openAgent(int: Integration) {
    setAgentModal(int);
    setAgentToken("");
    setCopied(false);
    setAgentBusy(true);
    try {
      const { token } = await generateAgentToken(int.id);
      setAgentToken(token);
      setIntegrations((prev) => prev.map((i) => (i.id === int.id ? { ...i, agentConfigured: true } : i)));
    } catch {
      setAgentToken("");
    } finally {
      setAgentBusy(false);
    }
  }

  const agentUrl = typeof window !== "undefined" ? window.location.origin.replace(":3000", ":8080") : "https://api.saplink.app";
  const dockerCmd = (token: string) =>
    `docker run -d --name saplink-agent --restart unless-stopped \\\n  -e SAPLINK_URL=${agentUrl} \\\n  -e AGENT_TOKEN=${token} \\\n  -e SAP_MODE=mock \\\n  saplink/agent:latest`;

  function agentFreshness(int: Integration): { label: string; color: string } {
    if (!int.agentConfigured) return { label: t.agentNotInstalled, color: "text-[#9b95ad]" };
    if (!int.lastAgentReportAt) return { label: t.agentAwaitingFirst, color: "text-amber-400" };
    const ageMs = Date.now() - new Date(int.lastAgentReportAt).getTime();
    if (ageMs > 180000) return { label: t.agentOffline(Math.round(ageMs / 60000)), color: "text-rose-400" };
    const s = Math.round(ageMs / 1000);
    return { label: s < 60 ? t.agentActiveSec(s) : t.agentActiveMin(Math.round(s / 60)), color: "text-emerald-400" };
  }

  useEffect(() => {
    async function load() {
      try {
        const [clientData, intData, alertData, diagData] = await Promise.all([
          getClient(id),
          getIntegrations(id),
          getAlerts({ clientId: id }),
          getDiagnosticHistory(id),
        ]);
        setClient(clientData);
        setIntegrations(Array.isArray(intData) ? intData : intData.data || []);
        setAlerts(Array.isArray(alertData) ? alertData : alertData.data || []);
        setDiagnostics(Array.isArray(diagData) ? diagData : diagData.data || []);
      } catch {
        setError(t.loadError);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleResolve(alertId: string) {
    try {
      await resolveAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: "RESOLVED" } : a))
      );
    } catch {
      /* ignore */
    }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  if (error) return <div className="text-rose-400">{error}</div>;
  if (!client) return <div className="text-[#9b95ad]">{t.notFound}</div>;

  function statusBadge(status: string) {
    const s = status?.toUpperCase();
    if (s === "ACTIVE" || s === "ONLINE") return "bg-emerald-500/20 text-emerald-400";
    if (s === "ERROR") return "bg-rose-500/20 text-rose-400";
    return "bg-gray-500/20 text-gray-400";
  }

  function severityBadge(severity: string) {
    const colors: Record<string, string> = {
      CRITICAL: "bg-rose-500/20 text-rose-400",
      HIGH: "bg-orange-500/20 text-orange-400",
      MEDIUM: "bg-amber-500/20 text-amber-400",
      LOW: "bg-blue-500/20 text-blue-400",
    };
    return colors[severity?.toUpperCase()] || "bg-gray-500/20 text-gray-400";
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "integrations", label: t.tabIntegrations },
    { key: "alerts", label: t.tabAlerts },
    { key: "diagnostics", label: t.tabDiagnostics },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-6">
        <HealthScoreRing score={client.healthScore || 0} size={80} />
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <div className="flex gap-4 mt-1 text-sm text-[#9b95ad]">
            <span>{t.integrationsCount(client.integrationCount || integrations.length)}</span>
            <span>{t.alertsCount(client.alertCount || alerts.length)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a1527] rounded-lg p-1 w-fit border border-white/[0.08]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "bg-purple-500/20 text-purple-400"
                : "text-[#9b95ad] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {integrations.map((int) => {
            const isError = int.status?.toUpperCase() === 'ERROR';
            const isOffline = int.status?.toUpperCase() === 'OFFLINE';
            const hasProblem = isError || isOffline;
            return (
            <div
              key={int.id}
              className={`bg-[#1a1527] rounded-xl p-5 border transition-all ${hasProblem ? 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-white/[0.08]'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium uppercase">
                    {int.type}
                  </span>
                  <h3 className="font-medium">{int.name}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${statusBadge(int.status)}`}>
                  {int.status}
                </span>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[#9b95ad]">{t.metricLatency}</p>
                  <p className={`font-medium ${(int.latency ?? 0) > 500 ? 'text-amber-400' : ''}`}>{int.latency ?? "-"} ms</p>
                </div>
                <div>
                  <p className="text-[#9b95ad]">{t.metricErrorRate}</p>
                  <p className={`font-medium ${(int.errorRate ?? 0) > 5 ? 'text-rose-400' : ''}`}>{int.errorRate ?? 0}%</p>
                </div>
                <div>
                  <p className="text-[#9b95ad]">{t.metricUptime}</p>
                  <div className="mt-1">
                    <div className="w-full bg-white/[0.08] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${(int.uptime ?? 0) >= 95 ? 'bg-emerald-500' : (int.uptime ?? 0) >= 85 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${int.uptime ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs mt-0.5">{int.uptime ?? 0}%</p>
                  </div>
                </div>
              </div>

              {/* Agente on-premise (RFC/IDoc/etc) */}
              {AGENT_TYPES.has(int.type?.toUpperCase()) && (() => {
                const fresh = agentFreshness(int);
                return (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span>🛰️</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#e2e0ea]">{t.agentMonitored}</p>
                        <p className={`text-xs ${fresh.color} truncate`}>{fresh.label}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openAgent(int)}
                      className="shrink-0 px-3 py-1.5 text-xs font-medium bg-purple-500/15 text-purple-300 rounded-lg hover:bg-purple-500/25 transition cursor-pointer"
                    >
                      {int.agentConfigured ? t.agentNewToken : t.agentInstall}
                    </button>
                  </div>
                );
              })()}

              {/* Ações de erro */}
              {hasProblem && (
                <div className="mt-4 pt-4 border-t border-rose-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-rose-400 text-sm">⚠️</span>
                    <span className="text-sm font-semibold text-rose-400">
                      {isError ? t.integrationErrorTitle : t.integrationOfflineTitle}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Passo 1: Ver alertas */}
                    <button
                      onClick={() => setActiveTab('alerts')}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 transition text-left cursor-pointer"
                    >
                      <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
                      <div>
                        <p className="text-sm font-medium text-rose-300">{t.step1Title}</p>
                        <p className="text-xs text-[#9b95ad]">{t.step1Desc}</p>
                      </div>
                    </button>

                    {/* Passo 2: Diagnosticar com IA */}
                    <a
                      href={`/diagnostics?clientId=${id}&integrationId=${int.id}&auto=1`}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition text-left block"
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                      <div>
                        <p className="text-sm font-medium text-purple-300">{t.step2Title}</p>
                        <p className="text-xs text-[#9b95ad]">{t.step2Desc}</p>
                      </div>
                    </a>

                    {/* Passo 3: Verificar detalhes */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                      <div>
                        <p className="text-sm font-medium text-cyan-300">{t.step3Title}</p>
                        <p className="text-xs text-[#9b95ad]">{t.step3Desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Análise de métricas com sugestões */}
              {!hasProblem && (() => {
                const issues: { severity: string; color: string; icon: string; title: string; detail: string; action: string }[] = [];

                // Taxa de erro
                if (((int.errorRate ?? 0)) > 50) {
                  issues.push({ severity: t.sevCritical, color: 'rose', icon: '🔴', title: t.issueErrorCriticalTitle, detail: t.issueErrorCritical(int.errorRate ?? 0), action: t.issueErrorCriticalAction });
                } else if (((int.errorRate ?? 0)) > 20) {
                  issues.push({ severity: t.sevHigh, color: 'orange', icon: '🟠', title: t.issueErrorHighTitle, detail: t.issueErrorHigh(int.errorRate ?? 0), action: t.issueErrorHighAction });
                } else if (((int.errorRate ?? 0)) > 5) {
                  issues.push({ severity: t.sevMedium, color: 'amber', icon: '🟡', title: t.issueErrorMediumTitle, detail: t.issueErrorMedium(int.errorRate ?? 0), action: t.issueErrorMediumAction });
                }

                // Latência
                if (((int.latency ?? 0)) > 1000) {
                  issues.push({ severity: t.sevHigh, color: 'orange', icon: '🐌', title: t.issueLatencyHighTitle, detail: t.issueLatencyHigh(int.latency ?? 0), action: t.issueLatencyHighAction });
                } else if (((int.latency ?? 0)) > 500) {
                  issues.push({ severity: t.sevMedium, color: 'amber', icon: '⏱️', title: t.issueLatencyMediumTitle, detail: t.issueLatencyMedium(int.latency ?? 0), action: t.issueLatencyMediumAction });
                }

                // Uptime
                if (((int.uptime ?? 0)) < 90) {
                  issues.push({ severity: t.sevHigh, color: 'orange', icon: '📉', title: t.issueUptimeHighTitle, detail: t.issueUptimeHigh(int.uptime ?? 0), action: t.issueUptimeHighAction });
                } else if (((int.uptime ?? 0)) < 95) {
                  issues.push({ severity: t.sevMedium, color: 'amber', icon: '📊', title: t.issueUptimeMediumTitle, detail: t.issueUptimeMedium(int.uptime ?? 0), action: t.issueUptimeMediumAction });
                }

                if (issues.length === 0) return null;

                return (
                  <div className="mt-4 pt-4 border-t border-white/[0.05] space-y-2">
                    {issues.map((issue, idx) => (
                      <div key={idx} className={`rounded-lg p-3 bg-${issue.color}-500/5 border border-${issue.color}-500/15`} style={{ backgroundColor: `rgba(${issue.color === 'rose' ? '244,63,94' : issue.color === 'orange' ? '249,115,22' : '245,158,11'},0.05)`, borderColor: `rgba(${issue.color === 'rose' ? '244,63,94' : issue.color === 'orange' ? '249,115,22' : '245,158,11'},0.15)` }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{issue.icon}</span>
                            <span className="text-sm font-semibold text-[#e2e0ea]">{issue.title}</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: `rgba(${issue.color === 'rose' ? '244,63,94' : issue.color === 'orange' ? '249,115,22' : '245,158,11'},0.15)`, color: `rgb(${issue.color === 'rose' ? '251,113,133' : issue.color === 'orange' ? '251,146,60' : '252,211,77'})` }}>{issue.severity}</span>
                        </div>
                        <p className="text-xs text-[#9b95ad] mb-2">{issue.detail}</p>
                        <a href={`/diagnostics?clientId=${id}&integrationId=${int.id}&auto=1`} className="inline-flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 transition">
                          💡 {issue.action} →
                        </a>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          );})}
          {integrations.length === 0 && (
            <p className="text-[#9b95ad] text-sm">{t.noIntegrations}</p>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08] flex items-center gap-4"
            >
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase shrink-0 ${severityBadge(
                  alert.severity
                )}`}
              >
                {alert.severity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{alert.message}</p>
                <p className="text-xs text-[#9b95ad] mt-0.5">
                  {new Date(alert.createdAt).toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en-US")}
                </p>
              </div>
              {alert.status !== "RESOLVED" && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors shrink-0 cursor-pointer"
                >
                  {t.resolve}
                </button>
              )}
              {alert.status === "RESOLVED" && (
                <span className="text-xs text-emerald-400 shrink-0">{t.resolved}</span>
              )}
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-[#9b95ad] text-sm">{t.noAlerts}</p>
          )}
        </div>
      )}

      {/* Diagnostics Tab */}
      {activeTab === "diagnostics" && (
        <div className="space-y-4">
          <button
            onClick={() => router.push(`/diagnostics?clientId=${id}`)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm cursor-pointer"
          >
            {t.newDiagnostic}
          </button>
          <div className="space-y-3">
            {diagnostics.map((diag) => (
              <div
                key={diag.id}
                className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]"
              >
                <p className="text-sm font-medium mb-2">{diag.query}</p>
                <p className="text-sm text-[#9b95ad] whitespace-pre-wrap">
                  {diag.response}
                </p>
                <p className="text-xs text-[#9b95ad] mt-2">
                  {new Date(diag.createdAt).toLocaleString(lang === "pt" ? "pt-BR" : lang === "es" ? "es" : "en-US")}
                </p>
              </div>
            ))}
            {diagnostics.length === 0 && (
              <p className="text-[#9b95ad] text-sm">{t.noDiagnostics}</p>
            )}
          </div>
        </div>
      )}

      {/* Modal: enrollment do Agente on-premise */}
      <Modal open={!!agentModal} onClose={() => setAgentModal(null)} title={t.modalTitle} size="lg">
        {agentModal && (
          <div className="space-y-4 text-sm">
            <p className="text-[#9b95ad]">
              <span className="text-[#e2e0ea] font-medium">{agentModal.name}</span>{t.modalIntroAfterName(agentModal.type)}
            </p>

            <div>
              <p className="text-xs font-semibold text-[#9b95ad] uppercase tracking-wider mb-1">{t.modalStep1Label}</p>
              {agentBusy ? (
                <p className="text-[#9b95ad]">{t.modalGeneratingToken}</p>
              ) : agentToken ? (
                <>
                  <code className="block bg-[#0f0b1a] border border-purple-500/30 rounded-lg px-3 py-2 break-all text-purple-300">{agentToken}</code>
                  <p className="text-xs text-amber-400 mt-1">{t.modalTokenWarn}</p>
                </>
              ) : (
                <p className="text-rose-400">{t.modalTokenError}</p>
              )}
            </div>

            {agentToken && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-[#9b95ad] uppercase tracking-wider">{t.modalStep2Label}</p>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(dockerCmd(agentToken)); setCopied(true); }}
                    className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer"
                  >
                    {copied ? t.copied : t.copy}
                  </button>
                </div>
                <pre className="bg-[#0f0b1a] border border-white/[0.08] rounded-lg p-3 text-xs text-[#e2e0ea] overflow-auto whitespace-pre">{dockerCmd(agentToken)}</pre>
                <p className="text-xs text-[#9b95ad] mt-2">
                  {t.modalRfcNoteBefore}<code className="text-purple-300">SAP_MODE=mock</code>{t.modalRfcNoteMiddle}<code className="text-purple-300">rfc</code>{t.modalRfcNoteAfter}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
