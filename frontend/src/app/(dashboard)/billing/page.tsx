"use client";

import { useEffect, useState } from "react";
import { getBilling, getPlans, checkoutPlan, updateAddons, payInvoice, setAutoRenew, payNow, billingPortal } from "@/lib/api";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

type Tr = (typeof T)[keyof typeof T];

interface Plan {
  key: string;
  name: string;
  description?: string;
  priceCents: number;
  maxClients: number;
  maxIntegrations: number;
  maxAiDiagnosticsPerMonth: number;
  maxUsers: number;
  highlight?: boolean;
  addonIntegrationCents?: number;
  addonUserCents?: number;
}

interface Invoice {
  id: string;
  amountCents: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  dueDate: string | null;
}

interface Billing {
  status: string;
  allowed: boolean;
  reason: string | null;
  consultancyName: string | null;
  consultancyCnpj: string | null;
  plan: Plan | null;
  extras: { integrations: number; users: number };
  effectiveLimits: { clients: number; integrations: number; users: number; aiDiagnostics: number } | null;
  addonPrices: { integrationCents: number; userCents: number } | null;
  monthlyCents: number;
  autoRenew: boolean;
  gateway: "stripe" | "asaas" | null;
  hasRecurringMethod: boolean;
  openInvoice: { id: string; amountCents: number; status: string; dueDate: string | null } | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  usage: { clients: number; integrations: number; users: number; aiDiagnostics: number };
  spending: { totalPaidCents: number; series: { month: string; cents: number }[] };
  invoices: Invoice[];
}

const STATUS_CLS: Record<string, string> = {
  TRIALING: "bg-amber-500/20 text-amber-400",
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  PAST_DUE: "bg-amber-500/20 text-amber-400",
  SUSPENDED: "bg-rose-500/20 text-rose-400",
  CANCELED: "bg-rose-500/20 text-rose-400",
  NONE: "bg-white/10 text-[#9b95ad]",
};

