"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getPublicPlans, submitLead } from "@/lib/api";
import FeatureModal from "@/components/landing/FeatureModal";
import Logo from "@/components/Logo";
import { useLang, pick } from "@/i18n/I18n";
import { tPlanDesc } from "@/i18n/ui";
import { LANDING, type LandingContent } from "@/i18n/landing";
import LangSwitcher from "@/components/LangSwitcher";

interface Plan {
  key: string; name: string; description?: string; priceCents: number;
  maxClients: number; maxIntegrations: number; maxAiDiagnosticsPerMonth: number; maxUsers: number; highlight?: boolean;
}
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });


function InterestModal({ open, onClose, t }: { open: boolean; onClose: () => void; t: LandingContent["interest"] }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", company: "", role: "", employees: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  if (!open) return null;
  async function send(e: React.FormEvent) {
    e.preventDefault(); setState("sending");
    try { await submitLead({ ...f, source: "landing" }); setState("ok"); }
    catch { setState("err"); }
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#15101f] border border-purple-500/30 rounded-2xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        {state === "ok" ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-white">{t.okTitle}</h3>
            <p className="text-[#9b95ad] mt-2">{t.okMsg}</p>
            <button onClick={onClose} className="mt-6 px-5 py-2.5 rounded-lg bg-white/[0.08] text-[#e2e0ea] hover:bg-white/[0.14] cursor-pointer">{t.close}</button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">{t.title}</h3>
                <p className="text-sm text-[#9b95ad] mt-1">{t.sub}</p>
              </div>
              <button onClick={onClose} aria-label={t.close} className="text-[#9b95ad] hover:text-white text-2xl leading-none cursor-pointer">×</button>
            </div>
            <form onSubmit={send} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={t.name} className="inp sm:col-span-2" />
              <input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder={t.email} className="inp" />
              <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder={t.phone} className="inp" />
              <input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder={t.company} className="inp" />
              <input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder={t.role} className="inp sm:col-span-2" />
              <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder={t.message} rows={3} className="inp sm:col-span-2" />
              {state === "err" && <p className="sm:col-span-2 text-sm text-rose-400">{t.err}</p>}
              <button type="submit" disabled={state === "sending"} className="sm:col-span-2 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold disabled:opacity-50 cursor-pointer">
                {state === "sending" ? t.sending : t.send}
              </button>
            </form>
          </>
        )}
      </div>
      <style jsx>{`.inp{background:#0f0b1a;border:1px solid rgba(255,255,255,.1);border-radius:.6rem;padding:.6rem .8rem;font-size:.9rem;color:#e2e0ea;width:100%}.inp:focus{outline:none;border-color:rgba(124,58,237,.6)}`}</style>
    </div>
  );
}

