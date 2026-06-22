"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

export default function FuncionalidadesPage() {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <div className="min-h-screen bg-transparent text-[#e2e0ea]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0f0b1a]/85 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <Link href="/"><Logo size={26} /></Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="text-sm text-[#9b95ad] hover:text-white transition hidden sm:inline">{t.navHome}</Link>
            <Link href="/#planos" className="text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold">{t.navInterested}</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-5">
        {/* Hero */}
        <section className="py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">{t.heroTitle}</h1>
          <p className="text-[#9b95ad] max-w-2xl mx-auto mt-4 leading-relaxed">
            {t.heroSubtitle}
          </p>
        </section>

        {/* Índice */}
        <nav className="flex flex-wrap gap-2 justify-center pb-10">
          {t.groups.map((g, gi) => (
            <a key={g.title} href={`#grp${gi}`} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition" style={{ color: g.color }}>
              {g.title}
            </a>
          ))}
        </nav>

        {t.groups.map((g, gi) => (
          <section key={g.title} id={`grp${gi}`} className="py-10 border-t border-white/[0.06]">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: g.color }}>{g.title}</h2>
            <p className="text-[#9b95ad] mt-2 mb-8 max-w-3xl">{g.intro}</p>
            <div className="space-y-5">
              {g.features.map((f) => (
                <article key={f.name} className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-4 flex-wrap">
                    <span className="text-4xl">{f.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold">{f.name}</h3>
                        {f.flag && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase">{f.flag}</span>}
                      </div>
                      <p className="text-sm" style={{ color: g.color }}>{f.tagline}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6580] mb-1">{t.howItWorks}</p>
                      <p className="text-sm text-[#c9c5d6] leading-relaxed">{f.how}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6580] mt-4 mb-1">{t.realExample}</p>
                      <p className="text-sm text-[#c9c5d6] leading-relaxed bg-[#0f0b1a] border border-white/[0.06] rounded-lg p-3">{f.example}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6580] mb-2">{t.gainsLabel}</p>
                      <ul className="space-y-2">
                        {f.gains.map((gn, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#d6d3e0]">
                            <span className="text-emerald-400 mt-0.5">📈</span><span>{gn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="py-14 sm:py-20 border-t border-white/[0.06]">
          <div className="rounded-2xl p-8 sm:p-12 text-center bg-gradient-to-br from-purple-600/20 to-cyan-500/15 border border-purple-500/30">
            <h2 className="text-2xl sm:text-4xl font-bold">{t.ctaTitle}</h2>
            <p className="text-[#c9c5d6] mt-3 max-w-xl mx-auto">{t.ctaSubtitle}</p>
            <div className="mt-7 flex justify-center">
              <Link href="/#planos" className="px-7 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold">{t.ctaButton}</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9b95ad] text-center sm:text-left">
          <span className="flex items-center gap-2"><Logo size={20} /> © {new Date().getFullYear()} — {t.footerTagline}</span>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-white transition">{t.footerHome}</Link>
            <Link href="/login" className="hover:text-white transition">{t.footerLogin}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