function statusLabel(status: string, t: Tr): string {
  switch (status) {
    case "TRIALING": return t.statusTrialing;
    case "ACTIVE": return t.statusActive;
    case "PAST_DUE": return t.statusPastDue;
    case "SUSPENDED": return t.statusSuspended;
    case "CANCELED": return t.statusCanceled;
    default: return t.statusNone;
  }
}

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function printInvoice(inv: Invoice, b: Billing, t: Tr) {
  const w = window.open("", "_blank", "width=820,height=920");
  if (!w) return;
  const date = new Date(inv.paidAt || inv.createdAt).toLocaleDateString(t.dateLocale);
  const stLabel = inv.status === "PAID" ? t.pdfStatusPaid : inv.status === "OPEN" ? t.pdfStatusOpen : t.pdfStatusFailed;
  w.document.write(`<!doctype html><html lang="${t.pdfHtmlLang}"><head><meta charset="utf-8"><title>${t.pdfInvoice} ${inv.id.slice(0, 8).toUpperCase()}</title>
  <style>
    body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a2e;max-width:680px;margin:32px auto;padding:0 24px}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #7c3aed;padding-bottom:16px}
    .brand{font-size:22px;font-weight:800;color:#7c3aed;display:flex;align-items:center;gap:8px}
    .muted{color:#666;font-size:13px}
    h2{font-size:16px;margin:24px 0 8px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    td,th{text-align:left;padding:10px 8px;border-bottom:1px solid #eee;font-size:14px}
    .total{font-size:20px;font-weight:800;text-align:right;margin-top:16px}
    .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:#e6f9ee;color:#0a8a43}
    .foot{margin-top:40px;color:#999;font-size:12px;border-top:1px solid #eee;padding-top:12px}
  </style></head><body>
    <div class="head">
      <div><div class="brand"><svg width="24" height="24" viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="52" rx="15" fill="none" stroke="#7c3aed" stroke-width="5"/><path d="M14 33 H25 L30 22 L36 44 L40 33 H50" fill="none" stroke="#7c3aed" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="50" cy="33" r="4.5" fill="#22d3ee"/></svg>SAPLINK</div><div class="muted">${t.pdfTagline}</div></div>
      <div style="text-align:right"><div style="font-weight:700">${t.pdfInvoice}</div><div class="muted">${t.pdfNumber} ${inv.id.slice(0, 8).toUpperCase()}</div><div class="muted">${date}</div></div>
    </div>
    <h2>${t.pdfBilledTo}</h2>
    <div>${b.consultancyName || "—"}</div>
    <div class="muted">${b.consultancyCnpj || ""}</div>
    <h2>${t.pdfItems}</h2>
    <table><thead><tr><th>${t.pdfDescription}</th><th style="text-align:right">${t.pdfValue}</th></tr></thead>
    <tbody><tr><td>${t.pdfSubscriptionItem(b.plan ? b.plan.name : null)}</td><td style="text-align:right">${brl(inv.amountCents)}</td></tr></tbody></table>
    <div class="total">${t.pdfTotal}: ${brl(inv.amountCents)}</div>
    <p style="margin-top:8px">${t.pdfStatusLabel}: <span class="badge">${stLabel}</span></p>
    <div class="foot">${t.pdfFooter}</div>
    <script>window.onload=function(){window.print()}</script>
  </body></html>`);
  w.document.close();
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const color = pct >= 100 ? "bg-rose-500" : pct >= 80 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#9b95ad]">{label}</span>
        <span className="text-[#e2e0ea]">{used} / {limit}</span>
      </div>
      <div className="w-full bg-white/[0.08] rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [b, setB] = useState<Billing | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [xInt, setXInt] = useState(0);
  const [xUsr, setXUsr] = useState(0);
  const [mode, setMode] = useState<"auto" | "now">("auto");

  async function load() {
    setLoading(true);
    try {
      const [bill, p] = await Promise.all([getBilling(), getPlans()]);
      setB(bill);
      setPlans(p);
      setXInt(bill.extras?.integrations ?? 0);
      setXUsr(bill.extras?.users ?? 0);
      setError("");
    } catch {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }
  const [justPaid, setJustPaid] = useState(false);
  useEffect(() => {
    load();
    if (typeof window !== "undefined" && window.location.search.includes("paid=1")) {
      setJustPaid(true);
      // webhook do gateway pode levar alguns segundos; recarrega o status
      const t = setTimeout(() => load(), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  async function onCheckout(planKey: string) {
    setBusy(planKey);
    setError("");
    try {
      const r = await checkoutPlan(planKey, mode);
      if (r?.status === "redirect" && r?.url) { window.location.href = r.url; return; }
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || t.checkoutError);
    } finally { setBusy(""); }
  }

  async function onPayInvoice(id: string) {
    setBusy("inv-" + id);
    setError("");
    try {
      const r = await payInvoice(id);
      if (r?.status === "redirect" && r?.url) { window.location.href = r.url; return; }
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || t.payInvoiceError);
    } finally { setBusy(""); }
  }

  async function toggleAutoRenew(next: boolean) {
    setBusy("autorenew");
    setError("");
    try {
      // Ligar com gateway e sem cartão recorrente salvo → abre o Stripe pra cadastrar/validar o cartão.
      if (next && b?.gateway && !b?.hasRecurringMethod && b?.plan) {
        const r = await checkoutPlan(b.plan.key, "auto");
        if (r?.status === "redirect" && r?.url) { window.location.href = r.url; return; }
      }
      await setAutoRenew(next);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || t.autoRenewError);
    } finally { setBusy(""); }
  }

  async function onPayNow() {
    setBusy("paynow");
    setError("");
    try {
      const r = await payNow();
      if (r?.status === "redirect" && r?.url) { window.location.href = r.url; return; }
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || t.payNowError);
    } finally { setBusy(""); }
  }

  async function onManageCard() {
    setBusy("portal");
    setError("");
    try {
      const r = await billingPortal();
      if (r?.status === "redirect" && r?.url) { window.location.href = r.url; return; }
    } catch (e: any) {
      setError(e?.response?.data?.error || t.portalError);
    } finally { setBusy(""); }
  }

  async function saveAddons() {
    setBusy("addons");
    setError("");
    try {
      await updateAddons({ extraIntegrations: xInt, extraUsers: xUsr });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || t.addonsError);
    } finally { setBusy(""); }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  if (!b) return <div className="text-rose-400">{error || t.loadErrorShort}</div>;

  const stCls = STATUS_CLS[b.status] || STATUS_CLS.NONE;
  const stLabel = statusLabel(b.status, t);
  const suspended = !b.allowed;
  const addonInt = b.addonPrices?.integrationCents ?? b.plan?.addonIntegrationCents ?? 0;
  const addonUsr = b.addonPrices?.userCents ?? b.plan?.addonUserCents ?? 0;
  const addonDelta = xInt * addonInt + xUsr * addonUsr;
  const maxSeries = Math.max(1, ...b.spending.series.map((s) => s.cents));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      {justPaid && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-lg p-3">
          {t.paidBanner}
        </div>
      )}
      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">{error}</div>}

      {suspended && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300">
          <strong>{t.suspendedTitle}</strong> {b.reason} {t.suspendedHint}
        </div>
      )}

      {/* Resumo da assinatura */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{t.subscription}</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stCls}`}>{stLabel}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div><p className="text-xs text-[#9b95ad]">{t.plan}</p><p className="font-semibold mt-0.5">{b.plan?.name || "—"}</p></div>
            <div><p className="text-xs text-[#9b95ad]">{t.monthly}</p><p className="font-semibold mt-0.5">{b.monthlyCents ? brl(b.monthlyCents) : "—"}</p></div>
            <div><p className="text-xs text-[#9b95ad]">{t.nextCharge}</p><p className="font-semibold mt-0.5">{b.currentPeriodEnd ? new Date(b.currentPeriodEnd).toLocaleDateString(t.dateLocale) : b.trialEndsAt ? t.trialUntil(new Date(b.trialEndsAt).toLocaleDateString(t.dateLocale)) : "—"}</p></div>
            <div><p className="text-xs text-[#9b95ad]">{t.addons}</p><p className="font-semibold mt-0.5">{t.addonsSummary(b.extras.integrations, b.extras.users)}</p></div>
          </div>
          {b.plan && (
            <div className="bg-[#0f0b1a] rounded-lg px-4 py-3 mb-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">{t.autoBilling} {b.autoRenew && b.hasRecurringMethod && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">{t.cardTag}</span>}</p>
                  <p className="text-xs text-[#9b95ad]">
                    {b.autoRenew
                      ? (b.hasRecurringMethod ? t.autoBillingOnWithCard : t.autoBillingOnNoCard)
                      : t.autoBillingOff}
                  </p>
                </div>
                <button
                  onClick={() => toggleAutoRenew(!b.autoRenew)}
                  disabled={busy === "autorenew"}
                  className={`relative w-12 h-6 rounded-full transition cursor-pointer disabled:opacity-50 shrink-0 ${b.autoRenew ? "bg-emerald-500" : "bg-white/[0.15]"}`}
                  title={b.autoRenew ? t.turnOffAutoBilling : t.turnOnAddCard}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${b.autoRenew ? "translate-x-6" : ""}`} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3 flex-wrap">
                <p className="text-xs text-[#9b95ad]">
                  {b.openInvoice ? <>{t.openInvoiceLabel} <b className="text-[#e2e0ea]">{brl(b.openInvoice.amountCents)}</b></> : t.payAnytimeHint}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  {b.gateway === "stripe" && (
                    <button
                      onClick={onManageCard}
                      disabled={busy === "portal"}
                      className="text-sm px-4 py-2 rounded-lg bg-white/[0.08] text-[#e2e0ea] hover:bg-white/[0.14] font-semibold disabled:opacity-50 cursor-pointer"
                      title={t.manageCardTitle}
                    >
                      {busy === "portal" ? t.opening : t.manageCard}
                    </button>
                  )}
                  <button
                    onClick={onPayNow}
                    disabled={busy === "paynow"}
                    className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    {busy === "paynow" ? t.opening : t.payNow}
                  </button>
                </div>
              </div>
            </div>
          )}
          {b.effectiveLimits && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <UsageBar label={t.usageClients} used={b.usage.clients} limit={b.effectiveLimits.clients} />
              <UsageBar label={t.usageIntegrations} used={b.usage.integrations} limit={b.effectiveLimits.integrations} />
              <UsageBar label={t.usageUsers} used={b.usage.users} limit={b.effectiveLimits.users} />
              <UsageBar label={t.usageAiDiagnostics} used={b.usage.aiDiagnostics} limit={b.effectiveLimits.aiDiagnostics} />
            </div>
          )}
        </div>

        {/* Dashboard de gastos */}
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-1">{t.spending}</h2>
          <p className="text-2xl font-bold text-emerald-400">{brl(b.spending.totalPaidCents)}</p>
          <p className="text-xs text-[#9b95ad] mb-4">{t.totalPaid}</p>
          <div className="flex items-end gap-1.5 h-24">
            {b.spending.series.length === 0 && <p className="text-xs text-[#9b95ad]">{t.noPaidInvoices}</p>}
            {b.spending.series.map((s) => (
              <div key={s.month} className="flex-1 flex flex-col items-center gap-1" title={`${s.month}: ${brl(s.cents)}`}>
                <div className="w-full bg-gradient-to-t from-purple-600 to-cyan-500 rounded-t" style={{ height: `${Math.max(4, (s.cents / maxSeries) * 80)}px` }} />
                <span className="text-[9px] text-[#9b95ad]">{s.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add-ons (só com plano ativo) */}
      {b.plan && (
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-1">{t.addonsTitle}</h2>
          <p className="text-sm text-[#9b95ad] mb-4">{t.addonsSubtitle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: t.extraIntegrations, price: addonInt, val: xInt, set: setXInt, base: b.plan.maxIntegrations },
              { label: t.extraUsers, price: addonUsr, val: xUsr, set: setXUsr, base: b.plan.maxUsers },
            ].map((a) => (
              <div key={a.label} className="bg-[#0f0b1a] rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-[#9b95ad]">{t.addonPriceEach(brl(a.price), a.base)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => a.set(Math.max(0, a.val - 1))} className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] cursor-pointer">−</button>
                  <span className="w-8 text-center font-semibold">{a.val}</span>
                  <button onClick={() => a.set(a.val + 1)} className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] cursor-pointer">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-[#9b95ad]">{t.addonsCost} <span className="text-[#e2e0ea] font-semibold">{t.perMonth(brl(addonDelta))}</span></p>
            <button
              disabled={busy === "addons" || (xInt === b.extras.integrations && xUsr === b.extras.users)}
              onClick={saveAddons}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer"
            >
              {busy === "addons" ? t.saving : t.saveAddons}
            </button>
          </div>
        </div>
      )}

      {/* Planos */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold">{t.plans}</h2>
          <div className="inline-flex rounded-lg bg-[#1a1527] border border-white/[0.08] p-1 text-sm">
            <button
              onClick={() => setMode("auto")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${mode === "auto" ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "text-[#9b95ad] hover:text-white"}`}
            >
              {t.subscribeRecurring}
            </button>
            <button
              onClick={() => setMode("now")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${mode === "now" ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "text-[#9b95ad] hover:text-white"}`}
            >
              {t.payOneTime}
            </button>
          </div>
        </div>
        <p className="text-xs text-[#9b95ad] -mt-2 mb-4">
          {mode === "auto" ? t.modeAutoHint : t.modeNowHint}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((p) => {
            const current = b.plan?.key === p.key && b.allowed;
            return (
              <div key={p.key} className={`relative bg-[#1a1527] rounded-xl p-5 border flex flex-col ${p.highlight ? "border-purple-500/60 shadow-[0_0_25px_rgba(124,58,237,0.15)]" : "border-white/[0.08]"}`}>
                {p.highlight && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white">{t.mostPopular}</span>}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-2xl font-bold mt-1">{brl(p.priceCents)}<span className="text-sm font-normal text-[#9b95ad]">{t.monthSuffix}</span></p>
                {p.description && <p className="text-xs text-[#9b95ad] mt-2 min-h-[32px]">{p.description}</p>}
                <ul className="text-sm text-[#c9c5d6] mt-4 space-y-1.5 flex-1">
                  <li>✓ {p.maxClients >= 999 ? t.unlimitedClients : t.clientsN(p.maxClients)}</li>
                  <li>✓ {p.maxIntegrations >= 999 ? t.unlimitedIntegrations : t.integrationsN(p.maxIntegrations)}</li>
                  <li>✓ {t.aiDiagnosticsN(p.maxAiDiagnosticsPerMonth)}</li>
                  <li>✓ {t.usersN(p.maxUsers)}</li>
                  <li className="text-xs text-[#9b95ad] pt-1">{t.addonLine(brl(p.addonIntegrationCents || 0), brl(p.addonUserCents || 0))}</li>
                </ul>
                <button
                  disabled={busy === p.key || current}
                  onClick={() => onCheckout(p.key)}
                  className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 cursor-pointer ${p.highlight ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-white/[0.08] text-[#e2e0ea] hover:bg-white/[0.14]"}`}
                >
                  {busy === p.key ? t.processing : current ? t.currentPlan : b.plan ? t.switchToThis : t.subscribe}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico de faturas */}
      <div className="bg-[#1a1527] rounded-xl border border-white/[0.08] overflow-hidden">
        <h2 className="text-lg font-semibold p-6 pb-3">{t.invoiceHistory}</h2>
        {b.invoices.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-[#9b95ad]">{t.noInvoices}</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-[#9b95ad] text-xs uppercase tracking-wider border-b border-white/[0.06]">
                <th className="text-left px-6 py-2">{t.colDate}</th>
                <th className="text-left px-6 py-2">{t.colAmount}</th>
                <th className="text-left px-6 py-2">{t.colStatus}</th>
                <th className="text-right px-6 py-2">{t.colPdf}</th>
              </tr>
            </thead>
            <tbody>
              {b.invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-6 py-3">{new Date(inv.paidAt || inv.createdAt).toLocaleDateString(t.dateLocale)}</td>
                  <td className="px-6 py-3 font-medium">{brl(inv.amountCents)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${inv.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" : inv.status === "OPEN" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {inv.status === "PAID" ? t.invPaid : inv.status === "OPEN" ? t.invOpen : t.invFailed}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    {inv.status !== "PAID" && (
                      <button
                        onClick={() => onPayInvoice(inv.id)}
                        disabled={busy === "inv-" + inv.id}
                        className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold mr-4 cursor-pointer disabled:opacity-50"
                      >
                        {busy === "inv-" + inv.id ? "..." : t.payInvoiceNow}
                      </button>
                    )}
                    <button onClick={() => printInvoice(inv, b, t)} className="text-purple-400 hover:text-purple-300 text-xs font-medium cursor-pointer">{t.colPdf}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <p className="text-xs text-[#9b95ad]">
        {t.gatewayNote}
      </p>
    </div>
  );
}