// ── Reveal on scroll ──
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }); }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`${className} transition-all duration-700 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

// ── Número que sobe quando entra na tela ──
function CountUp({ value }: { value: string }) {
  const m = value.match(/^(\d+)(.*)$/); const target = m ? parseInt(m[1]) : 0; const suffix = m ? m[2] : value;
  const ref = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el || target === 0) { setN(target); return; }
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) {
        io.disconnect(); const start = performance.now(); const dur = 1100;
        const tick = (t: number) => { const p = Math.min(1, (t - start) / dur); setN(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    io.observe(el); return () => io.disconnect();
  }, [target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

// ── Palavra que troca sozinha ──
function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((v) => (v + 1) % words.length), 2200); return () => clearInterval(t); }, [words.length]);
  return (
    <span className="relative inline-block align-bottom">
      <span key={i} className="slk-grad inline-block" style={{ animation: "slk-word .5s ease" }}>{words[i]}</span>
    </span>
  );
}

function LivePanel({ t }: { t: { title: string; health: string; risk: string; cur: string; feed: string[]; rows: string[] } }) {
  const FEED = t.feed;
  const base: [string, number, string][] = [
    [t.rows[0], 98, "#34d399"],
    [t.rows[1], 94, "#34d399"],
    [t.rows[2], 71, "#fbbf24"],
    [t.rows[3], 88, "#34d399"],
    [t.rows[4], 62, "#f87171"],
  ];
  const [health, setHealth] = useState(92);
  const [risk, setRisk] = useState(84.2);
  const [rows, setRows] = useState(base.map((r) => r[1]));
  const [feed, setFeed] = useState(0);
  useEffect(() => {
    const a = setInterval(() => {
      setHealth((h) => Math.max(89, Math.min(96, h + (Math.random() < 0.5 ? -1 : 1))));
      setRisk((r) => Math.max(40, Math.min(120, +(r + (Math.random() - 0.5) * 9).toFixed(1))));
      setRows((rs) => rs.map((v, i) => Math.max(40, Math.min(99, v + Math.round((Math.random() - 0.5) * 6 * (i === 4 ? 2 : 1))))));
    }, 1600);
    const b = setInterval(() => setFeed((f) => (f + 1) % FEED.length), 2600);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);
  return (
    <div className="slk-float relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 -z-10 rounded-3xl opacity-60 blur-2xl" style={{ background: "radial-gradient(circle at 50% 30%, rgba(124,58,237,.35), transparent 70%)" }} />
      <div className="rounded-2xl bg-[#15101f] border border-white/[0.1] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08]">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/70" /><span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 text-xs text-[#9b95ad]">{t.title}</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "slk-pulse 1.4s infinite" }} />LIVE</span>
        </div>
        <div className="p-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-[#9b95ad]">{t.health}</p>
              <p className="text-4xl font-extrabold slk-grad tabular-nums">{health}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#9b95ad]">{t.risk}</p>
              <p className="text-xl font-bold text-amber-300 tabular-nums">{t.cur} {risk.toFixed(1).replace(".", t.cur === "R$" ? "," : ".")}k</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {base.map(([name, , color], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-[#c9c5d6] w-40 truncate">{name}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${rows[i]}%`, background: color }} />
                </div>
                <span className="text-[11px] text-[#9b95ad] w-9 text-right tabular-nums">{rows[i]}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 overflow-hidden">
            <span className="text-emerald-300 shrink-0">✓</span>
            <span key={feed} className="text-xs text-emerald-200 truncate" style={{ animation: "slk-word .5s ease" }}>{FEED[feed]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Calculadora de ROI — usa os números do próprio visitante (estimativa honesta).
function RoiCalc({ onInterest, t }: { onInterest: () => void; t: { hoursLabel: string; costLabel: string; assume: string; loseNow: string; saved: string; perMonth: string; perYear: string; cta: string } }) {
  const [hoursLost, setHoursLost] = useState(8);
  const [costHr, setCostHr] = useState(3000);
  const REDU = 0.7; // detecção+remediação rápida reduz ~70% do downtime
  const loss = hoursLost * costHr;
  const saved = Math.round(loss * REDU);
  const Field = ({ label, value, set, min, max, step, fmt }: any) => (
    <div>
      <div className="flex justify-between text-sm mb-1"><span className="text-[#c9c5d6]">{label}</span><span className="font-semibold text-[#e2e0ea]">{fmt(value)}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />
    </div>
  );
  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      <div className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-6 space-y-5">
        <Field label={t.hoursLabel} value={hoursLost} set={setHoursLost} min={1} max={80} step={1} fmt={(v: number) => `${v} h`} />
        <Field label={t.costLabel} value={costHr} set={setCostHr} min={200} max={50000} step={200} fmt={(v: number) => brl(v * 100)} />
        <p className="text-xs text-[#6b6580]">{t.assume}</p>
      </div>
      <div className="bg-gradient-to-br from-purple-600/15 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-6 text-center">
        <p className="text-xs text-[#9b95ad]">{t.loseNow}</p>
        <p className="text-2xl font-bold text-rose-300 line-through opacity-80">{brl(loss * 100)}</p>
        <p className="text-xs text-[#9b95ad] mt-4">{t.saved}</p>
        <p className="text-4xl sm:text-5xl font-extrabold slk-grad tabular-nums">{brl(saved * 100)}<span className="text-base font-normal text-[#9b95ad]">{t.perMonth}</span></p>
        <p className="text-sm text-emerald-300 mt-1">≈ {brl(saved * 12 * 100)}{t.perYear}</p>
        <button onClick={onInterest} className="mt-5 w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold cursor-pointer">{t.cta}</button>
      </div>
    </div>
  );
}

// Isca de lead: e-mail → baixa o deck de vendas (PDF)
function LeadMagnet({ t }: { t: { tag: string; title: string; sub: string; placeholder: string; btn: string; btnSending: string; doneMsg: string; download: string } }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setSending(true);
    try { await submitLead({ name: email.split("@")[0] || "Material", email, message: "Baixou o deck de vendas (lead magnet)" }); }
    catch { /* mesmo se falhar o lead, libera o material */ }
    finally { setSending(false); setDone(true); }
  }
  return (
    <div className="rounded-2xl p-6 sm:p-8 bg-[#1a1527] border border-white/[0.08] grid md:grid-cols-2 gap-6 items-center">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">{t.tag}</p>
        <h3 className="text-xl sm:text-2xl font-bold">{t.title}</h3>
        <p className="text-sm text-[#9b95ad] mt-2 leading-relaxed">{t.sub}</p>
      </div>
      {done ? (
        <div className="text-center bg-[#0f0b1a] rounded-xl p-6 border border-emerald-500/20">
          <p className="text-emerald-300 font-semibold mb-3">{t.doneMsg}</p>
          <a href="/deck-saplink.pdf" target="_blank" rel="noreferrer" download className="inline-block px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold cursor-pointer">{t.download}</a>
        </div>
      ) : (
        <form onSubmit={go} className="flex flex-col sm:flex-row gap-2">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.placeholder} className="flex-1 bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-4 py-3 text-sm" />
          <button type="submit" disabled={sending} className="px-5 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold disabled:opacity-50 cursor-pointer whitespace-nowrap">{sending ? t.btnSending : t.btn}</button>
        </form>
      )}
    </div>
  );
}

