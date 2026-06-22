"use client";

import { useEffect, useState } from "react";

// Mostra o ambiente ativo (do seletor global) — deixa explícito o que está sendo
// configurado/visto nas telas de conexão e dados por ambiente.
const META: Record<string, { label: string; cls: string }> = {
  "": { label: "Todos os ambientes", cls: "bg-white/[0.08] text-[#9b95ad]" },
  DEV: { label: "DEV · Desenvolvimento", cls: "bg-sky-500/15 text-sky-300" },
  HML: { label: "HML · Homologação", cls: "bg-amber-500/15 text-amber-300" },
  PRD: { label: "PRD · Produção", cls: "bg-emerald-500/15 text-emerald-300" },
};

export default function EnvLabel({ prefix = "Ambiente ativo" }: { prefix?: string }) {
  const [env, setEnv] = useState("");
  useEffect(() => { setEnv(localStorage.getItem("slk_env") || ""); }, []);
  const m = META[env] || META[""];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${m.cls}`} title="Definido pelo seletor de ambiente no topo">
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" /> {prefix}: {m.label}
    </span>
  );
}
