"use client";

import { Modal } from "@/components/Modal";
import { useLang } from "@/i18n/I18n";

const FALLBACK = {
  pt: { confirm: "Confirmar", cancel: "Cancelar" },
  en: { confirm: "Confirm", cancel: "Cancel" },
  es: { confirm: "Confirmar", cancel: "Cancelar" },
} as const;

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { lang } = useLang();
  const fb = FALLBACK[lang] ?? FALLBACK.pt;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[#9b95ad] leading-relaxed">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-white/[0.06] text-[#e2e0ea] text-sm hover:bg-white/[0.12] cursor-pointer transition"
        >
          {cancelLabel ?? fb.cancel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg text-white text-sm font-semibold cursor-pointer transition ${
            danger ? "bg-rose-500 hover:bg-rose-600" : "bg-purple-500 hover:bg-purple-600"
          }`}
        >
          {confirmLabel ?? fb.confirm}
        </button>
      </div>
    </Modal>
  );
}
