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
            <span>{client.integrationCount || 0} integracoes</span>
            <span>{client.alertCount || 0} alertas</span>
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
          {integrations.map((int) => (
            <div
              key={int.id}
              className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-medium uppercase">
                    {int.type}
                  </span>
                  <h3 className="font-medium">{int.name}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${statusBadge(
                    int.status
                  )}`}
                >
                  {int.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[#9b95ad]">Latencia</p>
                  <p className="font-medium">{int.latency ?? "-"} ms</p>
                </div>
                <div>
                  <p className="text-[#9b95ad]">Taxa de Erro</p>
                  <p className="font-medium">{int.errorRate ?? 0}%</p>
                </div>
                <div>
                  <p className="text-[#9b95ad]">Uptime</p>
                  <div className="mt-1">
                    <div className="w-full bg-white/[0.08] rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${int.uptime ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs mt-0.5">{int.uptime ?? 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {integrations.length === 0 && (
            <p className="text-[#9b95ad] text-sm">Nenhuma integracao encontrada.</p>
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
