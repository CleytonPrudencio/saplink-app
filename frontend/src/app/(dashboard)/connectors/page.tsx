"use client";

import { useEffect, useState } from "react";
import { getConnectors, saveConnector, syncConnector, getMe } from "@/lib/api";
import EnvLabel from "@/components/EnvLabel";

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

  useEffect(() => { getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {}); }, []);
  async function load() { try { setClients((await getConnectors()).clients); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);

  async function save(clientId: string, product: string) {
    const key = `${clientId}:${product}`; setBusy(key); setMsg((m) => ({ ...m, [key]: "" }));
    try { await saveConnector(clientId, product, draft); setEdit(null); await load(); }
    catch (e: any) { setMsg((m) => ({ ...m, [key]: e?.response?.data?.error || "Erro." })); }
    finally { setBusy(null); }
  }
  async function doSync(clientId: string, product: string) {
    const key = `${clientId}:${product}`; setBusy(key + ":sync"); setMsg((m) => ({ ...m, [key]: "" }));
    try { const r = await syncConnector(clientId, product); setMsg((m) => ({ ...m, [key]: `Sync: ${r.reachable}/${r.total} APIs alcançadas` })); await load(); }
    catch (e: any) { setMsg((m) => ({ ...m, [key]: e?.response?.data?.error || "Erro no sync." })); }
    finally { setBusy(null); }
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap"><h1 className="text-2xl font-bold flex items-center gap-2">🔌 Conectores SAP Cloud</h1><EnvLabel prefix="Configurando" /></div>
        <p className="text-[#9b95ad] text-sm mt-1">Conecte Ariba e SuccessFactors de cada cliente com a chave dele (igual ao S/4), <b>por ambiente</b>. As APIs alcançadas entram no inventário (Catálogo vivo).</p>
      </div>

      {!isAdmin && <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200">Apenas administradores conectam produtos.</div>}

      {clients.length === 0 && <p className="text-[#9b95ad] text-sm">Cadastre clientes primeiro.</p>}

      {clients.map((c) => (
        <div key={c.clientId} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4">
          <h2 className="font-semibold mb-3">{c.client}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.connectors.map((k: any) => {
              const key = `${c.clientId}:${k.product}`; const m = META[k.product];
              return (
                <div key={k.product} className="bg-[#0f0b1a] border border-white/[0.08] rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.icon} {m.label}</span>
                    <span className={`text-xs ${statusCls[k.status]}`}>● {k.status}</span>
                  </div>
                  <p className="text-xs text-[#6b6580] mt-1">{k.hasKey ? "Chave configurada" : "Sem chave"}{k.lastSyncAt ? ` · último sync ${new Date(k.lastSyncAt).toLocaleString("pt-BR")}` : ""}</p>
                  {k.lastResult?.results && (
                    <div className="mt-2 space-y-0.5">
                      {k.lastResult.results.map((r: any) => (
                        <div key={r.apiName} className="text-xs flex justify-between"><span className="text-[#9b95ad]">{r.apiName}</span><span className={r.ok ? "text-emerald-300" : "text-rose-300"}>{r.ok ? (r.count != null ? `${r.count} reg.` : "OK") : `HTTP ${r.httpStatus || "—"}`}</span></div>
                      ))}
                    </div>
                  )}
                  {isAdmin && (edit === key ? (
                    <div className="mt-3 space-y-2">
                      <input value={draft.baseUrl} onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })} placeholder={k.baseUrl} className="w-full bg-[#1a1527] border border-white/[0.1] rounded px-2 py-1.5 text-xs font-mono" />
                      <input type="password" value={draft.apiKey} onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })} placeholder="API Key do cliente" className="w-full bg-[#1a1527] border border-white/[0.1] rounded px-2 py-1.5 text-xs" />
                      <div className="flex gap-2">
                        <button onClick={() => save(c.clientId, k.product)} disabled={busy === key} className="text-xs px-3 py-1.5 rounded bg-purple-500 text-white cursor-pointer disabled:opacity-50">{busy === key ? "…" : "Salvar"}</button>
                        <button onClick={() => setEdit(null)} className="text-xs px-3 py-1.5 rounded bg-white/[0.06] text-[#9b95ad] cursor-pointer">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => { setEdit(key); setDraft({ baseUrl: k.baseUrl, apiKey: "" }); }} className="text-xs px-3 py-1.5 rounded bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.1] cursor-pointer">{k.hasKey ? "Editar" : "Conectar"}</button>
                      {k.hasKey && <button onClick={() => doSync(c.clientId, k.product)} disabled={busy === key + ":sync"} className="text-xs px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 cursor-pointer disabled:opacity-50">{busy === key + ":sync" ? "Sincronizando…" : "Sincronizar"}</button>}
                    </div>
                  ))}
                  {msg[key] && <p className="text-xs text-cyan-300 mt-2">{msg[key]}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