// Barra de progresso de scroll (topo)
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => { const h = document.documentElement; const max = h.scrollHeight - h.clientHeight; setP(max > 0 ? (h.scrollTop / max) * 100 : 0); };
    on(); window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return <div className="fixed top-0 left-0 right-0 z-[55] h-0.5 pointer-events-none"><div className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400" style={{ width: `${p}%` }} /></div>;
}

// Demo interativa — clique e veja a IA agir (sem cadastro). Roteiro encenado.
function TryDemo({ t }: { t: { fail: string; btn: string; btnRunning: string; hint: string; script: string[] } }) {
  const [lines, setLines] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const SCRIPT = t.script;
  function run() {
    setRunning(true); setLines([]);
    SCRIPT.forEach((l, i) => setTimeout(() => { setLines((p) => [...p, l]); if (i === SCRIPT.length - 1) setRunning(false); }, 600 * (i + 1)));
  }
  return (
    <div className="bg-[#1a1527] border border-purple-500/25 rounded-2xl p-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between gap-3 bg-[#0f0b1a] rounded-lg px-3 py-2.5 mb-3">
        <span className="text-sm text-[#e2e0ea]">{t.fail} <span className="text-[#6b6580] font-mono text-xs">msg 9f2a…</span></span>
        <button onClick={run} disabled={running} className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold disabled:opacity-50 cursor-pointer shrink-0">{running ? t.btnRunning : t.btn}</button>
      </div>
      <div className="min-h-[150px] space-y-1.5">
        {lines.length === 0 && <p className="text-sm text-[#6b6580]">{t.hint}</p>}
        {lines.map((l, i) => <p key={i} className="text-sm text-[#c9c5d6]" style={{ animation: "slk-rise .4s ease" }}>{l}</p>)}
      </div>
    </div>
  );
}

