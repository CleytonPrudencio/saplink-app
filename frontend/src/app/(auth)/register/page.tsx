"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/i18n/I18n";
import { tUI, UI } from "@/i18n/ui";

const TXT = {
  title: { pt: "Cadastro indisponível no momento", en: "Sign-up unavailable right now", es: "Registro no disponible por ahora" },
  body: { pt: "As inscrições estão temporariamente fechadas. Deixe seu interesse e o nosso time entra em contato.", en: "Registrations are temporarily closed. Leave your interest and our team will reach out.", es: "Las inscripciones están temporalmente cerradas. Deja tu interés y nuestro equipo te contactará." },
  redirecting: { pt: "Redirecionando para a página inicial…", en: "Redirecting to the home page…", es: "Redirigiendo a la página de inicio…" },
} as const;

// Cadastro temporariamente FECHADO. Quem quiser entrar manifesta interesse na landing.
export default function RegisterClosedPage() {
  const router = useRouter();
  const { lang } = useLang();
  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1a1527] rounded-2xl p-8 border border-white/[0.08] shadow-2xl text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-xl font-bold text-[#e2e0ea] mb-2">{TXT.title[lang]}</h1>
        <p className="text-[#9b95ad] leading-relaxed mb-6">{TXT.body[lang]}</p>
        <Link href="/" className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold cursor-pointer">
          {tUI(UI.auth.interest, lang)}
        </Link>
        <p className="text-xs text-[#6b6580] mt-4">{TXT.redirecting[lang]}</p>
      </div>
    </div>
  );
}
