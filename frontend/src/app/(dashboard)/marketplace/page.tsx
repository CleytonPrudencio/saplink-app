"use client";

import { useEffect, useState, useCallback } from "react";
import { getMarketplace, getMyRunbooks, getRunbook, createRunbook, publishRunbook, deleteRunbook, installRunbook, uninstallRunbook, rateRunbook, getMe } from "@/lib/api";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

const CATS = ["GERAL", "CPI", "IDOC", "FISCAL", "RFC", "S4"];
const KIND_KEYS = ["DIAGNOSE", "ACTION", "VALIDATE"] as const;
type KindLabelKey = "kindDiagnose" | "kindAction" | "kindValidate";
const KIND_LABEL: Record<(typeof KIND_KEYS)[number], KindLabelKey> = { DIAGNOSE: "kindDiagnose", ACTION: "kindAction", VALIDATE: "kindValidate" };
const kindCls: Record<string, string> = { DIAGNOSE: "bg-cyan-500/15 text-cyan-300", ACTION: "bg-purple-500/15 text-purple-300", VALIDATE: "bg-emerald-500/15 text-emerald-300" };

function Stars({ value, onRate }: { value: number; onRate?: (n: number) => void }) {
  return <span className="inline-flex gap-0.5">{[1, 2, 3, 4, 5].map((n) => <button key={n} disabled={!onRate} onClick={() => onRate?.(n)} className={`${onRate ? "cursor-pointer" : ""} text-sm ${n <= Math.round(value) ? "text-amber-300" : "text-[#3a3550]"}`}>★</button>)}</span>;
}

