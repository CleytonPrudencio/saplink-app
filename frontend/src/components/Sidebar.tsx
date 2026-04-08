"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SidebarProps {
  user: User | null;
}

const menuItems = [
  { href: "/", label: "Dashboard", icon: "\uD83D\uDCCA" },
  { href: "/clients", label: "Clientes", icon: "\uD83D\uDC65" },
  { href: "/integrations", label: "Integra\u00e7\u00f5es", icon: "\uD83D\uDD17" },
  { href: "/alerts", label: "Alertas", icon: "\uD83D\uDD14" },
  { href: "/diagnostics", label: "Diagnostico IA", icon: "\uD83E\uDD16" },
  { href: "/dead-code", label: "Dead Code", icon: "\uD83D\uDD0D" },
  { href: "/reports", label: "Relatorios", icon: "\uD83D\uDCC4" },
  { href: "/settings", label: "Configuracoes", icon: "\u2699\uFE0F" },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const nav = (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link href="/" className="block" onClick={() => setMobileOpen(false)}>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
            ◆ SAPLINK
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-purple-500/10 text-purple-400"
                : "text-[#9b95ad] hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.08]">
        {user && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-[#e2e0ea] truncate">
              {user.name}
            </p>
            <p className="text-xs text-[#9b95ad] truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-[#9b95ad] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left cursor-pointer"
        >
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#1a1527] p-2 rounded-lg border border-white/[0.08] cursor-pointer"
      >
        <svg
          className="w-6 h-6 text-[#e2e0ea]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {mobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0f0b1a] border-r border-white/[0.08] z-40 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {nav}
      </aside>
    </>
  );
}
