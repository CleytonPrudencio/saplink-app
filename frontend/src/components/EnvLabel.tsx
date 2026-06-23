"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n/I18n";
import { UI, tUI } from "@/i18n/ui";

// Mostra o ambiente ativo (do seletor global) — deixa explícito o que está sendo
// configurado/visto nas telas de conexão e dados por ambiente.
const CLS: Record<string, string> = {
  "": "bg-white/[0.08] text-[#9b95ad]",
  DEV: "bg-sky-500/15 text-sky-300",
  HML: "bg-amber-500/15 text-amber-300",
  PRD: "bg-emerald-500/15 text-emerald-300",
};

export default function EnvLabel({ prefix }: { prefix?: string }) {
  const { lang } = useLang();
  const [env, setEnv] = useState("");
  useEffect(() => { setEnv(localStorage.getItem("slk_env") || ""); }, []);
  const labelMap: Record<string, string> = {
    "": tUI(UI.comp.envAllFull, lang), DEV: tUI(UI.comp.envDev, lang), HML: tUI(UI.comp.envHml, lang), PRD: tUI(UI.comp.envPrd, lang),
  };
  const pfx = prefix ?? tUI(UI.comp.envActive, lang);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${CLS[env] || CLS[""]}`} title={tUI(UI.comp.envLabelTitle, lang)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" /> {pfx}: {labelMap[env] || labelMap[""]}
    </span>
  );
}
