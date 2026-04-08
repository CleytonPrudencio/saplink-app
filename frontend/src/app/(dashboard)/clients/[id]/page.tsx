"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  getClient,
  getIntegrations,
  getAlerts,
  getDiagnosticHistory,
  resolveAlert,
} from "@/lib/api";
import HealthScoreRing from "@/components/HealthScoreRing";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  latency?: number;
  errorRate?: number;
  uptime?: number;
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
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("integrations");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError("Erro ao carregar dados do cliente.");
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

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  if (error) return <div className="text-rose-400">{error}</div>;
  if (!client) return <div className="text-[#9b95ad]">Cliente nao encontrado.</div>;

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
    { key: "integrations", label: "Integracoes" },
    { key: "alerts", label: "Alertas" },
    { key: "diagnostics", label: "Diagnosticos" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-6">
        <HealthScoreRing score={client.healthScore || 0} size={80} />
        <div>
          <h1 className="text-2xl font-bold">{client.name}</h1>
          <div className="flex gap-4 mt-1 text-sm text-[#9b95ad]">
            <span>{client.integrationCount || integrations.length} integrações</span>
            <span>{client.alertCount || alerts.length} alertas</span>
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
                  <p className="text-[#9b95ad]">Latência</p>
                  <p className={`font-medium ${int.latency > 500 ? 'text-amber-400' : ''}`}>{int.latency ?? "-"} ms</p>
                </div>
                <div>
                  <p className="text-[#9b95ad]">Taxa de Erro</p>
                  <p className={`font-medium ${int.errorRate > 5 ? 'text-rose-400' : ''}`}>{int.errorRate ?? 0}%</p>
                </div>
                <div>
                  <p className="text-[#9b95ad]">Uptime</p>
                  <div className="mt-1">
                    <div className="w-full bg-white/[0.08] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${int.uptime >= 95 ? 'bg-emerald-500' : int.uptime >= 85 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${int.uptime ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs mt-0.5">{int.uptime ?? 0}%</p>
                  </div>
                </div>
              </div>

              {/* Ações de erro */}
              {hasProblem && (
                <div className="mt-4 pt-4 border-t border-rose-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-rose-400 text-sm">⚠️</span>
                    <span className="text-sm font-semibold text-rose-400">
                      {isError ? 'Integração com erro — ação necessária' : 'Integração offline'}
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
                        <p className="text-sm font-medium text-rose-300">Ver alertas relacionados</p>
                        <p className="text-xs text-[#9b95ad]">Confira os alertas gerados por esta integração</p>
                      </div>
                    </button>

                    {/* Passo 2: Diagnosticar com IA */}
                    <a
                      href={`/diagnostics?clientId=${id}`}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition text-left block"
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
                      <div>
                        <p className="text-sm font-medium text-purple-300">Diagnosticar com IA</p>
                        <p className="text-xs text-[#9b95ad]">A IA analisa o erro e sugere causa raiz + correção</p>
                      </div>
                    </a>

                    {/* Passo 3: Verificar detalhes */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
                      <div>
                        <p className="text-sm font-medium text-cyan-300">Resolver e monitorar</p>
                        <p className="text-xs text-[#9b95ad]">Após corrigir, o sistema detecta automaticamente a recuperação</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Indicadores de alerta para métricas altas */}
              {!hasProblem && (int.errorRate > 5 || int.latency > 500) && (
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs">⚡</span>
                    <span className="text-xs text-amber-400">
                      {int.errorRate > 5 && int.latency > 500
                        ? 'Atenção: taxa de erro e latência elevadas'
                        : int.errorRate > 5
                        ? 'Atenção: taxa de erro acima do normal'
                        : 'Atenção: latência elevada'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );})}
          {integrations.length === 0 && (
            <p className="text-[#9b95ad] text-sm">Nenhuma integração encontrada.</p>
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
                  {new Date(alert.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              {alert.status !== "RESOLVED" && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors shrink-0 cursor-pointer"
                >
                  Resolver
                </button>
              )}
              {alert.status === "RESOLVED" && (
                <span className="text-xs text-emerald-400 shrink-0">Resolvido</span>
              )}
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-[#9b95ad] text-sm">Nenhum alerta para este cliente.</p>
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
            Novo Diagnostico
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
                  {new Date(diag.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
            {diagnostics.length === 0 && (
              <p className="text-[#9b95ad] text-sm">Nenhum diagnostico realizado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
