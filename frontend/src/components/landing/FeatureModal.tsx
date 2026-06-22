"use client";

import { useEffect, useState } from "react";

const brl = (c: number) => (c).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// ---------- Simuladores reutilizáveis ----------

function SimRisk({ accent }: { accent: string }) {
  const [ints, setInts] = useState(2);
  const [cost, setCost] = useState(8000);
  const [hours, setHours] = useState(4);
  const total = ints * cost * hours;
  return (
    <div className="space-y-4">
      <Slider label="Integrações paradas" value={ints} min={1} max={10} onChange={setInts} suffix="" />
      <Slider label="Custo de parada por hora" value={cost} min={500} max={50000} step={500} onChange={setCost} suffix="/h" fmt={brl} />
      <Slider label="Horas até detectar/resolver" value={hours} min={1} max={24} onChange={setHours} suffix="h" />
      <div className="rounded-xl p-5 text-center" style={{ background: `${accent}14`, border: `1px solid ${accent}40` }}>
        <div className="text-xs text-[#9b95ad]">Dinheiro parado neste incidente</div>
        <div className="text-4xl font-extrabold mt-1" style={{ color: accent }}>{brl(total)}</div>
        <div className="text-xs text-[#9b95ad] mt-2">Com o SAPLINK detectando em minutos, o impacto cai para <b className="text-emerald-300">{brl(Math.round(total * 0.08))}</b>.</div>
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

function SimLiveOps({ accent, steps, demo }: { accent: string; steps: string[]; demo: Demo }) {
  const [p, setP] = useState(0); // 0..100
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (p >= 100) { setRunning(false); return; }
    const t = setTimeout(() => setP((x) => Math.min(100, x + 4)), 80);
    return () => clearTimeout(t);
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
          { l: "Detectados", v: String(rows.length), live: true },
          { l: "Resolvidos", v: `${resolved}/${rows.length}`, live: true },
          { l: "Tempo", v: done ? demo.kpis.time : "…", hl: true },
          { l: "Impacto", v: done ? demo.kpis.impact : "…", hl: true },
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
                  {ok ? `✓ ${r[2]}` : proc ? "processando…" : "pendente"}
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
          <div className="text-xs text-[#9b95ad] mt-1">{demo.kpis.auto} automático · {demo.kpis.time}</div>
        </div>
      )}

      <button onClick={start} disabled={running} className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 cursor-pointer" style={{ background: accent }}>
        {running ? `Processando… ${p}%` : done ? "▶ Rodar de novo" : `▶ ${demo.action}`}
      </button>
    </div>
  );
}

export interface Trend { label: string; points: number[]; threshold: number; mode: "rise" | "drop"; verdict: string }

function SimTrend({ trend, accent }: { trend: Trend; accent: string }) {
  const [n, setN] = useState(trend.points.length); // já abre desenhado
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (n >= trend.points.length) { setRunning(false); return; }
    const t = setTimeout(() => setN((x) => x + 1), 300);
    return () => clearTimeout(t);
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
        <text x={W - 4} y={y(trend.threshold) - 4} fill="#f87171" fontSize="9" textAnchor="end">limite ({trend.threshold})</text>
        {area && <path d={area} fill="url(#tg)" />}
        {line && <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
        {pts.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === pts.length - 1 ? 4 : 2.5} fill={i === pts.length - 1 && breached ? "#f87171" : accent} />)}
      </svg>
      <div className="rounded-lg px-4 py-3 text-sm" style={{ background: breached ? "#f8717114" : "#34d39914", border: `1px solid ${breached ? "#f8717140" : "#34d39940"}` }}>
        <span className={breached ? "text-rose-300 font-semibold" : "text-emerald-300 font-semibold"}>{done ? trend.verdict : "Reproduzindo a evolução…"}</span>
      </div>
      <button onClick={start} disabled={running} className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 cursor-pointer" style={{ background: accent }}>
        {running ? "Analisando tendência…" : "▶ Reproduzir do início"}
      </button>
    </div>
  );
}

function SimScore() {
  const items = [
    { l: "API OData v2 depreciada em uso", p: 12 },
    { l: "CDS custom não-liberada", p: 8 },
    { l: "Modificação no core (não cloud-ready)", p: 15 },
    { l: "6 custom fields concentrados", p: 6 },
  ];
  const [on, setOn] = useState<boolean[]>([true, true, false, false]);
  const deduct = items.reduce((s, it, i) => s + (on[i] ? it.p : 0), 0);
  const score = Math.max(0, 100 - deduct);
  const color = score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#9b95ad]">Marque os problemas presentes no cliente e veja o Clean Core Score:</p>
      {items.map((it, i) => (
        <label key={i} className="flex items-center justify-between gap-2 bg-[#0f0b1a] rounded-lg px-3 py-2 text-sm cursor-pointer">
          <span className="flex items-center gap-2"><input type="checkbox" checked={on[i]} onChange={() => setOn((o) => o.map((v, j) => j === i ? !v : v))} className="accent-rose-500" /><span className="text-[#e2e0ea]">{it.l}</span></span>
          <span className="text-xs text-rose-300">-{it.p}</span>
        </label>
      ))}
      <div className="rounded-xl p-5 text-center" style={{ background: `${color}14`, border: `1px solid ${color}40` }}>
        <div className="text-xs text-[#9b95ad]">Clean Core Score</div>
        <div className="text-5xl font-extrabold mt-1" style={{ color }}>{score}</div>
        <div className="h-2 bg-white/[0.06] rounded-full mt-3 overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} /></div>
      </div>
    </div>
  );
}

