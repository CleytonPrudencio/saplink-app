"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/api";

interface StatusData {
  client: string;
  brand: { name: string; logoUrl: string | null; primaryColor: string };
  overall: "operational" | "degraded" | "down";
  uptimeAvg: number;
  integrations: { name: string; type: string; environment: string; state: "operational" | "degraded" | "down"; uptime: number }[];
  incidents: { severity: string; message: string; createdAt: string; resolvedAt: string | null }[];
}

const STATE = {
  operational: { label: "Operacional", color: "#34d399", dot: "#34d399" },
  degraded: { label: "Degradado", color: "#fbbf24", dot: "#fbbf24" },
  down: { label: "Fora do ar", color: "#f87171", dot: "#f87171" },
};

export default function StatusPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [data, setData] = useState<StatusData | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "notfound">("loading");

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/status/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setData(d); setState("ok"); })
      .catch(() => setState("notfound"));
  }, [token]);

  if (state === "loading") return <Centered>Carregando…</Centered>;
  if (state === "notfound" || !data) return <Centered>Página de status não encontrada.</Centered>;

  const accent = data.brand.primaryColor || "#7c3aed";
  const ov = STATE[data.overall];

  return (
    <div className="min-h-screen bg-[#0f0b1a] text-[#e2e0ea]">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Marca da consultoria */}
        <div className="flex items-center gap-3 mb-8">
          {data.brand.logoUrl
            ? <img src={data.brand.logoUrl} alt={data.brand.name} className="h-8 w-auto" />
            : <span className="text-lg font-bold" style={{ color: accent }}>{data.brand.name}</span>}
          <span className="text-sm text-[#9b95ad]">· status</span>
        </div>

        <h1 className="text-2xl font-bold">{data.client}</h1>
        <p className="text-sm text-[#9b95ad] mt-1">Saúde das integrações SAP em tempo real</p>

        {/* Banner geral */}
        <div className="mt-6 rounded-2xl border p-5 flex items-center gap-4"
          style={{ borderColor: `${ov.color}55`, background: `${ov.color}14` }}>
          <span className="w-3.5 h-3.5 rounded-full" style={{ background: ov.dot, boxShadow: `0 0 12px ${ov.dot}` }} />
          <div>
            <p className="text-lg font-semibold" style={{ color: ov.color }}>{ov.label}</p>
            <p className="text-xs text-[#9b95ad]">Disponibilidade média: {data.uptimeAvg}%</p>
          </div>
        </div>

        {/* Integrações */}
        <h2 className="text-sm font-semibold text-[#9b95ad] uppercase tracking-wide mt-8 mb-3">Integrações</h2>
        <div className="space-y-2">
          {data.integrations.length === 0 && <p className="text-[#9b95ad] text-sm">Nenhuma integração publicada.</p>}
          {data.integrations.map((i, k) => {
            const st = STATE[i.state];
            return (
              <div key={k} className="flex items-center justify-between bg-[#1a1527] border border-white/[0.08] rounded-xl px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: st.dot }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{i.name}</p>
                    <p className="text-[11px] text-[#6b6580]">{i.type} · {i.environment}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs" style={{ color: st.color }}>{st.label}</p>
                  <p className="text-[11px] text-[#9b95ad] tabular-nums">{i.uptime}%</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Incidentes */}
        {data.incidents.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-[#9b95ad] uppercase tracking-wide mt-8 mb-3">Incidentes recentes</h2>
            <div className="space-y-2">
              {data.incidents.map((inc, k) => (
                <div key={k} className="bg-[#1a1527] border border-white/[0.08] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      inc.severity === "CRITICAL" ? "bg-rose-500/15 text-rose-300" :
                      inc.severity === "HIGH" ? "bg-orange-500/15 text-orange-300" :
                      "bg-amber-500/15 text-amber-300"}`}>{inc.severity}</span>
                    <span className={`text-[11px] ${inc.resolvedAt ? "text-emerald-300" : "text-amber-300"}`}>
                      {inc.resolvedAt ? "Resolvido" : "Em aberto"}
                    </span>
                    <span className="text-[11px] text-[#6b6580] ml-auto">{new Date(inc.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="text-sm text-[#c9c5d6] mt-1">{inc.message}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-center text-xs text-[#6b6580] mt-10">
          Monitorado por <a href="https://saplink.com.br" target="_blank" rel="noreferrer" className="underline" style={{ color: accent }}>SAPLINK</a>
        </p>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0f0b1a] text-[#9b95ad] flex items-center justify-center text-sm">{children}</div>;
}
