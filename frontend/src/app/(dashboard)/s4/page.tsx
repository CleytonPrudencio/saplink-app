"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getS4Overview, getS4Comm, getS4Apis } from "@/lib/api";

function brl(c: number) { return (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); }
const SEV: Record<string, string> = { EXPIRED: "text-rose-400", CRITICAL: "text-orange-400", WARN: "text-amber-300", OK: "text-emerald-400" };

export default function S4Page() {
  const [ov, setOv] = useState<Record<string, number> | null>(null);
  const [comm, setComm] = useState<any>(null);
  const [apis, setApis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getS4Overview(), getS4Comm(), getS4Apis()])
      .then(([o, c, a]) => { setOv(o); setComm(c); setApis(a); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  const cards = [
    { l: "Clean Core Score", v: `${ov?.cleanCoreScore ?? 0}`, c: (ov?.cleanCoreScore ?? 0) >= 80 ? "text-emerald-400" : "text-amber-300", href: "/cleancore" },
    { l: "Quebras no próximo upgrade", v: `${ov?.upgradeBreaking ?? 0}`, c: "text-rose-400", href: "/upgrade" },
    { l: "Achados de upgrade", v: `${ov?.upgradeFindings ?? 0}`, c: "text-purple-300", href: "/upgrade" },
    { l: "Docs fiscais bloqueados", v: `${ov?.fiscalBlocked ?? 0}`, c: "text-rose-400", href: "/fiscal" },
    { l: "R$ fiscal em risco", v: brl(ov?.fiscalAtRiskCents ?? 0), c: "text-amber-300", href: "/fiscal" },
    { l: "Certs/arranjos expirando", v: `${ov?.commExpiring ?? 0}`, c: "text-amber-300", href: "/s4" },
    { l: "Eventos em dead-letter", v: `${ov?.eventsDeadLetter ?? 0}`, c: "text-rose-400", href: "/events" },
    { l: "APIs depreciadas em uso", v: `${ov?.apisDeprecated ?? 0}`, c: "text-orange-400", href: "/upgrade" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">☁️ S/4HANA Cloud</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Operação, governança de Clean Core e fiscal do seu S/4HANA Cloud — sem agente, via Communication Arrangement.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Link key={c.l} href={c.href} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 hover:border-purple-500/40 transition">
            <div className={`text-2xl font-bold ${c.c}`}>{c.v}</div>
            <div className="text-[11px] text-[#9b95ad] mt-1">{c.l}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Comm Arrangements */}
        <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-3">Communication Arrangements</h2>
          <div className="space-y-2">
            {(comm?.items || []).slice(0, 6).map((a: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-[#e2e0ea] truncate">{a.name} <span className="text-xs text-[#9b95ad]">· {a.scenario}</span></p>
                  <p className="text-xs text-[#9b95ad]">{a.client} · {a.direction || "—"} · {a.commUser || "—"}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-semibold ${a.status === "ERROR" ? "text-rose-400" : "text-emerald-400"}`}>{a.status}</span>
                  {a.certExpiresAt && <p className={`text-[11px] ${SEV[a.certSeverity]}`}>cert {new Date(a.certExpiresAt).toLocaleDateString("pt-BR")}</p>}
                </div>
              </div>
            ))}
            {(!comm?.items || comm.items.length === 0) && <p className="text-sm text-[#9b95ad]">Nenhum arranjo ainda.</p>}
          </div>
        </div>

        {/* APIs */}
        <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-3">APIs liberadas consumidas <span className="text-xs text-[#9b95ad]">({apis?.summary?.deprecated ?? 0} depreciadas)</span></h2>
          <div className="space-y-2">
            {(apis?.items || []).slice(0, 6).map((a: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-mono text-[#e2e0ea] truncate">{a.apiName} <span className="text-[#9b95ad]">{a.version}</span></p>
                  <p className="text-xs text-[#9b95ad]">{a.scenario || ""} · {a.calls30d.toLocaleString("pt-BR")} chamadas/30d</p>
                </div>
                {a.deprecated
                  ? <span className="text-[11px] text-rose-300 shrink-0">depreca {a.deprecationRelease}</span>
                  : <span className="text-[11px] text-emerald-400 shrink-0">ok</span>}
              </div>
            ))}
            {(!apis?.items || apis.items.length === 0) && <p className="text-sm text-[#9b95ad]">Sem inventário ainda.</p>}
          </div>
        </div>
      </div>

      <p className="text-xs text-[#6b6580]">No S/4HANA Cloud o SAPLINK conecta via Communication Arrangement (OAuth/cert) e puxa por OData — sem instalar nada no cliente. Configuração em Configurações › S/4HANA Cloud.</p>
    </div>
  );
}