export default function MarketplacePage() {
  const { lang } = useLang();
  const t = T[lang];
  const [tab, setTab] = useState<"explore" | "mine">("explore");
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [mineData, setMineData] = useState<{ authored: any[]; installed: any[] } | null>(null);
  const [q, setQ] = useState(""); const [cat, setCat] = useState("");
  const [detail, setDetail] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ name: "", description: "", category: "GERAL", triggerKeywords: "", steps: [{ kind: "DIAGNOSE", title: "", detail: "" }], published: true });
  const [msg, setMsg] = useState("");

  const loadMarket = useCallback(async () => { setItems((await getMarketplace({ q, category: cat })).runbooks); }, [q, cat]);
  const loadMine = useCallback(async () => { setMineData(await getMyRunbooks()); }, []);
  useEffect(() => { getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {}); }, []);
  useEffect(() => { if (tab === "explore") loadMarket().catch(() => {}); else loadMine().catch(() => {}); }, [tab, loadMarket, loadMine]);

  async function openDetail(id: string) { try { setDetail((await getRunbook(id)).runbook); } catch { /* */ } }
  async function doInstall(id: string, on: boolean) { try { if (on) await installRunbook(id); else await uninstallRunbook(id); await loadMarket(); if (detail?.id === id) openDetail(id); } catch { /* */ } }
  async function doRate(id: string, n: number) { try { await rateRunbook(id, n); if (detail?.id === id) openDetail(id); await loadMine(); } catch { /* */ } }
  async function save() {
    setMsg("");
    try { await createRunbook(form); setShowForm(false); setForm({ name: "", description: "", category: "GERAL", triggerKeywords: "", steps: [{ kind: "DIAGNOSE", title: "", detail: "" }], published: true }); setTab("mine"); await loadMine(); }
    catch (e: any) { setMsg(e?.response?.data?.error || t.saveError); }
  }
  function setStep(i: number, k: string, v: string) { setForm((f: any) => ({ ...f, steps: f.steps.map((s: any, j: number) => j === i ? { ...s, [k]: v } : s) })); }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">🛒 {t.title}</h1>
          <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        </div>
        {isAdmin && <button onClick={() => setShowForm((v) => !v)} className="text-sm px-3 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 cursor-pointer">{showForm ? t.cancel : t.publishRunbook}</button>}
      </div>

      {showForm && isAdmin && (
        <div className="bg-[#1a1527] border border-purple-500/20 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.namePlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">{CATS.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t.descriptionPlaceholder} className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          <input value={form.triggerKeywords} onChange={(e) => setForm({ ...form, triggerKeywords: e.target.value })} placeholder={t.keywordsPlaceholder} className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          <p className="text-xs text-[#9b95ad]">{t.stepsLabel}</p>
          {form.steps.map((s: any, i: number) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_2fr] gap-2">
              <select value={s.kind} onChange={(e) => setStep(i, "kind", e.target.value)} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-2 py-2 text-sm">{KIND_KEYS.map((k) => <option key={k} value={k}>{t[KIND_LABEL[k]]}</option>)}</select>
              <input value={s.title} onChange={(e) => setStep(i, "title", e.target.value)} placeholder={t.stepTitlePlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
              <input value={s.detail} onChange={(e) => setStep(i, "detail", e.target.value)} placeholder={t.stepDetailPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setForm((f: any) => ({ ...f, steps: [...f.steps, { kind: "ACTION", title: "", detail: "" }] }))} className="text-xs px-2 py-1 rounded bg-white/[0.06] text-[#9b95ad] cursor-pointer">{t.addStep}</button>
            <label className="text-xs text-[#9b95ad] flex items-center gap-1.5 ml-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-purple-500" />{t.publishCheckbox}</label>
            <button onClick={save} className="text-sm px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold cursor-pointer ml-auto">{t.saveRunbook}</button>
          </div>
          {msg && <p className="text-sm text-rose-300">{msg}</p>}
        </div>
      )}

      <div className="flex bg-[#1a1527] rounded-lg p-1 border border-white/[0.08] w-fit">
        {[["explore", t.tabExplore], ["mine", t.tabMine]].map(([k, l]) => <button key={k} onClick={() => setTab(k as any)} className={`px-4 py-1.5 rounded-md text-sm font-medium cursor-pointer ${tab === k ? "bg-purple-500/20 text-purple-300" : "text-[#9b95ad]"}`}>{l}</button>)}
      </div>

      {tab === "explore" && (
        <>
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.searchPlaceholder} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]" />
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="bg-[#1a1527] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"><option value="">{t.allCategories}</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((r) => (
              <div key={r.id} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06]">{r.category}</span>{r.mine && <span className="text-[10px] text-purple-300">{t.yours}</span>}</div>
                <button onClick={() => openDetail(r.id)} className="text-left font-semibold text-[#e2e0ea] hover:text-purple-300 cursor-pointer">{r.name}</button>
                <p className="text-xs text-[#9b95ad] mt-1 flex-1">{r.description}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-[#9b95ad]">
                  <span>{t.byAuthor(r.author)} · {t.stepsCount(r.steps)}</span><span><Stars value={r.rating} /> {r.installs}↓</span>
                </div>
                <button onClick={() => doInstall(r.id, !r.installed)} className={`mt-3 w-full py-2 rounded-lg text-sm font-semibold cursor-pointer ${r.installed ? "bg-white/[0.06] text-[#9b95ad]" : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"}`}>{r.installed ? t.installedRemove : t.install}</button>
              </div>
            ))}
            {items.length === 0 && <p className="text-[#9b95ad] text-sm">{t.emptyExplore} {isAdmin ? t.emptyExplorePublishFirst : ""}</p>}
          </div>
        </>
      )}

      {tab === "mine" && mineData && (
        <div className="space-y-6">
          <section>
            <h2 className="font-semibold mb-2">{t.authoredTitle}</h2>
            <div className="space-y-2">
              {mineData.authored.map((r) => (
                <div key={r.id} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap">
                  <button onClick={() => openDetail(r.id)} className="text-left"><span className="font-medium text-[#e2e0ea]">{r.name}</span> <span className="text-xs text-[#9b95ad]">· {r.category} · {r.installs}↓ · {r.published ? t.publishedTag : t.draftTag}</span></button>
                  <div className="flex gap-2">
                    <button onClick={async () => { await publishRunbook(r.id, !r.published); loadMine(); }} className="text-xs px-2.5 py-1 rounded bg-white/[0.06] text-[#9b95ad] hover:text-white cursor-pointer">{r.published ? t.unpublish : t.publish}</button>
                    <button onClick={async () => { if (confirm(t.confirmDelete)) { await deleteRunbook(r.id); loadMine(); } }} className="text-xs px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 cursor-pointer">{t.delete}</button>
                  </div>
                </div>
              ))}
              {mineData.authored.length === 0 && <p className="text-[#9b95ad] text-sm">{t.noAuthored}</p>}
            </div>
          </section>
          <section>
            <h2 className="font-semibold mb-2">{t.installedTitle}</h2>
            <div className="space-y-2">
              {mineData.installed.map((r) => (
                <div key={r.id} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between gap-2 flex-wrap">
                  <button onClick={() => openDetail(r.id)} className="text-left"><span className="font-medium text-[#e2e0ea]">{r.name}</span> <span className="text-xs text-[#9b95ad]">· {t.byAuthorShort(r.author)}</span></button>
                  <div className="flex items-center gap-2"><Stars value={r.myRating || 0} onRate={(n) => doRate(r.id, n)} /><button onClick={() => doInstall(r.id, false)} className="text-xs px-2.5 py-1 rounded bg-white/[0.06] text-[#9b95ad] cursor-pointer">{t.remove}</button></div>
                </div>
              ))}
              {mineData.installed.length === 0 && <p className="text-[#9b95ad] text-sm">{t.noInstalled}</p>}
            </div>
          </section>
        </div>
      )}

      {/* Detalhe */}
      {detail && (
        <div className="fixed inset-0 z-[60] bg-[#0f0b1a]/40 backdrop-blur-xl flex items-start sm:items-center justify-center p-0 sm:p-6 overflow-y-auto" onClick={() => setDetail(null)}>
          <div className="bg-[#211a3a] w-full sm:rounded-2xl ring-1 ring-purple-400/20 border border-white/[0.12] sm:my-6 max-w-full sm:max-w-2xl max-h-[100dvh] sm:max-h-[88vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-white/[0.1] sticky top-0 bg-[#211a3a] z-10">
              <span className="text-2xl">🛒</span>
              <div className="flex-1 min-w-0"><h2 className="font-bold truncate">{detail.name}</h2><p className="text-xs text-[#9b95ad]">{detail.category} · {t.byAuthor(detail.author)} · {detail.installs}↓ · <Stars value={detail.rating} /></p></div>
              <button onClick={() => setDetail(null)} className="text-[#9b95ad] hover:text-white text-2xl cursor-pointer">×</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {detail.description && <p className="text-sm text-[#c9c5d6]">{detail.description}</p>}
              <div className="space-y-2">
                {(detail.steps || []).map((s: any, i: number) => (
                  <div key={i} className="bg-[#0f0b1a] rounded-lg p-3 flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                    <div><span className={`text-[10px] px-1.5 py-0.5 rounded ${kindCls[s.kind] || ""}`}>{KIND_LABEL[s.kind as (typeof KIND_KEYS)[number]] ? t[KIND_LABEL[s.kind as (typeof KIND_KEYS)[number]]] : s.kind}</span><p className="text-sm text-[#e2e0ea] mt-1 font-medium">{s.title}</p>{s.detail && <p className="text-xs text-[#9b95ad] mt-0.5">{s.detail}</p>}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => doInstall(detail.id, !detail.installed)} className={`w-full py-2.5 rounded-lg text-sm font-semibold cursor-pointer ${detail.installed ? "bg-white/[0.06] text-[#9b95ad]" : "bg-emerald-500 text-white"}`}>{detail.installed ? t.installedRemove : t.installRunbook}</button>
              {detail.installed && <div className="text-center text-xs text-[#9b95ad]">{t.yourRating} <Stars value={detail.myRating || 0} onRate={(n) => doRate(detail.id, n)} /></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
