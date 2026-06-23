"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang, type Lang } from "@/i18n/I18n";

interface Guide { what: string; why: string; actions: string[] }

// Rótulos estáticos da UI por idioma.
const LBL: Record<Lang, { whatIs: string; whyMatters: string; doNow: string; hideSteps: string; whatDoIDo: string; hideOnScreen: string }> = {
  pt: {
    whatIs: "O que é:",
    whyMatters: "Por que importa:",
    doNow: "O que fazer agora",
    hideSteps: "Ocultar passos",
    whatDoIDo: "O que faço com isso? →",
    hideOnScreen: "Ocultar nesta tela",
  },
  en: {
    whatIs: "What it is:",
    whyMatters: "Why it matters:",
    doNow: "What to do now",
    hideSteps: "Hide steps",
    whatDoIDo: "What do I do with this? →",
    hideOnScreen: "Hide on this screen",
  },
  es: {
    whatIs: "Qué es:",
    whyMatters: "Por qué importa:",
    doNow: "Qué hacer ahora",
    hideSteps: "Ocultar pasos",
    whatDoIDo: "¿Qué hago con esto? →",
    hideOnScreen: "Ocultar en esta pantalla",
  },
};

// Registro de contexto por rota: o QUE é a tela, POR QUE importa e O QUE fazer.
// Resolve por prefixo (mais específico primeiro).
const GUIDES: Record<string, Record<Lang, Guide>> = {
  "/dashboard": {
    pt: {
      what: "Visão geral da saúde de toda a sua carteira de clientes SAP.",
      why: "É o seu ponto de partida do dia: mostra rápido quem está bem e quem precisa de atenção.",
      actions: ["Comece pelos clientes com health mais baixo ou alertas abertos", "Clique num cliente para ver as integrações e agir"],
    },
    en: {
      what: "An overview of the health of your entire portfolio of SAP clients.",
      why: "It's your starting point for the day: it quickly shows who's doing well and who needs attention.",
      actions: ["Start with the clients that have the lowest health or open alerts", "Click a client to see their integrations and take action"],
    },
    es: {
      what: "Una visión general de la salud de toda tu cartera de clientes SAP.",
      why: "Es tu punto de partida del día: muestra rápidamente quién está bien y quién necesita atención.",
      actions: ["Empieza por los clientes con el health más bajo o con alertas abiertas", "Haz clic en un cliente para ver las integraciones y actuar"],
    },
  },
  "/clients": {
    pt: {
      what: "Seus clientes monitorados, com health score e nº de alertas.",
      why: "Cada cliente é um contrato. O health score é a sua prova de valor entregue.",
      actions: ["Priorize quem está abaixo de 80 de health", "Abra o cliente para ver integrações, alertas e diagnósticos"],
    },
    en: {
      what: "Your monitored clients, with health score and number of alerts.",
      why: "Each client is a contract. The health score is your proof of delivered value.",
      actions: ["Prioritize those below 80 in health", "Open the client to see integrations, alerts and diagnostics"],
    },
    es: {
      what: "Tus clientes monitoreados, con health score y número de alertas.",
      why: "Cada cliente es un contrato. El health score es tu prueba del valor entregado.",
      actions: ["Prioriza a quienes están por debajo de 80 de health", "Abre el cliente para ver integraciones, alertas y diagnósticos"],
    },
  },
  "/integrations": {
    pt: {
      what: "Todas as integrações (IDoc, CPI, RFC, OData) com status, latência e erro.",
      why: "É onde o problema realmente acontece — e onde você prova que está no controle.",
      actions: ["Olhe as que estão em ERROR/OFFLINE primeiro", "Use 'Diagnosticar com IA' para causa raiz e correção"],
    },
    en: {
      what: "All integrations (IDoc, CPI, RFC, OData) with status, latency and errors.",
      why: "It's where the problem actually happens — and where you prove you're in control.",
      actions: ["Look at the ones in ERROR/OFFLINE first", "Use 'Diagnose with AI' for root cause and fix"],
    },
    es: {
      what: "Todas las integraciones (IDoc, CPI, RFC, OData) con estado, latencia y error.",
      why: "Es donde el problema realmente ocurre — y donde demuestras que tienes el control.",
      actions: ["Mira primero las que están en ERROR/OFFLINE", "Usa 'Diagnosticar con IA' para causa raíz y corrección"],
    },
  },
  "/cockpit": {
    pt: {
      what: "Cockpit operacional de IDocs em erro e filas (qRFC/tRFC) travadas, multi-cliente.",
      why: "Substitui logar em vários SAPs (BD87/SMQ2/SM58) por uma tela só.",
      actions: ["Filtre por cliente ou tipo", "Peça remediação nos itens marcados como remediáveis"],
    },
    en: {
      what: "An operational cockpit for IDocs in error and stuck queues (qRFC/tRFC), multi-client.",
      why: "It replaces logging into several SAP systems (BD87/SMQ2/SM58) with a single screen.",
      actions: ["Filter by client or type", "Request remediation on items flagged as remediable"],
    },
    es: {
      what: "Cockpit operativo de IDocs en error y colas (qRFC/tRFC) trabadas, multicliente.",
      why: "Reemplaza el ingreso a varios SAP (BD87/SMQ2/SM58) por una sola pantalla.",
      actions: ["Filtra por cliente o tipo", "Solicita remediación en los ítems marcados como remediables"],
    },
  },
  "/alerts": {
    pt: {
      what: "Tudo que disparou alerta e ainda não foi resolvido.",
      why: "É a sua fila de trabalho priorizada por severidade.",
      actions: ["Resolva os CRITICAL/HIGH primeiro", "Alertas resolvem sozinhos quando a integração se recupera"],
    },
    en: {
      what: "Everything that triggered an alert and hasn't been resolved yet.",
      why: "It's your work queue, prioritized by severity.",
      actions: ["Resolve the CRITICAL/HIGH ones first", "Alerts resolve themselves when the integration recovers"],
    },
    es: {
      what: "Todo lo que disparó una alerta y aún no se resolvió.",
      why: "Es tu cola de trabajo priorizada por severidad.",
      actions: ["Resuelve primero los CRITICAL/HIGH", "Las alertas se resuelven solas cuando la integración se recupera"],
    },
  },
  "/diagnostics": {
    pt: {
      what: "Diagnóstico de IA sob demanda para um cliente/ambiente.",
      why: "Transforma um erro técnico em causa raiz + passos de correção + prevenção.",
      actions: ["Escolha o cliente e rode um preset", "Baixe o PDF para anexar no chamado"],
    },
    en: {
      what: "On-demand AI diagnostics for a client/environment.",
      why: "It turns a technical error into root cause + fix steps + prevention.",
      actions: ["Pick the client and run a preset", "Download the PDF to attach to the ticket"],
    },
    es: {
      what: "Diagnóstico de IA bajo demanda para un cliente/ambiente.",
      why: "Convierte un error técnico en causa raíz + pasos de corrección + prevención.",
      actions: ["Elige el cliente y ejecuta un preset", "Descarga el PDF para adjuntarlo al ticket"],
    },
  },
  "/ask": {
    pt: {
      what: "Copiloto que enxerga a carteira inteira — pergunte em português.",
      why: "Resposta acionável sem precisar montar relatório.",
      actions: ["Pergunte 'quais clientes têm erro agora?'", "Peça um resumo da saúde da carteira"],
    },
    en: {
      what: "A copilot that sees your entire portfolio — just ask in plain language.",
      why: "Actionable answers without having to build a report.",
      actions: ["Ask 'which clients have errors right now?'", "Request a summary of the portfolio's health"],
    },
    es: {
      what: "Copiloto que ve toda la cartera — pregunta en lenguaje natural.",
      why: "Respuestas accionables sin tener que armar un informe.",
      actions: ["Pregunta '¿qué clientes tienen error ahora?'", "Pide un resumen de la salud de la cartera"],
    },
  },
  "/predict": {
    pt: {
      what: "Previsão de falha (tendência/anomalia) e benchmark da carteira.",
      why: "Antecipa o incidente antes da parada e mostra como você está vs o mercado.",
      actions: ["Veja o que tende a piorar e aja antes", "Use o benchmark como argumento comercial"],
    },
    en: {
      what: "Failure prediction (trend/anomaly) and portfolio benchmark.",
      why: "It anticipates the incident before the outage and shows how you compare to the market.",
      actions: ["See what tends to get worse and act ahead of time", "Use the benchmark as a sales argument"],
    },
    es: {
      what: "Predicción de fallas (tendencia/anomalía) y benchmark de la cartera.",
      why: "Anticipa el incidente antes de la caída y muestra cómo estás frente al mercado.",
      actions: ["Mira lo que tiende a empeorar y actúa antes", "Usa el benchmark como argumento comercial"],
    },
  },
  "/catalog": {
    pt: {
      what: "Inventário vivo de interfaces (parceiros, destinos RFC, serviços OData).",
      why: "Documentação que não envelhece — base para análise de impacto e onboarding.",
      actions: ["Confira interfaces inativadas recentemente", "Use como mapa do landscape do cliente"],
    },
    en: {
      what: "A live inventory of interfaces (partners, RFC destinations, OData services).",
      why: "Documentation that never goes stale — a basis for impact analysis and onboarding.",
      actions: ["Check interfaces that were recently deactivated", "Use it as a map of the client's landscape"],
    },
    es: {
      what: "Inventario vivo de interfaces (partners, destinos RFC, servicios OData).",
      why: "Documentación que no envejece — base para análisis de impacto y onboarding.",
      actions: ["Revisa las interfaces desactivadas recientemente", "Úsalo como mapa del landscape del cliente"],
    },
  },
  "/validity": {
    pt: {
      what: "Radar de certificados, senhas e tokens próximos do vencimento.",
      why: "Evita a parada mais boba e mais comum: algo expirou.",
      actions: ["Renove o que está em CRITICAL/EXPIRED", "Acompanhe o que vence em 30 dias"],
    },
    en: {
      what: "A radar for certificates, passwords and tokens nearing expiration.",
      why: "It prevents the silliest and most common outage: something expired.",
      actions: ["Renew what's in CRITICAL/EXPIRED", "Keep track of what expires within 30 days"],
    },
    es: {
      what: "Radar de certificados, contraseñas y tokens próximos a vencer.",
      why: "Evita la caída más tonta y más común: algo venció.",
      actions: ["Renueva lo que está en CRITICAL/EXPIRED", "Da seguimiento a lo que vence en 30 días"],
    },
  },
  "/dead-code": {
    pt: {
      what: "Objetos ABAP custom sem uso (candidatos a aposentar).",
      why: "Menos código morto = upgrade mais barato e Clean Core melhor.",
      actions: ["Comece pelos marcados como APOSENTAR", "Revise os de uso esporádico antes de remover"],
    },
    en: {
      what: "Unused custom ABAP objects (candidates for retirement).",
      why: "Less dead code = cheaper upgrades and a better Clean Core.",
      actions: ["Start with the ones flagged as APOSENTAR", "Review the rarely-used ones before removing them"],
    },
    es: {
      what: "Objetos ABAP custom sin uso (candidatos a retirar).",
      why: "Menos código muerto = upgrade más barato y mejor Clean Core.",
      actions: ["Empieza por los marcados como APOSENTAR", "Revisa los de uso esporádico antes de eliminarlos"],
    },
  },
  "/s4": {
    pt: {
      what: "Painel do S/4HANA Cloud: APIs, Clean Core, fiscal, upgrade, eventos.",
      why: "É o carro-chefe — cobre o que falta na edição que a SAP empurra em todos.",
      actions: ["Conecte o cliente (sandbox/Comm Arrangement)", "Ataque primeiro as APIs depreciadas e o Clean Core"],
    },
    en: {
      what: "The S/4HANA Cloud panel: APIs, Clean Core, fiscal, upgrade, events.",
      why: "It's the flagship — it covers what's missing in the edition SAP pushes on everyone.",
      actions: ["Connect the client (sandbox/Comm Arrangement)", "Tackle the deprecated APIs and Clean Core first"],
    },
    es: {
      what: "Panel de S/4HANA Cloud: APIs, Clean Core, fiscal, upgrade, eventos.",
      why: "Es el producto estrella — cubre lo que falta en la edición que SAP impone a todos.",
      actions: ["Conecta el cliente (sandbox/Comm Arrangement)", "Ataca primero las APIs deprecadas y el Clean Core"],
    },
  },
  "/upgrade": {
    pt: {
      what: "Radar de Upgrade: o que vai quebrar/depreciar no próximo release.",
      why: "Upgrade 2×/ano sem surpresa — mapeado ao que o cliente realmente usa.",
      actions: ["Priorize os itens BREAKING e DEPRECATED", "Gere o plano de migração antes da janela"],
    },
    en: {
      what: "Upgrade radar: what will break/be deprecated in the next release.",
      why: "Two upgrades a year with no surprises — mapped to what the client actually uses.",
      actions: ["Prioritize the BREAKING and DEPRECATED items", "Generate the migration plan before the window"],
    },
    es: {
      what: "Radar de Upgrade: qué se romperá/deprecará en el próximo release.",
      why: "Dos upgrades al año sin sorpresas — mapeado a lo que el cliente realmente usa.",
      actions: ["Prioriza los ítems BREAKING y DEPRECATED", "Genera el plan de migración antes de la ventana"],
    },
  },
  "/cleancore": {
    pt: {
      what: "Clean Core Score — aderência ao padrão que a própria SAP cobra.",
      why: "Score baixo = upgrade caro e risco. Vira serviço de governança recorrente.",
      actions: ["Reduza as deduções de maior severidade", "Mostre o score ao cliente como meta a evoluir"],
    },
    en: {
      what: "Clean Core Score — adherence to the standard SAP itself requires.",
      why: "A low score = costly upgrades and risk. It becomes a recurring governance service.",
      actions: ["Reduce the highest-severity deductions", "Show the score to the client as a goal to improve"],
    },
    es: {
      what: "Clean Core Score — adherencia al estándar que la propia SAP exige.",
      why: "Score bajo = upgrade caro y riesgo. Se convierte en un servicio de gobernanza recurrente.",
      actions: ["Reduce las deducciones de mayor severidad", "Muestra el score al cliente como meta a evolucionar"],
    },
  },
  "/fiscal": {
    pt: {
      what: "Cockpit fiscal: documentos (NF-e/faturas) e o que está bloqueado.",
      why: "Documento fiscal parado é faturamento parado — dinheiro real.",
      actions: ["Reprocesse os bloqueados (rejeição/contingência)", "Acompanhe o R$ em risco no topo"],
    },
    en: {
      what: "Fiscal cockpit: documents (NF-e/invoices) and what's blocked.",
      why: "A stuck fiscal document is stuck billing — real money.",
      actions: ["Reprocess the blocked ones (rejection/contingency)", "Track the R$ at risk at the top"],
    },
    es: {
      what: "Cockpit fiscal: documentos (NF-e/facturas) y lo que está bloqueado.",
      why: "Un documento fiscal detenido es facturación detenida — dinero real.",
      actions: ["Reprocesa los bloqueados (rechazo/contingencia)", "Da seguimiento al R$ en riesgo en la parte superior"],
    },
  },
  "/events": {
    pt: {
      what: "Eventos do Event Mesh: entregues, em retry e dead-letter.",
      why: "Evento em dead-letter é integração que silenciosamente parou.",
      actions: ["Investigue os DEAD_LETTER primeiro", "Acompanhe o lag dos assinantes"],
    },
    en: {
      what: "Event Mesh events: delivered, in retry and dead-letter.",
      why: "An event in dead-letter is an integration that silently stopped.",
      actions: ["Investigate the DEAD_LETTER ones first", "Track the subscribers' lag"],
    },
    es: {
      what: "Eventos del Event Mesh: entregados, en retry y dead-letter.",
      why: "Un evento en dead-letter es una integración que se detuvo en silencio.",
      actions: ["Investiga primero los DEAD_LETTER", "Da seguimiento al lag de los suscriptores"],
    },
  },
  "/cloud": {
    pt: {
      what: "Mensagens reais do CPI/AIF (MPL/IFlows) com status e erro.",
      why: "É onde a integração de nuvem falha de verdade — e onde a IA atua.",
      actions: ["Filtre por FALHA", "Use 'Diagnosticar com IA' e 'Gerar correção pronta'"],
    },
    en: {
      what: "Real CPI/AIF messages (MPL/IFlows) with status and errors.",
      why: "It's where cloud integration actually fails — and where the AI steps in.",
      actions: ["Filter by FAILURE", "Use 'Diagnose with AI' and 'Generate ready-made fix'"],
    },
    es: {
      what: "Mensajes reales de CPI/AIF (MPL/IFlows) con estado y error.",
      why: "Es donde la integración en la nube falla de verdad — y donde actúa la IA.",
      actions: ["Filtra por FALLA", "Usa 'Diagnosticar con IA' y 'Generar corrección lista'"],
    },
  },
  "/transports": {
    pt: {
      what: "Transports (STMS) importados recentemente.",
      why: "A maioria das falhas vem logo depois de uma mudança subir.",
      actions: ["Cruze com falhas na tela 'Causa cross-camada'", "Acompanhe o que foi pra PRD"],
    },
    en: {
      what: "Recently imported transports (STMS).",
      why: "Most failures come right after a change goes live.",
      actions: ["Cross-reference with failures on the 'Cross-layer cause' screen", "Track what went to PRD"],
    },
    es: {
      what: "Transports (STMS) importados recientemente.",
      why: "La mayoría de las fallas aparecen justo después de subir un cambio.",
      actions: ["Cruza con las fallas en la pantalla 'Causa cross-capa'", "Da seguimiento a lo que fue a PRD"],
    },
  },
  "/sla": {
    pt: {
      what: "SLA por cliente, compliance e impacto em R$.",
      why: "É a prova de valor que renova contrato — e prioriza pelo que dói no caixa.",
      actions: ["Gere o relatório de SLA por IA (com PDF)", "Defina custo/hora nas integrações para o R$ em risco"],
    },
    en: {
      what: "SLA per client, compliance and impact in R$.",
      why: "It's the proof of value that renews contracts — and it prioritizes by what hurts the cash flow.",
      actions: ["Generate the SLA report with AI (with PDF)", "Set cost/hour on integrations to surface the R$ at risk"],
    },
    es: {
      what: "SLA por cliente, compliance e impacto en R$.",
      why: "Es la prueba de valor que renueva el contrato — y prioriza por lo que duele en la caja.",
      actions: ["Genera el informe de SLA con IA (con PDF)", "Define costo/hora en las integraciones para el R$ en riesgo"],
    },
  },
  "/reports": {
    pt: {
      what: "Relatórios prontos (mensal, migração, ROI, executivo).",
      why: "Material pronto para reunião com o cliente, sem trabalho manual.",
      actions: ["Escolha o cliente e o tipo de relatório", "Exporte e leve para a reunião"],
    },
    en: {
      what: "Ready-made reports (monthly, migration, ROI, executive).",
      why: "Material ready for the client meeting, with no manual work.",
      actions: ["Pick the client and the report type", "Export it and take it to the meeting"],
    },
    es: {
      what: "Informes listos (mensual, migración, ROI, ejecutivo).",
      why: "Material listo para la reunión con el cliente, sin trabajo manual.",
      actions: ["Elige el cliente y el tipo de informe", "Expórtalo y llévalo a la reunión"],
    },
  },
  "/federated": {
    pt: {
      what: "Rede Federada: falhas e correções aprendidas de toda a base (anônimo).",
      why: "Quando algo falha, você já tem a correção que funcionou em outros ambientes.",
      actions: ["Veja a correção vencedora de cada assinatura", "Use como base de conhecimento da equipe"],
    },
    en: {
      what: "Federated Network: failures and fixes learned across the whole base (anonymous).",
      why: "When something fails, you already have the fix that worked in other environments.",
      actions: ["See the winning fix for each signature", "Use it as the team's knowledge base"],
    },
    es: {
      what: "Red Federada: fallas y correcciones aprendidas de toda la base (anónimo).",
      why: "Cuando algo falla, ya tienes la corrección que funcionó en otros ambientes.",
      actions: ["Mira la corrección ganadora de cada firma", "Úsala como base de conocimiento del equipo"],
    },
  },
  "/causal": {
    pt: {
      what: "Liga a mudança (transport) à falha que veio depois.",
      why: "Achar a causa em minutos em vez de horas de investigação.",
      actions: ["Olhe a causa provável e a confiança", "Confirme o transport suspeito com o time ABAP"],
    },
    en: {
      what: "It links the change (transport) to the failure that followed.",
      why: "Find the cause in minutes instead of hours of investigation.",
      actions: ["Look at the likely cause and the confidence", "Confirm the suspect transport with the ABAP team"],
    },
    es: {
      what: "Vincula el cambio (transport) con la falla que vino después.",
      why: "Encontrar la causa en minutos en lugar de horas de investigación.",
      actions: ["Mira la causa probable y la confianza", "Confirma el transport sospechoso con el equipo ABAP"],
    },
  },
  "/autoheal": {
    pt: {
      what: "AMS Autônomo: correções automáticas de alta confiança + placar.",
      why: "Reduz o trabalho manual de L1/L2 e dá um número vendável (% sem humano).",
      actions: ["Ligue o piloto automático e ajuste a confiança mínima", "Escolha as ações permitidas"],
    },
    en: {
      what: "Autonomous AMS: high-confidence automatic fixes + scoreboard.",
      why: "It reduces L1/L2 manual work and gives you a sellable number (% with no human).",
      actions: ["Turn on autopilot and set the minimum confidence", "Choose the allowed actions"],
    },
    es: {
      what: "AMS Autónomo: correcciones automáticas de alta confianza + marcador.",
      why: "Reduce el trabajo manual de L1/L2 y da un número vendible (% sin humano).",
      actions: ["Activa el piloto automático y ajusta la confianza mínima", "Elige las acciones permitidas"],
    },
  },
  "/money": {
    pt: {
      what: "Dinheiro em risco ao vivo, por processo de negócio.",
      why: "Traduz falha técnica em R$ — a linguagem que o diretor entende.",
      actions: ["Configure custo/hora e processo nas integrações", "Priorize o processo com mais R$ parado"],
    },
    en: {
      what: "Money at risk live, by business process.",
      why: "It translates a technical failure into R$ — the language the director understands.",
      actions: ["Set up cost/hour and process on the integrations", "Prioritize the process with the most R$ stalled"],
    },
    es: {
      what: "Dinero en riesgo en vivo, por proceso de negocio.",
      why: "Traduce la falla técnica a R$ — el lenguaje que el director entiende.",
      actions: ["Configura costo/hora y proceso en las integraciones", "Prioriza el proceso con más R$ detenido"],
    },
  },
  "/recon": {
    pt: {
      what: "Reconciliação ponta-a-ponta: o documento percorreu toda a jornada?",
      why: "'Entregue' não é 'virou negócio' — aqui você vê onde o volume se perde.",
      actions: ["Defina os estágios do processo (ex.: Pedido → Ordem → Fatura)", "Ataque o maior vazamento entre estágios"],
    },
    en: {
      what: "End-to-end reconciliation: did the document go through the entire journey?",
      why: "'Delivered' isn't 'became business' — here you see where volume gets lost.",
      actions: ["Define the process stages (e.g. Request → Order → Invoice)", "Tackle the biggest leak between stages"],
    },
    es: {
      what: "Reconciliación de punta a punta: ¿el documento recorrió todo el camino?",
      why: "'Entregado' no es 'se volvió negocio' — aquí ves dónde se pierde el volumen.",
      actions: ["Define las etapas del proceso (ej.: Pedido → Orden → Factura)", "Ataca la mayor fuga entre etapas"],
    },
  },
  "/anomaly": {
    pt: {
      what: "Perda silenciosa: queda de volume mesmo com tudo verde.",
      why: "Captura receita parando antes de virar reclamação do cliente.",
      actions: ["Investigue os fluxos marcados como QUEDA/PAROU", "Compare esperado vs atual"],
    },
    en: {
      what: "Silent loss: a drop in volume even with everything green.",
      why: "It catches revenue stalling before it turns into a client complaint.",
      actions: ["Investigate the flows flagged as DROP/STOPPED", "Compare expected vs actual"],
    },
    es: {
      what: "Pérdida silenciosa: caída de volumen aun con todo en verde.",
      why: "Detecta ingresos deteniéndose antes de que se vuelvan un reclamo del cliente.",
      actions: ["Investiga los flujos marcados como CAÍDA/SE DETUVO", "Compara lo esperado vs lo actual"],
    },
  },
  "/chatops": {
    pt: {
      what: "Opere o SAP por mensagem (WhatsApp/Telegram).",
      why: "Plantão responde de qualquer lugar, sem abrir o painel.",
      actions: ["Teste comandos no console", "Gere o token e conecte seu canal"],
    },
    en: {
      what: "Operate SAP by message (WhatsApp/Telegram).",
      why: "On-call can respond from anywhere, without opening the dashboard.",
      actions: ["Test commands in the console", "Generate the token and connect your channel"],
    },
    es: {
      what: "Opera SAP por mensaje (WhatsApp/Telegram).",
      why: "La guardia responde desde cualquier lugar, sin abrir el panel.",
      actions: ["Prueba comandos en la consola", "Genera el token y conecta tu canal"],
    },
  },
  "/notifications": {
    pt: {
      what: "On-call multicanal e integração com tickets (Jira/ServiceNow).",
      why: "Garante que nenhum alerta cai no vácuo e que o ITSM fica coerente.",
      actions: ["Configure os canais por severidade", "Defina o tempo de escalonamento"],
    },
    en: {
      what: "Multichannel on-call and ticket integration (Jira/ServiceNow).",
      why: "It ensures no alert falls through the cracks and the ITSM stays consistent.",
      actions: ["Set up the channels by severity", "Define the escalation time"],
    },
    es: {
      what: "On-call multicanal e integración con tickets (Jira/ServiceNow).",
      why: "Garantiza que ninguna alerta caiga al vacío y que el ITSM quede coherente.",
      actions: ["Configura los canales por severidad", "Define el tiempo de escalamiento"],
    },
  },
  "/billing": {
    pt: {
      what: "Sua assinatura, faturas e add-ons do SAPLINK.",
      why: "Mantém o serviço ativo e mostra o que está contratado.",
      actions: ["Acompanhe a próxima fatura", "Adicione integrações/usuários conforme cresce"],
    },
    en: {
      what: "Your SAPLINK subscription, invoices and add-ons.",
      why: "It keeps the service active and shows what's contracted.",
      actions: ["Track the next invoice", "Add integrations/users as you grow"],
    },
    es: {
      what: "Tu suscripción, facturas y add-ons de SAPLINK.",
      why: "Mantiene el servicio activo y muestra lo que está contratado.",
      actions: ["Da seguimiento a la próxima factura", "Agrega integraciones/usuarios a medida que creces"],
    },
  },
  "/preflight": {
    pt: {
      what: "Pré-voo de mudança: o raio de impacto de um transport antes de ir pra produção.",
      why: "Evita a parada pós-deploy — você sabe o que vai mexer e testa o certo.",
      actions: ["Escolha o transport a subir", "Veja o score de risco e o que será afetado", "Siga o plano de teste antes do import"],
    },
    en: {
      what: "Change preflight: the blast radius of a transport before it goes to production.",
      why: "It prevents the post-deploy outage — you know what will be touched and test the right thing.",
      actions: ["Pick the transport to deploy", "See the risk score and what will be affected", "Follow the test plan before the import"],
    },
    es: {
      what: "Preflight de cambio: el radio de impacto de un transport antes de ir a producción.",
      why: "Evita la caída post-deploy — sabes qué se va a tocar y pruebas lo correcto.",
      actions: ["Elige el transport a subir", "Mira el score de riesgo y qué será afectado", "Sigue el plan de prueba antes del import"],
    },
  },
  "/timemachine": {
    pt: {
      what: "Reconstrói a linha do tempo de um incidente + o quanto teria sido economizado com detecção rápida.",
      why: "Prova de ROI irrefutável e aprendizado de causa.",
      actions: ["Escolha o incidente", "Veja a sequência de eventos", "Use o contrafactual de R$ na renovação"],
    },
    en: {
      what: "It rebuilds an incident's timeline + how much would have been saved with fast detection.",
      why: "Irrefutable ROI proof and root-cause learning.",
      actions: ["Pick the incident", "See the sequence of events", "Use the R$ counterfactual in the renewal"],
    },
    es: {
      what: "Reconstruye la línea de tiempo de un incidente + cuánto se habría ahorrado con detección rápida.",
      why: "Prueba de ROI irrefutable y aprendizaje de causa.",
      actions: ["Elige el incidente", "Mira la secuencia de eventos", "Usa el contrafactual de R$ en la renovación"],
    },
  },
  "/audit": {
    pt: {
      what: "Trilha de mudanças e remediações com checagem de segregação de função (SoD).",
      why: "Compliance pronto para o auditor, sem montar planilha.",
      actions: ["Revise as violações SoD em vermelho", "Gere o pacote de evidências com IA"],
    },
    en: {
      what: "An audit trail of changes and remediations with segregation-of-duties (SoD) checking.",
      why: "Compliance ready for the auditor, with no spreadsheet to build.",
      actions: ["Review the SoD violations in red", "Generate the evidence package with AI"],
    },
    es: {
      what: "Trazabilidad de cambios y remediaciones con verificación de segregación de funciones (SoD).",
      why: "Compliance listo para el auditor, sin armar una planilla.",
      actions: ["Revisa las violaciones SoD en rojo", "Genera el paquete de evidencias con IA"],
    },
  },
  "/partners": {
    pt: {
      what: "Ranking de parceiros EDI por dado ruim + custo estimado de BTP por IFlow.",
      why: "Cobra o parceiro certo e controla o gasto de nuvem.",
      actions: ["Aja sobre o parceiro com mais erros", "Veja o IFlow que mais consome BTP"],
    },
    en: {
      what: "A ranking of EDI partners by bad data + estimated BTP cost per IFlow.",
      why: "It holds the right partner accountable and controls cloud spend.",
      actions: ["Act on the partner with the most errors", "See the IFlow that consumes the most BTP"],
    },
    es: {
      what: "Ranking de partners EDI por dato malo + costo estimado de BTP por IFlow.",
      why: "Le cobra al partner correcto y controla el gasto de nube.",
      actions: ["Actúa sobre el partner con más errores", "Mira el IFlow que más consume BTP"],
    },
  },
  "/ops": {
    pt: {
      what: "Saúde de Basis & Operações coletada pelo agente: PI/PO, jobs, dumps ABAP, update errors, locks, Gateway/OData, HANA e segurança/patch.",
      why: "Centraliza o que hoje exige logar em vários SAPs (SM37/ST22/SM13/SM12/SM21) — visão multi-cliente do que está pegando fogo.",
      actions: ["Ataque CRITICAL/HIGH primeiro", "Filtre por categoria (ex.: só dumps)", "Resolva o que já foi tratado para limpar a fila"],
    },
    en: {
      what: "Basis & Operations health collected by the agent: PI/PO, jobs, ABAP dumps, update errors, locks, Gateway/OData, HANA and security/patch.",
      why: "It centralizes what today requires logging into several SAP systems (SM37/ST22/SM13/SM12/SM21) — a multi-client view of what's on fire.",
      actions: ["Tackle CRITICAL/HIGH first", "Filter by category (e.g. dumps only)", "Resolve what's already handled to clear the queue"],
    },
    es: {
      what: "Salud de Basis & Operaciones recolectada por el agente: PI/PO, jobs, dumps ABAP, update errors, locks, Gateway/OData, HANA y seguridad/patch.",
      why: "Centraliza lo que hoy exige ingresar a varios SAP (SM37/ST22/SM13/SM12/SM21) — visión multicliente de lo que está ardiendo.",
      actions: ["Ataca CRITICAL/HIGH primero", "Filtra por categoría (ej.: solo dumps)", "Resuelve lo ya tratado para limpiar la cola"],
    },
  },
  "/btp": {
    pt: {
      what: "Inventário e radar de validade dos recursos da SAP BTP por cliente (service keys, bindings, destinations, quotas, apps).",
      why: "Secret/destination vencida derruba integração sem aviso. Aqui você vê o que vai expirar antes do apagão.",
      actions: ["Cadastre service keys e destinations com a data de validade", "Aja nos EXPIRED e nos que vencem ≤30d", "Acompanhe quotas perto do limite"],
    },
    en: {
      what: "Inventory and validity radar for SAP BTP resources per client (service keys, bindings, destinations, quotas, apps).",
      why: "An expired secret/destination takes down an integration without warning. Here you see what will expire before the blackout.",
      actions: ["Register service keys and destinations with their expiration date", "Act on the EXPIRED ones and those expiring within 30d", "Track quotas near the limit"],
    },
    es: {
      what: "Inventario y radar de validez de los recursos de SAP BTP por cliente (service keys, bindings, destinations, quotas, apps).",
      why: "Un secret/destination vencido tumba una integración sin aviso. Aquí ves lo que va a expirar antes del apagón.",
      actions: ["Registra service keys y destinations con la fecha de validez", "Actúa en los EXPIRED y en los que vencen en ≤30d", "Da seguimiento a quotas cerca del límite"],
    },
  },
  "/connectors": {
    pt: {
      what: "Conecta Ariba e SuccessFactors de cada cliente com a chave (API Key) dele.",
      why: "Amplia o monitoramento além do S/4 — uma só tela pra todo o portfólio SAP Cloud do cliente.",
      actions: ["Conectar: cole a API Key do produto do cliente", "Sincronizar pra inventariar as APIs ao vivo", "Veja o inventário no Catálogo vivo"],
    },
    en: {
      what: "Connects each client's Ariba and SuccessFactors with their own API Key.",
      why: "It extends monitoring beyond S/4 — a single screen for the client's entire SAP Cloud portfolio.",
      actions: ["Connect: paste the client's product API Key", "Sync to inventory the APIs live", "See the inventory in the live Catalog"],
    },
    es: {
      what: "Conecta Ariba y SuccessFactors de cada cliente con su propia API Key.",
      why: "Amplía el monitoreo más allá de S/4 — una sola pantalla para todo el portafolio SAP Cloud del cliente.",
      actions: ["Conectar: pega la API Key del producto del cliente", "Sincronizar para inventariar las APIs en vivo", "Mira el inventario en el Catálogo vivo"],
    },
  },
  "/sso": {
    pt: {
      what: "Login corporativo (SSO) via Azure AD, Google ou Okta — seu time entra com a conta da empresa.",
      why: "Menos senhas, provisionamento centralizado e a segurança (MFA) do seu IdP. Requisito de muitos clientes enterprise.",
      actions: ["Cadastre o Redirect URI no seu IdP", "Cole Client ID/Secret/Issuer", "Habilite e teste o login pelo domínio"],
    },
    en: {
      what: "Corporate login (SSO) via Azure AD, Google or Okta — your team signs in with the company account.",
      why: "Fewer passwords, centralized provisioning and your IdP's security (MFA). A requirement for many enterprise clients.",
      actions: ["Register the Redirect URI in your IdP", "Paste Client ID/Secret/Issuer", "Enable and test login through the domain"],
    },
    es: {
      what: "Login corporativo (SSO) vía Azure AD, Google u Okta — tu equipo entra con la cuenta de la empresa.",
      why: "Menos contraseñas, aprovisionamiento centralizado y la seguridad (MFA) de tu IdP. Requisito de muchos clientes enterprise.",
      actions: ["Registra el Redirect URI en tu IdP", "Pega Client ID/Secret/Issuer", "Habilita y prueba el login por el dominio"],
    },
  },
  "/marketplace": {
    pt: {
      what: "Loja de runbooks: playbooks de correção SAP prontos (diagnóstico → ação → validação).",
      why: "Instale a expertise da comunidade em vez de começar do zero; publique a sua e ganhe reputação.",
      actions: ["Explore e instale os mais bem avaliados", "Publique um runbook do seu time", "Avalie os que você usou"],
    },
    en: {
      what: "A runbook store: ready-made SAP fix playbooks (diagnosis → action → validation).",
      why: "Install the community's expertise instead of starting from scratch; publish yours and earn reputation.",
      actions: ["Browse and install the top-rated ones", "Publish a runbook from your team", "Rate the ones you've used"],
    },
    es: {
      what: "Tienda de runbooks: playbooks de corrección SAP listos (diagnóstico → acción → validación).",
      why: "Instala la experiencia de la comunidad en vez de empezar de cero; publica el tuyo y gana reputación.",
      actions: ["Explora e instala los mejor valorados", "Publica un runbook de tu equipo", "Califica los que hayas usado"],
    },
  },
  "/ia": {
    pt: {
      what: "Conecte a IA da sua empresa (Claude/ChatGPT/Copilot) e defina a ordem de uso.",
      why: "Você usa (e paga) a sua própria IA; e pode deixar o SAPLINK aprender com ela.",
      actions: ["Cole a chave do provedor e teste a conexão", "Defina principal + reserva", "Ligue 'aprender com a IA externa' para o Ollama ficar mais esperto"],
    },
    en: {
      what: "Connect your company's AI (Claude/ChatGPT/Copilot) and set the order of use.",
      why: "You use (and pay for) your own AI; and you can let SAPLINK learn from it.",
      actions: ["Paste the provider key and test the connection", "Set primary + fallback", "Turn on 'learn from external AI' so Ollama gets smarter"],
    },
    es: {
      what: "Conecta la IA de tu empresa (Claude/ChatGPT/Copilot) y define el orden de uso.",
      why: "Usas (y pagas) tu propia IA; y puedes dejar que SAPLINK aprenda de ella.",
      actions: ["Pega la clave del proveedor y prueba la conexión", "Define principal + reserva", "Activa 'aprender de la IA externa' para que Ollama sea más inteligente"],
    },
  },
  "/settings": {
    pt: {
      what: "Configurações da consultoria: marca (white-label), usuários e preferências.",
      why: "Deixa o SAPLINK com a sua cara — na interface, nos relatórios e no portal do cliente.",
      actions: ["Suba o logo e defina a cor da marca", "Cadastre os usuários da sua equipe"],
    },
    en: {
      what: "Consultancy settings: brand (white-label), users and preferences.",
      why: "It gives SAPLINK your look — in the interface, the reports and the client portal.",
      actions: ["Upload the logo and set the brand color", "Register your team's users"],
    },
    es: {
      what: "Configuración de la consultoría: marca (white-label), usuarios y preferencias.",
      why: "Le da a SAPLINK tu identidad — en la interfaz, en los informes y en el portal del cliente.",
      actions: ["Sube el logo y define el color de la marca", "Registra los usuarios de tu equipo"],
    },
  },
  "/platform/leads": {
    pt: {
      what: "Contatos que demonstraram interesse pela landing page.",
      why: "É o seu funil de vendas — cada lead é uma oportunidade.",
      actions: ["Fale com os leads novos primeiro", "Atualize o status conforme avança a negociação"],
    },
    en: {
      what: "Contacts who showed interest through the landing page.",
      why: "It's your sales funnel — each lead is an opportunity.",
      actions: ["Talk to the new leads first", "Update the status as the deal progresses"],
    },
    es: {
      what: "Contactos que mostraron interés a través de la landing page.",
      why: "Es tu embudo de ventas — cada lead es una oportunidad.",
      actions: ["Habla primero con los leads nuevos", "Actualiza el estado a medida que avanza la negociación"],
    },
  },
  "/platform/revenue": {
    pt: {
      what: "Receita da plataforma: assinaturas, MRR e faturas.",
      why: "A saúde financeira do negócio num lugar só.",
      actions: ["Acompanhe o MRR e a inadimplência", "Identifique consultorias em risco de churn"],
    },
    en: {
      what: "Platform revenue: subscriptions, MRR and invoices.",
      why: "The financial health of the business in one place.",
      actions: ["Track MRR and delinquency", "Identify consultancies at risk of churn"],
    },
    es: {
      what: "Ingresos de la plataforma: suscripciones, MRR y facturas.",
      why: "La salud financiera del negocio en un solo lugar.",
      actions: ["Da seguimiento al MRR y la morosidad", "Identifica consultorías en riesgo de churn"],
    },
  },
  "/platform": {
    pt: {
      what: "Painel da plataforma: todas as consultorias (tenants) ativas.",
      why: "Visão de quem usa o SAPLINK e como está cada conta.",
      actions: ["Entre numa consultoria para ver detalhes", "Acompanhe adoção e uso"],
    },
    en: {
      what: "Platform dashboard: all active consultancies (tenants).",
      why: "A view of who uses SAPLINK and how each account is doing.",
      actions: ["Enter a consultancy to see details", "Track adoption and usage"],
    },
    es: {
      what: "Panel de la plataforma: todas las consultorías (tenants) activas.",
      why: "Visión de quién usa SAPLINK y cómo está cada cuenta.",
      actions: ["Entra en una consultoría para ver detalles", "Da seguimiento a la adopción y el uso"],
    },
  },
};

