"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicPlans } from "@/lib/api";

interface Plan {
  key: string; name: string; description?: string; priceCents: number;
  maxClients: number; maxIntegrations: number; maxAiDiagnosticsPerMonth: number; maxUsers: number;
  highlight?: boolean; addonIntegrationCents?: number; addonUserCents?: number;
}

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const NAV = [
  { id: "sobre", label: "Sobre" },
  { id: "como", label: "Como funciona" },
  { id: "integracoes", label: "Integrações" },
  { id: "ganhos", label: "Para consultorias" },
  { id: "planos", label: "Planos" },
  { id: "faq", label: "FAQ" },
  { id: "contato", label: "Contato" },
];

const INTEGRATIONS = [
  { t: "OData / REST", d: "Monitoramento HTTP direto — latência, status e disponibilidade em tempo real." },
  { t: "RFC / BAPI", d: "Via Agente on-premise: ping RFC, BAPIs e destinos SM59." },
  { t: "IDoc", d: "IDocs em erro (BD87), filas travadas e reprocessamento." },
  { t: "SOAP / PI-PO", d: "Web services e canais do Integration Directory." },
  { t: "CPI / Integration Suite", d: "Message Processing Logs e fluxos na nuvem SAP." },
  { t: "Arquivo / SFTP", d: "Rotinas CNAB, EDI e troca de arquivos." },
  { t: "Banco de dados", d: "Conexões diretas (Protheus/SQL Server, legados)." },
  { t: "Custom", d: "Qualquer endpoint HTTP do cliente." },
];

const STEPS = [
  { n: "1", t: "Cadastre sua consultoria", d: "Crie a conta da empresa, escolha o plano e adicione seus clientes." },
  { n: "2", t: "Conecte as integrações", d: "OData/REST por HTTP; RFC/IDoc pelo Agente Docker (só tráfego de saída, sem abrir portas)." },
  { n: "3", t: "Monitore com IA", d: "Status, latência, alertas automáticos e diagnóstico de causa raiz com IA — em todos os clientes." },
  { n: "4", t: "Entregue valor", d: "Relatórios white-label, SLA e recuperação automática detectada. Você vira o radar do SAP do cliente." },
];

const GANHOS = [
  { i: "💸", t: "Receita recorrente", d: "Cobre uma mensalidade de monitoramento por cliente. Previsível e escalável." },
  { i: "🛡️", t: "Retém clientes", d: "Vira indispensável: o cliente confia em você pra saber a saúde do SAP dele." },
  { i: "⚡", t: "Menos apagar incêndio", d: "Alertas e diagnóstico por IA reduzem o tempo de resposta e o retrabalho." },
  { i: "🎨", t: "White-label", d: "Logo e cor da sua consultoria. O cliente vê a sua marca, não a nossa." },
  { i: "🤖", t: "IA reduz custo", d: "Causa raiz + passos de correção em segundos, não horas de investigação." },
  { i: "📈", t: "Escala sem time", d: "Monitore dezenas de clientes e integrações com a mesma equipe." },
];

const FAQ = [
  { q: "O que o SAPLINK faz?", a: "Monitora a saúde das integrações SAP dos seus clientes (OData, RFC, IDoc, CPI e mais), gera alertas, diagnósticos com IA e relatórios — tudo num painel multi-cliente para consultorias." },
  { q: "Preciso abrir portas no SAP do cliente?", a: "Não. Integrações HTTP (OData/REST) são monitoradas direto. Para RFC/IDoc, o Agente Docker roda na rede do cliente e só faz tráfego de saída (HTTPS) — nenhuma porta de entrada é aberta." },
  { q: "Os dados ficam seguros?", a: "Credenciais SAP são criptografadas em repouso (AES-256-GCM). Cada consultoria só enxerga os próprios clientes (isolamento multi-tenant)." },
  { q: "Como funciona a cobrança?", a: "Planos mensais por consultoria, com cobrança automática (recorrente) ou pagamento avulso. Add-ons para integrações/usuários extras quando o plano lota." },
  { q: "Posso testar antes?", a: "Sim — ao se cadastrar você entra em período de teste e escolhe o plano quando quiser." },
  { q: "Só aceita empresa?", a: "Sim. O cadastro é exclusivo para pessoa jurídica (CNPJ válido) — emitimos a cobrança no CNPJ da consultoria." },
];

