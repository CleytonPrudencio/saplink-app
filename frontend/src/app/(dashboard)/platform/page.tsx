"use client";

import { useEffect, useState } from "react";
import { getConsultancies, suspendConsultancy, activateConsultancy } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface Consultancy {
  id: string;
  name: string;
  createdAt: string;
  subscription?: {
    status: string;
    planKey: string;
    currentPeriodEnd?: string | null;
    plan?: { name: string } | null;
  } | null;
  _count?: { users: number; clients: number };
}

const STATUS_LABEL: Record<string, string> = {
  TRIALING: "Em teste",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento pendente",
  SUSPENDED: "Suspensa",
  CANCELED: "Cancelada",
};

function statusColor(s?: string) {
  if (s === "ACTIVE" || s === "TRIALING") return "text-emerald-400 bg-emerald-500/10";
  if (s === "PAST_DUE") return "text-amber-400 bg-amber-500/10";
  return "text-rose-400 bg-rose-500/10";
}

export default function PlatformPage() {
  const [list, setList] = useState<Consultancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const { notify } = useToast();

  async function load() {
    setLoading(true);
    try {
      setList(await getConsultancies());
    } catch {
      notify("Erro ao carregar consultorias (precisa ser super-admin).", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSuspend(id: string, name: string) {
    if (!window.confirm(`Suspender o acesso de "${name}"?`)) return;
    setBusy(id);
    try {
      await suspendConsultancy(id);
      notify("Acesso suspenso.", "success");
      await load();
    } catch {
      notify("Não foi possível suspender.", "error");
    } finally {
      setBusy("");
    }
  }

  async function onActivate(id: string) {
    setBusy(id);
    try {
      await activateConsultancy(id);
      notify("Acesso reativado.", "success");
      await load();
    } catch {
      notify("Não foi possível reativar.", "error");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Consultorias</h1>
        <p className="text-sm text-[#9b95ad] mt-1">
          Painel da plataforma — gerencie quem tem acesso e suspenda inadimplentes.
        </p>
      </div>

      <div className="overflow-x-auto bg-[#1a1527] rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#9b95ad] border-b border-white/[0.06]">
              <th className="px-4 py-3">Consultoria</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Usuários</th>
              <th className="px-4 py-3">Clientes</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const st = c.subscription?.status;
              const cut = st === "SUSPENDED" || st === "CANCELED";
              return (
                <tr key={c.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.subscription?.plan?.name || c.subscription?.planKey || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(st)}`}>
                      {STATUS_LABEL[st || ""] || st || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c._count?.users ?? "-"}</td>
                  <td className="px-4 py-3">{c._count?.clients ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {cut ? (
                      <button
                        disabled={busy === c.id}
                        onClick={() => onActivate(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40"
                      >
                        Reativar
                      </button>
                    ) : (
                      <button
                        disabled={busy === c.id}
                        onClick={() => onSuspend(c.id, c.name)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 disabled:opacity-40"
                      >
                        Suspender
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[#9b95ad]">Nenhuma consultoria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
