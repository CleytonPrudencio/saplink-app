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

interface Consultancy {
  name?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface SidebarProps {
  user: User | null;
  consultancy?: Consultancy | null;
}

interface MenuItem { href: string; label: string; icon: string; adminOnly?: boolean }
interface MenuGroup { title: string; items: MenuItem[] }

// Menu da consultoria, agrupado por se\u00E7\u00E3o (com rolagem quando passa da altura)
const tenantGroups: MenuGroup[] = [
  {
    title: "Opera\u00E7\u00E3o",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "\uD83D\uDCCA" },
      { href: "/clients", label: "Clientes", icon: "\uD83D\uDC65" },
      { href: "/integrations", label: "Integra\u00E7\u00f5es", icon: "\uD83D\uDD17" },
      { href: "/cockpit", label: "Cockpit", icon: "\uD83D\uDEF0\uFE0F" },
      { href: "/alerts", label: "Alertas", icon: "\uD83D\uDD14" },
    ],
  },
  {
    title: "Intelig\u00EAncia",
    items: [
      { href: "/diagnostics", label: "Diagnostico IA", icon: "\uD83E\uDD16" },
      { href: "/ask", label: "Pergunte \u00E0 IA", icon: "\uD83D\uDCAC" },
      { href: "/predict", label: "Previs\u00E3o & Benchmark", icon: "\uD83D\uDD2E" },
    ],
  },
  {
    title: "Cat\u00E1logo & qualidade",
    items: [
      { href: "/catalog", label: "Catalogo", icon: "\uD83D\uDCDA" },
      { href: "/validity", label: "Radar de validade", icon: "\uD83D\uDCE1" },
      { href: "/dead-code", label: "Dead Code", icon: "\uD83D\uDD0D" },
    ],
  },
  {
    title: "S/4HANA Cloud",
    items: [
      { href: "/s4", label: "S/4HANA Cloud", icon: "\u2601\uFE0F" },
      { href: "/upgrade", label: "Radar de Upgrade", icon: "\uD83D\uDE80" },
      { href: "/cleancore", label: "Clean Core", icon: "\uD83E\uDDFC" },
      { href: "/fiscal", label: "Fiscal (DRC)", icon: "\uD83E\uDDFE" },
      { href: "/events", label: "Event Mesh", icon: "\uD83D\uDCE8" },
    ],
  },
  {
    title: "SAP Cloud & transportes",
    items: [
      { href: "/cloud", label: "CPI & AIF", icon: "\u2601\uFE0F" },
      { href: "/transports", label: "Transports", icon: "\uD83D\uDE9A" },
    ],
  },
  {
    title: "\uD83E\uDD84 Inova\u00E7\u00E3o",
    items: [
      { href: "/federated", label: "Rede Federada", icon: "\uD83D\uDEF0\uFE0F" },
      { href: "/causal", label: "Causa cross-camada", icon: "\uD83D\uDD17" },
      { href: "/autoheal", label: "AMS Aut\u00F4nomo", icon: "\uD83E\uDD16" },
      { href: "/money", label: "Dinheiro em risco", icon: "\uD83D\uDCB8" },
    ],
  },
  {
    title: "Valor & relat\u00F3rios",
    items: [
      { href: "/sla", label: "SLA & Impacto", icon: "\uD83D\uDCC8" },
      { href: "/reports", label: "Relatorios", icon: "\uD83D\uDCC4" },
    ],
  },
  {
    title: "Resposta & conta",
    items: [
      { href: "/notifications", label: "On-call & Tickets", icon: "\uD83D\uDCE3", adminOnly: true },
      { href: "/billing", label: "Cobran\u00E7a", icon: "\uD83D\uDCB3", adminOnly: true },
      { href: "/settings", label: "Configuracoes", icon: "\u2699\uFE0F", adminOnly: true },
    ],
  },
];

// Menu do super-admin da plataforma (gerencia tenants; sem cobran\u00E7a pr\u00F3pria)
const platformGroups: MenuGroup[] = [
  {
    title: "Plataforma",
    items: [
      { href: "/platform", label: "Consultorias", icon: "\uD83C\uDFE2" },
      { href: "/platform/leads", label: "Leads", icon: "\uD83D\uDCE5" },
      { href: "/platform/revenue", label: "Receita", icon: "\uD83D\uDCB0" },
    ],
  },
];

export default function Sidebar({ user, consultancy }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === "CONSULTANCY_ADMIN";
  const groups: MenuGroup[] = (user?.role === "PLATFORM_ADMIN" ? platformGroups : tenantGroups)
    .map((g) => ({ ...g, items: g.items.filter((m) => isAdmin || !m.adminOnly) }))
    .filter((g) => g.items.length > 0);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const nav = (
    <div className="flex flex-col h-full">
      <div className="p-6 shrink-0">
        <Link href="/dashboard" className="block" onClick={() => setMobileOpen(false)}>
          {consultancy?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={consultancy.logoUrl} alt={consultancy.name || "Logo"} className="max-h-10 max-w-[180px] object-contain" />
          ) : consultancy?.primaryColor ? (
            <h1 className="text-2xl font-bold" style={{ color: consultancy.primaryColor }}>
              ◆ {consultancy.name || "SAPLINK"}
            </h1>
          ) : (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
              ◆ {consultancy?.name || "SAPLINK"}
            </h1>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-2 space-y-3 sidebar-scroll">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6b6580]">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-purple-500/10 text-purple-400"
                      : "text-[#9b95ad] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.08] shrink-0">
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
