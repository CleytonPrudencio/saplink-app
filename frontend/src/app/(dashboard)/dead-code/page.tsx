"use client";

import { useEffect, useState } from "react";
import { getClients, getDeadCode, getDeadCodeStats } from "@/lib/api";

interface Client { id: string; name: string; }
interface DeadCodeEntry {
  id: string; objectName: string; objectType: string; type?: string;
  lastUsed: string | null; usageCount: number; recommendation: string;
}
interface DeadCodeStatsData { total: number; retire: number; review: number; keep: number; }

const recInfo: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: string; title: string; description: string; action: string; risk: string }> = {
  RETIRE: {
    label: 'APOSENTAR', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20',
    icon: '🗑️', title: 'Recomendado aposentar',
    description: 'Este objeto não é utilizado há muito tempo ou nunca foi executado em produção. Mantê-lo aumenta a complexidade do sistema e dificulta manutenção e migração.',
    action: 'Mover para pacote de objetos inativos ($TMP) ou deletar após backup. Validar com equipe funcional antes de remover.',
    risk: 'Risco baixo — objeto sem uso. Faça backup antes de remover por segurança.',
  },
  REVIEW: {
    label: 'REVISAR', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20',
    icon: '🔍', title: 'Recomendado revisar',
    description: 'Este objeto tem uso esporádico ou foi utilizado recentemente mas com baixa frequência. Pode estar sendo chamado por jobs noturnos ou processos pontuais.',
    action: 'Investigar quem chama este objeto (SE24/SE37 → Where-Used). Se confirmado que é necessário, reclassificar como MANTER.',
    risk: 'Risco médio — pode estar em uso por processos não óbvios. Não remover sem análise.',
  },
  KEEP: {
    label: 'MANTER', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20',
    icon: '✅', title: 'Manter em produção',
    description: 'Este objeto é utilizado ativamente em produção. Faz parte dos processos operacionais do cliente e deve ser mantido.',
    action: 'Nenhuma ação necessária. Documentar e incluir no escopo de testes de migração S/4HANA.',
    risk: 'Sem risco — objeto ativo e necessário.',
  },
};

const typeDescriptions: Record<string, string> = {
  PROGRAM: 'Programa ABAP (report ou module pool)',
  FUNCTION: 'Function Module (RFC ou local)',
  CLASS: 'Classe ABAP (OO)',
  INCLUDE: 'Include de código compartilhado',
  FORM: 'Form routine (subrotina)',
  ENHANCEMENT: 'Enhancement / User Exit',
};

