"use client";

import { ReactNode, useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-16 no-print" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-[#1a1527] border border-white/[0.1] rounded-2xl w-full ${size === "lg" ? "max-w-3xl" : "max-w-lg"} max-h-[85vh] overflow-auto shadow-2xl`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] sticky top-0 bg-[#1a1527] z-10">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="Fechar" className="text-[#9b95ad] hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/** Campos de formulário reutilizáveis (estilo consistente) */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-[#9b95ad] mb-1">{label}</label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50";
