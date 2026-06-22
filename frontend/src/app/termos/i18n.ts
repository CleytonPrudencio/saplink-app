import type { Lang } from "@/i18n/I18n";

interface Section { t: string; p: string[] }

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  createAccount: string;
  backToRegister: string;
  termsNav: string;
  contractNav: string;
  privacyNav: string;
  sections: Section[];
}> = {
  pt: {
    title: "Termos de Uso",
    subtitle: "Plataforma SAPLINK — válido para pessoas jurídicas.",
    createAccount: "Criar conta",
    backToRegister: "← Voltar ao cadastro",
    termsNav: "Termos",
    contractNav: "Contrato/SLA",
    privacyNav: "Privacidade",
    sections: [
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
    ],
  },
  en: {
    title: "Terms of Use",
    subtitle: "SAPLINK platform — valid for legal entities only.",
    createAccount: "Create account",
    backToRegister: "← Back to sign-up",
    termsNav: "Terms",
    contractNav: "Contract/SLA",
    privacyNav: "Privacy",
    sections: [
      {
        t: "1. Acceptance",
        p: [
          "By signing up and using SAPLINK, the contracting company (\"Customer\") declares that it has read and agreed to these Terms of Use. Registration is exclusive to legal entities (valid CNPJ).",
        ],
      },
      {
        t: "2. Service description",
        p: [
          "SAPLINK is a SaaS platform for monitoring the health of SAP integrations (OData, REST, RFC, IDoc, SOAP, CPI, file, database and similar), with alerts, AI-assisted diagnostics and reports.",
          "Monitoring of on-premise connections (RFC/IDoc) depends on the Customer installing the provided Agent, which performs outbound traffic only.",
        ],
      },
      {
        t: "3. Plans, billing and add-ons",
        p: [
          "Access is granted via a monthly subscription to the chosen plan, which may include add-ons (extra integrations or users). Billing may be automatic (recurring) or one-time.",
          "Non-payment results in suspension of access after the grace period. The invoice is issued based on the registration data (CNPJ, company name and address provided by the Customer).",
        ],
      },
      {
        t: "4. Customer responsibilities",
        p: [
          "The Customer is responsible for the accuracy of the registration data, for safeguarding the access credentials and for ensuring it is authorized to monitor the SAP systems of its own clients.",
          "Use of the platform for unlawful purposes or to access systems without authorization is prohibited.",
        ],
      },
      {
        t: "5. Security and data",
        p: [
          "Sensitive credentials are stored encrypted. Each Customer accesses only its own data (multi-tenant isolation). SAPLINK adopts reasonable security measures, without guaranteeing uninterrupted availability.",
        ],
      },
      {
        t: "6. Limitation of liability",
        p: [
          "SAPLINK is an assisted monitoring and diagnostic tool; decisions and corrections in the SAP systems are the Customer's responsibility. SAPLINK is not liable for losses arising from third-party unavailability, from the customer's SAP system, or from improper use.",
        ],
      },
      {
        t: "7. Cancellation",
        p: [
          "The Customer may cancel the subscription at any time through the panel. Access remains until the end of the paid period.",
        ],
      },
      {
        t: "8. Changes",
        p: [
          "These Terms may be updated. Relevant changes will be communicated. Continued use after the communication implies agreement.",
        ],
      },
      {
        t: "9. Contact",
        p: ["Questions: suporte@saplink.com.br · Sales: vendas@saplink.com.br"],
      },
    ],
  },
  es: {
    title: "Términos de Uso",
    subtitle: "Plataforma SAPLINK — válido solo para personas jurídicas.",
    createAccount: "Crear cuenta",
    backToRegister: "← Volver al registro",
    termsNav: "Términos",
    contractNav: "Contrato/SLA",
    privacyNav: "Privacidad",
    sections: [
      {
        t: "1. Aceptación",
        p: [
          "Al registrarse y utilizar SAPLINK, la empresa contratante (\"Cliente\") declara haber leído y aceptado estos Términos de Uso. El registro es exclusivo para personas jurídicas (CNPJ válido).",
        ],
      },
      {
        t: "2. Descripción del servicio",
        p: [
          "SAPLINK es una plataforma SaaS de monitoreo de la salud de integraciones SAP (OData, REST, RFC, IDoc, SOAP, CPI, archivo, base de datos y similares), con alertas, diagnóstico asistido por IA e informes.",
          "El monitoreo de conexiones on-premise (RFC/IDoc) depende de la instalación, por parte del Cliente, del Agente provisto, que realiza únicamente tráfico de salida.",
        ],
      },
      {
        t: "3. Planes, cobro y add-ons",
        p: [
          "El acceso se otorga mediante una suscripción mensual al plan elegido, pudiendo incluir add-ons (integraciones o usuarios adicionales). El cobro puede ser automático (recurrente) o por única vez.",
          "El impago implica la suspensión del acceso tras el período de gracia. La factura se emite con base en los datos de registro (CNPJ, razón social y dirección informados por el Cliente).",
        ],
      },
      {
        t: "4. Responsabilidades del Cliente",
        p: [
          "El Cliente es responsable de la veracidad de los datos de registro, de la custodia de las credenciales de acceso y de garantizar que cuenta con autorización para monitorear los sistemas SAP de sus propios clientes.",
          "Queda prohibido el uso de la plataforma para fines ilícitos o para acceder a sistemas sin autorización.",
        ],
      },
      {
        t: "5. Seguridad y datos",
        p: [
          "Las credenciales sensibles se almacenan cifradas. Cada Cliente accede únicamente a sus propios datos (aislamiento multi-tenant). SAPLINK adopta medidas razonables de seguridad, sin garantizar disponibilidad ininterrumpida.",
        ],
      },
      {
        t: "6. Limitación de responsabilidad",
        p: [
          "SAPLINK es una herramienta de monitoreo y diagnóstico asistido; las decisiones y correcciones en los sistemas SAP son responsabilidad del Cliente. SAPLINK no se responsabiliza por pérdidas derivadas de la indisponibilidad de terceros, del SAP del cliente o del uso indebido.",
        ],
      },
      {
        t: "7. Cancelación",
        p: [
          "El Cliente puede cancelar la suscripción en cualquier momento desde el panel. El acceso se mantiene hasta el fin del período pago.",
        ],
      },
      {
        t: "8. Cambios",
        p: [
          "Estos Términos pueden actualizarse. Los cambios relevantes serán comunicados. El uso continuado tras la comunicación implica conformidad.",
        ],
      },
      {
        t: "9. Contacto",
        p: ["Consultas: suporte@saplink.com.br · Ventas: vendas@saplink.com.br"],
      },
    ],
  },
};
