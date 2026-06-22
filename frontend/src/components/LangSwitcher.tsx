"use client";

import { LANGS, useLang } from "@/i18n/I18n";

export default function LangSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-[#1a1527] border border-white/[0.1] p-0.5" title="Idioma / Language / Idioma">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${lang === l.code ? "bg-white/[0.12] text-white" : "text-[#9b95ad] hover:text-white"}`}
          aria-label={l.label}
        >
          {l.flag}{compact ? "" : <span className="ml-1 hidden sm:inline">{l.code.toUpperCase()}</span>}
        </button>
      ))}
    </div>
  );
}
