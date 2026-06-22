import Link from "next/link";

export const metadata = { title: "Contrato & SLA — SAPLINK" };

const SECTIONS: { t: string; p: string[] }[] = [
  {
    t: "1. Objeto",
    p: [
      "Contratação do SAPLINK, plataforma SaaS de monitoramento e operação de integrações SAP, no plano e add-ons selecionados pela CONTRATANTE no ato da assinatura.",
    ],
  },
  {
    t: "2. Vigência e fidelidade mínima",
    p: [
      "O contrato vigora por prazo indeterminado, com período de FIDELIDADE MÍNIMA de 3 (três) meses a contar da ativação.",
      "O cancelamento antes do fim da fidelidade implica a cobrança das mensalidades restantes do período mínimo. Após os 3 meses, o cancelamento pode ser feito a qualquer momento, sem multa, com aviso de 30 dias.",
    ],
  },
  {
    t: "3. Preço, promoção e reajuste",
    p: [
      "O valor é o vigente no plano escolhido. Promoções (ex.: 1ª mensalidade gratuita) aplicam-se apenas na adesão e não dispensam a fidelidade mínima de 3 meses.",
      "Os valores são reajustados anualmente pela variação do IPCA (ou índice que o substitua).",
    ],
  },
  {
    t: "4. Pagamento e inadimplência",
    p: [
      "A cobrança é mensal (recorrente ou avulsa). O atraso superior ao período de carência suspende o acesso; a reincidência permite a rescisão pela CONTRATADA.",
      "Sobre valores em atraso incidem multa de 2% e juros de 1% ao mês.",
    ],
  },
  {
    t: "5. Nível de Serviço (SLA)",
    p: [
      "Disponibilidade-alvo da plataforma: 99,5% mensal, excluídas janelas de manutenção programada (comunicadas com antecedência) e eventos de força maior.",
      "Suporte: canal por e-mail em horário comercial; incidentes críticos com primeiro retorno em até 4 horas úteis.",
      "Caso a disponibilidade fique abaixo da meta em um mês, a CONTRATANTE faz jus a crédito proporcional na fatura seguinte, mediante solicitação — limitado a 20% da mensalidade.",
    ],
  },
  {
    t: "6. Obrigações da CONTRATANTE",
    p: [
      "Fornecer dados cadastrais verídicos; manter sob sigilo as credenciais; e garantir que possui AUTORIZAÇÃO para monitorar os sistemas SAP dos seus próprios clientes.",
      "Responsabiliza-se pelo uso do Agente on-premise dentro da sua rede e pelas aprovações de ações de remediação.",
    ],
  },
  {
    t: "7. Obrigações da CONTRATADA",
    p: [
      "Prestar o serviço conforme descrito, manter medidas de segurança e confidencialidade, e tratar dados pessoais conforme a Política de Privacidade (LGPD).",
      "Nenhuma ação é executada no SAP da CONTRATANTE/clientes sem aprovação registrada.",
    ],
  },
  {
    t: "8. Proteção de dados (LGPD)",
    p: [
      "As partes cumprem a Lei nº 13.709/2018. A CONTRATADA atua como Operadora dos dados técnicos de monitoramento e Controladora dos dados de cadastro/cobrança, conforme a Política de Privacidade, que integra este contrato.",
    ],
  },
  {
    t: "9. Propriedade e confidencialidade",
    p: [
      "A plataforma, marca e código são de propriedade da CONTRATADA. Os dados da CONTRATANTE permanecem da CONTRATANTE. Ambas mantêm sigilo sobre informações confidenciais a que tiverem acesso.",
    ],
  },
  {
    t: "10. Limitação de responsabilidade",
    p: [
      "A responsabilidade total da CONTRATADA limita-se ao valor das últimas 3 mensalidades pagas. A CONTRATADA não responde por indisponibilidade dos sistemas SAP da CONTRATANTE ou de terceiros.",
    ],
  },
  {
    t: "11. Rescisão",
    p: [
      "Por qualquer parte, respeitada a fidelidade e o aviso de 30 dias. Por descumprimento contratual, mediante notificação e prazo de correção de 10 dias. Encerrado o contrato, aplicam-se as regras de retenção/eliminação da Política de Privacidade.",
    ],
  },
  {
    t: "12. Foro",
    p: [
      "Fica eleito o foro da comarca da sede da CONTRATADA para dirimir questões deste contrato, salvo disposição legal em contrário.",
    ],
  },
];

export default function ContratoPage() {
  return (
    <div className="min-h-screen bg-[#0f0b1a] text-[#e2e0ea]">
      <header className="border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">◆ SAPLINK</Link>
          <div className="flex gap-4 text-sm"><Link href="/termos" className="text-[#9b95ad] hover:text-white">Termos</Link><Link href="/privacidade" className="text-[#9b95ad] hover:text-white">Privacidade</Link></div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-bold mb-2">Contrato & SLA</h1>
        <p className="text-sm text-[#9b95ad] mb-8">Modelo de condições de prestação do serviço SAPLINK. Fidelidade mínima de 3 meses · SLA 99,5%.</p>
        <div className="space-y-7">
          {SECTIONS.map((s) => (
            <section key={s.t}>
              <h2 className="text-lg font-semibold text-[#e2e0ea] mb-2">{s.t}</h2>
              {s.p.map((para, i) => <p key={i} className="text-sm text-[#9b95ad] leading-relaxed mb-2">{para}</p>)}
            </section>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-white/[0.06]"><Link href="/" className="text-purple-400 hover:text-purple-300">← Voltar</Link></div>
      </main>
    </div>
  );
}
