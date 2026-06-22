"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

interface Feature {
  icon: string; name: string; tagline: string;
  how: string; example: string; gains: string[];
  flag?: string;
}
interface Group { title: string; color: string; intro: string; features: Feature[] }

const GROUPS: Group[] = [
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
];

export default function FuncionalidadesPage() {
  return (
    <div className="min-h-screen bg-transparent text-[#e2e0ea]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0f0b1a]/85 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
          <Link href="/"><Logo size={26} /></Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="text-sm text-[#9b95ad] hover:text-white transition hidden sm:inline">← Início</Link>
            <Link href="/#planos" className="text-sm px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold">Tenho interesse</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-5">
        {/* Hero */}
        <section className="py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">Cada funcionalidade, em detalhe</h1>
          <p className="text-[#9b95ad] max-w-2xl mx-auto mt-4 leading-relaxed">
            O que cada recurso faz, como funciona, um exemplo real e o ganho que ele gera em produtividade e em R$. Sem marketing vazio — operação de verdade.
          </p>
        </section>

        {/* Índice */}
        <nav className="flex flex-wrap gap-2 justify-center pb-10">
          {GROUPS.map((g, gi) => (
            <a key={g.title} href={`#grp${gi}`} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition" style={{ color: g.color }}>
              {g.title}
            </a>
          ))}
        </nav>

        {GROUPS.map((g, gi) => (
          <section key={g.title} id={`grp${gi}`} className="py-10 border-t border-white/[0.06]">
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: g.color }}>{g.title}</h2>
            <p className="text-[#9b95ad] mt-2 mb-8 max-w-3xl">{g.intro}</p>
            <div className="space-y-5">
              {g.features.map((f) => (
                <article key={f.name} className="bg-[#1a1527] border border-white/[0.08] rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-4 flex-wrap">
                    <span className="text-4xl">{f.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-bold">{f.name}</h3>
                        {f.flag && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase">{f.flag}</span>}
                      </div>
                      <p className="text-sm" style={{ color: g.color }}>{f.tagline}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6580] mb-1">Como funciona</p>
                      <p className="text-sm text-[#c9c5d6] leading-relaxed">{f.how}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6580] mt-4 mb-1">Exemplo real</p>
                      <p className="text-sm text-[#c9c5d6] leading-relaxed bg-[#0f0b1a] border border-white/[0.06] rounded-lg p-3">{f.example}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6580] mb-2">Ganhos em produtividade & R$</p>
                      <ul className="space-y-2">
                        {f.gains.map((gn, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#d6d3e0]">
                            <span className="text-emerald-400 mt-0.5">📈</span><span>{gn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="py-14 sm:py-20 border-t border-white/[0.06]">
          <div className="rounded-2xl p-8 sm:p-12 text-center bg-gradient-to-br from-purple-600/20 to-cyan-500/15 border border-purple-500/30">
            <h2 className="text-2xl sm:text-4xl font-bold">Quer ver no SAP dos seus clientes?</h2>
            <p className="text-[#c9c5d6] mt-3 max-w-xl mx-auto">Deixe seu contato — mostramos o SAPLINK rodando ao vivo.</p>
            <div className="mt-7 flex justify-center">
              <Link href="/#planos" className="px-7 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold">Tenho interesse →</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9b95ad] text-center sm:text-left">
          <span className="flex items-center gap-2"><Logo size={20} /> © {new Date().getFullYear()} — Operação de integrações SAP</span>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-white transition">Início</Link>
            <Link href="/login" className="hover:text-white transition">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
