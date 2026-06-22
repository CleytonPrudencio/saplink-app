import type { Lang } from "@/i18n/I18n";

interface Section { t: string; p: string[] }

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  termsNav: string;
  contractNav: string;
  back: string;
  sections: Section[];
}> = {
  pt: {
    title: "Política de Privacidade",
    subtitle: "Em conformidade com a LGPD (Lei nº 13.709/2018).",
    termsNav: "Termos",
    contractNav: "Contrato/SLA",
    back: "← Voltar",
    sections: [
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
    ],
  },
  en: {
    title: "Privacy Policy",
    subtitle: "In compliance with the LGPD (Law No. 13,709/2018).",
    termsNav: "Terms",
    contractNav: "Contract/SLA",
    back: "← Back",
    sections: [
      {
        t: "1. Who we are (Controller)",
        p: [
          "This Policy describes how SAPLINK processes personal data, in compliance with Law No. 13,709/2018 (LGPD). SAPLINK acts as Controller of the contracting company's registration and billing data, and as Processor of the technical monitoring data that the contracting company chooses to send to the platform.",
          "Data Protection Officer (DPO) contact: privacidade@saplink.com.br.",
        ],
      },
      {
        t: "2. What data we process",
        p: [
          "Registration/billing data: name, email, phone, company, CNPJ, company name and address — provided by the contracting company itself.",
          "Usage data: access logs, actions in the system and usage metrics, for security and service improvement.",
          "Technical monitoring data: status, latency, error rate, error messages and SAP integration metadata. SAPLINK does NOT collect business content (payloads) by default; when an error message contains data, it is treated as technical data for diagnosis.",
        ],
      },
      {
        t: "3. Why we use it (purpose and legal basis)",
        p: [
          "Performance of the contract (art. 7, V): providing monitoring, generating alerts, diagnostics and reports.",
          "Legitimate interest (art. 7, IX): security, fraud prevention and product improvement, always respecting the data subject's rights.",
          "Compliance with legal/regulatory obligations (art. 7, II): tax issuance and retention of records required by law.",
          "Consent, where applicable (e.g., marketing communications), revocable at any time.",
        ],
      },
      {
        t: "4. Sharing",
        p: [
          "We do not sell personal data. We share only with processors necessary to provide the service (e.g., payment provider, transactional email provider, cloud infrastructure), under contract and a confidentiality obligation.",
          "Data may be provided to authorities when required by law or court order.",
        ],
      },
      {
        t: "5. Anonymized network (benchmark and fixes)",
        p: [
          "Features such as Market Benchmark and Federated Failure Network use exclusively ANONYMIZED and aggregated data (error signatures without identifiers, counts by hash). No data identifying the contracting company or its clients is exposed to other tenants.",
        ],
      },
      {
        t: "6. Security",
        p: [
          "We adopt technical and organizational measures: encryption of secrets at rest, multi-tenant isolation, role-based access control (RBAC), session expiration and audit logging. No action on the customer's SAP system is executed without approval (with a log).",
        ],
      },
      {
        t: "7. Retention and deletion",
        p: [
          "We keep data for as long as necessary for the purposes and legal obligations. Upon contract termination, monitoring data is deleted or anonymized within 90 days, except where legally required to be retained. The contracting company may request the export of its data before deletion.",
        ],
      },
      {
        t: "8. Data subject rights (art. 18 of the LGPD)",
        p: [
          "You may request: confirmation of processing, access, correction, anonymization, portability, deletion, information about sharing and revocation of consent.",
          "Requests are handled through the channel privacidade@saplink.com.br, usually within 15 days.",
        ],
      },
      {
        t: "9. International transfer",
        p: [
          "Should we use providers outside Brazil, we ensure adequate safeguards in accordance with the LGPD (contractual clauses and countries with a compatible level of protection).",
        ],
      },
      {
        t: "10. Cookies",
        p: [
          "We use only cookies essential to authentication and operation. We do not use third-party tracking cookies for advertising without consent.",
        ],
      },
      {
        t: "11. Updates",
        p: [
          "This Policy may be updated; relevant changes will be communicated. The current version is always available on this page.",
        ],
      },
    ],
  },
  es: {
    title: "Política de Privacidad",
    subtitle: "En conformidad con la LGPD (Ley n.º 13.709/2018).",
    termsNav: "Términos",
    contractNav: "Contrato/SLA",
    back: "← Volver",
    sections: [
      {
        t: "1. Quiénes somos (Controlador)",
        p: [
          "Esta Política describe cómo SAPLINK trata los datos personales, en conformidad con la Ley n.º 13.709/2018 (LGPD). SAPLINK actúa como Controlador de los datos de registro y cobro de la empresa contratante, y como Operador de los datos técnicos de monitoreo que la contratante decide enviar a la plataforma.",
          "Contacto del Encargado (DPO): privacidade@saplink.com.br.",
        ],
      },
      {
        t: "2. Qué datos tratamos",
        p: [
          "Datos de registro/cobro: nombre, correo electrónico, teléfono, empresa, CNPJ, razón social y dirección — informados por la propia contratante.",
          "Datos de uso: registros de acceso, acciones en el sistema y métricas de utilización, para seguridad y mejora del servicio.",
          "Datos técnicos de monitoreo: estado, latencia, tasa de error, mensajes de error y metadatos de integraciones SAP. SAPLINK NO recopila el contenido de negocio (payloads) por defecto; cuando un mensaje de error contiene datos, se trata como dato técnico para diagnóstico.",
        ],
      },
      {
        t: "3. Para qué los usamos (finalidad y base legal)",
        p: [
          "Ejecución del contrato (art. 7.º, V): prestar el monitoreo, generar alertas, diagnósticos e informes.",
          "Interés legítimo (art. 7.º, IX): seguridad, prevención de fraude y mejora del producto, siempre respetando los derechos del titular.",
          "Cumplimiento de obligación legal/regulatoria (art. 7.º, II): emisión fiscal y conservación de registros exigidos por ley.",
          "Consentimiento, cuando corresponda (p. ej.: comunicaciones de marketing), revocable en cualquier momento.",
        ],
      },
      {
        t: "4. Compartición",
        p: [
          "No vendemos datos personales. Compartimos únicamente con operadores necesarios para la prestación del servicio (p. ej.: proveedor de pago, proveedor de correo transaccional, infraestructura en la nube), bajo contrato y obligación de confidencialidad.",
          "Los datos pueden ser proporcionados a las autoridades cuando lo exija la ley o una orden judicial.",
        ],
      },
      {
        t: "5. Red anonimizada (benchmark y correcciones)",
        p: [
          "Recursos como Benchmark de mercado y Red Federada de Fallas usan exclusivamente datos ANONIMIZADOS y agregados (firmas de error sin identificadores, conteo por hash). Ningún dato que identifique a la contratante o a sus clientes se expone a otros tenants.",
        ],
      },
      {
        t: "6. Seguridad",
        p: [
          "Adoptamos medidas técnicas y organizativas: cifrado de secretos en reposo, aislamiento multi-tenant, control de acceso por perfil (RBAC), expiración de sesión y registro de auditoría. Ninguna acción en el SAP del cliente se ejecuta sin aprobación (con registro).",
        ],
      },
      {
        t: "7. Retención y eliminación",
        p: [
          "Conservamos los datos por el tiempo necesario para las finalidades y las obligaciones legales. Finalizado el contrato, los datos de monitoreo se eliminan o anonimizan en hasta 90 días, salvo conservación legal obligatoria. La contratante puede solicitar la exportación de sus datos antes de la eliminación.",
        ],
      },
      {
        t: "8. Derechos del titular (art. 18 de la LGPD)",
        p: [
          "Usted puede solicitar: confirmación de tratamiento, acceso, corrección, anonimización, portabilidad, eliminación, información sobre compartición y revocación del consentimiento.",
          "Las solicitudes se atienden por el canal privacidade@saplink.com.br, normalmente en hasta 15 días.",
        ],
      },
      {
        t: "9. Transferencia internacional",
        p: [
          "En caso de utilizar proveedores fuera de Brasil, garantizamos salvaguardas adecuadas conforme a la LGPD (cláusulas contractuales y países con nivel de protección compatible).",
        ],
      },
      {
        t: "10. Cookies",
        p: [
          "Usamos únicamente cookies esenciales para la autenticación y el funcionamiento. No usamos cookies de rastreo de terceros para publicidad sin consentimiento.",
        ],
      },
      {
        t: "11. Actualizaciones",
        p: [
          "Esta Política puede actualizarse; los cambios relevantes serán comunicados. La versión vigente está siempre disponible en esta página.",
        ],
      },
    ],
  },
};
