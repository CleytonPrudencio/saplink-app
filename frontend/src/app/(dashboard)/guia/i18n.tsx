import type { ReactNode } from "react";
import type { Lang } from "@/i18n/I18n";

export interface Topic { icon: string; name: string; what: string; how: string; do: string }
export interface Chapter { title: string; color: string; intro: string; topics: Topic[] }
export interface SetupGuide { icon: string; name: string; intro: string; steps: string[]; fields: { label: string; value: string }[] }

export const REDIRECT_URI = "https://saplink.com.br/api/auth/sso/callback";

export const T: Record<Lang, {
  pageTitle: string;
  pageSubtitle: string;
  downloadPdf: string;
  labelWhat: string;
  labelHow: string;
  labelDo: string;
  techTitle: string;
  techSubtitle: string;
  ssoBoxTitle: string;
  ssoBoxText: ReactNode;
  connectorsTitle: string;
  connectorsIntro: string;
  connectorsSteps: ReactNode[];
  footerTip: ReactNode;
  ebook: Chapter[];
  ssoSetup: SetupGuide[];
}> = {
  pt: {
    pageTitle: "📖 Guia completo do SAPLINK",
    pageSubtitle: "Seu manual de bordo: o que cada tela faz, como funciona e o que fazer com a informação. Do zero ao valor.",
    downloadPdf: "⬇ Baixar como PDF",
    labelWhat: "O que é",
    labelHow: "Como funciona",
    labelDo: "O que fazer",
    techTitle: "7. Configuração técnica (admin)",
    techSubtitle: "Passo-a-passo para conectar o login corporativo (SSO) e os produtos SAP Cloud do cliente. Tudo é por cliente: cada um usa as próprias credenciais.",
    ssoBoxTitle: "🔐 SSO / Login corporativo",
    ssoBoxText: <>Escolha o provedor de identidade do cliente abaixo. Em todos, o segredo: cadastrar o <b>Redirect URI</b> do SAPLINK no IdP e colar Client ID, Client Secret e Issuer na tela <b>SSO corporativo</b>. Importante: o usuário precisa <b>já existir no SAPLINK com o mesmo e-mail</b> — o SSO autentica, não cria conta sozinho.</>,
    connectorsTitle: "Conectores Ariba / SuccessFactors",
    connectorsIntro: "Para monitorar Ariba e SuccessFactors além do S/4. Cada produto usa a API Key do cliente.",
    connectorsSteps: [
      <>No SAP Business Accelerator Hub (api.sap.com) ou no tenant do cliente, gere/obtenha a <b>API Key</b> do produto.</>,
      <>No SAPLINK, vá em <b>Conectores (Ariba/SF)</b>, escolha o cliente e o produto, clique <b>Conectar</b> e cole a API Key (a base URL já vem preenchida com o sandbox).</>,
      <>Clique <b>Sincronizar</b>: as APIs alcançadas entram no inventário e aparecem no <b>Catálogo vivo</b>.</>,
    ],
    footerTip: <>Dica: cada tela do sistema também tem o guia rápido (💡) no topo e o botão &quot;🤖 Explique e recomende&quot; que lê os dados reais e sugere a próxima ação.</>,
    ssoSetup: [
      {
        icon: "🟦", name: "Microsoft / Azure AD (Entra ID)",
        intro: "Para clientes Microsoft 365 / Entra ID. Você precisa de acesso de admin ao tenant do cliente.",
        steps: [
          "Acesse portal.azure.com → Microsoft Entra ID → App registrations → New registration.",
          "Dê um nome (ex.: SAPLINK). Em Redirect URI, escolha a plataforma Web e cole o callback abaixo. Clique Register.",
          "Na visão geral do app, copie o Application (client) ID e o Directory (tenant) ID.",
          "Vá em Certificates & secrets → New client secret → copie o Value (o campo Value, não o Secret ID).",
          "Em API permissions, garanta openid, email e profile (Microsoft Graph, delegated) e dê Grant admin consent.",
          "No SAPLINK (SSO corporativo): provedor Microsoft, cole Client ID e Client Secret, e monte o Issuer com o tenant. Habilite e salve.",
        ],
        fields: [
          { label: "Redirect URI (cadastre como Web)", value: REDIRECT_URI },
          { label: "Issuer", value: "https://login.microsoftonline.com/SEU_TENANT_ID/v2.0" },
        ],
      },
      {
        icon: "🟥", name: "Google Workspace",
        intro: "Para clientes Google Workspace. Use uma conta admin do Google Cloud do cliente.",
        steps: [
          "Acesse console.cloud.google.com → APIs & Services → OAuth consent screen → tipo Internal → preencha os dados básicos.",
          "Vá em Credentials → Create Credentials → OAuth client ID → Application type: Web application.",
          "Em Authorized redirect URIs, adicione o callback abaixo. Clique Create.",
          "Copie o Client ID e o Client Secret exibidos.",
          "No SAPLINK (SSO corporativo): provedor Google, cole Client ID e Secret. O Issuer é fixo. Habilite e salve.",
        ],
        fields: [
          { label: "Authorized redirect URI", value: REDIRECT_URI },
          { label: "Issuer (fixo)", value: "https://accounts.google.com" },
        ],
      },
      {
        icon: "🟪", name: "Okta",
        intro: "Para clientes que usam Okta como IdP. Use o Okta Admin Console do cliente.",
        steps: [
          "No Okta Admin Console → Applications → Create App Integration → OIDC - OpenID Connect → Web Application.",
          "Em Sign-in redirect URIs, cole o callback abaixo. Em Assignments, defina os grupos/usuários que poderão entrar.",
          "Após criar, copie o Client ID e o Client secret.",
          "Pegue o Issuer em Security → API → Authorization Servers (copie o Issuer URI; normalmente termina em /oauth2/default).",
          "No SAPLINK (SSO corporativo): provedor Okta, cole Client ID, Secret e o Issuer. Habilite e salve.",
        ],
        fields: [
          { label: "Sign-in redirect URI", value: REDIRECT_URI },
          { label: "Issuer (exemplo)", value: "https://SEU_DOMINIO.okta.com/oauth2/default" },
        ],
      },
    ],
    ebook: [
      {
        title: "1. Começando", color: "#22d3ee",
        intro: "O SAPLINK monitora, prevê, corrige e prova em R$ a saúde das integrações SAP dos seus clientes — num painel multi-cliente. Em 3 passos você sai do zero ao valor.",
        topics: [
          { icon: "🔌", name: "Conecte um cliente", what: "Cada cliente é um ambiente SAP que você monitora.", how: "Em Clientes → Novo cliente. Para on-premise (RFC/IDoc), instale o Agente Docker (só tráfego de saída). Para nuvem, conecte o S/4HANA Cloud por Communication Arrangement / API Key, ou o CPI pelo service key.", do: "Comece por 1 cliente real e veja os dados aparecerem no Dashboard." },
          { icon: "📊", name: "Leia o Dashboard", what: "Visão geral da saúde de toda a carteira.", how: "Cards de saúde, alertas e clientes em ordem de prioridade.", do: "Ataque primeiro quem tem health baixo ou alerta aberto. Use 'Resuma minha carteira (IA)'." },
          { icon: "💡", name: "Use o guia de cada tela", what: "Todo card '💡' explica a tela.", how: "No topo de cada tela: O que é · Por que importa · O que fazer.", do: "Clique 'O que faço com isso?' quando tiver dúvida — e o botão '🤖 Explique e recomende' lê os dados e diz a ação." },
        ],
      },
      {
        title: "2. Operação do dia a dia", color: "#34d399",
        intro: "O trabalho operacional: ver o que está quebrado, entender e corrigir — sem logar em vários SAPs.",
        topics: [
          { icon: "🛰️", name: "Cockpit de IDoc & filas", what: "IDocs em erro e filas travadas de toda a carteira.", how: "Filtre por cliente/tipo; itens remediáveis têm ação.", do: "Peça remediação (BD87/SMQ2/SM58) nos itens marcados — com aprovação e log." },
          { icon: "🔔", name: "Alertas", what: "Sua fila de trabalho priorizada por severidade.", how: "Agrupados por integração (×N), com diagnóstico de IA e resolução em lote.", do: "Resolva CRITICAL/HIGH primeiro; use '🤖 Diagnosticar' e 'Explique e priorize'." },
          { icon: "☁️", name: "CPI & AIF", what: "Mensagens reais do Cloud Integration.", how: "Filtre por FALHA; cada falha tem 'Diagnosticar' e 'Gerar correção pronta'.", do: "Diagnostique a falha e aplique a correção generativa." },
          { icon: "📚", name: "Catálogo", what: "Inventário vivo de interfaces (auto-descoberto).", how: "Parceiros, destinos RFC, message types, OData.", do: "Use como mapa do landscape e base de análise de impacto." },
        ],
      },
      {
        title: "3. Inteligência de IA", color: "#a78bfa",
        intro: "A IA é o copiloto: diagnostica, prevê, responde e escreve. Use para decidir mais rápido.",
        topics: [
          { icon: "🩺", name: "Diagnóstico IA", what: "Causa raiz + correção + prevenção de um erro.", how: "Escolha o cliente e rode; sai relatório estilizado + PDF.", do: "Anexe o PDF no chamado e siga os passos com a transação SAP." },
          { icon: "💬", name: "Pergunte à IA", what: "Copiloto que enxerga a carteira inteira.", how: "Pergunte em português ('quais clientes têm erro agora?').", do: "Use para visão rápida sem montar relatório." },
          { icon: "🔮", name: "Previsão & Benchmark", what: "Risco de falha (tendência) e comparação com o mercado.", how: "Veja o que tende a piorar e seu percentil.", do: "Aja na janela de manutenção antes do incidente; use o benchmark na venda." },
        ],
      },
      {
        title: "4. S/4HANA Cloud (carro-chefe)", color: "#fbbf24",
        intro: "Cobertura do que falta na edição que a SAP empurra: upgrade, clean core, fiscal, eventos.",
        topics: [
          { icon: "🚀", name: "Radar de Upgrade", what: "O que quebra/depreca no próximo release.", how: "Cruza o uso real com as mudanças do release.", do: "Priorize BREAKING/DEPRECATED e gere o plano de migração." },
          { icon: "🧼", name: "Clean Core Score", what: "A métrica que a SAP cobra.", how: "Pontuação + plano de remediação.", do: "Reduza as deduções de maior peso; mostre o score ao cliente." },
          { icon: "🧾", name: "Fiscal (DRC)", what: "NF-e/SEFAZ: rejeição, contingência, fila.", how: "Lista com valor em R$ e reprocesso.", do: "Reprocesse os bloqueados; acompanhe o R$ em risco." },
        ],
      },
      {
        title: "5. Inovação exclusiva", color: "#f472b6",
        intro: "Os diferenciais que ninguém tem — use como argumento e como ferramenta de operação.",
        topics: [
          { icon: "🛰️", name: "Rede Federada", what: "Correção vencedora aprendida de toda a base.", how: "Por assinatura de falha (anônimo).", do: "Aplique a correção comprovada em vez de começar do zero." },
          { icon: "🔗", name: "Causa cross-camada", what: "Liga o transport à falha que veio depois.", how: "Correlação no tempo com % de confiança.", do: "Confirme o transport suspeito com o time ABAP." },
          { icon: "🤖", name: "AMS Autônomo", what: "Self-healing com placar.", how: "Política de confiança + ações permitidas.", do: "Ligue o piloto automático para a rotina de L1." },
          { icon: "💸", name: "Dinheiro em risco", what: "Falha técnica em R$ ao vivo.", how: "Custo/hora + fiscal, por processo.", do: "Configure custo/hora nas integrações e priorize pelo caixa." },
          { icon: "🧨", name: "Pré-voo de mudança", what: "Blast radius antes do deploy.", how: "Score de risco + plano de teste por transport.", do: "Antes de subir pra PRD, teste o que o raio aponta." },
          { icon: "⏪", name: "Time machine", what: "Replay do incidente + 'e se?'.", how: "Timeline + contrafactual de R$.", do: "Use o R$ economizado na reunião de renovação." },
          { icon: "🛡️", name: "Auditoria & SoD", what: "Trilha de mudanças + segregação de função.", how: "Violações em vermelho + evidências por IA.", do: "Gere o pacote de evidências para o auditor." },
          { icon: "🤝", name: "Parceiros & FinOps", what: "Quem manda dado ruim + custo de BTP.", how: "Ranking de erro por parceiro e custo por IFlow.", do: "Cobre o parceiro ofensor e corte o IFlow que queima crédito." },
        ],
      },
      {
        title: "6. Valor, SLA & confiança", color: "#60a5fa",
        intro: "Como transformar a operação em prova de valor que renova contrato.",
        topics: [
          { icon: "📈", name: "SLA & Impacto", what: "Compliance por cliente + R$ em risco.", how: "Defina metas e custo/hora; gere o relatório de SLA por IA.", do: "Leve o relatório (PDF) para a reunião mensal." },
          { icon: "🪪", name: "Portal do cliente", what: "Visão white-label read-only pro cliente final.", how: "Ative e personalize a marca.", do: "Compartilhe o link — transparência que fideliza." },
          { icon: "📣", name: "On-call & Tickets", what: "Notificação multicanal + Jira/ServiceNow.", how: "Canais por severidade + escalonamento.", do: "Configure o canal do plantão e o tempo de escalonamento." },
        ],
      },
    ],
  },
  en: {
    pageTitle: "📖 Complete SAPLINK guide",
    pageSubtitle: "Your handbook: what each screen does, how it works, and what to do with the information. From zero to value.",
    downloadPdf: "⬇ Download as PDF",
    labelWhat: "What it is",
    labelHow: "How it works",
    labelDo: "What to do",
    techTitle: "7. Technical setup (admin)",
    techSubtitle: "Step-by-step to connect corporate login (SSO) and the client's SAP Cloud products. Everything is per client: each one uses its own credentials.",
    ssoBoxTitle: "🔐 SSO / Corporate login",
    ssoBoxText: <>Choose the client's identity provider below. In all of them, the key is: register SAPLINK's <b>Redirect URI</b> in the IdP and paste Client ID, Client Secret and Issuer in the <b>Corporate SSO</b> screen. Important: the user must <b>already exist in SAPLINK with the same email</b> — SSO authenticates, it does not create accounts on its own.</>,
    connectorsTitle: "Ariba / SuccessFactors connectors",
    connectorsIntro: "To monitor Ariba and SuccessFactors beyond S/4. Each product uses the client's API Key.",
    connectorsSteps: [
      <>In the SAP Business Accelerator Hub (api.sap.com) or in the client's tenant, generate/obtain the product's <b>API Key</b>.</>,
      <>In SAPLINK, go to <b>Connectors (Ariba/SF)</b>, choose the client and the product, click <b>Connect</b> and paste the API Key (the base URL is already filled with the sandbox).</>,
      <>Click <b>Sync</b>: the reached APIs enter the inventory and show up in the <b>Live catalog</b>.</>,
    ],
    footerTip: <>Tip: every screen in the system also has the quick guide (💡) at the top and the &quot;🤖 Explain and recommend&quot; button that reads the real data and suggests the next action.</>,
    ssoSetup: [
      {
        icon: "🟦", name: "Microsoft / Azure AD (Entra ID)",
        intro: "For Microsoft 365 / Entra ID clients. You need admin access to the client's tenant.",
        steps: [
          "Go to portal.azure.com → Microsoft Entra ID → App registrations → New registration.",
          "Give it a name (e.g. SAPLINK). Under Redirect URI, choose the Web platform and paste the callback below. Click Register.",
          "On the app overview, copy the Application (client) ID and the Directory (tenant) ID.",
          "Go to Certificates & secrets → New client secret → copy the Value (the Value field, not the Secret ID).",
          "Under API permissions, ensure openid, email and profile (Microsoft Graph, delegated) and Grant admin consent.",
          "In SAPLINK (Corporate SSO): Microsoft provider, paste Client ID and Client Secret, and build the Issuer with the tenant. Enable and save.",
        ],
        fields: [
          { label: "Redirect URI (register as Web)", value: REDIRECT_URI },
          { label: "Issuer", value: "https://login.microsoftonline.com/SEU_TENANT_ID/v2.0" },
        ],
      },
      {
        icon: "🟥", name: "Google Workspace",
        intro: "For Google Workspace clients. Use an admin account on the client's Google Cloud.",
        steps: [
          "Go to console.cloud.google.com → APIs & Services → OAuth consent screen → Internal type → fill in the basic data.",
          "Go to Credentials → Create Credentials → OAuth client ID → Application type: Web application.",
          "Under Authorized redirect URIs, add the callback below. Click Create.",
          "Copy the Client ID and Client Secret displayed.",
          "In SAPLINK (Corporate SSO): Google provider, paste Client ID and Secret. The Issuer is fixed. Enable and save.",
        ],
        fields: [
          { label: "Authorized redirect URI", value: REDIRECT_URI },
          { label: "Issuer (fixed)", value: "https://accounts.google.com" },
        ],
      },
      {
        icon: "🟪", name: "Okta",
        intro: "For clients using Okta as IdP. Use the client's Okta Admin Console.",
        steps: [
          "In the Okta Admin Console → Applications → Create App Integration → OIDC - OpenID Connect → Web Application.",
          "Under Sign-in redirect URIs, paste the callback below. Under Assignments, define the groups/users allowed to sign in.",
          "After creating, copy the Client ID and Client secret.",
          "Get the Issuer in Security → API → Authorization Servers (copy the Issuer URI; it usually ends in /oauth2/default).",
          "In SAPLINK (Corporate SSO): Okta provider, paste Client ID, Secret and the Issuer. Enable and save.",
        ],
        fields: [
          { label: "Sign-in redirect URI", value: REDIRECT_URI },
          { label: "Issuer (example)", value: "https://SEU_DOMINIO.okta.com/oauth2/default" },
        ],
      },
    ],
    ebook: [
      {
        title: "1. Getting started", color: "#22d3ee",
        intro: "SAPLINK monitors, predicts, fixes and proves in R$ the health of your clients' SAP integrations — in a multi-client panel. In 3 steps you go from zero to value.",
        topics: [
          { icon: "🔌", name: "Connect a client", what: "Each client is a SAP environment you monitor.", how: "In Clients → New client. For on-premise (RFC/IDoc), install the Docker Agent (outbound traffic only). For cloud, connect S/4HANA Cloud via Communication Arrangement / API Key, or CPI via service key.", do: "Start with 1 real client and watch the data show up in the Dashboard." },
          { icon: "📊", name: "Read the Dashboard", what: "Overview of the whole portfolio's health.", how: "Health cards, alerts and clients in priority order.", do: "Tackle low-health or open-alert clients first. Use 'Summarize my portfolio (AI)'." },
          { icon: "💡", name: "Use each screen's guide", what: "Every '💡' card explains the screen.", how: "At the top of each screen: What it is · Why it matters · What to do.", do: "Click 'What do I do with this?' when in doubt — and the '🤖 Explain and recommend' button reads the data and tells you the action." },
        ],
      },
      {
        title: "2. Day-to-day operation", color: "#34d399",
        intro: "The operational work: see what's broken, understand it and fix it — without logging into multiple SAPs.",
        topics: [
          { icon: "🛰️", name: "IDoc & queue cockpit", what: "IDocs in error and stuck queues across the whole portfolio.", how: "Filter by client/type; remediable items have an action.", do: "Request remediation (BD87/SMQ2/SM58) on flagged items — with approval and log." },
          { icon: "🔔", name: "Alerts", what: "Your work queue prioritized by severity.", how: "Grouped by integration (×N), with AI diagnosis and bulk resolution.", do: "Resolve CRITICAL/HIGH first; use '🤖 Diagnose' and 'Explain and prioritize'." },
          { icon: "☁️", name: "CPI & AIF", what: "Real Cloud Integration messages.", how: "Filter by FAILURE; each failure has 'Diagnose' and 'Generate ready fix'.", do: "Diagnose the failure and apply the generative fix." },
          { icon: "📚", name: "Catalog", what: "Live interface inventory (auto-discovered).", how: "Partners, RFC destinations, message types, OData.", do: "Use it as a landscape map and a basis for impact analysis." },
        ],
      },
      {
        title: "3. AI intelligence", color: "#a78bfa",
        intro: "AI is the copilot: it diagnoses, predicts, answers and writes. Use it to decide faster.",
        topics: [
          { icon: "🩺", name: "AI Diagnosis", what: "Root cause + fix + prevention for an error.", how: "Choose the client and run it; out comes a styled report + PDF.", do: "Attach the PDF to the ticket and follow the steps with the SAP transaction." },
          { icon: "💬", name: "Ask the AI", what: "A copilot that sees the entire portfolio.", how: "Ask in plain language ('which clients have errors right now?').", do: "Use it for a quick view without building a report." },
          { icon: "🔮", name: "Prediction & Benchmark", what: "Failure risk (trend) and comparison with the market.", how: "See what's trending worse and your percentile.", do: "Act in the maintenance window before the incident; use the benchmark in the sale." },
        ],
      },
      {
        title: "4. S/4HANA Cloud (flagship)", color: "#fbbf24",
        intro: "Coverage of what's missing in the edition SAP pushes: upgrade, clean core, tax, events.",
        topics: [
          { icon: "🚀", name: "Upgrade Radar", what: "What breaks/gets deprecated in the next release.", how: "Cross-references real usage with the release changes.", do: "Prioritize BREAKING/DEPRECATED and generate the migration plan." },
          { icon: "🧼", name: "Clean Core Score", what: "The metric SAP demands.", how: "Score + remediation plan.", do: "Reduce the highest-weight deductions; show the score to the client." },
          { icon: "🧾", name: "Tax (DRC)", what: "NF-e/SEFAZ: rejection, contingency, queue.", how: "List with value in R$ and reprocessing.", do: "Reprocess the blocked ones; track the R$ at risk." },
        ],
      },
      {
        title: "5. Exclusive innovation", color: "#f472b6",
        intro: "The differentiators no one else has — use them as an argument and as an operations tool.",
        topics: [
          { icon: "🛰️", name: "Federated Network", what: "Winning fix learned from the whole base.", how: "By failure signature (anonymous).", do: "Apply the proven fix instead of starting from scratch." },
          { icon: "🔗", name: "Cross-layer cause", what: "Links the transport to the failure that came after.", how: "Time correlation with a % of confidence.", do: "Confirm the suspect transport with the ABAP team." },
          { icon: "🤖", name: "Autonomous AMS", what: "Self-healing with a scoreboard.", how: "Confidence policy + allowed actions.", do: "Turn on autopilot for the L1 routine." },
          { icon: "💸", name: "Money at risk", what: "Technical failure in R$ live.", how: "Cost/hour + tax, per process.", do: "Set cost/hour on the integrations and prioritize by cash." },
          { icon: "🧨", name: "Change pre-flight", what: "Blast radius before the deploy.", how: "Risk score + test plan per transport.", do: "Before promoting to PRD, test what the radius points to." },
          { icon: "⏪", name: "Time machine", what: "Incident replay + 'what if?'.", how: "Timeline + R$ counterfactual.", do: "Use the R$ saved in the renewal meeting." },
          { icon: "🛡️", name: "Audit & SoD", what: "Change trail + segregation of duties.", how: "Violations in red + AI evidence.", do: "Generate the evidence package for the auditor." },
          { icon: "🤝", name: "Partners & FinOps", what: "Who sends bad data + BTP cost.", how: "Error ranking per partner and cost per IFlow.", do: "Charge back the offending partner and cut the IFlow burning credit." },
        ],
      },
      {
        title: "6. Value, SLA & trust", color: "#60a5fa",
        intro: "How to turn operations into proof of value that renews the contract.",
        topics: [
          { icon: "📈", name: "SLA & Impact", what: "Compliance per client + R$ at risk.", how: "Set goals and cost/hour; generate the SLA report with AI.", do: "Bring the report (PDF) to the monthly meeting." },
          { icon: "🪪", name: "Client portal", what: "Read-only white-label view for the end client.", how: "Enable and customize the branding.", do: "Share the link — transparency that builds loyalty." },
          { icon: "📣", name: "On-call & Tickets", what: "Multichannel notification + Jira/ServiceNow.", how: "Channels by severity + escalation.", do: "Set up the on-call channel and the escalation time." },
        ],
      },
    ],
  },
  es: {
    pageTitle: "📖 Guía completa de SAPLINK",
    pageSubtitle: "Tu manual de a bordo: qué hace cada pantalla, cómo funciona y qué hacer con la información. De cero al valor.",
    downloadPdf: "⬇ Descargar como PDF",
    labelWhat: "Qué es",
    labelHow: "Cómo funciona",
    labelDo: "Qué hacer",
    techTitle: "7. Configuración técnica (admin)",
    techSubtitle: "Paso a paso para conectar el login corporativo (SSO) y los productos SAP Cloud del cliente. Todo es por cliente: cada uno usa sus propias credenciales.",
    ssoBoxTitle: "🔐 SSO / Login corporativo",
    ssoBoxText: <>Elige el proveedor de identidad del cliente abajo. En todos, la clave: registrar el <b>Redirect URI</b> de SAPLINK en el IdP y pegar Client ID, Client Secret e Issuer en la pantalla <b>SSO corporativo</b>. Importante: el usuario debe <b>ya existir en SAPLINK con el mismo correo</b> — el SSO autentica, no crea cuentas por sí solo.</>,
    connectorsTitle: "Conectores Ariba / SuccessFactors",
    connectorsIntro: "Para monitorear Ariba y SuccessFactors además de S/4. Cada producto usa la API Key del cliente.",
    connectorsSteps: [
      <>En el SAP Business Accelerator Hub (api.sap.com) o en el tenant del cliente, genera/obtén la <b>API Key</b> del producto.</>,
      <>En SAPLINK, ve a <b>Conectores (Ariba/SF)</b>, elige el cliente y el producto, haz clic en <b>Conectar</b> y pega la API Key (la base URL ya viene completada con el sandbox).</>,
      <>Haz clic en <b>Sincronizar</b>: las APIs alcanzadas entran en el inventario y aparecen en el <b>Catálogo vivo</b>.</>,
    ],
    footerTip: <>Consejo: cada pantalla del sistema también tiene la guía rápida (💡) arriba y el botón &quot;🤖 Explica y recomienda&quot; que lee los datos reales y sugiere la próxima acción.</>,
    ssoSetup: [
      {
        icon: "🟦", name: "Microsoft / Azure AD (Entra ID)",
        intro: "Para clientes Microsoft 365 / Entra ID. Necesitas acceso de admin al tenant del cliente.",
        steps: [
          "Ve a portal.azure.com → Microsoft Entra ID → App registrations → New registration.",
          "Dale un nombre (ej.: SAPLINK). En Redirect URI, elige la plataforma Web y pega el callback de abajo. Haz clic en Register.",
          "En la vista general de la app, copia el Application (client) ID y el Directory (tenant) ID.",
          "Ve a Certificates & secrets → New client secret → copia el Value (el campo Value, no el Secret ID).",
          "En API permissions, asegura openid, email y profile (Microsoft Graph, delegated) y da Grant admin consent.",
          "En SAPLINK (SSO corporativo): proveedor Microsoft, pega Client ID y Client Secret, y arma el Issuer con el tenant. Habilita y guarda.",
        ],
        fields: [
          { label: "Redirect URI (regístralo como Web)", value: REDIRECT_URI },
          { label: "Issuer", value: "https://login.microsoftonline.com/SEU_TENANT_ID/v2.0" },
        ],
      },
      {
        icon: "🟥", name: "Google Workspace",
        intro: "Para clientes Google Workspace. Usa una cuenta admin del Google Cloud del cliente.",
        steps: [
          "Ve a console.cloud.google.com → APIs & Services → OAuth consent screen → tipo Internal → completa los datos básicos.",
          "Ve a Credentials → Create Credentials → OAuth client ID → Application type: Web application.",
          "En Authorized redirect URIs, agrega el callback de abajo. Haz clic en Create.",
          "Copia el Client ID y el Client Secret mostrados.",
          "En SAPLINK (SSO corporativo): proveedor Google, pega Client ID y Secret. El Issuer es fijo. Habilita y guarda.",
        ],
        fields: [
          { label: "Authorized redirect URI", value: REDIRECT_URI },
          { label: "Issuer (fijo)", value: "https://accounts.google.com" },
        ],
      },
      {
        icon: "🟪", name: "Okta",
        intro: "Para clientes que usan Okta como IdP. Usa el Okta Admin Console del cliente.",
        steps: [
          "En el Okta Admin Console → Applications → Create App Integration → OIDC - OpenID Connect → Web Application.",
          "En Sign-in redirect URIs, pega el callback de abajo. En Assignments, define los grupos/usuarios que podrán entrar.",
          "Tras crear, copia el Client ID y el Client secret.",
          "Obtén el Issuer en Security → API → Authorization Servers (copia el Issuer URI; normalmente termina en /oauth2/default).",
          "En SAPLINK (SSO corporativo): proveedor Okta, pega Client ID, Secret y el Issuer. Habilita y guarda.",
        ],
        fields: [
          { label: "Sign-in redirect URI", value: REDIRECT_URI },
          { label: "Issuer (ejemplo)", value: "https://SEU_DOMINIO.okta.com/oauth2/default" },
        ],
      },
    ],
    ebook: [
      {
        title: "1. Empezando", color: "#22d3ee",
        intro: "SAPLINK monitorea, predice, corrige y prueba en R$ la salud de las integraciones SAP de tus clientes — en un panel multicliente. En 3 pasos pasas de cero al valor.",
        topics: [
          { icon: "🔌", name: "Conecta un cliente", what: "Cada cliente es un entorno SAP que monitoreas.", how: "En Clientes → Nuevo cliente. Para on-premise (RFC/IDoc), instala el Agente Docker (solo tráfico de salida). Para nube, conecta S/4HANA Cloud por Communication Arrangement / API Key, o el CPI por service key.", do: "Empieza con 1 cliente real y observa los datos aparecer en el Dashboard." },
          { icon: "📊", name: "Lee el Dashboard", what: "Visión general de la salud de toda la cartera.", how: "Tarjetas de salud, alertas y clientes en orden de prioridad.", do: "Ataca primero a quien tiene health bajo o alerta abierta. Usa 'Resumir mi cartera (IA)'." },
          { icon: "💡", name: "Usa la guía de cada pantalla", what: "Toda tarjeta '💡' explica la pantalla.", how: "En la parte superior de cada pantalla: Qué es · Por qué importa · Qué hacer.", do: "Haz clic en '¿Qué hago con esto?' cuando tengas dudas — y el botón '🤖 Explica y recomienda' lee los datos y dice la acción." },
        ],
      },
      {
        title: "2. Operación del día a día", color: "#34d399",
        intro: "El trabajo operativo: ver qué está roto, entenderlo y corregirlo — sin entrar en varios SAP.",
        topics: [
          { icon: "🛰️", name: "Cockpit de IDoc y colas", what: "IDocs en error y colas atascadas de toda la cartera.", how: "Filtra por cliente/tipo; los ítems remediables tienen acción.", do: "Pide remediación (BD87/SMQ2/SM58) en los ítems marcados — con aprobación y log." },
          { icon: "🔔", name: "Alertas", what: "Tu cola de trabajo priorizada por severidad.", how: "Agrupadas por integración (×N), con diagnóstico de IA y resolución en lote.", do: "Resuelve CRITICAL/HIGH primero; usa '🤖 Diagnosticar' y 'Explica y prioriza'." },
          { icon: "☁️", name: "CPI y AIF", what: "Mensajes reales de Cloud Integration.", how: "Filtra por FALLA; cada falla tiene 'Diagnosticar' y 'Generar corrección lista'.", do: "Diagnostica la falla y aplica la corrección generativa." },
          { icon: "📚", name: "Catálogo", what: "Inventario vivo de interfaces (auto-descubierto).", how: "Socios, destinos RFC, message types, OData.", do: "Úsalo como mapa del landscape y base de análisis de impacto." },
        ],
      },
      {
        title: "3. Inteligencia de IA", color: "#a78bfa",
        intro: "La IA es el copiloto: diagnostica, predice, responde y escribe. Úsala para decidir más rápido.",
        topics: [
          { icon: "🩺", name: "Diagnóstico IA", what: "Causa raíz + corrección + prevención de un error.", how: "Elige el cliente y ejecútalo; sale un informe estilizado + PDF.", do: "Adjunta el PDF al ticket y sigue los pasos con la transacción SAP." },
          { icon: "💬", name: "Pregunta a la IA", what: "Copiloto que ve toda la cartera.", how: "Pregunta en lenguaje natural ('¿qué clientes tienen error ahora?').", do: "Úsalo para una visión rápida sin armar un informe." },
          { icon: "🔮", name: "Predicción y Benchmark", what: "Riesgo de falla (tendencia) y comparación con el mercado.", how: "Mira qué tiende a empeorar y tu percentil.", do: "Actúa en la ventana de mantenimiento antes del incidente; usa el benchmark en la venta." },
        ],
      },
      {
        title: "4. S/4HANA Cloud (buque insignia)", color: "#fbbf24",
        intro: "Cobertura de lo que falta en la edición que SAP empuja: upgrade, clean core, fiscal, eventos.",
        topics: [
          { icon: "🚀", name: "Radar de Upgrade", what: "Lo que se rompe/deprecia en el próximo release.", how: "Cruza el uso real con los cambios del release.", do: "Prioriza BREAKING/DEPRECATED y genera el plan de migración." },
          { icon: "🧼", name: "Clean Core Score", what: "La métrica que SAP exige.", how: "Puntuación + plan de remediación.", do: "Reduce las deducciones de mayor peso; muestra el score al cliente." },
          { icon: "🧾", name: "Fiscal (DRC)", what: "NF-e/SEFAZ: rechazo, contingencia, cola.", how: "Lista con valor en R$ y reproceso.", do: "Reprocesa los bloqueados; sigue el R$ en riesgo." },
        ],
      },
      {
        title: "5. Innovación exclusiva", color: "#f472b6",
        intro: "Los diferenciales que nadie tiene — úsalos como argumento y como herramienta de operación.",
        topics: [
          { icon: "🛰️", name: "Red Federada", what: "Corrección ganadora aprendida de toda la base.", how: "Por firma de falla (anónimo).", do: "Aplica la corrección comprobada en vez de empezar de cero." },
          { icon: "🔗", name: "Causa cross-capa", what: "Liga el transport a la falla que vino después.", how: "Correlación en el tiempo con % de confianza.", do: "Confirma el transport sospechoso con el equipo ABAP." },
          { icon: "🤖", name: "AMS Autónomo", what: "Self-healing con marcador.", how: "Política de confianza + acciones permitidas.", do: "Activa el piloto automático para la rutina de L1." },
          { icon: "💸", name: "Dinero en riesgo", what: "Falla técnica en R$ en vivo.", how: "Costo/hora + fiscal, por proceso.", do: "Configura costo/hora en las integraciones y prioriza por caja." },
          { icon: "🧨", name: "Pre-vuelo de cambio", what: "Blast radius antes del deploy.", how: "Score de riesgo + plan de prueba por transport.", do: "Antes de subir a PRD, prueba lo que el radio apunta." },
          { icon: "⏪", name: "Time machine", what: "Replay del incidente + '¿y si?'.", how: "Timeline + contrafactual de R$.", do: "Usa el R$ ahorrado en la reunión de renovación." },
          { icon: "🛡️", name: "Auditoría y SoD", what: "Rastro de cambios + segregación de funciones.", how: "Violaciones en rojo + evidencias por IA.", do: "Genera el paquete de evidencias para el auditor." },
          { icon: "🤝", name: "Socios y FinOps", what: "Quién manda datos malos + costo de BTP.", how: "Ranking de error por socio y costo por IFlow.", do: "Cobra al socio infractor y corta el IFlow que quema crédito." },
        ],
      },
      {
        title: "6. Valor, SLA y confianza", color: "#60a5fa",
        intro: "Cómo convertir la operación en prueba de valor que renueva el contrato.",
        topics: [
          { icon: "📈", name: "SLA e Impacto", what: "Compliance por cliente + R$ en riesgo.", how: "Define metas y costo/hora; genera el informe de SLA por IA.", do: "Lleva el informe (PDF) a la reunión mensual." },
          { icon: "🪪", name: "Portal del cliente", what: "Vista white-label de solo lectura para el cliente final.", how: "Actívalo y personaliza la marca.", do: "Comparte el enlace — transparencia que fideliza." },
          { icon: "📣", name: "On-call y Tickets", what: "Notificación multicanal + Jira/ServiceNow.", how: "Canales por severidad + escalamiento.", do: "Configura el canal de guardia y el tiempo de escalamiento." },
        ],
      },
    ],
  },
};
