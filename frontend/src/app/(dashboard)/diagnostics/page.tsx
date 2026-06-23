"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getClients,
  getPresets,
  createDiagnostic,
  getDiagnosticHistory,
  getDiagnostic,
  diagnoseIntegration,
  autoFixIntegration,
} from "@/lib/api";
import { AiReport } from "@/components/AiReport";
import Loading from "@/components/Loading";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface FixChange { field: string; label: string; from: string; to: string }
interface SapNoteHint {
  area: string; component: string; why: string; transactions: string[]; searchTerms: string; searchUrl: string;
}
interface IntegrationDiagnosis {
  integration: { id: string; name: string; type: string; status: string };
  problem: string;
  rootCause: string;
  recommendation: string;
  steps: string[];
  probe: { ok: boolean; httpStatus: number | null; latencyMs: number } | null;
  autoFix:
    | { available: false; reason: string }
    | { available: true; kind: string; summary: string; changes: FixChange[]; alternatives?: string[] };
  sapNotes?: SapNoteHint[];
}
interface FixResult {
  applied: boolean;
  changes: FixChange[];
  summary: string;
  recovered: boolean;
  before: { status: string; uptime: number; errorRate: number; latency: number | null };
  after: { status: string; uptime: number; errorRate: number; latency: number | null };
}

interface Client {
  id: string;
  name: string;
}

interface Preset {
  id: string | number;
  name?: string;
  description?: string;
  query: string;
}

interface DiagnosticEntry {
  id: string;
  query: string;
  response: string;
  createdAt: string;
}

