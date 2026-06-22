"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getPublicPlans, submitLead } from "@/lib/api";
import FeatureModal from "@/components/landing/FeatureModal";

interface Plan {
  key: string; name: string; description?: string; priceCents: number;
  maxClients: number; maxIntegrations: number; maxAiDiagnosticsPerMonth: number; maxUsers: number; highlight?: boolean;
}
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const NAV = [
  { id: "problema", label: "Problema" },
  { id: "cobertura", label: "Cobertura" },
  { id: "como", label: "Como funciona" },
  { id: "plataforma", label: "Plataforma" },
  { id: "inovacao", label: "Inovação" },
  { id: "s4", label: "S/4HANA Cloud" },
  { id: "planos", label: "Planos" },
  { id: "faq", label: "FAQ" },
];

// Faixa de números (capacidades reais, não métricas de clientes)
const METRICS = [
  ["18+", "produtos SAP cobertos"],
  ["20+", "capacidades na plataforma"],
  ["13", "diferenciais que ninguém tem"],
  ["0", "portas abertas no cliente"],
];

// Tudo o que o SAPLINK enxerga do universo SAP
const COVERAGE: [string, string, string][] = [
  ["☁️", "S/4HANA Cloud", "Upgrade, Clean Core, APIs"],
  ["🗄️", "ECC / S/4 on-prem", "via Agente (RFC/IDoc)"],
  ["🔀", "CPI / Cloud Integration", "Message Processing Logs"],
  ["🧩", "AIF", "Application Interface Framework"],
  ["📨", "Event Mesh", "dead-letter, lag"],
  ["🛒", "Ariba", "suppliers, reporting"],
  ["👥", "SuccessFactors", "User, EmpJob"],
  ["✈️", "Concur", "despesas, relatórios"],
  ["🧰", "Fieldglass", "força de trabalho externa"],
  ["🎧", "CX (Sales/Service)", "C4C OData"],
  ["🛍️", "Commerce", "OCC API"],
  ["🔗", "API Management", "proxies publicados"],
  ["🪐", "BTP Cockpit", "keys, destinations, quotas"],
  ["🔁", "PI/PO", "channels, backlog"],
  ["🩺", "Basis & HANA", "jobs, dumps, locks, memória"],
  ["📑", "B2B / EDI (TPM)", "parceiros e acordos"],
  ["🧾", "Fiscal BR", "NF-e, CT-e, SPED, eSocial"],
  ["🚚", "Transports (STMS)", "blast radius"],
];

const STEPS = [
  ["1", "Conecte", "Agente Docker (RFC/IDoc) só com saída HTTPS, ou Communication Arrangement no S/4HANA Cloud. Zero porta aberta."],
  ["2", "Enxergue", "Saúde de todas as integrações de todos os clientes num painel multi-cliente, em tempo real."],
  ["3", "Antecipe & corrija", "IA diagnostica, prevê falhas e remedia (com aprovação) — IDoc, fila, RFC, fiscal."],
  ["4", "Prove valor", "SLA por cliente, impacto em R$ e portal white-label. Você vira o radar do SAP do cliente."],
];

const FLOW = ["SAP do cliente", "Agente / Conector", "Plataforma SAPLINK", "Painéis & Portal"];

