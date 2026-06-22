"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

export default function TermosPage() {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <div className="min-h-screen bg-transparent text-[#e2e0ea]">
      <header className="border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={26} /></Link>
          <Link href="/register" className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white">{t.createAccount}</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-sm text-[#9b95ad] mb-8">{t.subtitle}</p>
        <div className="space-y-7">
          {t.sections.map((s) => (
            <section key={s.t}>
              <h2 className="text-lg font-semibold text-[#e2e0ea] mb-2">{s.t}</h2>
              {s.p.map((para, i) => (
                <p key={i} className="text-sm text-[#9b95ad] leading-relaxed mb-2">{para}</p>
              ))}
            </section>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-white/[0.06]">
          <Link href="/register" className="text-purple-400 hover:text-purple-300">{t.backToRegister}</Link>
        </div>
      </main>
    </div>
  );
}
