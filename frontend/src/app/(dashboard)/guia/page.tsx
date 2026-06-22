"use client";

interface Topic { icon: string; name: string; what: string; how: string; do: string }
interface Chapter { title: string; color: string; intro: string; topics: Topic[] }
interface SetupGuide { icon: string; name: string; intro: string; steps: string[]; fields: { label: string; value: string }[] }

const REDIRECT_URI = "https://saplink.com.br/api/auth/sso/callback";

const SSO_SETUP: SetupGuide[] = [
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
];

const EBOOK: Chapter[] = [
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
];

export default function GuiaPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="no-print flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">📖 Guia completo do SAPLINK</h1>
          <p className="text-[#9b95ad] text-sm mt-1">Seu manual de bordo: o que cada tela faz, como funciona e o que fazer com a informação. Do zero ao valor.</p>
        </div>
        <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 text-sm font-semibold cursor-pointer">⬇ Baixar como PDF</button>
      </div>

      {EBOOK.map((ch) => (
        <section key={ch.title}>
          <h2 className="text-xl font-bold" style={{ color: ch.color }}>{ch.title}</h2>
          <p className="text-sm text-[#9b95ad] mt-1 mb-4">{ch.intro}</p>
          <div className="space-y-3">
            {ch.topics.map((t) => (
              <div key={t.name} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2"><span className="text-xl">{t.icon}</span><h3 className="font-semibold text-[#e2e0ea]">{t.name}</h3></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div><p className="text-[11px] uppercase tracking-wider text-[#6b6580] mb-0.5">O que é</p><p className="text-[#c9c5d6]">{t.what}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider text-[#6b6580] mb-0.5">Como funciona</p><p className="text-[#c9c5d6]">{t.how}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wider text-[#6b6580] mb-0.5">O que fazer</p><p className="text-emerald-200">{t.do}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Configuração técnica — SSO + conectores */}
      <section>
        <h2 className="text-xl font-bold" style={{ color: "#c084fc" }}>7. Configuração técnica (admin)</h2>
        <p className="text-sm text-[#9b95ad] mt-1 mb-4">Passo-a-passo para conectar o login corporativo (SSO) e os produtos SAP Cloud do cliente. Tudo é por cliente: cada um usa as próprias credenciais.</p>

        <div className="bg-purple-500/[0.06] border border-purple-500/20 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-[#e2e0ea] mb-1">🔐 SSO / Login corporativo</h3>
          <p className="text-sm text-[#c9c5d6]">Escolha o provedor de identidade do cliente abaixo. Em todos, o segredo: cadastrar o <b>Redirect URI</b> do SAPLINK no IdP e colar Client ID, Client Secret e Issuer na tela <b>SSO corporativo</b>. Importante: o usuário precisa <b>já existir no SAPLINK com o mesmo e-mail</b> — o SSO autentica, não cria conta sozinho.</p>
        </div>

        <div className="space-y-3">
          {SSO_SETUP.map((g) => (
            <div key={g.name} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><span className="text-xl">{g.icon}</span><h3 className="font-semibold text-[#e2e0ea]">{g.name}</h3></div>
              <p className="text-sm text-[#9b95ad] mb-3">{g.intro}</p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-[#c9c5d6] mb-3">
                {g.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              <div className="space-y-1.5">
                {g.fields.map((f) => (
                  <div key={f.label} className="bg-[#0f0b1a] border border-white/[0.08] rounded-lg px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wider text-[#6b6580]">{f.label}</p>
                    <code className="text-xs text-purple-200 break-all">{f.value}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 mt-3">
          <div className="flex items-center gap-2 mb-1"><span className="text-xl">🔌</span><h3 className="font-semibold text-[#e2e0ea]">Conectores Ariba / SuccessFactors</h3></div>
          <p className="text-sm text-[#9b95ad] mb-3">Para monitorar Ariba e SuccessFactors além do S/4. Cada produto usa a API Key do cliente.</p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-[#c9c5d6]">
            <li>No SAP Business Accelerator Hub (api.sap.com) ou no tenant do cliente, gere/obtenha a <b>API Key</b> do produto.</li>
            <li>No SAPLINK, vá em <b>Conectores (Ariba/SF)</b>, escolha o cliente e o produto, clique <b>Conectar</b> e cole a API Key (a base URL já vem preenchida com o sandbox).</li>
            <li>Clique <b>Sincronizar</b>: as APIs alcançadas entram no inventário e aparecem no <b>Catálogo vivo</b>.</li>
          </ol>
        </div>
      </section>

      <p className="text-xs text-[#6b6580] no-print">Dica: cada tela do sistema também tem o guia rápido (💡) no topo e o botão "🤖 Explique e recomende" que lê os dados reais e sugere a próxima ação.</p>
    </div>
  );
}
