"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getS4Overview, getS4Comm, getS4Apis, getMe, getClients, getCpiConfigs, saveCpiConfig, syncCpi, getS4Connections, saveS4Connection, syncS4Connection } from "@/lib/api";
import EnvLabel from "@/components/EnvLabel";
import ExplainData from "@/components/ExplainData";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }
const SEV: Record<string, string> = { EXPIRED: "text-rose-400", CRITICAL: "text-orange-400", WARN: "text-amber-300", OK: "text-emerald-400" };

export default function S4Page() {
  const { lang } = useLang();
  const t = T[lang];
  const [ov, setOv] = useState<Record<string, number> | null>(null);
  const [comm, setComm] = useState<any>(null);
  const [apis, setApis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // conector CPI (admin)
  const [isAdmin, setIsAdmin] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [cpi, setCpi] = useState<any[]>([]);
  const [form, setForm] = useState({ clientId: "", baseUrl: "", tokenUrl: "", oauthClientId: "", oauthSecret: "" });
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");

  // conector S/4 sandbox (APIKey) — dados reais sem S-user
  const [s4conns, setS4conns] = useState<any[]>([]);
  const [s4form, setS4form] = useState({ clientId: "", apiKey: "" });
  const [s4busy, setS4busy] = useState("");
  const [s4msg, setS4msg] = useState("");

  async function loadCpi() { try { setCpi((await getCpiConfigs()).configs); } catch { /* */ } }
  async function loadS4() { try { setS4conns((await getS4Connections()).connections); } catch { /* */ } }

  useEffect(() => {
    Promise.all([getS4Overview(), getS4Comm(), getS4Apis()])
      .then(([o, c, a]) => { setOv(o); setComm(c); setApis(a); })
      .catch(() => {}).finally(() => setLoading(false));
    getMe().then((u) => {
      const admin = u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN";
      setIsAdmin(admin);
      if (admin) { getClients().then((cs: any[]) => setClients(cs.map((c) => ({ id: c.id, name: c.name })))).catch(() => {}); loadCpi(); loadS4(); }
    }).catch(() => {});
  }, []);

  async function onSaveCpi(e: React.FormEvent) {
    e.preventDefault(); if (!form.clientId) return;
    setBusy("save"); setMsg("");
    try { await saveCpiConfig(form.clientId, form); setMsg(t.msgSaved); await loadCpi(); }
    catch (err: any) { setMsg(err?.response?.data?.error || t.errSave); } finally { setBusy(""); }
  }
  async function onSyncCpi(clientId: string) {
    setBusy(clientId); setMsg("");
    try { const r = await syncCpi(clientId); setMsg(r.ok ? t.syncOk(r.fetched) : t.syncFail(r.reason)); await loadCpi(); }
    catch (err: any) { setMsg(err?.response?.data?.error || t.errSync); } finally { setBusy(""); }
  }

  async function onSaveS4(e: React.FormEvent) {
    e.preventDefault(); if (!s4form.clientId || !s4form.apiKey) return;
    setS4busy("save"); setS4msg("");
    try {
      await saveS4Connection(s4form.clientId, { baseUrl: "https://sandbox.api.sap.com/s4hanacloud", authType: "APIKEY", authToken: s4form.apiKey, release: "sandbox" });
      const r = await syncS4Connection(s4form.clientId);
      setS4msg(r.ok ? t.s4SyncOk(r.reachable, r.probed, r.deprecated) : t.s4SyncSaved);
      setS4form({ clientId: "", apiKey: "" });
      await loadS4(); Promise.all([getS4Overview(), getS4Apis()]).then(([o, a]) => { setOv(o); setApis(a); }).catch(() => {});
    } catch (err: any) { setS4msg(err?.response?.data?.error || t.errConnect); } finally { setS4busy(""); }
  }
  async function onSyncS4(clientId: string) {
    setS4busy(clientId); setS4msg("");
    try { const r = await syncS4Connection(clientId); setS4msg(r.ok ? t.s4ResyncOk(r.reachable, r.probed) : t.s4ResyncNone); await loadS4(); Promise.all([getS4Overview(), getS4Apis()]).then(([o, a]) => { setOv(o); setApis(a); }).catch(() => {}); }
    catch (err: any) { setS4msg(err?.response?.data?.error || t.errSync); } finally { setS4busy(""); }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  const cards = [
    { l: t.cardCleanCore, v: `${ov?.cleanCoreScore ?? 0}`, c: (ov?.cleanCoreScore ?? 0) >= 80 ? "text-emerald-400" : "text-amber-300", href: "/cleancore" },
    { l: t.cardUpgradeBreaking, v: `${ov?.upgradeBreaking ?? 0}`, c: "text-rose-400", href: "/upgrade" },
    { l: t.cardUpgradeFindings, v: `${ov?.upgradeFindings ?? 0}`, c: "text-purple-300", href: "/upgrade" },
    { l: t.cardFiscalBlocked, v: `${ov?.fiscalBlocked ?? 0}`, c: "text-rose-400", href: "/fiscal" },
    { l: t.cardFiscalAtRisk, v: brl(ov?.fiscalAtRiskCents ?? 0), c: "text-amber-300", href: "/fiscal" },
    { l: t.cardCommExpiring, v: `${ov?.commExpiring ?? 0}`, c: "text-amber-300", href: "/s4" },
    { l: t.cardEventsDeadLetter, v: `${ov?.eventsDeadLetter ?? 0}`, c: "text-rose-400", href: "/events" },
    { l: t.cardApisDeprecated, v: `${ov?.apisDeprecated ?? 0}`, c: "text-orange-400", href: "/upgrade" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-bold flex items-center gap-2">☁️ {t.title}</h1>
          <EnvLabel />
        </div>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen={t.explainScreen} data={{ overview: ov, apis: apis?.summary, comm: comm?.summary }} /></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Link key={c.l} href={c.href} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 hover:border-purple-500/40 transition">
            <div className={`text-2xl font-bold ${c.c}`}>{c.v}</div>
            <div className="text-[11px] text-[#9b95ad] mt-1">{c.l}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Comm Arrangements */}
        <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-3">{t.commTitle}</h2>
          <div className="space-y-2">
            {(comm?.items || []).slice(0, 6).map((a: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-[#e2e0ea] truncate">{a.name} <span className="text-xs text-[#9b95ad]">· {a.scenario}</span></p>
                  <p className="text-xs text-[#9b95ad]">{a.client} · {a.direction || "—"} · {a.commUser || "—"}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-semibold ${a.status === "ERROR" ? "text-rose-400" : "text-emerald-400"}`}>{a.status}</span>
                  {a.certExpiresAt && <p className={`text-[11px] ${SEV[a.certSeverity]}`}>{t.certPrefix} {new Date(a.certExpiresAt).toLocaleDateString("pt-BR")}</p>}
                </div>
              </div>
            ))}
            {(!comm?.items || comm.items.length === 0) && <p className="text-sm text-[#9b95ad]">{t.noArrangements}</p>}
          </div>
        </div>

        {/* APIs */}
        <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-3">{t.apisTitle} <span className="text-xs text-[#9b95ad]">{t.apisDeprecatedSuffix(apis?.summary?.deprecated ?? 0)}</span></h2>
          <div className="space-y-2">
            {(apis?.items || []).slice(0, 6).map((a: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-mono text-[#e2e0ea] truncate">{a.apiName} <span className="text-[#9b95ad]">{a.version}</span></p>
                  <p className="text-xs text-[#9b95ad]">{a.scenario || ""} · {t.calls30d(a.calls30d.toLocaleString("pt-BR"))}</p>
                </div>
                {a.deprecated
                  ? <span className="text-[11px] text-rose-300 shrink-0">{t.deprecatesIn(a.deprecationRelease)}</span>
                  : <span className="text-[11px] text-emerald-400 shrink-0">{t.apiOk}</span>}
              </div>
            ))}
            {(!apis?.items || apis.items.length === 0) && <p className="text-sm text-[#9b95ad]">{t.noInventory}</p>}
          </div>
        </div>
      </div>

      {/* Conector REAL S/4 sandbox (admin) — dados reais sem S-user */}
      {isAdmin && (
        <div className="bg-[#1a1527] rounded-xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between gap-2 flex-wrap"><h2 className="text-lg font-semibold">🛰️ {t.s4ConnectTitle}</h2><EnvLabel prefix={t.configuring} /></div>
          <p className="text-[#9b95ad] text-sm mt-1">{t.s4ConnectDesc1}<b>API Key</b>{t.s4ConnectMid}<a href="https://api.sap.com" target="_blank" rel="noreferrer" className="text-cyan-300 underline">{t.s4ConnectHub}</a>{t.s4ConnectDesc2}</p>

          {s4conns.length > 0 && (
            <div className="space-y-2 my-3">
              {s4conns.map((c) => (
                <div key={c.clientId} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2 flex-wrap gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-[#e2e0ea]">{c.client} <span className="text-xs text-[#9b95ad]">· {c.release || "—"} · {c.status}</span></p>
                    <p className="text-xs text-[#9b95ad]">{t.lastSync}: {c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleString("pt-BR") : t.never} {c.hasToken ? `· ${t.keySaved}` : `· ${t.noKey}`}</p>
                  </div>
                  <button onClick={() => onSyncS4(c.clientId)} disabled={s4busy === c.clientId || !c.hasToken} className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 disabled:opacity-40 cursor-pointer">{s4busy === c.clientId ? "..." : t.syncNow}</button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={onSaveS4} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <select value={s4form.clientId} onChange={(e) => setS4form({ ...s4form, clientId: e.target.value })} required className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
              <option value="">{t.clientPlaceholder}</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={s4form.apiKey} onChange={(e) => setS4form({ ...s4form, apiKey: e.target.value })} type="password" required placeholder={t.apiKeyPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            <button type="submit" disabled={s4busy === "save"} className="sm:col-span-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer">{s4busy === "save" ? t.connecting : t.connectAndSync}</button>
          </form>
          {s4msg && <p className="text-sm text-cyan-300 mt-2">{s4msg}</p>}
        </div>
      )}

      {/* Conector REAL CPI (admin) */}
      {isAdmin && (
        <div className="bg-[#1a1527] rounded-xl p-5 border border-purple-500/20">
          <div className="flex items-center justify-between gap-2 flex-wrap"><h2 className="text-lg font-semibold">🔌 {t.cpiConnectTitle}</h2><EnvLabel prefix={t.configuring} /></div>
          <p className="text-[#9b95ad] text-sm mt-1">{t.cpiConnectDesc}</p>

          {cpi.length > 0 && (
            <div className="space-y-2 my-3">
              {cpi.map((c) => (
                <div key={c.clientId} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2 flex-wrap gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-[#e2e0ea]">{c.client} <span className="text-xs text-[#9b95ad]">· {c.baseUrl}</span></p>
                    <p className="text-xs text-[#9b95ad]">{t.lastSync}: {c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleString("pt-BR") : t.never} · {c.lastResult || "—"}</p>
                  </div>
                  <button onClick={() => onSyncCpi(c.clientId)} disabled={busy === c.clientId} className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 disabled:opacity-40 cursor-pointer">{busy === c.clientId ? "..." : t.syncNow}</button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={onSaveCpi} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} required className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
              <option value="">{t.clientPlaceholder}</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={form.oauthClientId} onChange={(e) => setForm({ ...form, oauthClientId: e.target.value })} required placeholder="clientid" className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            <input value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} required placeholder={t.baseUrlPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-2" />
            <input value={form.tokenUrl} onChange={(e) => setForm({ ...form, tokenUrl: e.target.value })} required placeholder={t.tokenUrlPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-2" />
            <input value={form.oauthSecret} onChange={(e) => setForm({ ...form, oauthSecret: e.target.value })} type="password" placeholder="clientsecret" className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-2" />
            <button type="submit" disabled={busy === "save"} className="sm:col-span-2 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer">{busy === "save" ? t.saving : t.saveConnection}</button>
          </form>
          {msg && <p className="text-sm text-emerald-400 mt-2">{msg}</p>}
        </div>
      )}

      <p className="text-xs text-[#6b6580]">{t.footer}</p>
    </div>
  );
}
