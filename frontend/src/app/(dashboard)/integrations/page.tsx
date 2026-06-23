"use client";

import { useEffect, useState } from "react";
import { usePersistedState } from "@/lib/usePersistedState";
import { useRouter } from "next/navigation";
import { getAllIntegrations, testIntegration, deleteIntegration, syncIntegration, syncAllIntegrations, updateIntegration } from "@/lib/api";
import { Modal, Field, inputClass } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import ExplainData from "@/components/ExplainData";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: string;
  environment?: string;
  clientName?: string;
  clientId?: string;
  client?: { id: string; name: string };
  _count?: { alerts: number };
  updatedAt?: string;
  description?: string;
  latency?: number;
  errorRate?: number;
  uptime?: number;
  config?: Record<string, unknown>;
  lastTestedAt?: string;
}

function clientOf(i: Integration) {
  return { id: i.client?.id || i.clientId || "", name: i.client?.name || i.clientName || "—" };
}

// Cores por ambiente (DEV/HML/PRD)
function envBadge(env?: string) {
  if (env === "DEV") return "bg-sky-500/15 text-sky-300";
  if (env === "HML") return "bg-amber-500/15 text-amber-300";
  return "bg-emerald-500/15 text-emerald-300"; // PRD
}

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

const statusConfig: Record<string, { labelKey: "badgeActive" | "badgeError" | "badgePending" | "badgeOffline"; color: string }> = {
  ACTIVE: { labelKey: "badgeActive", color: "bg-emerald-500/20 text-emerald-400" },
  ERROR: { labelKey: "badgeError", color: "bg-rose-500/20 text-rose-400" },
  PENDING: { labelKey: "badgePending", color: "bg-amber-500/20 text-amber-400" },
  OFFLINE: { labelKey: "badgeOffline", color: "bg-gray-500/20 text-gray-400" },
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
  const { lang } = useLang();
  const t = T[lang];
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [editing, setEditing] = useState<Integration | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description: string; config: Record<string, string> }>({ name: "", description: "", config: {} });
  const [savingEdit, setSavingEdit] = useState(false);
  const { notify } = useToast();

  // Filtros
  const [search, setSearch] = usePersistedState("slk:integrations:search", "");
  const [filterClient, setFilterClient] = usePersistedState("slk:integrations:filterClient", "");
  const [filterType, setFilterType] = usePersistedState("slk:integrations:filterType", "");
  const [filterStatus, setFilterStatus] = usePersistedState("slk:integrations:filterStatus", "");
  const [filterEnv, setFilterEnv] = usePersistedState("slk:integrations:filterEnv", "");

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function handleSync(id: string) {
    setSyncingId(id);
    try {
      const r = await syncIntegration(id);
      notify(r?.probe?.ok ? t.syncOk : t.syncFail, r?.probe?.ok ? "success" : "error");
      await loadIntegrations();
    } catch (e: any) {
      notify(e?.response?.data?.error || t.syncError, "error");
    } finally {
      setSyncingId(null);
    }
  }

  async function handleSyncAll() {
    setSyncingAll(true);
    try {
      const r = await syncAllIntegrations();
      notify(t.syncedCount(r.synced), "success");
      await loadIntegrations();
    } catch {
      notify(t.syncAllError, "error");
    } finally {
      setSyncingAll(false);
    }
  }

  function openEdit(integ: Integration) {
    const cfg: Record<string, string> = {};
    Object.entries(integ.config || {}).forEach(([k, v]) => { cfg[k] = v === "••••••" ? "" : String(v ?? ""); });
    setEditForm({ name: integ.name, description: integ.description || "", config: cfg });
    setEditing(integ);
  }

  async function saveEdit() {
    if (!editing) return;
    setSavingEdit(true);
    try {
      await updateIntegration(editing.id, { name: editForm.name, description: editForm.description, config: editForm.config });
      notify(t.updated, "success");
      setEditing(null);
      await loadIntegrations();
    } catch (e: any) {
      notify(e?.response?.data?.error || t.saveError, "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function loadIntegrations() {
    try {
      const data = await getAllIntegrations();
      setIntegrations(Array.isArray(data) ? data : data.data || []);
    } catch {
      setError(t.loadError);
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
      const message = err instanceof Error ? err.message : t.connectionError;
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: false, message, details: {} },
      }));
    } finally {
      setTestingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t.confirmDelete)) return;
    setDeletingId(id);
    try {
      await deleteIntegration(id);
      setIntegrations((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert(t.deleteError);
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

  // Listas únicas para os selects
  const clientOptions = Array.from(
    new Map(integrations.map((i) => [clientOf(i).id, clientOf(i).name])).entries()
  ).filter(([id]) => id).sort((a, b) => a[1].localeCompare(b[1]));
  // dedupe por tipo normalizado (o seed mistura "OData"/"ODATA")
  const typeOptions = Array.from(new Set(integrations.map((i) => (i.type || "").toUpperCase()).filter(Boolean))).sort();

  const filtered = integrations.filter((i) => {
    if (filterClient && clientOf(i).id !== filterClient) return false;
    if (filterType && (i.type || "").toUpperCase() !== filterType) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    if (filterEnv && (i.environment || "PRD") !== filterEnv) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!i.name.toLowerCase().includes(q) && !clientOf(i).name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const hasFilters = !!(search || filterClient || filterType || filterStatus || filterEnv);
  function clearFilters() { setSearch(""); setFilterClient(""); setFilterType(""); setFilterStatus(""); setFilterEnv(""); }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  if (error) return <div className="text-rose-400">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-[#9b95ad] text-sm mt-1">
            {t.subtitle}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="px-4 py-2.5 bg-white/[0.06] text-[#e2e0ea] text-sm font-medium rounded-lg hover:bg-white/[0.12] transition-all cursor-pointer disabled:opacity-50"
            title={t.syncAllTooltip}
          >
            {syncingAll ? t.syncingAll : t.syncAll}
          </button>
          <button
            onClick={() => router.push("/integrations/new")}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all cursor-pointer"
          >
            {t.newIntegration}
          </button>
        </div>
      </div>

      <ExplainData screen="Integrações" data={{ stats, integracoes: integrations.slice(0, 20).map((i: any) => ({ nome: i.name, tipo: i.type, status: i.status, latencia: i.latency, erro: i.errorRate, uptime: i.uptime })) }} />

      {/* Stats Bar (clicáveis: filtram por status) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t.statTotal, value: stats.total, color: "text-purple-400", status: "" },
          { label: t.statActive, value: stats.active, color: "text-emerald-400", status: "ACTIVE" },
          { label: t.statError, value: stats.error, color: "text-rose-400", status: "ERROR" },
          { label: t.statOffline, value: stats.offline, color: "text-gray-400", status: "OFFLINE" },
        ].map((stat) => (
          <button
            key={stat.status || "total"}
            onClick={() => setFilterStatus(stat.status)}
            className={`text-left bg-[#1a1527] rounded-xl p-4 border transition cursor-pointer ${filterStatus === stat.status ? "border-purple-500/50" : "border-white/[0.08] hover:border-white/[0.2]"}`}
          >
            <p className="text-xs text-[#9b95ad] uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-[#1a1527] rounded-xl p-3 border border-white/[0.08] flex flex-col lg:flex-row gap-2 lg:items-center">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b95ad] text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 bg-[#0f0b1a] border border-white/[0.1] rounded-lg text-sm focus:outline-none focus:border-purple-500/50"
          />
        </div>
        <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="px-3 py-2 bg-[#0f0b1a] border border-white/[0.1] rounded-lg text-sm focus:outline-none focus:border-purple-500/50">
          <option value="">{t.allClients}</option>
          {clientOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-[#0f0b1a] border border-white/[0.1] rounded-lg text-sm focus:outline-none focus:border-purple-500/50">
          <option value="">{t.allTypes}</option>
          {typeOptions.map((tp) => <option key={tp} value={tp}>{tp.replace(/_/g, " ")}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-[#0f0b1a] border border-white/[0.1] rounded-lg text-sm focus:outline-none focus:border-purple-500/50">
          <option value="">{t.allStatuses}</option>
          <option value="ACTIVE">{t.statusActive}</option>
          <option value="ERROR">{t.statusError}</option>
          <option value="OFFLINE">{t.statusOffline}</option>
          <option value="PENDING">{t.statusPending}</option>
        </select>
        <select value={filterEnv} onChange={(e) => setFilterEnv(e.target.value)} className="px-3 py-2 bg-[#0f0b1a] border border-white/[0.1] rounded-lg text-sm focus:outline-none focus:border-purple-500/50">
          <option value="">{t.allEnvironments}</option>
          <option value="DEV">DEV</option>
          <option value="HML">HML</option>
          <option value="PRD">PRD</option>
        </select>
        {hasFilters && (
          <button onClick={clearFilters} className="px-3 py-2 text-sm text-[#9b95ad] hover:text-white rounded-lg hover:bg-white/[0.06] transition cursor-pointer shrink-0">
            {t.clear}
          </button>
        )}
      </div>

      {hasFilters && (
        <p className="text-xs text-[#9b95ad] -mt-3">{t.showing(filtered.length, integrations.length)}</p>
      )}

      {/* Integration Cards */}
      <div className="space-y-3">
        {filtered.map((integ) => {
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
                {/* Environment Badge */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${envBadge(integ.environment)}`} title={t.environmentTooltip}>
                  {integ.environment || "PRD"}
                </span>

                {/* Name & Client */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{integ.name}</p>
                  <p className="text-xs text-[#9b95ad] mt-0.5">{clientOf(integ).name}</p>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${sc.color}`}>
                  {t[sc.labelKey]}
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
                    onClick={() => handleSync(integ.id)}
                    disabled={syncingId === integ.id}
                    className="px-3 py-1.5 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors cursor-pointer disabled:opacity-50"
                    title={t.syncTooltip}
                  >
                    {syncingId === integ.id ? "..." : t.sync}
                  </button>
                  <button
                    onClick={() => openEdit(integ)}
                    className="px-3 py-1.5 text-xs font-medium bg-white/[0.06] text-[#e2e0ea] rounded-lg hover:bg-white/[0.12] transition-colors cursor-pointer"
                  >
                    {t.edit}
                  </button>
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
                        {t.testing}
                      </span>
                    ) : (
                      t.test
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(integ.id)}
                    disabled={deletingId === integ.id}
                    className="px-3 py-1.5 text-xs font-medium bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === integ.id ? "..." : t.delete}
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
                      <span className="text-emerald-400 font-medium">{t.connectionOk}</span>
                    ) : (
                      <span className="text-rose-400 font-medium">{t.connectionError}</span>
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

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/[0.06]">
                  <div className="pt-4 space-y-4">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-[#0f0b1a] rounded-lg p-3">
                        <p className="text-[10px] text-[#9b95ad] uppercase tracking-wider">{t.detailType}</p>
                        <p className="text-sm font-semibold text-[#e2e0ea] mt-1">{integ.type}</p>
                      </div>
                      <div className="bg-[#0f0b1a] rounded-lg p-3">
                        <p className="text-[10px] text-[#9b95ad] uppercase tracking-wider">{t.detailClient}</p>
                        <p className="text-sm font-semibold text-[#e2e0ea] mt-1">{integ.client?.name || '—'}</p>
                      </div>
                      <div className="bg-[#0f0b1a] rounded-lg p-3">
                        <p className="text-[10px] text-[#9b95ad] uppercase tracking-wider">{t.detailAlerts}</p>
                        <p className="text-sm font-semibold text-[#e2e0ea] mt-1">{integ._count?.alerts ?? 0}</p>
                      </div>
                      <div className="bg-[#0f0b1a] rounded-lg p-3">
                        <p className="text-[10px] text-[#9b95ad] uppercase tracking-wider">{t.detailUpdated}</p>
                        <p className="text-sm font-semibold text-[#e2e0ea] mt-1">{new Date(integ.updatedAt || Date.now()).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                        <p className={`text-2xl font-bold ${(integ.latency ?? 0) > 500 ? 'text-amber-400' : 'text-[#e2e0ea]'}`}>{integ.latency ?? 0}ms</p>
                        <p className="text-[10px] text-[#9b95ad] mt-1">{t.metricLatency}</p>
                        <p className="text-[10px] text-[#9b95ad]">{(integ.latency ?? 0) <= 200 ? t.latencyExcellent : (integ.latency ?? 0) <= 500 ? t.latencyNormal : t.latencyHigh}</p>
                      </div>
                      <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                        <p className={`text-2xl font-bold ${(integ.errorRate ?? 0) > 5 ? 'text-rose-400' : 'text-[#e2e0ea]'}`}>{integ.errorRate ?? 0}%</p>
                        <p className="text-[10px] text-[#9b95ad] mt-1">{t.metricErrorRate}</p>
                        <p className="text-[10px] text-[#9b95ad]">{(integ.errorRate ?? 0) <= 1 ? t.errorRateHealthy : (integ.errorRate ?? 0) <= 5 ? t.errorRateAcceptable : t.errorRateCritical}</p>
                      </div>
                      <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                        <p className={`text-2xl font-bold ${(integ.uptime ?? 0) >= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>{integ.uptime ?? 0}%</p>
                        <p className="text-[10px] text-[#9b95ad] mt-1">{t.metricUptime}</p>
                        <p className="text-[10px] text-[#9b95ad]">{(integ.uptime ?? 0) >= 99 ? t.uptimeExcellent : (integ.uptime ?? 0) >= 95 ? t.uptimeWithinSla : t.uptimeBelowSla}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {integ.description && (
                      <div className="bg-[#0f0b1a] rounded-lg p-3">
                        <p className="text-[10px] text-[#9b95ad] uppercase tracking-wider mb-1">{t.detailDescription}</p>
                        <p className="text-sm text-[#e2e0ea]">{integ.description}</p>
                      </div>
                    )}

                    {/* Config */}
                    {integ.config && Object.keys(integ.config).length > 0 && (
                      <div className="bg-[#0f0b1a] rounded-lg p-3">
                        <p className="text-[10px] text-[#9b95ad] uppercase tracking-wider mb-2">{t.connectionConfig}</p>
                        <div className="space-y-1">
                          {Object.entries(integ.config).map(([key, val]) => (
                            <div key={key} className="flex gap-2 text-xs">
                              <span className="text-purple-400 shrink-0">{key}:</span>
                              <span className="text-[#e2e0ea] break-all">
                                {key.toLowerCase().includes("password") || key.toLowerCase().includes("secret") ? "••••••••" : String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No config message */}
                    {(!integ.config || Object.keys(integ.config).length === 0) && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <p className="text-xs text-amber-400">{t.noConfig}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <a href={`/diagnostics?clientId=${clientOf(integ).id}&integrationId=${integ.id}&auto=1`} className="px-4 py-2 rounded-lg bg-purple-500/15 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition">
                        {t.diagnoseAi}
                      </a>
                      <a href={`/clients/${clientOf(integ).id}`} className="px-4 py-2 rounded-lg bg-white/5 border border-white/[0.08] text-[#9b95ad] text-xs font-medium hover:text-white transition">
                        {t.viewClient}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && integrations.length > 0 && (
          <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center">
            <p className="text-[#9b95ad]">{t.noMatch}</p>
            <button onClick={clearFilters} className="mt-3 px-4 py-2 text-sm text-purple-400 hover:text-purple-300 cursor-pointer">{t.clearFilters}</button>
          </div>
        )}

        {integrations.length === 0 && (
          <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center">
            <p className="text-[#9b95ad]">{t.noneRegistered}</p>
            <button
              onClick={() => router.push("/integrations/new")}
              className="mt-4 px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all cursor-pointer"
            >
              {t.createFirst}
            </button>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={t.editTitle} size="lg">
        {editing && (
          <div className="space-y-4">
            <Field label={t.fieldName}><input className={inputClass} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></Field>
            <Field label={t.fieldDescription}><input className={inputClass} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></Field>
            <div>
              <p className="text-sm text-[#9b95ad] mb-2">{t.editConnectionConfig}</p>
              <div className="space-y-2">
                {Object.keys(editForm.config).map((k) => {
                  const sensitive = /pass|secret|apikey|api_key|authvalue|token/i.test(k);
                  return (
                    <Field key={k} label={k + (sensitive ? t.keepBlankSuffix : "")}>
                      <input
                        className={inputClass}
                        type={sensitive ? "password" : "text"}
                        value={editForm.config[k]}
                        placeholder={sensitive ? t.keepCurrentPlaceholder : ""}
                        onChange={(e) => setEditForm({ ...editForm, config: { ...editForm.config, [k]: e.target.value } })}
                      />
                    </Field>
                  );
                })}
                {Object.keys(editForm.config).length === 0 && <p className="text-sm text-[#9b95ad]">{t.noConfigShort}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm bg-white/[0.06]">{t.cancel}</button>
              <button disabled={savingEdit} onClick={saveEdit} className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-500 text-white disabled:opacity-40">{t.save}</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
