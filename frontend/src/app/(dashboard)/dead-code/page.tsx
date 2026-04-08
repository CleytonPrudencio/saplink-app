"use client";

import { useEffect, useState } from "react";
import { getClients, getDeadCode, getDeadCodeStats } from "@/lib/api";

interface Client {
  id: string;
  name: string;
}

interface DeadCodeEntry {
  id: string;
  objectName: string;
  type: string;
  lastUsed: string | null;
  usageCount: number;
  recommendation: string;
}

interface DeadCodeStatsData {
  total: number;
  retire: number;
  review: number;
  keep: number;
}

export default function DeadCodePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [entries, setEntries] = useState<DeadCodeEntry[]>([]);
  const [stats, setStats] = useState<DeadCodeStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");

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

    Promise.all([getDeadCode(selectedClient), getDeadCodeStats(selectedClient)])
      .then(([codeData, statsData]) => {
        setEntries(Array.isArray(codeData) ? codeData : codeData.data || []);
        setStats(statsData);
      })
      .catch(() => setError("Erro ao carregar dados de dead code."))
      .finally(() => setDataLoading(false));
  }, [selectedClient]);

  function recBadge(rec: string) {
    const r = rec?.toUpperCase();
    if (r === "RETIRE") return "bg-rose-500/20 text-rose-400";
    if (r === "REVIEW") return "bg-amber-500/20 text-amber-400";
    if (r === "KEEP") return "bg-emerald-500/20 text-emerald-400";
    return "bg-gray-500/20 text-gray-400";
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dead Code</h1>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Client Selector */}
      <select
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
        className="px-4 py-2.5 bg-[#1a1527] border border-white/[0.08] rounded-lg text-[#e2e0ea] focus:outline-none focus:border-purple-500/50"
      >
        <option value="">Selecione um cliente</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {dataLoading && <div className="text-[#9b95ad]">Carregando...</div>}

      {/* Stats Bar */}
      {stats && !dataLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-[#e2e0ea]" },
            { label: "Aposentar", value: stats.retire, color: "text-rose-400" },
            { label: "Revisar", value: stats.review, color: "text-amber-400" },
            { label: "Manter", value: stats.keep, color: "text-emerald-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#1a1527] rounded-xl p-4 border border-white/[0.08]"
            >
              <p className="text-sm text-[#9b95ad]">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {selectedClient && !dataLoading && entries.length > 0 && (
        <div className="bg-[#1a1527] rounded-xl border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left px-4 py-3 text-[#9b95ad] font-medium">
                    Nome do Objeto
                  </th>
                  <th className="text-left px-4 py-3 text-[#9b95ad] font-medium">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-3 text-[#9b95ad] font-medium">
                    Ultimo Uso
                  </th>
                  <th className="text-left px-4 py-3 text-[#9b95ad] font-medium">
                    Contagem
                  </th>
                  <th className="text-left px-4 py-3 text-[#9b95ad] font-medium">
                    Recomendacao
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-white/[0.04] hover:bg-[#231d35] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{entry.objectName}</td>
                    <td className="px-4 py-3 text-[#9b95ad]">{entry.type}</td>
                    <td className="px-4 py-3 text-[#9b95ad]">
                      {entry.lastUsed
                        ? new Date(entry.lastUsed).toLocaleDateString("pt-BR")
                        : "Nunca"}
                    </td>
                    <td className="px-4 py-3 text-[#9b95ad]">{entry.usageCount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${recBadge(
                          entry.recommendation
                        )}`}
                      >
                        {entry.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedClient && !dataLoading && entries.length === 0 && (
        <p className="text-[#9b95ad] text-sm">Nenhum dead code encontrado para este cliente.</p>
      )}
    </div>
  );
}
