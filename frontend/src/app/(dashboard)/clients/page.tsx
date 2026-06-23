"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExplainData from "@/components/ExplainData";
import { getClients, createClient, deleteClient, getPortalStatus, enableClientPortal, disableClientPortal, setStatusPage } from "@/lib/api";
import HealthScoreRing from "@/components/HealthScoreRing";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface Client {
  id: string;
  name: string;
  healthScore: number;
  integrationCount: number;
  alertCount: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang];
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // C3 — portal por cliente
  const [activePortal, setActivePortal] = useState("");
  const [portalInfo, setPortalInfo] = useState<{ enabled: boolean; url: string | null } | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // status page white-label por cliente (otimista, sem GET admin)
  const [activeStatus, setActiveStatus] = useState("");
  const [statusInfo, setStatusInfo] = useState<{ enabled: boolean; token: string | null } | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusCopied, setStatusCopied] = useState(false);

  function openStatus(clientId: string) {
    setActivePortal(""); // fecha o painel de portal — só um aberto por vez
    if (activeStatus === clientId) { setActiveStatus(""); return; }
    setActiveStatus(clientId); setStatusInfo(null); setStatusCopied(false);
  }
  async function toggleStatus(clientId: string, enable: boolean) {
    setStatusBusy(true);
    try { const r = await setStatusPage(clientId, enable); setStatusInfo(r); } catch { /* ignore */ } finally { setStatusBusy(false); }
  }

  async function openPortal(clientId: string) {
    setActiveStatus(""); // fecha o painel de status — só um aberto por vez
    if (activePortal === clientId) { setActivePortal(""); return; }
    setActivePortal(clientId); setPortalInfo(null); setCopied(false);
    try { const s = await getPortalStatus(clientId); setPortalInfo({ enabled: s.portalEnabled, url: s.url }); } catch { setPortalInfo({ enabled: false, url: null }); }
  }
  async function togglePortal(clientId: string, enable: boolean) {
    setPortalBusy(true);
    try {
      const r = enable ? await enableClientPortal(clientId) : await disableClientPortal(clientId);
      setPortalInfo({ enabled: r.portalEnabled, url: "url" in r ? r.url : portalInfo?.url ?? null });
    } catch { /* ignore */ } finally { setPortalBusy(false); }
  }

  async function load() {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(Array.isArray(data) ? data : data.data || []);
      setError("");
    } catch {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await createClient({ name: name.trim(), cnpj: cnpj.trim() || undefined });
      setName("");
      setCnpj("");
      setShowForm(false);
      await load();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || t.createError);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string, clientName: string) {
    if (!window.confirm(t.confirmDelete(clientName))) return;
    try {
      await deleteClient(id);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error || t.deleteError);
    }
  }

  function scoreColor(score: number) {
    if (score >= 80) return "border-l-emerald-500";
    if (score >= 50) return "border-l-amber-500";
    return "border-l-rose-500";
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold"
        >
          {showForm ? t.cancel : t.newClient}
        </button>
      </div>
      <ExplainData screen="Carteira de clientes" data={{ clientes: clients.map((c: any) => ({ nome: c.name, health: c.healthScore, integracoes: c.integrationCount ?? c._count?.integrations, alertas: c.alertCount ?? c._count?.alerts })) }} label={t.explainLabel} />

      {error && <div className="text-rose-400">{error}</div>}

      {showForm && (
        <form onSubmit={onCreate} className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08] max-w-xl space-y-3">
          <div>
            <label htmlFor="cli-name" className="block text-sm text-[#9b95ad] mb-1">{t.nameLabel}</label>
            <input
              id="cli-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
              placeholder={t.namePlaceholder}
            />
          </div>
          <div>
            <label htmlFor="cli-cnpj" className="block text-sm text-[#9b95ad] mb-1">{t.cnpjLabel}</label>
            <input
              id="cli-cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
              placeholder="00.000.000/0001-00"
            />
          </div>
          {formError && <p className="text-rose-400 text-sm">{formError}</p>}
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40"
          >
            {saving ? t.saving : t.createClient}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className={`bg-[#1a1527] rounded-xl p-5 border border-white/[0.08] border-l-4 ${scoreColor(
              client.healthScore
            )} hover:bg-[#231d35] transition-colors`}
          >
            <div className="flex items-center gap-4">
              <div
                onClick={() => router.push(`/clients/${client.id}`)}
                className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
              >
                <HealthScoreRing score={client.healthScore || 0} size={64} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{client.name}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-[#9b95ad]">
                    <span>{client.integrationCount || 0} {t.integrations}</span>
                    <span>{client.alertCount || 0} {t.alerts}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openPortal(client.id)}
                  aria-label={t.portalAria(client.name)}
                  title={t.portalTitle}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${activePortal === client.id ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200" : "bg-white/[0.04] border-white/[0.08] text-[#9b95ad] hover:bg-white/[0.1] hover:text-cyan-200"}`}
                >
                  🔗 <span className="hidden sm:inline">{t.portalShort}</span>
                </button>
                <button
                  onClick={() => openStatus(client.id)}
                  aria-label={t.statusAria(client.name)}
                  title={t.statusTitle}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${activeStatus === client.id ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200" : "bg-white/[0.04] border-white/[0.08] text-[#9b95ad] hover:bg-white/[0.1] hover:text-emerald-200"}`}
                >
                  📊 <span className="hidden sm:inline">{t.statusShort}</span>
                </button>
                <button
                  onClick={() => onDelete(client.id, client.name)}
                  aria-label={t.deleteAria(client.name)}
                  title={t.deleteTitle}
                  className="text-[#9b95ad] hover:text-rose-400 hover:bg-white/[0.06] text-base px-2 py-1.5 rounded-lg cursor-pointer transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {activePortal === client.id && (
              <div className="mt-3 pt-3 border-t border-white/[0.06] text-sm">
                {!portalInfo ? (
                  <p className="text-[#9b95ad] text-xs">{t.portalLoading}</p>
                ) : portalInfo.enabled && portalInfo.url ? (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400">{t.portalActive}</p>
                    <div className="flex gap-1">
                      <input readOnly value={portalInfo.url} className="flex-1 bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-2 py-1 text-xs text-[#c9c5d6]" />
                      <button onClick={() => { navigator.clipboard?.writeText(portalInfo.url!); setCopied(true); }} className="text-xs px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer">{copied ? "✓" : t.copy}</button>
                    </div>
                    <button onClick={() => togglePortal(client.id, false)} disabled={portalBusy} className="text-xs text-rose-300 hover:underline cursor-pointer disabled:opacity-40">{t.disablePortal}</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-[#9b95ad]">{t.portalPitch}</p>
                    <button onClick={() => togglePortal(client.id, true)} disabled={portalBusy} className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 cursor-pointer disabled:opacity-40">{portalBusy ? "..." : t.enablePortal}</button>
                  </div>
                )}
              </div>
            )}

            {activeStatus === client.id && (
              <div className="mt-3 pt-3 border-t border-white/[0.06] text-sm">
                {statusInfo?.enabled && statusInfo.token ? (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400">{t.statusActive}</p>
                    <div className="flex gap-1">
                      <input readOnly value={`${typeof window !== "undefined" ? window.location.origin : ""}/status/${statusInfo.token}`} className="flex-1 bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-2 py-1 text-xs text-[#c9c5d6]" />
                      <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/status/${statusInfo!.token}`); setStatusCopied(true); }} className="text-xs px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] cursor-pointer">{statusCopied ? "✓" : t.copy}</button>
                    </div>
                    <button onClick={() => toggleStatus(client.id, false)} disabled={statusBusy} className="text-xs text-rose-300 hover:underline cursor-pointer disabled:opacity-40">{t.disableStatus}</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-[#9b95ad]">{t.statusPitch}</p>
                    <button onClick={() => toggleStatus(client.id, true)} disabled={statusBusy} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 cursor-pointer disabled:opacity-40">{statusBusy ? "..." : t.enableStatus}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {clients.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-[#9b95ad] mb-3">{t.noClients}</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold"
          >
            {t.registerFirst}
          </button>
        </div>
      )}
    </div>
  );
}
