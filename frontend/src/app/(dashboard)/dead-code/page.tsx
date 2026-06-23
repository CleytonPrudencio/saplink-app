"use client";

import { useEffect, useState } from "react";
import { usePersistedState } from "@/lib/usePersistedState";
import { getClients, getDeadCode, getDeadCodeStats } from "@/lib/api";
import { usePaginate, Pagination } from "@/components/Pagination";
import DetailSheet from "@/components/DetailSheet";
import ExplainData from "@/components/ExplainData";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Client { id: string; name: string; }
interface DeadCodeEntry {
  id: string; objectName: string; objectType: string; type?: string;
  lastUsed: string | null; usageCount: number; recommendation: string;
}
interface DeadCodeStatsData { total: number; retire: number; review: number; keep: number; }

// Estilos visuais por recomendação (texto vem do dicionário i18n)
const recStyle: Record<string, { color: string; bgColor: string; borderColor: string; icon: string }> = {
  RETIRE: { color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20', icon: '🗑️' },
  REVIEW: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: '🔍' },
  KEEP: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', icon: '✅' },
};

export default function DeadCodePage() {
  const { lang } = useLang();
  const t = T[lang];
  // junta estilo visual + textos traduzidos
  const recInfo: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: string; title: string; description: string; action: string; risk: string }> = {
    RETIRE: { ...recStyle.RETIRE, ...t.rec.RETIRE },
    REVIEW: { ...recStyle.REVIEW, ...t.rec.REVIEW },
    KEEP: { ...recStyle.KEEP, ...t.rec.KEEP },
  };
  const typeDescriptions = t.typeDescriptions;
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [entries, setEntries] = useState<DeadCodeEntry[]>([]);
  const [stats, setStats] = useState<DeadCodeStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [sel, setSel] = useState<any>(null);
  const [filterRec, setFilterRec] = usePersistedState<string>("slk:dead-code:filterRec", "ALL");

  useEffect(() => {
    getClients()
      .then((data) => setClients(Array.isArray(data) ? data : data.data || []))
      .catch(() => setError(t.loadClientsError))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    setDataLoading(true);
    setError("");
    setSel(null);
    Promise.all([getDeadCode(selectedClient), getDeadCodeStats(selectedClient)])
      .then(([codeData, statsData]) => {
        setEntries(Array.isArray(codeData) ? codeData : codeData.data || []);
        setStats(statsData);
      })
      .catch(() => setError(t.loadDataError))
      .finally(() => setDataLoading(false));
  }, [selectedClient]);

  const filtered = filterRec === "ALL" ? entries : entries.filter(e => e.recommendation?.toUpperCase() === filterRec);
  const pag = usePaginate<any>(filtered, 15);

  function getType(entry: DeadCodeEntry) { return entry.objectType || entry.type || 'PROGRAM'; }

  function daysSinceLastUse(lastUsed: string | null): string {
    if (!lastUsed) return t.neverUsed;
    const days = Math.floor((Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24));
    if (days > 365) return t.yearsNoUse(Math.floor(days / 365));
    if (days > 30) return t.monthsNoUse(Math.floor(days / 30));
    return t.daysNoUse(days);
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm text-[#9b95ad] mt-1">{t.subtitle}</p>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">{error}</div>}

      {/* Client Selector */}
      <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="px-4 py-2.5 bg-[#1a1527] border border-white/[0.08] rounded-lg text-[#e2e0ea] focus:outline-none focus:border-purple-500/50">
        <option value="">{t.selectClient}</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {dataLoading && <div className="text-[#9b95ad]">{t.loading}</div>}

      {/* Stats */}
      {stats && !dataLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: t.statTotal, value: stats.total, color: 'text-[#e2e0ea]', sub: t.statTotalSub },
            { label: t.statRetire, value: stats.retire, color: 'text-rose-400', sub: t.statRetireSub },
            { label: t.statReview, value: stats.review, color: 'text-amber-400', sub: t.statReviewSub },
            { label: t.statKeep, value: stats.keep, color: 'text-emerald-400', sub: t.statKeepSub },
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
            { key: 'ALL', label: t.filterAll },
            { key: 'RETIRE', label: t.filterRetire, color: 'text-rose-400' },
            { key: 'REVIEW', label: t.filterReview, color: 'text-amber-400' },
            { key: 'KEEP', label: t.filterKeep, color: 'text-emerald-400' },
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
          {pag.pageItems.map((entry: any) => {
            const rec = recInfo[entry.recommendation?.toUpperCase()] || recInfo.RETIRE;
            const type = getType(entry);
            return (
              <div
                key={entry.id}
                onClick={() => setSel(entry)}
                className="bg-[#1a1527] rounded-xl border border-white/[0.08] overflow-hidden cursor-pointer hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-full p-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${rec.bgColor} ${rec.color}`}>{rec.label}</span>
                      <span className="font-mono font-medium text-sm text-[#e2e0ea] break-all">{entry.objectName}</span>
                      <span className="px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded text-[10px] font-medium uppercase">{type}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 pl-1">
                      <span className="text-xs text-[#9b95ad]">{daysSinceLastUse(entry.lastUsed)}</span>
                      <span className="text-xs text-[#9b95ad] whitespace-nowrap">{entry.usageCount} {t.execShort}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <Pagination {...pag} />
        </div>
      )}

      {selectedClient && !dataLoading && entries.length === 0 && (
        <p className="text-[#9b95ad] text-sm">{t.noDeadCode}</p>
      )}

      {/* Legend */}
      {selectedClient && !dataLoading && entries.length > 0 && (
        <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
          <h3 className="text-sm font-semibold text-[#e2e0ea] mb-3">{t.legendTitle}</h3>
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

      {sel && (() => {
        const rec = recInfo[sel.recommendation?.toUpperCase()] || recInfo.RETIRE;
        const type = getType(sel);
        return (
          <DetailSheet
            open={!!sel}
            onClose={() => setSel(null)}
            icon={rec.icon}
            title={sel.objectName}
            subtitle={`${type} — ${typeDescriptions[type] || t.customAbapObject}`}
            badge={<span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${rec.bgColor} ${rec.color}`}>{rec.label}</span>}
            fields={[
              { label: t.fieldName, value: <span className="font-mono">{sel.objectName}</span> },
              { label: t.fieldType, value: `${type} — ${typeDescriptions[type] || t.customAbapObject}` },
              { label: t.fieldLastUse, value: sel.lastUsed ? new Date(sel.lastUsed).toLocaleDateString(lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es' : 'en-US') : t.neverExecuted },
              { label: t.fieldExecutions, value: t.executionsUnit(sel.usageCount) },
              { label: t.fieldInactivity, value: daysSinceLastUse(sel.lastUsed) },
              { label: t.recommendationTitle, value: rec.title },
              { label: t.suggestedActionTitle, value: rec.action },
              { label: t.riskTitle, value: rec.risk },
            ]}
            guideTitle={t.sheetGuideTitle}
            guideSteps={t.sheetSteps}
            guideTx="SE24 / SE37 / SE80 · $TMP"
            actions={
              <>
                <a href={`/diagnostics?clientId=${selectedClient}`} className="px-4 py-2 rounded-lg bg-purple-500/15 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition">
                  {t.analyzeWithAi}
                </a>
                <button onClick={() => navigator.clipboard?.writeText(sel.objectName)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/[0.08] text-[#9b95ad] text-xs font-medium hover:text-white transition cursor-pointer">
                  {t.copyObjectName}
                </button>
              </>
            }
          >
            <ExplainData screen="Dead Code Scanner — item" data={{ objectName: sel.objectName, type, lastUsed: sel.lastUsed, usageCount: sel.usageCount, recommendation: sel.recommendation }} />
          </DetailSheet>
        );
      })()}
    </div>
  );
}
