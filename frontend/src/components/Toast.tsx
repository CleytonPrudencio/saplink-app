"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastCtx {
  notify: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx>({ notify: () => {} });

export function useToast() {
  return useContext(Ctx);
}

let seq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++seq;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg text-sm shadow-lg border max-w-sm ${
              t.kind === "success"
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                : t.kind === "error"
                ? "bg-rose-500/15 border-rose-500/40 text-rose-200"
                : "bg-[#1a1527] border-white/10 text-[#e2e0ea]"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
