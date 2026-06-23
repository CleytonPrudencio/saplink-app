"use client";

import { ReactNode, useEffect } from "react";
import { useLang } from "@/i18n/I18n";
import { UI, tUI } from "@/i18n/ui";

// Drawer lateral reutilizável para detalhes de um item de lista:
// campos, "o que fazer" (passos + transação SAP), ações e conteúdo extra (ex.: IA).
export default function DetailSheet({
  open, onClose, icon, title, subtitle, badge, fields, guideTitle, guideSteps, guideTx, actions, children,
}: {
  open: boolean; onClose: () => void; icon?: ReactNode; title: string; subtitle?: string; badge?: ReactNode;
  fields?: { label: string; value: ReactNode }[]; guideTitle?: string; guideSteps?: string[]; guideTx?: string;
  actions?: ReactNode; children?: ReactNode;
}) {
  const { lang } = useLang();
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/60 backdrop-blur-sm no-print" onClick={onClose}>
      <div className="w-full sm:max-w-md h-full bg-[#15101f] border-l border-white/[0.1] overflow-y-auto shadow-2xl animate-[slk-rise_.25s_ease]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-[#15101f] border-b border-white/[0.08] px-5 py-4 flex items-start gap-3">
          {icon && <span className="text-2xl shrink-0 leading-none mt-0.5">{icon}</span>}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[#e2e0ea] leading-tight break-words">{title}</h3>
            {subtitle && <p className="text-xs text-[#9b95ad] mt-0.5 break-words">{subtitle}</p>}
          </div>
          {badge}
          <button onClick={onClose} aria-label={tUI(UI.comp.close, lang)} className="text-[#9b95ad] hover:text-white text-xl leading-none shrink-0 cursor-pointer">✕</button>
        </div>
        <div className="p-5 space-y-5">
          {fields && fields.length > 0 && (
            <dl className="space-y-2">
              {fields.filter((f) => f.value !== undefined && f.value !== null && f.value !== "").map((f, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <dt className="text-[#9b95ad] w-32 shrink-0">{f.label}</dt>
                  <dd className="text-[#e2e0ea] min-w-0 break-words flex-1">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {guideSteps && guideSteps.length > 0 && (
            <div className="rounded-xl bg-purple-500/[0.07] border border-purple-500/20 p-4">
              {guideTitle && <p className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">💡 {guideTitle}</p>}
              <ol className="space-y-1.5">
                {guideSteps.map((s, i) => (
                  <li key={i} className="text-sm text-[#d6d3e0] flex gap-2"><span className="text-cyan-400 shrink-0">{i + 1}.</span><span>{s}</span></li>
                ))}
              </ol>
              {guideTx && <p className="text-xs text-[#9b95ad] mt-3">SAP: <span className="font-mono text-[#c9c5d6]">{guideTx}</span></p>}
            </div>
          )}
          {children}
          {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