const GROUPS = [
  ["Operação", "#22d3ee", [["🛰️", "Cockpit de IDoc & filas", "BD87 + SMQ + SM58 num painel multi-cliente"], ["✨", "Remediação autônoma", "Reprocessa/destrava com aprovação e log"], ["📚", "Catálogo de interfaces", "Landscape auto-descoberto (WE20/SM59)"], ["🔔", "Alertas em tempo real", "Detecção e resolução automática"]]],
  ["Inteligência IA", "#a78bfa", [["💬", "Copiloto da carteira", "Pergunte em linguagem natural"], ["🤖", "Diagnóstico + SAP Notes", "Causa raiz e a Nota provável"], ["🔮", "Previsão de falha", "Anomalia antes de quebrar"], ["📬", "Digest semanal por IA", "Resumo white-label no e-mail"]]],
  ["Valor & SLA", "#34d399", [["📈", "SLA por cliente", "Compliance + relatório por IA"], ["💰", "Impacto em R$", "Custo da parada por hora"], ["🏆", "Benchmark de mercado", "Sua carteira vs percentil"], ["🪪", "Portal do cliente", "White-label, read-only"]]],
  ["S/4HANA Cloud", "#fbbf24", [["🚀", "Radar de Upgrade", "O que quebra no próximo release"], ["🧼", "Clean Core Score", "A métrica que a SAP cobra"], ["🧾", "Fiscal DRC (NF-e)", "Rejeição SEFAZ, contingência"], ["📨", "Event Mesh + CPI/AIF", "Dead-letter, lag, MPL"]]],
  ["Resposta & Confiança", "#f87171", [["📣", "On-call multicanal", "Slack/Teams/Webhook/e-mail + escalonamento"], ["🎫", "Tickets Jira/ServiceNow", "Alerta vira chamado e fecha sozinho"], ["📡", "Radar de validade", "Certificados e segredos vencendo"], ["🚚", "Transports (STMS)", "Correlaciona incidente x transporte"]]],
];

// Diferenciais que não existem em nenhum outro sistema de monitoramento SAP
const INNOVATIONS = [
  ["🛰️", "Rede Federada de Falhas", "O \"Waze do SAP\"", "Cada falha e a correção que funcionou viram conhecimento anônimo da rede. Quando algo quebra no seu cliente, o SAPLINK já sabe a correção vencedora — porque viu acontecer em dezenas de outros ambientes.", "Fica mais inteligente a cada cliente (efeito de rede)."],
  ["🔗", "Causa raiz cross-camada", "On-prem + nuvem juntos", "Cruza os transports (STMS) com as falhas de CPI/IDoc que vieram depois e aponta a mudança que provavelmente causou. Ninguém mais tem as duas camadas no mesmo lugar.", "Achar a causa em minutos, não em horas."],
  ["🤖", "AMS Autônomo", "Self-healing que aprende", "Detecta → diagnostica → corrige → mede → aprende. Correções de alta confiança são aplicadas sozinhas (com rollback e rastro). A confiança vem da Rede Federada.", "Reduz o L1/L2 manual a quase zero."],
  ["💸", "Dinheiro em risco (ao vivo)", "Linguagem de CFO", "Traduz cada falha técnica em R$ parados agora — custo de parada por hora + documentos fiscais bloqueados, por processo de negócio.", "Muda a conversa de venda de técnica para financeira."],
  ["🔁", "Reconciliação ponta-a-ponta", "Entregue ≠ virou negócio", "Rastreia o documento pela jornada (pedido → ordem → fatura) e mostra onde o volume se perde. Pega a falha silenciosa que diz \"sucesso\" mas o objeto nunca nasceu.", "Acha o vazamento que nenhum monitor vê."],
  ["⚙️", "Remediação generativa", "A IA escreve a correção", "Não só descreve o problema — entrega o artefato pronto (Groovy, mapeamento, filtro OData) para colar e aplicar.", "De \"explica\" para \"resolve\" em segundos."],
  ["💬", "ChatOps por WhatsApp", "Opere o SAP por mensagem", "\"Reprocessa os IDocs do cliente X\" pelo WhatsApp/Telegram — a IA entende, age e pede aprovação para o que mexe no SAP.", "Operação na palma da mão, sem abrir o painel."],
  ["📉", "Perda silenciosa de negócio", "Radar de receita", "Alerta quando o volume cai muito abaixo do normal — mesmo com tudo verde tecnicamente. Captura a receita parando antes de virar reclamação.", "Vê o prejuízo que o monitor técnico não vê."],
  ["🧨", "Pré-voo de mudança", "Blast radius antes do deploy", "Antes do transport ir pra PRD, mostra o raio de impacto (interfaces, processos, R$) e o score de risco — com plano de teste.", "Acaba com a surpresa pós-upgrade."],
  ["⏪", "Time machine de incidente", "Replay + 'e se?'", "Reconstrói a linha do tempo do incidente e mostra quanto seria economizado com detecção mais rápida.", "Prova de ROI irrefutável."],
  ["🛡️", "Auditoria & Compliance", "SoD automático", "Trilha de mudanças e remediações + checagem de segregação de função, com evidências prontas pro auditor.", "Compliance sem montar planilha."],
  ["🤝", "Parceiros EDI", "Quem manda dado ruim", "Ranqueia parceiros por frequência de erro — pra cobrar o fornecedor certo, não a sua TI.", "Munição pra cobrar o parceiro."],
  ["💵", "FinOps de BTP", "Custo de nuvem por IFlow", "Liga volume ao consumo do BTP e flagra o IFlow desgovernado queimando crédito.", "Fim da surpresa na fatura do BTP."],
];

