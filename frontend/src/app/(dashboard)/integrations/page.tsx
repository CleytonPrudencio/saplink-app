"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllIntegrations, testIntegration, deleteIntegration } from "@/lib/api";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  clientName?: string;
  clientId?: string;
  description?: string;
  latency?: number;
  errorRate?: number;
  uptime?: number;
  config?: Record<string, unknown>;
  lastTestedAt?: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativa", color: "bg-emerald-500/20 text-emerald-400" },
  ERROR: { label: "Erro", color: "bg-rose-500/20 text-rose-400" },
  PENDING: { label: "Pendente", color: "bg-amber-500/20 text-amber-400" },
  OFFLINE: { label: "Offline", color: "bg-gray-500/20 text-gray-400" },
};

const typeColors: Record<string, string> = {
  SAP_RFC: "bg-blue-500/20 text-blue-400",
  SAP_ODATA: "bg-cyan-500/20 text-cyan-400",
  SAP_BAPI: "bg-indigo-500/20 text-indigo-400",
  SAP_IDOC: "bg-violet-500/20 text-violet-400",
  SAP_HANA: "bg-purple-500/20 text-purple-400",
  REST_API: "bg-teal-500/20 text-teal-400",
  DATABASE: "bg-orange-500/20 text-orange-400",
  FILE_SFTP: "bg-pink-500/20 text-pink-400",
};

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    try {
      const data = await getAllIntegrations();
      setIntegrations(Array.isArray(data) ? data : data.data || []);
    } catch {
      setError("Erro ao carregar integracoes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTest(id: string) {
    setTestingId(id);
    setTestResults((prev) => ({ ...prev, [id]: undefined as unknown as TestResult }));
    try {
      const result = await testIntegration(id);
      setTestResults((prev) => ({ ...prev, [id]: result }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao testar conexao";
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: false, message, details: {} },
      }));
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta integracao?")) return;
    setDeletingId(id);
    try {
      await deleteIntegration(id);
      setIntegrations((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Erro ao excluir integracao.");
    } finally {
      setDeletingId(null);
    }
  }

  const stats = {
    total: integrations.length,
    active: integrations.filter((i) => i.status === "ACTIVE").length,
    error: integrations.filter((i) => i.status === "ERROR").length,
    offline: integrations.filter((i) => i.status === "OFFLINE").length,
  };

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  if (error) return <div className="text-rose-400">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Integracoes</h1>
          <p className="text-[#9b95ad] text-sm mt-1">
            Gerencie todas as integracoes SAP dos seus clientes
          </p>
        </div>
        <button
          onClick={() => router.push("/integrations/new")}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all cursor-pointer shrink-0"
        >
          + Nova Integracao
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-purple-400" },
          { label: "Ativas", value: stats.active, color: "text-emerald-400" },
          { label: "Com Erro", value: stats.error, color: "text-rose-400" },
          { label: "Offline", value: stats.offline, color: "text-gray-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]"
          >
            <p className="text-xs text-[#9b95ad] uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="space-y-3">
        {integrations.map((integ) => {
          const sc = statusConfig[integ.status] || statusConfig.OFFLINE;
          const tc = typeColors[integ.type] || "bg-gray-500/20 text-gray-400";
          const isExpanded = expandedId === integ.id;
          const isTesting = testingId === integ.id;
          const testResult = testResults[integ.id];

          return (
            <div
              key={integ.id}
              className="bg-[#1a1527] rounded-xl border border-white/[0.08] overflow-hidden"
            >
              {/* Main Row */}
              <div
                className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer hover:bg-[#231d35] transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : integ.id)}
              >
                {/* Type Badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase shrink-0 ${tc}`}>
                  {integ.type?.replace(/_/g, " ")}
                </span>

                {/* Name & Client */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{integ.name}</p>
                  {integ.clientName && (
                    <p className="text-xs text-[#9b95ad] mt-0.5">{integ.clientName}</p>
                  )}
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${sc.color}`}>
                  {sc.label}
                </span>

                {/* Metrics */}
                <div className="flex gap-4 text-xs text-[#9b95ad] shrink-0">
                  {integ.latency != null && <span>{integ.latency}ms</span>}
                  {integ.errorRate != null && <span>{integ.errorRate}% err</span>}
                  {integ.uptime != null && <span>{integ.uptime}% up</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleTest(integ.id)}
                    disabled={isTesting}
                    className="px-3 py-1.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTesting ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Testando...
                      </span>
                    ) : (
                      "Testar"
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(integ.id)}
                    disabled={deletingId === integ.id}
                    className="px-3 py-1.5 text-xs font-medium bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === integ.id ? "..." : "Excluir"}
                  </button>
                </div>

                {/* Expand Arrow */}
                <svg
                  className={`w-4 h-4 text-[#9b95ad] transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`mx-4 mb-3 p-3 rounded-lg text-sm ${
                  testResult.success
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-rose-500/10 border border-rose-500/20"
                }`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <span className="text-emerald-400 font-medium">Conexao OK</span>
                    ) : (
                      <span className="text-rose-400 font-medium">Erro na conexao</span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${testResult.success ? "text-emerald-400/70" : "text-rose-400/70"}`}>
                    {testResult.message}
                  </p>
                  {testResult.details && Object.keys(testResult.details).length > 0 && (
                    <div className="mt-2 text-xs text-[#9b95ad] space-y-0.5">
                      {Object.entries(testResult.details).map(([k, v]) => (
                        <p key={k}><span className="text-[#e2e0ea]">{k}:</span> {String(v)}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Expanded Config */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/[0.06]">
                  <div className="pt-3 space-y-2">
                    {integ.description && (
                      <p className="text-sm text-[#9b95ad]">{integ.description}</p>
                    )}
                    {integ.config && Object.keys(integ.config).length > 0 && (
                      <div className="bg-[#0f0b1a] rounded-lg p-3 text-xs space-y-1">
                        <p className="text-[#9b95ad] font-medium mb-2">Configuracao</p>
                        {Object.entries(integ.config).map(([key, val]) => (
                          <div key={key} className="flex gap-2">
                            <span className="text-purple-400 shrink-0">{key}:</span>
                            <span className="text-[#e2e0ea] break-all">
                              {key.toLowerCase().includes("password") || key.toLowerCase().includes("secret")
                                ? "***"
                                : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {integ.lastTestedAt && (
                      <p className="text-xs text-[#9b95ad]">
                        Ultimo teste: {new Date(integ.lastTestedAt).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {integrations.length === 0 && (
          <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center">
            <p className="text-[#9b95ad]">Nenhuma integracao cadastrada.</p>
            <button
              onClick={() => router.push("/integrations/new")}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all cursor-pointer"
            >
              + Criar primeira integracao
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
