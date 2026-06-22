"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

interface Guide { what: string; why: string; actions: string[] }

// Registro de contexto por rota: o QUE é a tela, POR QUE importa e O QUE fazer.
// Resolve por prefixo (mais específico primeiro).
const GUIDES: Record<string, Guide> = {
  "/dashboard": {
    what: "Visão geral da saúde de toda a sua carteira de clientes SAP.",
    why: "É o seu ponto de partida do dia: mostra rápido quem está bem e quem precisa de atenção.",
    actions: ["Comece pelos clientes com health mais baixo ou alertas abertos", "Clique num cliente para ver as integrações e agir"],
  },
  "/clients": {
    what: "Seus clientes monitorados, com health score e nº de alertas.",
    why: "Cada cliente é um contrato. O health score é a sua prova de valor entregue.",
    actions: ["Priorize quem está abaixo de 80 de health", "Abra o cliente para ver integrações, alertas e diagnósticos"],
  },
  "/integrations": {
    what: "Todas as integrações (IDoc, CPI, RFC, OData) com status, latência e erro.",
    why: "É onde o problema realmente acontece — e onde você prova que está no controle.",
    actions: ["Olhe as que estão em ERROR/OFFLINE primeiro", "Use 'Diagnosticar com IA' para causa raiz e correção"],
  },
  "/cockpit": {
    what: "Cockpit operacional de IDocs em erro e filas (qRFC/tRFC) travadas, multi-cliente.",
    why: "Substitui logar em vários SAPs (BD87/SMQ2/SM58) por uma tela só.",
    actions: ["Filtre por cliente ou tipo", "Peça remediação nos itens marcados como remediáveis"],
  },
  "/alerts": {
    what: "Tudo que disparou alerta e ainda não foi resolvido.",
    why: "É a sua fila de trabalho priorizada por severidade.",
    actions: ["Resolva os CRITICAL/HIGH primeiro", "Alertas resolvem sozinhos quando a integração se recupera"],
  },
  "/diagnostics": {
    what: "Diagnóstico de IA sob demanda para um cliente/ambiente.",
    why: "Transforma um erro técnico em causa raiz + passos de correção + prevenção.",
    actions: ["Escolha o cliente e rode um preset", "Baixe o PDF para anexar no chamado"],
  },
  "/ask": {
    what: "Copiloto que enxerga a carteira inteira — pergunte em português.",
    why: "Resposta acionável sem precisar montar relatório.",
    actions: ["Pergunte 'quais clientes têm erro agora?'", "Peça um resumo da saúde da carteira"],
  },
  "/predict": {
    what: "Previsão de falha (tendência/anomalia) e benchmark da carteira.",
    why: "Antecipa o incidente antes da parada e mostra como você está vs o mercado.",
    actions: ["Veja o que tende a piorar e aja antes", "Use o benchmark como argumento comercial"],
  },
  "/catalog": {
    what: "Inventário vivo de interfaces (parceiros, destinos RFC, serviços OData).",
    why: "Documentação que não envelhece — base para análise de impacto e onboarding.",
    actions: ["Confira interfaces inativadas recentemente", "Use como mapa do landscape do cliente"],
  },
  "/validity": {
    what: "Radar de certificados, senhas e tokens próximos do vencimento.",
    why: "Evita a parada mais boba e mais comum: algo expirou.",
    actions: ["Renove o que está em CRITICAL/EXPIRED", "Acompanhe o que vence em 30 dias"],
  },
  "/dead-code": {
    what: "Objetos ABAP custom sem uso (candidatos a aposentar).",
    why: "Menos código morto = upgrade mais barato e Clean Core melhor.",
    actions: ["Comece pelos marcados como APOSENTAR", "Revise os de uso esporádico antes de remover"],
  },
  "/s4": {
    what: "Painel do S/4HANA Cloud: APIs, Clean Core, fiscal, upgrade, eventos.",
    why: "É o carro-chefe — cobre o que falta na edição que a SAP empurra em todos.",
    actions: ["Conecte o cliente (sandbox/Comm Arrangement)", "Ataque primeiro as APIs depreciadas e o Clean Core"],
  },
  "/upgrade": {
    what: "Radar de Upgrade: o que vai quebrar/depreciar no próximo release.",
    why: "Upgrade 2×/ano sem surpresa — mapeado ao que o cliente realmente usa.",
    actions: ["Priorize os itens BREAKING e DEPRECATED", "Gere o plano de migração antes da janela"],
  },
  "/cleancore": {
    what: "Clean Core Score — aderência ao padrão que a própria SAP cobra.",
    why: "Score baixo = upgrade caro e risco. Vira serviço de governança recorrente.",
    actions: ["Reduza as deduções de maior severidade", "Mostre o score ao cliente como meta a evoluir"],
  },
  "/fiscal": {
    what: "Cockpit fiscal: documentos (NF-e/faturas) e o que está bloqueado.",
    why: "Documento fiscal parado é faturamento parado — dinheiro real.",
    actions: ["Reprocesse os bloqueados (rejeição/contingência)", "Acompanhe o R$ em risco no topo"],
  },
  "/events": {
    what: "Eventos do Event Mesh: entregues, em retry e dead-letter.",
    why: "Evento em dead-letter é integração que silenciosamente parou.",
    actions: ["Investigue os DEAD_LETTER primeiro", "Acompanhe o lag dos assinantes"],
  },
  "/cloud": {
    what: "Mensagens reais do CPI/AIF (MPL/IFlows) com status e erro.",
    why: "É onde a integração de nuvem falha de verdade — e onde a IA atua.",
    actions: ["Filtre por FALHA", "Use 'Diagnosticar com IA' e 'Gerar correção pronta'"],
  },
  "/transports": {
    what: "Transports (STMS) importados recentemente.",
    why: "A maioria das falhas vem logo depois de uma mudança subir.",
    actions: ["Cruze com falhas na tela 'Causa cross-camada'", "Acompanhe o que foi pra PRD"],
  },
  "/sla": {
    what: "SLA por cliente, compliance e impacto em R$.",
    why: "É a prova de valor que renova contrato — e prioriza pelo que dói no caixa.",
    actions: ["Gere o relatório de SLA por IA (com PDF)", "Defina custo/hora nas integrações para o R$ em risco"],
  },
  "/reports": {
    what: "Relatórios prontos (mensal, migração, ROI, executivo).",
    why: "Material pronto para reunião com o cliente, sem trabalho manual.",
    actions: ["Escolha o cliente e o tipo de relatório", "Exporte e leve para a reunião"],
  },
  "/federated": {
    what: "Rede Federada: falhas e correções aprendidas de toda a base (anônimo).",
    why: "Quando algo falha, você já tem a correção que funcionou em outros ambientes.",
    actions: ["Veja a correção vencedora de cada assinatura", "Use como base de conhecimento da equipe"],
  },
  "/causal": {
    what: "Liga a mudança (transport) à falha que veio depois.",
    why: "Achar a causa em minutos em vez de horas de investigação.",
    actions: ["Olhe a causa provável e a confiança", "Confirme o transport suspeito com o time ABAP"],
  },
  "/autoheal": {
    what: "AMS Autônomo: correções automáticas de alta confiança + placar.",
    why: "Reduz o trabalho manual de L1/L2 e dá um número vendável (% sem humano).",
    actions: ["Ligue o piloto automático e ajuste a confiança mínima", "Escolha as ações permitidas"],
  },
  "/money": {
    what: "Dinheiro em risco ao vivo, por processo de negócio.",
    why: "Traduz falha técnica em R$ — a linguagem que o diretor entende.",
    actions: ["Configure custo/hora e processo nas integrações", "Priorize o processo com mais R$ parado"],
  },
  "/recon": {
    what: "Reconciliação ponta-a-ponta: o documento percorreu toda a jornada?",
    why: "'Entregue' não é 'virou negócio' — aqui você vê onde o volume se perde.",
    actions: ["Defina os estágios do processo (ex.: Pedido → Ordem → Fatura)", "Ataque o maior vazamento entre estágios"],
  },
  "/anomaly": {
    what: "Perda silenciosa: queda de volume mesmo com tudo verde.",
    why: "Captura receita parando antes de virar reclamação do cliente.",
    actions: ["Investigue os fluxos marcados como QUEDA/PAROU", "Compare esperado vs atual"],
  },
  "/chatops": {
    what: "Opere o SAP por mensagem (WhatsApp/Telegram).",
    why: "Plantão responde de qualquer lugar, sem abrir o painel.",
    actions: ["Teste comandos no console", "Gere o token e conecte seu canal"],
  },
  "/notifications": {
    what: "On-call multicanal e integração com tickets (Jira/ServiceNow).",
    why: "Garante que nenhum alerta cai no vácuo e que o ITSM fica coerente.",
    actions: ["Configure os canais por severidade", "Defina o tempo de escalonamento"],
  },
  "/billing": {
    what: "Sua assinatura, faturas e add-ons do SAPLINK.",
    why: "Mantém o serviço ativo e mostra o que está contratado.",
    actions: ["Acompanhe a próxima fatura", "Adicione integrações/usuários conforme cresce"],
  },
  "/preflight": {
    what: "Pré-voo de mudança: o raio de impacto de um transport antes de ir pra produção.",
    why: "Evita a parada pós-deploy — você sabe o que vai mexer e testa o certo.",
    actions: ["Escolha o transport a subir", "Veja o score de risco e o que será afetado", "Siga o plano de teste antes do import"],
  },
  "/timemachine": {
    what: "Reconstrói a linha do tempo de um incidente + o quanto teria sido economizado com detecção rápida.",
    why: "Prova de ROI irrefutável e aprendizado de causa.",
    actions: ["Escolha o incidente", "Veja a sequência de eventos", "Use o contrafactual de R$ na renovação"],
  },
  "/audit": {
    what: "Trilha de mudanças e remediações com checagem de segregação de função (SoD).",
    why: "Compliance pronto para o auditor, sem montar planilha.",
    actions: ["Revise as violações SoD em vermelho", "Gere o pacote de evidências com IA"],
  },
  "/partners": {
    what: "Ranking de parceiros EDI por dado ruim + custo estimado de BTP por IFlow.",
    why: "Cobra o parceiro certo e controla o gasto de nuvem.",
    actions: ["Aja sobre o parceiro com mais erros", "Veja o IFlow que mais consome BTP"],
  },
  "/ia": {
    what: "Conecte a IA da sua empresa (Claude/ChatGPT/Copilot) e defina a ordem de uso.",
    why: "Você usa (e paga) a sua própria IA; e pode deixar o SAPLINK aprender com ela.",
    actions: ["Cole a chave do provedor e teste a conexão", "Defina principal + reserva", "Ligue 'aprender com a IA externa' para o Ollama ficar mais esperto"],
  },
  "/settings": {
    what: "Configurações da consultoria: marca (white-label), usuários e preferências.",
    why: "Deixa o SAPLINK com a sua cara — na interface, nos relatórios e no portal do cliente.",
    actions: ["Suba o logo e defina a cor da marca", "Cadastre os usuários da sua equipe"],
  },
  "/platform/leads": {
    what: "Contatos que demonstraram interesse pela landing page.",
    why: "É o seu funil de vendas — cada lead é uma oportunidade.",
    actions: ["Fale com os leads novos primeiro", "Atualize o status conforme avança a negociação"],
  },
  "/platform/revenue": {
    what: "Receita da plataforma: assinaturas, MRR e faturas.",
    why: "A saúde financeira do negócio num lugar só.",
    actions: ["Acompanhe o MRR e a inadimplência", "Identifique consultorias em risco de churn"],
  },
  "/platform": {
    what: "Painel da plataforma: todas as consultorias (tenants) ativas.",
    why: "Visão de quem usa o SAPLINK e como está cada conta.",
    actions: ["Entre numa consultoria para ver detalhes", "Acompanhe adoção e uso"],
  },
};

