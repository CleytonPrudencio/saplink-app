"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "pt" | "en" | "es";
export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "pt", setLang: () => {} });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");
  useEffect(() => {
    const saved = (localStorage.getItem("slk_lang") as Lang) || (navigator.language?.startsWith("es") ? "es" : navigator.language?.startsWith("en") ? "en" : "pt");
    setLangState(saved);
    document.documentElement.lang = saved === "pt" ? "pt-BR" : saved;
  }, []);
  const setLang = (l: Lang) => {
    localStorage.setItem("slk_lang", l);
    setLangState(l);
    document.documentElement.lang = l === "pt" ? "pt-BR" : l;
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() { return useContext(Ctx); }

/** Helper: pega o valor do dicionário no idioma atual, com fallback PT. */
export function pick<T>(obj: Record<Lang, T>, lang: Lang): T { return obj[lang] ?? obj.pt; }
