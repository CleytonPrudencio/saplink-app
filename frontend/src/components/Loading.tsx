"use client";

// Spinner e loader de tela cheia branded — reutilizáveis em todo o app.
import { useLang } from "@/i18n/I18n";
import { UI, tUI } from "@/i18n/ui";

export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-block rounded-full border-2 border-white/[0.12] border-t-purple-400 animate-spin"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export default function Loading({ label, full = true }: { label?: string; full?: boolean }) {
  const { lang } = useLang();
  const text = label ?? tUI(UI.comp.loading, lang);
  return (
    <div className={`${full ? "min-h-[60vh]" : "py-16"} w-full flex flex-col items-center justify-center gap-4`} role="status" aria-live="polite">
      <div className="relative">
        <span className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: "radial-gradient(circle, rgba(124,58,237,.5), transparent 70%)" }} />
        <Spinner size={40} />
      </div>
      <p className="text-sm text-[#9b95ad] animate-pulse">{text}</p>
    </div>
  );
}
