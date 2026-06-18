import Link from "next/link";

export const metadata = { title: "Termos de Uso — SAPLINK" };

const SECTIONS: { t: string; p: string[] }[] = [
  {
    t: "1. Aceitação",
    p: [
      "Ao se cadastrar e utilizar o SAPLINK, a empresa contratante (\"Cliente\") declara ter lido e concordado com estes Termos de Uso. O cadastro é exclusivo para pessoas jurídicas (CNPJ válido).",
    ],
  },
  {
    t: "2. Descrição do serviço",
    p: [
      "O SAPLINK é uma plataforma SaaS de monitoramento da saúde de integrações SAP (OData, REST, RFC, IDoc, SOAP, CPI, arquivo, banco de dados e similares), com alertas, diagnóstico assistido por IA e relatórios.",
      "O monitoramento de conexões on-premise (RFC/IDoc) depende da instalação, pelo Cliente, do Agente fornecido, que realiza apenas tráfego de saída.",
    ],
  },
  {
    t: "3. Planos, cobrança e add-ons",
    p: [
      "O acesso é mediante assinatura mensal do plano escolhido, podendo incluir add-ons (integrações ou usuários extras). A cobrança pode ser automática (recorrente) ou avulsa.",
      "O não pagamento implica suspensão do acesso após o período de carência. A fatura é emitida com base nos dados cadastrais (CNPJ, razão social e endereço informados pelo Cliente).",
    ],
  },
  {
    t: "4. Responsabilidades do Cliente",
    p: [
      "O Cliente é responsável pela veracidade dos dados cadastrais, pela guarda das credenciais de acesso e por garantir que possui autorização para monitorar os sistemas SAP dos seus próprios clientes.",
      "É vedado o uso da plataforma para fins ilícitos ou para acessar sistemas sem autorização.",
    ],
  },
  {
    t: "5. Segurança e dados",
    p: [
      "Credenciais sensíveis são armazenadas criptografadas. Cada Cliente acessa apenas os próprios dados (isolamento multi-tenant). O SAPLINK adota medidas razoáveis de segurança, sem garantir disponibilidade ininterrupta.",
    ],
  },
  {
    t: "6. Limitação de responsabilidade",
    p: [
      "O SAPLINK é uma ferramenta de monitoramento e diagnóstico assistido; as decisões e correções nos sistemas SAP são de responsabilidade do Cliente. O SAPLINK não se responsabiliza por perdas decorrentes de indisponibilidade de terceiros, do SAP do cliente ou de uso indevido.",
    ],
  },
  {
    t: "7. Cancelamento",
    p: [
      "O Cliente pode cancelar a assinatura a qualquer momento pelo painel. O acesso permanece até o fim do período pago.",
    ],
  },
  {
    t: "8. Alterações",
    p: [
      "Estes Termos podem ser atualizados. Alterações relevantes serão comunicadas. O uso continuado após a comunicação implica concordância.",
    ],
  },
  {
    t: "9. Contato",
    p: ["Dúvidas: suporte@saplink.com.br · Vendas: vendas@saplink.com.br"],
  },
];

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#0f0b1a] text-[#e2e0ea]">
      <header className="border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">◆ SAPLINK</Link>
          <Link href="/register" className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white">Criar conta</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-sm text-[#9b95ad] mb-8">Plataforma SAPLINK — válido para pessoas jurídicas.</p>
        <div className="space-y-7">
          {SECTIONS.map((s) => (
            <section key={s.t}>
              <h2 className="text-lg font-semibold text-[#e2e0ea] mb-2">{s.t}</h2>
              {s.p.map((para, i) => (
                <p key={i} className="text-sm text-[#9b95ad] leading-relaxed mb-2">{para}</p>
              ))}
            </section>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-white/[0.06]">
          <Link href="/register" className="text-purple-400 hover:text-purple-300">← Voltar ao cadastro</Link>
        </div>
      </main>
    </div>
  );
}
