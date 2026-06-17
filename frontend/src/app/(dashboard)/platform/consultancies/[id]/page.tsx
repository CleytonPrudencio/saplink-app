"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getConsultancyDetail, suspendConsultancy, activateConsultancy,
  platformResetPassword, platformUpdateUser, platformUpdateConsultancy,
} from "@/lib/api";
import { useToast } from "@/components/Toast";

const STATUS_LABEL: Record<string, string> = {
  TRIALING: "Em teste", ACTIVE: "Ativa", PAST_DUE: "Pagamento pendente",
  SUSPENDED: "Suspensa", CANCELED: "Cancelada",
};

export default function ConsultancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try {
      setData(await getConsultancyDetail(id));
    } catch {
      notify("Erro ao carregar detalhes.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onResetPwd(userId: string, email: string) {
    if (!window.confirm(`Resetar a senha de ${email}?`)) return;
    try {
      const r = await platformResetPassword(userId);
      window.prompt(`Senha temporária de ${email} (copie e repasse):`, r.tempPassword);
      notify("Senha resetada.", "success");
    } catch {
      notify("Falha ao resetar senha.", "error");
    }
  }

  async function onChangeRole(userId: string, role: string) {
    try {
      await platformUpdateUser(userId, { role });
      notify("Papel atualizado.", "success");
      await load();
    } catch {
      notify("Falha ao atualizar papel.", "error");
    }
  }

  async function onEditUserName(userId: string, current: string) {
    const name = window.prompt("Novo nome:", current);
    if (!name || name.trim() === current) return;
    try {
      await platformUpdateUser(userId, { name: name.trim() });
      notify("Nome atualizado.", "success");
      await load();
    } catch {
      notify("Falha ao atualizar.", "error");
    }
  }

  async function onEditConsultancy() {
    const name = window.prompt("Nome da consultoria:", data.consultancy.name);
    if (name === null) return;
    const cnpj = window.prompt("CNPJ:", data.consultancy.cnpj || "");
    try {
      await platformUpdateConsultancy(id, { name: name.trim() || undefined, cnpj: cnpj?.trim() });
      notify("Cadastro atualizado.", "success");
      await load();
    } catch {
      notify("Falha ao atualizar cadastro.", "error");
    }
  }

  async function toggleAccess(suspend: boolean) {
    setBusy(true);
    try {
      if (suspend) await suspendConsultancy(id);
      else await activateConsultancy(id);
      notify(suspend ? "Acesso suspenso." : "Acesso reativado.", "success");
      await load();
    } catch {
      notify("Operação falhou.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  if (!data) return <div className="text-rose-400">Consultoria não encontrada.</div>;

  const c = data.consultancy;
  const sub = c.subscription;
  const eff = data.effectiveStatus;
  const cut = eff && !eff.allowed;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/platform")} className="text-sm text-[#9b95ad] hover:text-white">← Voltar</button>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{c.name}</h1>
        <div className="flex gap-2">
          <button onClick={onEditConsultancy} className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/[0.06] hover:bg-white/[0.1]">
            Editar cadastro
          </button>
          <button
            disabled={busy}
            onClick={() => toggleAccess(!cut)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 ${
              cut ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
            }`}
          >
            {cut ? "Reativar acesso" : "Suspender acesso"}
          </button>
        </div>
      </div>

      {/* Assinatura */}
      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">Assinatura</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-[#9b95ad]">Status</p><p className="font-medium mt-0.5">{STATUS_LABEL[eff?.status] || eff?.status || "-"}</p></div>
          <div><p className="text-[#9b95ad]">Plano</p><p className="font-medium mt-0.5">{sub?.plan?.name || sub?.planKey || "-"}</p></div>
          <div><p className="text-[#9b95ad]">Mensalidade</p><p className="font-medium mt-0.5">{sub?.plan ? `R$ ${(sub.plan.priceCents / 100).toFixed(2)}` : "-"}</p></div>
          <div><p className="text-[#9b95ad]">CNPJ</p><p className="font-medium mt-0.5">{c.cnpj || "-"}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuários */}
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-4">Usuários ({c.users.length})</h2>
          <div className="space-y-2">
            {c.users.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between gap-2 text-sm bg-[#0f0b1a] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <button onClick={() => onEditUserName(u.id, u.name)} className="font-medium hover:text-purple-300 truncate" title="Editar nome">
                    {u.name}
                  </button>
                  <span className="text-[#9b95ad]"> · {u.email}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={u.role}
                    onChange={(e) => onChangeRole(u.id, e.target.value)}
                    className="bg-[#1a1527] border border-white/[0.1] rounded px-2 py-1 text-xs"
                  >
                    <option value="CONSULTANCY_ADMIN">Admin</option>
                    <option value="CONSULTANCY_USER">Usuário</option>
                  </select>
                  <button onClick={() => onResetPwd(u.id, u.email)} className="text-xs px-2 py-1 rounded bg-amber-500/15 text-amber-300 hover:bg-amber-500/25">
                    Resetar senha
                  </button>
                </div>
              </div>
            ))}
            {c.users.length === 0 && <p className="text-sm text-[#9b95ad]">Nenhum usuário.</p>}
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-4">Clientes ({c.clients.length}) · {data.integrationsCount} integrações</h2>
          <div className="space-y-2">
            {c.clients.map((cl: any) => (
              <div key={cl.id} className="flex justify-between text-sm bg-[#0f0b1a] rounded-lg px-3 py-2">
                <span>{cl.name}</span>
                <span className="text-[#9b95ad]">health {cl.healthScore}</span>
              </div>
            ))}
            {c.clients.length === 0 && <p className="text-sm text-[#9b95ad]">Nenhum cliente.</p>}
          </div>
        </div>
      </div>

      {/* Faturas */}
      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">Faturas</h2>
        <div className="space-y-2">
          {c.invoices.map((inv: any) => (
            <div key={inv.id} className="flex justify-between text-sm bg-[#0f0b1a] rounded-lg px-3 py-2">
              <span>{new Date(inv.createdAt).toLocaleDateString("pt-BR")}</span>
              <span>R$ {(inv.amountCents / 100).toFixed(2)}</span>
              <span className={inv.status === "PAID" ? "text-emerald-400" : "text-amber-400"}>{inv.status}</span>
            </div>
          ))}
          {c.invoices.length === 0 && <p className="text-sm text-[#9b95ad]">Nenhuma fatura ainda.</p>}
        </div>
      </div>
    </div>
  );
}