function resolve(pathname: string): [string, Guide] | null {
  const keys = Object.keys(GUIDES).sort((a, b) => b.length - a.length);
  for (const k of keys) if (pathname === k || pathname.startsWith(k + "/")) return [k, GUIDES[k]];
  return null;
}

export default function PageGuide() {
  const pathname = usePathname();
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
  const [route, g] = match;

  return (
    <div className="mb-5 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/[0.07] to-cyan-500/[0.04] no-print">
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="text-lg leading-none mt-0.5">💡</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#e2e0ea]"><b>O que é:</b> {g.what}</p>
          <p className="text-sm text-[#9b95ad] mt-0.5"><b className="text-[#c9c5d6]">Por que importa:</b> {g.why}</p>
          {expanded && (
            <div className="mt-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 mb-1">O que fazer agora</p>
              <ul className="space-y-1">
                {g.actions.map((a, i) => (
                  <li key={i} className="text-sm text-[#d6d3e0] flex items-start gap-2"><span className="text-cyan-400 mt-0.5">→</span><span>{a}</span></li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setExpanded((v) => !v)} className="text-xs text-purple-300 hover:text-purple-200 mt-2 cursor-pointer">
            {expanded ? "Ocultar passos" : "O que faço com isso? →"}
          </button>
        </div>
        <button
          onClick={() => { localStorage.setItem(`guide-off-${route}`, "1"); setHidden(true); }}
          className="text-[#6b6580] hover:text-[#9b95ad] text-sm shrink-0 cursor-pointer"
          title="Ocultar nesta tela"
        >✕</button>
      </div>
    </div>
  );
}
