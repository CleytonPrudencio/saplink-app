"use client";

import { useEffect, useState } from "react";
import { getSsoConfig, saveSsoConfig, getMe } from "@/lib/api";

const PROVIDERS: Record<string, { label: string; issuerHint: string; doc: string }> = {
  azure: { label: "Microsoft / Azure AD (Entra ID)", issuerHint: "https://login.microsoftonline.com/SEU_TENANT_ID/v2.0", doc: "Entra ID → App registrations → Redirect URI (Web) → adicione o callback abaixo. Issuer usa o Directory (tenant) ID." },
  google: { label: "Google Workspace", issuerHint: "https://accounts.google.com", doc: "Google Cloud Console → APIs & Services → Credentials → OAuth client (Web). Adicione o redirect URI abaixo. Issuer é fixo." },
  okta: { label: "Okta", issuerHint: "https://SEU_DOMINIO.okta.com/oauth2/default", doc: "Okta Admin → Applications → Create App Integration → OIDC Web. Adicione o redirect URI abaixo no Sign-in redirect URIs." },
};

export default function SsoPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cfg, setCfg] = useState<any>(null);
  const [form, setForm] = useState<any>({ provider: "azure", enabled: false, clientId: "", clientSecret: "", issuer: "", emailDomain: "" });
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {}); }, []);
  useEffect(() => { getSsoConfig().then((c) => { setCfg(c); setForm((f: any) => ({ ...f, provider: c.provider, enabled: c.enabled, clientId: c.clientId, issuer: c.issuer, emailDomain: c.emailDomain })); }).catch(() => {}); }, []);

  async function save() {
    setSaving(true); setMsg(null);
    try { await saveSsoConfig(form); setMsg({ ok: true, text: "SSO salvo." }); const c = await getSsoConfig(); setCfg(c); setForm((f: any) => ({ ...f, clientSecret: "" })); }
    catch (e: any) { setMsg({ text: e?.response?.data?.error || "Erro ao salvar." }); }
    finally { setSaving(false); }
  }

  const p = PROVIDERS[form.provider] || PROVIDERS.azure;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">🔐 SSO / Login corporativo</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Conecte seu provedor de identidade (Azure AD, Google ou Okta) e seu time entra com a conta da empresa. Os usuários precisam já existir no SAPLINK (mesmo e-mail).</p>
      </div>

      {!isAdmin && <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200">Apenas administradores configuram o SSO.</div>}

      {isAdmin && (
        <div className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs text-[#9b95ad] block mb-1">Provedor</label>
            <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
              {Object.entries(PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <p className="text-xs text-[#6b6580] mt-1.5">{p.doc}</p>
          </div>

          <div className="bg-[#0f0b1a] border border-purple-500/20 rounded-lg p-3">
            <p className="text-xs text-[#9b95ad]">Cadastre este <b>Redirect URI</b> no seu IdP:</p>
            <code className="text-xs text-purple-200 break-all">{cfg?.redirectUri || "—"}</code>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-[#9b95ad] block mb-1">Client ID</label><input value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-[#9b95ad] block mb-1">Client Secret {cfg?.hasSecret && <span className="text-emerald-400">(salvo — deixe em branco p/ manter)</span>}</label><input type="password" value={form.clientSecret} onChange={(e) => setForm({ ...form, clientSecret: e.target.value })} placeholder={cfg?.hasSecret ? "••••••••" : ""} className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" /></div>
          </div>

          <div><label className="text-xs text-[#9b95ad] block mb-1">Issuer (OIDC)</label><input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder={p.issuerHint} className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm font-mono" /><p className="text-xs text-[#6b6580] mt-1">Ex.: {p.issuerHint}</p></div>

          <div><label className="text-xs text-[#9b95ad] block mb-1">Domínio de e-mail</label><input value={form.emailDomain} onChange={(e) => setForm({ ...form, emailDomain: e.target.value })} placeholder="suaempresa.com" className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" /><p className="text-xs text-[#6b6580] mt-1">Quem digitar um e-mail @{form.emailDomain || "suaempresa.com"} na tela de login será direcionado a este IdP.</p></div>

          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} className="accent-purple-500" />Habilitar SSO para esta conta</label>

          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-lg bg-purple-500 text-white font-semibold cursor-pointer disabled:opacity-50">{saving ? "Salvando…" : "Salvar SSO"}</button>
            {msg && <span className={`text-sm ${msg.ok ? "text-emerald-300" : "text-rose-300"}`}>{msg.text}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
