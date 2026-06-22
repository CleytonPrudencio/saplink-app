import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = { title: "Política de Privacidade (LGPD) — SAPLINK" };

const SECTIONS: { t: string; p: string[] }[] = [
  {
    t: "1. Quem somos (Controlador)",
    p: [
      "Esta Política descreve como o SAPLINK trata dados pessoais, em conformidade com a Lei nº 13.709/2018 (LGPD). O SAPLINK atua como Controlador dos dados de cadastro e cobrança da empresa contratante, e como Operador dos dados técnicos de monitoramento que a contratante decide enviar à plataforma.",
      "Contato do Encarregado (DPO): privacidade@saplink.com.br.",
    ],
  },
  {
    t: "2. Quais dados tratamos",
    p: [
      "Dados de cadastro/cobrança: nome, e-mail, telefone, empresa, CNPJ, razão social e endereço — informados pela própria contratante.",
      "Dados de uso: logs de acesso, ações no sistema e métricas de utilização, para segurança e melhoria do serviço.",
      "Dados técnicos de monitoramento: status, latência, taxa de erro, mensagens de erro e metadados de integrações SAP. O SAPLINK NÃO coleta o conteúdo de negócio (payloads) por padrão; quando uma mensagem de erro contém dados, ela é tratada como dado técnico para diagnóstico.",
    ],
  },
  {
    t: "3. Para que usamos (finalidade e base legal)",
    p: [
      "Execução do contrato (art. 7º, V): prestar o monitoramento, gerar alertas, diagnósticos e relatórios.",
      "Legítimo interesse (art. 7º, IX): segurança, prevenção a fraude e melhoria do produto, sempre respeitando os direitos do titular.",
      "Cumprimento de obrigação legal/regulatória (art. 7º, II): emissão fiscal e guarda de registros exigidos por lei.",
      "Consentimento, quando aplicável (ex.: comunicações de marketing), revogável a qualquer momento.",
    ],
  },
  {
    t: "4. Compartilhamento",
    p: [
      "Não vendemos dados pessoais. Compartilhamos apenas com operadores necessários à prestação do serviço (ex.: provedor de pagamento, provedor de e-mail transacional, infraestrutura de nuvem), sob contrato e obrigação de confidencialidade.",
      "Dados podem ser fornecidos a autoridades quando exigido por lei ou ordem judicial.",
    ],
  },
  {
    t: "5. Rede anonimizada (benchmark e correções)",
    p: [
      "Recursos como Benchmark de mercado e Rede Federada de Falhas usam exclusivamente dados ANONIMIZADOS e agregados (assinaturas de erro sem identificadores, contagem por hash). Nenhum dado que identifique a contratante ou seus clientes é exposto a outros tenants.",
    ],
  },
  {
    t: "6. Segurança",
    p: [
      "Adotamos medidas técnicas e organizacionais: criptografia de segredos em repouso, isolamento multi-tenant, controle de acesso por perfil (RBAC), expiração de sessão e registro de auditoria. Nenhuma ação no SAP do cliente é executada sem aprovação (com log).",
    ],
  },
  {
    t: "7. Retenção e eliminação",
    p: [
      "Mantemos os dados pelo tempo necessário às finalidades e às obrigações legais. Encerrado o contrato, os dados de monitoramento são eliminados ou anonimizados em até 90 dias, salvo guarda legal obrigatória. A contratante pode solicitar a exportação dos seus dados antes da eliminação.",
    ],
  },
  {
    t: "8. Direitos do titular (art. 18 da LGPD)",
    p: [
      "Você pode solicitar: confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação, informação sobre compartilhamento e revogação de consentimento.",
      "As solicitações são atendidas pelo canal privacidade@saplink.com.br, normalmente em até 15 dias.",
    ],
  },
  {
    t: "9. Transferência internacional",
    p: [
      "Caso utilizemos provedores fora do Brasil, garantimos salvaguardas adequadas conforme a LGPD (cláusulas contratuais e países com nível de proteção compatível).",
    ],
  },
  {
    t: "10. Cookies",
    p: [
      "Usamos apenas cookies essenciais à autenticação e funcionamento. Não usamos cookies de rastreamento de terceiros para publicidade sem consentimento.",
    ],
  },
  {
    t: "11. Atualizações",
    p: [
      "Esta Política pode ser atualizada; mudanças relevantes serão comunicadas. A versão vigente fica sempre disponível nesta página.",
    ],
  },
];

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-transparent text-[#e2e0ea]">
      <header className="border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={26} /></Link>
          <div className="flex gap-4 text-sm"><Link href="/termos" className="text-[#9b95ad] hover:text-white">Termos</Link><Link href="/contrato" className="text-[#9b95ad] hover:text-white">Contrato/SLA</Link></div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-[#9b95ad] mb-8">Em conformidade com a LGPD (Lei nº 13.709/2018).</p>
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