function SimBench() {
  const [up, setUp] = useState(99.2);
  const pct = Math.max(1, Math.min(99, Math.round((up - 97) / (99.99 - 97) * 100)));
  const verdict = pct >= 75 ? ["Top do mercado", "#34d399"] : pct >= 40 ? ["Na média", "#fbbf24"] : ["Abaixo do mercado", "#f87171"];
  return (
    <div className="space-y-4">
      <Slider label="Uptime médio da sua carteira" value={up} min={97} max={99.99} step={0.01} onChange={setUp} suffix="%" />
      <div className="relative h-12 rounded-lg bg-gradient-to-r from-rose-500/30 via-amber-400/30 to-emerald-500/40 border border-white/[0.08]">
        <div className="absolute top-0 bottom-0 w-1 bg-white rounded" style={{ left: `${pct}%` }} />
        <div className="absolute -bottom-6 text-xs font-bold text-white" style={{ left: `calc(${pct}% - 20px)` }}>P{pct}</div>
      </div>
      <div className="text-center pt-5">
        <span className="text-lg font-bold" style={{ color: verdict[1] }}>{verdict[0]}</span>
        <p className="text-xs text-[#9b95ad] mt-1">Sua carteira está no percentil {pct} do mercado SAP (dado anonimizado da rede).</p>
      </div>
    </div>
  );
}

