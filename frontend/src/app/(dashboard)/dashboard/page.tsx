"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClients, getAlertStats, getAlerts } from "@/lib/api";
import HealthScoreRing from "@/components/HealthScoreRing";

interface ClientRaw {
  id: string;
  name: string;
  healthScore: number;
  integrations?: unknown[];
  integrationCount?: number;
  alertCount?: number;
  _count?: { alerts: number };
}

interface Client {
  id: string;
  name: string;
  healthScore: number;
  integrationCount: number;
  alertCount: number;
}

interface AlertStats {
  total: number;
  active: number;
  critical: number;
  resolved: number;
}

interface Alert {
  id: string;
  severity: string;
  message: string;
  clientName?: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [clientsData, statsData, alertsData] = await Promise.all([
          getClients(),
          getAlertStats(),
          getAlerts({ limit: "5" }),
        ]);
        const rawClients: ClientRaw[] = Array.isArray(clientsData) ? clientsData : clientsData.data || [];
        setClients(rawClients.map((c) => ({
          id: c.id,
          name: c.name,
          healthScore: c.healthScore,
          integrationCount: c.integrationCount || (c.integrations?.length ?? 0),
          alertCount: c.alertCount || (c._count?.alerts ?? 0),
        })));
        setStats(statsData);
        setRecentAlerts(Array.isArray(alertsData) ? alertsData.slice(0, 5) : alertsData.data?.slice(0, 5) || []);
      } catch {
        setError("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-[#9b95ad] text-lg">Carregando...</div>;
  }

  if (error) {
    return <div className="text-rose-400">{error}</div>;
  }

  const avgScore = clients.length
    ? Math.round(clients.reduce((sum, c) => sum + (c.healthScore || 0), 0) / clients.length)
    : 0;

  const totalIntegrations = clients.reduce((sum, c) => sum + (c.integrationCount || 0), 0);

  function scoreColor(score: number) {
    if (score >= 80) return "border-l-emerald-500";
    if (score >= 50) return "border-l-amber-500";
    return "border-l-rose-500";
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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Clientes", value: clients.length, icon: "\uD83D\uDC65" },
          { label: "Alertas Ativos", value: stats?.active ?? 0, icon: "\uD83D\uDD14" },
          { label: "Score Medio", value: avgScore, icon: "\uD83D\uDCCA" },
          { label: "Integracoes Ativas", value: totalIntegrations, icon: "\u26A1" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08] hover:bg-[#231d35] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#9b95ad]">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Client Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Clientes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              onClick={() => router.push(`/clients/${client.id}`)}
              className={`bg-[#1a1527] rounded-xl p-5 border border-white/[0.08] border-l-4 ${scoreColor(
                client.healthScore
              )} hover:bg-[#231d35] transition-colors cursor-pointer`}
            >
              <div className="flex items-center gap-4">
                <HealthScoreRing score={client.healthScore || 0} size={64} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{client.name}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-[#9b95ad]">
                    <span>{client.integrationCount || 0} integracoes</span>
                    <span>{client.alertCount || 0} alertas</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {clients.length === 0 && (
          <p className="text-[#9b95ad] text-sm">Nenhum cliente cadastrado.</p>
        )}
      </div>

      {/* Recent Alerts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Alertas Recentes</h2>
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08] flex items-center gap-4"
            >
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${severityBadge(
                  alert.severity
                )}`}
              >
                {alert.severity}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{alert.message}</p>
                {alert.clientName && (
                  <p className="text-xs text-[#9b95ad] mt-0.5">
                    {alert.clientName}
                  </p>
                )}
              </div>
              <span className="text-xs text-[#9b95ad] shrink-0">
                {new Date(alert.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          ))}
          {recentAlerts.length === 0 && (
            <p className="text-[#9b95ad] text-sm">Nenhum alerta recente.</p>
          )}
        </div>
      </div>
    </div>
  );
}
