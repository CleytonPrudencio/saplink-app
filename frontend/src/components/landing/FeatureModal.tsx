"use client";

import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/i18n/I18n";

const brl = (c: number) => (c).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// ---------- Dicionário de rótulos estáticos da UI (por idioma) ----------

interface UIStrings {
  howItWorks: string;
  interactiveSim: string;
  realResults: string;
  howToImplement: string;
  ctaQuestion: string;
  ctaButton: string;
  // SimRisk
  riskIntegrations: string;
  riskCostPerHour: string;
  riskHoursToDetect: string;
  riskMoneyStopped: string;
  riskMitigated: string;
  // SimBench
  benchUptime: string;
  benchTop: string;
  benchAverage: string;
  benchBelow: string;
  benchPercentile: (pct: number) => string;
  // SimLiveOps KPIs / status / buttons
  kpiDetected: string;
  kpiResolved: string;
  kpiTime: string;
  kpiImpact: string;
  statusProcessing: string;
  statusPending: string;
  btnProcessing: (p: number) => string;
  btnRunAgain: string;
  doneSummary: (auto: string, time: string) => string;
  // SimTrend
  trendReplaying: string;
  btnAnalyzing: string;
  btnReplay: string;
  trendThreshold: (n: number) => string;
  // SimScore
  scorePrompt: string;
  scoreItems: [string, string, string, string];
  scoreLabel: string;
  // SimChat
  chatPlaceholder: string;
  chatQA: [string, string][];
}

const UI: Record<Lang, UIStrings> = {
  pt: {
    howItWorks: "Como funciona",
    interactiveSim: "🎮 Simulador interativo",
    realResults: "Resultados reais",
    howToImplement: "Como implementar na sua empresa",
    ctaQuestion: "Quer ver isso rodando no SAP do seu cliente?",
    ctaButton: "Tenho interesse →",
    riskIntegrations: "Integrações paradas",
    riskCostPerHour: "Custo de parada por hora",
    riskHoursToDetect: "Horas até detectar/resolver",
    riskMoneyStopped: "Dinheiro parado neste incidente",
    riskMitigated: "Com o SAPLINK detectando em minutos, o impacto cai para",
    benchUptime: "Uptime médio da sua carteira",
    benchTop: "Top do mercado",
    benchAverage: "Na média",
    benchBelow: "Abaixo do mercado",
    benchPercentile: (pct) => `Sua carteira está no percentil ${pct} do mercado SAP (dado anonimizado da rede).`,
    kpiDetected: "Detectados",
    kpiResolved: "Resolvidos",
    kpiTime: "Tempo",
    kpiImpact: "Impacto",
    statusProcessing: "processando…",
    statusPending: "pendente",
    btnProcessing: (p) => `Processando… ${p}%`,
    btnRunAgain: "▶ Rodar de novo",
    doneSummary: (auto, time) => `${auto} automático · ${time}`,
    trendReplaying: "Reproduzindo a evolução…",
    btnAnalyzing: "Analisando tendência…",
    btnReplay: "▶ Reproduzir do início",
    trendThreshold: (n) => `limite (${n})`,
    scorePrompt: "Marque os problemas presentes no cliente e veja o Clean Core Score:",
    scoreItems: [
      "API OData v2 depreciada em uso",
      "CDS custom não-liberada",
      "Modificação no core (não cloud-ready)",
      "6 custom fields concentrados",
    ],
    scoreLabel: "Clean Core Score",
    chatPlaceholder: "Clique numa pergunta abaixo para ver o copiloto responder.",
    chatQA: [
      ["Quais clientes têm erro agora?", "2 clientes: Agro Nordeste (IFlow SalesOrder FAILED) e Metalúrgica (3 IDocs 51). Sugiro começar pelo Agro — impacto em faturamento."],
      ["Resumo da minha carteira", "8 clientes · health médio 86 · 2 integrações em atenção. Tendência estável na semana."],
      ["Reprocessa os IDocs do cliente Agro", "📝 Criei 7 pedidos de correção para Agro Nordeste. Aprove no painel para o agente executar (BD87)."],
    ],
  },
  en: {
    howItWorks: "How it works",
    interactiveSim: "🎮 Interactive simulator",
    realResults: "Real results",
    howToImplement: "How to deploy it in your company",
    ctaQuestion: "Want to see this running on your client's SAP?",
    ctaButton: "I'm interested →",
    riskIntegrations: "Stalled integrations",
    riskCostPerHour: "Downtime cost per hour",
    riskHoursToDetect: "Hours to detect/resolve",
    riskMoneyStopped: "Money frozen in this incident",
    riskMitigated: "With SAPLINK detecting in minutes, the impact drops to",
    benchUptime: "Average uptime of your portfolio",
    benchTop: "Market leader",
    benchAverage: "On average",
    benchBelow: "Below market",
    benchPercentile: (pct) => `Your portfolio is in the ${pct}th percentile of the SAP market (anonymized network data).`,
    kpiDetected: "Detected",
    kpiResolved: "Resolved",
    kpiTime: "Time",
    kpiImpact: "Impact",
    statusProcessing: "processing…",
    statusPending: "pending",
    btnProcessing: (p) => `Processing… ${p}%`,
    btnRunAgain: "▶ Run again",
    doneSummary: (auto, time) => `${auto} automatic · ${time}`,
    trendReplaying: "Replaying the evolution…",
    btnAnalyzing: "Analyzing trend…",
    btnReplay: "▶ Replay from the start",
    trendThreshold: (n) => `threshold (${n})`,
    scorePrompt: "Check the issues present at the client and see the Clean Core Score:",
    scoreItems: [
      "Deprecated OData v2 API in use",
      "Non-released custom CDS",
      "Core modification (not cloud-ready)",
      "6 concentrated custom fields",
    ],
    scoreLabel: "Clean Core Score",
    chatPlaceholder: "Click a question below to see the copilot answer.",
    chatQA: [
      ["Which clients have errors right now?", "2 clients: Agro Nordeste (IFlow SalesOrder FAILED) and Metalúrgica (3 IDocs 51). I suggest starting with Agro — billing impact."],
      ["Summary of my portfolio", "8 clients · average health 86 · 2 integrations needing attention. Stable trend over the week."],
      ["Reprocess the Agro client's IDocs", "📝 I created 7 correction requests for Agro Nordeste. Approve them in the panel for the agent to run (BD87)."],
    ],
  },
  es: {
    howItWorks: "Cómo funciona",
    interactiveSim: "🎮 Simulador interactivo",
    realResults: "Resultados reales",
    howToImplement: "Cómo implementarlo en tu empresa",
    ctaQuestion: "¿Quieres ver esto funcionando en el SAP de tu cliente?",
    ctaButton: "Me interesa →",
    riskIntegrations: "Integraciones detenidas",
    riskCostPerHour: "Costo de parada por hora",
    riskHoursToDetect: "Horas hasta detectar/resolver",
    riskMoneyStopped: "Dinero detenido en este incidente",
    riskMitigated: "Con SAPLINK detectando en minutos, el impacto baja a",
    benchUptime: "Uptime promedio de tu cartera",
    benchTop: "Líder del mercado",
    benchAverage: "En el promedio",
    benchBelow: "Por debajo del mercado",
    benchPercentile: (pct) => `Tu cartera está en el percentil ${pct} del mercado SAP (dato anonimizado de la red).`,
    kpiDetected: "Detectados",
    kpiResolved: "Resueltos",
    kpiTime: "Tiempo",
    kpiImpact: "Impacto",
    statusProcessing: "procesando…",
    statusPending: "pendiente",
    btnProcessing: (p) => `Procesando… ${p}%`,
    btnRunAgain: "▶ Ejecutar de nuevo",
    doneSummary: (auto, time) => `${auto} automático · ${time}`,
    trendReplaying: "Reproduciendo la evolución…",
    btnAnalyzing: "Analizando tendencia…",
    btnReplay: "▶ Reproducir desde el inicio",
    trendThreshold: (n) => `límite (${n})`,
    scorePrompt: "Marca los problemas presentes en el cliente y observa el Clean Core Score:",
    scoreItems: [
      "API OData v2 obsoleta en uso",
      "CDS custom no liberada",
      "Modificación en el core (no cloud-ready)",
      "6 custom fields concentrados",
    ],
    scoreLabel: "Clean Core Score",
    chatPlaceholder: "Haz clic en una pregunta abajo para ver responder al copiloto.",
    chatQA: [
      ["¿Qué clientes tienen errores ahora?", "2 clientes: Agro Nordeste (IFlow SalesOrder FAILED) y Metalúrgica (3 IDocs 51). Sugiero empezar por Agro — impacto en la facturación."],
      ["Resumen de mi cartera", "8 clientes · health promedio 86 · 2 integraciones en atención. Tendencia estable en la semana."],
      ["Reprocesa los IDocs del cliente Agro", "📝 Creé 7 solicitudes de corrección para Agro Nordeste. Apruébalas en el panel para que el agente las ejecute (BD87)."],
    ],
  },
};

// ---------- Simuladores reutilizáveis ----------

function SimRisk({ accent, t }: { accent: string; t: UIStrings }) {
  const [ints, setInts] = useState(2);
  const [cost, setCost] = useState(8000);
  const [hours, setHours] = useState(4);
  const total = ints * cost * hours;
  return (
    <div className="space-y-4">
      <Slider label={t.riskIntegrations} value={ints} min={1} max={10} onChange={setInts} suffix="" />
      <Slider label={t.riskCostPerHour} value={cost} min={500} max={50000} step={500} onChange={setCost} suffix="/h" fmt={brl} />
      <Slider label={t.riskHoursToDetect} value={hours} min={1} max={24} onChange={setHours} suffix="h" />
      <div className="rounded-xl p-5 text-center" style={{ background: `${accent}14`, border: `1px solid ${accent}40` }}>
        <div className="text-xs text-[#9b95ad]">{t.riskMoneyStopped}</div>
        <div className="text-4xl font-extrabold mt-1" style={{ color: accent }}>{brl(total)}</div>
        <div className="text-xs text-[#9b95ad] mt-2">{t.riskMitigated} <b className="text-emerald-300">{brl(Math.round(total * 0.08))}</b>.</div>
      </div>
    </div>
  );
}

export interface Demo {
  metric: string;        // ex.: "IDocs em erro"
  action: string;        // ex.: "Reprocessar (BD87)"
  rows: [string, string, string][]; // ref, detalhe, statusFinal
  kpis: { detect: string; time: string; auto: string; impact: string };
  result: string;
}