function SimChat() {
  const qa: [string, string][] = [
    ["Quais clientes têm erro agora?", "2 clientes: Agro Nordeste (IFlow SalesOrder FAILED) e Metalúrgica (3 IDocs 51). Sugiro começar pelo Agro — impacto em faturamento."],
    ["Resumo da minha carteira", "8 clientes · health médio 86 · 2 integrações em atenção. Tendência estável na semana."],
    ["Reprocessa os IDocs do cliente Agro", "📝 Criei 7 pedidos de correção para Agro Nordeste. Aprove no painel para o agente executar (BD87)."],
  ];
  const [msgs, setMsgs] = useState<{ r: "u" | "a"; t: string }[]>([]);
  function ask(i: number) { setMsgs((m) => [...m, { r: "u", t: qa[i][0] }, { r: "a", t: qa[i][1] }]); }
  return (
    <div className="space-y-3">
      <div className="bg-[#0f0b1a] rounded-xl p-3 min-h-[140px] space-y-2 border border-white/[0.06]">
        {msgs.length === 0 && <p className="text-xs text-[#6b6580]">Clique numa pergunta abaixo para ver o copiloto responder.</p>}
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

const DEFAULT_STEPS = ["SAP gera o erro", "SAPLINK detecta na hora", "Alerta + diagnóstico IA", "Correção aplicada", "Resolvido"];
const DEFAULT_DEMO: Demo = {
  metric: "Itens em atenção", action: "Resolver itens",
  rows: [["#A-1042", "exemplo de item em erro", "ok"], ["#A-1043", "exemplo de item em erro", "ok"], ["#A-1044", "exemplo de item em erro", "ok"]],
  kpis: { detect: "3", time: "~2 min (vs 40 min manual)", auto: "100%", impact: "0 retrabalho" }, result: "3 itens resolvidos no fluxo simulado.",
};
const DEFAULT_TREND: Trend = { label: "Métrica monitorada ao longo do tempo", points: [10, 12, 14, 18, 25, 38, 60], threshold: 50, mode: "rise", verdict: "Tendência de alta — o SAPLINK avisaria antes de estourar." };

function renderSim(d: FeatureDetail, accent: string, name: string) {
  if (d.sim === "risk") return <SimRisk accent={accent} />;
  if (d.sim === "score") return <SimScore />;
  if (d.sim === "bench") return <SimBench />;
  if (d.sim === "chat") return <SimChat />;
  if (d.sim === "trend") return <SimTrend trend={d.trend || TRENDS[name] || DEFAULT_TREND} accent={accent} />;
  const steps = d.simSteps && d.simSteps.length ? d.simSteps : DEFAULT_STEPS;
  const demo = d.demo || DEMOS[name] || DEFAULT_DEMO;
  return <SimLiveOps accent={accent} steps={steps} demo={demo} />;
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

export const FEATURES: Record<string, FeatureDetail> = {
  "Cockpit de IDoc & filas": {
    intro: "Um painel único com os IDocs em erro (BD87), filas qRFC/tRFC travadas (SMQ1/2) e dumps (ST22) de TODOS os clientes — sem logar em cada SAP.",
    flow: [["Agente lê o SAP", "Coletor on-premise lê status localmente"], ["Empurra por HTTPS", "Só tráfego de saída, sem abrir portas"], ["Painel multi-cliente", "Tudo numa tela, priorizado"], ["Ação 1-clique", "Reprocessa com aprovação"]],
    cases: [["−70% tempo", "de triagem matinal — uma tela em vez de 8 SAPs"], ["100% visível", "IDocs 51/64 e filas SYSFAIL num lugar só"]],
    implement: ["Suba o Agente Docker na rede do cliente (5 min)", "Cole o token gerado no SAPLINK", "Pronto: o snapshot começa a aparecer"],
    sim: "fail", simSteps: ["7 IDocs entram em erro 51", "SAPLINK mostra no cockpit", "Você clica em Reprocessar (BD87)", "Agente executa o RBDMANI2", "IDocs status 53 — resolvido"],
  },
  "Remediação autônoma": {
    intro: "Correções comuns (reprocessar IDoc, destravar fila, reexecutar tRFC) com aprovação e trilha de auditoria — ou 100% automáticas no AMS Autônomo.",
    flow: [["Detecta o item", "IDoc/fila remediável"], ["Você aprova", "Ou auto-executa por política"], ["Agente executa", "BD87 / SMQ2 / SM58"], ["Reporta o antes/depois", "Com log completo"]],
    cases: [["L1 quase zero", "as correções rotineiras saem sem humano"], ["Auditável", "quem pediu, quem aprovou, resultado"]],
    implement: ["Agente instalado", "Defina as ações permitidas", "(Opcional) ligue o piloto automático com confiança mínima"],
    sim: "fail", simSteps: ["Fila qRFC trava (SYSFAIL)", "SAPLINK identifica como remediável", "Aprovação (ou auto)", "Agente destrava (SMQ2)", "Fila vazia — resolvido"],
  },
  "Catálogo de interfaces": {
    intro: "Inventário vivo de parceiros (WE20), destinos RFC (SM59), message types e serviços OData — descoberto e atualizado sozinho.",
    flow: [["Descoberta automática", "O agente varre o landscape"], ["Catálogo sempre atual", "Sem planilha manual"], ["Base de impacto", "Saiba o que conversa com o quê"]],
    cases: [["Onboarding em minutos", "mapa do cliente pronto no dia 1"], ["Doc que não envelhece", "atualiza a cada ciclo"]],
    implement: ["Agente instalado", "O catálogo se popula sozinho", "Use para análise de impacto"],
    sim: "fail", simSteps: ["Agente conecta no SAP", "Descobre 9 interfaces (WE20/SM59)", "Monta o catálogo", "Detecta nova interface amanhã", "Catálogo atualizado sozinho"],
  },
  "Alertas em tempo real": {
    intro: "Detecção e resolução automática: o que quebra vira alerta priorizado por severidade, com dedup e auto-resolução quando recupera.",
    flow: [["Sinal de falha", "CPI/IDoc/probe"], ["Alerta priorizado", "Severidade + dedup"], ["Notifica", "On-call e ticket"], ["Auto-resolve", "quando recupera"]],
    cases: [["Nada no vácuo", "alerta cai no canal certo"], ["Fila limpa", "sem enxurrada de duplicados"]],
    implement: ["Conecte CPI/agente", "Configure canais", "Pronto: alertas começam a fluir"],
    sim: "fail", simSteps: ["IFlow falha no CPI", "Alerta HIGH criado", "Slack do plantão recebe", "IA sugere correção", "IFlow recupera — alerta resolve sozinho"],
  },
  "Copiloto da carteira": {
    intro: "Pergunte em português sobre todos os clientes e integrações. Resposta acionável citando nomes — não um chatbot solto.",
    flow: [["Você pergunta", "Linguagem natural"], ["IA lê a carteira", "Clientes, integrações, alertas"], ["Responde acionável", "Cita nomes e a ação"]],
    cases: [["Sem montar relatório", "visão da carteira na hora"], ["Onboarding instantâneo", "quem chega já 'pergunta'"]],
    implement: ["Já vem pronto", "Pergunte na tela 'Pergunte à IA'", "Configure a IA (Ollama/Claude) no ambiente"],
    sim: "chat",
  },
  "Diagnóstico + SAP Notes": {
    intro: "A IA lê o erro real e devolve causa raiz, passos de correção (com transação SAP) e a SAP Note provável. Sai como relatório e PDF.",
    flow: [["Pega o erro real", "MPL/IDoc"], ["IA analisa", "Causa + contexto + histórico"], ["Entrega o plano", "Passos + transação + Nota"], ["PDF pronto", "Anexa no chamado"]],
    cases: [["Diagnóstico em segundos", "padronizado e completo"], ["Júnior produz como sênior", "a IA guia"]],
    implement: ["Conecte a fonte (CPI/agente)", "Clique 'Diagnosticar com IA'", "Configure a IA no ambiente"],
    sim: "fail", simSteps: ["Erro: Sold-to party não encontrado", "IA lê a mensagem", "Causa raiz: BP inexistente", "Passos: criar BP (XD01) + checar IFlow", "Relatório + PDF gerado"],
  },
  "Previsão de falha": {
    intro: "Analisa a tendência (latência, erro, profundidade de fila) e avisa antes do incidente virar parada.",
    flow: [["Coleta histórico", "Métricas no tempo"], ["Detecta tendência", "Anomalia subindo"], ["Avisa antes", "Janela em vez de incidente"]],
    cases: [["Fim do apaga-incêndio", "age na janela de manutenção"], ["Menos quebra de SLA", "antecipa o problema"]],
    implement: ["Conecte as integrações", "O histórico se acumula", "O radar passa a prever"],
    sim: "trend",
  },
  "Digest semanal por IA": {
    intro: "Toda semana a IA escreve o resumo da saúde da carteira (panorama, atenção, recomendações) e envia por e-mail com a sua marca.",
    flow: [["IA analisa a semana", "Toda a carteira"], ["Escreve o resumo", "Tom executivo"], ["Envia white-label", "Com sua marca"]],
    cases: [["Prova de valor recorrente", "sem esforço"], ["Relacionamento ativo", "cliente vê o trabalho"]],
    implement: ["Configure o e-mail (Resend)", "Defina o dia do envio", "A IA cuida do resto"],
    sim: "chat",
  },
  "SLA por cliente": {
    intro: "Metas de uptime/latência por cliente, compliance medido e relatório mensal narrado por IA — material de C-level.",
    flow: [["Define a meta", "Por cliente"], ["Mede o compliance", "Contínuo"], ["IA narra o relatório", "Resultado + quebras + ações"]],
    cases: [["Renova com dado", "não com opinião"], ["Relatório sem trabalho", "pronto pra reunião"]],
    implement: ["Defina metas por cliente", "Conecte as integrações", "Gere o relatório de SLA (PDF)"],
    sim: "risk",
  },
  "Impacto em R$": {
    intro: "Traduz cada falha em dinheiro parado agora — custo de parada por hora por integração + documentos fiscais bloqueados, por processo.",
    flow: [["Define custo/hora", "Por integração"], ["Soma o tempo parado", "Ao vivo"], ["Mostra R$ em risco", "Por processo de negócio"]],
    cases: [["Prioriza pelo caixa", "não pelo alerta barulhento"], ["Justifica o contrato", "valor em R$"]],
    implement: ["Defina custo/hora e processo", "O cálculo roda ao vivo", "Mostre ao diretor"],
    sim: "risk",
  },
  "Benchmark de mercado": {
    intro: "Compara a saúde da sua carteira com o mercado SAP (anonimizado). Munição comercial e de board.",
    flow: [["Coleta anônima", "Da rede de clientes"], ["Calcula percentil", "Por setor/métrica"], ["Mostra onde você está", "vs o mercado"]],
    cases: [["Argumento de board", "número, não achismo"], ["Mostra evolução", "subiu de percentil"]],
    implement: ["Já vem pronto", "Quanto mais clientes, mais preciso", "Use na conversa comercial"],
    sim: "bench",
  },
  "Portal do cliente": {
    intro: "Portal white-label read-only onde o cliente final vê a saúde das próprias integrações — transparência que fideliza.",
    flow: [["Você publica", "Com sua marca"], ["Cliente acessa", "Read-only, seguro"], ["Vê a saúde", "Sem te perguntar"]],
    cases: [["Menos 'e aí, como tá?'", "cliente se autoatende"], ["Sua marca na frente", "branding constante"]],
    implement: ["Ative o portal do cliente", "Personalize a marca", "Compartilhe o link"],
    sim: "chat",
  },
  "Radar de Upgrade": {
    intro: "Inventaria as APIs que você realmente usa e cruza com o que será depreciado/quebrado no próximo release do S/4HANA Cloud.",
    flow: [["Lê o uso real", "APIs OData consumidas"], ["Cruza com o release", "O que muda/depreca"], ["Mapeia ao seu uso", "Plano de migração"]],
    cases: [["Upgrade sem surpresa", "2×/ano sob controle"], ["Evita parada pós-upgrade", "sabe o que migrar"]],
    implement: ["Conecte o S/4HANA Cloud", "O radar inventaria o uso", "Gere o plano com IA"],
    sim: "score",
  },
  "Clean Core Score": {
    intro: "A métrica que a própria SAP cobra: o quão aderente ao padrão está o core, com pontuação e plano de remediação.",
    flow: [["Avalia o core", "APIs, CDS, modificações"], ["Calcula o score", "0 a 100"], ["Plano de remediação", "Priorizado"]],
    cases: [["Vira serviço recorrente", "governança contínua"], ["Prepara o upgrade", "core mais limpo"]],
    implement: ["Conecte o S/4HANA Cloud", "Veja o score", "Reduza as deduções de maior peso"],
    sim: "score",
  },
  "Fiscal DRC (NF-e)": {
    intro: "Monitora documentos fiscais (NF-e/NFS-e/CT-e): rejeição SEFAZ, contingência e fila — com valor em R$ e reprocesso.",
    flow: [["Lê os documentos", "DRC/eDocument"], ["Sinaliza bloqueados", "Rejeição/contingência"], ["Reprocessa", "Pelo SAPLINK"]],
    cases: [["Faturamento não para", "vê o bloqueio na hora"], ["Mata o mercado BR", "diferencial fiscal"]],
    implement: ["Conecte o S/4HANA Cloud (DRC)", "Acompanhe o R$ em risco", "Reprocesse os bloqueados"],
    sim: "risk",
  },
  "Event Mesh + CPI/AIF": {
    intro: "Puxa os Message Processing Logs reais do CPI e os eventos do Event Mesh — falhas, dead-letter e lag — com erro detalhado e IA.",
    flow: [["Conecta no CPI/BTP", "OAuth, sem instalar"], ["Puxa MPL/eventos", "Reais"], ["Alerta + erro detalhado", "Com diagnóstico IA"]],
    cases: [["Vê o que a nuvem esconde", "MPL real"], ["Detecção ao vivo", "falha → alerta na hora"]],
    implement: ["Cole o service key do CPI", "Sincronize", "Falhas viram alerta + IA"],
    sim: "fail", simSteps: ["IFlow processa mensagem", "Falha no receiver (HTTP 500)", "SAPLINK puxa o MPL", "Erro detalhado capturado", "Alerta + diagnóstico IA"],
  },
  "On-call multicanal": {
    intro: "Alertas viram notificação no canal certo (Slack/Teams/Webhook/e-mail), com severidade e escalonamento automático.",
    flow: [["Alerta dispara", "Por severidade"], ["Notifica o canal", "Slack/Teams/e-mail"], ["Escala se ninguém responde", "Para o líder"]],
    cases: [["Nada cai no vácuo", "plantão organizado"], ["MTTR menor", "resposta mais rápida"]],
    implement: ["Adicione os canais", "Defina severidade mínima", "Configure o tempo de escalonamento"],
    sim: "fail", simSteps: ["Falha CRITICAL", "Slack do plantão recebe", "Sem resposta em 30 min", "Escala para o líder", "Incidente atendido"],
  },
  "Tickets Jira/ServiceNow": {
    intro: "O alerta abre o chamado automaticamente no seu ITSM e fecha sozinho quando a integração recupera.",
    flow: [["Alerta vira ticket", "Jira/ServiceNow"], ["Time trata", "No ITSM de sempre"], ["Fecha sozinho", "Quando recupera"]],
    cases: [["Zero retrabalho", "abre/fecha sozinho"], ["ITSM coerente", "métrica confiável"]],
    implement: ["Conecte Jira/ServiceNow", "Defina a severidade mínima", "Pronto: alertas viram chamados"],
    sim: "fail", simSteps: ["Falha detectada", "Abre INC-4521 no ServiceNow", "Time trata", "Integração recupera", "Ticket fecha sozinho"],
  },
  "Radar de validade": {
    intro: "Certificados TLS (detectados automaticamente), senhas e tokens com expiração — antes de virarem incidente.",
    flow: [["Detecta certificados", "Automático"], ["Acompanha expiração", "Senhas e tokens"], ["Avisa antes", "Com antecedência"]],
    cases: [["Evita a parada mais boba", "algo que expirou"], ["Planeja a renovação", "sem correria"]],
    implement: ["Conecte os endpoints", "Cadastre segredos com validade", "Acompanhe o radar"],
    sim: "fail", simSteps: ["Certificado vence em 7 dias", "Radar marca como CRITICAL", "Notifica o time", "Renovação agendada", "Incidente evitado"],
  },
  "Rede Federada de Falhas": {
    intro: "O \"Waze do SAP\": cada falha e a correção que funcionou viram conhecimento anônimo compartilhado entre todos os clientes. Quando algo quebra, você já tem a correção vencedora.",
    flow: [["Falha acontece", "Em qualquer cliente"], ["Vira assinatura anônima", "Sem expor identidade"], ["Correção é registrada", "Com taxa de sucesso"], ["A rede te responde", "\"resolvido Nx, fix vencedor X\""]],
    cases: [["Efeito de rede", "fica mais inteligente a cada cliente"], ["89% de acerto", "na correção vencedora típica"]],
    implement: ["Já vem ativo", "Cada falha alimenta a rede sozinha", "Use a correção sugerida"],
    sim: "fail", simSteps: ["Erro 'Sold-to party' no seu cliente", "SAPLINK normaliza a assinatura", "Consulta a rede: visto 37×", "Correção vencedora: criar BP (89%)", "Você aplica e resolve"],
  },
  "Causa raiz cross-camada": {
    intro: "Cruza os transports (STMS, on-premise) com as falhas de CPI/IDoc que vieram depois e aponta a mudança que provavelmente causou. Só o SAPLINK tem as duas camadas juntas.",
    flow: [["Lê transports", "On-premise"], ["Lê falhas de nuvem", "CPI/IDoc"], ["Correlaciona no tempo", "Janela após o import"], ["Aponta a causa", "Com % de confiança"]],
    cases: [["Causa em minutos", "não em horas"], ["Único no mercado", "ninguém junta as 2 camadas"]],
    implement: ["Agente + CPI conectados", "A correlação roda sozinha", "Veja em 'Causa cross-camada'"],
    sim: "fail", simSteps: ["Transport DEVK900231 → PRD", "2h depois: IFlow falha", "SAPLINK correlaciona", "Causa provável: 80%", "Reverte/corrige o transport"],
  },
  "AMS Autônomo": {
    intro: "Detecta → diagnostica → corrige → mede → aprende. Correções de alta confiança são aplicadas sozinhas, com rollback e rastro. A confiança vem da Rede Federada.",
    flow: [["Detecta o item", "Remediável"], ["Confiança da rede", "≥ limiar?"], ["Auto-executa", "Com guardrails"], ["Mede e aprende", "Placar de autonomia"]],
    cases: [["L1/L2 quase zero", "rotina sem humano"], ["% sem humano", "número vendável"]],
    implement: ["Agente instalado", "Ligue o piloto automático", "Defina confiança mínima e ações"],
    sim: "fail", simSteps: ["IDocs 51 à noite", "Confiança da rede: 94%", "Acima do limiar → auto", "Agente reprocessa (BD87)", "Resolvido sem humano"],
  },
  "Dinheiro em risco (ao vivo)": {
    intro: "Traduz cada falha técnica em R$ parados agora — custo de parada por hora + documentos fiscais bloqueados, por processo de negócio.",
    flow: [["Custo/hora por integração", "Você define"], ["Soma tempo parado", "Ao vivo"], ["Agrupa por processo", "R$ em risco"]],
    cases: [["Linguagem de CFO", "muda a conversa de venda"], ["Prioriza pelo caixa", "não pelo alerta"]],
    implement: ["Defina custo/hora e processo", "Cálculo roda ao vivo", "Mostre ao diretor"],
    sim: "risk",
  },
  "Reconciliação ponta-a-ponta": {
    intro: "\"Entregue\" não é \"virou negócio\". Rastreia o documento pela jornada (pedido → ordem → fatura) e mostra onde o volume se perde.",
    flow: [["Define a jornada", "Estágios esperados"], ["Conta cada estágio", "Volume real"], ["Mostra o funil", "Onde some"], ["Aponta o vazamento", "Investigue aqui"]],
    cases: [["Pega o sumiço silencioso", "diz 'sucesso' mas não nasceu"], ["Garante o faturamento", "o que entrou, faturou"]],
    implement: ["Defina os estágios do processo", "O funil é calculado", "Ataque o maior vazamento"],
    sim: "fail", simSteps: ["1.000 pedidos entram", "998 viram ordem", "Só 940 geram fatura", "60 perdidos: Ordem → Fatura", "Investigue esse trecho"],
  },
  "Remediação generativa": {
    intro: "A IA não só descreve o problema — escreve a correção pronta (Groovy, mapeamento, filtro OData) para você colar e aplicar.",
    flow: [["Lê a falha", "Erro real"], ["Gera o artefato", "Código pronto"], ["Você revisa e aplica", "Cola no CPI/SAP"], ["Valida", "Conforme a IA indica"]],
    cases: [["De 'explica' a 'resolve'", "em segundos"], ["Qualidade padronizada", "entre analistas"]],
    implement: ["Conecte a fonte", "Clique 'Gerar correção pronta'", "Configure a IA no ambiente"],
    sim: "fail", simSteps: ["Falha no IFlow", "IA lê o erro", "Escreve o Groovy de correção", "Você cola no artefato", "Testa — resolvido"],
  },
  "ChatOps por WhatsApp": {
    intro: "Opere o SAP por mensagem (WhatsApp/Telegram). A IA entende, executa o que é leitura e pede aprovação para o que mexe no SAP.",
    flow: [["Você manda a mensagem", "Em português"], ["IA entende a intenção", "Mapeia a ação"], ["Executa ou pede aprovação", "Seguro"], ["Responde no chat", "Resultado"]],
    cases: [["Operação na palma", "sem abrir painel"], ["Plantão de qualquer lugar", "pelo WhatsApp"]],
    implement: ["Gere o token de canal", "Aponte o webhook do WhatsApp/Telegram", "Comece a operar por mensagem"],
    sim: "chat",
  },
  "Perda silenciosa de negócio": {
    intro: "Alerta quando o volume cai muito abaixo do normal — mesmo com tudo verde tecnicamente. Captura a receita parando antes de virar reclamação.",
    flow: [["Aprende o volume normal", "Por fluxo"], ["Compara com agora", "Última hora"], ["Queda anormal?", "Dispara alerta"]],
    cases: [["Vê o que o monitor não vê", "tudo verde, receita caindo"], ["Antecipa o problema", "antes do cliente ligar"]],
    implement: ["Conecte CPI/integrações", "O baseline se forma sozinho", "Investigue os alertas de queda"],
    sim: "trend",
  },
  "Pré-voo de mudança": {
    intro: "Antes de um transport ir pra produção, o SAPLINK calcula o raio de impacto (interfaces, processos, R$/h) e um score de risco — pra você testar o que importa antes de subir.",
    flow: [["Lê o transport", "Descrição + alvo"], ["Mapeia o raio", "Catálogo + integrações"], ["Calcula risco + R$", "Score 0-100"], ["Plano de teste", "O que validar"]],
    cases: [["Sem surpresa pós-deploy", "testa o certo antes"], ["Decisão em segundos", "score + plano prontos"]],
    implement: ["Agente conectado (STMS)", "Escolha o transport a subir", "Siga o plano de teste antes do import"],
    sim: "fail", simSteps: ["Lê o transport", "Mapeia o raio", "Calcula risco + R$", "Gera plano de teste"],
    demo: { metric: "Raio de impacto · DEVK900231 (user-exit MIGO)", action: "Calcular blast radius", rows: [["IF_SalesOrder", "interface no raio", "afetada"], ["IDoc ORDERS05", "mensagem no raio", "afetada"], ["Faturamento", "processo de negócio", "R$ 45k/h em risco"]], kpis: { detect: "3 no raio", time: "score 78 (ALTO)", auto: "plano de teste", impact: "R$ 45k/h" }, result: "Mudança de risco ALTO — valide Faturamento antes de subir." },
  },
  "Time machine de incidente": {
    intro: "Reconstrói a linha do tempo de um incidente (mudanças, falhas, alertas) e mostra o contrafactual: quanto teria sido economizado com detecção mais rápida.",
    flow: [["Escolhe o incidente", "Um alerta"], ["Monta a timeline", "Eventos em volta"], ["Calcula o impacto", "R$ do tempo parado"], ["E se?", "R$ salvo com detecção rápida"]],
    cases: [["Prova de ROI", "número irrefutável na renovação"], ["Aprende a causa", "o que disparou tudo"]],
    implement: ["Conecte as fontes", "Escolha o incidente", "Use o contrafactual de R$ com o cliente"],
    sim: "fail", simSteps: ["14:00 transport → PRD", "14:20 começa a falhar", "16:30 detectado (modo antigo)", "Calcula o contrafactual"],
    demo: { metric: "Linha do tempo — IFlow SalesOrder", action: "Reproduzir incidente", rows: [["14:00", "transport DEVK900231 → PRD", "mudança"], ["14:20", "IFlow começa a falhar", "falha"], ["16:30", "detectado (modo antigo)", "2h30 parado"]], kpis: { detect: "3 eventos", time: "2h30 parado", auto: "contrafactual", impact: "R$ 104k evitável" }, result: "Com detecção em 5 min: R$ 8k em vez de R$ 112k — R$ 104k salvos." },
  },
  "Auditoria & Compliance": {
    intro: "Trilha unificada de mudanças (transports) e remediações (quem pediu/aprovou), com checagem de segregação de função (SoD) e pacote de evidências pronto pro auditor.",
    flow: [["Registra mudanças", "Transports + ações"], ["Cruza autor/aprovador", "Checagem SoD"], ["Sinaliza violações", "Em vermelho"], ["Gera evidências", "Pacote pro auditor"]],
    cases: [["Auditor feliz", "evidência pronta, sem planilha"], ["Pega o SoD", "mesma pessoa pediu e aprovou"]],
    implement: ["Já vem ativo", "Revise as violações em vermelho", "Gere o pacote de evidências com IA"],
    sim: "fail", simSteps: ["Lê transports e remediações", "Cruza quem pediu × aprovou", "Marca violações SoD", "Monta o pacote"],
    demo: { metric: "Trilha de mudanças & remediações", action: "Rodar verificação SoD", rows: [["DEVK900231", "jsilva → PRD", "registrado"], ["REPROCESS_IDOC", "msouza pediu E aprovou", "⚠ SoD"], ["UNLOCK_QUEUE", "ana → aprov: carlos", "ok"]], kpis: { detect: "3", time: "instantâneo", auto: "SoD check", impact: "1 violação" }, result: "1 violação de SoD detectada — pacote de evidências pronto." },
  },
  "Parceiros EDI": {
    intro: "Ranqueia os parceiros EDI por quem manda dado ruim — pra você cobrar o parceiro certo, não a sua TI.",
    flow: [["Agrega por parceiro", "IDocs/itens"], ["Conta erros", "Por parceiro"], ["Ranqueia", "% dos erros"], ["Aponta o ofensor", "Quem cobrar"]],
    cases: [["Cobra o certo", "o fornecedor, não a TI"], ["Dado, não achismo", "% dos erros por parceiro"]],
    implement: ["Agente conectado", "Os parceiros aparecem sozinhos", "Aja sobre o pior colocado"],
    sim: "fail", simSteps: ["Agrega itens por parceiro", "Conta erros", "Ranqueia por impacto", "Aponta o ofensor"],
    demo: { metric: "Confiabilidade de parceiro EDI", action: "Calcular ranking", rows: [["KU_FORNEC22", "18 erros · 41% do total", "score 38"], ["LS_ECCCLNT100", "7 erros · 16%", "score 71"], ["KU_CLIENTE01", "2 erros · 5%", "score 92"]], kpis: { detect: "3 parceiros", time: "instantâneo", auto: "ranking", impact: "1 ofensor" }, result: "KU_FORNEC22 causa 41% dos erros — cobre esse parceiro." },
  },
  "FinOps de BTP": {
    intro: "Liga o volume de mensagens ao custo de consumo do BTP e flagra o IFlow desgovernado queimando crédito.",
    flow: [["Conta mensagens", "Por IFlow"], ["Aplica a tarifa", "Custo estimado"], ["Ranqueia por custo", "Quem gasta mais"], ["Flagra desperdício", "IFlow em loop"]],
    cases: [["Controle de gasto", "fim da surpresa na fatura BTP"], ["Acha o desperdício", "IFlow desgovernado"]],
    implement: ["Conecte o CPI", "Ajuste a tarifa (BTP_RATE_CENTS_PER_1K)", "Acompanhe o custo por IFlow"],
    sim: "fail", simSteps: ["Conta mensagens por IFlow", "Aplica a tarifa", "Ranqueia por custo", "Flagra o desgovernado"],
    demo: { metric: "Custo de BTP por IFlow (30 dias)", action: "Estimar consumo", rows: [["SalesOrder_Replication", "43.200 msg", "R$ 13/mês"], ["SapLink (timer)", "1.000.000 msg", "⚠ R$ 312/mês"], ["IF_Material_Sync", "8.100 msg", "R$ 2/mês"]], kpis: { detect: "3 IFlows", time: "30 dias", auto: "estimativa", impact: "R$ 327/mês" }, result: "SapLink (timer) sozinho = R$ 312/mês — IFlow desgovernado." },
  },
  "Transports (STMS)": {
    intro: "Acompanha os transports importados e correlaciona automaticamente com as falhas que vieram depois (provável causa).",
    flow: [["Lê os transports", "STMS"], ["Cruza com falhas", "Janela de tempo"], ["Aponta a causa", "Com confiança"]],
    cases: [["Causa em minutos", "não em horas"], ["Fim do ping-pong", "nuvem × ABAP"]],
    implement: ["Agente instalado", "Os transports aparecem", "Veja a correlação na tela 'Causa cross-camada'"],
    sim: "fail", simSteps: ["Transport DEVK900231 vai pra PRD", "2h depois: IFlow falha", "SAPLINK correlaciona", "Aponta: provável causa (80%)", "Você reverte/corrige o transport"],
  },
};

// Dados fictícios dos simuladores (mini-painéis com resultado)
export const DEMOS: Record<string, Demo> = {
  "Cockpit de IDoc & filas": {
    metric: "IDocs em erro · cliente Agro Nordeste", action: "Reprocessar tudo (BD87)",
    rows: [["90004412", "ORDERS05 · status 51", "status 53"], ["90004415", "DESADV01 · status 64", "processado"], ["TID_A0F12", "tRFC SYSFAIL", "reexecutado"], ["90004418", "INVOIC02 · status 51", "status 53"]],
    kpis: { detect: "4", time: "~3 min (vs 1h20 manual)", auto: "com aprovação", impact: "−96% tempo" }, result: "4 itens reprocessados — fila zerada.",
  },
  "Remediação autônoma": {
    metric: "Itens remediáveis em aberto", action: "Reprocessar/destravar",
    rows: [["90004412", "IDoc 51 — registro não gravado", "status 53"], ["SAPLINK_OUT_3", "fila qRFC SYSFAIL", "destravada"], ["TID_B7A91", "tRFC CPICERR", "reexecutado"]],
    kpis: { detect: "3", time: "~2 min", auto: "100%", impact: "R$ 0 de retrabalho" }, result: "3 correções aplicadas com log e antes/depois.",
  },
  "Alertas em tempo real": {
    metric: "Alertas abertos agora", action: "Notificar + acompanhar",
    rows: [["CPI", "SalesOrder_Replication FAILED", "notificado"], ["IDOC", "3 IDocs 51 (Metalúrgica)", "ticket aberto"], ["TLS", "cert vence em 7 dias", "agendado"]],
    kpis: { detect: "3", time: "< 1 min p/ notificar", auto: "dedup + auto-resolve", impact: "MTTR −40%" }, result: "3 alertas roteados ao canal certo, sem duplicar.",
  },
  "Diagnóstico + SAP Notes": {
    metric: "Falhas aguardando diagnóstico", action: "Diagnosticar com IA",
    rows: [["MPL_88231", "HTTP 500 — Sold-to party", "causa: BP inexistente"], ["MPL_88240", "timeout no receiver", "causa: endpoint fora"], ["IDoc 90004412", "status 51", "causa: conta contábil"]],
    kpis: { detect: "3", time: "~8 s por diagnóstico", auto: "causa + Nota + PDF", impact: "júnior produz como sênior" }, result: "3 diagnósticos com causa raiz e passos de correção.",
  },
  "Event Mesh + CPI/AIF": {
    metric: "Mensagens CPI/Eventos (BTP)", action: "Sincronizar MPL",
    rows: [["AGo1QDIL…", "SalesOrder_Replication FAILED", "erro capturado"], ["evt.salesorder", "dead-letter", "reenfileirado"], ["AGo1P-V1R…", "SapLink COMPLETED", "ok"]],
    kpis: { detect: "30 MPL", time: "tempo real", auto: "erro detalhado + IA", impact: "vê o que a nuvem esconde" }, result: "Falhas reais do CPI viram alerta + diagnóstico.",
  },
  "On-call multicanal": {
    metric: "Incidente em escalonamento", action: "Disparar on-call",
    rows: [["#INC-01", "CRITICAL — IFlow fora", "Slack plantão"], ["#INC-01", "sem resposta em 30 min", "escalou p/ líder"], ["#INC-01", "reconhecido", "em atendimento"]],
    kpis: { detect: "1", time: "imediato", auto: "escalonamento", impact: "nada no vácuo" }, result: "Incidente notificado e escalado automaticamente.",
  },
  "Tickets Jira/ServiceNow": {
    metric: "Alertas → chamados", action: "Sincronizar tickets",
    rows: [["INC-4521", "IFlow SalesOrder FAILED", "aberto"], ["INC-4522", "3 IDocs em erro", "aberto"], ["INC-4521", "integração recuperou", "fechado sozinho"]],
    kpis: { detect: "2", time: "automático", auto: "abre e fecha", impact: "zero retrabalho" }, result: "Chamados abertos e fechados em sincronia com a realidade.",
  },
  "AMS Autônomo": {
    metric: "Correções de alta confiança", action: "Piloto automático",
    rows: [["90004412", "IDoc 51 — conf. rede 94%", "auto-resolvido"], ["SAPLINK_OUT_3", "fila SYSFAIL — conf. 91%", "auto-resolvido"], ["90004418", "IDoc 51 — conf. 96%", "auto-resolvido"]],
    kpis: { detect: "3", time: "madrugada, sem humano", auto: "100%", impact: "L1/L2 ≈ 0" }, result: "3 correções aplicadas sozinhas, com rollback e rastro.",
  },
  "Causa raiz cross-camada": {
    metric: "Falhas correlacionadas a mudanças", action: "Correlacionar",
    rows: [["SalesOrder_Replication", "falhou 14:20", "← transp. DEVK900231 (80%)"], ["IF_Bank_Payment", "falhou 14:35", "← transp. DEVK900231 (72%)"], ["IF_Material_Sync", "ok", "sem correlação"]],
    kpis: { detect: "2", time: "minutos (vs horas)", auto: "score de confiança", impact: "fim do ping-pong" }, result: "Causa provável apontada: transport DEVK900231.",
  },
  "Transports (STMS)": {
    metric: "Transports recentes em PRD", action: "Analisar impacto",
    rows: [["DEVK900231", "user-exit MIGO (ZMM)", "⚠ correlacionado a 2 falhas"], ["DEVK900228", "estrutura IDoc ORDERS05", "ok"], ["DEVK900219", "mapeamento CPI", "ok"]],
    kpis: { detect: "3", time: "automático", auto: "correlação", impact: "causa em minutos" }, result: "1 transport sob suspeita, ligado a 2 falhas.",
  },
  "Reconciliação ponta-a-ponta": {
    metric: "Funil: Pedido → Ordem → Fatura (24h)", action: "Reconciliar jornada",
    rows: [["Pedido (CPI)", "1.000 entraram", "1.000"], ["Ordem (S/4)", "998 criadas", "−2"], ["Fatura", "940 emitidas", "−58 ⚠"]],
    kpis: { detect: "1.000", time: "tempo real", auto: "detecção de gap", impact: "94% conclusão" }, result: "58 documentos perdidos entre Ordem → Fatura.",
  },
  "Remediação generativa": {
    metric: "Falhas → correção pronta", action: "Gerar correção (IA)",
    rows: [["SalesOrder_Replication", "Sold-to party não encontrado", "Groovy gerado"], ["IF_Bank_Payment", "campo BUKRS vazio", "mapeamento gerado"], ["API_SALES v2", "depreciada", "filtro v4 gerado"]],
    kpis: { detect: "3", time: "~10 s", auto: "código pronto", impact: "de 'explica' a 'resolve'" }, result: "3 correções escritas pela IA, prontas pra colar.",
  },
  "Catálogo de interfaces": {
    metric: "Landscape auto-descoberto", action: "Descobrir interfaces",
    rows: [["LS_ECCCLNT100", "parceiro lógico (WE20)", "mapeado"], ["PI_PROD", "destino RFC (SM59)", "mapeado"], ["API_SALES_ORDER_SRV", "serviço OData", "mapeado"]],
    kpis: { detect: "9", time: "automático", auto: "atualiza sozinho", impact: "doc que não envelhece" }, result: "9 interfaces inventariadas sem planilha manual.",
  },
  "Radar de validade": {
    metric: "Certificados e segredos", action: "Reavaliar validade",
    rows: [["e-CPF NF-e", "vence em 7 dias", "⚠ CRÍTICO"], ["TLS dev.hub", "vence em 24 dias", "atenção"], ["Token CPI", "vence em 90 dias", "ok"]],
    kpis: { detect: "3", time: "automático", auto: "alerta antecipado", impact: "evita a parada mais boba" }, result: "1 certificado crítico sinalizado a tempo.",
  },
  "Rede Federada de Falhas": {
    metric: "Assinaturas de falha na rede", action: "Consultar a rede",
    rows: [["Sold-to party not found", "visto 37× / 12 clientes", "fix: criar BP (89%)"], ["BUKRS vazio", "visto 14× / 6 clientes", "fix: mapear de-para (81%)"], ["timeout receiver", "visto 9× / 5 clientes", "fix: retry+backoff (76%)"]],
    kpis: { detect: "60 falhas", time: "instantâneo", auto: "anonimizado", impact: "fica + esperto a cada cliente" }, result: "Correção vencedora sugerida por assinatura.",
  },
};

export const TRENDS: Record<string, Trend> = {
  "Previsão de falha": { label: "Profundidade da fila qRFC (últimas horas)", points: [8, 11, 13, 19, 28, 41, 58], threshold: 50, mode: "rise", verdict: "⚠ Vai estourar em ~2h — o SAPLINK avisa antes do incidente." },
  "Perda silenciosa de negócio": { label: "Pedidos/hora (tudo verde tecnicamente)", points: [62, 60, 58, 40, 28, 22, 18], threshold: 30, mode: "drop", verdict: "⚠ Queda de ~70% no volume — receita parando, sem nenhum erro técnico." },
};

const FALLBACK: FeatureDetail = {
  intro: "Capacidade do SAPLINK para operação de integrações SAP.",
  flow: [["Conecta", "Agente ou OData"], ["Monitora", "Em tempo real"], ["Age", "Com IA e aprovação"]],
  cases: [["Mais controle", "menos incidente"]],
  implement: ["Conecte a fonte", "Acompanhe no painel", "Aja pelas recomendações"],
  sim: "fail",
};

// ---------- Modal ----------

export default function FeatureModal({ feature, onClose, onInterest }: { feature: { icon: string; name: string; tagline: string; accent: string } | null; onClose: () => void; onInterest: () => void }) {
  useEffect(() => {
    if (!feature) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [feature, onClose]);
  if (!feature) return null;
  const d = FEATURES[feature.name] || FALLBACK;
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9b95ad] mb-3">Como funciona</h3>
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#9b95ad] mb-3">🎮 Simulador interativo</h3>
              <div className="bg-[#1a1527] border rounded-xl p-4" style={{ borderColor: `${accent}30` }}>
                {renderSim(d, accent, feature.name)}
              </div>
            </div>
          </div>

          {/* Cases */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9b95ad] mb-3">Resultados reais</h3>
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#9b95ad] mb-3">Como implementar na sua empresa</h3>
            <ol className="space-y-2">
              {d.implement.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#d6d3e0]"><span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span><span className="pt-0.5">{s}</span></li>
              ))}
            </ol>
          </div>

          {/* CTA */}
          <div className="rounded-xl p-5 text-center bg-gradient-to-br from-purple-600/20 to-cyan-500/15 border border-purple-500/30">
            <p className="font-semibold text-[#e2e0ea] mb-3">Quer ver isso rodando no SAP do seu cliente?</p>
            <button onClick={() => { onClose(); onInterest(); }} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold cursor-pointer">Tenho interesse →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
