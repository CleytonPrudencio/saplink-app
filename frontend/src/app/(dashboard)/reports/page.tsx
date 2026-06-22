"use client";

import { useEffect, useState } from "react";
import { getClients, getAlerts, getAlertStats, getDeadCode, getDeadCodeStats } from "@/lib/api";
import HealthScoreRing from "@/components/HealthScoreRing";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Client {
  id: string; name: string; cnpj?: string; healthScore: number;
  integrations?: { id: string; name: string; type: string; status: string; latency: number; errorRate: number; uptime: number }[];
  _count?: { alerts: number };
}

interface Alert {
  id: string; type: string; severity: string; message: string; resolved: boolean; createdAt: string; resolvedAt?: string;
  client?: { name: string }; integration?: { name: string };
}

interface DeadCodeEntry {
  id: string; objectName: string; objectType?: string; type?: string;
  lastUsed: string | null; usageCount: number; recommendation: string;
}

interface Stats { total: number; active: number; critical: number; resolved: number; }
interface DCStats { total: number; retire: number; review: number; keep: number; }

type ReportType = 'monthly' | 'migration' | 'roi' | 'executive' | null;

export default function ReportsPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertStats, setAlertStats] = useState<Stats | null>(null);
  const [deadCode, setDeadCode] = useState<DeadCodeEntry[]>([]);
  const [dcStats, setDcStats] = useState<DCStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<ReportType>(null);

  useEffect(() => {
    Promise.all([getClients(), getAlertStats()])
      .then(([c, s]) => {
        const cls = Array.isArray(c) ? c : c.data || [];
        setClients(cls);
        setAlertStats(s);
        if (cls.length > 0) setSelectedClient(cls[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    setReportLoading(true);
    Promise.all([
      getAlerts({ clientId: selectedClient }),
      getDeadCode(selectedClient),
      getDeadCodeStats(selectedClient),
    ]).then(([a, dc, dcs]) => {
      setAlerts(Array.isArray(a) ? a : a.data || []);
      setDeadCode(Array.isArray(dc) ? dc : dc.data || []);
      setDcStats(dcs);
    }).catch(() => {})
    .finally(() => setReportLoading(false));
  }, [selectedClient]);

  const client = clients.find(c => c.id === selectedClient);
  const integrations = client?.integrations || [];
  const totalIntegrations = integrations.length;
  const activeIntegrations = integrations.filter(i => i.status === 'ACTIVE').length;
  const avgLatency = totalIntegrations > 0 ? Math.round(integrations.reduce((s, i) => s + i.latency, 0) / totalIntegrations) : 0;
  const avgErrorRate = totalIntegrations > 0 ? (integrations.reduce((s, i) => s + i.errorRate, 0) / totalIntegrations).toFixed(1) : '0';
  const avgUptime = totalIntegrations > 0 ? (integrations.reduce((s, i) => s + i.uptime, 0) / totalIntegrations).toFixed(1) : '0';
  const resolvedAlerts = alerts.filter(a => a.resolved).length;
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;

  // ROI calculations
  const hoursPerAlert = 2.5; // avg hours to diagnose without SAPLINK
  const hourlyRate = 300; // R$/h senior consultant
  const minutesWithSaplink = 15;
  const hoursSaved = resolvedAlerts * (hoursPerAlert - minutesWithSaplink / 60);
  const moneySaved = hoursSaved * hourlyRate;
  const preventedDowntime = resolvedAlerts * 1.5; // avg 1.5h downtime per incident

  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en-US';
  const now = new Date();
  const monthName = now.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const reportTypes = [
    { key: 'monthly' as ReportType, icon: '📊', title: t.monthlyTitle, desc: t.monthlyDesc },
    { key: 'migration' as ReportType, icon: '🚀', title: t.migrationTitle, desc: t.migrationDesc },
    { key: 'roi' as ReportType, icon: '💰', title: t.roiTitle, desc: t.roiDesc },
    { key: 'executive' as ReportType, icon: '📋', title: t.executiveTitle, desc: t.executiveDesc },
  ];

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm text-[#9b95ad] mt-1">{t.subtitle}</p>
      </div>

      {/* Client Selector */}
      <div className="flex items-center gap-4">
        <select value={selectedClient} onChange={(e) => { setSelectedClient(e.target.value); setActiveReport(null); }} className="px-4 py-2.5 bg-[#1a1527] border border-white/[0.08] rounded-lg text-[#e2e0ea] focus:outline-none focus:border-purple-500/50">
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {client && <span className="text-sm text-[#9b95ad]">{t.cnpjLabel} {client.cnpj || t.cnpjNotInformed}</span>}
      </div>

      {/* Report Type Selector */}
      {!activeReport && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reportTypes.map(r => (
            <button key={r.key} onClick={() => setActiveReport(r.key)} className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] hover:border-purple-500/30 hover:bg-[#231d35] transition text-left cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{r.icon}</span>
                <h3 className="text-lg font-semibold text-[#e2e0ea] group-hover:text-purple-400 transition">{r.title}</h3>
              </div>
              <p className="text-sm text-[#9b95ad]">{r.desc}</p>
              <span className="inline-block mt-3 text-xs text-purple-400 font-medium">{t.generateReport}</span>
            </button>
          ))}
        </div>
      )}

      {/* Back + Exportar PDF */}
      {activeReport && (
        <div className="flex items-center justify-between no-print">
          <button onClick={() => setActiveReport(null)} className="text-sm text-[#9b95ad] hover:text-white transition cursor-pointer">{t.back}</button>
          <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold">
            {t.exportPdf}
          </button>
        </div>
      )}

      {reportLoading && <div className="text-[#9b95ad]">{t.loadingData}</div>}

      {/* ===== RELATÓRIO MENSAL ===== */}
      {activeReport === 'monthly' && !reportLoading && client && (
        <div className="space-y-6" id="report-monthly">
          <div className="bg-[#1a1527] rounded-2xl border border-white/[0.08] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-500/20 p-8 border-b border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.monthlyHeading}</h2>
                  <p className="text-[#9b95ad] mt-1">{client.name} — {monthName}</p>
                </div>
                <HealthScoreRing score={client.healthScore} size={80} />
              </div>
            </div>

            {/* Health Score Detail */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">📊 {t.healthScoreSection}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-[#e2e0ea]">{client.healthScore}</p>
                  <p className="text-xs text-[#9b95ad] mt-1">{t.overallScore}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{avgUptime}%</p>
                  <p className="text-xs text-[#9b95ad] mt-1">{t.avgUptime}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-amber-400">{avgLatency}ms</p>
                  <p className="text-xs text-[#9b95ad] mt-1">{t.avgLatency}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-rose-400">{avgErrorRate}%</p>
                  <p className="text-xs text-[#9b95ad] mt-1">{t.errorRate}</p>
                </div>
              </div>
            </div>

            {/* Integrations */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">🔗 {t.integrationsSection(totalIntegrations)}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/[0.08]">
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colIntegration}</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colType}</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colStatus}</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colLatency}</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colError}</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colUptime}</th>
                  </tr></thead>
                  <tbody>
                    {integrations.map(i => (
                      <tr key={i.id} className="border-b border-white/[0.04]">
                        <td className="px-3 py-2 font-medium">{i.name}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded text-xs">{i.type}</span></td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${i.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : i.status === 'ERROR' ? 'bg-rose-500/20 text-rose-400' : 'bg-gray-500/20 text-gray-400'}`}>{i.status}</span></td>
                        <td className={`px-3 py-2 ${i.latency > 500 ? 'text-amber-400' : 'text-[#9b95ad]'}`}>{i.latency}ms</td>
                        <td className={`px-3 py-2 ${i.errorRate > 5 ? 'text-rose-400' : 'text-[#9b95ad]'}`}>{i.errorRate}%</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{i.uptime}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts Summary */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">🔔 {t.alertsSummarySection}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">{alerts.length}</p>
                  <p className="text-[10px] text-[#9b95ad]">{t.alertTotal}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-rose-400">{criticalAlerts}</p>
                  <p className="text-[10px] text-[#9b95ad]">{t.alertCritical}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-orange-400">{highAlerts}</p>
                  <p className="text-[10px] text-[#9b95ad]">{t.alertHigh}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{resolvedAlerts}</p>
                  <p className="text-[10px] text-[#9b95ad]">{t.alertResolved}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-amber-400">{unresolvedAlerts}</p>
                  <p className="text-[10px] text-[#9b95ad]">{t.alertPending}</p>
                </div>
              </div>
              {/* Recent alerts list */}
              <div className="mt-4 space-y-2">
                {alerts.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center gap-3 bg-[#0f0b1a] rounded-lg p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : a.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.severity}</span>
                    <span className="text-xs text-[#e2e0ea] flex-1">{a.message}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${a.resolved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.resolved ? t.resolved : t.pending}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusion */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-3">📝 {t.analysisSection}</h3>
              <div className="bg-[#0f0b1a] rounded-lg p-4 text-sm text-[#e2e0ea] leading-relaxed space-y-2">
                <p>{t.analysisScorePre}<strong>{client.name}</strong>{t.analysisScoreMid}<strong>{client.healthScore}/100</strong>{t.analysisScorePost}</p>
                <p>{t.analysisIntegrations(activeIntegrations, totalIntegrations, totalIntegrations > 0 ? Math.round(activeIntegrations/totalIntegrations*100) : 0)}</p>
                {Number(avgErrorRate) > 10 && <p className="text-amber-400">{t.analysisHighErrorRate(avgErrorRate)}</p>}
                {avgLatency > 500 && <p className="text-amber-400">{t.analysisHighLatency(avgLatency)}</p>}
                {unresolvedAlerts > 0 && <p className="text-rose-400">{t.analysisPendingAlerts(unresolvedAlerts)}</p>}
                {unresolvedAlerts === 0 && <p className="text-emerald-400">{t.analysisAllResolved}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RELATÓRIO DE MIGRAÇÃO ===== */}
      {activeReport === 'migration' && !reportLoading && client && (
        <div className="space-y-6">
          <div className="bg-[#1a1527] rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600/20 to-purple-500/20 p-8 border-b border-white/[0.08]">
              <h2 className="text-2xl font-bold text-white">{t.migrationHeading}</h2>
              <p className="text-[#9b95ad] mt-1">{client.name} — {t.generatedOn(now.toLocaleDateString(locale))}</p>
            </div>

            {/* Dead Code Overview */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">🔍 {t.deadCodeSection}</h3>
              {dcStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#0f0b1a] rounded-lg p-4 text-center"><p className="text-3xl font-bold">{dcStats.total}</p><p className="text-xs text-[#9b95ad] mt-1">{t.objectsAnalyzed}</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4 text-center"><p className="text-3xl font-bold text-rose-400">{dcStats.retire}</p><p className="text-xs text-[#9b95ad] mt-1">{t.toRetire}</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4 text-center"><p className="text-3xl font-bold text-amber-400">{dcStats.review}</p><p className="text-xs text-[#9b95ad] mt-1">{t.toReview}</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4 text-center"><p className="text-3xl font-bold text-emerald-400">{dcStats.keep}</p><p className="text-xs text-[#9b95ad] mt-1">{t.toKeep}</p></div>
                </div>
              )}

              {/* Dead code table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/[0.08]">
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colObject}</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colType}</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colLastUsed}</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colExecutions}</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">{t.colAction}</th>
                  </tr></thead>
                  <tbody>
                    {deadCode.map(dc => (
                      <tr key={dc.id} className="border-b border-white/[0.04]">
                        <td className="px-3 py-2 font-mono text-xs">{dc.objectName}</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{dc.objectType || dc.type}</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{dc.lastUsed ? new Date(dc.lastUsed).toLocaleDateString(locale) : t.never}</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{dc.usageCount}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${dc.recommendation === 'RETIRE' ? 'bg-rose-500/20 text-rose-400' : dc.recommendation === 'REVIEW' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{dc.recommendation}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Migration Risk */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">⚠️ {t.riskSection}</h3>
              <div className="space-y-3">
                <div className="bg-[#0f0b1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#e2e0ea]">{t.migrationComplexity}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${(dcStats?.total || 0) > 15 ? 'bg-rose-500/20 text-rose-400' : (dcStats?.total || 0) > 8 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {(dcStats?.total || 0) > 15 ? t.complexityHigh : (dcStats?.total || 0) > 8 ? t.complexityMedium : t.complexityLow}
                    </span>
                  </div>
                  <p className="text-xs text-[#9b95ad]">{t.complexityDesc(dcStats?.total || 0, dcStats?.retire || 0)}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#e2e0ea]">{t.envStability}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${client.healthScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : client.healthScore >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {client.healthScore >= 80 ? t.stable : client.healthScore >= 60 ? t.attention : t.unstable}
                    </span>
                  </div>
                  <p className="text-xs text-[#9b95ad]">{t.stabilityDesc(client.healthScore, client.healthScore < 80 ? t.stabilityStabilize : t.stabilityReady)}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#e2e0ea]">{t.effortEstimate}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">
                      {(dcStats?.total || 0) * 4}h — {(dcStats?.total || 0) * 8}h
                    </span>
                  </div>
                  <p className="text-xs text-[#9b95ad]">{t.effortDesc(dcStats?.total || 0)}</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">💡 {t.recommendationsSection}</h3>
              <div className="space-y-2">
                {[
                  { n: 1, text: t.rec1(dcStats?.retire || 0), priority: t.priorityHigh },
                  { n: 2, text: t.rec2(dcStats?.review || 0), priority: t.priorityHigh },
                  { n: 3, text: t.rec3(dcStats?.keep || 0), priority: t.priorityMedium },
                  { n: 4, text: t.rec4, priority: t.priorityMedium },
                  { n: 5, text: t.rec5, priority: t.priorityNormal },
                ].map(r => (
                  <div key={r.n} className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{r.n}</span>
                    <div className="flex-1">
                      <p className="text-sm text-[#e2e0ea]">{r.text}</p>
                      <span className="text-[10px] text-[#9b95ad]">{t.priorityLabel(r.priority)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RELATÓRIO DE ROI ===== */}
      {activeReport === 'roi' && !reportLoading && client && (
        <div className="space-y-6">
          <div className="bg-[#1a1527] rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600/20 to-cyan-500/20 p-8 border-b border-white/[0.08]">
              <h2 className="text-2xl font-bold text-white">{t.roiHeading}</h2>
              <p className="text-[#9b95ad] mt-1">{client.name} — {monthName}</p>
            </div>

            {/* ROI Numbers */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">💰 {t.roiSection}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-400">R$ {moneySaved.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-[#9b95ad] mt-1">{t.estimatedSavings}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-cyan-400">{hoursSaved.toFixed(0)}h</p>
                  <p className="text-xs text-[#9b95ad] mt-1">{t.hoursSaved}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-400">{resolvedAlerts}</p>
                  <p className="text-xs text-[#9b95ad] mt-1">{t.alertsResolved}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-amber-400">{preventedDowntime.toFixed(0)}h</p>
                  <p className="text-xs text-[#9b95ad] mt-1">{t.preventedDowntime}</p>
                </div>
              </div>
            </div>

            {/* How ROI is calculated */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">📐 {t.methodologySection}</h3>
              <div className="bg-[#0f0b1a] rounded-lg p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-[#9b95ad]">{t.methodDiagnosisWithout}</span>
                  <span className="font-semibold">{t.perIncidentHours(hoursPerAlert)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-[#9b95ad]">{t.methodDiagnosisWith}</span>
                  <span className="font-semibold text-emerald-400">{t.perIncidentMin(minutesWithSaplink)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-[#9b95ad]">{t.methodHourlyRate}</span>
                  <span className="font-semibold">{t.hourlyRateValue(hourlyRate)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-[#9b95ad]">{t.methodAlertsHandled}</span>
                  <span className="font-semibold">{resolvedAlerts}</span>
                </div>
                <div className="flex items-center justify-between py-2 bg-emerald-500/10 rounded-lg px-3">
                  <span className="font-semibold text-emerald-400">{t.totalSavings}</span>
                  <span className="font-bold text-emerald-400 text-lg">R$ {moneySaved.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">🎯 {t.benefitsSection}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: '⏱️', title: t.benefit1Title, desc: t.benefit1Desc(hoursPerAlert, minutesWithSaplink) },
                  { icon: '🔔', title: t.benefit2Title, desc: t.benefit2Desc },
                  { icon: '📊', title: t.benefit3Title, desc: t.benefit3Desc(totalIntegrations) },
                  { icon: '👥', title: t.benefit4Title, desc: t.benefit4Desc },
                  { icon: '📄', title: t.benefit5Title, desc: t.benefit5Desc },
                  { icon: '🚀', title: t.benefit6Title, desc: t.benefit6Desc(dcStats?.total || 0) },
                ].map(b => (
                  <div key={b.title} className="bg-[#0f0b1a] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{b.icon}</span>
                      <span className="text-sm font-semibold text-[#e2e0ea]">{b.title}</span>
                    </div>
                    <p className="text-xs text-[#9b95ad]">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RESUMO EXECUTIVO ===== */}
      {activeReport === 'executive' && !reportLoading && client && (
        <div className="space-y-6">
          <div className="bg-[#1a1527] rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600/20 to-rose-500/20 p-8 border-b border-white/[0.08]">
              <h2 className="text-2xl font-bold text-white">{t.executiveHeading}</h2>
              <p className="text-[#9b95ad] mt-1">{client.name} — {monthName}</p>
              <p className="text-xs text-[#9b95ad] mt-2">{t.executiveDocNote}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Situação geral */}
              <div>
                <h3 className="text-lg font-bold text-[#e2e0ea] mb-3">{t.execGeneralSituation}</h3>
                <div className="bg-[#0f0b1a] rounded-lg p-4 flex items-center gap-6">
                  <HealthScoreRing score={client.healthScore} size={100} />
                  <div className="text-sm text-[#e2e0ea] leading-relaxed">
                    <p>{t.execSituationPre}<strong>{client.name}</strong>{t.execSituationMid}<strong>{client.healthScore}/100</strong>{t.execSituationPost(monthName)}</p>
                    <p className="mt-2">{client.healthScore >= 80 ? t.execHealthy : client.healthScore >= 60 ? t.execNeedsAttention : t.execProblems}</p>
                  </div>
                </div>
              </div>

              {/* Números chave */}
              <div>
                <h3 className="text-lg font-bold text-[#e2e0ea] mb-3">{t.execKeyNumbers}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-[#e2e0ea]">{totalIntegrations}</p><p className="text-xs text-[#9b95ad]">{t.execMonitoredIntegrations}</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-emerald-400">{avgUptime}%</p><p className="text-xs text-[#9b95ad]">{t.execAvgAvailability}</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-purple-400">{resolvedAlerts}</p><p className="text-xs text-[#9b95ad]">{t.execResolvedIncidents}</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-cyan-400">{hoursSaved.toFixed(0)}h</p><p className="text-xs text-[#9b95ad]">{t.execHoursSaved}</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-emerald-400">R$ {moneySaved.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p><p className="text-xs text-[#9b95ad]">{t.execEstSavings}</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-amber-400">{preventedDowntime.toFixed(0)}h</p><p className="text-xs text-[#9b95ad]">{t.execPreventedDowntime}</p></div>
                </div>
              </div>

              {/* Ações realizadas */}
              <div>
                <h3 className="text-lg font-bold text-[#e2e0ea] mb-3">{t.execActionsTaken}</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3"><span className="text-emerald-400">✅</span><span className="text-sm text-[#e2e0ea]">{t.execAction1(totalIntegrations)}</span></div>
                  <div className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3"><span className="text-emerald-400">✅</span><span className="text-sm text-[#e2e0ea]">{t.execAction2(resolvedAlerts)}</span></div>
                  <div className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3"><span className="text-emerald-400">✅</span><span className="text-sm text-[#e2e0ea]">{t.execAction3}</span></div>
                  <div className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3"><span className="text-emerald-400">✅</span><span className="text-sm text-[#e2e0ea]">{t.execAction4(dcStats?.total || 0)}</span></div>
                </div>
              </div>

              {/* Próximos passos */}
              <div>
                <h3 className="text-lg font-bold text-[#e2e0ea] mb-3">{t.execNextSteps}</h3>
                <div className="space-y-2">
                  {[
                    unresolvedAlerts > 0 ? t.execNextResolve(unresolvedAlerts) : t.execNextMaintain,
                    Number(avgErrorRate) > 5 ? t.execNextReduceError : t.execNextErrorOk,
                    (dcStats?.retire || 0) > 0 ? t.execNextRetire(dcStats?.retire || 0) : t.execNextClean,
                    t.execNextReview,
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3">
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <span className="text-sm text-[#e2e0ea]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