const FAQ = [
  ["Preciso abrir portas no SAP do cliente?", "Não. OData/REST é monitorado direto; RFC/IDoc usa o Agente Docker com tráfego só de saída. No S/4HANA Cloud, conecta por Communication Arrangement (OAuth) — nada instalado no cliente."],
  ["Funciona com S/4HANA Cloud?", "Sim — é o nosso carro-chefe: Radar de Upgrade, Clean Core Score, Fiscal DRC, Event Mesh e CPI/AIF, via APIs liberadas."],
  ["Os dados ficam seguros?", "Credenciais cifradas em repouso, isolamento multi-tenant por consultoria, e nenhuma ação no SAP roda sem aprovação humana (com log)."],
  ["É white-label?", "Sim. Logo e cor da sua consultoria na interface, nos relatórios e no portal do cliente final."],
  ["Como vende para a minha consultoria?", "Como serviço mensal de monitoramento e governança por cliente — receita recorrente, retenção e prova de valor em R$."],
];

function InterestModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
            <h3 className="text-xl font-bold text-white">Recebemos seu interesse!</h3>
            <p className="text-[#9b95ad] mt-2">Nosso time entra em contato em breve. Obrigado!</p>
            <button onClick={onClose} className="mt-6 px-5 py-2.5 rounded-lg bg-white/[0.08] text-[#e2e0ea] hover:bg-white/[0.14] cursor-pointer">Fechar</button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Tenho interesse</h3>
                <p className="text-sm text-[#9b95ad] mt-1">Deixe seus dados e o time de vendas fala com você.</p>
              </div>
              <button onClick={onClose} aria-label="Fechar" className="text-[#9b95ad] hover:text-white text-2xl leading-none cursor-pointer">×</button>
            </div>
            <form onSubmit={send} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
              <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nome *" className="inp sm:col-span-2" />
              <input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="E-mail *" className="inp" />
              <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Telefone / WhatsApp" className="inp" />
              <input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Empresa / Consultoria" className="inp" />
              <input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder="Seu cargo" className="inp" />
              <select value={f.employees} onChange={(e) => setF({ ...f, employees: e.target.value })} className="inp sm:col-span-2">
                <option value="">Quantos clientes SAP você atende?</option>
                <option>1 a 5</option><option>6 a 20</option><option>21 a 50</option><option>50+</option>
              </select>
              <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="O que você procura? (opcional)" rows={3} className="inp sm:col-span-2" />
              {state === "err" && <p className="sm:col-span-2 text-sm text-rose-400">Não foi possível enviar. Tente de novo.</p>}
              <button type="submit" disabled={state === "sending"} className="sm:col-span-2 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold disabled:opacity-50 cursor-pointer">
                {state === "sending" ? "Enviando..." : "Enviar interesse"}
              </button>
            </form>
          </>
        )}
      </div>
      <style jsx>{`.inp{background:#0f0b1a;border:1px solid rgba(255,255,255,.1);border-radius:.6rem;padding:.6rem .8rem;font-size:.9rem;color:#e2e0ea;width:100%}.inp:focus{outline:none;border-color:rgba(124,58,237,.6)}`}</style>
    </div>
  );
}