function SimLiveOps({ accent, steps, demo, t }: { accent: string; steps: string[]; demo: Demo; t: UIStrings }) {
  const [p, setP] = useState(0); // 0..100
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (p >= 100) { setRunning(false); return; }
    const tm = setTimeout(() => setP((x) => Math.min(100, x + 4)), 80);
    return () => clearTimeout(tm);
  }, [running, p]);
  const start = () => { setP(0); setRunning(true); };
  const rows = demo.rows;
  const resolved = Math.round((p / 100) * rows.length);
  const stepIdx = p === 0 ? -1 : Math.min(steps.length - 1, Math.floor((p / 100) * steps.length));
  const done = p >= 100;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { l: t.kpiDetected, v: String(rows.length), live: true },
          { l: t.kpiResolved, v: `${resolved}/${rows.length}`, live: true },
          { l: t.kpiTime, v: done ? demo.kpis.time : "…", hl: true },
          { l: t.kpiImpact, v: done ? demo.kpis.impact : "…", hl: true },
        ].map((k) => (
          <div key={k.l} className="bg-[#0f0b1a] rounded-lg p-2.5 text-center border border-white/[0.06]">
            <div className="text-base font-bold" style={{ color: k.hl && done ? "#34d399" : accent }}>{k.v}</div>
            <div className="text-[10px] text-[#9b95ad] mt-0.5">{k.l}</div>
          </div>
        ))}
      </div>

      {/* Tabela de registros (dados fictícios) */}
      <div className="rounded-lg border border-white/[0.08] overflow-hidden">
        <div className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#9b95ad] bg-white/[0.03] border-b border-white/[0.06]">{demo.metric}</div>
        <div className="divide-y divide-white/[0.04]">
          {rows.map((r, i) => {
            const ok = i < resolved;
            const proc = running && i === resolved;
            return (
              <div key={i} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span className="font-mono text-xs text-[#c9c5d6] w-24 shrink-0 truncate">{r[0]}</span>
                <span className="text-xs text-[#9b95ad] flex-1 min-w-0 truncate">{r[1]}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded shrink-0 ${ok ? "bg-emerald-500/15 text-emerald-300" : proc ? "bg-amber-500/15 text-amber-300" : "bg-rose-500/15 text-rose-300"}`}>
                  {ok ? `✓ ${r[2]}` : proc ? t.statusProcessing : t.statusPending}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progresso + pipeline */}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden"><div className="h-full transition-all" style={{ width: `${p}%`, background: accent }} /></div>
      <div className="flex flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <span key={i} className={`text-[11px] px-2 py-1 rounded-full transition-all ${i <= stepIdx ? "text-white" : "text-[#6b6580]"}`} style={{ background: i <= stepIdx ? `${accent}25` : "rgba(255,255,255,0.04)" }}>{i + 1}. {s}</span>
        ))}
      </div>

      {done && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#34d39914", border: "1px solid #34d39940" }}>
          <span className="text-emerald-300 font-semibold">✓ {demo.result}</span>
          <div className="text-xs text-[#9b95ad] mt-1">{t.doneSummary(demo.kpis.auto, demo.kpis.time)}</div>
        </div>
      )}

      <button onClick={start} disabled={running} className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 cursor-pointer" style={{ background: accent }}>
        {running ? t.btnProcessing(p) : done ? t.btnRunAgain : `▶ ${demo.action}`}
      </button>
    </div>
  );
}

export interface Trend { label: string; points: number[]; threshold: number; mode: "rise" | "drop"; verdict: string }

function SimTrend({ trend, accent, t }: { trend: Trend; accent: string; t: UIStrings }) {
  const [n, setN] = useState(trend.points.length); // já abre desenhado
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (n >= trend.points.length) { setRunning(false); return; }
    const tm = setTimeout(() => setN((x) => x + 1), 300);
    return () => clearTimeout(tm);
  }, [running, n, trend.points.length]);
  const start = () => { setN(0); setRunning(true); };
  const W = 320, H = 130, PAD = 8;
  const max = Math.max(...trend.points, trend.threshold) * 1.15;
  const pts = trend.points.slice(0, Math.max(1, n));
  const x = (i: number) => PAD + (i / (trend.points.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const line = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = pts.length > 1 ? `${line} L${x(pts.length - 1).toFixed(1)},${H - PAD} L${x(0).toFixed(1)},${H - PAD} Z` : "";
  const last = pts[pts.length - 1] ?? 0;
  const breached = trend.mode === "rise" ? last >= trend.threshold : last <= trend.threshold;
  const done = n >= trend.points.length;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#9b95ad]">{trend.label}</p>
        <span className="text-lg font-bold" style={{ color: breached ? "#f87171" : accent }}>{last}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-[#0f0b1a] rounded-lg border border-white/[0.06]">
        <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={accent} stopOpacity="0.35" /><stop offset="1" stopColor={accent} stopOpacity="0" /></linearGradient></defs>
        <line x1="0" y1={y(trend.threshold)} x2={W} y2={y(trend.threshold)} stroke="#f87171" strokeDasharray="4 4" strokeWidth="1" />
        <text x={W - 4} y={y(trend.threshold) - 4} fill="#f87171" fontSize="9" textAnchor="end">{t.trendThreshold(trend.threshold)}</text>
        {area && <path d={area} fill="url(#tg)" />}
        {line && <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
        {pts.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === pts.length - 1 ? 4 : 2.5} fill={i === pts.length - 1 && breached ? "#f87171" : accent} />)}
      </svg>
      <div className="rounded-lg px-4 py-3 text-sm" style={{ background: breached ? "#f8717114" : "#34d39914", border: `1px solid ${breached ? "#f8717140" : "#34d39940"}` }}>
        <span className={breached ? "text-rose-300 font-semibold" : "text-emerald-300 font-semibold"}>{done ? trend.verdict : t.trendReplaying}</span>
      </div>
      <button onClick={start} disabled={running} className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 cursor-pointer" style={{ background: accent }}>
        {running ? t.btnAnalyzing : t.btnReplay}
      </button>
    </div>
  );
}

function SimScore({ t }: { t: UIStrings }) {
  const items = [
    { l: t.scoreItems[0], p: 12 },
    { l: t.scoreItems[1], p: 8 },
    { l: t.scoreItems[2], p: 15 },
    { l: t.scoreItems[3], p: 6 },
  ];
  const [on, setOn] = useState<boolean[]>([true, true, false, false]);
  const deduct = items.reduce((s, it, i) => s + (on[i] ? it.p : 0), 0);
  const score = Math.max(0, 100 - deduct);
  const color = score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#9b95ad]">{t.scorePrompt}</p>
      {items.map((it, i) => (
        <label key={i} className="flex items-center justify-between gap-2 bg-[#0f0b1a] rounded-lg px-3 py-2 text-sm cursor-pointer">
          <span className="flex items-center gap-2"><input type="checkbox" checked={on[i]} onChange={() => setOn((o) => o.map((v, j) => j === i ? !v : v))} className="accent-rose-500" /><span className="text-[#e2e0ea]">{it.l}</span></span>
          <span className="text-xs text-rose-300">-{it.p}</span>
        </label>
      ))}
      <div className="rounded-xl p-5 text-center" style={{ background: `${color}14`, border: `1px solid ${color}40` }}>
        <div className="text-xs text-[#9b95ad]">{t.scoreLabel}</div>
        <div className="text-5xl font-extrabold mt-1" style={{ color }}>{score}</div>
        <div className="h-2 bg-white/[0.06] rounded-full mt-3 overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} /></div>
      </div>
    </div>
  );
}

function SimBench({ t }: { t: UIStrings }) {
  const [up, setUp] = useState(99.2);
  const pct = Math.max(1, Math.min(99, Math.round((up - 97) / (99.99 - 97) * 100)));
  const verdict: [string, string] = pct >= 75 ? [t.benchTop, "#34d399"] : pct >= 40 ? [t.benchAverage, "#fbbf24"] : [t.benchBelow, "#f87171"];
  return (
    <div className="space-y-4">
      <Slider label={t.benchUptime} value={up} min={97} max={99.99} step={0.01} onChange={setUp} suffix="%" />
      <div className="relative h-12 rounded-lg bg-gradient-to-r from-rose-500/30 via-amber-400/30 to-emerald-500/40 border border-white/[0.08]">
        <div className="absolute top-0 bottom-0 w-1 bg-white rounded" style={{ left: `${pct}%` }} />
        <div className="absolute -bottom-6 text-xs font-bold text-white" style={{ left: `calc(${pct}% - 20px)` }}>P{pct}</div>
      </div>
      <div className="text-center pt-5">
        <span className="text-lg font-bold" style={{ color: verdict[1] }}>{verdict[0]}</span>
        <p className="text-xs text-[#9b95ad] mt-1">{t.benchPercentile(pct)}</p>
      </div>
    </div>
  );
}

function SimChat({ t }: { t: UIStrings }) {
  const qa = t.chatQA;
  const [msgs, setMsgs] = useState<{ r: "u" | "a"; t: string }[]>([]);
  function ask(i: number) { setMsgs((m) => [...m, { r: "u", t: qa[i][0] }, { r: "a", t: qa[i][1] }]); }
  return (
    <div className="space-y-3">
      <div className="bg-[#0f0b1a] rounded-xl p-3 min-h-[140px] space-y-2 border border-white/[0.06]">
        {msgs.length === 0 && <p className="text-xs text-[#6b6580]">{t.chatPlaceholder}</p>}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.r === "u" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.r === "u" ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-[#1a1527] border border-white/[0.08] text-[#e2e0ea]"}`}>{m.t}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">{qa.map((q, i) => <button key={i} onClick={() => ask(i)} className="text-[11px] px-2 py-1 rounded-full bg-white/[0.06] text-[#9b95ad] hover:text-white cursor-pointer">{q[0]}</button>)}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, onChange, suffix = "", fmt }: { label: string; value: number; min: number; max: number; step?: number; onChange: (n: number) => void; suffix?: string; fmt?: (n: number) => string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1"><span className="text-[#c9c5d6]">{label}</span><span className="font-semibold text-[#e2e0ea]">{fmt ? fmt(value) : value}{suffix}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-purple-500" />
    </div>
  );
}

const DEFAULT_STEPS: Record<Lang, string[]> = {
  pt: ["SAP gera o erro", "SAPLINK detecta na hora", "Alerta + diagnóstico IA", "Correção aplicada", "Resolvido"],
  en: ["SAP raises the error", "SAPLINK detects instantly", "Alert + AI diagnosis", "Fix applied", "Resolved"],
  es: ["SAP genera el error", "SAPLINK detecta al instante", "Alerta + diagnóstico IA", "Corrección aplicada", "Resuelto"],
};
const DEFAULT_DEMO: Record<Lang, Demo> = {
  pt: {
    metric: "Itens em atenção", action: "Resolver itens",
    rows: [["#A-1042", "exemplo de item em erro", "ok"], ["#A-1043", "exemplo de item em erro", "ok"], ["#A-1044", "exemplo de item em erro", "ok"]],
    kpis: { detect: "3", time: "~2 min (vs 40 min manual)", auto: "100%", impact: "0 retrabalho" }, result: "3 itens resolvidos no fluxo simulado.",
  },
  en: {
    metric: "Items needing attention", action: "Resolve items",
    rows: [["#A-1042", "sample failing item", "ok"], ["#A-1043", "sample failing item", "ok"], ["#A-1044", "sample failing item", "ok"]],
    kpis: { detect: "3", time: "~2 min (vs 40 min manual)", auto: "100%", impact: "0 rework" }, result: "3 items resolved in the simulated flow.",
  },
  es: {
    metric: "Ítems en atención", action: "Resolver ítems",
    rows: [["#A-1042", "ejemplo de ítem en error", "ok"], ["#A-1043", "ejemplo de ítem en error", "ok"], ["#A-1044", "ejemplo de ítem en error", "ok"]],
    kpis: { detect: "3", time: "~2 min (vs 40 min manual)", auto: "100%", impact: "0 retrabajo" }, result: "3 ítems resueltos en el flujo simulado.",
  },
};
const DEFAULT_TREND: Record<Lang, Trend> = {
  pt: { label: "Métrica monitorada ao longo do tempo", points: [10, 12, 14, 18, 25, 38, 60], threshold: 50, mode: "rise", verdict: "Tendência de alta — o SAPLINK avisaria antes de estourar." },
  en: { label: "Metric monitored over time", points: [10, 12, 14, 18, 25, 38, 60], threshold: 50, mode: "rise", verdict: "Upward trend — SAPLINK would warn before it breaks." },
  es: { label: "Métrica monitoreada a lo largo del tiempo", points: [10, 12, 14, 18, 25, 38, 60], threshold: 50, mode: "rise", verdict: "Tendencia al alza — SAPLINK avisaría antes de que reviente." },
};

function renderSim(d: FeatureDetail, accent: string, key: string, lang: Lang) {
  const t = UI[lang];
  if (d.sim === "risk") return <SimRisk accent={accent} t={t} />;
  if (d.sim === "score") return <SimScore t={t} />;
  if (d.sim === "bench") return <SimBench t={t} />;
  if (d.sim === "chat") return <SimChat t={t} />;
  if (d.sim === "trend") return <SimTrend trend={d.trend || (TRENDS[key] || DEFAULT_TREND)[lang]} accent={accent} t={t} />;
  const steps = d.simSteps && d.simSteps.length ? d.simSteps : DEFAULT_STEPS[lang];
  const demo = d.demo || (DEMOS[key] || DEFAULT_DEMO)[lang];
  return <SimLiveOps accent={accent} steps={steps} demo={demo} t={t} />;
}

// ---------- Conteúdo por funcionalidade ----------

export interface FeatureDetail {
  intro: string;
  flow: [string, string][];
  cases: [string, string][];
  implement: string[];
  sim: "risk" | "fail" | "score" | "bench" | "chat" | "trend";
  simSteps?: string[];
  demo?: Demo;
  trend?: Trend;
}

export const FEATURES: Record<string, Record<Lang, FeatureDetail>> = {
  "Cockpit de IDoc & filas": {
    pt: {
      intro: "Um painel único com os IDocs em erro (BD87), filas qRFC/tRFC travadas (SMQ1/2) e dumps (ST22) de TODOS os clientes — sem logar em cada SAP.",
      flow: [["Agente lê o SAP", "Coletor on-premise lê status localmente"], ["Empurra por HTTPS", "Só tráfego de saída, sem abrir portas"], ["Painel multi-cliente", "Tudo numa tela, priorizado"], ["Ação 1-clique", "Reprocessa com aprovação"]],
      cases: [["−70% tempo", "de triagem matinal — uma tela em vez de 8 SAPs"], ["100% visível", "IDocs 51/64 e filas SYSFAIL num lugar só"]],
      implement: ["Suba o Agente Docker na rede do cliente (5 min)", "Cole o token gerado no SAPLINK", "Pronto: o snapshot começa a aparecer"],
      sim: "fail", simSteps: ["7 IDocs entram em erro 51", "SAPLINK mostra no cockpit", "Você clica em Reprocessar (BD87)", "Agente executa o RBDMANI2", "IDocs status 53 — resolvido"],
    },
    en: {
      intro: "A single dashboard with failing IDocs (BD87), stuck qRFC/tRFC queues (SMQ1/2) and dumps (ST22) from ALL clients — without logging into each SAP.",
      flow: [["Agent reads SAP", "On-premise collector reads status locally"], ["Pushes over HTTPS", "Outbound traffic only, no open ports"], ["Multi-client dashboard", "Everything on one screen, prioritized"], ["1-click action", "Reprocess with approval"]],
      cases: [["−70% time", "on morning triage — one screen instead of 8 SAPs"], ["100% visible", "IDocs 51/64 and SYSFAIL queues in one place"]],
      implement: ["Spin up the Docker Agent on the client's network (5 min)", "Paste the generated token into SAPLINK", "Done: the snapshot starts to appear"],
      sim: "fail", simSteps: ["7 IDocs go into error 51", "SAPLINK shows them in the cockpit", "You click Reprocess (BD87)", "Agent runs RBDMANI2", "IDocs status 53 — resolved"],
    },
    es: {
      intro: "Un panel único con los IDocs en error (BD87), colas qRFC/tRFC trabadas (SMQ1/2) y dumps (ST22) de TODOS los clientes — sin entrar a cada SAP.",
      flow: [["El agente lee SAP", "El colector on-premise lee el estado localmente"], ["Empuja por HTTPS", "Solo tráfico de salida, sin abrir puertos"], ["Panel multicliente", "Todo en una pantalla, priorizado"], ["Acción de 1 clic", "Reprocesa con aprobación"]],
      cases: [["−70% tiempo", "de triaje matutino — una pantalla en vez de 8 SAPs"], ["100% visible", "IDocs 51/64 y colas SYSFAIL en un solo lugar"]],
      implement: ["Levanta el Agente Docker en la red del cliente (5 min)", "Pega el token generado en SAPLINK", "Listo: el snapshot empieza a aparecer"],
      sim: "fail", simSteps: ["7 IDocs entran en error 51", "SAPLINK los muestra en el cockpit", "Haces clic en Reprocesar (BD87)", "El agente ejecuta RBDMANI2", "IDocs status 53 — resuelto"],
    },
  },
  "Remediação autônoma": {
    pt: {
      intro: "Correções comuns (reprocessar IDoc, destravar fila, reexecutar tRFC) com aprovação e trilha de auditoria — ou 100% automáticas no AMS Autônomo.",
      flow: [["Detecta o item", "IDoc/fila remediável"], ["Você aprova", "Ou auto-executa por política"], ["Agente executa", "BD87 / SMQ2 / SM58"], ["Reporta o antes/depois", "Com log completo"]],
      cases: [["L1 quase zero", "as correções rotineiras saem sem humano"], ["Auditável", "quem pediu, quem aprovou, resultado"]],
      implement: ["Agente instalado", "Defina as ações permitidas", "(Opcional) ligue o piloto automático com confiança mínima"],
      sim: "fail", simSteps: ["Fila qRFC trava (SYSFAIL)", "SAPLINK identifica como remediável", "Aprovação (ou auto)", "Agente destrava (SMQ2)", "Fila vazia — resolvido"],
    },
    en: {
      intro: "Common fixes (reprocess IDoc, unblock queue, re-run tRFC) with approval and audit trail — or 100% automatic with Autonomous AMS.",
      flow: [["Detects the item", "Remediable IDoc/queue"], ["You approve", "Or it auto-runs by policy"], ["Agent executes", "BD87 / SMQ2 / SM58"], ["Reports before/after", "With full log"]],
      cases: [["L1 near zero", "routine fixes happen without a human"], ["Auditable", "who requested, who approved, the result"]],
      implement: ["Agent installed", "Define the allowed actions", "(Optional) enable autopilot with a minimum confidence"],
      sim: "fail", simSteps: ["qRFC queue blocks (SYSFAIL)", "SAPLINK flags it as remediable", "Approval (or auto)", "Agent unblocks it (SMQ2)", "Empty queue — resolved"],
    },
    es: {
      intro: "Correcciones comunes (reprocesar IDoc, destrabar cola, reejecutar tRFC) con aprobación y traza de auditoría — o 100% automáticas en el AMS Autónomo.",
      flow: [["Detecta el ítem", "IDoc/cola remediable"], ["Tú apruebas", "O se auto-ejecuta por política"], ["El agente ejecuta", "BD87 / SMQ2 / SM58"], ["Reporta el antes/después", "Con log completo"]],
      cases: [["L1 casi cero", "las correcciones rutinarias salen sin humano"], ["Auditable", "quién pidió, quién aprobó, resultado"]],
      implement: ["Agente instalado", "Define las acciones permitidas", "(Opcional) activa el piloto automático con confianza mínima"],
      sim: "fail", simSteps: ["La cola qRFC se traba (SYSFAIL)", "SAPLINK la identifica como remediable", "Aprobación (o auto)", "El agente la destraba (SMQ2)", "Cola vacía — resuelto"],
    },
  },
  "Catálogo de interfaces": {
    pt: {
      intro: "Inventário vivo de parceiros (WE20), destinos RFC (SM59), message types e serviços OData — descoberto e atualizado sozinho.",
      flow: [["Descoberta automática", "O agente varre o landscape"], ["Catálogo sempre atual", "Sem planilha manual"], ["Base de impacto", "Saiba o que conversa com o quê"]],
      cases: [["Onboarding em minutos", "mapa do cliente pronto no dia 1"], ["Doc que não envelhece", "atualiza a cada ciclo"]],
      implement: ["Agente instalado", "O catálogo se popula sozinho", "Use para análise de impacto"],
      sim: "fail", simSteps: ["Agente conecta no SAP", "Descobre 9 interfaces (WE20/SM59)", "Monta o catálogo", "Detecta nova interface amanhã", "Catálogo atualizado sozinho"],
    },
    en: {
      intro: "A live inventory of partners (WE20), RFC destinations (SM59), message types and OData services — discovered and updated on its own.",
      flow: [["Automatic discovery", "The agent scans the landscape"], ["Always-current catalog", "No manual spreadsheet"], ["Impact baseline", "Know what talks to what"]],
      cases: [["Onboarding in minutes", "the client's map ready on day 1"], ["Docs that never age", "updates every cycle"]],
      implement: ["Agent installed", "The catalog populates itself", "Use it for impact analysis"],
      sim: "fail", simSteps: ["Agent connects to SAP", "Discovers 9 interfaces (WE20/SM59)", "Builds the catalog", "Detects a new interface tomorrow", "Catalog updated on its own"],
    },
    es: {
      intro: "Inventario vivo de socios (WE20), destinos RFC (SM59), message types y servicios OData — descubierto y actualizado solo.",
      flow: [["Descubrimiento automático", "El agente recorre el landscape"], ["Catálogo siempre actual", "Sin planilla manual"], ["Base de impacto", "Sabe qué conversa con qué"]],
      cases: [["Onboarding en minutos", "mapa del cliente listo el día 1"], ["Doc que no envejece", "se actualiza en cada ciclo"]],
      implement: ["Agente instalado", "El catálogo se puebla solo", "Úsalo para análisis de impacto"],
      sim: "fail", simSteps: ["El agente conecta con SAP", "Descubre 9 interfaces (WE20/SM59)", "Arma el catálogo", "Detecta una nueva interfaz mañana", "Catálogo actualizado solo"],
    },
  },
  "Alertas em tempo real": {
    pt: {
      intro: "Detecção e resolução automática: o que quebra vira alerta priorizado por severidade, com dedup e auto-resolução quando recupera.",
      flow: [["Sinal de falha", "CPI/IDoc/probe"], ["Alerta priorizado", "Severidade + dedup"], ["Notifica", "On-call e ticket"], ["Auto-resolve", "quando recupera"]],
      cases: [["Nada no vácuo", "alerta cai no canal certo"], ["Fila limpa", "sem enxurrada de duplicados"]],
      implement: ["Conecte CPI/agente", "Configure canais", "Pronto: alertas começam a fluir"],
      sim: "fail", simSteps: ["IFlow falha no CPI", "Alerta HIGH criado", "Slack do plantão recebe", "IA sugere correção", "IFlow recupera — alerta resolve sozinho"],
    },
    en: {
      intro: "Automatic detection and resolution: whatever breaks becomes an alert prioritized by severity, with dedup and auto-resolution when it recovers.",
      flow: [["Failure signal", "CPI/IDoc/probe"], ["Prioritized alert", "Severity + dedup"], ["Notifies", "On-call and ticket"], ["Auto-resolves", "when it recovers"]],
      cases: [["Nothing falls through", "the alert lands in the right channel"], ["Clean queue", "no flood of duplicates"]],
      implement: ["Connect CPI/agent", "Configure channels", "Done: alerts start flowing"],
      sim: "fail", simSteps: ["IFlow fails in CPI", "HIGH alert created", "On-call Slack gets it", "AI suggests a fix", "IFlow recovers — alert resolves on its own"],
    },
    es: {
      intro: "Detección y resolución automática: lo que se rompe se vuelve alerta priorizada por severidad, con dedup y auto-resolución cuando se recupera.",
      flow: [["Señal de falla", "CPI/IDoc/probe"], ["Alerta priorizada", "Severidad + dedup"], ["Notifica", "On-call y ticket"], ["Auto-resuelve", "cuando se recupera"]],
      cases: [["Nada al vacío", "la alerta cae en el canal correcto"], ["Cola limpia", "sin avalancha de duplicados"]],
      implement: ["Conecta CPI/agente", "Configura canales", "Listo: las alertas empiezan a fluir"],
      sim: "fail", simSteps: ["IFlow falla en CPI", "Alerta HIGH creada", "El Slack de guardia la recibe", "La IA sugiere corrección", "IFlow se recupera — la alerta se resuelve sola"],
    },
  },
  "Copiloto da carteira": {
    pt: {
      intro: "Pergunte em português sobre todos os clientes e integrações. Resposta acionável citando nomes — não um chatbot solto.",
      flow: [["Você pergunta", "Linguagem natural"], ["IA lê a carteira", "Clientes, integrações, alertas"], ["Responde acionável", "Cita nomes e a ação"]],
      cases: [["Sem montar relatório", "visão da carteira na hora"], ["Onboarding instantâneo", "quem chega já 'pergunta'"]],
      implement: ["Já vem pronto", "Pergunte na tela 'Pergunte à IA'", "Configure a IA (Ollama/Claude) no ambiente"],
      sim: "chat",
    },
    en: {
      intro: "Ask in plain language about all your clients and integrations. Actionable answers citing names — not a loose chatbot.",
      flow: [["You ask", "Natural language"], ["AI reads the portfolio", "Clients, integrations, alerts"], ["Answers actionably", "Cites names and the action"]],
      cases: [["No report to build", "a portfolio view on the spot"], ["Instant onboarding", "newcomers just 'ask'"]],
      implement: ["Comes ready out of the box", "Ask on the 'Ask the AI' screen", "Configure the AI (Ollama/Claude) in your environment"],
      sim: "chat",
    },
    es: {
      intro: "Pregunta en lenguaje natural sobre todos los clientes e integraciones. Respuesta accionable citando nombres — no un chatbot suelto.",
      flow: [["Tú preguntas", "Lenguaje natural"], ["La IA lee la cartera", "Clientes, integraciones, alertas"], ["Responde accionable", "Cita nombres y la acción"]],
      cases: [["Sin armar informe", "visión de la cartera al instante"], ["Onboarding instantáneo", "quien llega ya 'pregunta'"]],
      implement: ["Ya viene listo", "Pregunta en la pantalla 'Pregúntale a la IA'", "Configura la IA (Ollama/Claude) en el ambiente"],
      sim: "chat",
    },
  },
  "Diagnóstico + SAP Notes": {
    pt: {
      intro: "A IA lê o erro real e devolve causa raiz, passos de correção (com transação SAP) e a SAP Note provável. Sai como relatório e PDF.",
      flow: [["Pega o erro real", "MPL/IDoc"], ["IA analisa", "Causa + contexto + histórico"], ["Entrega o plano", "Passos + transação + Nota"], ["PDF pronto", "Anexa no chamado"]],
      cases: [["Diagnóstico em segundos", "padronizado e completo"], ["Júnior produz como sênior", "a IA guia"]],
      implement: ["Conecte a fonte (CPI/agente)", "Clique 'Diagnosticar com IA'", "Configure a IA no ambiente"],
      sim: "fail", simSteps: ["Erro: Sold-to party não encontrado", "IA lê a mensagem", "Causa raiz: BP inexistente", "Passos: criar BP (XD01) + checar IFlow", "Relatório + PDF gerado"],
    },
    en: {
      intro: "The AI reads the real error and returns root cause, fix steps (with the SAP transaction) and the likely SAP Note. It comes out as a report and PDF.",
      flow: [["Takes the real error", "MPL/IDoc"], ["AI analyzes", "Cause + context + history"], ["Delivers the plan", "Steps + transaction + Note"], ["PDF ready", "Attach it to the ticket"]],
      cases: [["Diagnosis in seconds", "standardized and complete"], ["A junior performs like a senior", "the AI guides them"]],
      implement: ["Connect the source (CPI/agent)", "Click 'Diagnose with AI'", "Configure the AI in your environment"],
      sim: "fail", simSteps: ["Error: Sold-to party not found", "AI reads the message", "Root cause: missing BP", "Steps: create BP (XD01) + check IFlow", "Report + PDF generated"],
    },
    es: {
      intro: "La IA lee el error real y devuelve causa raíz, pasos de corrección (con transacción SAP) y la SAP Note probable. Sale como informe y PDF.",
      flow: [["Toma el error real", "MPL/IDoc"], ["La IA analiza", "Causa + contexto + historial"], ["Entrega el plan", "Pasos + transacción + Nota"], ["PDF listo", "Adjúntalo al ticket"]],
      cases: [["Diagnóstico en segundos", "estandarizado y completo"], ["Un júnior produce como sénior", "la IA lo guía"]],
      implement: ["Conecta la fuente (CPI/agente)", "Haz clic en 'Diagnosticar con IA'", "Configura la IA en el ambiente"],
      sim: "fail", simSteps: ["Error: Sold-to party no encontrado", "La IA lee el mensaje", "Causa raíz: BP inexistente", "Pasos: crear BP (XD01) + revisar IFlow", "Informe + PDF generado"],
    },
  },
  "Previsão de falha": {
    pt: {
      intro: "Analisa a tendência (latência, erro, profundidade de fila) e avisa antes do incidente virar parada.",
      flow: [["Coleta histórico", "Métricas no tempo"], ["Detecta tendência", "Anomalia subindo"], ["Avisa antes", "Janela em vez de incidente"]],
      cases: [["Fim do apaga-incêndio", "age na janela de manutenção"], ["Menos quebra de SLA", "antecipa o problema"]],
      implement: ["Conecte as integrações", "O histórico se acumula", "O radar passa a prever"],
      sim: "trend",
    },
    en: {
      intro: "It analyzes the trend (latency, errors, queue depth) and warns before the incident turns into an outage.",
      flow: [["Collects history", "Metrics over time"], ["Detects the trend", "An anomaly rising"], ["Warns ahead of time", "A window instead of an incident"]],
      cases: [["End of firefighting", "act during the maintenance window"], ["Fewer SLA breaches", "anticipate the problem"]],
      implement: ["Connect the integrations", "History builds up", "The radar starts to predict"],
      sim: "trend",
    },
    es: {
      intro: "Analiza la tendencia (latencia, error, profundidad de cola) y avisa antes de que el incidente se vuelva una parada.",
      flow: [["Recolecta historial", "Métricas en el tiempo"], ["Detecta la tendencia", "Anomalía subiendo"], ["Avisa antes", "Una ventana en vez de un incidente"]],
      cases: [["Fin del apaga-incendios", "actúa en la ventana de mantenimiento"], ["Menos incumplimiento de SLA", "anticipa el problema"]],
      implement: ["Conecta las integraciones", "El historial se acumula", "El radar empieza a predecir"],
      sim: "trend",
    },
  },
  "Digest semanal por IA": {
    pt: {
      intro: "Toda semana a IA escreve o resumo da saúde da carteira (panorama, atenção, recomendações) e envia por e-mail com a sua marca.",
      flow: [["IA analisa a semana", "Toda a carteira"], ["Escreve o resumo", "Tom executivo"], ["Envia white-label", "Com sua marca"]],
      cases: [["Prova de valor recorrente", "sem esforço"], ["Relacionamento ativo", "cliente vê o trabalho"]],
      implement: ["Configure o e-mail (Resend)", "Defina o dia do envio", "A IA cuida do resto"],
      sim: "chat",
    },
    en: {
      intro: "Every week the AI writes the portfolio health summary (overview, attention points, recommendations) and emails it under your brand.",
      flow: [["AI analyzes the week", "The whole portfolio"], ["Writes the summary", "Executive tone"], ["Sends it white-label", "Under your brand"]],
      cases: [["Recurring proof of value", "effortless"], ["Active relationship", "the client sees the work"]],
      implement: ["Configure email (Resend)", "Set the send day", "The AI handles the rest"],
      sim: "chat",
    },
    es: {
      intro: "Cada semana la IA escribe el resumen de salud de la cartera (panorama, atención, recomendaciones) y lo envía por e-mail con tu marca.",
      flow: [["La IA analiza la semana", "Toda la cartera"], ["Escribe el resumen", "Tono ejecutivo"], ["Lo envía white-label", "Con tu marca"]],
      cases: [["Prueba de valor recurrente", "sin esfuerzo"], ["Relación activa", "el cliente ve el trabajo"]],
      implement: ["Configura el e-mail (Resend)", "Define el día de envío", "La IA se encarga del resto"],
      sim: "chat",
    },
  },
  "SLA por cliente": {
    pt: {
      intro: "Metas de uptime/latência por cliente, compliance medido e relatório mensal narrado por IA — material de C-level.",
      flow: [["Define a meta", "Por cliente"], ["Mede o compliance", "Contínuo"], ["IA narra o relatório", "Resultado + quebras + ações"]],
      cases: [["Renova com dado", "não com opinião"], ["Relatório sem trabalho", "pronto pra reunião"]],
      implement: ["Defina metas por cliente", "Conecte as integrações", "Gere o relatório de SLA (PDF)"],
      sim: "risk",
    },
    en: {
      intro: "Uptime/latency targets per client, measured compliance and a monthly AI-narrated report — C-level material.",
      flow: [["Set the target", "Per client"], ["Measure compliance", "Continuously"], ["AI narrates the report", "Result + breaches + actions"]],
      cases: [["Renew with data", "not with opinion"], ["Report with no effort", "ready for the meeting"]],
      implement: ["Set targets per client", "Connect the integrations", "Generate the SLA report (PDF)"],
      sim: "risk",
    },
    es: {
      intro: "Metas de uptime/latencia por cliente, compliance medido e informe mensual narrado por IA — material de C-level.",
      flow: [["Define la meta", "Por cliente"], ["Mide el compliance", "Continuo"], ["La IA narra el informe", "Resultado + incumplimientos + acciones"]],
      cases: [["Renueva con datos", "no con opinión"], ["Informe sin trabajo", "listo para la reunión"]],
      implement: ["Define metas por cliente", "Conecta las integraciones", "Genera el informe de SLA (PDF)"],
      sim: "risk",
    },
  },
  "Impacto em R$": {
    pt: {
      intro: "Traduz cada falha em dinheiro parado agora — custo de parada por hora por integração + documentos fiscais bloqueados, por processo.",
      flow: [["Define custo/hora", "Por integração"], ["Soma o tempo parado", "Ao vivo"], ["Mostra R$ em risco", "Por processo de negócio"]],
      cases: [["Prioriza pelo caixa", "não pelo alerta barulhento"], ["Justifica o contrato", "valor em R$"]],
      implement: ["Defina custo/hora e processo", "O cálculo roda ao vivo", "Mostre ao diretor"],
      sim: "risk",
    },
    en: {
      intro: "Translates every failure into money frozen right now — downtime cost per hour per integration + blocked fiscal documents, by process.",
      flow: [["Set cost/hour", "Per integration"], ["Sum the downtime", "Live"], ["Show R$ at risk", "By business process"]],
      cases: [["Prioritize by cash", "not by the noisy alert"], ["Justify the contract", "value in R$"]],
      implement: ["Set cost/hour and process", "The calculation runs live", "Show it to the director"],
      sim: "risk",
    },
    es: {
      intro: "Traduce cada falla en dinero detenido ahora — costo de parada por hora por integración + documentos fiscales bloqueados, por proceso.",
      flow: [["Define costo/hora", "Por integración"], ["Suma el tiempo detenido", "En vivo"], ["Muestra R$ en riesgo", "Por proceso de negocio"]],
      cases: [["Prioriza por la caja", "no por la alerta ruidosa"], ["Justifica el contrato", "valor en R$"]],
      implement: ["Define costo/hora y proceso", "El cálculo corre en vivo", "Muéstralo al director"],
      sim: "risk",
    },
  },
  "Benchmark de mercado": {
    pt: {
      intro: "Compara a saúde da sua carteira com o mercado SAP (anonimizado). Munição comercial e de board.",
      flow: [["Coleta anônima", "Da rede de clientes"], ["Calcula percentil", "Por setor/métrica"], ["Mostra onde você está", "vs o mercado"]],
      cases: [["Argumento de board", "número, não achismo"], ["Mostra evolução", "subiu de percentil"]],
      implement: ["Já vem pronto", "Quanto mais clientes, mais preciso", "Use na conversa comercial"],
      sim: "bench",
    },
    en: {
      intro: "Compares your portfolio's health against the SAP market (anonymized). Commercial and boardroom ammunition.",
      flow: [["Anonymous collection", "From the client network"], ["Computes the percentile", "By sector/metric"], ["Shows where you stand", "vs the market"]],
      cases: [["Boardroom argument", "a number, not a hunch"], ["Shows progress", "moved up a percentile"]],
      implement: ["Comes ready out of the box", "The more clients, the more precise", "Use it in the sales conversation"],
      sim: "bench",
    },
    es: {
      intro: "Compara la salud de tu cartera con el mercado SAP (anonimizado). Munición comercial y de board.",
      flow: [["Recolección anónima", "De la red de clientes"], ["Calcula el percentil", "Por sector/métrica"], ["Muestra dónde estás", "vs el mercado"]],
      cases: [["Argumento de board", "número, no opinión"], ["Muestra evolución", "subió de percentil"]],
      implement: ["Ya viene listo", "Cuantos más clientes, más preciso", "Úsalo en la conversación comercial"],
      sim: "bench",
    },
  },
  "Portal do cliente": {
    pt: {
      intro: "Portal white-label read-only onde o cliente final vê a saúde das próprias integrações — transparência que fideliza.",
      flow: [["Você publica", "Com sua marca"], ["Cliente acessa", "Read-only, seguro"], ["Vê a saúde", "Sem te perguntar"]],
      cases: [["Menos 'e aí, como tá?'", "cliente se autoatende"], ["Sua marca na frente", "branding constante"]],
      implement: ["Ative o portal do cliente", "Personalize a marca", "Compartilhe o link"],
      sim: "chat",
    },
    en: {
      intro: "A read-only white-label portal where the end client sees the health of their own integrations — transparency that builds loyalty.",
      flow: [["You publish", "Under your brand"], ["Client accesses", "Read-only, secure"], ["Sees the health", "Without asking you"]],
      cases: [["Fewer 'hey, how's it going?'", "the client self-serves"], ["Your brand up front", "constant branding"]],
      implement: ["Enable the client portal", "Customize the branding", "Share the link"],
      sim: "chat",
    },
    es: {
      intro: "Portal white-label de solo lectura donde el cliente final ve la salud de sus propias integraciones — transparencia que fideliza.",
      flow: [["Tú publicas", "Con tu marca"], ["El cliente accede", "Solo lectura, seguro"], ["Ve la salud", "Sin preguntarte"]],
      cases: [["Menos '¿cómo va?'", "el cliente se autoatiende"], ["Tu marca al frente", "branding constante"]],
      implement: ["Activa el portal del cliente", "Personaliza la marca", "Comparte el enlace"],
      sim: "chat",
    },
  },
  "Radar de Upgrade": {
    pt: {
      intro: "Inventaria as APIs que você realmente usa e cruza com o que será depreciado/quebrado no próximo release do S/4HANA Cloud.",
      flow: [["Lê o uso real", "APIs OData consumidas"], ["Cruza com o release", "O que muda/depreca"], ["Mapeia ao seu uso", "Plano de migração"]],
      cases: [["Upgrade sem surpresa", "2×/ano sob controle"], ["Evita parada pós-upgrade", "sabe o que migrar"]],
      implement: ["Conecte o S/4HANA Cloud", "O radar inventaria o uso", "Gere o plano com IA"],
      sim: "score",
    },
    en: {
      intro: "Inventories the APIs you actually use and cross-checks them against what will be deprecated/broken in the next S/4HANA Cloud release.",
      flow: [["Reads real usage", "Consumed OData APIs"], ["Cross-checks the release", "What changes/deprecates"], ["Maps it to your usage", "Migration plan"]],
      cases: [["Upgrade with no surprises", "twice a year under control"], ["Avoids post-upgrade outages", "you know what to migrate"]],
      implement: ["Connect S/4HANA Cloud", "The radar inventories the usage", "Generate the plan with AI"],
      sim: "score",
    },
    es: {
      intro: "Inventaria las APIs que realmente usas y las cruza con lo que será obsoleto/roto en el próximo release de S/4HANA Cloud.",
      flow: [["Lee el uso real", "APIs OData consumidas"], ["Cruza con el release", "Qué cambia/se deprecia"], ["Lo mapea a tu uso", "Plan de migración"]],
      cases: [["Upgrade sin sorpresas", "2×/año bajo control"], ["Evita parada pos-upgrade", "sabes qué migrar"]],
      implement: ["Conecta S/4HANA Cloud", "El radar inventaria el uso", "Genera el plan con IA"],
      sim: "score",
    },
  },
  "Clean Core Score": {
    pt: {
      intro: "A métrica que a própria SAP cobra: o quão aderente ao padrão está o core, com pontuação e plano de remediação.",
      flow: [["Avalia o core", "APIs, CDS, modificações"], ["Calcula o score", "0 a 100"], ["Plano de remediação", "Priorizado"]],
      cases: [["Vira serviço recorrente", "governança contínua"], ["Prepara o upgrade", "core mais limpo"]],
      implement: ["Conecte o S/4HANA Cloud", "Veja o score", "Reduza as deduções de maior peso"],
      sim: "score",
    },
    en: {
      intro: "The metric SAP itself demands: how closely the core adheres to the standard, with a score and a remediation plan.",
      flow: [["Assesses the core", "APIs, CDS, modifications"], ["Computes the score", "0 to 100"], ["Remediation plan", "Prioritized"]],
      cases: [["Becomes a recurring service", "continuous governance"], ["Prepares the upgrade", "a cleaner core"]],
      implement: ["Connect S/4HANA Cloud", "See the score", "Reduce the heaviest deductions"],
      sim: "score",
    },
    es: {
      intro: "La métrica que la propia SAP exige: qué tan adherido al estándar está el core, con puntuación y plan de remediación.",
      flow: [["Evalúa el core", "APIs, CDS, modificaciones"], ["Calcula el score", "0 a 100"], ["Plan de remediación", "Priorizado"]],
      cases: [["Se vuelve servicio recurrente", "gobernanza continua"], ["Prepara el upgrade", "un core más limpio"]],
      implement: ["Conecta S/4HANA Cloud", "Mira el score", "Reduce las deducciones de mayor peso"],
      sim: "score",
    },
  },
  "Fiscal DRC (NF-e)": {
    pt: {
      intro: "Monitora documentos fiscais (NF-e/NFS-e/CT-e): rejeição SEFAZ, contingência e fila — com valor em R$ e reprocesso.",
      flow: [["Lê os documentos", "DRC/eDocument"], ["Sinaliza bloqueados", "Rejeição/contingência"], ["Reprocessa", "Pelo SAPLINK"]],
      cases: [["Faturamento não para", "vê o bloqueio na hora"], ["Mata o mercado BR", "diferencial fiscal"]],
      implement: ["Conecte o S/4HANA Cloud (DRC)", "Acompanhe o R$ em risco", "Reprocesse os bloqueados"],
      sim: "risk",
    },
    en: {
      intro: "Monitors fiscal documents (NF-e/NFS-e/CT-e): SEFAZ rejection, contingency and queue — with value in R$ and reprocessing.",
      flow: [["Reads the documents", "DRC/eDocument"], ["Flags the blocked ones", "Rejection/contingency"], ["Reprocesses", "Through SAPLINK"]],
      cases: [["Billing doesn't stop", "see the block instantly"], ["Owns the BR market", "a fiscal differentiator"]],
      implement: ["Connect S/4HANA Cloud (DRC)", "Track the R$ at risk", "Reprocess the blocked ones"],
      sim: "risk",
    },
    es: {
      intro: "Monitorea documentos fiscales (NF-e/NFS-e/CT-e): rechazo SEFAZ, contingencia y cola — con valor en R$ y reproceso.",
      flow: [["Lee los documentos", "DRC/eDocument"], ["Señala los bloqueados", "Rechazo/contingencia"], ["Reprocesa", "Desde SAPLINK"]],
      cases: [["La facturación no para", "ves el bloqueo al instante"], ["Domina el mercado BR", "diferencial fiscal"]],
      implement: ["Conecta S/4HANA Cloud (DRC)", "Sigue el R$ en riesgo", "Reprocesa los bloqueados"],
      sim: "risk",
    },
  },
  "Event Mesh + CPI/AIF": {
    pt: {
      intro: "Puxa os Message Processing Logs reais do CPI e os eventos do Event Mesh — falhas, dead-letter e lag — com erro detalhado e IA.",
      flow: [["Conecta no CPI/BTP", "OAuth, sem instalar"], ["Puxa MPL/eventos", "Reais"], ["Alerta + erro detalhado", "Com diagnóstico IA"]],
      cases: [["Vê o que a nuvem esconde", "MPL real"], ["Detecção ao vivo", "falha → alerta na hora"]],
      implement: ["Cole o service key do CPI", "Sincronize", "Falhas viram alerta + IA"],
      sim: "fail", simSteps: ["IFlow processa mensagem", "Falha no receiver (HTTP 500)", "SAPLINK puxa o MPL", "Erro detalhado capturado", "Alerta + diagnóstico IA"],
    },
    en: {
      intro: "Pulls the real Message Processing Logs from CPI and the Event Mesh events — failures, dead-letter and lag — with detailed errors and AI.",
      flow: [["Connects to CPI/BTP", "OAuth, no install"], ["Pulls MPL/events", "Real ones"], ["Alert + detailed error", "With AI diagnosis"]],
      cases: [["Sees what the cloud hides", "the real MPL"], ["Live detection", "failure → alert instantly"]],
      implement: ["Paste the CPI service key", "Sync", "Failures become alert + AI"],
      sim: "fail", simSteps: ["IFlow processes a message", "Receiver fails (HTTP 500)", "SAPLINK pulls the MPL", "Detailed error captured", "Alert + AI diagnosis"],
    },
    es: {
      intro: "Trae los Message Processing Logs reales del CPI y los eventos del Event Mesh — fallas, dead-letter y lag — con error detallado e IA.",
      flow: [["Conecta con CPI/BTP", "OAuth, sin instalar"], ["Trae MPL/eventos", "Reales"], ["Alerta + error detallado", "Con diagnóstico IA"]],
      cases: [["Ve lo que la nube esconde", "el MPL real"], ["Detección en vivo", "falla → alerta al instante"]],
      implement: ["Pega el service key del CPI", "Sincroniza", "Las fallas se vuelven alerta + IA"],
      sim: "fail", simSteps: ["IFlow procesa un mensaje", "Falla en el receiver (HTTP 500)", "SAPLINK trae el MPL", "Error detallado capturado", "Alerta + diagnóstico IA"],
    },
  },
  "On-call multicanal": {
    pt: {
      intro: "Alertas viram notificação no canal certo (Slack/Teams/Webhook/e-mail), com severidade e escalonamento automático.",
      flow: [["Alerta dispara", "Por severidade"], ["Notifica o canal", "Slack/Teams/e-mail"], ["Escala se ninguém responde", "Para o líder"]],
      cases: [["Nada cai no vácuo", "plantão organizado"], ["MTTR menor", "resposta mais rápida"]],
      implement: ["Adicione os canais", "Defina severidade mínima", "Configure o tempo de escalonamento"],
      sim: "fail", simSteps: ["Falha CRITICAL", "Slack do plantão recebe", "Sem resposta em 30 min", "Escala para o líder", "Incidente atendido"],
    },
    en: {
      intro: "Alerts turn into notifications on the right channel (Slack/Teams/Webhook/email), with severity and automatic escalation.",
      flow: [["Alert fires", "By severity"], ["Notifies the channel", "Slack/Teams/email"], ["Escalates if no one responds", "To the lead"]],
      cases: [["Nothing falls through", "organized on-call"], ["Lower MTTR", "faster response"]],
      implement: ["Add the channels", "Set the minimum severity", "Configure the escalation time"],
      sim: "fail", simSteps: ["CRITICAL failure", "On-call Slack gets it", "No response in 30 min", "Escalates to the lead", "Incident handled"],
    },
    es: {
      intro: "Las alertas se vuelven notificación en el canal correcto (Slack/Teams/Webhook/e-mail), con severidad y escalamiento automático.",
      flow: [["La alerta dispara", "Por severidad"], ["Notifica el canal", "Slack/Teams/e-mail"], ["Escala si nadie responde", "Al líder"]],
      cases: [["Nada al vacío", "guardia organizada"], ["MTTR menor", "respuesta más rápida"]],
      implement: ["Agrega los canales", "Define la severidad mínima", "Configura el tiempo de escalamiento"],
      sim: "fail", simSteps: ["Falla CRITICAL", "El Slack de guardia la recibe", "Sin respuesta en 30 min", "Escala al líder", "Incidente atendido"],
    },
  },
  "Tickets Jira/ServiceNow": {
    pt: {
      intro: "O alerta abre o chamado automaticamente no seu ITSM e fecha sozinho quando a integração recupera.",
      flow: [["Alerta vira ticket", "Jira/ServiceNow"], ["Time trata", "No ITSM de sempre"], ["Fecha sozinho", "Quando recupera"]],
      cases: [["Zero retrabalho", "abre/fecha sozinho"], ["ITSM coerente", "métrica confiável"]],
      implement: ["Conecte Jira/ServiceNow", "Defina a severidade mínima", "Pronto: alertas viram chamados"],
      sim: "fail", simSteps: ["Falha detectada", "Abre INC-4521 no ServiceNow", "Time trata", "Integração recupera", "Ticket fecha sozinho"],
    },
    en: {
      intro: "The alert opens the ticket automatically in your ITSM and closes itself when the integration recovers.",
      flow: [["Alert becomes a ticket", "Jira/ServiceNow"], ["Team handles it", "In the usual ITSM"], ["Closes itself", "When it recovers"]],
      cases: [["Zero rework", "opens/closes itself"], ["Consistent ITSM", "reliable metrics"]],
      implement: ["Connect Jira/ServiceNow", "Set the minimum severity", "Done: alerts become tickets"],
      sim: "fail", simSteps: ["Failure detected", "Opens INC-4521 in ServiceNow", "Team handles it", "Integration recovers", "Ticket closes itself"],
    },
    es: {
      intro: "La alerta abre el ticket automáticamente en tu ITSM y se cierra sola cuando la integración se recupera.",
      flow: [["La alerta se vuelve ticket", "Jira/ServiceNow"], ["El equipo lo atiende", "En el ITSM de siempre"], ["Se cierra solo", "Cuando se recupera"]],
      cases: [["Cero retrabajo", "abre/cierra solo"], ["ITSM coherente", "métrica confiable"]],
      implement: ["Conecta Jira/ServiceNow", "Define la severidad mínima", "Listo: las alertas se vuelven tickets"],
      sim: "fail", simSteps: ["Falla detectada", "Abre INC-4521 en ServiceNow", "El equipo lo atiende", "La integración se recupera", "El ticket se cierra solo"],
    },
  },
  "Radar de validade": {
    pt: {
      intro: "Certificados TLS (detectados automaticamente), senhas e tokens com expiração — antes de virarem incidente.",
      flow: [["Detecta certificados", "Automático"], ["Acompanha expiração", "Senhas e tokens"], ["Avisa antes", "Com antecedência"]],
      cases: [["Evita a parada mais boba", "algo que expirou"], ["Planeja a renovação", "sem correria"]],
      implement: ["Conecte os endpoints", "Cadastre segredos com validade", "Acompanhe o radar"],
      sim: "fail", simSteps: ["Certificado vence em 7 dias", "Radar marca como CRITICAL", "Notifica o time", "Renovação agendada", "Incidente evitado"],
    },
    en: {
      intro: "TLS certificates (detected automatically), passwords and tokens with expiry — before they become an incident.",
      flow: [["Detects certificates", "Automatic"], ["Tracks expiry", "Passwords and tokens"], ["Warns ahead", "Well in advance"]],
      cases: [["Avoids the silliest outage", "something that expired"], ["Plans the renewal", "without rushing"]],
      implement: ["Connect the endpoints", "Register secrets with an expiry date", "Watch the radar"],
      sim: "fail", simSteps: ["Certificate expires in 7 days", "Radar flags it as CRITICAL", "Notifies the team", "Renewal scheduled", "Incident avoided"],
    },
    es: {
      intro: "Certificados TLS (detectados automáticamente), contraseñas y tokens con vencimiento — antes de que se vuelvan incidente.",
      flow: [["Detecta certificados", "Automático"], ["Sigue el vencimiento", "Contraseñas y tokens"], ["Avisa antes", "Con anticipación"]],
      cases: [["Evita la parada más tonta", "algo que venció"], ["Planea la renovación", "sin apuros"]],
      implement: ["Conecta los endpoints", "Registra secretos con vencimiento", "Sigue el radar"],
      sim: "fail", simSteps: ["El certificado vence en 7 días", "El radar lo marca como CRITICAL", "Notifica al equipo", "Renovación agendada", "Incidente evitado"],
    },
  },
  "Rede Federada de Falhas": {
    pt: {
      intro: "O \"Waze do SAP\": cada falha e a correção que funcionou viram conhecimento anônimo compartilhado entre todos os clientes. Quando algo quebra, você já tem a correção vencedora.",
      flow: [["Falha acontece", "Em qualquer cliente"], ["Vira assinatura anônima", "Sem expor identidade"], ["Correção é registrada", "Com taxa de sucesso"], ["A rede te responde", "\"resolvido Nx, fix vencedor X\""]],
      cases: [["Efeito de rede", "fica mais inteligente a cada cliente"], ["89% de acerto", "na correção vencedora típica"]],
      implement: ["Já vem ativo", "Cada falha alimenta a rede sozinha", "Use a correção sugerida"],
      sim: "fail", simSteps: ["Erro 'Sold-to party' no seu cliente", "SAPLINK normaliza a assinatura", "Consulta a rede: visto 37×", "Correção vencedora: criar BP (89%)", "Você aplica e resolve"],
    },
    en: {
      intro: "The \"Waze of SAP\": every failure and the fix that worked become anonymous knowledge shared across all clients. When something breaks, you already have the winning fix.",
      flow: [["A failure happens", "At any client"], ["Becomes an anonymous signature", "Without exposing identity"], ["The fix is recorded", "With its success rate"], ["The network answers you", "\"resolved Nx, winning fix X\""]],
      cases: [["Network effect", "gets smarter with every client"], ["89% hit rate", "on the typical winning fix"]],
      implement: ["Comes active out of the box", "Every failure feeds the network on its own", "Use the suggested fix"],
      sim: "fail", simSteps: ["'Sold-to party' error at your client", "SAPLINK normalizes the signature", "Queries the network: seen 37×", "Winning fix: create BP (89%)", "You apply it and resolve"],
    },
    es: {
      intro: "El \"Waze de SAP\": cada falla y la corrección que funcionó se vuelven conocimiento anónimo compartido entre todos los clientes. Cuando algo se rompe, ya tienes la corrección ganadora.",
      flow: [["Ocurre una falla", "En cualquier cliente"], ["Se vuelve firma anónima", "Sin exponer identidad"], ["La corrección queda registrada", "Con su tasa de éxito"], ["La red te responde", "\"resuelto Nx, fix ganador X\""]],
      cases: [["Efecto de red", "se vuelve más inteligente con cada cliente"], ["89% de acierto", "en la corrección ganadora típica"]],
      implement: ["Ya viene activo", "Cada falla alimenta la red sola", "Usa la corrección sugerida"],
      sim: "fail", simSteps: ["Error 'Sold-to party' en tu cliente", "SAPLINK normaliza la firma", "Consulta la red: visto 37×", "Corrección ganadora: crear BP (89%)", "Lo aplicas y resuelves"],
    },
  },
  "Causa raiz cross-camada": {
    pt: {
      intro: "Cruza os transports (STMS, on-premise) com as falhas de CPI/IDoc que vieram depois e aponta a mudança que provavelmente causou. Só o SAPLINK tem as duas camadas juntas.",
      flow: [["Lê transports", "On-premise"], ["Lê falhas de nuvem", "CPI/IDoc"], ["Correlaciona no tempo", "Janela após o import"], ["Aponta a causa", "Com % de confiança"]],
      cases: [["Causa em minutos", "não em horas"], ["Único no mercado", "ninguém junta as 2 camadas"]],
      implement: ["Agente + CPI conectados", "A correlação roda sozinha", "Veja em 'Causa cross-camada'"],
      sim: "fail", simSteps: ["Transport DEVK900231 → PRD", "2h depois: IFlow falha", "SAPLINK correlaciona", "Causa provável: 80%", "Reverte/corrige o transport"],
    },
    en: {
      intro: "Cross-references transports (STMS, on-premise) with the CPI/IDoc failures that followed and points to the change that likely caused them. Only SAPLINK has both layers together.",
      flow: [["Reads transports", "On-premise"], ["Reads cloud failures", "CPI/IDoc"], ["Correlates over time", "Window after the import"], ["Points to the cause", "With a confidence %"]],
      cases: [["Cause in minutes", "not in hours"], ["Unique on the market", "no one combines the 2 layers"]],
      implement: ["Agent + CPI connected", "The correlation runs on its own", "See it in 'Cross-layer cause'"],
      sim: "fail", simSteps: ["Transport DEVK900231 → PRD", "2h later: IFlow fails", "SAPLINK correlates", "Likely cause: 80%", "Revert/fix the transport"],
    },
    es: {
      intro: "Cruza los transports (STMS, on-premise) con las fallas de CPI/IDoc que vinieron después y señala el cambio que probablemente las causó. Solo SAPLINK tiene las dos capas juntas.",
      flow: [["Lee transports", "On-premise"], ["Lee fallas de nube", "CPI/IDoc"], ["Correlaciona en el tiempo", "Ventana tras el import"], ["Señala la causa", "Con % de confianza"]],
      cases: [["Causa en minutos", "no en horas"], ["Único en el mercado", "nadie junta las 2 capas"]],
      implement: ["Agente + CPI conectados", "La correlación corre sola", "Míralo en 'Causa cross-capa'"],
      sim: "fail", simSteps: ["Transport DEVK900231 → PRD", "2h después: IFlow falla", "SAPLINK correlaciona", "Causa probable: 80%", "Revierte/corrige el transport"],
    },
  },
  "AMS Autônomo": {
    pt: {
      intro: "Detecta → diagnostica → corrige → mede → aprende. Correções de alta confiança são aplicadas sozinhas, com rollback e rastro. A confiança vem da Rede Federada.",
      flow: [["Detecta o item", "Remediável"], ["Confiança da rede", "≥ limiar?"], ["Auto-executa", "Com guardrails"], ["Mede e aprende", "Placar de autonomia"]],
      cases: [["L1/L2 quase zero", "rotina sem humano"], ["% sem humano", "número vendável"]],
      implement: ["Agente instalado", "Ligue o piloto automático", "Defina confiança mínima e ações"],
      sim: "fail", simSteps: ["IDocs 51 à noite", "Confiança da rede: 94%", "Acima do limiar → auto", "Agente reprocessa (BD87)", "Resolvido sem humano"],
    },
    en: {
      intro: "Detect → diagnose → fix → measure → learn. High-confidence fixes are applied on their own, with rollback and a trail. The confidence comes from the Federated Network.",
      flow: [["Detects the item", "Remediable"], ["Network confidence", "≥ threshold?"], ["Auto-executes", "With guardrails"], ["Measures and learns", "Autonomy scoreboard"]],
      cases: [["L1/L2 near zero", "routine without a human"], ["% without a human", "a sellable number"]],
      implement: ["Agent installed", "Turn on autopilot", "Set the minimum confidence and actions"],
      sim: "fail", simSteps: ["IDocs 51 overnight", "Network confidence: 94%", "Above threshold → auto", "Agent reprocesses (BD87)", "Resolved without a human"],
    },
    es: {
      intro: "Detecta → diagnostica → corrige → mide → aprende. Las correcciones de alta confianza se aplican solas, con rollback y traza. La confianza viene de la Red Federada.",
      flow: [["Detecta el ítem", "Remediable"], ["Confianza de la red", "≥ umbral?"], ["Auto-ejecuta", "Con guardrails"], ["Mide y aprende", "Marcador de autonomía"]],
      cases: [["L1/L2 casi cero", "rutina sin humano"], ["% sin humano", "número vendible"]],
      implement: ["Agente instalado", "Activa el piloto automático", "Define la confianza mínima y las acciones"],
      sim: "fail", simSteps: ["IDocs 51 de madrugada", "Confianza de la red: 94%", "Por encima del umbral → auto", "El agente reprocesa (BD87)", "Resuelto sin humano"],
    },
  },
  "Dinheiro em risco (ao vivo)": {
    pt: {
      intro: "Traduz cada falha técnica em R$ parados agora — custo de parada por hora + documentos fiscais bloqueados, por processo de negócio.",
      flow: [["Custo/hora por integração", "Você define"], ["Soma tempo parado", "Ao vivo"], ["Agrupa por processo", "R$ em risco"]],
      cases: [["Linguagem de CFO", "muda a conversa de venda"], ["Prioriza pelo caixa", "não pelo alerta"]],
      implement: ["Defina custo/hora e processo", "Cálculo roda ao vivo", "Mostre ao diretor"],
      sim: "risk",
    },
    en: {
      intro: "Translates every technical failure into R$ frozen right now — downtime cost per hour + blocked fiscal documents, by business process.",
      flow: [["Cost/hour per integration", "You set it"], ["Sum the downtime", "Live"], ["Group by process", "R$ at risk"]],
      cases: [["CFO language", "changes the sales conversation"], ["Prioritize by cash", "not by the alert"]],
      implement: ["Set cost/hour and process", "The calculation runs live", "Show it to the director"],
      sim: "risk",
    },
    es: {
      intro: "Traduce cada falla técnica en R$ detenidos ahora — costo de parada por hora + documentos fiscales bloqueados, por proceso de negocio.",
      flow: [["Costo/hora por integración", "Tú lo defines"], ["Suma el tiempo detenido", "En vivo"], ["Agrupa por proceso", "R$ en riesgo"]],
      cases: [["Lenguaje de CFO", "cambia la conversación de venta"], ["Prioriza por la caja", "no por la alerta"]],
      implement: ["Define costo/hora y proceso", "El cálculo corre en vivo", "Muéstralo al director"],
      sim: "risk",
    },
  },
  "Reconciliação ponta-a-ponta": {
    pt: {
      intro: "\"Entregue\" não é \"virou negócio\". Rastreia o documento pela jornada (pedido → ordem → fatura) e mostra onde o volume se perde.",
      flow: [["Define a jornada", "Estágios esperados"], ["Conta cada estágio", "Volume real"], ["Mostra o funil", "Onde some"], ["Aponta o vazamento", "Investigue aqui"]],
      cases: [["Pega o sumiço silencioso", "diz 'sucesso' mas não nasceu"], ["Garante o faturamento", "o que entrou, faturou"]],
      implement: ["Defina os estágios do processo", "O funil é calculado", "Ataque o maior vazamento"],
      sim: "fail", simSteps: ["1.000 pedidos entram", "998 viram ordem", "Só 940 geram fatura", "60 perdidos: Ordem → Fatura", "Investigue esse trecho"],
    },
    en: {
      intro: "\"Delivered\" isn't \"became business\". It traces the document along the journey (order → sales order → invoice) and shows where the volume gets lost.",
      flow: [["Defines the journey", "Expected stages"], ["Counts each stage", "Real volume"], ["Shows the funnel", "Where it vanishes"], ["Points to the leak", "Investigate here"]],
      cases: [["Catches the silent loss", "says 'success' but it never existed"], ["Secures the billing", "what came in got billed"]],
      implement: ["Define the process stages", "The funnel is computed", "Attack the biggest leak"],
      sim: "fail", simSteps: ["1,000 orders come in", "998 become sales orders", "Only 940 generate an invoice", "60 lost: Sales Order → Invoice", "Investigate that segment"],
    },
    es: {
      intro: "\"Entregado\" no es \"se volvió negocio\". Rastrea el documento por el recorrido (pedido → orden → factura) y muestra dónde se pierde el volumen.",
      flow: [["Define el recorrido", "Etapas esperadas"], ["Cuenta cada etapa", "Volumen real"], ["Muestra el embudo", "Dónde desaparece"], ["Señala la fuga", "Investiga aquí"]],
      cases: [["Atrapa la pérdida silenciosa", "dice 'éxito' pero nunca nació"], ["Asegura la facturación", "lo que entró, se facturó"]],
      implement: ["Define las etapas del proceso", "El embudo se calcula", "Ataca la mayor fuga"],
      sim: "fail", simSteps: ["Entran 1.000 pedidos", "998 se vuelven orden", "Solo 940 generan factura", "60 perdidos: Orden → Factura", "Investiga ese tramo"],
    },
  },
  "Remediação generativa": {
    pt: {
      intro: "A IA não só descreve o problema — escreve a correção pronta (Groovy, mapeamento, filtro OData) para você colar e aplicar.",
      flow: [["Lê a falha", "Erro real"], ["Gera o artefato", "Código pronto"], ["Você revisa e aplica", "Cola no CPI/SAP"], ["Valida", "Conforme a IA indica"]],
      cases: [["De 'explica' a 'resolve'", "em segundos"], ["Qualidade padronizada", "entre analistas"]],
      implement: ["Conecte a fonte", "Clique 'Gerar correção pronta'", "Configure a IA no ambiente"],
      sim: "fail", simSteps: ["Falha no IFlow", "IA lê o erro", "Escreve o Groovy de correção", "Você cola no artefato", "Testa — resolvido"],
    },
    en: {
      intro: "The AI doesn't just describe the problem — it writes the ready-to-use fix (Groovy, mapping, OData filter) for you to paste and apply.",
      flow: [["Reads the failure", "Real error"], ["Generates the artifact", "Ready-made code"], ["You review and apply", "Paste into CPI/SAP"], ["Validate", "As the AI indicates"]],
      cases: [["From 'explains' to 'resolves'", "in seconds"], ["Standardized quality", "across analysts"]],
      implement: ["Connect the source", "Click 'Generate ready fix'", "Configure the AI in your environment"],
      sim: "fail", simSteps: ["Failure in the IFlow", "AI reads the error", "Writes the Groovy fix", "You paste it into the artifact", "Test — resolved"],
    },
    es: {
      intro: "La IA no solo describe el problema — escribe la corrección lista (Groovy, mapeo, filtro OData) para que la pegues y apliques.",
      flow: [["Lee la falla", "Error real"], ["Genera el artefacto", "Código listo"], ["Tú revisas y aplicas", "Pégalo en CPI/SAP"], ["Valida", "Como indica la IA"]],
      cases: [["De 'explica' a 'resuelve'", "en segundos"], ["Calidad estandarizada", "entre analistas"]],
      implement: ["Conecta la fuente", "Haz clic en 'Generar corrección lista'", "Configura la IA en el ambiente"],
      sim: "fail", simSteps: ["Falla en el IFlow", "La IA lee el error", "Escribe el Groovy de corrección", "Lo pegas en el artefacto", "Prueba — resuelto"],
    },
  },
  "ChatOps por WhatsApp": {
    pt: {
      intro: "Opere o SAP por mensagem (WhatsApp/Telegram). A IA entende, executa o que é leitura e pede aprovação para o que mexe no SAP.",
      flow: [["Você manda a mensagem", "Em português"], ["IA entende a intenção", "Mapeia a ação"], ["Executa ou pede aprovação", "Seguro"], ["Responde no chat", "Resultado"]],
      cases: [["Operação na palma", "sem abrir painel"], ["Plantão de qualquer lugar", "pelo WhatsApp"]],
      implement: ["Gere o token de canal", "Aponte o webhook do WhatsApp/Telegram", "Comece a operar por mensagem"],
      sim: "chat",
    },
    en: {
      intro: "Operate SAP by message (WhatsApp/Telegram). The AI understands, runs read-only actions and asks for approval for anything that changes SAP.",
      flow: [["You send the message", "In natural language"], ["AI understands the intent", "Maps the action"], ["Executes or asks for approval", "Safe"], ["Replies in the chat", "Result"]],
      cases: [["Operations in your pocket", "without opening the dashboard"], ["On-call from anywhere", "via WhatsApp"]],
      implement: ["Generate the channel token", "Point the WhatsApp/Telegram webhook", "Start operating by message"],
      sim: "chat",
    },
    es: {
      intro: "Opera SAP por mensaje (WhatsApp/Telegram). La IA entiende, ejecuta lo que es lectura y pide aprobación para lo que toca SAP.",
      flow: [["Tú envías el mensaje", "En lenguaje natural"], ["La IA entiende la intención", "Mapea la acción"], ["Ejecuta o pide aprobación", "Seguro"], ["Responde en el chat", "Resultado"]],
      cases: [["Operación en la palma", "sin abrir el panel"], ["Guardia desde cualquier lugar", "por WhatsApp"]],
      implement: ["Genera el token de canal", "Apunta el webhook de WhatsApp/Telegram", "Empieza a operar por mensaje"],
      sim: "chat",
    },
  },
  "Perda silenciosa de negócio": {
    pt: {
      intro: "Alerta quando o volume cai muito abaixo do normal — mesmo com tudo verde tecnicamente. Captura a receita parando antes de virar reclamação.",
      flow: [["Aprende o volume normal", "Por fluxo"], ["Compara com agora", "Última hora"], ["Queda anormal?", "Dispara alerta"]],
      cases: [["Vê o que o monitor não vê", "tudo verde, receita caindo"], ["Antecipa o problema", "antes do cliente ligar"]],
      implement: ["Conecte CPI/integrações", "O baseline se forma sozinho", "Investigue os alertas de queda"],
      sim: "trend",
    },
    en: {
      intro: "Alerts when volume drops well below normal — even with everything technically green. It catches revenue stalling before it becomes a complaint.",
      flow: [["Learns the normal volume", "Per flow"], ["Compares to now", "Last hour"], ["Abnormal drop?", "Fires an alert"]],
      cases: [["Sees what the monitor can't", "all green, revenue falling"], ["Anticipates the problem", "before the client calls"]],
      implement: ["Connect CPI/integrations", "The baseline forms on its own", "Investigate the drop alerts"],
      sim: "trend",
    },
    es: {
      intro: "Alerta cuando el volumen cae muy por debajo de lo normal — aun con todo verde técnicamente. Captura la receta deteniéndose antes de volverse reclamo.",
      flow: [["Aprende el volumen normal", "Por flujo"], ["Compara con ahora", "Última hora"], ["¿Caída anormal?", "Dispara alerta"]],
      cases: [["Ve lo que el monitor no ve", "todo verde, ingreso cayendo"], ["Anticipa el problema", "antes de que el cliente llame"]],
      implement: ["Conecta CPI/integraciones", "El baseline se forma solo", "Investiga las alertas de caída"],
      sim: "trend",
    },
  },
  "Pré-voo de mudança": {
    pt: {
      intro: "Antes de um transport ir pra produção, o SAPLINK calcula o raio de impacto (interfaces, processos, R$/h) e um score de risco — pra você testar o que importa antes de subir.",
      flow: [["Lê o transport", "Descrição + alvo"], ["Mapeia o raio", "Catálogo + integrações"], ["Calcula risco + R$", "Score 0-100"], ["Plano de teste", "O que validar"]],
      cases: [["Sem surpresa pós-deploy", "testa o certo antes"], ["Decisão em segundos", "score + plano prontos"]],
      implement: ["Agente conectado (STMS)", "Escolha o transport a subir", "Siga o plano de teste antes do import"],
      sim: "fail", simSteps: ["Lê o transport", "Mapeia o raio", "Calcula risco + R$", "Gera plano de teste"],
      demo: { metric: "Raio de impacto · DEVK900231 (user-exit MIGO)", action: "Calcular blast radius", rows: [["IF_SalesOrder", "interface no raio", "afetada"], ["IDoc ORDERS05", "mensagem no raio", "afetada"], ["Faturamento", "processo de negócio", "R$ 45k/h em risco"]], kpis: { detect: "3 no raio", time: "score 78 (ALTO)", auto: "plano de teste", impact: "R$ 45k/h" }, result: "Mudança de risco ALTO — valide Faturamento antes de subir." },
    },
    en: {
      intro: "Before a transport goes to production, SAPLINK computes the impact radius (interfaces, processes, R$/h) and a risk score — so you test what matters before deploying.",
      flow: [["Reads the transport", "Description + target"], ["Maps the radius", "Catalog + integrations"], ["Computes risk + R$", "Score 0-100"], ["Test plan", "What to validate"]],
      cases: [["No post-deploy surprises", "test the right things first"], ["Decision in seconds", "score + plan ready"]],
      implement: ["Agent connected (STMS)", "Pick the transport to deploy", "Follow the test plan before the import"],
      sim: "fail", simSteps: ["Reads the transport", "Maps the radius", "Computes risk + R$", "Generates the test plan"],
      demo: { metric: "Impact radius · DEVK900231 (MIGO user-exit)", action: "Compute blast radius", rows: [["IF_SalesOrder", "interface in the radius", "affected"], ["IDoc ORDERS05", "message in the radius", "affected"], ["Billing", "business process", "R$ 45k/h at risk"]], kpis: { detect: "3 in radius", time: "score 78 (HIGH)", auto: "test plan", impact: "R$ 45k/h" }, result: "HIGH-risk change — validate Billing before deploying." },
    },
    es: {
      intro: "Antes de que un transport vaya a producción, SAPLINK calcula el radio de impacto (interfaces, procesos, R$/h) y un score de riesgo — para que pruebes lo que importa antes de subir.",
      flow: [["Lee el transport", "Descripción + objetivo"], ["Mapea el radio", "Catálogo + integraciones"], ["Calcula riesgo + R$", "Score 0-100"], ["Plan de prueba", "Qué validar"]],
      cases: [["Sin sorpresa pos-deploy", "prueba lo correcto antes"], ["Decisión en segundos", "score + plan listos"]],
      implement: ["Agente conectado (STMS)", "Elige el transport a subir", "Sigue el plan de prueba antes del import"],
      sim: "fail", simSteps: ["Lee el transport", "Mapea el radio", "Calcula riesgo + R$", "Genera el plan de prueba"],
      demo: { metric: "Radio de impacto · DEVK900231 (user-exit MIGO)", action: "Calcular blast radius", rows: [["IF_SalesOrder", "interfaz en el radio", "afectada"], ["IDoc ORDERS05", "mensaje en el radio", "afectada"], ["Facturación", "proceso de negocio", "R$ 45k/h en riesgo"]], kpis: { detect: "3 en el radio", time: "score 78 (ALTO)", auto: "plan de prueba", impact: "R$ 45k/h" }, result: "Cambio de riesgo ALTO — valida Facturación antes de subir." },
    },
  },
  "Time machine de incidente": {
    pt: {
      intro: "Reconstrói a linha do tempo de um incidente (mudanças, falhas, alertas) e mostra o contrafactual: quanto teria sido economizado com detecção mais rápida.",
      flow: [["Escolhe o incidente", "Um alerta"], ["Monta a timeline", "Eventos em volta"], ["Calcula o impacto", "R$ do tempo parado"], ["E se?", "R$ salvo com detecção rápida"]],
      cases: [["Prova de ROI", "número irrefutável na renovação"], ["Aprende a causa", "o que disparou tudo"]],
      implement: ["Conecte as fontes", "Escolha o incidente", "Use o contrafactual de R$ com o cliente"],
      sim: "fail", simSteps: ["14:00 transport → PRD", "14:20 começa a falhar", "16:30 detectado (modo antigo)", "Calcula o contrafactual"],
      demo: { metric: "Linha do tempo — IFlow SalesOrder", action: "Reproduzir incidente", rows: [["14:00", "transport DEVK900231 → PRD", "mudança"], ["14:20", "IFlow começa a falhar", "falha"], ["16:30", "detectado (modo antigo)", "2h30 parado"]], kpis: { detect: "3 eventos", time: "2h30 parado", auto: "contrafactual", impact: "R$ 104k evitável" }, result: "Com detecção em 5 min: R$ 8k em vez de R$ 112k — R$ 104k salvos." },
    },
    en: {
      intro: "Reconstructs the timeline of an incident (changes, failures, alerts) and shows the counterfactual: how much would have been saved with faster detection.",
      flow: [["Pick the incident", "An alert"], ["Build the timeline", "Surrounding events"], ["Compute the impact", "R$ of downtime"], ["What if?", "R$ saved with fast detection"]],
      cases: [["Proof of ROI", "an undeniable number at renewal"], ["Learn the cause", "what set it all off"]],
      implement: ["Connect the sources", "Pick the incident", "Use the R$ counterfactual with the client"],
      sim: "fail", simSteps: ["14:00 transport → PRD", "14:20 starts failing", "16:30 detected (old mode)", "Computes the counterfactual"],
      demo: { metric: "Timeline — IFlow SalesOrder", action: "Replay incident", rows: [["14:00", "transport DEVK900231 → PRD", "change"], ["14:20", "IFlow starts failing", "failure"], ["16:30", "detected (old mode)", "2h30 down"]], kpis: { detect: "3 events", time: "2h30 down", auto: "counterfactual", impact: "R$ 104k avoidable" }, result: "With detection in 5 min: R$ 8k instead of R$ 112k — R$ 104k saved." },
    },
    es: {
      intro: "Reconstruye la línea de tiempo de un incidente (cambios, fallas, alertas) y muestra el contrafactual: cuánto se habría ahorrado con detección más rápida.",
      flow: [["Elige el incidente", "Una alerta"], ["Arma la timeline", "Eventos alrededor"], ["Calcula el impacto", "R$ del tiempo detenido"], ["¿Y si?", "R$ ahorrado con detección rápida"]],
      cases: [["Prueba de ROI", "número irrefutable en la renovación"], ["Aprende la causa", "qué lo disparó todo"]],
      implement: ["Conecta las fuentes", "Elige el incidente", "Usa el contrafactual de R$ con el cliente"],
      sim: "fail", simSteps: ["14:00 transport → PRD", "14:20 empieza a fallar", "16:30 detectado (modo antiguo)", "Calcula el contrafactual"],
      demo: { metric: "Línea de tiempo — IFlow SalesOrder", action: "Reproducir incidente", rows: [["14:00", "transport DEVK900231 → PRD", "cambio"], ["14:20", "IFlow empieza a fallar", "falla"], ["16:30", "detectado (modo antiguo)", "2h30 detenido"]], kpis: { detect: "3 eventos", time: "2h30 detenido", auto: "contrafactual", impact: "R$ 104k evitable" }, result: "Con detección en 5 min: R$ 8k en vez de R$ 112k — R$ 104k ahorrados." },
    },
  },
  "Auditoria & Compliance": {
    pt: {
      intro: "Trilha unificada de mudanças (transports) e remediações (quem pediu/aprovou), com checagem de segregação de função (SoD) e pacote de evidências pronto pro auditor.",
      flow: [["Registra mudanças", "Transports + ações"], ["Cruza autor/aprovador", "Checagem SoD"], ["Sinaliza violações", "Em vermelho"], ["Gera evidências", "Pacote pro auditor"]],
      cases: [["Auditor feliz", "evidência pronta, sem planilha"], ["Pega o SoD", "mesma pessoa pediu e aprovou"]],
      implement: ["Já vem ativo", "Revise as violações em vermelho", "Gere o pacote de evidências com IA"],
      sim: "fail", simSteps: ["Lê transports e remediações", "Cruza quem pediu × aprovou", "Marca violações SoD", "Monta o pacote"],
      demo: { metric: "Trilha de mudanças & remediações", action: "Rodar verificação SoD", rows: [["DEVK900231", "jsilva → PRD", "registrado"], ["REPROCESS_IDOC", "msouza pediu E aprovou", "⚠ SoD"], ["UNLOCK_QUEUE", "ana → aprov: carlos", "ok"]], kpis: { detect: "3", time: "instantâneo", auto: "SoD check", impact: "1 violação" }, result: "1 violação de SoD detectada — pacote de evidências pronto." },
    },
    en: {
      intro: "A unified trail of changes (transports) and remediations (who requested/approved), with a segregation-of-duties (SoD) check and an evidence package ready for the auditor.",
      flow: [["Records changes", "Transports + actions"], ["Cross-checks author/approver", "SoD check"], ["Flags violations", "In red"], ["Generates evidence", "Package for the auditor"]],
      cases: [["Happy auditor", "evidence ready, no spreadsheet"], ["Catches the SoD", "same person requested and approved"]],
      implement: ["Comes active out of the box", "Review the violations in red", "Generate the evidence package with AI"],
      sim: "fail", simSteps: ["Reads transports and remediations", "Cross-checks requester × approver", "Flags SoD violations", "Builds the package"],
      demo: { metric: "Change & remediation trail", action: "Run SoD check", rows: [["DEVK900231", "jsilva → PRD", "recorded"], ["REPROCESS_IDOC", "msouza requested AND approved", "⚠ SoD"], ["UNLOCK_QUEUE", "ana → approver: carlos", "ok"]], kpis: { detect: "3", time: "instant", auto: "SoD check", impact: "1 violation" }, result: "1 SoD violation detected — evidence package ready." },
    },
    es: {
      intro: "Traza unificada de cambios (transports) y remediaciones (quién pidió/aprobó), con verificación de segregación de funciones (SoD) y paquete de evidencias listo para el auditor.",
      flow: [["Registra cambios", "Transports + acciones"], ["Cruza autor/aprobador", "Verificación SoD"], ["Señala violaciones", "En rojo"], ["Genera evidencias", "Paquete para el auditor"]],
      cases: [["Auditor contento", "evidencia lista, sin planilla"], ["Atrapa el SoD", "la misma persona pidió y aprobó"]],
      implement: ["Ya viene activo", "Revisa las violaciones en rojo", "Genera el paquete de evidencias con IA"],
      sim: "fail", simSteps: ["Lee transports y remediaciones", "Cruza quién pidió × aprobó", "Marca violaciones SoD", "Arma el paquete"],
      demo: { metric: "Traza de cambios y remediaciones", action: "Ejecutar verificación SoD", rows: [["DEVK900231", "jsilva → PRD", "registrado"], ["REPROCESS_IDOC", "msouza pidió Y aprobó", "⚠ SoD"], ["UNLOCK_QUEUE", "ana → aprob: carlos", "ok"]], kpis: { detect: "3", time: "instantáneo", auto: "SoD check", impact: "1 violación" }, result: "1 violación de SoD detectada — paquete de evidencias listo." },
    },
  },
  "Parceiros EDI": {
    pt: {
      intro: "Ranqueia os parceiros EDI por quem manda dado ruim — pra você cobrar o parceiro certo, não a sua TI.",
      flow: [["Agrega por parceiro", "IDocs/itens"], ["Conta erros", "Por parceiro"], ["Ranqueia", "% dos erros"], ["Aponta o ofensor", "Quem cobrar"]],
      cases: [["Cobra o certo", "o fornecedor, não a TI"], ["Dado, não achismo", "% dos erros por parceiro"]],
      implement: ["Agente conectado", "Os parceiros aparecem sozinhos", "Aja sobre o pior colocado"],
      sim: "fail", simSteps: ["Agrega itens por parceiro", "Conta erros", "Ranqueia por impacto", "Aponta o ofensor"],
      demo: { metric: "Confiabilidade de parceiro EDI", action: "Calcular ranking", rows: [["KU_FORNEC22", "18 erros · 41% do total", "score 38"], ["LS_ECCCLNT100", "7 erros · 16%", "score 71"], ["KU_CLIENTE01", "2 erros · 5%", "score 92"]], kpis: { detect: "3 parceiros", time: "instantâneo", auto: "ranking", impact: "1 ofensor" }, result: "KU_FORNEC22 causa 41% dos erros — cobre esse parceiro." },
    },
    en: {
      intro: "Ranks EDI partners by who sends bad data — so you chase the right partner, not your own IT.",
      flow: [["Aggregates by partner", "IDocs/items"], ["Counts errors", "Per partner"], ["Ranks", "% of errors"], ["Points to the offender", "Who to chase"]],
      cases: [["Chase the right one", "the supplier, not IT"], ["Data, not hunches", "% of errors per partner"]],
      implement: ["Agent connected", "The partners show up on their own", "Act on the worst-ranked one"],
      sim: "fail", simSteps: ["Aggregates items by partner", "Counts errors", "Ranks by impact", "Points to the offender"],
      demo: { metric: "EDI partner reliability", action: "Compute ranking", rows: [["KU_FORNEC22", "18 errors · 41% of total", "score 38"], ["LS_ECCCLNT100", "7 errors · 16%", "score 71"], ["KU_CLIENTE01", "2 errors · 5%", "score 92"]], kpis: { detect: "3 partners", time: "instant", auto: "ranking", impact: "1 offender" }, result: "KU_FORNEC22 causes 41% of the errors — chase that partner." },
    },
    es: {
      intro: "Rankea a los socios EDI por quién manda dato malo — para que reclames al socio correcto, no a tu TI.",
      flow: [["Agrega por socio", "IDocs/ítems"], ["Cuenta errores", "Por socio"], ["Rankea", "% de los errores"], ["Señala al ofensor", "A quién reclamar"]],
      cases: [["Reclama al correcto", "el proveedor, no la TI"], ["Dato, no opinión", "% de errores por socio"]],
      implement: ["Agente conectado", "Los socios aparecen solos", "Actúa sobre el peor ubicado"],
      sim: "fail", simSteps: ["Agrega ítems por socio", "Cuenta errores", "Rankea por impacto", "Señala al ofensor"],
      demo: { metric: "Confiabilidad de socio EDI", action: "Calcular ranking", rows: [["KU_FORNEC22", "18 errores · 41% del total", "score 38"], ["LS_ECCCLNT100", "7 errores · 16%", "score 71"], ["KU_CLIENTE01", "2 errores · 5%", "score 92"]], kpis: { detect: "3 socios", time: "instantáneo", auto: "ranking", impact: "1 ofensor" }, result: "KU_FORNEC22 causa 41% de los errores — reclama a ese socio." },
    },
  },
  "FinOps de BTP": {
    pt: {
      intro: "Liga o volume de mensagens ao custo de consumo do BTP e flagra o IFlow desgovernado queimando crédito.",
      flow: [["Conta mensagens", "Por IFlow"], ["Aplica a tarifa", "Custo estimado"], ["Ranqueia por custo", "Quem gasta mais"], ["Flagra desperdício", "IFlow em loop"]],
      cases: [["Controle de gasto", "fim da surpresa na fatura BTP"], ["Acha o desperdício", "IFlow desgovernado"]],
      implement: ["Conecte o CPI", "Ajuste a tarifa (BTP_RATE_CENTS_PER_1K)", "Acompanhe o custo por IFlow"],
      sim: "fail", simSteps: ["Conta mensagens por IFlow", "Aplica a tarifa", "Ranqueia por custo", "Flagra o desgovernado"],
      demo: { metric: "Custo de BTP por IFlow (30 dias)", action: "Estimar consumo", rows: [["SalesOrder_Replication", "43.200 msg", "R$ 13/mês"], ["SapLink (timer)", "1.000.000 msg", "⚠ R$ 312/mês"], ["IF_Material_Sync", "8.100 msg", "R$ 2/mês"]], kpis: { detect: "3 IFlows", time: "30 dias", auto: "estimativa", impact: "R$ 327/mês" }, result: "SapLink (timer) sozinho = R$ 312/mês — IFlow desgovernado." },
    },
    en: {
      intro: "Links message volume to BTP consumption cost and flags the runaway IFlow burning credit.",
      flow: [["Counts messages", "Per IFlow"], ["Applies the rate", "Estimated cost"], ["Ranks by cost", "Who spends the most"], ["Flags waste", "IFlow in a loop"]],
      cases: [["Spend control", "no more surprise on the BTP invoice"], ["Finds the waste", "a runaway IFlow"]],
      implement: ["Connect CPI", "Adjust the rate (BTP_RATE_CENTS_PER_1K)", "Track the cost per IFlow"],
      sim: "fail", simSteps: ["Counts messages per IFlow", "Applies the rate", "Ranks by cost", "Flags the runaway one"],
      demo: { metric: "BTP cost per IFlow (30 days)", action: "Estimate consumption", rows: [["SalesOrder_Replication", "43,200 msg", "R$ 13/month"], ["SapLink (timer)", "1,000,000 msg", "⚠ R$ 312/month"], ["IF_Material_Sync", "8,100 msg", "R$ 2/month"]], kpis: { detect: "3 IFlows", time: "30 days", auto: "estimate", impact: "R$ 327/month" }, result: "SapLink (timer) alone = R$ 312/month — a runaway IFlow." },
    },
    es: {
      intro: "Liga el volumen de mensajes al costo de consumo del BTP y marca el IFlow descontrolado quemando crédito.",
      flow: [["Cuenta mensajes", "Por IFlow"], ["Aplica la tarifa", "Costo estimado"], ["Rankea por costo", "Quién gasta más"], ["Marca el desperdicio", "IFlow en loop"]],
      cases: [["Control de gasto", "fin de la sorpresa en la factura BTP"], ["Encuentra el desperdicio", "IFlow descontrolado"]],
      implement: ["Conecta el CPI", "Ajusta la tarifa (BTP_RATE_CENTS_PER_1K)", "Sigue el costo por IFlow"],
      sim: "fail", simSteps: ["Cuenta mensajes por IFlow", "Aplica la tarifa", "Rankea por costo", "Marca el descontrolado"],
      demo: { metric: "Costo de BTP por IFlow (30 días)", action: "Estimar consumo", rows: [["SalesOrder_Replication", "43.200 msg", "R$ 13/mes"], ["SapLink (timer)", "1.000.000 msg", "⚠ R$ 312/mes"], ["IF_Material_Sync", "8.100 msg", "R$ 2/mes"]], kpis: { detect: "3 IFlows", time: "30 días", auto: "estimación", impact: "R$ 327/mes" }, result: "SapLink (timer) solo = R$ 312/mes — IFlow descontrolado." },
    },
  },
  "Transports (STMS)": {
    pt: {
      intro: "Acompanha os transports importados e correlaciona automaticamente com as falhas que vieram depois (provável causa).",
      flow: [["Lê os transports", "STMS"], ["Cruza com falhas", "Janela de tempo"], ["Aponta a causa", "Com confiança"]],
      cases: [["Causa em minutos", "não em horas"], ["Fim do ping-pong", "nuvem × ABAP"]],
      implement: ["Agente instalado", "Os transports aparecem", "Veja a correlação na tela 'Causa cross-camada'"],
      sim: "fail", simSteps: ["Transport DEVK900231 vai pra PRD", "2h depois: IFlow falha", "SAPLINK correlaciona", "Aponta: provável causa (80%)", "Você reverte/corrige o transport"],
    },
    en: {
      intro: "Tracks imported transports and automatically correlates them with the failures that came afterward (likely cause).",
      flow: [["Reads the transports", "STMS"], ["Cross-checks failures", "Time window"], ["Points to the cause", "With confidence"]],
      cases: [["Cause in minutes", "not in hours"], ["End of the ping-pong", "cloud × ABAP"]],
      implement: ["Agent installed", "The transports show up", "See the correlation on the 'Cross-layer cause' screen"],
      sim: "fail", simSteps: ["Transport DEVK900231 goes to PRD", "2h later: IFlow fails", "SAPLINK correlates", "Points to: likely cause (80%)", "You revert/fix the transport"],
    },
    es: {
      intro: "Sigue los transports importados y los correlaciona automáticamente con las fallas que vinieron después (probable causa).",
      flow: [["Lee los transports", "STMS"], ["Cruza con fallas", "Ventana de tiempo"], ["Señala la causa", "Con confianza"]],
      cases: [["Causa en minutos", "no en horas"], ["Fin del ping-pong", "nube × ABAP"]],
      implement: ["Agente instalado", "Los transports aparecen", "Mira la correlación en la pantalla 'Causa cross-capa'"],
      sim: "fail", simSteps: ["Transport DEVK900231 va a PRD", "2h después: IFlow falla", "SAPLINK correlaciona", "Señala: probable causa (80%)", "Reviertes/corriges el transport"],
    },
  },
};

// Dados fictícios dos simuladores (mini-painéis com resultado)
export const DEMOS: Record<string, Record<Lang, Demo>> = {
  "Cockpit de IDoc & filas": {
    pt: {
      metric: "IDocs em erro · cliente Agro Nordeste", action: "Reprocessar tudo (BD87)",
      rows: [["90004412", "ORDERS05 · status 51", "status 53"], ["90004415", "DESADV01 · status 64", "processado"], ["TID_A0F12", "tRFC SYSFAIL", "reexecutado"], ["90004418", "INVOIC02 · status 51", "status 53"]],
      kpis: { detect: "4", time: "~3 min (vs 1h20 manual)", auto: "com aprovação", impact: "−96% tempo" }, result: "4 itens reprocessados — fila zerada.",
    },
    en: {
      metric: "Failing IDocs · client Agro Nordeste", action: "Reprocess all (BD87)",
      rows: [["90004412", "ORDERS05 · status 51", "status 53"], ["90004415", "DESADV01 · status 64", "processed"], ["TID_A0F12", "tRFC SYSFAIL", "re-run"], ["90004418", "INVOIC02 · status 51", "status 53"]],
      kpis: { detect: "4", time: "~3 min (vs 1h20 manual)", auto: "with approval", impact: "−96% time" }, result: "4 items reprocessed — queue cleared.",
    },
    es: {
      metric: "IDocs en error · cliente Agro Nordeste", action: "Reprocesar todo (BD87)",
      rows: [["90004412", "ORDERS05 · status 51", "status 53"], ["90004415", "DESADV01 · status 64", "procesado"], ["TID_A0F12", "tRFC SYSFAIL", "reejecutado"], ["90004418", "INVOIC02 · status 51", "status 53"]],
      kpis: { detect: "4", time: "~3 min (vs 1h20 manual)", auto: "con aprobación", impact: "−96% tiempo" }, result: "4 ítems reprocesados — cola en cero.",
    },
  },
  "Remediação autônoma": {
    pt: {
      metric: "Itens remediáveis em aberto", action: "Reprocessar/destravar",
      rows: [["90004412", "IDoc 51 — registro não gravado", "status 53"], ["SAPLINK_OUT_3", "fila qRFC SYSFAIL", "destravada"], ["TID_B7A91", "tRFC CPICERR", "reexecutado"]],
      kpis: { detect: "3", time: "~2 min", auto: "100%", impact: "R$ 0 de retrabalho" }, result: "3 correções aplicadas com log e antes/depois.",
    },
    en: {
      metric: "Open remediable items", action: "Reprocess/unblock",
      rows: [["90004412", "IDoc 51 — record not written", "status 53"], ["SAPLINK_OUT_3", "qRFC queue SYSFAIL", "unblocked"], ["TID_B7A91", "tRFC CPICERR", "re-run"]],
      kpis: { detect: "3", time: "~2 min", auto: "100%", impact: "R$ 0 of rework" }, result: "3 fixes applied with a log and before/after.",
    },
    es: {
      metric: "Ítems remediables abiertos", action: "Reprocesar/destrabar",
      rows: [["90004412", "IDoc 51 — registro no grabado", "status 53"], ["SAPLINK_OUT_3", "cola qRFC SYSFAIL", "destrabada"], ["TID_B7A91", "tRFC CPICERR", "reejecutado"]],
      kpis: { detect: "3", time: "~2 min", auto: "100%", impact: "R$ 0 de retrabajo" }, result: "3 correcciones aplicadas con log y antes/después.",
    },
  },
  "Alertas em tempo real": {
    pt: {
      metric: "Alertas abertos agora", action: "Notificar + acompanhar",
      rows: [["CPI", "SalesOrder_Replication FAILED", "notificado"], ["IDOC", "3 IDocs 51 (Metalúrgica)", "ticket aberto"], ["TLS", "cert vence em 7 dias", "agendado"]],
      kpis: { detect: "3", time: "< 1 min p/ notificar", auto: "dedup + auto-resolve", impact: "MTTR −40%" }, result: "3 alertas roteados ao canal certo, sem duplicar.",
    },
    en: {
      metric: "Alerts open right now", action: "Notify + track",
      rows: [["CPI", "SalesOrder_Replication FAILED", "notified"], ["IDOC", "3 IDocs 51 (Metalúrgica)", "ticket opened"], ["TLS", "cert expires in 7 days", "scheduled"]],
      kpis: { detect: "3", time: "< 1 min to notify", auto: "dedup + auto-resolve", impact: "MTTR −40%" }, result: "3 alerts routed to the right channel, no duplicates.",
    },
    es: {
      metric: "Alertas abiertas ahora", action: "Notificar + seguir",
      rows: [["CPI", "SalesOrder_Replication FAILED", "notificado"], ["IDOC", "3 IDocs 51 (Metalúrgica)", "ticket abierto"], ["TLS", "cert vence en 7 días", "agendado"]],
      kpis: { detect: "3", time: "< 1 min para notificar", auto: "dedup + auto-resolve", impact: "MTTR −40%" }, result: "3 alertas ruteadas al canal correcto, sin duplicar.",
    },
  },
  "Diagnóstico + SAP Notes": {
    pt: {
      metric: "Falhas aguardando diagnóstico", action: "Diagnosticar com IA",
      rows: [["MPL_88231", "HTTP 500 — Sold-to party", "causa: BP inexistente"], ["MPL_88240", "timeout no receiver", "causa: endpoint fora"], ["IDoc 90004412", "status 51", "causa: conta contábil"]],
      kpis: { detect: "3", time: "~8 s por diagnóstico", auto: "causa + Nota + PDF", impact: "júnior produz como sênior" }, result: "3 diagnósticos com causa raiz e passos de correção.",
    },
    en: {
      metric: "Failures awaiting diagnosis", action: "Diagnose with AI",
      rows: [["MPL_88231", "HTTP 500 — Sold-to party", "cause: missing BP"], ["MPL_88240", "receiver timeout", "cause: endpoint down"], ["IDoc 90004412", "status 51", "cause: G/L account"]],
      kpis: { detect: "3", time: "~8 s per diagnosis", auto: "cause + Note + PDF", impact: "a junior performs like a senior" }, result: "3 diagnoses with root cause and fix steps.",
    },
    es: {
      metric: "Fallas esperando diagnóstico", action: "Diagnosticar con IA",
      rows: [["MPL_88231", "HTTP 500 — Sold-to party", "causa: BP inexistente"], ["MPL_88240", "timeout en el receiver", "causa: endpoint caído"], ["IDoc 90004412", "status 51", "causa: cuenta contable"]],
      kpis: { detect: "3", time: "~8 s por diagnóstico", auto: "causa + Nota + PDF", impact: "un júnior produce como sénior" }, result: "3 diagnósticos con causa raíz y pasos de corrección.",
    },
  },
  "Event Mesh + CPI/AIF": {
    pt: {
      metric: "Mensagens CPI/Eventos (BTP)", action: "Sincronizar MPL",
      rows: [["AGo1QDIL…", "SalesOrder_Replication FAILED", "erro capturado"], ["evt.salesorder", "dead-letter", "reenfileirado"], ["AGo1P-V1R…", "SapLink COMPLETED", "ok"]],
      kpis: { detect: "30 MPL", time: "tempo real", auto: "erro detalhado + IA", impact: "vê o que a nuvem esconde" }, result: "Falhas reais do CPI viram alerta + diagnóstico.",
    },
    en: {
      metric: "CPI messages/Events (BTP)", action: "Sync MPL",
      rows: [["AGo1QDIL…", "SalesOrder_Replication FAILED", "error captured"], ["evt.salesorder", "dead-letter", "re-queued"], ["AGo1P-V1R…", "SapLink COMPLETED", "ok"]],
      kpis: { detect: "30 MPL", time: "real time", auto: "detailed error + AI", impact: "sees what the cloud hides" }, result: "Real CPI failures become alert + diagnosis.",
    },
    es: {
      metric: "Mensajes CPI/Eventos (BTP)", action: "Sincronizar MPL",
      rows: [["AGo1QDIL…", "SalesOrder_Replication FAILED", "error capturado"], ["evt.salesorder", "dead-letter", "reencolado"], ["AGo1P-V1R…", "SapLink COMPLETED", "ok"]],
      kpis: { detect: "30 MPL", time: "tiempo real", auto: "error detallado + IA", impact: "ve lo que la nube esconde" }, result: "Las fallas reales del CPI se vuelven alerta + diagnóstico.",
    },
  },
  "On-call multicanal": {
    pt: {
      metric: "Incidente em escalonamento", action: "Disparar on-call",
      rows: [["#INC-01", "CRITICAL — IFlow fora", "Slack plantão"], ["#INC-01", "sem resposta em 30 min", "escalou p/ líder"], ["#INC-01", "reconhecido", "em atendimento"]],
      kpis: { detect: "1", time: "imediato", auto: "escalonamento", impact: "nada no vácuo" }, result: "Incidente notificado e escalado automaticamente.",
    },
    en: {
      metric: "Incident escalating", action: "Trigger on-call",
      rows: [["#INC-01", "CRITICAL — IFlow down", "on-call Slack"], ["#INC-01", "no response in 30 min", "escalated to lead"], ["#INC-01", "acknowledged", "being handled"]],
      kpis: { detect: "1", time: "immediate", auto: "escalation", impact: "nothing in the void" }, result: "Incident notified and escalated automatically.",
    },
    es: {
      metric: "Incidente en escalamiento", action: "Disparar on-call",
      rows: [["#INC-01", "CRITICAL — IFlow caído", "Slack guardia"], ["#INC-01", "sin respuesta en 30 min", "escaló al líder"], ["#INC-01", "reconocido", "en atención"]],
      kpis: { detect: "1", time: "inmediato", auto: "escalamiento", impact: "nada al vacío" }, result: "Incidente notificado y escalado automáticamente.",
    },
  },
  "Tickets Jira/ServiceNow": {
    pt: {
      metric: "Alertas → chamados", action: "Sincronizar tickets",
      rows: [["INC-4521", "IFlow SalesOrder FAILED", "aberto"], ["INC-4522", "3 IDocs em erro", "aberto"], ["INC-4521", "integração recuperou", "fechado sozinho"]],
      kpis: { detect: "2", time: "automático", auto: "abre e fecha", impact: "zero retrabalho" }, result: "Chamados abertos e fechados em sincronia com a realidade.",
    },
    en: {
      metric: "Alerts → tickets", action: "Sync tickets",
      rows: [["INC-4521", "IFlow SalesOrder FAILED", "open"], ["INC-4522", "3 IDocs in error", "open"], ["INC-4521", "integration recovered", "closed itself"]],
      kpis: { detect: "2", time: "automatic", auto: "opens and closes", impact: "zero rework" }, result: "Tickets opened and closed in sync with reality.",
    },
    es: {
      metric: "Alertas → tickets", action: "Sincronizar tickets",
      rows: [["INC-4521", "IFlow SalesOrder FAILED", "abierto"], ["INC-4522", "3 IDocs en error", "abierto"], ["INC-4521", "integración recuperó", "cerrado solo"]],
      kpis: { detect: "2", time: "automático", auto: "abre y cierra", impact: "cero retrabajo" }, result: "Tickets abiertos y cerrados en sincronía con la realidad.",
    },
  },
  "AMS Autônomo": {
    pt: {
      metric: "Correções de alta confiança", action: "Piloto automático",
      rows: [["90004412", "IDoc 51 — conf. rede 94%", "auto-resolvido"], ["SAPLINK_OUT_3", "fila SYSFAIL — conf. 91%", "auto-resolvido"], ["90004418", "IDoc 51 — conf. 96%", "auto-resolvido"]],
      kpis: { detect: "3", time: "madrugada, sem humano", auto: "100%", impact: "L1/L2 ≈ 0" }, result: "3 correções aplicadas sozinhas, com rollback e rastro.",
    },
    en: {
      metric: "High-confidence fixes", action: "Autopilot",
      rows: [["90004412", "IDoc 51 — net conf. 94%", "auto-resolved"], ["SAPLINK_OUT_3", "SYSFAIL queue — conf. 91%", "auto-resolved"], ["90004418", "IDoc 51 — conf. 96%", "auto-resolved"]],
      kpis: { detect: "3", time: "overnight, no human", auto: "100%", impact: "L1/L2 ≈ 0" }, result: "3 fixes applied on their own, with rollback and a trail.",
    },
    es: {
      metric: "Correcciones de alta confianza", action: "Piloto automático",
      rows: [["90004412", "IDoc 51 — conf. red 94%", "auto-resuelto"], ["SAPLINK_OUT_3", "cola SYSFAIL — conf. 91%", "auto-resuelto"], ["90004418", "IDoc 51 — conf. 96%", "auto-resuelto"]],
      kpis: { detect: "3", time: "madrugada, sin humano", auto: "100%", impact: "L1/L2 ≈ 0" }, result: "3 correcciones aplicadas solas, con rollback y traza.",
    },
  },
  "Causa raiz cross-camada": {
    pt: {
      metric: "Falhas correlacionadas a mudanças", action: "Correlacionar",
      rows: [["SalesOrder_Replication", "falhou 14:20", "← transp. DEVK900231 (80%)"], ["IF_Bank_Payment", "falhou 14:35", "← transp. DEVK900231 (72%)"], ["IF_Material_Sync", "ok", "sem correlação"]],
      kpis: { detect: "2", time: "minutos (vs horas)", auto: "score de confiança", impact: "fim do ping-pong" }, result: "Causa provável apontada: transport DEVK900231.",
    },
    en: {
      metric: "Failures correlated to changes", action: "Correlate",
      rows: [["SalesOrder_Replication", "failed 14:20", "← transp. DEVK900231 (80%)"], ["IF_Bank_Payment", "failed 14:35", "← transp. DEVK900231 (72%)"], ["IF_Material_Sync", "ok", "no correlation"]],
      kpis: { detect: "2", time: "minutes (vs hours)", auto: "confidence score", impact: "end of the ping-pong" }, result: "Likely cause pointed out: transport DEVK900231.",
    },
    es: {
      metric: "Fallas correlacionadas con cambios", action: "Correlacionar",
      rows: [["SalesOrder_Replication", "falló 14:20", "← transp. DEVK900231 (80%)"], ["IF_Bank_Payment", "falló 14:35", "← transp. DEVK900231 (72%)"], ["IF_Material_Sync", "ok", "sin correlación"]],
      kpis: { detect: "2", time: "minutos (vs horas)", auto: "score de confianza", impact: "fin del ping-pong" }, result: "Causa probable señalada: transport DEVK900231.",
    },
  },
  "Transports (STMS)": {
    pt: {
      metric: "Transports recentes em PRD", action: "Analisar impacto",
      rows: [["DEVK900231", "user-exit MIGO (ZMM)", "⚠ correlacionado a 2 falhas"], ["DEVK900228", "estrutura IDoc ORDERS05", "ok"], ["DEVK900219", "mapeamento CPI", "ok"]],
      kpis: { detect: "3", time: "automático", auto: "correlação", impact: "causa em minutos" }, result: "1 transport sob suspeita, ligado a 2 falhas.",
    },
    en: {
      metric: "Recent transports in PRD", action: "Analyze impact",
      rows: [["DEVK900231", "MIGO user-exit (ZMM)", "⚠ correlated to 2 failures"], ["DEVK900228", "IDoc ORDERS05 structure", "ok"], ["DEVK900219", "CPI mapping", "ok"]],
      kpis: { detect: "3", time: "automatic", auto: "correlation", impact: "cause in minutes" }, result: "1 transport under suspicion, linked to 2 failures.",
    },
    es: {
      metric: "Transports recientes en PRD", action: "Analizar impacto",
      rows: [["DEVK900231", "user-exit MIGO (ZMM)", "⚠ correlacionado a 2 fallas"], ["DEVK900228", "estructura IDoc ORDERS05", "ok"], ["DEVK900219", "mapeo CPI", "ok"]],
      kpis: { detect: "3", time: "automático", auto: "correlación", impact: "causa en minutos" }, result: "1 transport bajo sospecha, ligado a 2 fallas.",
    },
  },
  "Reconciliação ponta-a-ponta": {
    pt: {
      metric: "Funil: Pedido → Ordem → Fatura (24h)", action: "Reconciliar jornada",
      rows: [["Pedido (CPI)", "1.000 entraram", "1.000"], ["Ordem (S/4)", "998 criadas", "−2"], ["Fatura", "940 emitidas", "−58 ⚠"]],
      kpis: { detect: "1.000", time: "tempo real", auto: "detecção de gap", impact: "94% conclusão" }, result: "58 documentos perdidos entre Ordem → Fatura.",
    },
    en: {
      metric: "Funnel: Order → Sales Order → Invoice (24h)", action: "Reconcile journey",
      rows: [["Order (CPI)", "1,000 came in", "1,000"], ["Sales Order (S/4)", "998 created", "−2"], ["Invoice", "940 issued", "−58 ⚠"]],
      kpis: { detect: "1,000", time: "real time", auto: "gap detection", impact: "94% completion" }, result: "58 documents lost between Sales Order → Invoice.",
    },
    es: {
      metric: "Embudo: Pedido → Orden → Factura (24h)", action: "Reconciliar recorrido",
      rows: [["Pedido (CPI)", "1.000 entraron", "1.000"], ["Orden (S/4)", "998 creadas", "−2"], ["Factura", "940 emitidas", "−58 ⚠"]],
      kpis: { detect: "1.000", time: "tiempo real", auto: "detección de gap", impact: "94% conclusión" }, result: "58 documentos perdidos entre Orden → Factura.",
    },
  },
  "Remediação generativa": {
    pt: {
      metric: "Falhas → correção pronta", action: "Gerar correção (IA)",
      rows: [["SalesOrder_Replication", "Sold-to party não encontrado", "Groovy gerado"], ["IF_Bank_Payment", "campo BUKRS vazio", "mapeamento gerado"], ["API_SALES v2", "depreciada", "filtro v4 gerado"]],
      kpis: { detect: "3", time: "~10 s", auto: "código pronto", impact: "de 'explica' a 'resolve'" }, result: "3 correções escritas pela IA, prontas pra colar.",
    },
    en: {
      metric: "Failures → ready fix", action: "Generate fix (AI)",
      rows: [["SalesOrder_Replication", "Sold-to party not found", "Groovy generated"], ["IF_Bank_Payment", "BUKRS field empty", "mapping generated"], ["API_SALES v2", "deprecated", "v4 filter generated"]],
      kpis: { detect: "3", time: "~10 s", auto: "ready-made code", impact: "from 'explains' to 'resolves'" }, result: "3 fixes written by the AI, ready to paste.",
    },
    es: {
      metric: "Fallas → corrección lista", action: "Generar corrección (IA)",
      rows: [["SalesOrder_Replication", "Sold-to party no encontrado", "Groovy generado"], ["IF_Bank_Payment", "campo BUKRS vacío", "mapeo generado"], ["API_SALES v2", "obsoleta", "filtro v4 generado"]],
      kpis: { detect: "3", time: "~10 s", auto: "código listo", impact: "de 'explica' a 'resuelve'" }, result: "3 correcciones escritas por la IA, listas para pegar.",
    },
  },
  "Catálogo de interfaces": {
    pt: {
      metric: "Landscape auto-descoberto", action: "Descobrir interfaces",
      rows: [["LS_ECCCLNT100", "parceiro lógico (WE20)", "mapeado"], ["PI_PROD", "destino RFC (SM59)", "mapeado"], ["API_SALES_ORDER_SRV", "serviço OData", "mapeado"]],
      kpis: { detect: "9", time: "automático", auto: "atualiza sozinho", impact: "doc que não envelhece" }, result: "9 interfaces inventariadas sem planilha manual.",
    },
    en: {
      metric: "Auto-discovered landscape", action: "Discover interfaces",
      rows: [["LS_ECCCLNT100", "logical partner (WE20)", "mapped"], ["PI_PROD", "RFC destination (SM59)", "mapped"], ["API_SALES_ORDER_SRV", "OData service", "mapped"]],
      kpis: { detect: "9", time: "automatic", auto: "updates itself", impact: "docs that never age" }, result: "9 interfaces inventoried with no manual spreadsheet.",
    },
    es: {
      metric: "Landscape auto-descubierto", action: "Descubrir interfaces",
      rows: [["LS_ECCCLNT100", "socio lógico (WE20)", "mapeado"], ["PI_PROD", "destino RFC (SM59)", "mapeado"], ["API_SALES_ORDER_SRV", "servicio OData", "mapeado"]],
      kpis: { detect: "9", time: "automático", auto: "se actualiza solo", impact: "doc que no envejece" }, result: "9 interfaces inventariadas sin planilla manual.",
    },
  },
  "Radar de validade": {
    pt: {
      metric: "Certificados e segredos", action: "Reavaliar validade",
      rows: [["e-CPF NF-e", "vence em 7 dias", "⚠ CRÍTICO"], ["TLS dev.hub", "vence em 24 dias", "atenção"], ["Token CPI", "vence em 90 dias", "ok"]],
      kpis: { detect: "3", time: "automático", auto: "alerta antecipado", impact: "evita a parada mais boba" }, result: "1 certificado crítico sinalizado a tempo.",
    },
    en: {
      metric: "Certificates and secrets", action: "Re-check validity",
      rows: [["e-CPF NF-e", "expires in 7 days", "⚠ CRITICAL"], ["TLS dev.hub", "expires in 24 days", "attention"], ["CPI Token", "expires in 90 days", "ok"]],
      kpis: { detect: "3", time: "automatic", auto: "early alert", impact: "avoids the silliest outage" }, result: "1 critical certificate flagged in time.",
    },
    es: {
      metric: "Certificados y secretos", action: "Reevaluar validez",
      rows: [["e-CPF NF-e", "vence en 7 días", "⚠ CRÍTICO"], ["TLS dev.hub", "vence en 24 días", "atención"], ["Token CPI", "vence en 90 días", "ok"]],
      kpis: { detect: "3", time: "automático", auto: "alerta anticipada", impact: "evita la parada más tonta" }, result: "1 certificado crítico señalado a tiempo.",
    },
  },
  "Rede Federada de Falhas": {
    pt: {
      metric: "Assinaturas de falha na rede", action: "Consultar a rede",
      rows: [["Sold-to party not found", "visto 37× / 12 clientes", "fix: criar BP (89%)"], ["BUKRS vazio", "visto 14× / 6 clientes", "fix: mapear de-para (81%)"], ["timeout receiver", "visto 9× / 5 clientes", "fix: retry+backoff (76%)"]],
      kpis: { detect: "60 falhas", time: "instantâneo", auto: "anonimizado", impact: "fica + esperto a cada cliente" }, result: "Correção vencedora sugerida por assinatura.",
    },
    en: {
      metric: "Failure signatures in the network", action: "Query the network",
      rows: [["Sold-to party not found", "seen 37× / 12 clients", "fix: create BP (89%)"], ["BUKRS empty", "seen 14× / 6 clients", "fix: map lookup (81%)"], ["receiver timeout", "seen 9× / 5 clients", "fix: retry+backoff (76%)"]],
      kpis: { detect: "60 failures", time: "instant", auto: "anonymized", impact: "gets smarter with every client" }, result: "Winning fix suggested by signature.",
    },
    es: {
      metric: "Firmas de falla en la red", action: "Consultar la red",
      rows: [["Sold-to party not found", "visto 37× / 12 clientes", "fix: crear BP (89%)"], ["BUKRS vacío", "visto 14× / 6 clientes", "fix: mapear de-para (81%)"], ["timeout receiver", "visto 9× / 5 clientes", "fix: retry+backoff (76%)"]],
      kpis: { detect: "60 fallas", time: "instantáneo", auto: "anonimizado", impact: "más inteligente con cada cliente" }, result: "Corrección ganadora sugerida por firma.",
    },
  },
};

export const TRENDS: Record<string, Record<Lang, Trend>> = {
  "Previsão de falha": {
    pt: { label: "Profundidade da fila qRFC (últimas horas)", points: [8, 11, 13, 19, 28, 41, 58], threshold: 50, mode: "rise", verdict: "⚠ Vai estourar em ~2h — o SAPLINK avisa antes do incidente." },
    en: { label: "qRFC queue depth (last hours)", points: [8, 11, 13, 19, 28, 41, 58], threshold: 50, mode: "rise", verdict: "⚠ It will break in ~2h — SAPLINK warns before the incident." },
    es: { label: "Profundidad de la cola qRFC (últimas horas)", points: [8, 11, 13, 19, 28, 41, 58], threshold: 50, mode: "rise", verdict: "⚠ Va a reventar en ~2h — SAPLINK avisa antes del incidente." },
  },
  "Perda silenciosa de negócio": {
    pt: { label: "Pedidos/hora (tudo verde tecnicamente)", points: [62, 60, 58, 40, 28, 22, 18], threshold: 30, mode: "drop", verdict: "⚠ Queda de ~70% no volume — receita parando, sem nenhum erro técnico." },
    en: { label: "Orders/hour (everything technically green)", points: [62, 60, 58, 40, 28, 22, 18], threshold: 30, mode: "drop", verdict: "⚠ ~70% drop in volume — revenue stalling, with no technical error." },
    es: { label: "Pedidos/hora (todo verde técnicamente)", points: [62, 60, 58, 40, 28, 22, 18], threshold: 30, mode: "drop", verdict: "⚠ Caída de ~70% en el volumen — ingreso deteniéndose, sin ningún error técnico." },
  },
};

const FALLBACK: Record<Lang, FeatureDetail> = {
  pt: {
    intro: "Capacidade do SAPLINK para operação de integrações SAP.",
    flow: [["Conecta", "Agente ou OData"], ["Monitora", "Em tempo real"], ["Age", "Com IA e aprovação"]],
    cases: [["Mais controle", "menos incidente"]],
    implement: ["Conecte a fonte", "Acompanhe no painel", "Aja pelas recomendações"],
    sim: "fail",
  },
  en: {
    intro: "A SAPLINK capability for operating SAP integrations.",
    flow: [["Connects", "Agent or OData"], ["Monitors", "In real time"], ["Acts", "With AI and approval"]],
    cases: [["More control", "fewer incidents"]],
    implement: ["Connect the source", "Track it on the dashboard", "Act on the recommendations"],
    sim: "fail",
  },
  es: {
    intro: "Capacidad de SAPLINK para la operación de integraciones SAP.",
    flow: [["Conecta", "Agente u OData"], ["Monitorea", "En tiempo real"], ["Actúa", "Con IA y aprobación"]],
    cases: [["Más control", "menos incidentes"]],
    implement: ["Conecta la fuente", "Sigue en el panel", "Actúa según las recomendaciones"],
    sim: "fail",
  },
};

// ---------- Modal ----------

export default function FeatureModal({ feature, onClose, onInterest }: { feature: { key: string; icon: string; name: string; tagline: string; accent: string } | null; onClose: () => void; onInterest: () => void }) {
  const { lang } = useLang();
  useEffect(() => {
    if (!feature) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [feature, onClose]);
  if (!feature) return null;
  const t = UI[lang];
  const d = (FEATURES[feature.key] || FALLBACK)[lang];
  const accent = feature.accent;

  return (
    <div className="fixed inset-0 z-[60] bg-[#0f0b1a]/30 backdrop-blur-xl flex items-start justify-center p-0 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#211a3a] w-full sm:rounded-2xl ring-1 ring-purple-400/20 border border-white/[0.12] sm:my-6 min-h-screen sm:min-h-0 max-w-full sm:max-w-3xl lg:max-w-6xl shadow-[0_24px_90px_rgba(0,0,0,0.7)]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-5 sm:px-7 py-4 border-b border-white/[0.1] bg-gradient-to-r from-[#2a2150] to-[#211a3a] sm:rounded-t-2xl">
          <span className="text-3xl">{feature.icon}</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold truncate">{feature.name}</h2>
            <p className="text-xs sm:text-sm" style={{ color: accent }}>{feature.tagline}</p>
          </div>
          <button onClick={onClose} className="text-[#9b95ad] hover:text-white text-2xl leading-none shrink-0 cursor-pointer">×</button>
        </div>

        <div className="px-5 sm:px-7 py-6 space-y-8">
          <p className="text-[#c9c5d6] leading-relaxed sm:text-lg">{d.intro}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fluxograma */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9b95ad] mb-3">{t.howItWorks}</h3>
              <div className="space-y-0">
                {d.flow.map((s, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3 bg-[#1a1527] border border-white/[0.08] rounded-lg p-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: accent, color: "#fff" }}>{i + 1}</span>
                      <div><p className="text-sm font-semibold text-[#e2e0ea]">{s[0]}</p><p className="text-xs text-[#9b95ad]">{s[1]}</p></div>
                    </div>
                    {i < d.flow.length - 1 && <div className="flex justify-center py-1"><span style={{ color: accent }}>↓</span></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Simulador */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9b95ad] mb-3">{t.interactiveSim}</h3>
              <div className="bg-[#1a1527] border rounded-xl p-4" style={{ borderColor: `${accent}30` }}>
                {renderSim(d, accent, feature.key, lang)}
              </div>
            </div>
          </div>

          {/* Cases */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9b95ad] mb-3">{t.realResults}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {d.cases.map((c, i) => (
                <div key={i} className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] rounded-xl p-4">
                  <div className="text-2xl font-extrabold" style={{ color: accent }}>{c[0]}</div>
                  <p className="text-sm text-[#c9c5d6] mt-1">{c[1]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Como implementar */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9b95ad] mb-3">{t.howToImplement}</h3>
            <ol className="space-y-2">
              {d.implement.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#d6d3e0]"><span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span><span className="pt-0.5">{s}</span></li>
              ))}
            </ol>
          </div>

          {/* CTA */}
          <div className="rounded-xl p-5 text-center bg-gradient-to-br from-purple-600/20 to-cyan-500/15 border border-purple-500/30">
            <p className="font-semibold text-[#e2e0ea] mb-3">{t.ctaQuestion}</p>
            <button onClick={() => { onClose(); onInterest(); }} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold cursor-pointer">{t.ctaButton}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
