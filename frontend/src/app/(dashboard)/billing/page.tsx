"use client";

import { useEffect, useState } from "react";
import { getBilling, getPlans, checkoutPlan, updateAddons } from "@/lib/api";

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
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  usage: { clients: number; integrations: number; users: number; aiDiagnostics: number };
  spending: { totalPaidCents: number; series: { month: string; cents: number }[] };
  invoices: Invoice[];
}

const STATUS = {
  TRIALING: { label: "Em teste", cls: "bg-amber-500/20 text-amber-400" },
  ACTIVE: { label: "Ativa", cls: "bg-emerald-500/20 text-emerald-400" },
  PAST_DUE: { label: "Pagamento pendente", cls: "bg-amber-500/20 text-amber-400" },
  SUSPENDED: { label: "Suspensa", cls: "bg-rose-500/20 text-rose-400" },
  CANCELED: { label: "Cancelada", cls: "bg-rose-500/20 text-rose-400" },
  NONE: { label: "Sem assinatura", cls: "bg-white/10 text-[#9b95ad]" },
} as Record<string, { label: string; cls: string }>;

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function printInvoice(inv: Invoice, b: Billing) {
  const w = window.open("", "_blank", "width=820,height=920");
  if (!w) return;
  const date = new Date(inv.paidAt || inv.createdAt).toLocaleDateString("pt-BR");
  const statusLabel = inv.status === "PAID" ? "PAGA" : inv.status === "OPEN" ? "EM ABERTO" : "FALHOU";
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Fatura ${inv.id.slice(0, 8).toUpperCase()}</title>
  <style>
    body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a2e;max-width:680px;margin:32px auto;padding:0 24px}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #7c3aed;padding-bottom:16px}
    .brand{font-size:22px;font-weight:800;color:#7c3aed}
    .muted{color:#666;font-size:13px}
    h2{font-size:16px;margin:24px 0 8px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    td,th{text-align:left;padding:10px 8px;border-bottom:1px solid #eee;font-size:14px}
    .total{font-size:20px;font-weight:800;text-align:right;margin-top:16px}
    .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background:#e6f9ee;color:#0a8a43}
    .foot{margin-top:40px;color:#999;font-size:12px;border-top:1px solid #eee;padding-top:12px}
  </style></head><body>
    <div class="head">
      <div><div class="brand">◆ SAPLINK</div><div class="muted">Monitoramento de integrações SAP</div></div>
      <div style="text-align:right"><div style="font-weight:700">FATURA</div><div class="muted">Nº ${inv.id.slice(0, 8).toUpperCase()}</div><div class="muted">${date}</div></div>
    </div>
    <h2>Cobrado de</h2>
    <div>${b.consultancyName || "—"}</div>
    <div class="muted">${b.consultancyCnpj || ""}</div>
    <h2>Itens</h2>
    <table><thead><tr><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead>
    <tbody><tr><td>Assinatura SAPLINK${b.plan ? " — Plano " + b.plan.name : ""}</td><td style="text-align:right">${brl(inv.amountCents)}</td></tr></tbody></table>
    <div class="total">Total: ${brl(inv.amountCents)}</div>
    <p style="margin-top:8px">Status: <span class="badge">${statusLabel}</span></p>
    <div class="foot">SAPLINK · Documento gerado eletronicamente. Não possui valor fiscal.</div>
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
  const [b, setB] = useState<Billing | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [xInt, setXInt] = useState(0);
  const [xUsr, setXUsr] = useState(0);

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
      setError("Erro ao carregar dados de cobrança.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function onCheckout(planKey: string) {
    setBusy(planKey);
    setError("");
    try {
      const r = await checkoutPlan(planKey);
      if (r?.status === "redirect" && r?.url) { window.location.href = r.url; return; }
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Não foi possível iniciar o pagamento.");
    } finally { setBusy(""); }
  }

  async function saveAddons() {
    setBusy("addons");
    setError("");
    try {
      await updateAddons({ extraIntegrations: xInt, extraUsers: xUsr });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || "Não foi possível atualizar os add-ons.");
    } finally { setBusy(""); }
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  if (!b) return <div className="text-rose-400">{error || "Erro ao carregar."}</div>;

  const st = STATUS[b.status] || STATUS.NONE;
  const suspended = !b.allowed;
  const addonInt = b.addonPrices?.integrationCents ?? b.plan?.addonIntegrationCents ?? 0;
  const addonUsr = b.addonPrices?.userCents ?? b.plan?.addonUserCents ?? 0;
  const addonDelta = xInt * addonInt + xUsr * addonUsr;
  const maxSeries = Math.max(1, ...b.spending.series.map((s) => s.cents));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cobrança</h1>
      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">{error}</div>}

      {suspended && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300">
          <strong>Assinatura inativa.</strong> {b.reason} Escolha um plano abaixo para reativar o acesso.
        </div>
      )}

      {/* Resumo da assinatura */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Assinatura</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div><p className="text-xs text-[#9b95ad]">Plano</p><p className="font-semibold mt-0.5">{b.plan?.name || "—"}</p></div>
            <div><p className="text-xs text-[#9b95ad]">Mensalidade</p><p className="font-semibold mt-0.5">{b.monthlyCents ? brl(b.monthlyCents) : "—"}</p></div>
            <div><p className="text-xs text-[#9b95ad]">Próxima cobrança</p><p className="font-semibold mt-0.5">{b.currentPeriodEnd ? new Date(b.currentPeriodEnd).toLocaleDateString("pt-BR") : b.trialEndsAt ? `Teste até ${new Date(b.trialEndsAt).toLocaleDateString("pt-BR")}` : "—"}</p></div>
            <div><p className="text-xs text-[#9b95ad]">Add-ons</p><p className="font-semibold mt-0.5">{b.extras.integrations} int · {b.extras.users} user</p></div>
          </div>
          {b.effectiveLimits && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <UsageBar label="Clientes" used={b.usage.clients} limit={b.effectiveLimits.clients} />
              <UsageBar label="Integrações" used={b.usage.integrations} limit={b.effectiveLimits.integrations} />
              <UsageBar label="Usuários" used={b.usage.users} limit={b.effectiveLimits.users} />
              <UsageBar label="Diagnósticos IA (mês)" used={b.usage.aiDiagnostics} limit={b.effectiveLimits.aiDiagnostics} />
            </div>
          )}
        </div>

        {/* Dashboard de gastos */}
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-1">Gastos</h2>
          <p className="text-2xl font-bold text-emerald-400">{brl(b.spending.totalPaidCents)}</p>
          <p className="text-xs text-[#9b95ad] mb-4">total pago</p>
          <div className="flex items-end gap-1.5 h-24">
            {b.spending.series.length === 0 && <p className="text-xs text-[#9b95ad]">Sem faturas pagas ainda.</p>}
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
          <h2 className="text-lg font-semibold mb-1">Add-ons</h2>
          <p className="text-sm text-[#9b95ad] mb-4">Estourou o limite do plano? Adicione capacidade sem trocar de plano.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Integrações extras", price: addonInt, val: xInt, set: setXInt, base: b.plan.maxIntegrations },
              { label: "Usuários extras", price: addonUsr, val: xUsr, set: setXUsr, base: b.plan.maxUsers },
            ].map((a) => (
              <div key={a.label} className="bg-[#0f0b1a] rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-[#9b95ad]">{brl(a.price)}/mês cada · plano inclui {a.base}</p>
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
            <p className="text-sm text-[#9b95ad]">Custo dos add-ons: <span className="text-[#e2e0ea] font-semibold">{brl(addonDelta)}/mês</span></p>
            <button
              disabled={busy === "addons" || (xInt === b.extras.integrations && xUsr === b.extras.users)}
              onClick={saveAddons}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer"
            >
              {busy === "addons" ? "Salvando..." : "Salvar add-ons"}
            </button>
          </div>
        </div>
      )}

      {/* Planos */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Planos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map((p) => {
            const current = b.plan?.key === p.key && b.allowed;
            return (
              <div key={p.key} className={`relative bg-[#1a1527] rounded-xl p-5 border flex flex-col ${p.highlight ? "border-purple-500/60 shadow-[0_0_25px_rgba(124,58,237,0.15)]" : "border-white/[0.08]"}`}>
                {p.highlight && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white">MAIS POPULAR</span>}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-2xl font-bold mt-1">{brl(p.priceCents)}<span className="text-sm font-normal text-[#9b95ad]">/mês</span></p>
                {p.description && <p className="text-xs text-[#9b95ad] mt-2 min-h-[32px]">{p.description}</p>}
                <ul className="text-sm text-[#c9c5d6] mt-4 space-y-1.5 flex-1">
                  <li>✓ {p.maxClients >= 999 ? "Clientes ilimitados" : `${p.maxClients} clientes`}</li>
                  <li>✓ {p.maxIntegrations >= 999 ? "Integrações ilimitadas" : `${p.maxIntegrations} integrações`}</li>
                  <li>✓ {p.maxAiDiagnosticsPerMonth} diagnósticos IA/mês</li>
                  <li>✓ {p.maxUsers} usuários</li>
                  <li className="text-xs text-[#9b95ad] pt-1">add-on: {brl(p.addonIntegrationCents || 0)}/int · {brl(p.addonUserCents || 0)}/user</li>
                </ul>
                <button
                  disabled={busy === p.key || current}
                  onClick={() => onCheckout(p.key)}
                  className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 cursor-pointer ${p.highlight ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-white/[0.08] text-[#e2e0ea] hover:bg-white/[0.14]"}`}
                >
                  {busy === p.key ? "Processando..." : current ? "Plano atual" : b.plan ? "Mudar para este" : "Assinar"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico de faturas */}
      <div className="bg-[#1a1527] rounded-xl border border-white/[0.08] overflow-hidden">
        <h2 className="text-lg font-semibold p-6 pb-3">Histórico de faturas</h2>
        {b.invoices.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-[#9b95ad]">Nenhuma fatura ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#9b95ad] text-xs uppercase tracking-wider border-b border-white/[0.06]">
                <th className="text-left px-6 py-2">Data</th>
                <th className="text-left px-6 py-2">Valor</th>
                <th className="text-left px-6 py-2">Status</th>
                <th className="text-right px-6 py-2">PDF</th>
              </tr>
            </thead>
            <tbody>
              {b.invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-6 py-3">{new Date(inv.paidAt || inv.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="px-6 py-3 font-medium">{brl(inv.amountCents)}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${inv.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" : inv.status === "OPEN" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {inv.status === "PAID" ? "Paga" : inv.status === "OPEN" ? "Em aberto" : "Falhou"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => printInvoice(inv, b)} className="text-purple-400 hover:text-purple-300 text-xs font-medium cursor-pointer">Baixar PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-[#9b95ad]">
        Pagamento via Asaas (PIX, boleto, cartão) quando configurado. Sem gateway, o ambiente de teste ativa o plano direto.
      </p>
    </div>
  );
}
