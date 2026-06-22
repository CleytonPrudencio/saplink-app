import type { Lang } from "@/i18n/I18n";

interface Feature {
  icon: string; name: string; tagline: string;
  how: string; example: string; gains: string[];
  flag?: string;
}
interface Group { title: string; color: string; intro: string; features: Feature[] }

export const T: Record<Lang, {
  heroTitle: string;
  heroSubtitle: string;
  navHome: string;
  navInterested: string;
  howItWorks: string;
  realExample: string;
  gainsLabel: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
  footerTagline: string;
  footerHome: string;
  footerLogin: string;
  groups: Group[];
}> = {
  pt: {
    heroTitle: "Cada funcionalidade, em detalhe",
    heroSubtitle: "O que cada recurso faz, como funciona, um exemplo real e o ganho que ele gera em produtividade e em R$. Sem marketing vazio — operação de verdade.",
    navHome: "← Início",
    navInterested: "Tenho interesse",
    howItWorks: "Como funciona",
    realExample: "Exemplo real",
    gainsLabel: "Ganhos em produtividade & R$",
    ctaTitle: "Quer ver no SAP dos seus clientes?",
    ctaSubtitle: "Deixe seu contato — mostramos o SAPLINK rodando ao vivo.",
    ctaButton: "Tenho interesse →",
    footerTagline: "Operação de integrações SAP",
    footerHome: "Início",
    footerLogin: "Entrar",
    groups: [
      {
        title: "🦄 Inovação exclusiva", color: "#a78bfa",
        intro: "Diferenciais que não existem em nenhum outro sistema de monitoramento SAP do mercado.",
        features: [
          {
            icon: "🛰️", name: "Rede Federada de Falhas", tagline: "O \"Waze do SAP\"", flag: "Exclusivo",
            how: "Toda falha detectada vira uma assinatura anonimizada (sem ids/números). Toda correção aplicada alimenta a taxa de sucesso daquela assinatura. Esse conhecimento é compartilhado entre todos os clientes/consultorias — sem expor nenhuma identidade (cliente contado por hash).",
            example: "O IFlow falha com \"Sold-to party não encontrado\". Em vez de começar do zero, o SAPLINK mostra: \"esse erro apareceu 37× na rede, em 12 clientes; a correção que resolveu em 89% foi cadastrar o BP (XD01). Tempo médio: 12 min\".",
            gains: ["Resolve na primeira tentativa, com a correção que já funcionou", "O sistema fica mais inteligente a cada novo cliente (efeito de rede)", "Onboarding de analista júnior acelerado — a rede ensina"],
          },
          {
            icon: "🔗", name: "Causa raiz cross-camada", tagline: "On-premise + nuvem no mesmo lugar", flag: "Exclusivo",
            how: "O SAPLINK é o único que tem ao mesmo tempo o feed de transports (STMS, on-premise) e o de mensagens CPI/IDoc. Ele cruza os dois no tempo: quando uma falha aparece logo depois de um transport ir pra produção, aponta a mudança suspeita com um score de confiança.",
            example: "O IFlow \"SalesOrder_Replication\" começou a falhar. O SAPLINK aponta: \"provável causa: transport DEVK900231 (ajuste no user-exit MIGO), importado 2h antes — 80% de confiança\".",
            gains: ["Achar a causa em minutos em vez de horas de investigação", "Evita o ping-pong entre time de nuvem e time ABAP", "Conecta mudança → efeito que todo mundo monitora separado"],
          },
          {
            icon: "🤖", name: "AMS Autônomo", tagline: "Self-healing que aprende", flag: "Exclusivo",
            how: "Loop fechado: detecta → diagnostica (IA) → corrige → mede o resultado → aprende. A confiança de cada correção vem da Rede Federada. Acima do limiar que você define, a correção é aplicada sozinha — com lista de ações permitidas, rastro (quem/quando/antes/depois) e rollback.",
            example: "IDocs em erro 51 entram à noite. Como a rede já comprova 94% de sucesso no reprocesso, o piloto automático reprocessa (BD87) sozinho e resolve — antes do analista chegar de manhã.",
            gains: ["Reduz o L1/L2 manual a quase zero", "Placar vendável: \"% resolvido sem humano\" e MTTR", "Opera 24/7 sem plantonista acordado"],
          },
          {
            icon: "💸", name: "Dinheiro em risco (ao vivo)", tagline: "A linguagem do CFO", flag: "Exclusivo",
            how: "Cada integração tem um custo de parada por hora e um processo de negócio. O SAPLINK soma, em tempo real, o tempo parado × custo + os documentos fiscais bloqueados, agrupando por processo.",
            example: "\"R$ 14.430 parados agora — Exportação/Faturamento: integração EDI ANTT fora há 3,2h\". O diretor entende na hora; o técnico não precisa traduzir.",
            gains: ["Prioriza pelo que dói no caixa, não pelo alerta mais barulhento", "Justifica o contrato de monitoramento em R$", "Muda a venda de técnica para financeira"],
          },
          {
            icon: "🔁", name: "Reconciliação ponta-a-ponta", tagline: "Entregue ≠ virou negócio", flag: "Exclusivo",
            how: "Você define a jornada esperada do documento (ex.: Pedido no CPI → Ordem no S/4 → Fatura). O SAPLINK conta quantos documentos chegaram a cada estágio numa janela de tempo e mostra o funil — onde o volume some entre uma etapa e outra.",
            example: "1.000 pedidos entraram, 998 viraram ordem, mas só 940 geraram fatura. O painel aponta: \"60 documentos perdidos entre Ordem → Fatura — investigue aqui primeiro\".",
            gains: ["Pega a falha silenciosa que diz 'sucesso' mas o objeto nunca nasceu", "Mostra o vazamento exato no processo, não só um erro solto", "Garante que o que entrou virou faturamento de verdade"],
          },
          {
            icon: "⚙️", name: "Remediação generativa", tagline: "A IA escreve a correção", flag: "Exclusivo",
            how: "Além de diagnosticar, a IA gera o artefato de correção pronto: o trecho de Groovy do CPI, o ajuste de mapeamento, o filtro OData ou o comando SAP — com resumo, onde aplicar e como validar. Sai como relatório estilizado e PDF.",
            example: "Falha \"Sold-to party não encontrado\" → a IA devolve o Groovy de verificação pronto, indica colar no artefato SalesOrder_Replication e como testar.",
            gains: ["De 'explica o problema' para 'entrega a solução'", "Reduz o tempo de correção a minutos", "Padroniza a qualidade da correção entre analistas"],
          },
          {
            icon: "💬", name: "ChatOps por WhatsApp", tagline: "Opere o SAP por mensagem", flag: "Exclusivo",
            how: "Conecte um canal (WhatsApp Cloud API, Twilio, Telegram) via webhook com token. A IA entende o comando em português, executa o que é leitura na hora e, para ações que mexem no SAP, cria um pedido com aprovação. Tem console de teste dentro do app.",
            example: "No WhatsApp do plantão: \"reprocessa os IDocs travados do cliente Agro\" → \"📝 Criei 7 pedidos de correção para Agro. Aprove no painel para o agente executar\".",
            gains: ["Operação na palma da mão, sem abrir o painel", "Plantão responde de qualquer lugar", "Seguro: nada destrutivo roda sem aprovação"],
          },
          {
            icon: "📉", name: "Perda silenciosa de negócio", tagline: "Radar de receita", flag: "Exclusivo",
            how: "O SAPLINK aprende o volume normal de cada fluxo de mensagens e compara com o agora. Se o volume cai muito abaixo do esperado — mesmo com tudo 'verde' tecnicamente — dispara um alerta de negócio.",
            example: "Tudo verde, mas entraram 60% menos pedidos na última hora vs a média. O radar avisa antes de o cliente ligar perguntando do faturamento.",
            gains: ["Captura a perda que nenhum monitor técnico vê", "Antecipa problema de negócio, não só de TI", "Protege a receita silenciosamente parada"],
          },
          {
            icon: "🧨", name: "Pré-voo de mudança (blast radius)", tagline: "Antes do deploy, não depois", flag: "Exclusivo",
            how: "Antes de um transport ir pra produção, o SAPLINK cruza catálogo + integrações + custo e calcula o raio de impacto (interfaces, processos, R$/h) e um score de risco 0-100, com plano de teste.",
            example: "Transport que mexe em user-exit do MIGO → score 78 (ALTO), afeta Faturamento (R$ 45k/h). Plano: validar o processo de faturamento ponta-a-ponta antes de subir.",
            gains: ["Acaba com a parada pós-upgrade", "Testa o que importa, não tudo", "Decisão de subir/não-subir com dado"],
          },
          {
            icon: "⏪", name: "Time machine de incidente", tagline: "Replay + contrafactual de R$", flag: "Exclusivo",
            how: "Reconstrói a linha do tempo completa de um incidente (transports → falhas → alertas) e calcula o contrafactual: quanto teria sido economizado com detecção mais rápida.",
            example: "Incidente de 2h30 = R$ 112k. Com detecção em 5 min seriam R$ 8k → R$ 104k salvos. Número irrefutável pra reunião de renovação.",
            gains: ["Prova de ROI que renova contrato", "Aprende a causa do incidente", "Justifica o investimento em monitoramento"],
          },
          {
            icon: "🛡️", name: "Auditoria & Compliance autônoma", tagline: "SoD e evidências automáticas", flag: "Exclusivo",
            how: "Trilha unificada de mudanças (transports) e remediações (quem pediu/aprovou), com checagem de segregação de função (SoD) e pacote de evidências gerado por IA para o auditor.",
            example: "Detecta que a mesma pessoa pediu e aprovou uma remediação (violação de SoD) e marca em vermelho. Gera o relatório de evidências SOX/LGPD sozinho.",
            gains: ["Compliance sem montar planilha", "Pega violação de SoD na hora", "Evidência pronta pro auditor"],
          },
          {
            icon: "🤝", name: "Confiabilidade de parceiro EDI", tagline: "Quem manda dado ruim", flag: "Exclusivo",
            how: "Agrega os erros por parceiro (IDocs/itens) e ranqueia por quem mais causa falha — com taxa de erro, % do total e um score de confiabilidade.",
            example: "\"O fornecedor KU_FORNEC22 causa 41% dos seus erros de IDoc (score 38).\" Munição pra cobrar o parceiro certo, não a sua TI.",
            gains: ["Cobra o ofensor certo", "Negociação com dado", "Reduz erro recorrente na origem"],
          },
          {
            icon: "💵", name: "FinOps de BTP", tagline: "Custo de nuvem por IFlow", flag: "Exclusivo",
            how: "Liga o volume de mensagens de cada IFlow ao custo estimado de consumo do BTP (tarifa configurável) e ranqueia por gasto — flagrando o IFlow desgovernado.",
            example: "Um IFlow de timer disparando 1M de mensagens/mês = ~R$ 312/mês sozinho. O SAPLINK flagra o desperdício antes da fatura surpresa.",
            gains: ["Fim da surpresa na fatura do BTP", "Acha o IFlow em loop", "Otimiza o gasto de nuvem"],
          },
        ],
      },
      {
        title: "🧠 Inteligência de IA", color: "#22d3ee",
        intro: "IA aplicada de ponta a ponta — não um chatbot solto, mas copiloto que enxerga a carteira inteira.",
        features: [
          {
            icon: "🩺", name: "Diagnóstico de causa raiz", tagline: "Causa + correção + prevenção",
            how: "Ao clicar em \"Diagnosticar com IA\" numa falha, a IA lê o erro real (mensagem do MPL/IDoc), o contexto do cliente e o histórico, e devolve causa raiz, passos de correção (com transação SAP) e como prevenir. Sai como relatório estilizado e PDF.",
            example: "Falha HTTP 500 \"Sold-to party 0001234\" → a IA explica: cliente não existe no S/4, criar/checar o BP em XD01/BP, validar o de-para no IFlow, retestar.",
            gains: ["Diagnóstico em segundos, padronizado", "PDF pronto para anexar no chamado", "Analista júnior produz como sênior"],
          },
          {
            icon: "💬", name: "Copiloto da carteira", tagline: "Pergunte em português",
            how: "Um chat que enxerga todos os clientes, integrações, status e alertas. Pergunte em linguagem natural e ele responde citando nomes e sugerindo a ação.",
            example: "\"Quais clientes têm integração com erro agora?\" → lista os clientes, a integração e o que fazer em cada um.",
            gains: ["Visão da carteira sem montar relatório", "Resposta acionável, não só dado bruto", "Onboarding instantâneo de quem chega no time"],
          },
          {
            icon: "🔮", name: "Previsão de falha", tagline: "Antes de quebrar",
            how: "Analisa a tendência das métricas (latência, taxa de erro, profundidade de fila) e sinaliza anomalia antes do incidente virar parada.",
            example: "\"A fila qRFC do cliente X cresce 15%/h — vai estourar em ~2h\". Você age antes do cliente ligar.",
            gains: ["Sai do modo apaga-incêndio", "Janela de manutenção em vez de incidente", "Menos quebra de SLA"],
          },
          {
            icon: "📬", name: "Digest semanal por IA", tagline: "Resumo executivo no e-mail",
            how: "Toda semana a IA escreve um resumo da saúde da carteira (panorama, pontos de atenção, recomendações) e envia por e-mail, com a marca da sua consultoria.",
            example: "Segunda de manhã o gestor recebe: \"carteira estável; atenção ao cliente Y (3 IDocs em erro recorrente); recomendo revisar o destino RFC\".",
            gains: ["Prova de valor recorrente sem esforço", "Relacionamento ativo com o cliente", "Branding da consultoria em cada envio"],
          },
        ],
      },
      {
        title: "🛰️ Operação on-premise", color: "#34d399",
        intro: "O cockpit clássico de ECC/S4 on-prem — IDoc, filas, RFC — multi-cliente, sem abrir portas.",
        features: [
          {
            icon: "📊", name: "Cockpit de IDoc & filas", tagline: "BD87 + SMQ + SM58 num painel",
            how: "O Agente Docker roda na rede do cliente (só tráfego de saída) e empurra o snapshot de IDocs em erro, filas qRFC/tRFC travadas e dumps. Tudo num painel multi-cliente.",
            example: "Em vez de logar em 8 SAPs diferentes, você vê numa tela: cliente A com 7 IDocs 51, cliente B com fila SYSFAIL.",
            gains: ["Uma tela para toda a carteira", "Sem VPN/GUI para cada cliente", "Prioriza pelo que está pior"],
          },
          {
            icon: "✨", name: "Remediação autônoma", tagline: "Reprocessa com aprovação e log",
            how: "Cada item remediável tem a ação SAP equivalente (BD87, SMQ2, SM58, SM59). Você aprova; o agente executa e reporta o antes/depois. Nada roda no SAP sem aprovação (ou via AMS Autônomo, com guardrails).",
            example: "7 IDocs 51 → \"Reprocessar (RBDMANI2)\" → aprovar → agente executa → item resolve sozinho.",
            gains: ["Correção sem abrir a GUI", "Trilha de auditoria completa", "Padroniza a resposta entre analistas"],
          },
          {
            icon: "📚", name: "Catálogo vivo de interfaces", tagline: "Landscape auto-descoberto",
            how: "O agente descobre e mantém o inventário de parceiros (WE20), destinos RFC (SM59), message types, serviços OData e portas IDoc — atualizado sozinho.",
            example: "Mapa sempre atual de \"o que conversa com o quê\" no cliente, sem planilha manual.",
            gains: ["Documentação que não envelhece", "Onboarding de um novo cliente em minutos", "Base para análise de impacto"],
          },
        ],
      },
      {
        title: "☁️ S/4HANA Cloud — carro-chefe", color: "#fbbf24",
        intro: "A edição que a SAP empurra em todo mundo (sem GUI, upgrade 2×/ano, API-first). Cobrimos o que falta — sem instalar nada.",
        features: [
          {
            icon: "🚀", name: "Radar de Upgrade", tagline: "O que quebra no próximo release",
            how: "Inventaria as APIs OData realmente consumidas (via APIs liberadas) e cruza com o que será depreciado/alterado no próximo release, mapeando ao seu uso real.",
            example: "\"Você usa API_SALES_ORDER_SRV v2 (518k chamadas/registros) — será descontinuada. Migre para v4.\"",
            gains: ["Upgrade sem surpresa duas vezes ao ano", "Plano de migração baseado no uso real", "Evita parada pós-upgrade"],
          },
          {
            icon: "🧼", name: "Clean Core Score", tagline: "A métrica que a SAP cobra",
            how: "Calcula a aderência ao Clean Core (APIs depreciadas, customizações, modificações) com pontuação e plano de remediação, derivado do uso real.",
            example: "Score 88/100 — principal dedução: API v2 depreciada em uso. Recomendação: migrar para v4.",
            gains: ["Mostra ao cliente onde ele está fora do padrão", "Vira serviço de governança recorrente", "Prepara o terreno para o próximo upgrade"],
          },
          {
            icon: "🧾", name: "Cockpit Fiscal DRC", tagline: "NF-e/SEFAZ — mata o mercado BR",
            how: "Monitora documentos fiscais (NF-e, NFS-e, CT-e): rejeição SEFAZ, contingência, pendências — com valor em R$ e reprocesso.",
            example: "\"NF-e 123 rejeitada (cód. 539, duplicidade) — R$ 18.750 em risco\". Reprocessa pelo SAPLINK.",
            gains: ["Não deixa faturamento parar escondido", "Diferencial forte no mercado brasileiro", "R$ em risco fiscal visível na hora"],
          },
          {
            icon: "📨", name: "Event Mesh + CPI/AIF", tagline: "Dead-letter, lag e MPL reais",
            how: "Puxa os Message Processing Logs reais do Cloud Integration e os eventos do Event Mesh — falhas, dead-letter, lag — e gera alerta com o erro detalhado.",
            example: "IFlow FAILED → alerta + erro real do MPL + botão \"Diagnosticar com IA\".",
            gains: ["Visibilidade do que a nuvem esconde", "Alerta com a mensagem de erro de verdade", "Detecção ao vivo das integrações"],
          },
        ],
      },
      {
        title: "📈 Valor, SLA & confiança", color: "#f87171",
        intro: "Transforma operação em prova de valor — e resposta a incidente em processo confiável.",
        features: [
          {
            icon: "📈", name: "SLA por cliente + relatório IA", tagline: "Compliance com narrativa",
            how: "Define metas de uptime/latência por cliente, mede o compliance e a IA escreve o relatório mensal de SLA (resultado, quebras, recomendações), com PDF.",
            example: "Relatório executivo: \"99,2% no mês (meta 99,5%) — 2 quebras na integração de pedidos; recomendo...\".",
            gains: ["Renovação de contrato com dado, não opinião", "Relatório pronto sem trabalho manual", "Cliente vê o valor entregue"],
          },
          {
            icon: "🪪", name: "Portal do cliente white-label", tagline: "Transparência read-only",
            how: "Um portal com a marca da sua consultoria, read-only, onde o cliente final vê a saúde das próprias integrações.",
            example: "O cliente acessa e vê tudo verde — confiança sem você precisar mandar print.",
            gains: ["Reduz \"e aí, como está?\"", "Transparência que fideliza", "Sua marca na frente do cliente"],
          },
          {
            icon: "📣", name: "On-call multicanal + escalonamento", tagline: "Slack/Teams/Webhook/e-mail",
            how: "Alertas viram notificação no canal certo, com nível de severidade e escalonamento automático se ninguém responder no prazo.",
            example: "Falha crítica → Slack do plantão; sem resposta em 30 min → escala para o líder.",
            gains: ["Nada cai no vácuo", "Plantão organizado por severidade", "MTTR menor"],
          },
          {
            icon: "🎫", name: "Tickets Jira/ServiceNow", tagline: "Alerta vira chamado e fecha sozinho",
            how: "Integra com Jira/ServiceNow: o alerta abre o chamado automaticamente e o fecha quando a integração se recupera.",
            example: "Incidente abre INC-4521; ao normalizar, o ticket fecha sozinho com o histórico.",
            gains: ["Zero retrabalho de abrir/fechar ticket", "ITSM sempre coerente com a realidade", "Métrica de chamado confiável"],
          },
        ],
      },
    ],
  },
  en: {
    heroTitle: "Every feature, in detail",
    heroSubtitle: "What each feature does, how it works, a real example and the gain it generates in productivity and in R$. No empty marketing — real operations.",
    navHome: "← Home",
    navInterested: "I'm interested",
    howItWorks: "How it works",
    realExample: "Real example",
    gainsLabel: "Gains in productivity & R$",
    ctaTitle: "Want to see it on your clients' SAP?",
    ctaSubtitle: "Leave your contact — we'll show SAPLINK running live.",
    ctaButton: "I'm interested →",
    footerTagline: "SAP integration operations",
    footerHome: "Home",
    footerLogin: "Sign in",
    groups: [
      {
        title: "🦄 Exclusive innovation", color: "#a78bfa",
        intro: "Differentiators that don't exist in any other SAP monitoring system on the market.",
        features: [
          {
            icon: "🛰️", name: "Federated Failure Network", tagline: "The \"Waze of SAP\"", flag: "Exclusive",
            how: "Every detected failure becomes an anonymized signature (no ids/numbers). Every applied fix feeds the success rate of that signature. This knowledge is shared across all customers/consultancies — without exposing any identity (customer counted by hash).",
            example: "The IFlow fails with \"Sold-to party not found\". Instead of starting from scratch, SAPLINK shows: \"this error appeared 37× across the network, in 12 customers; the fix that resolved 89% of them was creating the BP (XD01). Average time: 12 min\".",
            gains: ["Resolve on the first try, with the fix that already worked", "The system gets smarter with each new customer (network effect)", "Junior analyst onboarding accelerated — the network teaches"],
          },
          {
            icon: "🔗", name: "Cross-layer root cause", tagline: "On-premise + cloud in one place", flag: "Exclusive",
            how: "SAPLINK is the only one that has both the transports feed (STMS, on-premise) and the CPI/IDoc messages feed at the same time. It correlates the two in time: when a failure appears right after a transport goes to production, it flags the suspect change with a confidence score.",
            example: "The IFlow \"SalesOrder_Replication\" started failing. SAPLINK points out: \"probable cause: transport DEVK900231 (change to the MIGO user-exit), imported 2h earlier — 80% confidence\".",
            gains: ["Find the cause in minutes instead of hours of investigation", "Avoids the ping-pong between the cloud team and the ABAP team", "Connects change → effect that everyone monitors separately"],
          },
          {
            icon: "🤖", name: "Autonomous AMS", tagline: "Self-healing that learns", flag: "Exclusive",
            how: "Closed loop: detect → diagnose (AI) → fix → measure the result → learn. The confidence of each fix comes from the Federated Network. Above the threshold you define, the fix is applied on its own — with an allowed-actions list, a trail (who/when/before/after) and rollback.",
            example: "IDocs in error 51 come in at night. Since the network already proves 94% success on reprocessing, the autopilot reprocesses (BD87) on its own and resolves them — before the analyst arrives in the morning.",
            gains: ["Reduces manual L1/L2 to almost zero", "Sellable scoreboard: \"% resolved without a human\" and MTTR", "Operates 24/7 without an on-call person awake"],
          },
          {
            icon: "💸", name: "Money at risk (live)", tagline: "The CFO's language", flag: "Exclusive",
            how: "Each integration has a downtime cost per hour and a business process. SAPLINK sums, in real time, the downtime × cost + the blocked tax documents, grouping by process.",
            example: "\"R$ 14,430 stopped right now — Export/Billing: EDI ANTT integration down for 3.2h\". The director understands immediately; the technician doesn't have to translate.",
            gains: ["Prioritizes by what hurts cash flow, not by the loudest alert", "Justifies the monitoring contract in R$", "Shifts the sale from technical to financial"],
          },
          {
            icon: "🔁", name: "End-to-end reconciliation", tagline: "Delivered ≠ became business", flag: "Exclusive",
            how: "You define the document's expected journey (e.g.: Order in CPI → Order in S/4 → Invoice). SAPLINK counts how many documents reached each stage in a time window and shows the funnel — where volume disappears between one step and the next.",
            example: "1,000 orders came in, 998 became orders, but only 940 generated an invoice. The panel points out: \"60 documents lost between Order → Invoice — investigate here first\".",
            gains: ["Catches the silent failure that says 'success' but the object was never born", "Shows the exact leak in the process, not just a stray error", "Ensures that what came in actually became billing"],
          },
          {
            icon: "⚙️", name: "Generative remediation", tagline: "AI writes the fix", flag: "Exclusive",
            how: "Beyond diagnosing, the AI generates the ready-to-use fix artifact: the CPI Groovy snippet, the mapping adjustment, the OData filter or the SAP command — with a summary, where to apply it and how to validate. It comes out as a styled report and PDF.",
            example: "Failure \"Sold-to party not found\" → the AI returns the ready verification Groovy, indicates pasting it into the SalesOrder_Replication artifact and how to test.",
            gains: ["From 'explains the problem' to 'delivers the solution'", "Reduces fix time to minutes", "Standardizes fix quality across analysts"],
          },
          {
            icon: "💬", name: "ChatOps via WhatsApp", tagline: "Operate SAP by message", flag: "Exclusive",
            how: "Connect a channel (WhatsApp Cloud API, Twilio, Telegram) via webhook with a token. The AI understands the command in natural language, executes read-only actions right away and, for actions that touch SAP, creates a request with approval. There's a test console inside the app.",
            example: "On the on-call WhatsApp: \"reprocess the stuck IDocs for the Agro customer\" → \"📝 I created 7 fix requests for Agro. Approve them in the panel for the agent to execute\".",
            gains: ["Operation in the palm of your hand, without opening the panel", "On-call responds from anywhere", "Safe: nothing destructive runs without approval"],
          },
          {
            icon: "📉", name: "Silent business loss", tagline: "Revenue radar", flag: "Exclusive",
            how: "SAPLINK learns the normal volume of each message flow and compares it with now. If the volume drops far below expected — even with everything technically 'green' — it triggers a business alert.",
            example: "Everything green, but 60% fewer orders came in over the last hour vs the average. The radar warns before the customer calls asking about billing.",
            gains: ["Captures the loss that no technical monitor sees", "Anticipates a business problem, not just an IT one", "Protects revenue that is silently stopped"],
          },
          {
            icon: "🧨", name: "Change pre-flight (blast radius)", tagline: "Before the deploy, not after", flag: "Exclusive",
            how: "Before a transport goes to production, SAPLINK cross-references catalog + integrations + cost and calculates the impact radius (interfaces, processes, R$/h) and a 0-100 risk score, with a test plan.",
            example: "Transport that changes the MIGO user-exit → score 78 (HIGH), affects Billing (R$ 45k/h). Plan: validate the billing process end-to-end before going live.",
            gains: ["Ends post-upgrade downtime", "Tests what matters, not everything", "Go/no-go decision with data"],
          },
          {
            icon: "⏪", name: "Incident time machine", tagline: "Replay + R$ counterfactual", flag: "Exclusive",
            how: "Reconstructs the complete timeline of an incident (transports → failures → alerts) and calculates the counterfactual: how much would have been saved with faster detection.",
            example: "A 2h30 incident = R$ 112k. With detection in 5 min it would have been R$ 8k → R$ 104k saved. An irrefutable number for the renewal meeting.",
            gains: ["ROI proof that renews the contract", "Learns the cause of the incident", "Justifies the investment in monitoring"],
          },
          {
            icon: "🛡️", name: "Autonomous Audit & Compliance", tagline: "SoD and automatic evidence", flag: "Exclusive",
            how: "A unified trail of changes (transports) and remediations (who requested/approved), with segregation-of-duties (SoD) checking and an AI-generated evidence package for the auditor.",
            example: "Detects that the same person requested and approved a remediation (SoD violation) and flags it in red. Generates the SOX/LGPD evidence report on its own.",
            gains: ["Compliance without building a spreadsheet", "Catches an SoD violation on the spot", "Evidence ready for the auditor"],
          },
          {
            icon: "🤝", name: "EDI partner reliability", tagline: "Who sends bad data", flag: "Exclusive",
            how: "Aggregates errors by partner (IDocs/items) and ranks by who causes the most failures — with error rate, % of the total and a reliability score.",
            example: "\"The supplier KU_FORNEC22 causes 41% of your IDoc errors (score 38).\" Ammunition to hold the right partner accountable, not your IT.",
            gains: ["Holds the right offender accountable", "Negotiation with data", "Reduces recurring error at the source"],
          },
          {
            icon: "💵", name: "BTP FinOps", tagline: "Cloud cost per IFlow", flag: "Exclusive",
            how: "Links each IFlow's message volume to the estimated BTP consumption cost (configurable rate) and ranks by spend — flagging the runaway IFlow.",
            example: "A timer IFlow firing 1M messages/month = ~R$ 312/month on its own. SAPLINK flags the waste before the surprise invoice.",
            gains: ["No more surprises on the BTP invoice", "Finds the IFlow in a loop", "Optimizes cloud spend"],
          },
        ],
      },
      {
        title: "🧠 AI intelligence", color: "#22d3ee",
        intro: "AI applied end to end — not a standalone chatbot, but a copilot that sees the entire portfolio.",
        features: [
          {
            icon: "🩺", name: "Root cause diagnosis", tagline: "Cause + fix + prevention",
            how: "When you click \"Diagnose with AI\" on a failure, the AI reads the real error (MPL/IDoc message), the customer context and the history, and returns the root cause, fix steps (with the SAP transaction) and how to prevent it. It comes out as a styled report and PDF.",
            example: "HTTP 500 failure \"Sold-to party 0001234\" → the AI explains: the customer doesn't exist in S/4, create/check the BP in XD01/BP, validate the mapping in the IFlow, retest.",
            gains: ["Diagnosis in seconds, standardized", "PDF ready to attach to the ticket", "A junior analyst produces like a senior"],
          },
          {
            icon: "💬", name: "Portfolio copilot", tagline: "Ask in natural language",
            how: "A chat that sees all customers, integrations, status and alerts. Ask in natural language and it answers citing names and suggesting the action.",
            example: "\"Which customers have an integration in error right now?\" → lists the customers, the integration and what to do for each one.",
            gains: ["A view of the portfolio without building a report", "Actionable answer, not just raw data", "Instant onboarding for newcomers to the team"],
          },
          {
            icon: "🔮", name: "Failure prediction", tagline: "Before it breaks",
            how: "Analyzes the trend of the metrics (latency, error rate, queue depth) and flags an anomaly before the incident becomes downtime.",
            example: "\"Customer X's qRFC queue is growing 15%/h — it will overflow in ~2h\". You act before the customer calls.",
            gains: ["Get out of firefighting mode", "Maintenance window instead of an incident", "Fewer SLA breaches"],
          },
          {
            icon: "📬", name: "Weekly AI digest", tagline: "Executive summary in your email",
            how: "Every week the AI writes a summary of the portfolio's health (overview, points of attention, recommendations) and sends it by email, with your consultancy's branding.",
            example: "Monday morning the manager receives: \"portfolio stable; attention to customer Y (3 IDocs in recurring error); I recommend reviewing the RFC destination\".",
            gains: ["Recurring proof of value with no effort", "Active relationship with the customer", "Consultancy branding in every send"],
          },
        ],
      },
      {
        title: "🛰️ On-premise operations", color: "#34d399",
        intro: "The classic ECC/S4 on-prem cockpit — IDoc, queues, RFC — multi-customer, without opening ports.",
        features: [
          {
            icon: "📊", name: "IDoc & queue cockpit", tagline: "BD87 + SMQ + SM58 in one panel",
            how: "The Docker Agent runs on the customer's network (outbound traffic only) and pushes the snapshot of IDocs in error, stuck qRFC/tRFC queues and dumps. All in a multi-customer panel.",
            example: "Instead of logging into 8 different SAP systems, you see on one screen: customer A with 7 IDocs in 51, customer B with a SYSFAIL queue.",
            gains: ["One screen for the entire portfolio", "No VPN/GUI for each customer", "Prioritizes by what's worst"],
          },
          {
            icon: "✨", name: "Autonomous remediation", tagline: "Reprocess with approval and log",
            how: "Each remediable item has the equivalent SAP action (BD87, SMQ2, SM58, SM59). You approve; the agent executes and reports the before/after. Nothing runs in SAP without approval (or via Autonomous AMS, with guardrails).",
            example: "7 IDocs in 51 → \"Reprocess (RBDMANI2)\" → approve → agent executes → item resolves on its own.",
            gains: ["Fix without opening the GUI", "Complete audit trail", "Standardizes the response across analysts"],
          },
          {
            icon: "📚", name: "Live interface catalog", tagline: "Auto-discovered landscape",
            how: "The agent discovers and maintains the inventory of partners (WE20), RFC destinations (SM59), message types, OData services and IDoc ports — updated on its own.",
            example: "An always-current map of \"what talks to what\" at the customer, without a manual spreadsheet.",
            gains: ["Documentation that doesn't age", "Onboarding a new customer in minutes", "A basis for impact analysis"],
          },
        ],
      },
      {
        title: "☁️ S/4HANA Cloud — flagship", color: "#fbbf24",
        intro: "The edition SAP pushes on everyone (no GUI, upgrade 2×/year, API-first). We cover what's missing — without installing anything.",
        features: [
          {
            icon: "🚀", name: "Upgrade Radar", tagline: "What breaks in the next release",
            how: "Inventories the OData APIs actually consumed (via released APIs) and cross-references with what will be deprecated/changed in the next release, mapping to your real usage.",
            example: "\"You use API_SALES_ORDER_SRV v2 (518k calls/records) — it will be discontinued. Migrate to v4.\"",
            gains: ["Upgrade without surprises twice a year", "Migration plan based on real usage", "Avoids post-upgrade downtime"],
          },
          {
            icon: "🧼", name: "Clean Core Score", tagline: "The metric SAP demands",
            how: "Calculates adherence to Clean Core (deprecated APIs, customizations, modifications) with a score and a remediation plan, derived from real usage.",
            example: "Score 88/100 — main deduction: deprecated API v2 in use. Recommendation: migrate to v4.",
            gains: ["Shows the customer where they're off-standard", "Becomes a recurring governance service", "Prepares the ground for the next upgrade"],
          },
          {
            icon: "🧾", name: "DRC Tax Cockpit", tagline: "NF-e/SEFAZ — owns the BR market",
            how: "Monitors tax documents (NF-e, NFS-e, CT-e): SEFAZ rejection, contingency, pending items — with value in R$ and reprocessing.",
            example: "\"NF-e 123 rejected (code 539, duplicate) — R$ 18,750 at risk\". Reprocess through SAPLINK.",
            gains: ["Doesn't let billing stop unnoticed", "A strong differentiator in the Brazilian market", "R$ at fiscal risk visible immediately"],
          },
          {
            icon: "📨", name: "Event Mesh + CPI/AIF", tagline: "Real dead-letter, lag and MPL",
            how: "Pulls the real Message Processing Logs from Cloud Integration and the Event Mesh events — failures, dead-letter, lag — and generates an alert with the detailed error.",
            example: "IFlow FAILED → alert + the real MPL error + a \"Diagnose with AI\" button.",
            gains: ["Visibility into what the cloud hides", "An alert with the actual error message", "Live detection of integrations"],
          },
        ],
      },
      {
        title: "📈 Value, SLA & trust", color: "#f87171",
        intro: "Turns operations into proof of value — and incident response into a reliable process.",
        features: [
          {
            icon: "📈", name: "Per-customer SLA + AI report", tagline: "Compliance with a narrative",
            how: "Define uptime/latency targets per customer, measure compliance, and the AI writes the monthly SLA report (results, breaches, recommendations), with PDF.",
            example: "Executive report: \"99.2% for the month (target 99.5%) — 2 breaches in the orders integration; I recommend...\".",
            gains: ["Contract renewal with data, not opinion", "Report ready with no manual work", "The customer sees the value delivered"],
          },
          {
            icon: "🪪", name: "White-label customer portal", tagline: "Read-only transparency",
            how: "A portal with your consultancy's branding, read-only, where the end customer sees the health of their own integrations.",
            example: "The customer logs in and sees everything green — trust without you having to send a screenshot.",
            gains: ["Reduces \"so, how's it going?\"", "Transparency that builds loyalty", "Your brand in front of the customer"],
          },
          {
            icon: "📣", name: "Multichannel on-call + escalation", tagline: "Slack/Teams/Webhook/email",
            how: "Alerts become a notification in the right channel, with a severity level and automatic escalation if no one responds in time.",
            example: "Critical failure → on-call Slack; no response in 30 min → escalates to the lead.",
            gains: ["Nothing falls into the void", "On-call organized by severity", "Lower MTTR"],
          },
          {
            icon: "🎫", name: "Jira/ServiceNow tickets", tagline: "Alert becomes a ticket and closes itself",
            how: "Integrates with Jira/ServiceNow: the alert opens the ticket automatically and closes it when the integration recovers.",
            example: "The incident opens INC-4521; when it normalizes, the ticket closes on its own with the history.",
            gains: ["Zero rework opening/closing tickets", "ITSM always consistent with reality", "Reliable ticket metrics"],
          },
        ],
      },
    ],
  },
  es: {
    heroTitle: "Cada funcionalidad, en detalle",
    heroSubtitle: "Qué hace cada recurso, cómo funciona, un ejemplo real y la ganancia que genera en productividad y en R$. Sin marketing vacío — operación de verdad.",
    navHome: "← Inicio",
    navInterested: "Me interesa",
    howItWorks: "Cómo funciona",
    realExample: "Ejemplo real",
    gainsLabel: "Ganancias en productividad & R$",
    ctaTitle: "¿Quiere verlo en el SAP de sus clientes?",
    ctaSubtitle: "Deje su contacto — le mostramos SAPLINK funcionando en vivo.",
    ctaButton: "Me interesa →",
    footerTagline: "Operación de integraciones SAP",
    footerHome: "Inicio",
    footerLogin: "Entrar",
    groups: [
      {
        title: "🦄 Innovación exclusiva", color: "#a78bfa",
        intro: "Diferenciales que no existen en ningún otro sistema de monitoreo SAP del mercado.",
        features: [
          {
            icon: "🛰️", name: "Red Federada de Fallas", tagline: "El \"Waze del SAP\"", flag: "Exclusivo",
            how: "Toda falla detectada se convierte en una firma anonimizada (sin ids/números). Toda corrección aplicada alimenta la tasa de éxito de esa firma. Ese conocimiento se comparte entre todos los clientes/consultoras — sin exponer ninguna identidad (cliente contado por hash).",
            example: "El IFlow falla con \"Sold-to party no encontrado\". En vez de empezar de cero, SAPLINK muestra: \"este error apareció 37× en la red, en 12 clientes; la corrección que resolvió el 89% fue dar de alta el BP (XD01). Tiempo promedio: 12 min\".",
            gains: ["Resuelve en el primer intento, con la corrección que ya funcionó", "El sistema se vuelve más inteligente con cada nuevo cliente (efecto de red)", "Onboarding de analista junior acelerado — la red enseña"],
          },
          {
            icon: "🔗", name: "Causa raíz cross-capa", tagline: "On-premise + nube en el mismo lugar", flag: "Exclusivo",
            how: "SAPLINK es el único que tiene a la vez el feed de transports (STMS, on-premise) y el de mensajes CPI/IDoc. Cruza ambos en el tiempo: cuando una falla aparece justo después de que un transport pasa a producción, señala el cambio sospechoso con un score de confianza.",
            example: "El IFlow \"SalesOrder_Replication\" empezó a fallar. SAPLINK señala: \"causa probable: transport DEVK900231 (ajuste en el user-exit MIGO), importado 2h antes — 80% de confianza\".",
            gains: ["Encontrar la causa en minutos en vez de horas de investigación", "Evita el ping-pong entre el equipo de nube y el equipo ABAP", "Conecta cambio → efecto que todos monitorean por separado"],
          },
          {
            icon: "🤖", name: "AMS Autónomo", tagline: "Self-healing que aprende", flag: "Exclusivo",
            how: "Bucle cerrado: detecta → diagnostica (IA) → corrige → mide el resultado → aprende. La confianza de cada corrección viene de la Red Federada. Por encima del umbral que usted define, la corrección se aplica sola — con lista de acciones permitidas, rastro (quién/cuándo/antes/después) y rollback.",
            example: "IDocs en error 51 entran de noche. Como la red ya comprueba un 94% de éxito en el reproceso, el piloto automático reprocesa (BD87) solo y los resuelve — antes de que el analista llegue por la mañana.",
            gains: ["Reduce el L1/L2 manual a casi cero", "Marcador vendible: \"% resuelto sin humano\" y MTTR", "Opera 24/7 sin guardia despierto"],
          },
          {
            icon: "💸", name: "Dinero en riesgo (en vivo)", tagline: "El lenguaje del CFO", flag: "Exclusivo",
            how: "Cada integración tiene un costo de parada por hora y un proceso de negocio. SAPLINK suma, en tiempo real, el tiempo parado × costo + los documentos fiscales bloqueados, agrupando por proceso.",
            example: "\"R$ 14.430 parados ahora — Exportación/Facturación: integración EDI ANTT caída hace 3,2h\". El director lo entiende al instante; el técnico no necesita traducir.",
            gains: ["Prioriza por lo que duele en la caja, no por la alerta más ruidosa", "Justifica el contrato de monitoreo en R$", "Cambia la venta de técnica a financiera"],
          },
          {
            icon: "🔁", name: "Reconciliación punta a punta", tagline: "Entregado ≠ se volvió negocio", flag: "Exclusivo",
            how: "Usted define el recorrido esperado del documento (p. ej.: Pedido en CPI → Orden en S/4 → Factura). SAPLINK cuenta cuántos documentos llegaron a cada etapa en una ventana de tiempo y muestra el embudo — dónde se pierde el volumen entre una etapa y otra.",
            example: "1.000 pedidos entraron, 998 se volvieron orden, pero solo 940 generaron factura. El panel señala: \"60 documentos perdidos entre Orden → Factura — investigue aquí primero\".",
            gains: ["Detecta la falla silenciosa que dice 'éxito' pero el objeto nunca nació", "Muestra la fuga exacta en el proceso, no solo un error suelto", "Garantiza que lo que entró se volvió facturación de verdad"],
          },
          {
            icon: "⚙️", name: "Remediación generativa", tagline: "La IA escribe la corrección", flag: "Exclusivo",
            how: "Además de diagnosticar, la IA genera el artefacto de corrección listo: el fragmento de Groovy del CPI, el ajuste de mapeo, el filtro OData o el comando SAP — con resumen, dónde aplicar y cómo validar. Sale como informe estilizado y PDF.",
            example: "Falla \"Sold-to party no encontrado\" → la IA devuelve el Groovy de verificación listo, indica pegarlo en el artefacto SalesOrder_Replication y cómo probarlo.",
            gains: ["De 'explica el problema' a 'entrega la solución'", "Reduce el tiempo de corrección a minutos", "Estandariza la calidad de la corrección entre analistas"],
          },
          {
            icon: "💬", name: "ChatOps por WhatsApp", tagline: "Opere el SAP por mensaje", flag: "Exclusivo",
            how: "Conecte un canal (WhatsApp Cloud API, Twilio, Telegram) vía webhook con token. La IA entiende el comando en lenguaje natural, ejecuta lo que es lectura al instante y, para acciones que tocan el SAP, crea una solicitud con aprobación. Tiene consola de prueba dentro de la app.",
            example: "En el WhatsApp de guardia: \"reprocesa los IDocs trabados del cliente Agro\" → \"📝 Creé 7 solicitudes de corrección para Agro. Apruebe en el panel para que el agente las ejecute\".",
            gains: ["Operación en la palma de la mano, sin abrir el panel", "La guardia responde desde cualquier lugar", "Seguro: nada destructivo se ejecuta sin aprobación"],
          },
          {
            icon: "📉", name: "Pérdida silenciosa de negocio", tagline: "Radar de ingresos", flag: "Exclusivo",
            how: "SAPLINK aprende el volumen normal de cada flujo de mensajes y lo compara con el de ahora. Si el volumen cae muy por debajo de lo esperado — incluso con todo 'verde' técnicamente — dispara una alerta de negocio.",
            example: "Todo verde, pero entraron un 60% menos de pedidos en la última hora vs el promedio. El radar avisa antes de que el cliente llame preguntando por la facturación.",
            gains: ["Captura la pérdida que ningún monitor técnico ve", "Anticipa un problema de negocio, no solo de TI", "Protege los ingresos silenciosamente parados"],
          },
          {
            icon: "🧨", name: "Pre-vuelo de cambio (blast radius)", tagline: "Antes del deploy, no después", flag: "Exclusivo",
            how: "Antes de que un transport pase a producción, SAPLINK cruza catálogo + integraciones + costo y calcula el radio de impacto (interfaces, procesos, R$/h) y un score de riesgo 0-100, con plan de prueba.",
            example: "Transport que toca el user-exit del MIGO → score 78 (ALTO), afecta a Facturación (R$ 45k/h). Plan: validar el proceso de facturación punta a punta antes de subir.",
            gains: ["Acaba con la parada post-upgrade", "Prueba lo que importa, no todo", "Decisión de subir/no subir con datos"],
          },
          {
            icon: "⏪", name: "Time machine de incidente", tagline: "Replay + contrafactual de R$", flag: "Exclusivo",
            how: "Reconstruye la línea de tiempo completa de un incidente (transports → fallas → alertas) y calcula el contrafactual: cuánto se habría ahorrado con una detección más rápida.",
            example: "Incidente de 2h30 = R$ 112k. Con detección en 5 min serían R$ 8k → R$ 104k ahorrados. Número irrefutable para la reunión de renovación.",
            gains: ["Prueba de ROI que renueva el contrato", "Aprende la causa del incidente", "Justifica la inversión en monitoreo"],
          },
          {
            icon: "🛡️", name: "Auditoría & Compliance autónoma", tagline: "SoD y evidencias automáticas", flag: "Exclusivo",
            how: "Rastro unificado de cambios (transports) y remediaciones (quién solicitó/aprobó), con verificación de segregación de funciones (SoD) y paquete de evidencias generado por IA para el auditor.",
            example: "Detecta que la misma persona solicitó y aprobó una remediación (violación de SoD) y la marca en rojo. Genera el informe de evidencias SOX/LGPD solo.",
            gains: ["Compliance sin armar planilla", "Detecta una violación de SoD al instante", "Evidencia lista para el auditor"],
          },
          {
            icon: "🤝", name: "Confiabilidad de socio EDI", tagline: "Quién manda datos malos", flag: "Exclusivo",
            how: "Agrega los errores por socio (IDocs/ítems) y ranquea por quién causa más fallas — con tasa de error, % del total y un score de confiabilidad.",
            example: "\"El proveedor KU_FORNEC22 causa el 41% de sus errores de IDoc (score 38).\" Munición para reclamar al socio correcto, no a su TI.",
            gains: ["Reclama al ofensor correcto", "Negociación con datos", "Reduce el error recurrente en el origen"],
          },
          {
            icon: "💵", name: "FinOps de BTP", tagline: "Costo de nube por IFlow", flag: "Exclusivo",
            how: "Vincula el volumen de mensajes de cada IFlow al costo estimado de consumo del BTP (tarifa configurable) y ranquea por gasto — detectando el IFlow desbocado.",
            example: "Un IFlow de timer disparando 1M de mensajes/mes = ~R$ 312/mes él solo. SAPLINK detecta el desperdicio antes de la factura sorpresa.",
            gains: ["Fin de la sorpresa en la factura del BTP", "Encuentra el IFlow en bucle", "Optimiza el gasto de nube"],
          },
        ],
      },
      {
        title: "🧠 Inteligencia de IA", color: "#22d3ee",
        intro: "IA aplicada de punta a punta — no un chatbot suelto, sino un copiloto que ve toda la cartera.",
        features: [
          {
            icon: "🩺", name: "Diagnóstico de causa raíz", tagline: "Causa + corrección + prevención",
            how: "Al hacer clic en \"Diagnosticar con IA\" en una falla, la IA lee el error real (mensaje del MPL/IDoc), el contexto del cliente y el historial, y devuelve la causa raíz, los pasos de corrección (con transacción SAP) y cómo prevenirla. Sale como informe estilizado y PDF.",
            example: "Falla HTTP 500 \"Sold-to party 0001234\" → la IA explica: el cliente no existe en S/4, crear/verificar el BP en XD01/BP, validar el mapeo en el IFlow, volver a probar.",
            gains: ["Diagnóstico en segundos, estandarizado", "PDF listo para adjuntar al ticket", "El analista junior produce como un senior"],
          },
          {
            icon: "💬", name: "Copiloto de la cartera", tagline: "Pregunte en lenguaje natural",
            how: "Un chat que ve todos los clientes, integraciones, estados y alertas. Pregunte en lenguaje natural y responde citando nombres y sugiriendo la acción.",
            example: "\"¿Qué clientes tienen una integración con error ahora?\" → lista los clientes, la integración y qué hacer en cada uno.",
            gains: ["Visión de la cartera sin armar un informe", "Respuesta accionable, no solo dato bruto", "Onboarding instantáneo de quien llega al equipo"],
          },
          {
            icon: "🔮", name: "Predicción de falla", tagline: "Antes de que se rompa",
            how: "Analiza la tendencia de las métricas (latencia, tasa de error, profundidad de cola) y señala una anomalía antes de que el incidente se vuelva una parada.",
            example: "\"La cola qRFC del cliente X crece 15%/h — va a desbordar en ~2h\". Usted actúa antes de que el cliente llame.",
            gains: ["Sale del modo apaga-incendios", "Ventana de mantenimiento en vez de un incidente", "Menos incumplimiento de SLA"],
          },
          {
            icon: "📬", name: "Digest semanal por IA", tagline: "Resumen ejecutivo en el correo",
            how: "Cada semana la IA escribe un resumen de la salud de la cartera (panorama, puntos de atención, recomendaciones) y lo envía por correo, con la marca de su consultora.",
            example: "El lunes por la mañana el gestor recibe: \"cartera estable; atención al cliente Y (3 IDocs en error recurrente); recomiendo revisar el destino RFC\".",
            gains: ["Prueba de valor recurrente sin esfuerzo", "Relación activa con el cliente", "Branding de la consultora en cada envío"],
          },
        ],
      },
      {
        title: "🛰️ Operación on-premise", color: "#34d399",
        intro: "El cockpit clásico de ECC/S4 on-prem — IDoc, colas, RFC — multi-cliente, sin abrir puertos.",
        features: [
          {
            icon: "📊", name: "Cockpit de IDoc & colas", tagline: "BD87 + SMQ + SM58 en un panel",
            how: "El Agente Docker corre en la red del cliente (solo tráfico de salida) y empuja el snapshot de IDocs en error, colas qRFC/tRFC trabadas y dumps. Todo en un panel multi-cliente.",
            example: "En vez de iniciar sesión en 8 SAP diferentes, usted ve en una pantalla: cliente A con 7 IDocs 51, cliente B con cola SYSFAIL.",
            gains: ["Una pantalla para toda la cartera", "Sin VPN/GUI para cada cliente", "Prioriza por lo que está peor"],
          },
          {
            icon: "✨", name: "Remediación autónoma", tagline: "Reprocesa con aprobación y log",
            how: "Cada ítem remediable tiene la acción SAP equivalente (BD87, SMQ2, SM58, SM59). Usted aprueba; el agente ejecuta y reporta el antes/después. Nada se ejecuta en el SAP sin aprobación (o vía AMS Autónomo, con guardrails).",
            example: "7 IDocs 51 → \"Reprocesar (RBDMANI2)\" → aprobar → el agente ejecuta → el ítem se resuelve solo.",
            gains: ["Corrección sin abrir la GUI", "Rastro de auditoría completo", "Estandariza la respuesta entre analistas"],
          },
          {
            icon: "📚", name: "Catálogo vivo de interfaces", tagline: "Landscape auto-descubierto",
            how: "El agente descubre y mantiene el inventario de socios (WE20), destinos RFC (SM59), message types, servicios OData y puertos IDoc — actualizado solo.",
            example: "Mapa siempre actual de \"qué conversa con qué\" en el cliente, sin planilla manual.",
            gains: ["Documentación que no envejece", "Onboarding de un nuevo cliente en minutos", "Base para análisis de impacto"],
          },
        ],
      },
      {
        title: "☁️ S/4HANA Cloud — buque insignia", color: "#fbbf24",
        intro: "La edición que la SAP empuja a todo el mundo (sin GUI, upgrade 2×/año, API-first). Cubrimos lo que falta — sin instalar nada.",
        features: [
          {
            icon: "🚀", name: "Radar de Upgrade", tagline: "Lo que se rompe en el próximo release",
            how: "Inventaria las APIs OData realmente consumidas (vía APIs liberadas) y las cruza con lo que será depreciado/alterado en el próximo release, mapeando a su uso real.",
            example: "\"Usted usa API_SALES_ORDER_SRV v2 (518k llamadas/registros) — será descontinuada. Migre a v4.\"",
            gains: ["Upgrade sin sorpresa dos veces al año", "Plan de migración basado en el uso real", "Evita la parada post-upgrade"],
          },
          {
            icon: "🧼", name: "Clean Core Score", tagline: "La métrica que la SAP exige",
            how: "Calcula la adherencia al Clean Core (APIs depreciadas, customizaciones, modificaciones) con puntuación y plan de remediación, derivado del uso real.",
            example: "Score 88/100 — principal deducción: API v2 depreciada en uso. Recomendación: migrar a v4.",
            gains: ["Muestra al cliente dónde está fuera del estándar", "Se vuelve un servicio de gobernanza recurrente", "Prepara el terreno para el próximo upgrade"],
          },
          {
            icon: "🧾", name: "Cockpit Fiscal DRC", tagline: "NF-e/SEFAZ — domina el mercado BR",
            how: "Monitorea documentos fiscales (NF-e, NFS-e, CT-e): rechazo SEFAZ, contingencia, pendientes — con valor en R$ y reproceso.",
            example: "\"NF-e 123 rechazada (cód. 539, duplicidad) — R$ 18.750 en riesgo\". Reprocesa por SAPLINK.",
            gains: ["No deja que la facturación se pare a escondidas", "Diferencial fuerte en el mercado brasileño", "R$ en riesgo fiscal visible al instante"],
          },
          {
            icon: "📨", name: "Event Mesh + CPI/AIF", tagline: "Dead-letter, lag y MPL reales",
            how: "Trae los Message Processing Logs reales del Cloud Integration y los eventos del Event Mesh — fallas, dead-letter, lag — y genera una alerta con el error detallado.",
            example: "IFlow FAILED → alerta + error real del MPL + botón \"Diagnosticar con IA\".",
            gains: ["Visibilidad de lo que la nube esconde", "Alerta con el mensaje de error de verdad", "Detección en vivo de las integraciones"],
          },
        ],
      },
      {
        title: "📈 Valor, SLA & confianza", color: "#f87171",
        intro: "Transforma la operación en prueba de valor — y la respuesta a incidentes en un proceso confiable.",
        features: [
          {
            icon: "📈", name: "SLA por cliente + informe IA", tagline: "Compliance con narrativa",
            how: "Define metas de uptime/latencia por cliente, mide el compliance y la IA escribe el informe mensual de SLA (resultado, incumplimientos, recomendaciones), con PDF.",
            example: "Informe ejecutivo: \"99,2% en el mes (meta 99,5%) — 2 incumplimientos en la integración de pedidos; recomiendo...\".",
            gains: ["Renovación de contrato con datos, no opinión", "Informe listo sin trabajo manual", "El cliente ve el valor entregado"],
          },
          {
            icon: "🪪", name: "Portal del cliente white-label", tagline: "Transparencia read-only",
            how: "Un portal con la marca de su consultora, read-only, donde el cliente final ve la salud de sus propias integraciones.",
            example: "El cliente accede y ve todo verde — confianza sin que usted tenga que mandar captura.",
            gains: ["Reduce el \"¿y cómo va?\"", "Transparencia que fideliza", "Su marca frente al cliente"],
          },
          {
            icon: "📣", name: "On-call multicanal + escalamiento", tagline: "Slack/Teams/Webhook/correo",
            how: "Las alertas se convierten en notificación en el canal correcto, con nivel de severidad y escalamiento automático si nadie responde a tiempo.",
            example: "Falla crítica → Slack de guardia; sin respuesta en 30 min → escala al líder.",
            gains: ["Nada cae en el vacío", "Guardia organizada por severidad", "MTTR menor"],
          },
          {
            icon: "🎫", name: "Tickets Jira/ServiceNow", tagline: "La alerta se vuelve ticket y se cierra sola",
            how: "Se integra con Jira/ServiceNow: la alerta abre el ticket automáticamente y lo cierra cuando la integración se recupera.",
            example: "El incidente abre INC-4521; al normalizarse, el ticket se cierra solo con el historial.",
            gains: ["Cero retrabajo de abrir/cerrar tickets", "ITSM siempre coherente con la realidad", "Métrica de tickets confiable"],
          },
        ],
      },
    ],
  },
};
