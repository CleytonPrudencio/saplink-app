"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMe, getBilling } from "@/lib/api";
import Sidebar from "@/components/Sidebar";

interface Consultancy {
  name?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  consultancy?: Consultancy;
}

interface BillingStatus {
  allowed: boolean;
  status: string;
  reason?: string | null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    getMe()
      .then(async (data) => {
        setUser(data);
        if (data.role === "PLATFORM_ADMIN") {
          setLoading(false);
          if (pathname === "/" || pathname === "/dashboard") router.replace("/platform");
          return;
        }
        // Consultoria: checa assinatura (rota de billing não exige assinatura ativa)
        try {
          const b = await getBilling();
          setBilling({ allowed: b.allowed, status: b.status, reason: b.reason });
        } catch {
          setBilling({ allowed: false, status: "ERROR", reason: "Não foi possível verificar a assinatura." });
        }
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, [router, pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0b1a]">
        <div className="text-[#9b95ad] text-lg">Carregando...</div>
      </div>
    );
  }

  const blocked = !!user && user.role !== "PLATFORM_ADMIN" && billing !== null && !billing.allowed;

  // CONSULTANCY_USER: assinatura inativa → nem abre o sistema
  if (blocked && user?.role === "CONSULTANCY_USER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0b1a] p-6">
        <div className="max-w-md text-center bg-[#1a1527] border border-amber-500/30 rounded-2xl p-8">
          <div className="text-4xl mb-3">⚠️</div>
          <h1 className="text-xl font-bold text-amber-300 mb-2">Acesso temporariamente indisponível</h1>
          <p className="text-[#c9c5d6] leading-relaxed mb-1">
            Há uma pendência administrativa na conta da sua empresa.
          </p>
          <p className="text-[#9b95ad] text-sm mb-6">
            Entre em contato com o <b>administrador da conta</b> para regularizar o acesso.
          </p>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg text-sm bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.12] transition cursor-pointer">
            Sair
          </button>
        </div>
      </div>
    );
  }

  // CONSULTANCY_ADMIN bloqueado: deixa navegar para billing/settings; nas demais, mostra CTA de pagamento
  const onAllowedPage = pathname.startsWith("/billing") || pathname.startsWith("/settings");
  const showPaymentCta = blocked && !onAllowedPage;
  // Cobrança e Configurações são exclusivas do admin da consultoria
  const restrictedForUser =
    user?.role === "CONSULTANCY_USER" && onAllowedPage;

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} consultancy={user?.consultancy} />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen overflow-auto">
        <div className="sticky top-0 z-20 flex items-center justify-end gap-3 px-6 md:px-8 py-3 bg-[#0f0b1a]/80 backdrop-blur border-b border-white/[0.06] no-print">
          <span className="text-sm text-[#9b95ad]">
            {user?.name}
            {user?.role ? <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/[0.06]">{user.role}</span> : null}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg text-[#e2e0ea] bg-white/[0.06] hover:bg-rose-500/15 hover:text-rose-300 transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
        <div className="p-6 md:p-8">
          {user?.role === "PLATFORM_ADMIN" && !pathname.startsWith("/platform") ? (
            <div className="text-[#9b95ad]">Redirecionando para o painel da plataforma...</div>
          ) : restrictedForUser ? (
            <div className="max-w-xl mx-auto mt-10 bg-[#1a1527] border border-white/[0.08] rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h1 className="text-xl font-bold text-[#e2e0ea] mb-2">Acesso restrito</h1>
              <p className="text-[#9b95ad] leading-relaxed mb-6">
                Cobrança e Configurações são exclusivas do <b className="text-[#c9c5d6]">administrador</b> da conta. Fale com o admin da sua consultoria.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-2.5 bg-white/[0.08] text-[#e2e0ea] font-semibold rounded-lg hover:bg-white/[0.14] transition cursor-pointer"
              >
                Voltar ao painel
              </button>
            </div>
          ) : showPaymentCta ? (
            <div className="max-w-xl mx-auto mt-10 bg-[#1a1527] border border-rose-500/30 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h1 className="text-xl font-bold text-rose-300 mb-2">Assinatura inativa</h1>
              <p className="text-[#c9c5d6] leading-relaxed mb-1">
                {billing?.reason || "Sua assinatura não está ativa."} O acesso às telas fica bloqueado até a regularização.
              </p>
              <p className="text-[#9b95ad] text-sm mb-6">Resolva o pagamento para reativar o SAPLINK na hora.</p>
              <button
                onClick={() => router.push("/billing")}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition cursor-pointer"
              >
                Resolver pagamento →
              </button>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