function resolve(pathname: string): [string, Record<Lang, Guide>] | null {
  const keys = Object.keys(GUIDES).sort((a, b) => b.length - a.length);
  for (const k of keys) if (pathname === k || pathname.startsWith(k + "/")) return [k, GUIDES[k]];
  return null;
}

export default function PageGuide() {
  const pathname = usePathname();
  const { lang } = useLang();
  const [hidden, setHidden] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const match = useMemo(() => resolve(pathname || ""), [pathname]);

  useEffect(() => {
    if (!match) { setHidden(true); return; }
    const dismissed = localStorage.getItem(`guide-off-${match[0]}`) === "1";
    setHidden(dismissed);
    setExpanded(false);
  }, [match]);

  if (!match || hidden) return null;
  const [route, guides] = match;
  const g = guides[lang];
  const t = LBL[lang];

  return (
    <div className="mb-5 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/[0.07] to-cyan-500/[0.04] no-print">
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="text-lg leading-none mt-0.5">💡</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#e2e0ea]"><b>{t.whatIs}</b> {g.what}</p>
          <p className="text-sm text-[#9b95ad] mt-0.5"><b className="text-[#c9c5d6]">{t.whyMatters}</b> {g.why}</p>
          {expanded && (
            <div className="mt-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 mb-1">{t.doNow}</p>
              <ul className="space-y-1">
                {g.actions.map((a, i) => (
                  <li key={i} className="text-sm text-[#d6d3e0] flex items-start gap-2"><span className="text-cyan-400 mt-0.5">→</span><span>{a}</span></li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setExpanded((v) => !v)} className="text-xs text-purple-300 hover:text-purple-200 mt-2 cursor-pointer">
            {expanded ? t.hideSteps : t.whatDoIDo}
          </button>
        </div>
        <button
          onClick={() => { localStorage.setItem(`guide-off-${route}`, "1"); setHidden(true); }}
          className="text-[#6b6580] hover:text-[#9b95ad] text-sm shrink-0 cursor-pointer"
          title={t.hideOnScreen}
        >✕</button>
      </div>
    </div>
  );
}
