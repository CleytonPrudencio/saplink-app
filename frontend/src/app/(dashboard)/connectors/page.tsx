"use client";

import { useEffect, useState } from "react";
import { getConnectors, saveConnector, syncConnector, getMe } from "@/lib/api";
import EnvLabel from "@/components/EnvLabel";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

const SHEET_T: Record<Lang, {
  fClient: string; fProduct: string; fStatus: string; fKey: string; fBaseUrl: string;
  fLastSync: string; fApis: string; yes: string; no: string;
  guideTitle: string; revalidate: string; errorSteps: string[]; pendingSteps: string[];
}> = {
  pt: {
    fClient: "Cliente", fProduct: "Produto", fStatus: "Status", fKey: "Chave", fBaseUrl: "Base URL",
    fLastSync: "Último sync", fApis: "APIs", yes: "Configurada", no: "Sem chave",
    guideTitle: "O que fazer", revalidate: "Revalidar conexão",
    errorSteps: [
      "Conexão com erro — a última sincronização não alcançou as APIs do produto.",
      "Revalide a API Key do cliente e a Base URL do ambiente.",
      "Re-sincronize e confirme que as APIs voltaram a responder.",
    ],
    pendingSteps: [
      "Conector ainda não configurado para este cliente.",
      "Informe a Base URL do ambiente e a API Key do cliente.",
      "Sincronize para popular o inventário (Catálogo vivo).",
    ],
  },
  en: {
    fClient: "Client", fProduct: "Product", fStatus: "Status", fKey: "Key", fBaseUrl: "Base URL",
    fLastSync: "Last sync", fApis: "APIs", yes: "Configured", no: "No key",
    guideTitle: "What to do", revalidate: "Revalidate connection",
    errorSteps: [
      "Connection in error — the last sync did not reach the product's APIs.",
      "Revalidate the client's API Key and the environment Base URL.",
      "Re-sync and confirm the APIs respond again.",
    ],
    pendingSteps: [
      "Connector not yet configured for this client.",
      "Provide the environment Base URL and the client's API Key.",
      "Sync to populate the inventory (live Catalog).",
    ],
  },
  es: {
    fClient: "Cliente", fProduct: "Producto", fStatus: "Estado", fKey: "Clave", fBaseUrl: "Base URL",
    fLastSync: "Último sync", fApis: "APIs", yes: "Configurada", no: "Sin clave",
    guideTitle: "Qué hacer", revalidate: "Revalidar conexión",
    errorSteps: [
      "Conexión con error — el último sync no alcanzó las APIs del producto.",
      "Revalida la API Key del cliente y la Base URL del ambiente.",
      "Vuelve a sincronizar y confirma que las APIs responden de nuevo.",
    ],
    pendingSteps: [
      "Conector aún no configurado para este cliente.",
      "Indica la Base URL del ambiente y la API Key del cliente.",
      "Sincroniza para poblar el inventario (Catálogo vivo).",
    ],
  },
};

const META: Record<string, { label: string; icon: string }> = {
  ARIBA: { label: "SAP Ariba", icon: "🛒" },
  SUCCESSFACTORS: { label: "SuccessFactors", icon: "👥" },
  CONCUR: { label: "SAP Concur", icon: "✈️" },
  FIELDGLASS: { label: "SAP Fieldglass", icon: "🧰" },
  CX: { label: "SAP CX (Sales/Service)", icon: "🎧" },
  COMMERCE: { label: "SAP Commerce", icon: "🛍️" },
  APIM: { label: "API Management", icon: "🔗" },
  TPM: { label: "B2B/EDI (Trading Partner)", icon: "🔁" },
};
const statusCls: Record<string, string> = { CONNECTED: "text-emerald-300", ERROR: "text-rose-300", PENDING: "text-[#9b95ad]" };

