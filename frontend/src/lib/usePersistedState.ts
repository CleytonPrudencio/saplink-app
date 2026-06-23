"use client";

import { useEffect, useRef, useState } from "react";

// Estado persistente em localStorage (SSR-safe): lembra preferências de UI entre sessões
// (filtros, abas, busca, toggles). NÃO use para dados de API, loading, seleção de item,
// formulários ou modais. Chave sugerida com prefixo: `slk:<tela>:<campo>`.
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);

  // 1) lê o valor salvo no mount (depois do 1º render, pra não quebrar a hidratação)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch { /* ignora valores corrompidos */ }
    loaded.current = true;
  }, [key]);

  // 2) salva a cada mudança (só depois de ter lido, pra não sobrescrever com o default)
  useEffect(() => {
    if (!loaded.current) return;
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota/privado */ }
  }, [key, value]);

  return [value, setValue] as const;
}
