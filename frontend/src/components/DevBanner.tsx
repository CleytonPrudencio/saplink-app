"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n/I18n";

// Faixa fixa e discreta que aparece SOMENTE no ambiente de teste (dev.saplink.com.br),
// detectado pelo hostname — nunca renderiza em produção. Link pra produção mantém o caminho atual.
const TXT = {
  pt: { label: "Ambiente de teste", sub: "não é produção", cta: "Ir para produção" },
  en: { label: "Test environment", sub: "not production", cta: "Go to production" },
  es: { label: "Entorno de prueba", sub: "no es producción", cta: "Ir a producción" },
} as const;

export default function DevBanner() {
  const { lang } = useLang();
  const [prodUrl, setProdUrl] = useState<string | null>(null);

  useEffect(() => {
    const h = window.location.hostname;
    if (h === "dev.saplink.com.br" || h.startsWith("dev.")) {
      setProdUrl("https://saplink.com.br" + window.location.pathname + window.location.search);
    }
  }, []);

  if (!prodUrl) return null;
  const t = TXT[lang] ?? TXT.pt;
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[75] no-print pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-amber-400/30 bg-[#15101f]/85 backdrop-blur-md px-3.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.45)] text-xs">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" style={{ animation: "slk-pulse 1.6s ease-in-out infinite" }} />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
        </span>
        <span className="font-bold tracking-wide text-amber-300">DEV</span>
        <span className="text-[#c9c5d6]">{t.label}</span>
        <span className="text-[#6b6580] hidden sm:inline">· {t.sub}</span>
        <span className="w-px h-3.5 bg-white/[0.12] mx-0.5" />
        <a href={prodUrl} className="font-medium text-cyan-300 hover:text-cyan-200 whitespace-nowrap">{t.cta} →</a>
      </div>
    </div>
  );
}
