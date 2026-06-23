"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMe, getBilling } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import PageGuide from "@/components/PageGuide";
import PushSetup from "@/components/PushSetup";
import Loading from "@/components/Loading";
import EnvSwitcher from "@/components/EnvSwitcher";
import LangSwitcher from "@/components/LangSwitcher";
import { useLang } from "@/i18n/I18n";
import { UI, tUI } from "@/i18n/ui";

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
  const { lang } = useLang();
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
      <div className="min-h-screen flex items-center justify-center">
        <Loading label={tUI(UI.shell.loading, lang)} />
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
          <h1 className="text-xl font-bold text-amber-300 mb-2">{tUI(UI.shell.blockedTitle, lang)}</h1>
          <p className="text-[#c9c5d6] leading-relaxed mb-1">{tUI(UI.shell.blockedP1, lang)}</p>
          <p className="text-[#9b95ad] text-sm mb-6">{tUI(UI.shell.blockedP2, lang)}</p>
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg text-sm bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.12] transition cursor-pointer">
            {tUI(UI.shell.logout, lang)}
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
  // Faixa sutil de modo somente leitura para o perfil Consulta
  const isViewer = user?.role === "CONSULTANCY_VIEWER";
  const readOnlyBanner = { pt: "Modo somente leitura — perfil Consulta", en: "Read-only mode — Viewer role", es: "Modo solo lectura — perfil Consulta" } as const;

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} consultancy={user?.consultancy} />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen overflow-auto">
        <div className="sticky top-0 z-20 flex items-center gap-2 sm:gap-3 pl-16 pr-3 md:px-8 py-3 bg-[#0f0b1a]/80 backdrop-blur border-b border-white/[0.06] no-print">
          <div className="mr-auto min-w-0"><EnvSwitcher /></div>
          <LangSwitcher compact />
          <div className="hidden sm:block"><PushSetup /></div>
          <span className="hidden sm:inline text-sm text-[#9b95ad] truncate max-w-[30vw] md:max-w-none">
            {user?.name}
            {user?.role ? <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/[0.06] hidden md:inline">{user.role}</span> : null}
          </span>
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex text-sm px-3 py-1.5 rounded-lg text-[#e2e0ea] bg-white/[0.06] hover:bg-rose-500/15 hover:text-rose-300 transition-colors cursor-pointer"
          >
            {tUI(UI.shell.logout, lang)}
          </button>
        </div>
        <div className="p-6 md:p-8">
          {user?.role === "PLATFORM_ADMIN" && !pathname.startsWith("/platform") ? (
            <div className="text-[#9b95ad]">{tUI(UI.shell.redirecting, lang)}</div>
          ) : restrictedForUser ? (
            <div className="max-w-xl mx-auto mt-10 bg-[#1a1527] border border-white/[0.08] rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h1 className="text-xl font-bold text-[#e2e0ea] mb-2">{tUI(UI.shell.restrictedTitle, lang)}</h1>
              <p className="text-[#9b95ad] leading-relaxed mb-6">{tUI(UI.shell.restrictedP, lang)}</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-2.5 bg-white/[0.08] text-[#e2e0ea] font-semibold rounded-lg hover:bg-white/[0.14] transition cursor-pointer"
              >
                {tUI(UI.shell.back, lang)}
              </button>
            </div>
          ) : showPaymentCta ? (
            <div className="max-w-xl mx-auto mt-10 bg-[#1a1527] border border-rose-500/30 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h1 className="text-xl font-bold text-rose-300 mb-2">{tUI(UI.shell.paymentTitle, lang)}</h1>
              <p className="text-[#c9c5d6] leading-relaxed mb-1">
                {billing?.reason || tUI(UI.shell.paymentP1, lang)} {tUI(UI.shell.paymentP1b, lang)}
              </p>
              <p className="text-[#9b95ad] text-sm mb-6">{tUI(UI.shell.paymentP2, lang)}</p>
              <button
                onClick={() => router.push("/billing")}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition cursor-pointer"
              >
                {tUI(UI.shell.paymentCta, lang)}
              </button>
            </div>
          ) : (
            <>
              {isViewer && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-200 no-print">
                  <span aria-hidden>👁️</span>
                  <span>{readOnlyBanner[lang] ?? readOnlyBanner.pt}</span>
                </div>
              )}
              <PageGuide />
              {children}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
