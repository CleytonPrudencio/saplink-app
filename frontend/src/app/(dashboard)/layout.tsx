"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMe } from "@/lib/api";
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    getMe()
      .then((data) => {
        setUser(data);
        setLoading(false);
        // Super-admin não gerencia uma consultoria: vai pro painel da plataforma
        if (data.role === "PLATFORM_ADMIN" && pathname === "/") {
          router.replace("/platform");
        }
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

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} consultancy={user?.consultancy} />
      <main className="flex-1 ml-0 md:ml-64 min-h-screen overflow-auto">
        {/* Barra superior com usuário + sair (sempre visível) */}
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
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
