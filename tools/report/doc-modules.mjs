// Conteúdo detalhado de cada módulo do SAPLINK para a documentação BBP.
// Cada item: { num, titulo, objetivo, contexto?, regras[], fluxo{title,nodes[]},
//   subfluxos[], tela{rota,elementos[[tipo,nome,funcao]]}, integracoes[], excecoes[[sit,trat]], permissoes[[papel,oque]], nota? }

const ADMIN = 'CONSULTANCY_ADMIN';
const USER = 'CONSULTANCY_USER';

export const MODULES = [
  // 3 — AUTENTICAÇÃO
  {
    num: '3', titulo: 'Autenticação, cadastro e controle de acesso',
    objetivo: 'Garantir o acesso seguro e segmentado ao sistema: cadastro de novas consultorias (somente pessoa jurídica), login, recuperação de senha e o controle de acesso por papel (RBAC), além do bloqueio por assinatura inativa.',
    regras: [
      { id: 'RN-AUTH-01', x: 'O cadastro é exclusivo para empresas: exige CNPJ válido (validação de dígitos verificadores). CPF não é aceito.' },
      { id: 'RN-AUTH-02', x: 'No cadastro é obrigatório o aceite dos Termos de Uso, com registro de data/hora do aceite.' },
      { id: 'RN-AUTH-03', x: 'Ao registrar, a consultoria entra em período de avaliação (TRIALING) e o usuário criador vira CONSULTANCY_ADMIN.' },
      { id: 'RN-AUTH-04', x: 'O login retorna um token JWT; respostas 401 deslogam o usuário e o redirecionam ao login.' },
      { id: 'RN-AUTH-05', x: 'CONSULTANCY_USER não acessa Cobrança nem Configurações; o menu oculta esses itens e a rota é bloqueada.' },
      { id: 'RN-AUTH-06', x: 'Sem assinatura ativa: o admin vê CTA de "resolver pagamento"; o usuário comum vê aviso para contatar o administrador.' },
    ],
    fluxo: {
      title: 'Fluxo de cadastro e primeiro acesso', nodes: [
        { k: 'start', x: 'Visitante na landing page' },
        { k: 'proc', x: 'Clica em "Criar conta" e preenche CNPJ' },
        { k: 'io', x: 'Autofill por CNPJ (BrasilAPI) e CEP (ViaCEP)' },
        { k: 'dec', x: 'CNPJ válido e termos aceitos?', branch: 'Erro de validação; cadastro não prossegue' },
        { k: 'proc', x: 'Cria consultoria (TRIALING) + admin; login automático' },
        { k: 'proc', x: 'Escolhe plano e ativa assinatura' },
        { k: 'end', x: 'Acesso liberado ao sistema' },
      ],
    },
    subfluxos: [
      { title: 'Login', steps: ['Usuário informa e-mail e senha.', 'Backend valida credenciais e devolve JWT.', 'Frontend guarda o token e carrega o dashboard.'] },
      { title: 'Recuperação de senha', steps: ['Usuário pede redefinição informando o e-mail.', 'Sistema gera token de reset (expira em 1h) e envia e-mail (Resend).', 'Usuário define nova senha pelo link.'] },
      { title: 'Gestão de equipe (admin)', steps: ['Admin cria usuário (nome, e-mail, papel) em Configurações.', 'Sistema gera senha temporária e pode enviar convite.', 'Novo usuário troca a senha no primeiro acesso.'] },
    ],
    tela: {
      rota: '/login · /register · /reset-password',
      elementos: [
        ['Campo', 'E-mail', 'Identificação do usuário no login.'],
        ['Campo', 'Senha', 'Credencial; mascarada.'],
        ['Botão', 'Entrar', 'Submete o login e redireciona ao dashboard.'],
        ['Link', 'Criar conta', 'Abre o cadastro de empresa.'],
        ['Campo', 'CNPJ', 'Cadastro; máscara + validação + autofill BrasilAPI.'],
        ['Campo', 'Razão social / Nome fantasia / IE', 'Dados fiscais da empresa (para a nota).'],
        ['Campo', 'CEP / Logradouro / Número / Cidade / UF', 'Endereço (autofill ViaCEP).'],
        ['Campo', 'E-mail financeiro / Telefone', 'Contato de cobrança.'],
        ['Checkbox', 'Aceite dos Termos', 'Obrigatório; registra data/hora.'],
        ['Botão', 'Criar conta', 'Cria a consultoria + admin e faz login automático.'],
      ],
    },
    integracoes: ['BrasilAPI (consulta CNPJ).', 'ViaCEP (endereço).', 'Resend (e-mails de reset/convite).'],
    excecoes: [
      ['CNPJ inválido', 'Bloqueia o cadastro e sinaliza o campo.'],
      ['E-mail já cadastrado', 'Retorna erro e impede duplicidade.'],
      ['Token de reset expirado', 'Solicita novo pedido de redefinição.'],
      ['Token JWT inválido/expirado', 'HTTP 401 -> logout automático.'],
    ],
    permissoes: [
      [ADMIN, 'Tudo do tenant: criar/remover usuários, definir papéis, configurar e pagar.'],
      [USER, 'Operar (clientes, integrações, cockpit, alertas, IA); sem cobrança/configuração.'],
    ],
  },

  // 4 — DASHBOARD
  {
    num: '4', titulo: 'Dashboard',
    objetivo: 'Dar, em uma única tela, a leitura imediata da saúde de toda a carteira: total de clientes, alertas ativos, score médio, integrações ativas, anéis de health por cliente e os alertas mais recentes.',
    regras: [
      { id: 'RN-DASH-01', x: 'Os indicadores consideram apenas dados da consultoria logada.' },
      { id: 'RN-DASH-02', x: 'O health score por cliente é colorido por faixa: verde (>=80), âmbar (50–79) e vermelho (<50).' },
      { id: 'RN-DASH-03', x: 'Os "Alertas recentes" listam os mais novos primeiro, com severidade destacada.' },
    ],
    fluxo: {
      title: 'Carregamento do dashboard', nodes: [
        { k: 'start', x: 'Usuário autenticado abre /dashboard' },
        { k: 'proc', x: 'Frontend valida assinatura (gate de acesso)' },
        { k: 'dec', x: 'Assinatura ativa?', branch: 'Admin: CTA de pagamento · Usuário: contatar admin' },
        { k: 'io', x: 'Busca clientes, alertas e métricas agregadas' },
        { k: 'proc', x: 'Renderiza KPIs, anéis de health e alertas recentes' },
        { k: 'end', x: 'Visão da carteira pronta' },
      ],
    },
    tela: {
      rota: '/dashboard',
      elementos: [
        ['KPI', 'Total Clientes', 'Quantidade de clientes da carteira.'],
        ['KPI', 'Alertas Ativos', 'Alertas não resolvidos.'],
        ['KPI', 'Score Médio', 'Média do health score dos clientes.'],
        ['KPI', 'Integrações Ativas', 'Total de integrações monitoradas.'],
        ['Card', 'Cartão de cliente', 'Anel de health + nº de integrações e alertas; clicável para o detalhe.'],
        ['Lista', 'Alertas Recentes', 'Pill de severidade (CRITICAL/HIGH/…), mensagem e data.'],
      ],
    },
    integracoes: ['Consome os agregados de clientes, integrações e alertas do backend.'],
    excecoes: [
      ['Falha ao carregar', 'Exibe mensagem de erro amigável e mantém a navegação.'],
      ['Sem clientes', 'Mostra estado vazio convidando a cadastrar o primeiro cliente.'],
    ],
    permissoes: [[ADMIN, 'Acesso total.'], [USER, 'Acesso total (somente leitura dos indicadores).']],
  },

  // 5 — CLIENTES
  {
    num: '5', titulo: 'Clientes',
    objetivo: 'Cadastrar e gerenciar os clientes finais da consultoria, acessar o detalhe de cada um e ativar/gerir o portal white-label do cliente.',
    regras: [
      { id: 'RN-CLI-01', x: 'O número de clientes/integrações respeita os limites do plano (com add-ons quando contratados).' },
      { id: 'RN-CLI-02', x: 'Excluir um cliente remove em cascata seus dados operacionais (alertas, itens, catálogo, remediações, integrações).' },
      { id: 'RN-CLI-03', x: 'O portal do cliente é opcional e ativado por cliente, gerando um token único de link público.' },
      { id: 'RN-CLI-04', x: 'Criar/editar/excluir cliente e ativar portal são ações exclusivas do admin.' },
    ],
    fluxo: {
      title: 'Cadastro de cliente e ativação de portal', nodes: [
        { k: 'start', x: 'Admin em /clients' },
        { k: 'proc', x: 'Clica "+ Novo cliente" e informa nome/CNPJ' },
        { k: 'dec', x: 'Dentro do limite do plano?', branch: 'Bloqueia e sugere upgrade/add-on' },
        { k: 'proc', x: 'Cliente criado e listado com health score' },
        { k: 'proc', x: 'Opcional: ativa portal -> gera token e link público' },
        { k: 'end', x: 'Cliente pronto para receber integrações' },
      ],
    },
    subfluxos: [
      { title: 'Portal do cliente', steps: ['Admin clica no ícone de link () no card do cliente.', 'Ativa o portal -> sistema gera token e URL pública.', 'Admin copia o link e compartilha; pode desativar ou regenerar o token.'] },
    ],
    tela: {
      rota: '/clients · /clients/[id]',
      elementos: [
        ['Botão', '+ Novo cliente', 'Abre o formulário de cadastro.'],
        ['Campo', 'Nome do cliente', 'Obrigatório.'],
        ['Campo', 'CNPJ', 'Opcional.'],
        ['Botão', 'Criar cliente', 'Persiste o cliente respeitando o limite do plano.'],
        ['Card', 'Cliente', 'Anel de health, contagem de integrações/alertas; abre o detalhe.'],
        ['Ícone', 'Portal', 'Abre o painel de ativação/cópia do link do portal.'],
        ['Ícone', 'Excluir', 'Remove o cliente (confirmação obrigatória).'],
        ['Botão', 'Ativar/Desativar portal', 'Liga/desliga o portal e mostra o link.'],
      ],
    },
    integracoes: ['Billing (verificação de limite de plano/add-ons).', 'Serviço de portal (token público).'],
    excecoes: [
      ['Limite de plano atingido', 'Impede a criação e orienta upgrade/add-on.'],
      ['Exclusão de cliente com dados', 'Remove dependências em cascata antes de excluir.'],
    ],
    permissoes: [[ADMIN, 'Criar, editar, excluir clientes e gerir o portal.'], [USER, 'Visualizar clientes e detalhes.']],
  },

  // 6 — INTEGRAÇÕES
  {
    num: '6', titulo: 'Integrações',
    objetivo: 'Cadastrar e operar as integrações SAP de cada cliente: definição de tipo e configuração, teste de conexão, sincronização de métricas e habilitação do Agente on-premise (token).',
    contexto: 'As integrações monitoráveis via HTTP (OData/REST) são testadas diretamente pela plataforma; as on-premise (RFC/IDoc/SOAP/FILE/DATABASE) são monitoradas pelo Agente.',
    regras: [
      { id: 'RN-INT-01', x: 'A configuração sensível (usuário, senha, API key, tokens) é cifrada em repouso e mascarada na leitura.' },
      { id: 'RN-INT-02', x: 'Integração OData/REST com URL HTTPS é monitorável por probe direto; demais tipos exigem o Agente.' },
      { id: 'RN-INT-03', x: 'O status deriva do probe/relatório: ACTIVE (ok), ERROR (respondeu com erro) ou OFFLINE (sem resposta).' },
      { id: 'RN-INT-04', x: 'Métricas (uptime, taxa de erro, latência) usam média móvel (EWMA) a partir das leituras.' },
      { id: 'RN-INT-05', x: 'O token do Agente é exibido uma única vez na geração; o servidor guarda apenas o hash.' },
    ],
    fluxo: {
      title: 'Cadastro e monitoramento de integração', nodes: [
        { k: 'start', x: 'Usuário cadastra integração do cliente' },
        { k: 'proc', x: 'Escolhe tipo e preenche configuração' },
        { k: 'dec', x: 'É monitorável por HTTP (OData/REST)?', branch: 'Gera token e instala o Agente on-premise' },
        { k: 'proc', x: 'Plataforma faz probe periódico (auto-sync ~2 min)' },
        { k: 'io', x: 'Atualiza status e métricas (EWMA)' },
        { k: 'dec', x: 'Saiu do padrão (erro/offline)?', branch: 'Mantém monitorando e recalcula recuperação' },
        { k: 'proc', x: 'Cria alerta e dispara fluxo de notificação/ticket' },
        { k: 'end', x: 'Integração sob monitoramento contínuo' },
      ],
    },
    subfluxos: [
      { title: 'Teste de conexão', steps: ['Usuário aciona "Testar".', 'Backend faz o probe real e mede status/latência.', 'Retorna resultado honesto (sucesso ou causa do erro).'] },
      { title: 'Habilitar Agente', steps: ['Admin gera o token da integração.', 'Copia o token (exibido só uma vez) e a URL do agente.', 'Roda o container do Agente no ambiente do cliente.'] },
    ],
    tela: {
      rota: '/integrations · /integrations/all',
      elementos: [
        ['Botão', 'Nova integração', 'Cria integração para um cliente.'],
        ['Select', 'Tipo', 'ODATA, REST, IDOC, RFC, SOAP, FILE, DATABASE, CPI…'],
        ['Campo', 'serviceUrl / baseUrl / entitySet', 'Endpoint e recurso (OData/REST).'],
        ['Campo', 'Credenciais (user/senha/apiKey)', 'Cifradas; mascaradas na exibição.'],
        ['Botão', 'Testar', 'Probe real de conexão.'],
        ['Botão', 'Sincronizar', 'Força coleta imediata de métricas.'],
        ['Botão', 'Gerar token do Agente', 'Habilita o monitoramento on-premise.'],
        ['Botão', 'Diagnosticar com IA', 'Abre o diagnóstico do erro da integração.'],
        ['Badge', 'Status', 'ACTIVE / ERROR / OFFLINE / PENDING.'],
        ['Indicadores', 'Uptime · Erro · Latência', 'Métricas da integração.'],
      ],
    },
    integracoes: ['Endpoints SAP (OData/REST) via probe.', 'Agente on-premise (RFC/IDoc/SOAP).', 'Serviço de IA (diagnóstico).'],
    excecoes: [
      ['HTTP 401/403', 'Sinaliza credencial inválida/expirada; orienta atualização.'],
      ['HTTP 404/400 (OData)', 'Sugere EntitySet correto (lê o $metadata) — auto-corrigível.'],
      ['HTTP 5xx', 'Aponta falha no lado SAP; mantém monitorando.'],
      ['Sem resposta', 'Marca OFFLINE (timeout/rede/URL).'],
    ],
    permissoes: [[ADMIN, 'Criar, editar, excluir, gerar token, testar e sincronizar.'], [USER, 'Visualizar, testar e sincronizar.']],
  },

  // 7 — COCKPIT
  {
    num: '7', titulo: 'Cockpit de IDoc & filas',
    objetivo: 'Reunir, em um painel multi-cliente, os itens operacionais do SAP — IDocs em erro e filas qRFC/tRFC — equivalente a consolidar BD87, SMQ1/SMQ2 e SM58 em uma única tela, com filtros e contadores.',
    regras: [
      { id: 'RN-COCKPIT-01', x: 'Os itens são reportados pelo Agente como um snapshot; o que sai do snapshot é marcado como resolvido.' },
      { id: 'RN-COCKPIT-02', x: 'Cada item tem tipo (IDOC/QRFC/TRFC), referência, status SAP, parceiro e flag de remediável.' },
      { id: 'RN-COCKPIT-03', x: 'Os contadores agregam por tipo, por status e por cliente, além de profundidade de fila.' },
      { id: 'RN-COCKPIT-04', x: 'Apenas itens marcados como remediáveis podem gerar ação de remediação.' },
    ],
    fluxo: {
      title: 'Da detecção à visão no cockpit', nodes: [
        { k: 'start', x: 'Agente lê BD87/SMQ/SM58 no SAP' },
        { k: 'io', x: 'Push do snapshot de itens (HTTPS)' },
        { k: 'proc', x: 'Backend faz upsert por (integração, tipo, ref)' },
        { k: 'proc', x: 'Marca como resolvidos os itens ausentes do snapshot' },
        { k: 'io', x: 'Cockpit lista itens + contadores com filtros' },
        { k: 'dec', x: 'Item remediável?', branch: 'Marca "manual"; orienta ação no SAP' },
        { k: 'end', x: 'Pronto para remediar (cap. 8)' },
      ],
    },
    tela: {
      rota: '/cockpit',
      elementos: [
        ['KPI', 'Itens abertos / IDoc / qRFC / tRFC', 'Contadores por tipo.'],
        ['KPI', 'Profundidade de filas / Remediáveis', 'Total de LUWs e itens remediáveis.'],
        ['Filtro', 'Cliente', 'Restringe por cliente.'],
        ['Filtro', 'Tipo', 'IDoc / qRFC / tRFC.'],
        ['Filtro', 'Status', 'Ex.: 51, 56, 64, SYSFAIL, CPICERR, RETRY.'],
        ['Campo', 'Busca', 'Por referência, message type ou parceiro.'],
        ['Tabela', 'Itens', 'Tipo, referência, cliente, msg/parceiro, status, profundidade.'],
        ['Botão', 'Remediar', 'Solicita remediação do item (admin).'],
      ],
    },
    integracoes: ['Agente on-premise (push de itens).', 'Módulo de Remediação (cap. 8).'],
    excecoes: [
      ['Agente sem reportar', 'Itens permanecem como último snapshot; heartbeat marca o agente offline.'],
      ['Item não remediável', 'Exibe orientação de ação manual no SAP.'],
    ],
    permissoes: [[ADMIN, 'Ver e solicitar remediação.'], [USER, 'Ver; solicitação de remediação depende do papel (aprovação é do admin).']],
  },

  // 8 — REMEDIAÇÃO
  {
    num: '8', titulo: 'Remediação autônoma',
    objetivo: 'Permitir que o sistema execute correções no SAP (reprocessar IDoc, destravar fila, reexecutar tRFC, reativar destino RFC) de forma governada: solicitação, aprovação humana, execução pelo Agente e log de antes/depois.',
    regras: [
      { id: 'RN-REM-01', x: 'Toda remediação nasce como PENDING_APPROVAL e só executa após APPROVED por um admin.' },
      { id: 'RN-REM-02', x: 'A ação é puxada pelo Agente (modelo pull): a plataforma não acessa o SAP diretamente.' },
      { id: 'RN-REM-03', x: 'Estados: PENDING_APPROVAL -> APPROVED -> EXECUTING -> DONE/FAILED (ou REJECTED).' },
      { id: 'RN-REM-04', x: 'Em sucesso, o SapItem correspondente é marcado como resolvido; registra-se before/after.' },
      { id: 'RN-REM-05', x: 'Não se cria ação duplicada em aberto para o mesmo item.' },
    ],
    fluxo: {
      title: 'Ciclo de remediação', nodes: [
        { k: 'start', x: 'Item remediável no cockpit' },
        { k: 'proc', x: 'Admin solicita remediação (PENDING_APPROVAL)' },
        { k: 'dec', x: 'Admin aprova?', branch: 'REJECTED — encerra sem agir' },
        { k: 'proc', x: 'APPROVED -> entra na fila de comandos' },
        { k: 'io', x: 'Agente busca comandos aprovados (GET /commands)' },
        { k: 'proc', x: 'Executa no SAP (RBDMANI2/SMQ2/SM58/SM59)' },
        { k: 'io', x: 'Reporta resultado (POST /commands/:id/result)' },
        { k: 'dec', x: 'Sucesso?', branch: 'FAILED — registra erro para nova tentativa' },
        { k: 'end', x: 'DONE — item resolvido + log' },
      ],
    },
    tela: {
      rota: '/cockpit (painéis de remediação)',
      elementos: [
        ['Painel', 'Aguardando aprovação', 'Lista de ações pendentes (admin).'],
        ['Botão', 'Aprovar e executar', 'Muda para APPROVED; agente executa no próximo poll.'],
        ['Botão', 'Rejeitar', 'Encerra a ação (REJECTED).'],
        ['Painel', 'Histórico de remediações', 'Status por ação (Concluída/Falhou/…).'],
        ['Texto', 'Antes/Depois', 'Resultado e estado pós-execução (auditoria).'],
      ],
    },
    integracoes: ['Cockpit (origem do item).', 'Agente on-premise (execução).'],
    excecoes: [
      ['Falha na execução', 'Marca FAILED com a mensagem; permite nova solicitação.'],
      ['Item já resolvido', 'Bloqueia nova ação sobre o mesmo item.'],
      ['Item não remediável', 'Não permite criar a ação.'],
    ],
    permissoes: [[ADMIN, 'Solicitar, aprovar e rejeitar remediações.'], [USER, 'Visualizar o histórico; sem aprovar.']],
    nota: { k: 'ok', x: 'O modelo pull elimina a necessidade de a plataforma ter acesso de entrada ao SAP — o Agente é quem age, com aprovação registrada.' },
  },

  // 9 — CATÁLOGO
  {
    num: '9', titulo: 'Catálogo vivo de interfaces',
    objetivo: 'Manter um inventário sempre atualizado do landscape de integração de cada cliente: partner profiles (WE20), destinos RFC (SM59), message types, serviços OData e portas — descoberto automaticamente pelo Agente.',
    regras: [
      { id: 'RN-CAT-01', x: 'O catálogo é alimentado por descoberta do Agente; itens ausentes da última descoberta são marcados inativos (não somem — viram histórico).' },
      { id: 'RN-CAT-02', x: 'Cada item tem tipo, nome, detalhe e atributos; é pesquisável por cliente, tipo e texto.' },
    ],
    fluxo: {
      title: 'Descoberta e consulta do catálogo', nodes: [
        { k: 'start', x: 'Agente descobre o landscape (WE20/SM59/…)' },
        { k: 'io', x: 'Push do catálogo (HTTPS)' },
        { k: 'proc', x: 'Upsert por (integração, tipo, nome); inativa ausentes' },
        { k: 'io', x: 'Usuário busca/filtra no /catalog' },
        { k: 'end', x: 'Inventário consultável' },
      ],
    },
    tela: {
      rota: '/catalog',
      elementos: [
        ['KPI', 'Interfaces / Ativas / Parceiros / Destinos RFC', 'Resumo do landscape.'],
        ['Filtro', 'Cliente / Tipo', 'Restringe a consulta.'],
        ['Campo', 'Busca', 'Por nome ou descrição.'],
        ['Grupo', 'Por tipo', 'Parceiro (WE20), Destino RFC (SM59), Message Type, OData, Porta IDoc.'],
        ['Card', 'Item', 'Nome, descrição, cliente; marcado quando inativo.'],
      ],
    },
    integracoes: ['Agente on-premise (descoberta).'],
    excecoes: [['Sem descoberta', 'Catálogo vazio com orientação sobre o Agente.']],
    permissoes: [[ADMIN, 'Acesso total.'], [USER, 'Acesso total (consulta).']],
  },

  // 10 — DIAGNÓSTICO IA
  {
    num: '10', titulo: 'Diagnóstico por IA + SAP Notes',
    objetivo: 'Ao detectar um problema, explicar a causa raiz, propor a correção e — quando aplicável — corrigir na plataforma; além de sugerir a área/componente SAP, as transações e a busca da Nota/KBA provável.',
    regras: [
      { id: 'RN-DIAG-01', x: 'O diagnóstico é determinístico no que toca à conexão (baseado em probe real) e usa IA para a análise textual.' },
      { id: 'RN-DIAG-02', x: 'A sugestão de Nota SAP nunca inventa número: mapeia sintoma -> componente (ex.: BC-MID-ALE, OPU-GW) + transações + link de busca oficial.' },
      { id: 'RN-DIAG-03', x: 'A correção automática só é oferecida quando é segura e aplicável dentro da plataforma (ex.: ajustar EntitySet do OData).' },
      { id: 'RN-DIAG-04', x: 'A aplicação da correção automática (IA corrige) é exclusiva do admin e recalculada no servidor (não confia no cliente).' },
    ],
    fluxo: {
      title: 'Diagnóstico e correção', nodes: [
        { k: 'start', x: 'Usuário aciona "Diagnosticar com IA"' },
        { k: 'proc', x: 'Sistema analisa probe/estado e métricas' },
        { k: 'proc', x: 'IA descreve causa raiz + passos + prevenção' },
        { k: 'proc', x: 'Mapeia componente SAP + transações + SAP Notes' },
        { k: 'dec', x: 'Correção automática disponível?', branch: 'Apresenta passos manuais e a Nota a buscar' },
        { k: 'proc', x: 'Admin clica "IA corrige" -> aplica e re-sincroniza' },
        { k: 'end', x: 'Mostra o que foi alterado (antes/depois)' },
      ],
    },
    tela: {
      rota: '/diagnostics',
      elementos: [
        ['Texto', 'Causa raiz', 'Explicação da origem do problema.'],
        ['Texto', 'Recomendação / Passos', 'Como resolver, com transações.'],
        ['Bloco', 'SAP Notes sugeridas', 'Área, componente, transações e link de busca oficial.'],
        ['Botão', 'IA corrige', 'Aplica a correção segura (admin).'],
        ['Bloco', 'Resultado da correção', 'Mudanças aplicadas, antes/depois e recuperação.'],
      ],
    },
    integracoes: ['Serviço de IA (Ollama/Claude).', 'Conector de integrações (probe/correção).'],
    excecoes: [
      ['IA indisponível', 'Mensagem honesta de indisponibilidade (não fabrica análise).'],
      ['Correção não aplicável', 'Oferece apenas orientação manual.'],
    ],
    permissoes: [[ADMIN, 'Diagnosticar e aplicar correção automática.'], [USER, 'Diagnosticar e ver recomendações.']],
  },

  // 11 — COPILOTO
  {
    num: '11', titulo: 'Pergunte ao SAPLINK (copiloto IA)',
    objetivo: 'Oferecer um chat em linguagem natural que enxerga toda a carteira da consultoria e responde perguntas operacionais ("quais clientes têm IDoc travado?", "onde está o maior risco?") de forma objetiva e acionável.',
    regras: [
      { id: 'RN-ASK-01', x: 'O contexto da resposta é a carteira inteira da consultoria (clientes, integrações, métricas e alertas), nunca dados de outro tenant.' },
      { id: 'RN-ASK-02', x: 'A resposta cita clientes/integrações pelo nome e sugere a transação ou o passo quando cabível.' },
      { id: 'RN-ASK-03', x: 'O copiloto não inventa dados fora do contexto fornecido.' },
    ],
    fluxo: {
      title: 'Pergunta e resposta', nodes: [
        { k: 'start', x: 'Usuário digita a pergunta' },
        { k: 'proc', x: 'Backend monta o contexto da carteira' },
        { k: 'proc', x: 'IA responde com base no contexto' },
        { k: 'io', x: 'Resposta exibida no chat' },
        { k: 'end', x: 'Decisão acionável em segundos' },
      ],
    },
    tela: {
      rota: '/ask',
      elementos: [
        ['Sugestões', 'Perguntas iniciais', 'Atalhos para começar.'],
        ['Campo', 'Pergunta', 'Texto livre.'],
        ['Botão', 'Enviar', 'Submete ao copiloto.'],
        ['Balões', 'Conversa', 'Mensagens do usuário e da IA.'],
      ],
    },
    integracoes: ['Serviço de IA.', 'Agregadores de carteira (clientes/integrações/alertas).'],
    excecoes: [['IA indisponível', 'Mensagem honesta; não responde com dado fabricado.']],
    permissoes: [[ADMIN, 'Acesso total.'], [USER, 'Acesso total.']],
  },

  // 12 — DIGEST
  {
    num: '12', titulo: 'Digest semanal por IA',
    objetivo: 'Enviar, semanalmente e por e-mail, um resumo executivo white-label da saúde da carteira, narrado por IA — com panorama, pontos de atenção e recomendações.',
    regras: [
      { id: 'RN-DIG-01', x: 'O digest é agendado: um verificador periódico envia para consultorias com a opção ligada e janela de 7 dias vencida.' },
      { id: 'RN-DIG-02', x: 'O envio real exige provedor de e-mail configurado (RESEND_API_KEY); sem ele, opera em modo log.' },
      { id: 'RN-DIG-03', x: 'Os destinatários são os admins da consultoria e o e-mail financeiro (dedup).' },
      { id: 'RN-DIG-04', x: 'O template é white-label (nome/cor da consultoria).' },
    ],
    fluxo: {
      title: 'Geração e envio do digest', nodes: [
        { k: 'start', x: 'Scheduler verifica janela (a cada 6h)' },
        { k: 'dec', x: 'Digest ligado e 7 dias vencidos?', branch: 'Aguarda a próxima verificação' },
        { k: 'proc', x: 'Coleta snapshot de saúde da carteira' },
        { k: 'proc', x: 'IA narra panorama/atenção/recomendações' },
        { k: 'io', x: 'Envia e-mail white-label aos admins' },
        { k: 'end', x: 'Registra data do último envio' },
      ],
    },
    tela: {
      rota: '/settings (cartão "Digest semanal")',
      elementos: [
        ['Toggle', 'Digest semanal', 'Liga/desliga o envio automático.'],
        ['Botão', 'Ver prévia da IA', 'Gera a narrativa sem enviar.'],
        ['Botão', 'Enviar agora', 'Dispara o digest sob demanda.'],
        ['Texto', 'Último envio', 'Data/hora do último disparo.'],
      ],
    },
    integracoes: ['Serviço de IA (narrativa).', 'Resend (e-mail).'],
    excecoes: [
      ['Sem provedor de e-mail', 'Opera em modo log; sinaliza no painel.'],
      ['IA indisponível', 'Envia o digest com os números, sem a narrativa.'],
    ],
    permissoes: [[ADMIN, 'Configurar, pré-visualizar e enviar.'], [USER, 'Sem acesso (em Configurações).']],
  },

  // 13 — RADAR DE VALIDADE
  {
    num: '13', titulo: 'Radar de validade',
    objetivo: 'Antecipar o vencimento de certificados TLS dos endpoints (detecção automática por handshake real) e de segredos manuais (senha de usuário RFC, client secret OAuth, certificado SNC), com severidade e alertas.',
    regras: [
      { id: 'RN-VAL-01', x: 'O certificado TLS é lido por handshake real no host do endpoint HTTPS (notAfter).' },
      { id: 'RN-VAL-02', x: 'A severidade é: EXPIRADO (<0d), CRÍTICO (<=7d), ATENÇÃO (<=30d), OK (>30d).' },
      { id: 'RN-VAL-03', x: 'Itens <=30 dias geram alerta automático (idempotente por integração).' },
      { id: 'RN-VAL-04', x: 'A reavaliação ocorre periodicamente (scheduler) e sob demanda pelo admin.' },
    ],
    fluxo: {
      title: 'Verificação de validade', nodes: [
        { k: 'start', x: 'Scheduler (12h) ou admin aciona reavaliação' },
        { k: 'proc', x: 'Handshake TLS lê o certificado do endpoint' },
        { k: 'proc', x: 'Calcula dias restantes e severidade' },
        { k: 'dec', x: 'Vence em <=30 dias?', branch: 'Mantém como OK no radar' },
        { k: 'io', x: 'Abre alerta de expiração' },
        { k: 'end', x: 'Radar atualizado' },
      ],
    },
    tela: {
      rota: '/validity',
      elementos: [
        ['Resumo', 'Expirado / Crítico / Atenção / OK', 'Contadores por severidade.'],
        ['Botão', 'Reavaliar certificados', 'Reprocessa os certs da consultoria (admin).'],
        ['Lista', 'Item de validade', 'Cert/segredo, host, dias restantes, data.'],
        ['Botão', 'Reavaliar (por item)', 'Re-lê o certificado de um endpoint.'],
        ['Form', 'Registrar segredo', 'Define expiração manual (senha RFC, OAuth, SNC).'],
      ],
    },
    integracoes: ['Handshake TLS nos endpoints HTTPS.', 'Módulo de Alertas.'],
    excecoes: [['Endpoint inacessível', 'Não registra cert (comportamento honesto); fica sem item até reachable.']],
    permissoes: [[ADMIN, 'Reavaliar e registrar segredos.'], [USER, 'Visualizar o radar.']],
  },

  // 14 — ALERTAS
  {
    num: '14', titulo: 'Alertas',
    objetivo: 'Centralizar os alertas gerados pelo sistema (erros, offline, expiração, falhas reportadas pelo Agente), permitir filtro/visualização e resolução, e servir de gatilho para notificação e tickets.',
    regras: [
      { id: 'RN-ALR-01', x: 'Alertas têm tipo, severidade (CRITICAL/HIGH/MEDIUM/…), mensagem e status (resolvido/não).' },
      { id: 'RN-ALR-02', x: 'Entrar em estado ruim dispara alerta; voltar a ACTIVE resolve os alertas abertos da integração.' },
      { id: 'RN-ALR-03', x: 'Alertas alimentam o processamento de notificações (cap. 15) e ticket sync (cap. 16).' },
    ],
    fluxo: {
      title: 'Ciclo de vida do alerta', nodes: [
        { k: 'start', x: 'Probe/Agente detecta estado ruim' },
        { k: 'proc', x: 'Cria alerta (severidade conforme a falha)' },
        { k: 'io', x: 'Scheduler notifica canais / abre ticket' },
        { k: 'dec', x: 'Integração recuperou?', branch: 'Permanece aberto e pode escalar' },
        { k: 'proc', x: 'Resolve alertas abertos da integração' },
        { k: 'end', x: 'Ticket vinculado é encerrado' },
      ],
    },
    tela: {
      rota: '/alerts',
      elementos: [
        ['Filtro', 'Severidade / Status', 'Restringe a lista.'],
        ['Lista', 'Alerta', 'Severidade, mensagem, cliente/integração, data.'],
        ['Botão', 'Resolver', 'Marca o alerta como resolvido.'],
        ['Indicador', 'Ticket vinculado', 'Chave/URL quando houver chamado.'],
      ],
    },
    integracoes: ['On-call (cap. 15).', 'Ticket sync (cap. 16).'],
    excecoes: [['Alerta duplicado', 'Atualiza o existente em vez de duplicar (ex.: validade).']],
    permissoes: [[ADMIN, 'Ver e resolver.'], [USER, 'Ver e resolver.']],
  },

  // 15 — ON-CALL
  {
    num: '15', titulo: 'On-call multicanal e escalonamento',
    objetivo: 'Direcionar os alertas para os canais certos (Slack, Teams, Webhook, e-mail) por nível e severidade, e escalar para o nível 2 quando um alerta não é resolvido no tempo configurado.',
    regras: [
      { id: 'RN-OC-01', x: 'Canais têm tipo, destino, severidade mínima e nível (1 = imediato, 2 = escalonamento).' },
      { id: 'RN-OC-02', x: 'Um alerta novo notifica os canais de nível 1 cuja severidade mínima seja atendida.' },
      { id: 'RN-OC-03', x: 'Alertas não resolvidos além de N minutos (configurável) escalam para o nível 2.' },
      { id: 'RN-OC-04', x: 'O processamento é feito por scheduler (a cada ~60s), idempotente por flags no alerta.' },
    ],
    fluxo: {
      title: 'Notificação e escalonamento', nodes: [
        { k: 'start', x: 'Alerta criado (não notificado)' },
        { k: 'proc', x: 'Scheduler envia aos canais de nível 1' },
        { k: 'dec', x: 'Resolvido dentro do prazo?', branch: 'Escala: notifica canais de nível 2' },
        { k: 'end', x: 'Encerrado / registrado' },
      ],
    },
    tela: {
      rota: '/notifications',
      elementos: [
        ['Lista', 'Canais', 'Tipo, nome, destino, nível, severidade mínima; testar/remover.'],
        ['Form', 'Novo canal', 'Tipo (Slack/Teams/Webhook/E-mail), destino, nível, severidade.'],
        ['Botão', 'Testar', 'Envia mensagem de teste ao canal.'],
        ['Campo', 'Escalar após (min)', 'Tempo até o nível 2.'],
      ],
    },
    integracoes: ['Slack/Teams/Webhook (HTTP).', 'Resend (e-mail).'],
    excecoes: [['Canal inacessível', 'Falha tratada e registrada; não interrompe os demais canais.']],
    permissoes: [[ADMIN, 'Configurar canais e escalonamento.'], [USER, 'Sem acesso.']],
  },

  // 16 — TICKETS
  {
    num: '16', titulo: 'Ticket sync (Jira / ServiceNow)',
    objetivo: 'Transformar alertas relevantes em chamados no Jira ou ServiceNow automaticamente e encerrá-los quando o problema é resolvido, mantendo o processo de ITSM do cliente em dia.',
    regras: [
      { id: 'RN-TK-01', x: 'A configuração (provider, URL, usuário, token, projeto) é por consultoria; o token é cifrado.' },
      { id: 'RN-TK-02', x: 'Abre chamado quando a severidade do alerta atinge o mínimo configurado.' },
      { id: 'RN-TK-03', x: 'Ao resolver o alerta, o chamado vinculado é encerrado/comentado.' },
    ],
    fluxo: {
      title: 'Sincronização de chamados', nodes: [
        { k: 'start', x: 'Alerta atinge severidade mínima' },
        { k: 'io', x: 'Cria issue/incident via REST (Jira/ServiceNow)' },
        { k: 'proc', x: 'Grava chave/URL no alerta' },
        { k: 'dec', x: 'Alerta resolvido?', branch: 'Mantém o chamado aberto' },
        { k: 'io', x: 'Encerra/comenta o chamado' },
        { k: 'end', x: 'ITSM sincronizado' },
      ],
    },
    tela: {
      rota: '/notifications (cartão de tickets)',
      elementos: [
        ['Select', 'Provider', 'Jira ou ServiceNow.'],
        ['Campo', 'baseUrl / usuário / token / projeto', 'Conexão (token cifrado).'],
        ['Select', 'Severidade mínima', 'Limite para abrir chamado.'],
        ['Botão', 'Salvar / Criar chamado de teste', 'Persiste e valida a conexão.'],
      ],
    },
    integracoes: ['Jira REST API.', 'ServiceNow Table API.'],
    excecoes: [['Credencial inválida', 'Teste retorna falha com orientação; não abre chamado.']],
    permissoes: [[ADMIN, 'Configurar e testar.'], [USER, 'Sem acesso.']],
  },

  // 17 — PORTAL
  {
    num: '17', titulo: 'Portal do cliente final (white-label)',
    objetivo: 'Disponibilizar um link público, somente leitura, com a marca da consultoria, no qual o cliente final acompanha a própria saúde: integrações, uptime médio e incidentes abertos.',
    regras: [
      { id: 'RN-POR-01', x: 'O portal é ativado por cliente e acessado por um token único na URL (sem login).' },
      { id: 'RN-POR-02', x: 'É estritamente read-only e expõe apenas dados daquele cliente (sem configuração).' },
      { id: 'RN-POR-03', x: 'O branding (logo/cor) é o da consultoria.' },
      { id: 'RN-POR-04', x: 'Desativar ou regenerar o token invalida o link anterior.' },
    ],
    fluxo: {
      title: 'Acesso ao portal', nodes: [
        { k: 'start', x: 'Admin ativa o portal do cliente' },
        { k: 'io', x: 'Sistema gera token e URL pública' },
        { k: 'proc', x: 'Cliente final abre o link' },
        { k: 'dec', x: 'Token válido e portal ativo?', branch: 'Exibe "Portal indisponível"' },
        { k: 'io', x: 'Mostra saúde, uptime e incidentes (read-only)' },
        { k: 'end', x: 'Transparência para o cliente' },
      ],
    },
    tela: {
      rota: '/portal/[token] (público)',
      elementos: [
        ['Cabeçalho', 'Marca da consultoria', 'Logo/cor white-label.'],
        ['Card', 'Health / Uptime / Integrações / Incidentes', 'Indicadores do cliente.'],
        ['Lista', 'Integrações', 'Nome, tipo, status, uptime, latência.'],
        ['Lista', 'Incidentes abertos', 'Severidade, mensagem, data.'],
      ],
    },
    integracoes: ['Branding da consultoria.', 'Dados de saúde do cliente.'],
    excecoes: [['Token inválido/desativado', 'Página "Portal indisponível".']],
    permissoes: [[ADMIN, 'Ativar/desativar/regenerar o portal por cliente.'], [USER, 'Visualizar status do portal.']],
  },

  // 18 — SLA
  {
    num: '18', titulo: 'SLA por cliente',
    objetivo: 'Definir metas de nível de serviço (uptime e latência) por cliente, medir o compliance automaticamente e emitir relatório mensal narrado por IA.',
    regras: [
      { id: 'RN-SLA-01', x: 'Cada cliente tem meta de uptime (%) e de latência (ms).' },
      { id: 'RN-SLA-02', x: 'Uma integração está "no SLA" quando uptime >= meta e latência <= meta; o compliance do cliente é a fração no SLA.' },
      { id: 'RN-SLA-03', x: 'O compliance geral é a média dos clientes com integrações.' },
      { id: 'RN-SLA-04', x: 'O relatório mensal é narrado por IA (resultado, quebras e recomendações).' },
    ],
    fluxo: {
      title: 'Medição e relatório de SLA', nodes: [
        { k: 'start', x: 'Métricas das integrações atualizadas' },
        { k: 'proc', x: 'Compara uptime/latência com as metas' },
        { k: 'proc', x: 'Calcula compliance por cliente e geral' },
        { k: 'dec', x: 'Gerar relatório?', branch: 'Apenas exibe o painel de compliance' },
        { k: 'io', x: 'IA narra o relatório mensal' },
        { k: 'end', x: 'Pronto para apresentar ao cliente' },
      ],
    },
    tela: {
      rota: '/sla',
      elementos: [
        ['Indicador', 'Compliance geral', 'Média da carteira.'],
        ['Card', 'SLA por cliente', 'Compliance, médias e quebras.'],
        ['Campo', 'Meta uptime / latência', 'Edição por cliente (admin).'],
        ['Botão', 'Relatório IA', 'Gera a narrativa mensal.'],
      ],
    },
    integracoes: ['Métricas de integrações.', 'Serviço de IA (relatório).'],
    excecoes: [['Cliente sem integrações', 'Não entra na média de compliance.']],
    permissoes: [[ADMIN, 'Definir metas e gerar relatório.'], [USER, 'Visualizar SLA e gerar relatório.']],
  },

  // 19 — IMPACTO R$
  {
    num: '19', titulo: 'Impacto financeiro (R$)',
    objetivo: 'Traduzir paradas de integração em dinheiro: associar custo de parada por hora e processo de negócio a cada integração e calcular o R$/hora em risco e a exposição acumulada.',
    regras: [
      { id: 'RN-IMP-01', x: 'Cada integração pode receber custo de parada por hora (em centavos) e o processo de negócio impactado.' },
      { id: 'RN-IMP-02', x: 'R$/hora em risco = soma do custo/hora das integrações fora do ar (status ≠ ACTIVE).' },
      { id: 'RN-IMP-03', x: 'Exposição acumulada = custo/hora × horas paradas (estimadas pela idade do alerta aberto).' },
    ],
    fluxo: {
      title: 'Cálculo de impacto', nodes: [
        { k: 'start', x: 'Admin define custo/hora por integração' },
        { k: 'proc', x: 'Sistema identifica integrações fora do ar' },
        { k: 'proc', x: 'Soma R$/h em risco e acumula pela idade do incidente' },
        { k: 'io', x: 'Exibe dashboard de exposição' },
        { k: 'end', x: 'ROI/risco em R$ para o C-level' },
      ],
    },
    tela: {
      rota: '/sla (seção Impacto)',
      elementos: [
        ['KPI', 'R$/hora em risco', 'Soma do custo das integrações fora do ar.'],
        ['KPI', 'Exposição acumulada', 'Estimativa pela idade dos incidentes.'],
        ['Tabela', 'Por integração', 'Status, R$/h, horas, acumulado.'],
        ['Form', 'Definir custo de parada', 'Custo/hora e processo de negócio (admin).'],
      ],
    },
    integracoes: ['Métricas/alertas de integrações.'],
    excecoes: [['Integração ACTIVE', 'Não conta como risco (acumulado = 0).']],
    permissoes: [[ADMIN, 'Definir custos e ver o dashboard.'], [USER, 'Ver o dashboard.']],
  },

  // 20 — TRANSPORTS
  {
    num: '20', titulo: 'Radar de transports (STMS)',
    objetivo: 'Descobrir os transportes importados (STMS) e correlacionar automaticamente cada incidente com os transportes das 24h anteriores — apontando a provável causa de problemas pós-deploy.',
    regras: [
      { id: 'RN-TR-01', x: 'Os transportes são reportados pelo Agente (número, descrição, owner, alvo, data de importação).' },
      { id: 'RN-TR-02', x: 'Um incidente é correlacionado a um transporte importado entre 0 e 24h antes do alerta, no mesmo cliente.' },
    ],
    fluxo: {
      title: 'Correlação incidente × transporte', nodes: [
        { k: 'start', x: 'Agente descobre transportes (STMS)' },
        { k: 'io', x: 'Push de transports (HTTPS)' },
        { k: 'proc', x: 'Para cada incidente aberto, busca TRs nas 24h anteriores' },
        { k: 'dec', x: 'Há transporte recente?', branch: 'Sem correlação evidente' },
        { k: 'io', x: 'Marca os transportes como provável causa' },
        { k: 'end', x: 'Root-cause acelerado' },
      ],
    },
    tela: {
      rota: '/transports',
      elementos: [
        ['KPI', 'Transports / Incidentes / Correlacionados', 'Resumo do radar.'],
        ['Bloco', 'Provável causa', 'Incidente + transportes suspeitos das 24h anteriores.'],
        ['Tabela', 'Transportes recentes', 'TR, descrição, cliente, alvo, owner, importado.'],
        ['Filtro', 'Cliente', 'Restringe a visão.'],
      ],
    },
    integracoes: ['Agente on-premise (STMS).', 'Módulo de Alertas.'],
    excecoes: [['Sem transportes', 'Lista vazia com orientação sobre o Agente.']],
    permissoes: [[ADMIN, 'Acesso total.'], [USER, 'Acesso total.']],
  },

  // 21 — PREVISÃO
  {
    num: '21', titulo: 'Previsão de falha',
    objetivo: 'Antecipar falhas por integração combinando o estado atual (erro/latência/fila) com a tendência ao longo do tempo, classificando o risco em alto, médio e baixo.',
    regras: [
      { id: 'RN-PRE-01', x: 'O sistema captura amostras de métricas periodicamente (snapshot) para análise de tendência.' },
      { id: 'RN-PRE-02', x: 'O score combina estado atual (taxa de erro, uptime, profundidade de fila) e tendência (alta de erro/latência/fila).' },
      { id: 'RN-PRE-03', x: 'Classificação: ALTO (>=66), MÉDIO (>=33) e BAIXO; com pouco histórico, indica "coletando histórico".' },
    ],
    fluxo: {
      title: 'Cálculo de risco', nodes: [
        { k: 'start', x: 'Scheduler amostra métricas (5 min)' },
        { k: 'proc', x: 'Avalia estado atual + tendência por integração' },
        { k: 'proc', x: 'Gera score e nível de risco' },
        { k: 'io', x: 'Exibe ranking de risco' },
        { k: 'end', x: 'Ação preventiva priorizada' },
      ],
    },
    tela: {
      rota: '/predict',
      elementos: [
        ['Resumo', 'Alto / Médio / Baixo', 'Contagem por nível.'],
        ['Card', 'Integração', 'Score, nível, sinais detectados, previsão.'],
        ['Barra', 'Risco', 'Indicador visual do score.'],
      ],
    },
    integracoes: ['Amostras de métricas (MetricSample).', 'Cockpit (profundidade de fila).'],
    excecoes: [['Histórico insuficiente', 'Indica coleta em andamento; usa estado atual.']],
    permissoes: [[ADMIN, 'Acesso total.'], [USER, 'Acesso total.']],
  },

  // 22 — BENCHMARK
  {
    num: '22', titulo: 'Benchmark cross-cliente',
    objetivo: 'Comparar a saúde da carteira contra o agregado anônimo de mercado, por tipo de integração — uptime, erro e latência vs percentil — formando um moat de dados que cresce com a base.',
    regras: [
      { id: 'RN-BMK-01', x: 'A agregação de mercado é anônima e por tipo de integração (IDoc, RFC, OData, CPI…).' },
      { id: 'RN-BMK-02', x: 'O percentil de uptime indica a fração da base no nível do cliente ou abaixo (maior = melhor).' },
      { id: 'RN-BMK-03', x: 'A riqueza do benchmark aumenta com o número de consultorias na base.' },
    ],
    fluxo: {
      title: 'Comparação com o mercado', nodes: [
        { k: 'start', x: 'Sistema agrega métricas por tipo (toda a base, anônimo)' },
        { k: 'proc', x: 'Calcula médias e percentil do tenant' },
        { k: 'io', x: 'Exibe sua carteira vs mercado' },
        { k: 'end', x: 'Argumento de posicionamento' },
      ],
    },
    tela: {
      rota: '/predict (seção Benchmark)',
      elementos: [
        ['Tabela', 'Por tipo', 'Seu uptime, mercado e percentil; erro e latência.'],
        ['Indicador', 'Tenants na base', 'Quantidade que compõe o agregado.'],
      ],
    },
    integracoes: ['Agregação cross-tenant anônima.'],
    excecoes: [['Base pequena', 'Resultado tende ao próprio tenant; melhora com escala.']],
    permissoes: [[ADMIN, 'Acesso total.'], [USER, 'Acesso total.']],
  },

  // 23 — CPI/AIF
  {
    num: '23', titulo: 'CPI / Integration Suite e AIF',
    objetivo: 'Estender o monitoramento ao stack moderno: mensagens do SAP Cloud Integration (Message Processing Logs / IFlows) e do Application Interface Framework (AIF).',
    regras: [
      { id: 'RN-CPI-01', x: 'As mensagens são ingeridas com fonte (CPI ou AIF), artefato (IFlow/interface), id, status e erro.' },
      { id: 'RN-CPI-02', x: 'Mensagens com status de falha (FAILED/ERROR/ESCALATED/RETRY) entram como não resolvidas.' },
      { id: 'RN-CPI-03', x: 'A evidência ao vivo do CPI pode vir do SAP BTP (Integration Suite).' },
    ],
    fluxo: {
      title: 'Monitoramento CPI/AIF', nodes: [
        { k: 'start', x: 'Agente/coletor lê MPL (CPI) e mensagens AIF' },
        { k: 'io', x: 'Push de cloud-items (HTTPS)' },
        { k: 'proc', x: 'Upsert por (integração, fonte, messageId)' },
        { k: 'io', x: 'Lista com filtros por fonte/status/busca' },
        { k: 'end', x: 'Stack moderno coberto' },
      ],
    },
    tela: {
      rota: '/cloud',
      elementos: [
        ['KPI', 'Mensagens / CPI / AIF / Falhas', 'Resumo por fonte.'],
        ['Filtro', 'Fonte / Status', 'CPI/AIF e estado da mensagem.'],
        ['Campo', 'Busca', 'IFlow, interface ou messageId.'],
        ['Tabela', 'Mensagens', 'Fonte, artefato, messageId, status, erro, quando.'],
      ],
    },
    integracoes: ['SAP Cloud Integration (MPL).', 'AIF.', 'SAP BTP (evidência).'],
    excecoes: [['Sem coletor', 'Lista vazia; orientação sobre conector/Agente.']],
    permissoes: [[ADMIN, 'Acesso total.'], [USER, 'Acesso total.']],
  },

  // 24 — DEAD CODE
  {
    num: '24', titulo: 'Dead Code',
    objetivo: 'Apoiar a governança técnica do cliente identificando objetos/integrações sem uso e recomendando ação (manter/revisar/aposentar).',
    regras: [
      { id: 'RN-DC-01', x: 'Cada item traz último uso, contagem de uso e recomendação.' },
      { id: 'RN-DC-02', x: 'A análise é por cliente.' },
    ],
    fluxo: {
      title: 'Identificação de dead code', nodes: [
        { k: 'start', x: 'Coleta de uso por objeto/integração' },
        { k: 'proc', x: 'Classifica por último uso e frequência' },
        { k: 'io', x: 'Lista com recomendação' },
        { k: 'end', x: 'Base para limpeza do landscape' },
      ],
    },
    tela: {
      rota: '/dead-code',
      elementos: [
        ['Filtro', 'Recomendação', 'Manter / revisar / aposentar.'],
        ['Tabela', 'Objeto', 'Nome, tipo, último uso, contagem, recomendação.'],
      ],
    },
    integracoes: ['Dados de uso por cliente.'],
    excecoes: [['Sem dados de uso', 'Estado vazio.']],
    permissoes: [[ADMIN, 'Acesso total.'], [USER, 'Acesso total.']],
  },

  // 25 — RELATÓRIOS
  {
    num: '25', titulo: 'Relatórios',
    objetivo: 'Gerar relatórios white-label da operação para apresentação ao cliente, aproveitando branding, métricas e SLA.',
    regras: [
      { id: 'RN-REL-01', x: 'Os relatórios usam a marca da consultoria (white-label).' },
      { id: 'RN-REL-02', x: 'Podem ser exportados (impressão/PDF) para envio ao cliente.' },
    ],
    fluxo: {
      title: 'Geração de relatório', nodes: [
        { k: 'start', x: 'Usuário escolhe o escopo do relatório' },
        { k: 'proc', x: 'Sistema consolida métricas/SLA/incidentes' },
        { k: 'io', x: 'Renderiza relatório white-label' },
        { k: 'end', x: 'Exporta/compartilha' },
      ],
    },
    tela: {
      rota: '/reports',
      elementos: [
        ['Seleção', 'Escopo / período', 'Cliente e intervalo.'],
        ['Botão', 'Exportar PDF', 'Gera o documento para envio.'],
      ],
    },
    integracoes: ['Branding.', 'Métricas/SLA.'],
    excecoes: [['Sem dados no período', 'Relatório indica ausência de dados.']],
    permissoes: [[ADMIN, 'Acesso total.'], [USER, 'Acesso total.']],
  },

  // 26 — BILLING
  {
    num: '26', titulo: 'Cobrança e planos (billing)',
    objetivo: 'Gerir a assinatura da consultoria: catálogo de planos, add-ons, faturas com PDF, dashboard de gastos, escolha entre cobrança automática ou pagamento avulso, via Stripe.',
    regras: [
      { id: 'RN-BIL-01', x: 'Estados da assinatura: TRIALING -> ACTIVE -> PAST_DUE -> SUSPENDED -> CANCELED.' },
      { id: 'RN-BIL-02', x: 'O acesso ao sistema exige assinatura ativa; sem ela, aplica-se o gate de acesso (RN-G-03).' },
      { id: 'RN-BIL-03', x: 'Há add-ons por integração e por usuário, somados aos limites do plano.' },
      { id: 'RN-BIL-04', x: 'O pagamento pode ser automático (renovação) ou avulso ("pagar a fatura agora").' },
      { id: 'RN-BIL-05', x: 'Webhooks do provedor (Stripe) atualizam o estado de pagamento; a verificação de assinatura usa raw body.' },
      { id: 'RN-BIL-06', x: 'CONSULTANCY_USER não vê dados financeiros (a API devolve apenas status para esse papel).' },
    ],
    fluxo: {
      title: 'Assinatura e pagamento', nodes: [
        { k: 'start', x: 'Admin escolhe plano/add-ons' },
        { k: 'io', x: 'Cria sessão de checkout (Stripe)' },
        { k: 'dec', x: 'Pagamento confirmado?', branch: 'PAST_DUE — exibe CTA de regularização' },
        { k: 'proc', x: 'Webhook ativa a assinatura (ACTIVE)' },
        { k: 'io', x: 'Emite fatura (PDF) e atualiza dashboard de gastos' },
        { k: 'end', x: 'Acesso liberado / renovação' },
      ],
    },
    tela: {
      rota: '/billing',
      elementos: [
        ['Grade', 'Planos', 'Comparativo (Starter/Pro/Business/Enterprise) com destaque.'],
        ['Card', 'Assinatura', 'Status, uso vs limites, toggle de renovação automática.'],
        ['Stepper', 'Add-ons', 'Integrações/usuários adicionais.'],
        ['Lista', 'Faturas', 'Histórico com PDF e "Pagar agora".'],
        ['Toggle', 'Cobrança automática / avulsa', 'Modo de pagamento.'],
        ['Dashboard', 'Gastos', 'Visão de consumo/gastos.'],
      ],
    },
    integracoes: ['Stripe (checkout, faturas, webhooks).', 'Asaas (alternativa).'],
    excecoes: [
      ['Pagamento falhou', 'Assinatura vai a PAST_DUE; admin recebe CTA.'],
      ['Webhook sem corpo válido', 'Retorna 400 (proteção do endpoint).'],
    ],
    permissoes: [[ADMIN, 'Ver e gerir planos, add-ons e faturas; pagar.'], [USER, 'Sem acesso ao financeiro.']],
  },

  // 27 — CONFIGURAÇÕES
  {
    num: '27', titulo: 'Configurações e white-label',
    objetivo: 'Centralizar as preferências da consultoria: marca (white-label), equipe (usuários e papéis), digest semanal e demais ajustes administrativos.',
    regras: [
      { id: 'RN-CFG-01', x: 'O white-label define nome, logo e cor primária, refletidos na interface, e-mails e portal.' },
      { id: 'RN-CFG-02', x: 'A gestão de usuários cria contas com papel e senha temporária.' },
      { id: 'RN-CFG-03', x: 'Configurações são exclusivas do admin.' },
    ],
    fluxo: {
      title: 'Configuração da consultoria', nodes: [
        { k: 'start', x: 'Admin abre /settings' },
        { k: 'proc', x: 'Ajusta marca, equipe e digest' },
        { k: 'io', x: 'Salva preferências do tenant' },
        { k: 'end', x: 'Interface/portais refletem a marca' },
      ],
    },
    tela: {
      rota: '/settings',
      elementos: [
        ['Bloco', 'Perfil', 'Dados do usuário e papel.'],
        ['Form', 'Marca (white-label)', 'Nome exibido, URL do logo, cor primária.'],
        ['Lista/Form', 'Usuários da equipe', 'Criar/remover usuários e definir papel.'],
        ['Cartão', 'Digest semanal', 'Toggle, prévia e envio (cap. 12).'],
      ],
    },
    integracoes: ['Branding aplicado a UI/e-mail/portal.', 'Gestão de usuários.'],
    excecoes: [['Logo inválido', 'Mantém o fallback de marca textual.']],
    permissoes: [[ADMIN, 'Configurar tudo.'], [USER, 'Sem acesso.']],
  },

  // 28 — AGENTE
  {
    num: '28', titulo: 'Agente on-premise',
    objetivo: 'Descrever o componente que roda na rede do cliente, lê o SAP localmente e empurra os dados à plataforma por HTTPS de saída, além de executar remediações aprovadas (pull).',
    contexto: 'O Agente é um container Docker. Modos: mock (demonstração), rfc (RFC real via SDK) e soap (FM STFC_CONNECTION via SOAMANAGER, sem SDK).',
    regras: [
      { id: 'RN-AG-01', x: 'O Agente autentica por token da integração (X-Agent-Token) e só faz saída HTTPS.' },
      { id: 'RN-AG-02', x: 'Reporta: saúde, itens (IDoc/filas), catálogo, transports e mensagens CPI/AIF; e puxa comandos de remediação.' },
      { id: 'RN-AG-03', x: 'O heartbeat marca a integração OFFLINE se o Agente parar de reportar (janela configurável).' },
      { id: 'RN-AG-04', x: 'No modo rfc, exige o SAP NW RFC SDK; no modo soap, basta expor o web service do FM.' },
    ],
    fluxo: {
      title: 'Ciclo do Agente', nodes: [
        { k: 'start', x: 'Container inicia com SAPLINK_URL + AGENT_TOKEN' },
        { k: 'proc', x: 'Valida o token (ping)' },
        { k: 'io', x: 'Coleta saúde/itens/catálogo/transports/CPI-AIF' },
        { k: 'io', x: 'Push para a plataforma (HTTPS)' },
        { k: 'dec', x: 'Há comando aprovado?', branch: 'Apenas continua reportando' },
        { k: 'proc', x: 'Executa remediação e reporta o resultado' },
        { k: 'end', x: 'Repete no intervalo de polling' },
      ],
    },
    tela: {
      rota: 'Configuração via variáveis de ambiente (sem UI própria)',
      elementos: [
        ['Var', 'SAPLINK_URL', 'Endereço da plataforma.'],
        ['Var', 'AGENT_TOKEN', 'Token da integração (gerado na tela de Integrações).'],
        ['Var', 'SAP_MODE', 'mock | rfc | soap.'],
        ['Var', 'POLL_SECONDS', 'Intervalo de coleta/report.'],
        ['Var', 'SAP_* / SAP_SOAP_URL', 'Conexão SAP (rfc/soap).'],
      ],
    },
    integracoes: ['SAP (RFC/IDoc/STMS/SOAP).', 'Plataforma SAPLINK (ingestão e comandos).'],
    excecoes: [
      ['Token inválido', 'Encerra com orientação para gerar novo token.'],
      ['Sem conexão com a plataforma', 'Faz retry; não perde o loop.'],
      ['SDK ausente (modo rfc)', 'Orienta instalar o SDK ou usar mock/soap.'],
    ],
    permissoes: [[ADMIN, 'Gera o token e instala o Agente.'], [USER, 'Não opera o Agente diretamente.']],
  },
];
