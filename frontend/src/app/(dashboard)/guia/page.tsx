"use client";

import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

export default function GuiaPage() {
  const { lang } = useLang();
  const t = T[lang];
  const EBOOK = t.ebook;
  const SSO_SETUP = t.ssoSetup;
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="no-print flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">{t.pageTitle}</h1>
          <p className="text-[#9b95ad] text-sm mt-1">{t.pageSubtitle}</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 text-sm font-semibold cursor-pointer">{t.downloadPdf}</button>
      </div>

      {EBOOK.map((ch) => (
        <section key={ch.title}>
          <h2 className="text-xl font-bold" style={{ color: ch.color }}>{ch.title}</h2>
          <p className="text-sm text-[#9b95ad] mt-1 mb-4">{ch.intro}</p>
          <div className="space-y-3">
            {ch.topics.map((topic) => (
              <div key={topic.name} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2"><span className="text-xl">{topic.icon}</span><h3 className="font-semibold text-[#e2e0ea]">{topic.name}</h3></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div><p className="text-[11px] uppercase tracking-wider text-[#6b6580] mb-0.5">{t.labelWhat}</p><p className="text-[#c9c5d6]">{topic.what}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider text-[#6b6580] mb-0.5">{t.labelHow}</p><p className="text-[#c9c5d6]">{topic.how}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider text-[#6b6580] mb-0.5">{t.labelDo}</p><p className="text-emerald-200">{topic.do}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Configuração técnica — SSO + conectores */}
      <section>
        <h2 className="text-xl font-bold" style={{ color: "#c084fc" }}>{t.techTitle}</h2>
        <p className="text-sm text-[#9b95ad] mt-1 mb-4">{t.techSubtitle}</p>

        <div className="bg-purple-500/[0.06] border border-purple-500/20 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-[#e2e0ea] mb-1">{t.ssoBoxTitle}</h3>
          <p className="text-sm text-[#c9c5d6]">{t.ssoBoxText}</p>
        </div>

        <div className="space-y-3">
          {SSO_SETUP.map((g) => (
            <div key={g.name} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><span className="text-xl">{g.icon}</span><h3 className="font-semibold text-[#e2e0ea]">{g.name}</h3></div>
              <p className="text-sm text-[#9b95ad] mb-3">{g.intro}</p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-[#c9c5d6] mb-3">
                {g.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <div className="space-y-1.5">
                {g.fields.map((f) => (
                  <div key={f.label} className="bg-[#0f0b1a] border border-white/[0.08] rounded-lg px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wider text-[#6b6580]">{f.label}</p>
                    <code className="text-xs text-purple-200 break-all">{f.value}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 mt-3">
          <div className="flex items-center gap-2 mb-1"><span className="text-xl">🔌</span><h3 className="font-semibold text-[#e2e0ea]">{t.connectorsTitle}</h3></div>
          <p className="text-sm text-[#9b95ad] mb-3">{t.connectorsIntro}</p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-[#c9c5d6]">
            {t.connectorsSteps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      </section>

      <p className="text-xs text-[#6b6580] no-print">{t.footerTip}</p>
    </div>
  );
}