// ── Fundo de rede neural animado (canvas) — sensação de landscape de integrações vivo ──
function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0; let w = 0, h = 0;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const N = typeof window !== "undefined" && window.innerWidth < 640 ? 28 : 56;
    type P = { x: number; y: number; vx: number; vy: number };
    let pts: P[] = [];
    const seed = () => { pts = Array.from({ length: N }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 })); };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!pts.length) seed();
    };
    resize();
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y; const d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130) {
            const o = (1 - Math.sqrt(d2) / 130) * 0.5;
            ctx.strokeStyle = `rgba(124,58,237,${o})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = "rgba(34,211,238,0.8)";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    if (reduce) { draw(); cancelAnimationFrame(raf); } else { raf = requestAnimationFrame(draw); }
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full -z-10 opacity-70" aria-hidden />;
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

const FEED = [
  "IA corrigiu 3 IDocs travados · sem intervenção",
  "Alerta CRITICAL em CPI · diagnóstico em 4s",
  "NF-e rejeitada reprocessada · SEFAZ OK",
  "Fila qRFC destravada · 0 pendências",
  "Runbook aplicado · 'Sold-to not found'",
];

function LivePanel() {
  const base: [string, number, string][] = [
    ["S/4HANA Cloud · OData", 98, "#34d399"],
    ["CPI · Pedidos B2B", 94, "#34d399"],
    ["IDoc · INVOIC02", 71, "#fbbf24"],
    ["RFC · PI_PROD", 88, "#34d399"],
    ["Event Mesh · BP", 62, "#f87171"],
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
          <span className="ml-2 text-xs text-[#9b95ad]">SAPLINK · carteira ao vivo</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "slk-pulse 1.4s infinite" }} />LIVE</span>
        </div>
        <div className="p-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs text-[#9b95ad]">Saúde da carteira</p>
              <p className="text-4xl font-extrabold slk-grad tabular-nums">{health}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#9b95ad]">Em risco agora</p>
              <p className="text-xl font-bold text-amber-300 tabular-nums">R$ {risk.toFixed(1).replace(".", ",")}k</p>
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

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [interest, setInterest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feature, setFeature] = useState<{ icon: string; name: string; tagline: string; accent: string } | null>(null);

  useEffect(() => { getPublicPlans().then((p) => setPlans(Array.isArray(p) ? p : [])).catch(() => {}); }, []);
  const cta = (label: string, primary = true, cls = "") => (
    <button onClick={() => setInterest(true)} className={`${primary ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.12]"} px-6 py-3 rounded-lg font-semibold transition cursor-pointer ${cls}`}>{label}</button>
  );

  return (
    <div className="min-h-screen bg-[#0f0b1a] text-[#e2e0ea] overflow-x-hidden">
      <InterestModal open={interest} onClose={() => setInterest(false)} />
      <FeatureModal feature={feature} onClose={() => setFeature(null)} onInterest={() => setInterest(true)} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0b1a]/85 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-3">
          <a href="#top" className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent shrink-0">◆ SAPLINK</a>
          <nav className="hidden lg:flex items-center gap-6 text-sm text-[#9b95ad]">
            {NAV.map((n) => <a key={n.id} href={`#${n.id}`} className="hover:text-white transition">{n.label}</a>)}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/login" className="px-3 sm:px-4 py-2 text-sm text-[#e2e0ea] hover:text-white transition">Entrar</Link>
            <button onClick={() => setInterest(true)} className="px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition cursor-pointer whitespace-nowrap">Tenho interesse</button>
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" className="lg:hidden text-[#e2e0ea] p-1 cursor-pointer">☰</button>
          </div>
        </div>
        {menuOpen && (
          <nav className="lg:hidden border-t border-white/[0.06] bg-[#0f0b1a] px-4 py-3 flex flex-col gap-2 text-sm text-[#9b95ad]">
            {NAV.map((n) => <a key={n.id} href={`#${n.id}`} onClick={() => setMenuOpen(false)} className="py-1.5 hover:text-white">{n.label}</a>)}
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
        @media (prefers-reduced-motion: reduce){ .slk-grad,.slk-float,.slk-bar,.slk-marquee{animation:none!important} }
      `}</style>

      <main id="top" className="max-w-6xl mx-auto px-4 sm:px-5">
        {/* Hero */}
        <section className="pt-14 pb-12 sm:pt-20 sm:pb-16 relative">
          <NetworkCanvas />
          <div className="absolute inset-0 -z-10 opacity-50" style={{ background: "radial-gradient(700px 360px at 50% -5%, rgba(124,58,237,.28), transparent), radial-gradient(500px 300px at 90% 10%, rgba(34,211,238,.16), transparent)" }} />
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs text-purple-200 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: "slk-pulse 1.6s ease-in-out infinite" }} /> 18+ produtos SAP · IA de ponta a ponta · white-label
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.05]">
                Inove a operação<br />de <RotatingWord words={["S/4HANA Cloud", "Ariba & SF", "CPI & AIF", "BTP", "fiscal BR", "todo o SAP"]} /><br />da sua consultoria
              </h1>
              <p className="text-base sm:text-lg text-[#c9c5d6] max-w-xl mx-auto lg:mx-0 mt-6 leading-relaxed">
                Um só painel que <b className="text-white">monitora, prevê, corrige e prova valor em R$</b> em todo o landscape SAP do cliente — do IDoc clássico ao S/4HANA Cloud, Ariba, SuccessFactors, BTP e fiscal brasileiro.
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-8">
                {cta("Quero inovar minha operação →", true, "shadow-[0_0_30px_rgba(124,58,237,0.35)]")}
                <a href="#cobertura" className="px-6 py-3 rounded-lg bg-white/[0.06] text-[#e2e0ea] font-semibold hover:bg-white/[0.12] transition">Ver tudo que cobrimos</a>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start mt-7 text-xs text-[#6b6580]">
                <span>✓ Sem abrir portas no cliente</span><span>✓ Multi-cliente</span><span>✓ Pronto em dias, não meses</span>
              </div>
            </div>
            <LivePanel />
          </div>

          {/* Faixa de métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12">
            {METRICS.map(([n, l]) => (
              <div key={l} className="slk-tilt rounded-xl bg-[#1a1527] border border-white/[0.08] p-4 text-center">
                <div className="text-3xl font-extrabold slk-grad tabular-nums"><CountUp value={n} /></div>
                <div className="text-xs text-[#9b95ad] mt-1">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Cobertura SAP */}
        <section id="cobertura" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold mb-4">COBERTURA TOTAL</span>
            <h2 className="text-2xl sm:text-4xl font-bold">Todo o universo SAP do seu cliente. Numa tela.</h2>
            <p className="text-[#9b95ad] mt-3">Integração clássica, nuvem, LoB, plataforma, Basis e fiscal brasileiro — o concorrente cobre um pedaço; o SAPLINK cobre o conjunto.</p>
          </div>
          {/* marquee contínuo de produtos */}
          <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <div className="slk-marquee gap-3 py-1">
              {[...COVERAGE, ...COVERAGE].map(([ic, name], i) => (
                <span key={i} className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-[#c9c5d6]"><span>{ic}</span>{name}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {COVERAGE.map(([ic, name, sub], i) => (
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
        <section id="problema" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">O reativo custa cliente e margem</h2>
          <p className="text-[#9b95ad] max-w-3xl leading-relaxed">Integração SAP quebra em silêncio e o cliente descobre antes de você. O time vive apagando incêndio, sem visão única, e fica difícil provar o valor entregue. O SAPLINK inverte o jogo.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[["Antes", "IDoc travado, RFC caída, NF-e parada — descoberto tarde demais."], ["Sem o SAPLINK", "Planilha, transação por transação, cliente por cliente. Não escala."], ["Com o SAPLINK", "Radar único, alertas, IA e prova de valor em R$. Você no controle."]].map((c, i) => (
              <div key={i} className={`rounded-xl p-5 border ${i === 2 ? "bg-gradient-to-br from-purple-600/15 to-cyan-500/10 border-purple-500/30" : "bg-[#1a1527] border-white/[0.08]"}`}>
                <p className={`font-semibold ${i === 2 ? "text-cyan-300" : "text-[#e2e0ea]"}`}>{c[0]}</p>
                <p className="text-sm text-[#9b95ad] mt-1 leading-relaxed">{c[1]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona + fluxo */}
        <section id="como" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Como funciona</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
            {FLOW.map((s, i) => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div className="flex-1 bg-[#1a1527] border border-purple-500/30 rounded-xl px-4 py-4 text-center text-sm font-semibold">{s}</div>
                {i < FLOW.length - 1 && <span className="text-purple-400 text-xl rotate-90 sm:rotate-0 mx-auto">→</span>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
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
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Uma plataforma, tudo que a operação SAP precisa</h2>
          <p className="text-[#9b95ad] mb-8">Mais de 20 capacidades — do cockpit clássico à IA e ao S/4HANA Cloud.</p>
          <div className="space-y-5">
            {GROUPS.map(([title, accent, feats]) => (
              <div key={title as string} className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: accent as string }} />
                  <h3 className="font-bold text-lg" style={{ color: accent as string }}>{title as string}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(feats as string[][]).map((f) => (
                    <button key={f[1]} onClick={() => setFeature({ icon: f[0], name: f[1], tagline: f[2], accent: accent as string })} className="slk-tilt text-left bg-[#0f0b1a] rounded-xl p-4 border border-white/[0.05] hover:border-white/[0.2] hover:bg-white/[0.02] group cursor-pointer">
                      <div className="text-2xl mb-1.5">{f[0]}</div>
                      <p className="font-semibold text-sm">{f[1]}</p>
                      <p className="text-xs text-[#9b95ad] mt-1 leading-relaxed">{f[2]}</p>
                      <p className="text-[11px] mt-2 font-medium opacity-0 group-hover:opacity-100 transition" style={{ color: accent as string }}>Ver detalhes, simulador e como implementar →</p>
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
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold mb-4">CARRO-CHEFE</span>
            <h2 className="text-2xl sm:text-4xl font-bold">Pronto para o <span className="text-amber-300">S/4HANA Cloud</span></h2>
            <p className="text-[#c9c5d6] max-w-3xl mt-3 leading-relaxed">A edição que a SAP empurra em todo mundo — sem GUI, upgrade forçado 2×/ano e API-first. O SAPLINK cobre exatamente o que falta, conectando por <b className="text-white">Communication Arrangement</b> (OAuth), sem instalar nada.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {[["🚀", "Radar de Upgrade", "O que vai quebrar no próximo release — mapeado ao que você usa."], ["🧼", "Clean Core Score", "A métrica que a própria SAP cobra, com plano de remediação."], ["🧾", "Fiscal DRC", "NF-e/SEFAZ: rejeição, contingência e reprocesso. Mata o mercado BR."], ["📨", "Event Mesh + CPI/AIF", "Dead-letter, lag e Message Processing Logs reais."]].map((c) => (
                <div key={c[1]} className="bg-[#0f0b1a]/60 rounded-xl p-4 border border-white/[0.08]">
                  <div className="text-2xl mb-1.5">{c[0]}</div>
                  <p className="font-semibold text-sm text-amber-200">{c[1]}</p>
                  <p className="text-xs text-[#9b95ad] mt-1 leading-relaxed">{c[2]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inovação — diferenciais únicos (no ar) */}
        <section id="inovacao" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold mb-4">🦄 EXCLUSIVO · NO AR</span>
          <h2 className="text-2xl sm:text-4xl font-bold mb-2">O que não existe em nenhum outro sistema</h2>
          <p className="text-[#9b95ad] mb-8 max-w-3xl">Treze diferenciais que viram moat: efeito de rede, dado cross-camada que só nós temos, autonomia, reconciliação, IA que escreve a correção, operação por WhatsApp, pré-voo de mudança, time machine, auditoria, FinOps e a linguagem do CFO. Clique pra explorar com simulador.</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {INNOVATIONS.map((g) => (
              <button key={g[1]} onClick={() => setFeature({ icon: g[0], name: g[1], tagline: g[2], accent: "#a78bfa" })} className="slk-tilt text-left bg-gradient-to-br from-purple-600/10 to-cyan-500/[0.06] border border-purple-500/25 rounded-2xl p-6 hover:border-purple-500/60 group cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{g[0]}</span>
                  <div>
                    <p className="font-bold text-lg">{g[1]}</p>
                    <p className="text-xs text-cyan-300">{g[2]}</p>
                  </div>
                </div>
                <p className="text-sm text-[#c9c5d6] leading-relaxed">{g[3]}</p>
                <p className="text-sm text-emerald-300 mt-3 flex items-center gap-1.5"><span>📈</span>{g[4]}</p>
                <p className="text-[11px] mt-3 text-purple-300 opacity-0 group-hover:opacity-100 transition">Abrir detalhes + simulador →</p>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/funcionalidades" className="inline-block px-6 py-3 rounded-lg bg-white/[0.08] text-[#e2e0ea] font-semibold hover:bg-white/[0.14] transition">
              Ver todas as funcionalidades em detalhe, com exemplos e ganhos →
            </Link>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Planos</h2>
          <p className="text-[#9b95ad] mb-2">Add-ons de integração e usuário extra. Cobrança automática ou avulsa.</p>
          <p className="text-sm text-[#c9c5d6] mb-8">🎁 <b>1ª mensalidade grátis</b> nos planos Business e Enterprise · Pro com <b>50% OFF</b> no 1º mês · fidelidade mínima de 3 meses (veja o <Link href="/contrato" className="text-purple-300 underline">contrato</Link>).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {plans.map((p) => (
              <div key={p.key} className={`relative bg-[#1a1527] rounded-xl p-5 border flex flex-col ${p.highlight ? "border-purple-500/60 shadow-[0_0_25px_rgba(124,58,237,0.15)]" : "border-white/[0.08]"}`}>
                {p.highlight && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white whitespace-nowrap">MAIS POPULAR</span>}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-2xl font-bold mt-1">{brl(p.priceCents)}<span className="text-sm font-normal text-[#9b95ad]">/mês</span></p>
                {p.description && <p className="text-xs text-[#9b95ad] mt-2 min-h-[32px]">{p.description}</p>}
                <ul className="text-sm text-[#c9c5d6] mt-4 space-y-1.5 flex-1">
                  <li>✓ {p.maxClients >= 999 ? "Clientes ilimitados" : `${p.maxClients} clientes`}</li>
                  <li>✓ {p.maxIntegrations >= 999 ? "Integrações ilimitadas" : `${p.maxIntegrations} integrações`}</li>
                  <li>✓ {p.maxAiDiagnosticsPerMonth} diagnósticos IA/mês</li>
                  <li>✓ {p.maxUsers} usuários</li>
                </ul>
                <button onClick={() => setInterest(true)} className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold ${p.highlight ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-white/[0.08] text-[#e2e0ea] hover:bg-white/[0.14]"} cursor-pointer`}>Tenho interesse</button>
              </div>
            ))}
            {plans.length === 0 && <p className="text-[#9b95ad] text-sm">Carregando planos...</p>}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Perguntas frequentes</h2>
          <div className="max-w-3xl space-y-3">
            {FAQ.map((f, i) => (
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

        {/* CTA final */}
        <section className="py-14 sm:py-20 border-t border-white/[0.06]">
          <div className="rounded-2xl p-8 sm:p-12 text-center bg-gradient-to-br from-purple-600/20 to-cyan-500/15 border border-purple-500/30">
            <h2 className="text-2xl sm:text-4xl font-bold">Pare de apagar incêndio. Comece a operar.</h2>
            <p className="text-[#c9c5d6] mt-3 max-w-xl mx-auto">Deixe seu contato — o time de vendas mostra o SAPLINK no SAP dos seus clientes.</p>
            <div className="mt-7 flex justify-center">{cta("Tenho interesse →")}</div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9b95ad] text-center sm:text-left">
          <span>◆ SAPLINK © {new Date().getFullYear()} — Operação de integrações SAP</span>
          <div className="flex gap-5">
            <Link href="/termos" className="hover:text-white transition">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition">Privacidade</Link>
            <Link href="/contrato" className="hover:text-white transition">Contrato/SLA</Link>
            <button onClick={() => setInterest(true)} className="hover:text-white transition cursor-pointer">Contato</button>
            <Link href="/login" className="hover:text-white transition">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
