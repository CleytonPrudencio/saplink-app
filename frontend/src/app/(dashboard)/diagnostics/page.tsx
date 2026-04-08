"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getClients,
  getPresets,
  createDiagnostic,
  getDiagnosticHistory,
} from "@/lib/api";

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
  const searchParams = useSearchParams();
  const initialClientId = searchParams.get("clientId") || "";

  const [clients, setClients] = useState<Client[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedClient, setSelectedClient] = useState(initialClientId);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<DiagnosticEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

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
        setError("Erro ao carregar dados.");
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

    try {
      const result = await createDiagnostic({
        clientId: selectedClient,
        query: query.trim(),
      });
      setResponse(result.response || result.result || JSON.stringify(result, null, 2));
      // Refresh history
      const hist = await getDiagnosticHistory(selectedClient);
      setHistory(Array.isArray(hist) ? hist : hist.data || []);
    } catch {
      setError("Erro ao executar diagnostico.");
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Diagnostico IA</h1>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presets */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Presets</h2>
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
              <p className="text-[#9b95ad] text-sm">Nenhum preset disponivel.</p>
            )}
          </div>
        </div>

        {/* Query Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#9b95ad] mb-1.5">
              Cliente
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1a1527] border border-white/[0.08] rounded-lg text-[#e2e0ea] focus:outline-none focus:border-purple-500/50"
            >
              <option value="">Selecione um cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9b95ad] mb-1.5">
              Consulta
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 bg-[#1a1527] border border-white/[0.08] rounded-lg text-[#e2e0ea] placeholder-[#9b95ad]/50 focus:outline-none focus:border-purple-500/50 resize-none"
              placeholder="Descreva o que deseja analisar..."
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !selectedClient || !query.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? "Analisando..." : "Analisar"}
          </button>
        </div>
      </div>

      {/* Response */}
      {(response || analyzing) && (
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h3 className="text-sm font-semibold text-[#9b95ad] mb-3">Resultado</h3>
          {analyzing ? (
            <div className="flex items-center gap-3 text-[#9b95ad]">
              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              Processando analise...
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap">{response}</div>
          )}
        </div>
      )}

      {/* History */}
      {selectedClient && history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Historico de Diagnosticos</h2>
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]"
              >
                <p className="text-sm font-medium mb-2">{entry.query}</p>
                <p className="text-sm text-[#9b95ad] whitespace-pre-wrap line-clamp-3">
                  {entry.response}
                </p>
                <p className="text-xs text-[#9b95ad] mt-2">
                  {new Date(entry.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DiagnosticsPage() {
  return (
    <Suspense fallback={<div className="text-[#9b95ad]">Carregando...</div>}>
      <DiagnosticsContent />
    </Suspense>
  );
}