function DiagnosticsContent() {
  const { lang } = useLang();
  const t = T[lang];
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get("clientId") || "";
  const integrationId = searchParams.get("integrationId") || "";
  const autoMode = searchParams.get("auto") === "1";

  const [clients, setClients] = useState<Client[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedClient, setSelectedClient] = useState(initialClientId);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<DiagnosticEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // Auto-diagnóstico de integração em erro (vindo do card "Diagnosticar com IA")
  const [intDiag, setIntDiag] = useState<IntegrationDiagnosis | null>(null);
  const [intDiagLoading, setIntDiagLoading] = useState(false);
  const [intDiagError, setIntDiagError] = useState("");
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);

  async function runIntegrationDiagnosis() {
    if (!integrationId) return;
    setIntDiagLoading(true);
    setIntDiagError("");
    setFixResult(null);
    try {
      setIntDiag(await diagnoseIntegration(integrationId));
    } catch (e: any) {
      setIntDiagError(e?.response?.data?.error || t.errCannotDiagnose);
    } finally {
      setIntDiagLoading(false);
    }
  }

  async function runAutoFix() {
    if (!integrationId) return;
    setFixing(true);
    setIntDiagError("");
    try {
      const r = await autoFixIntegration(integrationId);
      setFixResult(r);
      // Reanalisa para refletir o novo estado pós-correção
      try { setIntDiag(await diagnoseIntegration(integrationId)); } catch { /* mantém o atual */ }
    } catch (e: any) {
      setIntDiagError(e?.response?.data?.error || t.errCannotFix);
    } finally {
      setFixing(false);
    }
  }

  useEffect(() => {
    if (integrationId && autoMode) runIntegrationDiagnosis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationId, autoMode]);

  useEffect(() => {
    async function load() {
      try {
        const [clientsData, presetsData] = await Promise.all([
          getClients(),
          getPresets(),
        ]);
        setClients(Array.isArray(clientsData) ? clientsData : clientsData.data || []);
        setPresets(Array.isArray(presetsData) ? presetsData : presetsData.data || []);
      } catch {
        setError(t.errLoadData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      getDiagnosticHistory(selectedClient)
        .then((data) =>
          setHistory(Array.isArray(data) ? data : data.data || [])
        )
        .catch(() => {});
    }
  }, [selectedClient]);

  async function handleAnalyze() {
    if (!selectedClient || !query.trim()) return;
    setAnalyzing(true);
    setResponse("");
    setError("");

    let id: string | undefined;
    try {
      // Cria o job (202); a IA roda em background no servidor.
      const job = await createDiagnostic({ clientId: selectedClient, query: query.trim() });
      id = job.id;
    } catch (err: any) {
      setError(err?.response?.data?.error || t.errCannotStart);
      setAnalyzing(false);
      return;
    }

    if (!id) {
      setError(t.errInvalidResponse);
      setAnalyzing(false);
      return;
    }

    // Polling resiliente: um poll que falhe (restart/erro transitório) NÃO derruba tudo —
    // só desistimos após várias falhas seguidas. A IA continua rodando no servidor.
    let done = false;
    let consecutiveErrors = 0;
    for (let i = 0; i < 120 && !done; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const d = await getDiagnostic(id);
        consecutiveErrors = 0;
        if (d.status === "DONE") {
          setResponse(d.response);
          done = true;
        } else if (d.status === "FAILED") {
          setError(d.response || t.errAiFailed);
          done = true;
        }
      } catch {
        consecutiveErrors++;
        if (consecutiveErrors >= 5) {
          setError(t.errUnstable);
          done = true;
        }
      }
    }
    if (!done) setError(t.errTooLong);

    try {
      const hist = await getDiagnosticHistory(selectedClient);
      setHistory(Array.isArray(hist) ? hist : hist.data || []);
    } catch {
      /* histórico é secundário — não trava a tela */
    }
    setAnalyzing(false);
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.pageTitle}</h1>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Painel de auto-diagnóstico da integração (vindo do card de erro) */}
      {integrationId && (
        <div className="bg-[#1a1527] rounded-xl border border-purple-500/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-purple-400">🤖</span>
              <h2 className="font-semibold">
                {intDiag ? t.autoDiagWithName(intDiag.integration.name) : t.autoDiagTitle}
              </h2>
            </div>
            <button
              onClick={runIntegrationDiagnosis}
              disabled={intDiagLoading || fixing}
              className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 cursor-pointer"
            >
              {t.reanalyze}
            </button>
          </div>

          <div className="p-6 space-y-4">
            {intDiagError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">{intDiagError}</div>
            )}

            {intDiagLoading && (
              <div className="flex items-center gap-3 text-[#9b95ad] text-sm">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                {t.aiTesting}
              </div>
            )}

            {intDiag && !intDiagLoading && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${intDiag.probe?.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                    {intDiag.problem}
                  </span>
                  {intDiag.probe?.httpStatus != null && (
                    <span className="px-2 py-0.5 rounded text-xs bg-white/[0.06] text-[#9b95ad]">HTTP {intDiag.probe.httpStatus} · {intDiag.probe.latencyMs}ms</span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">{t.rootCause}</p>
                  <p className="text-sm text-[#e2e0ea] leading-relaxed">{intDiag.rootCause}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">{t.recommendation}</p>
                  <p className="text-sm text-[#e2e0ea] leading-relaxed">{intDiag.recommendation}</p>
                </div>

                {intDiag.steps.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#9b95ad] uppercase tracking-wider mb-1">{t.steps}</p>
                    <ol className="list-decimal list-inside text-sm text-[#e2e0ea] space-y-1">
                      {intDiag.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </div>
                )}

                {/* A3 — SAP Notes / KBAs sugeridas */}
                {intDiag.sapNotes && intDiag.sapNotes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                      {t.sapNotesSuggested}
                    </p>
                    <div className="space-y-2">
                      {intDiag.sapNotes.map((n, i) => (
                        <div key={i} className="bg-amber-500/[0.06] border border-amber-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-[#e2e0ea]">{n.area}</p>
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 shrink-0">{n.component}</span>
                          </div>
                          <p className="text-xs text-[#c9c5d6] leading-relaxed mb-2">{n.why}</p>
                          {n.transactions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {n.transactions.map((t) => (
                                <span key={t} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#0f0b1a] border border-white/[0.08] text-[#9b95ad]">{t}</span>
                              ))}
                            </div>
                          )}
                          <a href={n.searchUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-semibold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1">
                            {t.searchNote}
                          </a>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#9b95ad] mt-2">
                      {t.sapNotesFooter}
                    </p>
                  </div>
                )}

                {/* Ação de correção */}
                {intDiag.autoFix.available ? (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-sm font-medium text-purple-300 mb-1">{t.autoFixAvailable}</p>
                    <p className="text-sm text-[#e2e0ea] mb-3">{intDiag.autoFix.summary}</p>
                    <button
                      onClick={runAutoFix}
                      disabled={fixing}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
                    >
                      {fixing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {fixing ? t.applyingFix : t.aiFixes}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-lg p-4">
                    <p className="text-sm text-[#9b95ad]">
                      <span className="font-medium text-[#e2e0ea]">{t.noAutoFix}</span> {intDiag.autoFix.reason}
                    </p>
                  </div>
                )}

                {/* Resultado da correção aplicada */}
                {fixResult && (
                  <div className={`rounded-lg p-4 border ${fixResult.recovered ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"}`}>
                    <p className={`text-sm font-semibold mb-2 ${fixResult.recovered ? "text-emerald-400" : "text-amber-400"}`}>
                      {fixResult.recovered ? t.fixRecovered : t.fixNotRecovered}
                    </p>
                    <p className="text-xs font-semibold text-[#9b95ad] uppercase tracking-wider mb-1">{t.whatChanged}</p>
                    <ul className="text-sm text-[#e2e0ea] space-y-1 mb-3">
                      {fixResult.changes.map((c, i) => (
                        <li key={i} className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{c.label}:</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 line-through">{c.from}</span>
                          <span>→</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">{c.to}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs font-semibold text-[#9b95ad] uppercase tracking-wider mb-1">{t.where}</p>
                    <p className="text-sm text-[#e2e0ea] mb-3">{t.integrationRegistry(intDiag.integration.name, intDiag.integration.type)}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-[#0f0b1a] rounded-lg p-3">
                        <p className="text-xs text-[#9b95ad] mb-1">{t.before}</p>
                        <p>{t.statusLabel}: <span className="font-medium text-rose-400">{fixResult.before.status}</span></p>
                        <p>{t.uptimeLabel}: {fixResult.before.uptime}%</p>
                      </div>
                      <div className="bg-[#0f0b1a] rounded-lg p-3">
                        <p className="text-xs text-[#9b95ad] mb-1">{t.after}</p>
                        <p>{t.statusLabel}: <span className={`font-medium ${fixResult.after.status === "ACTIVE" ? "text-emerald-400" : "text-amber-400"}`}>{fixResult.after.status}</span></p>
                        <p>{t.uptimeLabel}: {fixResult.after.uptime}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presets */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t.presets}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setQuery(preset.query)}
                className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08] hover:bg-[#231d35] hover:border-purple-500/30 transition-colors text-left cursor-pointer"
              >
                <p className="text-sm font-medium text-[#e2e0ea]">{preset.name || preset.query}</p>
                {preset.description && <p className="text-xs text-[#9b95ad] mt-1">{preset.description}</p>}
              </button>
            ))}
            {presets.length === 0 && (
              <p className="text-[#9b95ad] text-sm">{t.noPresets}</p>
            )}
          </div>
        </div>

        {/* Query Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#9b95ad] mb-1.5">
              {t.client}
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1527] border border-white/[0.08] rounded-lg text-[#e2e0ea] focus:outline-none focus:border-purple-500/50"
            >
              <option value="">{t.selectClient}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9b95ad] mb-1.5">
              {t.queryLabel}
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 bg-[#1a1527] border border-white/[0.08] rounded-lg text-[#e2e0ea] placeholder-[#9b95ad]/50 focus:outline-none focus:border-purple-500/50 resize-none"
              placeholder={t.queryPlaceholder}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedClient || !query.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? t.analyzing : t.analyze}
          </button>
        </div>
      </div>

      {/* Response */}
      {(response || analyzing) && (
        analyzing ? (
          <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
            <h3 className="text-sm font-semibold text-[#9b95ad] mb-3">{t.resultTitle}</h3>
            <div className="flex items-center gap-3 text-[#9b95ad]">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              {t.analyzingEnv}
            </div>
          </div>
        ) : (
          <AiReport text={response} title={t.reportTitle} meta={[{ label: t.generatedAt, value: new Date().toLocaleString("pt-BR") }]} />
        )
      )}

      {/* History */}
      {selectedClient && history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{t.historyTitle}</h2>
          <div className="space-y-3">
            {history.map((entry) => {
              const isExpanded = expandedEntry === entry.id;
              return (
              <div
                key={entry.id}
                className="bg-[#1a1527] rounded-xl border border-white/[0.08] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                  className="w-full p-4 text-left hover:bg-[#231d35] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#e2e0ea]">{entry.query}</p>
                    <span className="text-[#9b95ad] text-lg ml-3 flex-shrink-0">{isExpanded ? '−' : '+'}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-[#9b95ad]">{new Date(entry.createdAt).toLocaleString("pt-BR")}</span>
                    {!isExpanded && <span className="text-xs text-purple-400">{t.clickForDetails}</span>}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/[0.05]">
                    <div className="mt-4">
                      <AiReport text={entry.response} title={t.reportTitle} subtitle={entry.query} meta={[{ label: t.generatedAt, value: new Date(entry.createdAt).toLocaleString("pt-BR") }]} />
                    </div>
                  </div>
                )}
              </div>
            );})}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiagnosticsPage() {
  return (
    <Suspense fallback={<Loading full={false} />}>
      <DiagnosticsContent />
    </Suspense>
  );
}
