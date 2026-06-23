"use client";

import { useEffect, useState, useCallback } from "react";
import { usePersistedState } from "@/lib/usePersistedState";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { getCatalog, getClients, type CatalogItem } from "@/lib/api";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Client { id: string; name: string }

const SHEET_T: Record<Lang, {
  kind: string; name: string; detail: string; client: string; integration: string;
  status: string; active: string; inactive: string; lastSeen: string; attributes: string;
}> = {
  pt: {
    kind: "Tipo", name: "Nome", detail: "Detalhe", client: "Cliente", integration: "Integração",
    status: "Status", active: "Ativo", inactive: "Inativo", lastSeen: "Visto por último", attributes: "Atributos",
  },
  en: {
    kind: "Type", name: "Name", detail: "Detail", client: "Client", integration: "Integration",
    status: "Status", active: "Active", inactive: "Inactive", lastSeen: "Last seen", attributes: "Attributes",
  },
  es: {
    kind: "Tipo", name: "Nombre", detail: "Detalle", client: "Cliente", integration: "Integración",
    status: "Status", active: "Activo", inactive: "Inactivo", lastSeen: "Visto por última vez", attributes: "Atributos",
  },
};

const KIND_ICON: Record<string, string> = {
  PARTNER_PROFILE: "🤝", RFC_DEST: "🔌", MESSAGE_TYPE: "✉️", ODATA_SERVICE: "🌐", IDOC_PORT: "🚪",
};

export default function CatalogPage() {
  const { lang } = useLang();
  const t = T[lang];
  const KIND_LABEL = t.kindLabel;
  const [data, setData] = useState<{ items: CatalogItem[]; summary: { total: number; active: number; byKind: Record<string, number> } } | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = usePersistedState("slk:catalog:filters", { clientId: "", kind: "", q: "" });
  const [sel, setSel] = useState<CatalogItem | null>(null);
  const st = SHEET_T[lang];

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
        <h1 className="text-2xl font-bold flex items-center gap-2">📚 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">
          {t.subtitle}
        </p>
        <div className="mt-3"><ExplainData screen={t.explainScreen} data={{ summary: data?.summary, amostra: data?.items?.slice(0, 12) }} /></div>
      </div>

      {s && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label={t.statInterfaces} value={s.total} accent="text-white" />
          <Stat label={t.statActive} value={s.active} accent="text-emerald-300" />
          <Stat label={t.statPartners} value={s.byKind.PARTNER_PROFILE || 0} accent="text-cyan-300" />
          <Stat label={t.statRfcDest} value={s.byKind.RFC_DEST || 0} accent="text-purple-300" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <select value={filters.clientId} onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">{t.allClients}</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.kind} onChange={(e) => setFilters({ ...filters, kind: e.target.value })}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
          <option value="">{t.allKinds}</option>
          {Object.keys(KIND_LABEL).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
        </select>
        <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder={t.searchPlaceholder}
          className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
      </div>

      {loading ? (
        <div className="text-[#9b95ad]">{t.loading}</div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          {t.emptyTitle}
          <p className="text-xs mt-2">{t.emptyHint}</p>
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
                  <div key={i.id} onClick={() => setSel(i)} className={`rounded-lg border p-3 cursor-pointer hover:bg-white/[0.03] transition-colors ${i.active ? "bg-[#1a1527] border-white/[0.08]" : "bg-[#15101f] border-white/[0.04] opacity-60"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-sm text-[#e2e0ea] truncate">{i.name}</p>
                      {!i.active && <span className="text-[10px] text-[#9b95ad]">{t.inactive}</span>}
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

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon={KIND_ICON[sel.kind] || "📚"}
          title={sel.name}
          subtitle={`${KIND_LABEL[sel.kind] || sel.kind}${sel.client ? ` · ${sel.client}` : ""}`}
          badge={<span className={`text-xs px-2 py-1 rounded shrink-0 ${sel.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.06] text-[#9b95ad]"}`}>{sel.active ? st.active : st.inactive}</span>}
          fields={[
            { label: st.kind, value: KIND_LABEL[sel.kind] || sel.kind },
            { label: st.name, value: <span className="font-mono break-all">{sel.name}</span> },
            { label: st.detail, value: sel.detail },
            { label: st.client, value: sel.client },
            { label: st.integration, value: sel.integration },
            { label: st.status, value: sel.active ? st.active : st.inactive },
            { label: st.lastSeen, value: sel.lastSeenAt ? new Date(sel.lastSeenAt).toLocaleString("pt-BR") : undefined },
            { label: st.attributes, value: sel.attributes && Object.keys(sel.attributes).length > 0
              ? <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(sel.attributes, null, 2)}</pre>
              : undefined },
          ]}
        >
          <ExplainData screen="Catálogo de interfaces — item" data={{ tipo: sel.kind, nome: sel.name, detalhe: sel.detail, cliente: sel.client, integracao: sel.integration, ativo: sel.active, atributos: sel.attributes }} />
        </DetailSheet>
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
