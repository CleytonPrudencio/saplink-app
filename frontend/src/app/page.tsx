"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicPlans, submitLead } from "@/lib/api";

interface Plan {
  key: string; name: string; description?: string; priceCents: number;
  maxClients: number; maxIntegrations: number; maxAiDiagnosticsPerMonth: number; maxUsers: number; highlight?: boolean;
}
const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const NAV = [
  { id: "problema", label: "Problema" },
  { id: "como", label: "Como funciona" },
  { id: "plataforma", label: "Plataforma" },
  { id: "s4", label: "S/4HANA Cloud" },
  { id: "planos", label: "Planos" },
  { id: "faq", label: "FAQ" },
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

const IDEAS = [
  ["🧨", "Blast-radius pré-transporte", "Antes de subir um TR, mostre quais interfaces e processos serão afetados."],
  ["🩺", "Self-healing preditivo", "A fila vai estourar em 2h → o sistema propõe agir antes do incidente."],
  ["📉", "Anomalia de negócio", "Tudo verde tecnicamente, mas o volume de pedidos caiu 60% — capture a perda silenciosa."],
  ["🔗", "Lineage de processo", "Um incidente aparece como 'Faturamento travado', não como 'IDoc 51'."],
  ["⚖️", "SLA-as-code", "Crédito/multa de SLA calculados e faturados automaticamente."],
  ["🧠", "Post-mortem por IA", "RCA e runbook escritos sozinhos a cada incidente."],
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

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [interest, setInterest] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { getPublicPlans().then((p) => setPlans(Array.isArray(p) ? p : [])).catch(() => {}); }, []);
  const cta = (label: string, primary = true, cls = "") => (
    <button onClick={() => setInterest(true)} className={`${primary ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.12]"} px-6 py-3 rounded-lg font-semibold transition cursor-pointer ${cls}`}>{label}</button>
  );

  return (
    <div className="min-h-screen bg-[#0f0b1a] text-[#e2e0ea] overflow-x-hidden">
      <InterestModal open={interest} onClose={() => setInterest(false)} />

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

      <main id="top" className="max-w-6xl mx-auto px-4 sm:px-5">
        {/* Hero */}
        <section className="py-16 sm:py-24 text-center relative">
          <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "radial-gradient(600px 300px at 50% 0%, rgba(124,58,237,.25), transparent)" }} />
          <div className="inline-block px-3 py-1 rounded-full bg-white/[0.06] text-xs text-[#9b95ad] mb-5">Operação de integrações SAP · ECC, S/4HANA & S/4HANA Cloud</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
            Opere o SAP dos seus clientes<br className="hidden sm:block" /> <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">sem apagar incêndio</span>
          </h1>
          <p className="text-base sm:text-lg text-[#9b95ad] max-w-2xl mx-auto mt-6">
            A plataforma que <b className="text-[#e2e0ea]">monitora, prevê, corrige e prova valor em R$</b> nas integrações SAP — do IDoc clássico ao S/4HANA Cloud — num só painel multi-cliente, white-label.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {cta("Tenho interesse →")}
            <a href="#plataforma" className="px-6 py-3 rounded-lg bg-white/[0.06] text-[#e2e0ea] font-semibold hover:bg-white/[0.12] transition">Ver funcionalidades</a>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-8 text-xs text-[#6b6580]">
            <span>✓ Sem abrir portas no cliente</span><span>✓ IA aplicada de ponta a ponta</span><span>✓ Multi-cliente & white-label</span><span>✓ Carro-chefe S/4HANA Cloud</span>
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
                    <div key={f[1]} className="bg-[#0f0b1a] rounded-xl p-4 border border-white/[0.05]">
                      <div className="text-2xl mb-1.5">{f[0]}</div>
                      <p className="font-semibold text-sm">{f[1]}</p>
                      <p className="text-xs text-[#9b95ad] mt-1 leading-relaxed">{f[2]}</p>
                    </div>
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

        {/* Ideias / inovação */}
        <section className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">No nosso roadmap: o que ninguém tem</h2>
          <p className="text-[#9b95ad] mb-8">Inovações em construção que transformam operação em vantagem competitiva.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IDEAS.map((g) => (
              <div key={g[1]} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5 hover:border-purple-500/40 transition">
                <div className="text-3xl mb-2">{g[0]}</div>
                <p className="font-semibold">{g[1]}</p>
                <p className="text-sm text-[#9b95ad] mt-1 leading-relaxed">{g[2]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="py-14 sm:py-16 border-t border-white/[0.06]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Planos</h2>
          <p className="text-[#9b95ad] mb-8">Add-ons de integração e usuário extra. Cobrança automática ou avulsa.</p>
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
            <button onClick={() => setInterest(true)} className="hover:text-white transition cursor-pointer">Contato</button>
            <Link href="/login" className="hover:text-white transition">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