export default function DeadCodePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [entries, setEntries] = useState<DeadCodeEntry[]>([]);
  const [stats, setStats] = useState<DeadCodeStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterRec, setFilterRec] = useState<string>("ALL");

  useEffect(() => {
    getClients()
      .then((data) => setClients(Array.isArray(data) ? data : data.data || []))
      .catch(() => setError("Erro ao carregar clientes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    setDataLoading(true);
    setError("");
    setExpandedId(null);
    Promise.all([getDeadCode(selectedClient), getDeadCodeStats(selectedClient)])
      .then(([codeData, statsData]) => {
        setEntries(Array.isArray(codeData) ? codeData : codeData.data || []);
        setStats(statsData);
      })
      .catch(() => setError("Erro ao carregar dados."))
      .finally(() => setDataLoading(false));
  }, [selectedClient]);

  const filtered = filterRec === "ALL" ? entries : entries.filter(e => e.recommendation?.toUpperCase() === filterRec);

  function getType(entry: DeadCodeEntry) { return entry.objectType || entry.type || 'PROGRAM'; }

  function daysSinceLastUse(lastUsed: string | null): string {
    if (!lastUsed) return 'Nunca utilizado';
    const days = Math.floor((Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24));
    if (days > 365) return `${Math.floor(days / 365)} anos sem uso`;
    if (days > 30) return `${Math.floor(days / 30)} meses sem uso`;
    return `${days} dias sem uso`;
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dead Code Scanner</h1>
        <p className="text-sm text-[#9b95ad] mt-1">Identifique objetos ABAP inativos para limpeza e migração S/4HANA</p>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">{error}</div>}

      {/* Client Selector */}
      <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="px-4 py-2.5 bg-[#1a1527] border border-white/[0.08] rounded-lg text-[#e2e0ea] focus:outline-none focus:border-purple-500/50">
        <option value="">Selecione um cliente</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {dataLoading && <div className="text-[#9b95ad]">Carregando...</div>}

      {/* Stats */}
      {stats && !dataLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total de Objetos', value: stats.total, color: 'text-[#e2e0ea]', sub: 'Analisados neste cliente' },
            { label: 'Aposentar', value: stats.retire, color: 'text-rose-400', sub: 'Sem uso — podem ser removidos' },
            { label: 'Revisar', value: stats.review, color: 'text-amber-400', sub: 'Uso esporádico — investigar' },
            { label: 'Manter', value: stats.keep, color: 'text-emerald-400', sub: 'Em uso ativo — não remover' },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]">
              <p className="text-xs text-[#9b95ad] uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-[#9b95ad] mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      {selectedClient && !dataLoading && entries.length > 0 && (
        <div className="flex gap-2">
          {[
            { key: 'ALL', label: 'Todos' },
            { key: 'RETIRE', label: '🗑️ Aposentar', color: 'text-rose-400' },
            { key: 'REVIEW', label: '🔍 Revisar', color: 'text-amber-400' },
            { key: 'KEEP', label: '✅ Manter', color: 'text-emerald-400' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilterRec(f.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${filterRec === f.key ? 'bg-purple-500/20 text-purple-400' : 'bg-[#1a1527] text-[#9b95ad] hover:text-white border border-white/[0.08]'}`}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Entries */}
      {selectedClient && !dataLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const rec = recInfo[entry.recommendation?.toUpperCase()] || recInfo.RETIRE;
            const type = getType(entry);
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className={`bg-[#1a1527] rounded-xl border overflow-hidden transition-all ${isExpanded ? rec.borderColor : 'border-white/[0.08]'}`}>
                {/* Row header — clickable */}
                <button onClick={() => setExpandedId(isExpanded ? null : entry.id)} className="w-full p-4 text-left hover:bg-[#231d35] transition cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${rec.bgColor} ${rec.color}`}>{rec.label}</span>
                      <span className="font-mono font-medium text-sm text-[#e2e0ea]">{entry.objectName}</span>
                      <span className="px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded text-[10px] font-medium uppercase">{type}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#9b95ad]">{daysSinceLastUse(entry.lastUsed)}</span>
                      <span className="text-xs text-[#9b95ad]">{entry.usageCount} exec.</span>
                      <span className="text-[#9b95ad]">{isExpanded ? '−' : '+'}</span>
                    </div>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/[0.05]">
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      {/* Info do objeto */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-[#9b95ad] uppercase tracking-wider mb-2">Detalhes do Objeto</h4>
                          <div className="bg-[#0f0b1a] rounded-lg p-4 space-y-2">
                            <div className="flex justify-between"><span className="text-xs text-[#9b95ad]">Nome</span><span className="text-sm font-mono text-[#e2e0ea]">{entry.objectName}</span></div>
                            <div className="flex justify-between"><span className="text-xs text-[#9b95ad]">Tipo</span><span className="text-sm text-[#e2e0ea]">{type} — {typeDescriptions[type] || 'Objeto ABAP customizado'}</span></div>
                            <div className="flex justify-between"><span className="text-xs text-[#9b95ad]">Último uso</span><span className="text-sm text-[#e2e0ea]">{entry.lastUsed ? new Date(entry.lastUsed).toLocaleDateString('pt-BR') : 'Nunca executado'}</span></div>
                            <div className="flex justify-between"><span className="text-xs text-[#9b95ad]">Execuções</span><span className="text-sm text-[#e2e0ea]">{entry.usageCount} vezes</span></div>
                            <div className="flex justify-between"><span className="text-xs text-[#9b95ad]">Inatividade</span><span className="text-sm text-[#e2e0ea]">{daysSinceLastUse(entry.lastUsed)}</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Recomendação */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-[#9b95ad] uppercase tracking-wider mb-2">Recomendação</h4>
                          <div className={`rounded-lg p-4 ${rec.bgColor} border ${rec.borderColor}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{rec.icon}</span>
                              <span className={`text-sm font-semibold ${rec.color}`}>{rec.title}</span>
                            </div>
                            <p className="text-xs text-[#9b95ad] leading-relaxed">{rec.description}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#9b95ad] uppercase tracking-wider mb-2">Ação Sugerida</h4>
                          <div className="bg-[#0f0b1a] rounded-lg p-4">
                            <p className="text-xs text-[#e2e0ea] leading-relaxed">💡 {rec.action}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-[#9b95ad] uppercase tracking-wider mb-2">Risco</h4>
                          <div className="bg-[#0f0b1a] rounded-lg p-4">
                            <p className="text-xs text-[#9b95ad] leading-relaxed">⚖️ {rec.risk}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-4 pt-4 border-t border-white/[0.05]">
                      <a href={`/diagnostics?clientId=${selectedClient}`} className="px-4 py-2 rounded-lg bg-purple-500/15 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition">
                        🤖 Analisar com IA
                      </a>
                      <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/[0.08] text-[#9b95ad] text-xs font-medium hover:text-white transition cursor-pointer">
                        📋 Copiar nome do objeto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selectedClient && !dataLoading && entries.length === 0 && (
        <p className="text-[#9b95ad] text-sm">Nenhum dead code encontrado para este cliente.</p>
      )}

      {/* Legend */}
      {selectedClient && !dataLoading && entries.length > 0 && (
        <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
          <h3 className="text-sm font-semibold text-[#e2e0ea] mb-3">📖 Legenda das Recomendações</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.values(recInfo).map(r => (
              <div key={r.label} className={`rounded-lg p-3 ${r.bgColor} border ${r.borderColor}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span>{r.icon}</span>
                  <span className={`text-sm font-semibold ${r.color}`}>{r.label}</span>
                </div>
                <p className="text-[10px] text-[#9b95ad] leading-relaxed">{r.description.split('.')[0]}.</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
