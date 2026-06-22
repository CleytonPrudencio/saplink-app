"use client";

import { useEffect, useState, useCallback } from "react";
import { getBtp, createBtp, deleteBtp, getMe } from "@/lib/api";
import { usePaginate, Pagination } from "@/components/Pagination";
import ExplainData from "@/components/ExplainData";
import EnvLabel from "@/components/EnvLabel";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

const KINDS = [["SERVICE_KEY", "Service Key"], ["BINDING", "Binding"], ["DESTINATION", "Destination"], ["QUOTA", "Quota"], ["APP", "App (CF/Kyma)"]];
const statusCls: Record<string, string> = { EXPIRED: "bg-rose-500/15 text-rose-300", WARN: "bg-amber-500/15 text-amber-300", DOWN: "bg-rose-500/15 text-rose-300", OK: "bg-emerald-500/15 text-emerald-300" };

export default function BtpPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<any>({ clientId: "", kind: "SERVICE_KEY", name: "", subaccount: "", detail: "", expiresAt: "", status: "OK" });
  const [msg, setMsg] = useState("");
  const { lang } = useLang();
  const t = T[lang];

  const load = useCallback(async () => { try { setData(await getBtp()); } finally { setLoading(false); } }, []);
  useEffect(() => { getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  const pag = usePaginate<any>(data?.items || [], 20);

  async function add() {
    setMsg("");
    try { await createBtp(form); setShow(false); setForm({ ...form, name: "", subaccount: "", detail: "", expiresAt: "" }); await load(); }
    catch (e: any) { setMsg(e?.response?.data?.error || t.error); }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  const s = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap"><h1 className="text-2xl font-bold flex items-center gap-2">🪐 {t.title}</h1><EnvLabel /></div>
          <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
          <ExplainData screen="BTP Cockpit" data={{ resumo: s, itens: (data?.items || []).slice(0, 15) }} />
        </div>
        {isAdmin && <button onClick={() => setShow((v) => !v)} className="text-sm px-3 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 cursor-pointer">{show ? t.cancel : t.add}</button>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card label={t.total} value={s?.total ?? 0} />
        <Card label={t.expired} value={s?.expired ?? 0} tone="rose" />
        <Card label={t.warn} value={s?.warn ?? 0} tone="amber" />
        <Card label={t.down} value={s?.down ?? 0} tone="rose" />
      </div>

      {show && isAdmin && (
        <div className="bg-[#1a1527] border border-purple-500/20 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"><option value="">{t.clientPlaceholder}</option>{(data?.clients || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">{KINDS.map((k) => <option key={k[0]} value={k[0]}>{k[1]}</option>)}</select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.namePlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            <input value={form.subaccount} onChange={(e) => setForm({ ...form, subaccount: e.target.value })} placeholder={t.subaccountPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder={t.detailPlaceholder} className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            <div><label className="text-xs text-[#9b95ad] block mb-1">{t.expiresLabel}</label><input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" /></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={add} className="text-sm px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold cursor-pointer">{t.addBtn}</button>
            {msg && <span className="text-sm text-rose-300">{msg}</span>}
          </div>
        </div>
      )}

      <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[#9b95ad] text-xs"><tr><th className="text-left px-3 py-2">{t.colClient}</th><th className="text-left px-3 py-2">{t.colKind}</th><th className="text-left px-3 py-2">{t.colResource}</th><th className="text-left px-3 py-2">{t.colSubaccount}</th><th className="text-left px-3 py-2">{t.colExpires}</th><th className="text-left px-3 py-2">{t.colStatus}</th>{isAdmin && <th></th>}</tr></thead>
          <tbody>
            {pag.pageItems.map((i: any) => (
              <tr key={i.id} className="border-t border-white/[0.05]">
                <td className="px-3 py-2">{i.client}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{(KINDS.find((k) => k[0] === i.kind) || [])[1] || i.kind}</td>
                <td className="px-3 py-2 font-mono text-xs">{i.name}{i.detail && <span className="text-[#6b6580]"> · {i.detail}</span>}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{i.subaccount || "—"}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{i.expiresAt ? new Date(i.expiresAt).toLocaleDateString("pt-BR") : "—"}</td>
                <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${statusCls[i.status] || ""}`}>{i.status}</span></td>
                {isAdmin && <td className="px-3 py-2 text-right"><button onClick={async () => { if (confirm(t.removeConfirm)) { await deleteBtp(i.id); load(); } }} className="text-xs text-rose-300 cursor-pointer">×</button></td>}
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && <tr><td colSpan={isAdmin ? 7 : 6} className="px-3 py-6 text-center text-[#9b95ad]">{t.empty}</td></tr>}
          </tbody>
        </table>
        <div className="px-3 pb-3"><Pagination {...pag} /></div>
      </div>
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: number; tone?: string }) {
  const c = tone === "rose" ? "text-rose-300" : tone === "amber" ? "text-amber-300" : "text-[#e2e0ea]";
  return <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3"><div className={`text-2xl font-bold ${c}`}>{value}</div><div className="text-xs text-[#9b95ad]">{label}</div></div>;
}
