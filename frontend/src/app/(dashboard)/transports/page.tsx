"use client";

import { useEffect, useState, useCallback } from "react";
import { getTransports, getClients } from "@/lib/api";

interface Client { id: string; name: string }
type TData = Awaited<ReturnType<typeof getTransports>>;

export default function TransportsPage() {
  const [data, setData] = useState<TData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => { setData(await getTransports(clientId || undefined)); }, [clientId]);
  useEffect(() => { getClients().then(setClients).catch(() => {}); }, []);
  useEffect(() => { setLoading(true); load().catch(() => {}).finally(() => setLoading(false)); }, [load]);

  const s = data?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🚚 Radar de transports (STMS)</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Transportes importados e correlação automática com incidentes abertos (provável causa).</p>
      </div>

      {s && (
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <Stat label="Transports" value={s.transports} accent="text-[#e2e0ea]" />
          <Stat label="Incidentes" value={s.openIncidents} accent="text-amber-300" />
          <Stat label="Correlacionados" value={s.correlated} accent="text-rose-300" />
        </div>
      )}

      <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
        <option value="">Todos os clientes</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {loading ? <div className="text-[#9b95ad]">Carregando...</div> : (
        <>
          {/* Correlações */}
          {data && data.correlations.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">🔎 Provável causa de incidentes</h2>
              <div className="space-y-3">
                {data.correlations.map((c) => (
                  <div key={c.alert.id} className="bg-rose-500/[0.06] border border-rose-500/20 rounded-xl p-4">
                    <p className="text-sm"><span className="text-rose-300 font-semibold">{c.alert.severity}</span> · {c.alert.message}</p>
                    <p className="text-xs text-[#9b95ad] mt-0.5">{c.alert.client} · {new Date(c.alert.createdAt).toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-[#c9c5d6] mt-2 mb-1">Transportes importados nas 24h anteriores:</p>
                    <div className="space-y-1">
                      {c.suspects.map((t) => (
                        <div key={t.trNumber} className="text-xs bg-[#0f0b1a] rounded px-2 py-1">
                          <span className="font-mono text-amber-300">{t.trNumber}</span>
                          {t.target && <span className="text-[#9b95ad] ml-2">→ {t.target}</span>}
                          <span className="text-[#c9c5d6] ml-2">{t.description}</span>
                          {t.owner && <span className="text-[#6b6580] ml-2">({t.owner})</span>}
                          {t.importedAt && <span className="text-[#6b6580] ml-2">· {new Date(t.importedAt).toLocaleString("pt-BR")}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Lista completa */}
          <section>
            <h2 className="text-lg font-semibold mb-2">Transportes recentes</h2>
            {!data || data.transports.length === 0 ? (
              <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
                Nenhum transporte registrado. Os dados vêm da descoberta STMS do Agente on-premise.
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                    <th className="px-3 py-2 font-medium">TR</th><th className="px-3 py-2 font-medium">Descrição</th>
                    <th className="px-3 py-2 font-medium">Cliente</th><th className="px-3 py-2 font-medium">Alvo</th>
                    <th className="px-3 py-2 font-medium">Owner</th><th className="px-3 py-2 font-medium">Importado</th>
                  </tr></thead>
                  <tbody>
                    {data.transports.map((t) => (
                      <tr key={t.id} className="border-b border-white/[0.04]">
                        <td className="px-3 py-2 font-mono text-amber-300">{t.trNumber}</td>
                        <td className="px-3 py-2 text-[#c9c5d6]">{t.description}</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{t.client}</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{t.target || "—"}</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{t.owner || "—"}</td>
                        <td className="px-3 py-2 text-[#9b95ad]">{t.importedAt ? new Date(t.importedAt).toLocaleString("pt-BR") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 text-center">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-[11px] text-[#9b95ad] mt-0.5">{label}</div>
    </div>
  );
}
