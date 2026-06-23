"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n/I18n";
import { UI, tUI } from "@/i18n/ui";

// Seletor global de ambiente — filtra TODO o painel por DEV/HML/PRD (ou Todos).
// Persiste em localStorage e recarrega a tela para reaplicar o filtro em tudo.
const cls: Record<string, string> = {
  "": "text-[#9b95ad]",
  DEV: "text-sky-300",
  HML: "text-amber-300",
  PRD: "text-emerald-300",
};

export default function EnvSwitcher() {
  const { lang } = useLang();
  const [env, setEnv] = useState<string>("");
  useEffect(() => { setEnv(localStorage.getItem("slk_env") || ""); }, []);
  const OPTS: [string, string][] = [["", tUI(UI.comp.envAll, lang)], ["DEV", "DEV"], ["HML", "HML"], ["PRD", "PRD"]];

  function pick(v: string) {
    localStorage.setItem("slk_env", v);
    setEnv(v);
    // recarrega para reaplicar o filtro de ambiente em todas as telas/dados
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-[#1a1527] border border-white/[0.1] p-0.5" title={tUI(UI.comp.envSwitchTitle, lang)}>
      <span className="text-[10px] text-[#6b6580] px-1.5 hidden sm:inline">{tUI(UI.comp.envLabel, lang)}</span>
      {OPTS.map(([v, l]) => (
        <button
          key={v || "all"}
          onClick={() => pick(v)}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${env === v ? "bg-white/[0.1] " + (cls[v] || "text-white") : "text-[#9b95ad] hover:text-white"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