export default function LandingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    getPublicPlans().then((p) => setPlans(Array.isArray(p) ? p : [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0b1a] text-[#e2e0ea]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0b1a]/85 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <a href="#top" className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">◆ SAPLINK</a>
          <nav className="hidden lg:flex items-center gap-6 text-sm text-[#9b95ad]">
            {NAV.map((n) => <a key={n.id} href={`#${n.id}`} className="hover:text-white transition">{n.label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm text-[#e2e0ea] hover:text-white transition">Entrar</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 transition">Criar conta</Link>
          </div>
        </div>
      </header>

      <main id="top" className="max-w-6xl mx-auto px-5">
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-white/[0.06] text-xs text-[#9b95ad] mb-5">Monitoramento de integrações SAP · para consultorias</div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight">
            O <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">radar de saúde SAP</span><br />dos seus clientes
          </h1>
          <p className="text-lg text-[#9b95ad] max-w-2xl mx-auto mt-6">
            Monitore OData, RFC, IDoc e CPI de todos os clientes num só painel. Alertas, diagnóstico com IA e relatórios white-label — vire o serviço de monitoramento que a sua consultoria vende.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link href="/register" className="px-7 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold hover:opacity-90 transition">Começar agora →</Link>
            <a href="#como" className="px-7 py-3 rounded-lg bg-white/[0.06] text-[#e2e0ea] font-semibold hover:bg-white/[0.12] transition">Ver como funciona</a>
          </div>
        </section>

        {/* Sobre / modelo de negócio */}
        <section id="sobre" className="py-16 border-t border-white/[0.06]">
          <h2 className="text-3xl font-bold mb-3">Transforme suporte SAP em receita recorrente</h2>
          <p className="text-[#9b95ad] max-w-3xl leading-relaxed">
            Toda consultoria SAP vive apagando incêndio: integração que cai, IDoc travado, RFC fora do ar — e o cliente só descobre quando o negócio para.
            O SAPLINK inverte isso: você monitora proativamente a saúde das integrações de cada cliente, recebe alertas antes do problema escalar e entrega relatórios com a sua marca.
            É um produto pronto pra você <b className="text-[#e2e0ea]">vender como serviço mensal</b> — receita previsível, cliente mais fiel, equipe mais eficiente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { k: "Multi-cliente", v: "Um painel para todas as suas contas" },
              { k: "Multi-tenant seguro", v: "Cada consultoria isolada e criptografada" },
              { k: "White-label", v: "Sua marca na frente do cliente" },
            ].map((c) => (
              <div key={c.k} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5">
                <p className="font-semibold text-[#e2e0ea]">{c.k}</p>
                <p className="text-sm text-[#9b95ad] mt-1">{c.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section id="como" className="py-16 border-t border-white/[0.06]">
          <h2 className="text-3xl font-bold mb-8">Como funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold flex items-center justify-center mb-3">{s.n}</div>
                <p className="font-semibold">{s.t}</p>
                <p className="text-sm text-[#9b95ad] mt-1 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Integrações */}
        <section id="integracoes" className="py-16 border-t border-white/[0.06]">
          <h2 className="text-3xl font-bold mb-2">Integrações suportadas</h2>
          <p className="text-[#9b95ad] mb-8">HTTP direto ou via Agente on-premise (só tráfego de saída).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INTEGRATIONS.map((i) => (
              <div key={i.t} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5">
                <p className="font-semibold text-purple-300">{i.t}</p>
                <p className="text-sm text-[#9b95ad] mt-1 leading-relaxed">{i.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ganhos */}
        <section id="ganhos" className="py-16 border-t border-white/[0.06]">
          <h2 className="text-3xl font-bold mb-8">Por que consultorias usam o SAPLINK</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GANHOS.map((g) => (
              <div key={g.t} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-6">
                <div className="text-3xl mb-3">{g.i}</div>
                <p className="font-semibold">{g.t}</p>
                <p className="text-sm text-[#9b95ad] mt-1 leading-relaxed">{g.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="py-16 border-t border-white/[0.06]">
          <h2 className="text-3xl font-bold mb-2">Planos</h2>
          <p className="text-[#9b95ad] mb-8">Add-ons de integração e usuário extra quando o plano lota. Cobrança automática ou avulsa.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {plans.map((p) => (
              <div key={p.key} className={`relative bg-[#1a1527] rounded-xl p-5 border flex flex-col ${p.highlight ? "border-purple-500/60 shadow-[0_0_25px_rgba(124,58,237,0.15)]" : "border-white/[0.08]"}`}>
                {p.highlight && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-white">MAIS POPULAR</span>}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-2xl font-bold mt-1">{brl(p.priceCents)}<span className="text-sm font-normal text-[#9b95ad]">/mês</span></p>
                {p.description && <p className="text-xs text-[#9b95ad] mt-2 min-h-[32px]">{p.description}</p>}
                <ul className="text-sm text-[#c9c5d6] mt-4 space-y-1.5 flex-1">
                  <li>✓ {p.maxClients >= 999 ? "Clientes ilimitados" : `${p.maxClients} clientes`}</li>
                  <li>✓ {p.maxIntegrations >= 999 ? "Integrações ilimitadas" : `${p.maxIntegrations} integrações`}</li>
                  <li>✓ {p.maxAiDiagnosticsPerMonth} diagnósticos IA/mês</li>
                  <li>✓ {p.maxUsers} usuários</li>
                </ul>
                <Link href="/register" className={`mt-5 w-full py-2.5 rounded-lg text-sm font-semibold text-center ${p.highlight ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white" : "bg-white/[0.08] text-[#e2e0ea] hover:bg-white/[0.14]"}`}>Começar</Link>
              </div>
            ))}
            {plans.length === 0 && <p className="text-[#9b95ad] text-sm">Carregando planos...</p>}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-16 border-t border-white/[0.06]">
          <h2 className="text-3xl font-bold mb-8">Perguntas frequentes</h2>
          <div className="max-w-3xl space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-[#1a1527] border border-white/[0.08] rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                  <span className="font-medium">{f.q}</span>
                  <span className="text-[#9b95ad] text-lg">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && <p className="px-4 pb-4 text-sm text-[#9b95ad] leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Contato / vendas */}
        <section id="contato" className="py-16 border-t border-white/[0.06]">
          <h2 className="text-3xl font-bold mb-2">Fale com o time de vendas</h2>
          <p className="text-[#9b95ad] mb-8">Tira dúvidas, pede uma demo ou negocia plano Enterprise.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="mailto:vendas@saplink.com.br" className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-6 hover:border-purple-500/40 transition">
              <p className="text-2xl mb-2">✉️</p><p className="font-semibold">Vendas</p><p className="text-sm text-[#9b95ad] mt-1">vendas@saplink.com.br</p>
            </a>
            <a href="mailto:suporte@saplink.com.br" className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-6 hover:border-purple-500/40 transition">
              <p className="text-2xl mb-2">🛟</p><p className="font-semibold">Ajuda / Suporte</p><p className="text-sm text-[#9b95ad] mt-1">suporte@saplink.com.br</p>
            </a>
            <Link href="/register" className="bg-gradient-to-br from-purple-600/20 to-cyan-500/20 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition">
              <p className="text-2xl mb-2">🚀</p><p className="font-semibold">Criar conta</p><p className="text-sm text-[#9b95ad] mt-1">Comece em minutos</p>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-8">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9b95ad]">
          <span>◆ SAPLINK © {new Date().getFullYear()} — Monitoramento de integrações SAP</span>
          <div className="flex gap-5">
            <Link href="/termos" className="hover:text-white transition">Termos de Uso</Link>
            <a href="mailto:suporte@saplink.com.br" className="hover:text-white transition">Ajuda</a>
            <Link href="/login" className="hover:text-white transition">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
