"use client";

import { useEffect, useState } from "react";
import { getClients, getAlerts, getAlertStats, getDeadCode, getDeadCodeStats } from "@/lib/api";
import HealthScoreRing from "@/components/HealthScoreRing";

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

  const now = new Date();
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const reportTypes = [
    { key: 'monthly' as ReportType, icon: '📊', title: 'Relatório Mensal', desc: 'Visão geral da saúde das integrações, alertas e métricas de performance do mês.' },
    { key: 'migration' as ReportType, icon: '🚀', title: 'Análise de Migração S/4HANA', desc: 'Relatório completo de dead code, customizações e riscos para migração.' },
    { key: 'roi' as ReportType, icon: '💰', title: 'Relatório de ROI', desc: 'Retorno sobre investimento: tempo economizado, alertas prevenidos e economia.' },
    { key: 'executive' as ReportType, icon: '📋', title: 'Resumo Executivo', desc: 'Resumo de alto nível para apresentar ao cliente final.' },
  ];

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-[#9b95ad] mt-1">Gere relatórios detalhados para seus clientes com a marca da sua consultoria</p>
      </div>

      {/* Client Selector */}
      <div className="flex items-center gap-4">
        <select value={selectedClient} onChange={(e) => { setSelectedClient(e.target.value); setActiveReport(null); }} className="px-4 py-2.5 bg-[#1a1527] border border-white/[0.08] rounded-lg text-[#e2e0ea] focus:outline-none focus:border-purple-500/50">
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {client && <span className="text-sm text-[#9b95ad]">CNPJ: {client.cnpj || 'Não informado'}</span>}
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
              <span className="inline-block mt-3 text-xs text-purple-400 font-medium">Gerar relatório →</span>
            </button>
          ))}
        </div>
      )}

      {/* Back button */}
      {activeReport && (
        <button onClick={() => setActiveReport(null)} className="text-sm text-[#9b95ad] hover:text-white transition cursor-pointer">← Voltar aos relatórios</button>
      )}

      {reportLoading && <div className="text-[#9b95ad]">Carregando dados...</div>}

      {/* ===== RELATÓRIO MENSAL ===== */}
      {activeReport === 'monthly' && !reportLoading && client && (
        <div className="space-y-6" id="report-monthly">
          <div className="bg-[#1a1527] rounded-2xl border border-white/[0.08] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-500/20 p-8 border-b border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Relatório Mensal de Integrações</h2>
                  <p className="text-[#9b95ad] mt-1">{client.name} — {monthName}</p>
                </div>
                <HealthScoreRing score={client.healthScore} size={80} />
              </div>
            </div>

            {/* Health Score Detail */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">📊 Health Score</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-[#e2e0ea]">{client.healthScore}</p>
                  <p className="text-xs text-[#9b95ad] mt-1">Score Geral</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{avgUptime}%</p>
                  <p className="text-xs text-[#9b95ad] mt-1">Uptime Médio</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-amber-400">{avgLatency}ms</p>
                  <p className="text-xs text-[#9b95ad] mt-1">Latência Média</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-rose-400">{avgErrorRate}%</p>
                  <p className="text-xs text-[#9b95ad] mt-1">Taxa de Erro</p>
                </div>
              </div>
            </div>

            {/* Integrations */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">🔗 Integrações ({totalIntegrations})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/[0.08]">
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Integração</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Tipo</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Status</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Latência</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Erro</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Uptime</th>
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
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">🔔 Resumo de Alertas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold">{alerts.length}</p>
                  <p className="text-[10px] text-[#9b95ad]">Total</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-rose-400">{criticalAlerts}</p>
                  <p className="text-[10px] text-[#9b95ad]">Críticos</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-orange-400">{highAlerts}</p>
                  <p className="text-[10px] text-[#9b95ad]">Altos</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{resolvedAlerts}</p>
                  <p className="text-[10px] text-[#9b95ad]">Resolvidos</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-amber-400">{unresolvedAlerts}</p>
                  <p className="text-[10px] text-[#9b95ad]">Pendentes</p>
                </div>
              </div>
              {/* Recent alerts list */}
              <div className="mt-4 space-y-2">
                {alerts.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center gap-3 bg-[#0f0b1a] rounded-lg p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${a.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : a.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.severity}</span>
                    <span className="text-xs text-[#e2e0ea] flex-1">{a.message}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${a.resolved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.resolved ? 'Resolvido' : 'Pendente'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusion */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-3">📝 Análise</h3>
              <div className="bg-[#0f0b1a] rounded-lg p-4 text-sm text-[#e2e0ea] leading-relaxed space-y-2">
                <p>O ambiente do cliente <strong>{client.name}</strong> apresenta Health Score de <strong>{client.healthScore}/100</strong> neste período.</p>
                <p>Das {totalIntegrations} integrações monitoradas, {activeIntegrations} estão ativas ({totalIntegrations > 0 ? Math.round(activeIntegrations/totalIntegrations*100) : 0}% de disponibilidade).</p>
                {Number(avgErrorRate) > 10 && <p className="text-amber-400">⚠️ A taxa de erro média ({avgErrorRate}%) está acima do recomendado (5%). Investigação necessária.</p>}
                {avgLatency > 500 && <p className="text-amber-400">⚠️ A latência média ({avgLatency}ms) está elevada. Recomendado verificar infraestrutura.</p>}
                {unresolvedAlerts > 0 && <p className="text-rose-400">🔴 Existem {unresolvedAlerts} alertas pendentes que requerem atenção.</p>}
                {unresolvedAlerts === 0 && <p className="text-emerald-400">✅ Todos os alertas foram resolvidos neste período.</p>}
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
              <h2 className="text-2xl font-bold text-white">Análise de Migração S/4HANA</h2>
              <p className="text-[#9b95ad] mt-1">{client.name} — Gerado em {now.toLocaleDateString('pt-BR')}</p>
            </div>

            {/* Dead Code Overview */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">🔍 Análise de Dead Code</h3>
              {dcStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#0f0b1a] rounded-lg p-4 text-center"><p className="text-3xl font-bold">{dcStats.total}</p><p className="text-xs text-[#9b95ad] mt-1">Objetos Analisados</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4 text-center"><p className="text-3xl font-bold text-rose-400">{dcStats.retire}</p><p className="text-xs text-[#9b95ad] mt-1">Para Aposentar</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4 text-center"><p className="text-3xl font-bold text-amber-400">{dcStats.review}</p><p className="text-xs text-[#9b95ad] mt-1">Para Revisar</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4 text-center"><p className="text-3xl font-bold text-emerald-400">{dcStats.keep}</p><p className="text-xs text-[#9b95ad] mt-1">Para Manter</p></div>
                </div>
              )}

              {/* Dead code table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/[0.08]">
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Objeto</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Tipo</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Último Uso</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Execuções</th>
                    <th className="text-left px-3 py-2 text-[#9b95ad]">Ação</th>
                  </tr></thead>
                  <tbody>
                    {deadCode.map(dc => (
                      <tr key={dc.id} className="border-b border-white/[0.04]">
                        <td className="px-3 py-2 font-mono text-xs">{dc.objectName}</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{dc.objectType || dc.type}</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{dc.lastUsed ? new Date(dc.lastUsed).toLocaleDateString('pt-BR') : 'Nunca'}</td>
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
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">⚠️ Avaliação de Risco</h3>
              <div className="space-y-3">
                <div className="bg-[#0f0b1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#e2e0ea]">Complexidade da Migração</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${(dcStats?.total || 0) > 15 ? 'bg-rose-500/20 text-rose-400' : (dcStats?.total || 0) > 8 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {(dcStats?.total || 0) > 15 ? 'ALTA' : (dcStats?.total || 0) > 8 ? 'MÉDIA' : 'BAIXA'}
                    </span>
                  </div>
                  <p className="text-xs text-[#9b95ad]">{dcStats?.total || 0} objetos customizados identificados. {dcStats?.retire || 0} podem ser removidos antes da migração.</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#e2e0ea]">Estabilidade do Ambiente</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${client.healthScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : client.healthScore >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {client.healthScore >= 80 ? 'ESTÁVEL' : client.healthScore >= 60 ? 'ATENÇÃO' : 'INSTÁVEL'}
                    </span>
                  </div>
                  <p className="text-xs text-[#9b95ad]">Health Score atual: {client.healthScore}/100. {client.healthScore < 80 ? 'Recomendado estabilizar antes de iniciar migração.' : 'Ambiente pronto para iniciar migração.'}</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#e2e0ea]">Estimativa de Esforço</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400">
                      {(dcStats?.total || 0) * 4}h — {(dcStats?.total || 0) * 8}h
                    </span>
                  </div>
                  <p className="text-xs text-[#9b95ad]">Baseado em {dcStats?.total || 0} objetos × 4-8h por objeto (análise, teste, migração).</p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">💡 Recomendações</h3>
              <div className="space-y-2">
                {[
                  { n: 1, text: `Remover ${dcStats?.retire || 0} objetos classificados como APOSENTAR antes de iniciar a migração`, priority: 'Alta' },
                  { n: 2, text: `Revisar ${dcStats?.review || 0} objetos com uso esporádico — confirmar necessidade com equipe funcional`, priority: 'Alta' },
                  { n: 3, text: `Documentar ${dcStats?.keep || 0} objetos ativos para inclusão no escopo de testes`, priority: 'Média' },
                  { n: 4, text: 'Criar ambiente sandbox S/4HANA para testes de compatibilidade', priority: 'Média' },
                  { n: 5, text: 'Definir janela de migração com mínimo impacto operacional', priority: 'Normal' },
                ].map(r => (
                  <div key={r.n} className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{r.n}</span>
                    <div className="flex-1">
                      <p className="text-sm text-[#e2e0ea]">{r.text}</p>
                      <span className="text-[10px] text-[#9b95ad]">Prioridade: {r.priority}</span>
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
              <h2 className="text-2xl font-bold text-white">Relatório de ROI — SAPLINK</h2>
              <p className="text-[#9b95ad] mt-1">{client.name} — {monthName}</p>
            </div>

            {/* ROI Numbers */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">💰 Retorno sobre Investimento</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-400">R$ {moneySaved.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-[#9b95ad] mt-1">Economia Estimada</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-cyan-400">{hoursSaved.toFixed(0)}h</p>
                  <p className="text-xs text-[#9b95ad] mt-1">Horas Economizadas</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-400">{resolvedAlerts}</p>
                  <p className="text-xs text-[#9b95ad] mt-1">Alertas Resolvidos</p>
                </div>
                <div className="bg-[#0f0b1a] rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-amber-400">{preventedDowntime.toFixed(0)}h</p>
                  <p className="text-xs text-[#9b95ad] mt-1">Downtime Prevenido</p>
                </div>
              </div>
            </div>

            {/* How ROI is calculated */}
            <div className="p-6 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">📐 Metodologia de Cálculo</h3>
              <div className="bg-[#0f0b1a] rounded-lg p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-[#9b95ad]">Tempo médio de diagnóstico sem SAPLINK</span>
                  <span className="font-semibold">{hoursPerAlert}h por incidente</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-[#9b95ad]">Tempo médio com SAPLINK (IA + alertas)</span>
                  <span className="font-semibold text-emerald-400">{minutesWithSaplink} min por incidente</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-[#9b95ad]">Custo/hora consultor sênior</span>
                  <span className="font-semibold">R$ {hourlyRate}/h</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                  <span className="text-[#9b95ad]">Alertas tratados no período</span>
                  <span className="font-semibold">{resolvedAlerts}</span>
                </div>
                <div className="flex items-center justify-between py-2 bg-emerald-500/10 rounded-lg px-3">
                  <span className="font-semibold text-emerald-400">Economia total</span>
                  <span className="font-bold text-emerald-400 text-lg">R$ {moneySaved.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-[#9b95ad] uppercase tracking-wider mb-4">🎯 Benefícios Tangíveis</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: '⏱️', title: 'Diagnóstico 90% mais rápido', desc: `De ${hoursPerAlert}h para ${minutesWithSaplink}min com IA` },
                  { icon: '🔔', title: 'Alertas proativos', desc: 'Problemas detectados antes do cliente perceber' },
                  { icon: '📊', title: 'Visibilidade total', desc: `${totalIntegrations} integrações monitoradas 24/7` },
                  { icon: '👥', title: 'Escalabilidade da equipe', desc: 'Júnior resolve o que só sênior resolvia' },
                  { icon: '📄', title: 'Prova de valor mensal', desc: 'Relatórios com ROI visível para renovação' },
                  { icon: '🚀', title: 'Migração acelerada', desc: `${dcStats?.total || 0} objetos mapeados para S/4HANA` },
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
              <h2 className="text-2xl font-bold text-white">Resumo Executivo</h2>
              <p className="text-[#9b95ad] mt-1">{client.name} — {monthName}</p>
              <p className="text-xs text-[#9b95ad] mt-2">Documento para apresentação ao cliente final</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Situação geral */}
              <div>
                <h3 className="text-lg font-bold text-[#e2e0ea] mb-3">1. Situação Geral</h3>
                <div className="bg-[#0f0b1a] rounded-lg p-4 flex items-center gap-6">
                  <HealthScoreRing score={client.healthScore} size={100} />
                  <div className="text-sm text-[#e2e0ea] leading-relaxed">
                    <p>O ambiente SAP do <strong>{client.name}</strong> apresenta nota <strong>{client.healthScore}/100</strong> no mês de {monthName}.</p>
                    <p className="mt-2">{client.healthScore >= 80 ? '✅ O ambiente está saudável e estável.' : client.healthScore >= 60 ? '⚠️ O ambiente requer atenção em alguns pontos.' : '🔴 O ambiente apresenta problemas que necessitam ação imediata.'}</p>
                  </div>
                </div>
              </div>

              {/* Números chave */}
              <div>
                <h3 className="text-lg font-bold text-[#e2e0ea] mb-3">2. Números Chave</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-[#e2e0ea]">{totalIntegrations}</p><p className="text-xs text-[#9b95ad]">Integrações monitoradas</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-emerald-400">{avgUptime}%</p><p className="text-xs text-[#9b95ad]">Disponibilidade média</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-purple-400">{resolvedAlerts}</p><p className="text-xs text-[#9b95ad]">Incidentes resolvidos</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-cyan-400">{hoursSaved.toFixed(0)}h</p><p className="text-xs text-[#9b95ad]">Horas economizadas</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-emerald-400">R$ {moneySaved.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p><p className="text-xs text-[#9b95ad]">Economia estimada</p></div>
                  <div className="bg-[#0f0b1a] rounded-lg p-4"><p className="text-2xl font-bold text-amber-400">{preventedDowntime.toFixed(0)}h</p><p className="text-xs text-[#9b95ad]">Downtime prevenido</p></div>
                </div>
              </div>

              {/* Ações realizadas */}
              <div>
                <h3 className="text-lg font-bold text-[#e2e0ea] mb-3">3. Ações Realizadas</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3"><span className="text-emerald-400">✅</span><span className="text-sm text-[#e2e0ea]">Monitoramento contínuo de {totalIntegrations} integrações com coleta a cada 30 segundos</span></div>
                  <div className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3"><span className="text-emerald-400">✅</span><span className="text-sm text-[#e2e0ea]">{resolvedAlerts} alertas identificados e resolvidos proativamente</span></div>
                  <div className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3"><span className="text-emerald-400">✅</span><span className="text-sm text-[#e2e0ea]">Diagnósticos com IA para resolução acelerada de problemas</span></div>
                  <div className="flex items-start gap-3 bg-[#0f0b1a] rounded-lg p-3"><span className="text-emerald-400">✅</span><span className="text-sm text-[#e2e0ea]">Análise de {dcStats?.total || 0} objetos customizados para preparação de migração</span></div>
                </div>
              </div>

              {/* Próximos passos */}
              <div>
                <h3 className="text-lg font-bold text-[#e2e0ea] mb-3">4. Próximos Passos</h3>
                <div className="space-y-2">
                  {[
                    unresolvedAlerts > 0 ? `Resolver ${unresolvedAlerts} alertas pendentes` : 'Manter monitoramento contínuo',
                    Number(avgErrorRate) > 5 ? 'Investigar e reduzir taxa de erro das integrações' : 'Manter taxa de erro dentro do aceitável',
                    (dcStats?.retire || 0) > 0 ? `Iniciar remoção de ${dcStats?.retire} objetos inativos` : 'Ambiente limpo — pronto para próxima fase',
                    'Agendar revisão mensal com equipe técnica',
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
