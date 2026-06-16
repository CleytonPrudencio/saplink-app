"use client";

import { useEffect, useState } from "react";
import { getBilling, getPlans, checkoutPlan } from "@/lib/api";

interface Plan {
  key: string;
  name: string;
  priceCents: number;
  maxClients: number;
  maxIntegrations: number;
  maxAiDiagnosticsPerMonth: number;
  maxUsers: number;
}

interface Billing {
  status: string;
  allowed: boolean;
  reason: string | null;
  plan: Plan | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  usage: { aiDiagnostics: number };
}

const STATUS_LABEL: Record<string, string> = {
  TRIALING: "Em teste",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento pendente",
  SUSPENDED: "Suspensa",
  CANCELED: "Cancelada",
  NONE: "Sem assinatura",
};

function money(cents: number) {
  return cents === 0 ? "Grátis" : `R$ ${(cents / 100).toFixed(2)}/mês`;
}

export default function BillingPage() {
  const [billing, setBilling] = useState<Billing | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [b, p] = await Promise.all([getBilling(), getPlans()]);
      setBilling(b);
      setPlans(p);
      setError("");
    } catch {
      setError("Erro ao carregar dados de cobrança.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCheckout(planKey: string) {
    setBusy(planKey);
    try {
      await checkoutPlan(planKey);
      await load();
    } catch {
      setError("Não foi possível ativar o plano.");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  const suspended = billing && !billing.allowed;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cobrança</h1>
      {error && <div className="text-rose-400">{error}</div>}

      {suspended && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-300">
          <strong>Acesso suspenso.</strong> {billing?.reason} Escolha um plano abaixo para reativar.
        </div>
      )}

      {/* Status atual */}
      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Assinatura</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#9b95ad]">Status</p>
            <p className="font-medium mt-0.5">{STATUS_LABEL[billing?.status || "NONE"] || billing?.status}</p>
          </div>
          <div>
            <p className="text-sm text-[#9b95ad]">Plano atual</p>
            <p className="font-medium mt-0.5">{billing?.plan?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-[#9b95ad]">Diagnósticos de IA usados (mês)</p>
            <p className="font-medium mt-0.5">
              {billing?.usage.aiDiagnostics ?? 0}
              {billing?.plan ? ` / ${billing.plan.maxAiDiagnosticsPerMonth}` : ""}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#9b95ad]">Próxima cobrança</p>
            <p className="font-medium mt-0.5">
              {billing?.currentPeriodEnd
                ? new Date(billing.currentPeriodEnd).toLocaleDateString("pt-BR")
                : billing?.trialEndsAt
                ? `Teste até ${new Date(billing.trialEndsAt).toLocaleDateString("pt-BR")}`
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Planos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl">
        {plans.map((p) => {
          const current = billing?.plan?.key === p.key;
          return (
            <div
              key={p.key}
              className={`bg-[#1a1527] rounded-xl p-6 border ${
                current ? "border-purple-500/50" : "border-white/[0.08]"
              }`}
            >
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="text-2xl font-bold mt-1">{money(p.priceCents)}</p>
              <ul className="text-sm text-[#9b95ad] mt-4 space-y-1">
                <li>{p.maxClients} clientes</li>
                <li>{p.maxIntegrations} integrações</li>
                <li>{p.maxAiDiagnosticsPerMonth} diagnósticos IA/mês</li>
                <li>{p.maxUsers} usuários</li>
              </ul>
              <button
                disabled={busy === p.key || (current && !!billing?.allowed)}
                onClick={() => onCheckout(p.key)}
                className="mt-5 w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold disabled:opacity-40"
              >
                {busy === p.key
                  ? "Processando..."
                  : current && billing?.allowed
                  ? "Plano atual"
                  : "Assinar"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[#9b95ad] max-w-2xl">
        Pagamento simulado (provider manual) para o ambiente de teste. Em produção, este botão
        redireciona ao gateway (Stripe/Asaas/Iugu).
      </p>
    </div>
  );
}
