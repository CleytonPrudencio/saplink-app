import type { Lang } from "@/i18n/I18n";

interface Section { t: string; p: string[] }

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  termsNav: string;
  privacyNav: string;
  back: string;
  sections: Section[];
}> = {
  pt: {
    title: "Contrato & SLA",
    subtitle: "Modelo de condições de prestação do serviço SAPLINK. Fidelidade mínima de 3 meses · SLA 99,5%.",
    termsNav: "Termos",
    privacyNav: "Privacidade",
    back: "← Voltar",
    sections: [
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
    ],
  },
  en: {
    title: "Contract & SLA",
    subtitle: "Template of conditions for the provision of the SAPLINK service. Minimum commitment of 3 months · SLA 99.5%.",
    termsNav: "Terms",
    privacyNav: "Privacy",
    back: "← Back",
    sections: [
      {
        t: "1. Object",
        p: [
          "Contracting of SAPLINK, a SaaS platform for monitoring and operating SAP integrations, under the plan and add-ons selected by the CUSTOMER at the time of subscription.",
        ],
      },
      {
        t: "2. Term and minimum commitment",
        p: [
          "The contract is valid for an indefinite term, with a MINIMUM COMMITMENT period of 3 (three) months from activation.",
          "Cancellation before the end of the commitment period entails charging the remaining monthly fees of the minimum period. After the 3 months, cancellation may be made at any time, without penalty, with 30 days' notice.",
        ],
      },
      {
        t: "3. Price, promotion and adjustment",
        p: [
          "The price is the one in effect for the chosen plan. Promotions (e.g., 1st month free) apply only at sign-up and do not waive the 3-month minimum commitment.",
          "Prices are adjusted annually by the variation of the IPCA (or the index that replaces it).",
        ],
      },
      {
        t: "4. Payment and default",
        p: [
          "Billing is monthly (recurring or one-time). A delay exceeding the grace period suspends access; recurrence allows termination by the PROVIDER.",
          "Overdue amounts are subject to a 2% penalty and 1% interest per month.",
        ],
      },
      {
        t: "5. Service Level (SLA)",
        p: [
          "Target platform availability: 99.5% monthly, excluding scheduled maintenance windows (communicated in advance) and force majeure events.",
          "Support: email channel during business hours; critical incidents with a first response within 4 business hours.",
          "Should availability fall below the target in a given month, the CUSTOMER is entitled to a proportional credit on the following invoice, upon request — limited to 20% of the monthly fee.",
        ],
      },
      {
        t: "6. CUSTOMER obligations",
        p: [
          "Provide accurate registration data; keep credentials confidential; and ensure it has AUTHORIZATION to monitor the SAP systems of its own clients.",
          "It is responsible for the use of the on-premise Agent within its network and for the approvals of remediation actions.",
        ],
      },
      {
        t: "7. PROVIDER obligations",
        p: [
          "Provide the service as described, maintain security and confidentiality measures, and process personal data in accordance with the Privacy Policy (LGPD).",
          "No action is executed on the CUSTOMER's/clients' SAP system without a recorded approval.",
        ],
      },
      {
        t: "8. Data protection (LGPD)",
        p: [
          "The parties comply with Law No. 13,709/2018. The PROVIDER acts as Processor of the technical monitoring data and Controller of the registration/billing data, in accordance with the Privacy Policy, which is part of this contract.",
        ],
      },
      {
        t: "9. Ownership and confidentiality",
        p: [
          "The platform, brand and code are the property of the PROVIDER. The CUSTOMER's data remains the CUSTOMER's. Both maintain confidentiality regarding the confidential information they have access to.",
        ],
      },
      {
        t: "10. Limitation of liability",
        p: [
          "The PROVIDER's total liability is limited to the value of the last 3 monthly fees paid. The PROVIDER is not liable for the unavailability of the SAP systems of the CUSTOMER or of third parties.",
        ],
      },
      {
        t: "11. Termination",
        p: [
          "By either party, respecting the commitment period and the 30-day notice. For breach of contract, upon notification and a 10-day cure period. Upon contract termination, the retention/deletion rules of the Privacy Policy apply.",
        ],
      },
      {
        t: "12. Jurisdiction",
        p: [
          "The court of the district of the PROVIDER's headquarters is elected to settle matters of this contract, except where legally provided otherwise.",
        ],
      },
    ],
  },
  es: {
    title: "Contrato & SLA",
    subtitle: "Modelo de condiciones de prestación del servicio SAPLINK. Permanencia mínima de 3 meses · SLA 99,5%.",
    termsNav: "Términos",
    privacyNav: "Privacidad",
    back: "← Volver",
    sections: [
      {
        t: "1. Objeto",
        p: [
          "Contratación de SAPLINK, plataforma SaaS de monitoreo y operación de integraciones SAP, en el plan y add-ons seleccionados por la CONTRATANTE en el acto de la suscripción.",
        ],
      },
      {
        t: "2. Vigencia y permanencia mínima",
        p: [
          "El contrato rige por plazo indeterminado, con un período de PERMANENCIA MÍNIMA de 3 (tres) meses a contar desde la activación.",
          "La cancelación antes del fin de la permanencia implica el cobro de las mensualidades restantes del período mínimo. Tras los 3 meses, la cancelación puede realizarse en cualquier momento, sin multa, con aviso de 30 días.",
        ],
      },
      {
        t: "3. Precio, promoción y reajuste",
        p: [
          "El valor es el vigente en el plan elegido. Las promociones (p. ej.: 1.ª mensualidad gratuita) se aplican únicamente en la adhesión y no eximen de la permanencia mínima de 3 meses.",
          "Los valores se reajustan anualmente por la variación del IPCA (o el índice que lo sustituya).",
        ],
      },
      {
        t: "4. Pago e incumplimiento",
        p: [
          "El cobro es mensual (recurrente o por única vez). El atraso superior al período de gracia suspende el acceso; la reincidencia permite la rescisión por la CONTRATADA.",
          "Sobre los valores en atraso inciden una multa del 2% e intereses del 1% al mes.",
        ],
      },
      {
        t: "5. Nivel de Servicio (SLA)",
        p: [
          "Disponibilidad objetivo de la plataforma: 99,5% mensual, excluidas las ventanas de mantenimiento programado (comunicadas con antelación) y los eventos de fuerza mayor.",
          "Soporte: canal por correo electrónico en horario comercial; incidentes críticos con primera respuesta en hasta 4 horas hábiles.",
          "En caso de que la disponibilidad quede por debajo de la meta en un mes, la CONTRATANTE tiene derecho a un crédito proporcional en la factura siguiente, mediante solicitud — limitado al 20% de la mensualidad.",
        ],
      },
      {
        t: "6. Obligaciones de la CONTRATANTE",
        p: [
          "Proporcionar datos de registro verídicos; mantener bajo sigilo las credenciales; y garantizar que cuenta con AUTORIZACIÓN para monitorear los sistemas SAP de sus propios clientes.",
          "Se responsabiliza por el uso del Agente on-premise dentro de su red y por las aprobaciones de acciones de remediación.",
        ],
      },
      {
        t: "7. Obligaciones de la CONTRATADA",
        p: [
          "Prestar el servicio conforme a lo descrito, mantener medidas de seguridad y confidencialidad, y tratar los datos personales conforme a la Política de Privacidad (LGPD).",
          "Ninguna acción se ejecuta en el SAP de la CONTRATANTE/clientes sin aprobación registrada.",
        ],
      },
      {
        t: "8. Protección de datos (LGPD)",
        p: [
          "Las partes cumplen la Ley n.º 13.709/2018. La CONTRATADA actúa como Operadora de los datos técnicos de monitoreo y Controladora de los datos de registro/cobro, conforme a la Política de Privacidad, que integra este contrato.",
        ],
      },
      {
        t: "9. Propiedad y confidencialidad",
        p: [
          "La plataforma, marca y código son propiedad de la CONTRATADA. Los datos de la CONTRATANTE permanecen de la CONTRATANTE. Ambas mantienen sigilo sobre la información confidencial a la que tengan acceso.",
        ],
      },
      {
        t: "10. Limitación de responsabilidad",
        p: [
          "La responsabilidad total de la CONTRATADA se limita al valor de las últimas 3 mensualidades pagadas. La CONTRATADA no responde por la indisponibilidad de los sistemas SAP de la CONTRATANTE o de terceros.",
        ],
      },
      {
        t: "11. Rescisión",
        p: [
          "Por cualquiera de las partes, respetada la permanencia y el aviso de 30 días. Por incumplimiento contractual, mediante notificación y plazo de corrección de 10 días. Finalizado el contrato, se aplican las reglas de retención/eliminación de la Política de Privacidad.",
        ],
      },
      {
        t: "12. Fuero",
        p: [
          "Se elige el fuero de la comarca de la sede de la CONTRATADA para dirimir las cuestiones de este contrato, salvo disposición legal en contrario.",
        ],
      },
    ],
  },
};