// Antes / Depois com régua arrastável
function BeforeAfter({ t }: { t: { beforeTag: string; beforeText: string; beforeChips: string[]; afterTag: string; afterText: string; afterChips: string[]; drag: string } }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative max-w-3xl mx-auto select-none">
      <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/[0.1]">
        {/* Depois (fundo) */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 to-cyan-500/10 p-5">
          <p className="text-xs font-bold text-cyan-300 mb-2">{t.afterTag}</p>
          <p className="text-sm text-[#e2e0ea]">{t.afterText}</p>
          <div className="mt-4 flex gap-2 flex-wrap">{t.afterChips.map((c) => <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-white/[0.08] text-emerald-200">{c}</span>)}</div>
        </div>
        {/* Antes (clipado) */}
        <div className="absolute inset-0 bg-[#15101f] p-5" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <p className="text-xs font-bold text-rose-300 mb-2">{t.beforeTag}</p>
          <p className="text-sm text-[#9b95ad]">{t.beforeText}</p>
          <div className="mt-4 flex gap-2 flex-wrap">{t.beforeChips.map((c) => <span key={c} className="text-[11px] px-2 py-1 rounded-full bg-white/[0.06] text-[#9b95ad]">{c}</span>)}</div>
        </div>
        {/* Linha */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-cyan-400/70" style={{ left: `${pos}%` }} />
      </div>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="w-full mt-3 accent-cyan-400 cursor-pointer" aria-label="compare" />
      <p className="text-center text-xs text-[#6b6580] mt-1">{t.drag}</p>
    </div>
  );
}

// Fluxo de dados animado
function FlowDiagram({ nodes }: { nodes: [string, string, string][] }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-1 max-w-5xl mx-auto">
      {nodes.map((n, i) => (
        <div key={n[1]} className="flex items-center gap-2 flex-1">
          <div className="flex-1 bg-[#1a1527] border border-white/[0.1] rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{n[0]}</div>
            <p className="font-semibold text-sm">{n[1]}</p>
            <p className="text-[11px] text-[#9b95ad] mt-0.5">{n[2]}</p>
          </div>
          {i < nodes.length - 1 && (
            <div className="relative hidden sm:block w-10 h-6 shrink-0">
              <div className="absolute top-1/2 left-0 right-1 h-px bg-white/[0.15]" />
              <span className="slk-flowdot" style={{ background: "#a78bfa", animationDelay: `${i * 0.5}s` }} />
              <span className="slk-flowdot" style={{ background: "#22d3ee", animationDelay: `${i * 0.5 + 1.3}s` }} />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-purple-400 text-xs">▸</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [annual, setAnnual] = useState(false);
  const [interest, setInterest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feature, setFeature] = useState<{ key: string; icon: string; name: string; tagline: string; accent: string } | null>(null);
  const { lang } = useLang();
  const L = pick(LANDING, lang);

  useEffect(() => { getPublicPlans().then((p) => setPlans(Array.isArray(p) ? p : [])).catch(() => {}); }, []);
  const cta = (label: string, primary = true, cls = "") => (
    <button onClick={() => setInterest(true)} className={`${primary ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.12]"} px-6 py-3 rounded-lg font-semibold transition cursor-pointer ${cls}`}>{label}</button>
  );

  return (
    <div className="min-h-screen bg-transparent text-[#e2e0ea] overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "SoftwareApplication",
          name: "SAPLINK", applicationCategory: "BusinessApplication", operatingSystem: "Web",
          description: "Plataforma multi-cliente que monitora, prevê, corrige e prova valor em R$ nas integrações SAP — do IDoc ao S/4HANA Cloud.",
          url: "https://saplink.com.br", offers: { "@type": "Offer", priceCurrency: "BRL" },
          publisher: { "@type": "Organization", name: "SAPLINK", url: "https://saplink.com.br" },
        }) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: L.faq.items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }) }}
      />
      <ScrollProgress />
      <InterestModal open={interest} onClose={() => setInterest(false)} t={L.interest} />
      <FeatureModal feature={feature} onClose={() => setFeature(null)} onInterest={() => setInterest(true)} />

      {/* CTA flutuante persistente */}
      <button onClick={() => setInterest(true)} className="fixed bottom-4 right-4 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white text-sm font-semibold shadow-[0_8px_30px_rgba(124,58,237,0.45)] hover:opacity-90 transition cursor-pointer">
        {L.ctaFinal.btn}
      </button>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0b1a] border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
          <a href="#top" className="shrink-0"><Logo size={30} /></a>
          <nav className="hidden lg:flex items-center gap-6 text-sm text-[#9b95ad]">
            {L.nav.map((n) => <a key={n.id} href={`#${n.id}`} className="hover:text-white transition">{n.label}</a>)}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden lg:block"><LangSwitcher compact /></div>
            <Link href="/login" className="hidden lg:inline px-3 sm:px-4 py-2 text-sm text-[#e2e0ea] hover:text-white transition">{L.footer.login}</Link>
            <button onClick={() => setInterest(true)} className="hidden sm:inline-flex px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition cursor-pointer whitespace-nowrap">{L.interest.title}</button>
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className="lg:hidden text-[#e2e0ea] p-1.5 -mr-1 cursor-pointer text-xl leading-none">{menuOpen ? "✕" : "☰"}</button>
          </div>
        </div>
        {menuOpen && (
          <nav className="lg:hidden border-t border-white/[0.06] bg-[#0f0b1a] px-4 py-3 flex flex-col gap-1 text-sm text-[#9b95ad]">
            {L.nav.map((n) => <a key={n.id} href={`#${n.id}`} onClick={() => setMenuOpen(false)} className="py-2 hover:text-white border-b border-white/[0.04]">{n.label}</a>)}
            <div className="flex items-center justify-between gap-3 pt-3">
              <LangSwitcher />
              <div className="flex items-center gap-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.12] transition">{L.footer.login}</Link>
                <button onClick={() => { setMenuOpen(false); setInterest(true); }} className="px-3 py-2 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 text-white transition cursor-pointer">{L.interest.title}</button>
              </div>
            </div>
          </nav>
        )}
      </header>

      <style>{`
        @keyframes slk-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes slk-pan { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes slk-pulse { 0%,100%{opacity:.35} 50%{opacity:.9} }
        @keyframes slk-bar { 0%{transform:scaleX(.4)} 50%{transform:scaleX(1)} 100%{transform:scaleX(.7)} }
        @keyframes slk-word { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes slk-marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .slk-grad { background:linear-gradient(90deg,#a78bfa,#22d3ee,#34d399,#a78bfa); background-size:200% auto; -webkit-background-clip:text; background-clip:text; color:transparent; animation:slk-pan 6s linear infinite; }
        .slk-float { animation:slk-float 5s ease-in-out infinite; }
        .slk-bar { transform-origin:left; animation:slk-bar 2.4s ease-in-out infinite; }
        .slk-marquee { display:flex; width:max-content; animation:slk-marquee 28s linear infinite; }
        .slk-marquee:hover { animation-play-state:paused; }
        .slk-tilt { transition:transform .25s ease, box-shadow .25s ease; }
        .slk-tilt:hover { transform:translateY(-4px); box-shadow:0 12px 40px rgba(124,58,237,.18); }
        @keyframes slk-flow { 0%{left:-6%;opacity:0} 12%{opacity:1} 88%{opacity:1} 100%{left:104%;opacity:0} }
        @keyframes slk-rise { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .slk-flowdot { position:absolute; top:50%; width:7px; height:7px; border-radius:9999px; margin-top:-3.5px; animation:slk-flow 2.6s linear infinite; }
        @media (prefers-reduced-motion: reduce){ .slk-grad,.slk-float,.slk-bar,.slk-marquee,.slk-flowdot{animation:none!important} }
      `}</style>

      <main id="top" className="max-w-6xl mx-auto px-4 sm:px-5">
        {/* Hero */}
        <section className="pt-14 pb-12 sm:pt-20 sm:pb-16 relative">
          <div className="absolute inset-0 -z-10 opacity-30" style={{ background: "radial-gradient(600px 320px at 80% 30%, rgba(124,58,237,.18), transparent)" }} />
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs text-purple-200 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "slk-pulse 1.6s ease-in-out infinite" }} /> {L.hero.badge}
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.05]">
                {L.hero.titleA}<br /><RotatingWord words={L.hero.rotate} /><br />{L.hero.titleB}
              </h1>
              <p className="text-base sm:text-lg text-[#c9c5d6] max-w-xl mx-auto lg:mx-0 mt-6 leading-relaxed">{L.hero.subtitle}</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-8">
                {cta(L.hero.ctaPrimary, true, "shadow-[0_0_30px_rgba(124,58,237,0.35)]")}
                <a href="#cobertura" className="px-6 py-3 rounded-lg bg-white/[0.06] text-[#e2e0ea] font-semibold hover:bg-white/[0.12] transition">{L.hero.ctaSecondary}</a>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start mt-7 text-xs text-[#6b6580]">
                {L.hero.micro.map((m) => <span key={m}>{m}</span>)}
              </div>
            </div>
            <LivePanel t={L.hero.live} />
          </div>

          {/* Faixa de métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12">
            {L.metrics.map(([n, l]) => (
              <div key={l} className="slk-tilt rounded-xl bg-[#1a1527] border border-white/[0.08] p-4 text-center">
                <div className="text-3xl font-extrabold slk-grad tabular-nums"><CountUp value={n} /></div>
                <div className="text-xs text-[#9b95ad] mt-1">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Cobertura SAP */}
        {/* Para quem é */}
        <section className="py-12 border-t border-white/[0.06]">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-[#6b6580] mb-6">{L.feitoPara}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {L.personas.map(([ic, t, d]) => (
              <div key={t} className="slk-tilt bg-[#1a1527] border border-white/[0.08] rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{ic}</div>
                <p className="font-bold">{t}</p>
                <p className="text-sm text-[#9b95ad] mt-1 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="cobertura" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold mb-4">{L.coverage.badge}</span>
            <h2 className="text-2xl sm:text-4xl font-bold">{L.coverage.title}</h2>
            <p className="text-[#9b95ad] mt-3">{L.coverage.sub}</p>
          </div>
          {/* marquee contínuo de produtos */}
          <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <div className="slk-marquee gap-3 py-1">
              {[...L.coverage.items, ...L.coverage.items].map(([ic, name], i) => (
                <span key={i} className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-[#c9c5d6]"><span>{ic}</span>{name}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {L.coverage.items.map(([ic, name, sub], i) => (
              <Reveal key={name} delay={(i % 6) * 60}>
                <div className="slk-tilt group h-full rounded-xl bg-[#1a1527] border border-white/[0.08] p-4 text-center hover:border-purple-500/50 hover:bg-purple-500/[0.04]">
                  <div className="text-3xl mb-2 transition group-hover:scale-110">{ic}</div>
                  <p className="font-semibold text-sm leading-tight">{name}</p>
                  <p className="text-[11px] text-[#9b95ad] mt-1 leading-tight">{sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Problema */}
        {/* Por dentro do produto */}
        <section id="produto" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-bold mb-4">{L.produto.badge}</span>
            <h2 className="text-2xl sm:text-4xl font-bold">{L.produto.title}</h2>
            <p className="text-[#9b95ad] mt-3">{L.produto.sub}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-9">
            {/* Dashboard */}
            <Reveal>
              <div className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-4 h-full">
                <p className="text-xs text-[#9b95ad] mb-3">{L.produto.dash}</p>
                <div className="flex items-end gap-3 mb-3"><span className="text-4xl font-extrabold slk-grad">92</span><span className="text-xs text-[#9b95ad] mb-1">{L.produto.healthAvg}</span></div>
                {[["Agro Nordeste", 96, "#34d399"], ["Têxtil Sul", 78, "#fbbf24"], ["Metalúrgica BR", 61, "#f87171"]].map(([n, v, c]) => (
                  <div key={n as string} className="flex items-center gap-2 mb-2"><span className="text-xs text-[#c9c5d6] w-28 truncate">{n}</span><div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${v}%`, background: c as string }} /></div><span className="text-[11px] text-[#9b95ad] w-7 text-right">{v}</span></div>
                ))}
              </div>
            </Reveal>
            {/* Cockpit */}
            <Reveal delay={80}>
              <div className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-4 h-full">
                <p className="text-xs text-[#9b95ad] mb-3">{L.produto.cockpit}</p>
                <div className="space-y-1.5 text-xs">
                  {[["IDoc 51", "ORDERS05", "bg-rose-500/15 text-rose-300"], ["qRFC SYSFAIL", "SMQ2", "bg-amber-500/15 text-amber-300"], ["tRFC", "SM58", "bg-amber-500/15 text-amber-300"], ["IDoc 53", "INVOIC02", "bg-emerald-500/15 text-emerald-300"]].map(([a, b, c]) => (
                    <div key={a as string} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-2.5 py-1.5"><span className="text-[#e2e0ea]">{a} <span className="text-[#6b6580] font-mono">{b}</span></span><span className={`px-1.5 py-0.5 rounded ${c as string}`}>●</span></div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-emerald-300">{L.produto.cockpitApproval}</div>
              </div>
            </Reveal>
            {/* Impacto R$ */}
            <Reveal delay={160}>
              <div className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-4 h-full">
                <p className="text-xs text-[#9b95ad] mb-3">{L.produto.impact}</p>
                <div className="text-center py-2"><p className="text-xs text-[#9b95ad]">{L.produto.impactNow}</p><p className="text-3xl font-extrabold text-amber-300">{L.produto.impactTotal}</p></div>
                <div className="space-y-1.5 text-xs mt-1">
                  {L.produto.impactRows.map(([a, b]) => (
                    <div key={a} className="flex justify-between bg-[#0f0b1a] rounded-lg px-2.5 py-1.5"><span className="text-[#c9c5d6]">{a}</span><span className="text-amber-300 font-semibold">{b}</span></div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
          <p className="text-center text-xs text-[#6b6580] mt-4">{L.produto.note}</p>

          <div className="mt-10">
            <p className="text-center text-sm font-semibold text-[#e2e0ea] mb-1">{L.produto.tryTitle}</p>
            <p className="text-center text-xs text-[#9b95ad] mb-5">{L.produto.trySub}</p>
            <TryDemo t={L.demo} />
          </div>
        </section>

        {/* Calculadora de ROI */}
        <section id="roi" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto mb-9">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold mb-4">{L.roi.badge}</span>
            <h2 className="text-2xl sm:text-4xl font-bold">{L.roi.title}</h2>
            <p className="text-[#9b95ad] mt-3">{L.roi.sub}</p>
          </div>
          <RoiCalc onInterest={() => setInterest(true)} t={L.roi} />
        </section>

        <section id="problema" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{L.problema.title}</h2>
          <p className="text-[#9b95ad] max-w-3xl leading-relaxed">{L.problema.p}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {L.problema.cards.map((c, i) => (
              <div key={i} className={`rounded-xl p-5 border ${i === 2 ? "bg-gradient-to-br from-purple-600/15 to-cyan-500/10 border-purple-500/30" : "bg-[#1a1527] border-white/[0.08]"}`}>
                <p className={`font-semibold ${i === 2 ? "text-cyan-300" : "text-[#e2e0ea]"}`}>{c[0]}</p>
                <p className="text-sm text-[#9b95ad] mt-1 leading-relaxed">{c[1]}</p>
              </div>
            ))}
          </div>
          <div className="mt-10"><BeforeAfter t={L.problema} /></div>
        </section>

        {/* Como funciona + fluxo */}
        <section id="como" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{L.como.title}</h2>
          <p className="text-[#9b95ad] mb-8">{L.como.sub}</p>
          <div className="mb-10"><FlowDiagram nodes={L.como.flow} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {L.como.steps.map((s) => (
              <div key={s[0]} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold flex items-center justify-center mb-3">{s[0]}</div>
                <p className="font-semibold">{s[1]}</p>
                <p className="text-sm text-[#9b95ad] mt-1 leading-relaxed">{s[2]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Plataforma (grupos de features) */}
        <section id="plataforma" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{L.plataforma.title}</h2>
          <p className="text-[#9b95ad] mb-8">{L.plataforma.sub}</p>
          <div className="space-y-5">
            {L.groups.map((g) => (
              <div key={g.title} className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.accent }} />
                  <h3 className="font-bold text-lg" style={{ color: g.accent }}>{g.title}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {g.feats.map((f) => (
                    <button key={f.key} onClick={() => setFeature({ key: f.key, icon: f.icon, name: f.name, tagline: f.tagline, accent: g.accent })} className="slk-tilt text-left bg-[#0f0b1a] rounded-xl p-4 border border-white/[0.05] hover:border-white/[0.2] hover:bg-white/[0.02] group cursor-pointer">
                      <div className="text-2xl mb-1.5">{f.icon}</div>
                      <p className="font-semibold text-sm">{f.name}</p>
                      <p className="text-xs text-[#9b95ad] mt-1 leading-relaxed">{f.tagline}</p>
                      <p className="text-[11px] mt-2 font-medium opacity-0 group-hover:opacity-100 transition" style={{ color: g.accent }}>{L.featHover}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* S/4HANA Cloud — destaque */}
        <section id="s4" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <div className="rounded-2xl p-6 sm:p-10 bg-gradient-to-br from-amber-500/10 via-purple-600/10 to-cyan-500/10 border border-amber-500/20">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold mb-4">{L.s4.badge}</span>
            <h2 className="text-2xl sm:text-4xl font-bold">{L.s4.titlePre} <span className="text-amber-300">S/4HANA Cloud</span></h2>
            <p className="text-[#c9c5d6] max-w-3xl mt-3 leading-relaxed">{L.s4.sub}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {L.s4.cards.map((c) => (
                <div key={c.title} className="bg-[#0f0b1a]/60 rounded-xl p-4 border border-white/[0.08]">
                  <div className="text-2xl mb-1.5">{c.icon}</div>
                  <p className="font-semibold text-sm text-amber-200">{c.title}</p>
                  <p className="text-xs text-[#9b95ad] mt-1 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inovação — diferenciais únicos (no ar) */}
        <section id="inovacao" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold mb-4">{L.innovHead.badge}</span>
          <h2 className="text-2xl sm:text-4xl font-bold mb-2">{L.innovHead.title}</h2>
          <p className="text-[#9b95ad] mb-8 max-w-3xl">{L.innovHead.sub}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {L.innovations.map((g) => (
              <button key={g.key} onClick={() => setFeature({ key: g.key, icon: g.icon, name: g.name, tagline: g.tagline, accent: "#a78bfa" })} className="slk-tilt text-left bg-gradient-to-br from-purple-600/10 to-cyan-500/[0.06] border border-purple-500/25 rounded-2xl p-6 hover:border-purple-500/60 group cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <p className="font-bold text-lg">{g.name}</p>
                    <p className="text-xs text-cyan-300">{g.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-[#c9c5d6] leading-relaxed">{g.desc}</p>
                <p className="text-sm text-emerald-300 mt-3 flex items-center gap-1.5"><span>📈</span>{g.benefit}</p>
                <p className="text-[11px] mt-3 text-purple-300 opacity-0 group-hover:opacity-100 transition">{L.innovHead.hover}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/funcionalidades" className="inline-block px-6 py-3 rounded-lg bg-white/[0.08] text-[#e2e0ea] font-semibold hover:bg-white/[0.14] transition">
              {L.innovHead.more}
            </Link>
          </div>
        </section>

        {/* Planos */}
        {/* Comparativo */}
        <section id="comparativo" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{L.comparativo.title}</h2>
          <p className="text-[#9b95ad] mb-8">{L.comparativo.sub}</p>
          <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="text-left px-4 py-3 font-medium">&nbsp;</th>
                  {L.comparativo.cols.map((c, i) => <th key={c} className={`px-3 py-3 font-semibold text-center ${i === L.comparativo.cols.length - 1 ? "text-cyan-300" : "text-[#9b95ad]"}`}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {L.comparativo.rows.map((r) => (
                  <tr key={r[0]} className="border-b border-white/[0.04]">
                    <td className="px-4 py-2.5 text-[#c9c5d6]">{r[0]}</td>
                    {r.slice(1).map((v, i) => (
                      <td key={i} className={`px-3 py-2.5 text-center text-lg ${i === 3 ? "bg-purple-500/[0.06]" : ""}`}>
                        <span className={v === "✓" ? "text-emerald-400" : v === "~" ? "text-amber-400" : "text-[#4a4560]"}>{v}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#6b6580] mt-2">{L.comparativo.legend}</p>
        </section>

        {/* Confiança / segurança */}
        <section className="py-12 border-t border-white/[0.06]">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-7">{L.trust.title}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {L.trust.band.map(([ic, t]) => (
              <div key={t} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 flex items-center gap-3">
                <span className="text-xl shrink-0">{ic}</span><span className="text-sm text-[#c9c5d6] leading-tight">{t}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {L.trust.cards.map(([t, d]) => (
              <div key={t} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5">
                <p className="font-semibold text-[#e2e0ea]">{t}</p>
                <p className="text-sm text-[#9b95ad] mt-1 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#6b6580] mt-5">{L.trust.roadmap} · <a href="/termos" className="text-purple-300 underline">{L.footer.terms}</a> · <a href="/privacidade" className="text-purple-300 underline">{L.footer.privacy}</a> · <a href="/contrato" className="text-purple-300 underline">{L.footer.contract}</a></p>
        </section>

        <section id="planos" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">{L.planos.title}</h2>
          <p className="text-[#9b95ad] mb-2">{L.planos.sub1}</p>
          <p className="text-sm text-[#c9c5d6] mb-6">{L.planos.sub2}</p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm ${!annual ? "text-white font-semibold" : "text-[#9b95ad]"}`}>{L.planos.monthly}</span>
            <button onClick={() => setAnnual((v) => !v)} className={`relative w-12 h-6 rounded-full transition cursor-pointer ${annual ? "bg-emerald-500" : "bg-white/[0.15]"}`} aria-label="monthly/annual">
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${annual ? "translate-x-6" : ""}`} />
            </button>
            <span className={`text-sm ${annual ? "text-white font-semibold" : "text-[#9b95ad]"}`}>{L.planos.annual} <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 ml-1">{L.planos.annualBadge}</span></span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {plans.map((p) => (
              <div key={p.key} className={`relative bg-[#1a1527] rounded-xl p-5 border flex flex-col ${p.highlight ? "border-purple-500/60 shadow-[0_0_25px_rgba(124,58,237,0.15)]" : "border-white/[0.08]"}`}>
                {p.highlight && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white whitespace-nowrap">MAIS POPULAR</span>}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                {annual ? (
                  <p className="text-2xl font-bold mt-1">{brl(p.priceCents * 10)}<span className="text-sm font-normal text-[#9b95ad]">{L.planos.perYear}</span><span className="block text-xs font-normal text-emerald-300 mt-0.5">≈ {brl(Math.round(p.priceCents * 10 / 12))}{L.planos.perMonthEq}</span></p>
                ) : (
                  <p className="text-2xl font-bold mt-1">{brl(p.priceCents)}<span className="text-sm font-normal text-[#9b95ad]">{L.roi.perMonth}</span></p>
                )}
                {tPlanDesc(p.key, p.description, lang) && <p className="text-xs text-[#9b95ad] mt-2 min-h-[32px]">{tPlanDesc(p.key, p.description, lang)}</p>}
                <ul className="text-sm text-[#c9c5d6] mt-4 space-y-1.5 flex-1">
                  <li>✓ {p.maxClients >= 999 ? "∞" : p.maxClients} {lang === "en" ? "clients" : "clientes"}</li>
                  <li>✓ {p.maxIntegrations >= 999 ? "∞" : p.maxIntegrations} {lang === "en" ? "integrations" : lang === "es" ? "integraciones" : "integrações"}</li>
                  <li>✓ {p.maxAiDiagnosticsPerMonth} {lang === "en" ? "AI diagnoses/mo" : lang === "es" ? "diagnósticos IA/mes" : "diagnósticos IA/mês"}</li>
                  <li>✓ {p.maxUsers} {lang === "en" ? "users" : lang === "es" ? "usuarios" : "usuários"}</li>
                </ul>
                <button onClick={() => setInterest(true)} className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold ${p.highlight ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-white/[0.08] text-[#e2e0ea] hover:bg-white/[0.14]"} cursor-pointer`}>{L.planos.cta}</button>
              </div>
            ))}
            {plans.length === 0 && <p className="text-[#9b95ad] text-sm">…</p>}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">{L.faq.title}</h2>
          <div className="max-w-3xl space-y-3">
            {L.faq.items.map((f, i) => (
              <div key={i} className="bg-[#1a1527] border border-white/[0.08] rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-4 text-left cursor-pointer">
                  <span className="font-medium text-sm sm:text-base">{f[0]}</span>
                  <span className="text-[#9b95ad] text-lg shrink-0">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <p className="px-4 pb-4 text-sm text-[#9b95ad] leading-relaxed">{f[1]}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Lead magnet */}
        <section className="py-12 border-t border-white/[0.06]">
          <LeadMagnet t={L.lead} />
        </section>

        {/* CTA final */}
        <section className="py-14 sm:py-20 border-t border-white/[0.06]">
          <div className="rounded-2xl p-8 sm:p-12 text-center bg-gradient-to-br from-purple-600/20 to-cyan-500/15 border border-purple-500/30">
            <h2 className="text-2xl sm:text-4xl font-bold">{L.ctaFinal.title}</h2>
            <p className="text-[#c9c5d6] mt-3 max-w-xl mx-auto">{L.ctaFinal.sub}</p>
            <div className="mt-7 flex justify-center">{cta(L.ctaFinal.btn)}</div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9b95ad] text-center sm:text-left">
          <span className="flex items-center gap-2"><Logo size={22} /> © {new Date().getFullYear()} — {L.footer.tagline}</span>
          <div className="flex flex-wrap justify-center gap-5 items-center">
            <Link href="/termos" className="hover:text-white transition">{L.footer.terms}</Link>
            <Link href="/privacidade" className="hover:text-white transition">{L.footer.privacy}</Link>
            <Link href="/contrato" className="hover:text-white transition">{L.footer.contract}</Link>
            <button onClick={() => setInterest(true)} className="hover:text-white transition cursor-pointer">{L.footer.contact}</button>
            <Link href="/login" className="hover:text-white transition">{L.footer.login}</Link>
            <LangSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}