export default function ConnectorsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<string | null>(null); // `${clientId}:${product}`
  const [draft, setDraft] = useState<{ baseUrl: string; apiKey: string }>({ baseUrl: "", apiKey: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<any>(null);
  const { lang } = useLang();
  const t = T[lang];
  const st = SHEET_T[lang];

  useEffect(() => { getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {}); }, []);
  async function load() { try { setClients((await getConnectors()).clients); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  async function save(clientId: string, product: string) {
    const key = `${clientId}:${product}`; setBusy(key); setMsg((m) => ({ ...m, [key]: "" }));
    try { await saveConnector(clientId, product, draft); setEdit(null); await load(); }
    catch (e: any) { setMsg((m) => ({ ...m, [key]: e?.response?.data?.error || t.error })); }
    finally { setBusy(null); }
  }
  async function doSync(clientId: string, product: string) {
    const key = `${clientId}:${product}`; setBusy(key + ":sync"); setMsg((m) => ({ ...m, [key]: "" }));
    try { const r = await syncConnector(clientId, product); setMsg((m) => ({ ...m, [key]: t.syncResult(r.reachable, r.total) })); await load(); }
    catch (e: any) { setMsg((m) => ({ ...m, [key]: e?.response?.data?.error || t.syncError })); }
    finally { setBusy(null); }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap"><h1 className="text-2xl font-bold flex items-center gap-2">🔌 {t.title}</h1><EnvLabel prefix={t.envPrefix} /></div>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
      </div>

      {!isAdmin && <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200">{t.adminOnly}</div>}

      {clients.length === 0 && <p className="text-[#9b95ad] text-sm">{t.registerClientsFirst}</p>}

      {clients.map((c) => (
        <div key={c.clientId} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4">
          <h2 className="font-semibold mb-3">{c.client}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.connectors.map((k: any) => {
              const key = `${c.clientId}:${k.product}`; const m = META[k.product];
              return (
                <div key={k.product} onClick={() => setSel({ ...k, clientId: c.clientId, client: c.client, meta: m })} className="bg-[#0f0b1a] border border-white/[0.08] rounded-lg p-3 cursor-pointer hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.icon} {m.label}</span>
                    <span className={`text-xs ${statusCls[k.status]}`}>● {k.status}</span>
                  </div>
                  <p className="text-xs text-[#6b6580] mt-1">{k.hasKey ? t.keyConfigured : t.noKey}{k.lastSyncAt ? t.lastSync(new Date(k.lastSyncAt).toLocaleString("pt-BR")) : ""}</p>
                  {k.lastResult?.results && (
                    <div className="mt-2 space-y-0.5">
                      {k.lastResult.results.map((r: any) => (
                        <div key={r.apiName} className="text-xs flex justify-between"><span className="text-[#9b95ad]">{r.apiName}</span><span className={r.ok ? "text-emerald-300" : "text-rose-300"}>{r.ok ? (r.count != null ? t.records(r.count) : t.ok) : t.httpStatus(r.httpStatus || "—")}</span></div>
                      ))}
                    </div>
                  )}
                  {isAdmin && (edit === key ? (
                    <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <input value={draft.baseUrl} onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })} placeholder={k.baseUrl} className="w-full bg-[#1a1527] border border-white/[0.1] rounded px-2 py-1.5 text-xs font-mono" />
                      <input type="password" value={draft.apiKey} onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })} placeholder={t.apiKeyPlaceholder} className="w-full bg-[#1a1527] border border-white/[0.1] rounded px-2 py-1.5 text-xs" />
                      <div className="flex gap-2">
                        <button onClick={() => save(c.clientId, k.product)} disabled={busy === key} className="text-xs px-3 py-1.5 rounded bg-purple-500 text-white cursor-pointer disabled:opacity-50">{busy === key ? t.saving : t.save}</button>
                        <button onClick={() => setEdit(null)} className="text-xs px-3 py-1.5 rounded bg-white/[0.06] text-[#9b95ad] cursor-pointer">{t.cancel}</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEdit(key); setDraft({ baseUrl: k.baseUrl, apiKey: "" }); }} className="text-xs px-3 py-1.5 rounded bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.1] cursor-pointer">{k.hasKey ? t.edit : t.connect}</button>
                      {k.hasKey && <button onClick={() => doSync(c.clientId, k.product)} disabled={busy === key + ":sync"} className="text-xs px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 cursor-pointer disabled:opacity-50">{busy === key + ":sync" ? t.syncing : t.sync}</button>}
                    </div>
                  ))}
                  {msg[key] && <p className="text-xs text-cyan-300 mt-2">{msg[key]}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon={sel.meta?.icon || "🔌"}
          title={sel.meta?.label || sel.product}
          subtitle={sel.client}
          badge={<span className={`text-xs ${statusCls[sel.status] || ""}`}>● {sel.status}</span>}
          fields={[
            { label: st.fClient, value: sel.client },
            { label: st.fProduct, value: sel.meta?.label || sel.product },
            { label: st.fStatus, value: sel.status },
            { label: st.fKey, value: sel.hasKey ? st.yes : st.no },
            { label: st.fBaseUrl, value: sel.baseUrl ? <span className="font-mono text-xs break-all">{sel.baseUrl}</span> : undefined },
            { label: st.fLastSync, value: sel.lastSyncAt ? new Date(sel.lastSyncAt).toLocaleString("pt-BR") : undefined },
            {
              label: st.fApis,
              value: sel.lastResult?.results?.length ? (
                <div className="space-y-0.5">
                  {sel.lastResult.results.map((r: any) => (
                    <div key={r.apiName} className="flex justify-between gap-3 text-xs"><span className="text-[#9b95ad]">{r.apiName}</span><span className={r.ok ? "text-emerald-300" : "text-rose-300"}>{r.ok ? (r.count != null ? t.records(r.count) : t.ok) : t.httpStatus(r.httpStatus || "—")}</span></div>
                  ))}
                </div>
              ) : undefined,
            },
          ]}
          guideTitle={st.guideTitle}
          guideSteps={sel.status === "ERROR" ? st.errorSteps : (sel.status === "PENDING" || !sel.hasKey) ? st.pendingSteps : undefined}
          actions={(isAdmin && sel.status === "ERROR") ? (
            <button onClick={() => { doSync(sel.clientId, sel.product); setSel(null); }} className="text-sm px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer">🔄 {st.revalidate}</button>
          ) : undefined}
        >
          <ExplainData screen="Conectores SAP Cloud — item" data={{ client: sel.client, product: sel.product, status: sel.status, hasKey: sel.hasKey, baseUrl: sel.baseUrl, lastSyncAt: sel.lastSyncAt, results: sel.lastResult?.results }} />
        </DetailSheet>
      )}
    </div>
  );
}
