"use client";

import { useEffect, useState } from "react";
import {
  getMe, getValidityRadar, refreshCert, refreshAllCerts, setSecretExpiry,
  getAllIntegrations, type ValidityItem,
} from "@/lib/api";
import ExplainData from "@/components/ExplainData";

interface IntegrationLite { id: string; name: string; type: string; client?: { name?: string } }

const SEV: Record<string, { label: string; cls: string; dot: string }> = {
  EXPIRED: { label: "Expirado", cls: "text-rose-400 border-rose-500/30 bg-rose-500/[0.06]", dot: "bg-rose-500" },
  CRITICAL: { label: "Crítico", cls: "text-orange-400 border-orange-500/30 bg-orange-500/[0.06]", dot: "bg-orange-500" },
  WARN: { label: "Atenção", cls: "text-amber-300 border-amber-500/30 bg-amber-500/[0.06]", dot: "bg-amber-400" },
  OK: { label: "OK", cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.04]", dot: "bg-emerald-500" },
};

function fmtDays(d: number) {
  if (d < 0) return `expirou há ${Math.abs(d)} dia(s)`;
  if (d === 0) return "expira hoje";
  return `${d} dia(s)`;
}

export default function ValidityPage() {
  const [items, setItems] = useState<ValidityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rowBusy, setRowBusy] = useState<string>("");
  const [msg, setMsg] = useState("");

  // form de segredo manual
  const [integrations, setIntegrations] = useState<IntegrationLite[]>([]);
  const [form, setForm] = useState({ integrationId: "", secretLabel: "", secretExpiresAt: "" });
  const [savingSecret, setSavingSecret] = useState(false);

  async function load() {
    const r = await getValidityRadar();
    setItems(r.items);
  }

  useEffect(() => {
    getMe().then((u) => {
      const admin = u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN";
      setIsAdmin(admin);
      if (admin) getAllIntegrations().then(setIntegrations).catch(() => {});
    }).catch(() => {});
    load().catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function onRefreshAll() {
    setRefreshing(true);
    setMsg("");
    try {
      const r = await refreshAllCerts();
      setItems(r.items);
      setMsg(`Verificados ${r.checked} certificado(s); ${r.expiring} expirando em breve.`);
    } catch {
      setMsg("Erro ao reavaliar certificados.");
    } finally {
      setRefreshing(false);
    }
  }

  async function onRefreshOne(id: string) {
    setRowBusy(id);
    try {
      await refreshCert(id);
      await load();
    } catch { /* ignore */ } finally {
      setRowBusy("");
    }
  }

  async function onSaveSecret(e: React.FormEvent) {
    e.preventDefault();
    if (!form.integrationId || !form.secretExpiresAt) return;
    setSavingSecret(true);
    setMsg("");
    try {
      await setSecretExpiry(form.integrationId, {
        secretExpiresAt: new Date(form.secretExpiresAt).toISOString(),
        secretLabel: form.secretLabel.trim() || undefined,
      });
      setForm({ integrationId: "", secretLabel: "", secretExpiresAt: "" });
      await load();
      setMsg("Validade do segredo registrada.");
    } catch {
      setMsg("Erro ao registrar a validade do segredo.");
    } finally {
      setSavingSecret(false);
    }
  }

  const counts = items.reduce((a: Record<string, number>, i) => { a[i.severity] = (a[i.severity] || 0) + 1; return a; }, {});

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">📡 Radar de validade</h1>
          <p className="text-[#9b95ad] text-sm mt-1">
            Certificados TLS (detectados automaticamente) e segredos com expiração — antes de virarem incidente.
          </p>
        </div>
        {isAdmin && (
          <button onClick={onRefreshAll} disabled={refreshing}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer">
            {refreshing ? "Verificando..." : "Reavaliar certificados"}
          </button>
        )}
      </div>
      <ExplainData screen="Radar de validade (certificados/segredos)" data={{ itens: items.slice(0, 20) }} label="O que renovar primeiro (IA)" />

      {/* Resumo */}
      <div className="flex flex-wrap gap-3">
        {(["EXPIRED", "CRITICAL", "WARN", "OK"] as const).map((s) => (
          <div key={s} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${SEV[s].cls}`}>
            <span className={`w-2 h-2 rounded-full ${SEV[s].dot}`} />
            <span className="text-sm font-semibold">{counts[s] || 0}</span>
            <span className="text-xs opacity-80">{SEV[s].label}</span>
          </div>
        ))}
      </div>

      {msg && <p className="text-sm text-emerald-400">{msg}</p>}

      {/* Lista */}
      {items.length === 0 ? (
        <div className="bg-[#1a1527] rounded-xl p-8 border border-white/[0.08] text-center text-[#9b95ad]">
          Nenhuma validade monitorada ainda. Reavalie os certificados ou registre a expiração de um segredo abaixo.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((i) => {
            const sev = SEV[i.severity];
            return (
              <div key={`${i.integrationId}-${i.kind}`} className={`rounded-xl border p-4 ${sev.cls}`}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
                      <p className="font-semibold text-[#e2e0ea] truncate">{i.integration}</p>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-white/[0.06] text-[#9b95ad]">{i.kind === "CERT" ? "Certificado TLS" : i.label}</span>
                    </div>
                    <p className="text-xs text-[#9b95ad] mt-1">
                      {i.client} · {i.type}
                      {i.host ? ` · ${i.host}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{fmtDays(i.daysLeft)}</p>
                    <p className="text-xs text-[#9b95ad]">{new Date(i.expiresAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  {isAdmin && i.kind === "CERT" && (
                    <button onClick={() => onRefreshOne(i.integrationId)} disabled={rowBusy === i.integrationId}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] disabled:opacity-40 cursor-pointer">
                      {rowBusy === i.integrationId ? "..." : "Reavaliar"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registrar validade de segredo (admin) */}
      {isAdmin && (
        <form onSubmit={onSaveSecret} className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] space-y-3">
          <h2 className="text-lg font-semibold">Registrar validade de um segredo</h2>
          <p className="text-sm text-[#9b95ad]">
            Para o que a plataforma não lê sozinha: senha de usuário RFC, client secret OAuth, certificado SNC.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select value={form.integrationId} onChange={(e) => setForm({ ...form, integrationId: e.target.value })} required
              className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
              <option value="">Integração...</option>
              {integrations.map((i) => (
                <option key={i.id} value={i.id}>{i.name} ({i.type})</option>
              ))}
            </select>
            <input value={form.secretLabel} onChange={(e) => setForm({ ...form, secretLabel: e.target.value })}
              placeholder="Ex.: Senha do usuário RFC"
              className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            <input type="date" value={form.secretExpiresAt} onChange={(e) => setForm({ ...form, secretExpiresAt: e.target.value })} required
              className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={savingSecret}
            className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer">
            {savingSecret ? "Salvando..." : "Registrar validade"}
          </button>
        </form>
      )}
    </div>
  );
}
