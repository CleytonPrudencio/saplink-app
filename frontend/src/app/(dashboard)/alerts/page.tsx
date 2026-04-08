"use client";

import { useEffect, useState } from "react";
import { getAlerts, resolveAlert } from "@/lib/api";

interface Alert {
  id: string;
  severity: string;
  message: string;
  status: string;
  clientName?: string;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const data = await getAlerts();
      setAlerts(Array.isArray(data) ? data : data.data || []);
    } catch {
      setError("Erro ao carregar alertas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id: string) {
    try {
      await resolveAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "RESOLVED" } : a))
      );
    } catch {
      /* ignore */
    }
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

  const filtered = alerts.filter((a) => {
    if (severityFilter !== "ALL" && a.severity?.toUpperCase() !== severityFilter) return false;
    if (statusFilter === "ACTIVE" && a.status === "RESOLVED") return false;
    if (statusFilter === "RESOLVED" && a.status !== "RESOLVED") return false;
    return true;
  });

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  if (error) return <div className="text-rose-400">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Alertas</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2 bg-[#1a1527] border border-white/[0.08] rounded-lg text-sm text-[#e2e0ea] focus:outline-none focus:border-purple-500/50"
        >
          <option value="ALL">Todas severidades</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <div className="flex bg-[#1a1527] rounded-lg p-1 border border-white/[0.08]">
          {[
            { key: "ALL", label: "Todos" },
            { key: "ACTIVE", label: "Ativos" },
            { key: "RESOLVED", label: "Resolvidos" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                statusFilter === opt.key
                  ? "bg-purple-500/20 text-purple-400"
                  : "text-[#9b95ad] hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map((alert) => (
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
              {alert.clientName && (
                <p className="text-xs text-[#9b95ad] mt-0.5">{alert.clientName}</p>
              )}
              <p className="text-xs text-[#9b95ad] mt-0.5">
                {new Date(alert.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
            {alert.status !== "RESOLVED" ? (
              <button
                onClick={() => handleResolve(alert.id)}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors shrink-0 cursor-pointer"
              >
                Resolver
              </button>
            ) : (
              <span className="text-xs text-emerald-400 shrink-0">Resolvido</span>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-[#9b95ad] text-sm">Nenhum alerta encontrado.</p>
        )}
      </div>
    </div>
  );
}
