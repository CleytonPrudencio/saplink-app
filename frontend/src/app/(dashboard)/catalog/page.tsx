"use client";

import { useEffect, useState, useCallback } from "react";
import { getCatalog, getClients, type CatalogItem } from "@/lib/api";

interface Client { id: string; name: string }

const KIND_LABEL: Record<string, string> = {
  PARTNER_PROFILE: "Parceiro (WE20)",
  RFC_DEST: "Destino RFC (SM59)",
  MESSAGE_TYPE: "Message Type",
  ODATA_SERVICE: "Serviço OData",
  IDOC_PORT: "Porta IDoc (WE21)",
};
const KIND_ICON: Record<string, string> = {
  PARTNER_PROFILE: "🤝", RFC_DEST: "🔌", MESSAGE_TYPE: "✉️", ODATA_SERVICE: "🌐", IDOC_PORT: "🚪",
};

export default function CatalogPage() {
  const [data, setData] = useState<{ items: CatalogItem[]; summary: { total: number; active: number; byKind: Record<string, number> } } | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ clientId: "", kind: "", q: "" });

  const load = useCallback(async () => {
    setData(await getCatalog(filters));
  }, [filters]);

  useEffect(() => { getClients().then(setClients).catch(() => {}); }, []);
  useEffect(() => { setLoading(true); load().catch(() => {}).finally(() => setLoading(false)); }, [load]);

  const s = data?.summary;
  // agrupa por kind para exibição
  const groups = (data?.items || []).reduce((acc: Record<string, CatalogItem[]>, i) => {
    (acc[i.kind] = acc[i.kind] || []).push(i); return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">📚 Catálogo de interfaces</h1>
        <p className="text-[#9b95ad] text-sm mt-1">
          O landscape de integração vivo, auto-descoberto pelo agente: parceiros, destinos RFC, message types e serviços OData.
        </p>
      </div>

      {s && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Interfaces" value={s.total} accent="text-white" />
          <Stat label="Ativas" value={s.active} accent="text-emerald-300" />
          <Stat label="Parceiros" value={s.byKind.PARTNER_PROFILE || 0} accent="text-cyan-300" />
          <Stat label="Destinos RFC" value={s.byKind.RFC_DEST || 0} accent="text-purple-300" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <select value={filters.clientId} onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">Todos os clientes</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.kind} onChange={(e) => setFilters({ ...filters, kind: e.target.value })}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">Todos os tipos</option>
          {Object.keys(KIND_LABEL).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
        </select>
        <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder="Buscar nome / descrição"
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
      </div>

      {loading ? (
        <div className="text-[#9b95ad]">Carregando...</div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          Nenhuma interface catalogada ainda.
          <p className="text-xs mt-2">O catálogo é preenchido pela auto-descoberta do Agente on-premise.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([kind, list]) => (
            <div key={kind}>
              <h2 className="text-sm font-semibold text-[#c9c5d6] mb-2 flex items-center gap-2">
                <span>{KIND_ICON[kind] || "•"}</span> {KIND_LABEL[kind] || kind}
                <span className="text-xs text-[#9b95ad]">({list.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {list.map((i) => (
                  <div key={i.id} className={`rounded-lg border p-3 ${i.active ? "bg-[#1a1527] border-white/[0.08]" : "bg-[#15101f] border-white/[0.04] opacity-60"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-sm text-[#e2e0ea] truncate">{i.name}</p>
                      {!i.active && <span className="text-[10px] text-[#9b95ad]">inativo</span>}
                    </div>
                    {i.detail && <p className="text-xs text-[#9b95ad] mt-1">{i.detail}</p>}
                    <p className="text-[11px] text-[#6b6580] mt-1">{i.client}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
