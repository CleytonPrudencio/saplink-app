"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  consultancyName?: string;
  plan?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => setError("Erro ao carregar dados do usuario."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  if (error) return <div className="text-rose-400">{error}</div>;
  if (!user) return null;

  function planBadge(plan?: string) {
    const p = plan?.toUpperCase();
    if (p === "PRO" || p === "PROFESSIONAL")
      return "bg-purple-500/20 text-purple-400";
    if (p === "ENTERPRISE")
      return "bg-cyan-500/20 text-cyan-400";
    return "bg-gray-500/20 text-gray-400";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuracoes</h1>

      {/* Profile Card */}
      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Perfil</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#9b95ad]">Nome</p>
              <p className="font-medium mt-0.5">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-[#9b95ad]">Email</p>
              <p className="font-medium mt-0.5">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-[#9b95ad]">Consultoria</p>
              <p className="font-medium mt-0.5">
                {user.consultancyName || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#9b95ad]">Plano</p>
              <div className="mt-0.5">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${planBadge(
                    user.plan
                  )}`}
                >
                  {user.plan || "Free"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Section */}
      {user.role === "ADMIN" && (
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Gerenciar Usuarios</h2>
          <p className="text-sm text-[#9b95ad]">
            Gerenciamento de usuarios em breve. Aqui voce podera adicionar,
            editar e remover usuarios da sua consultoria.
          </p>
        </div>
      )}
    </div>
  );
}
