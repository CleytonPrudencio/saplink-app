# SAPLINK — Plano S/4HANA Cloud (carro-chefe)

> Tese: o SAPLINK deixa de ser "monitor de integrações" e vira a **plataforma de operação,
> governança de Clean Core e compliance fiscal para SAP S/4HANA Cloud (public edition)** —
> a edição onde a SAP empurra todos os clientes, onde **não há SAP GUI/tcodes**, o **upgrade é
> forçado 2×/ano** e tudo é **API-first**. É exatamente onde as ferramentas atuais não chegam.

## Por que S/4HANA Cloud é a aposta certa
- **Para onde o mercado vai:** RISE/GROW with SAP empurra todo mundo pro Cloud. Base crescente, contratos novos.
- **Dor aguda e recorrente:** upgrade semestral obrigatório quebra extensão/CDS/API → **medo de regressão** todo semestre.
- **Narrativa da própria SAP a nosso favor:** "Clean Core". Entregamos a métrica que a SAP cobra.
- **Vazio de tooling:** Cloud ALM é genérico; o monitor de DRC é fraco; Event Mesh quase não tem observabilidade.
- **Onboarding mais fácil que on-prem:** sem agente — conecta via **Communication Arrangement** (OAuth/cert) e puxa por OData/SOAP das APIs liberadas. Zero porta aberta.

## Público e posicionamento
- **Comprador:** consultorias SAP que operam S/4HANA Cloud (AMS/managed services) e clientes finais em RISE/GROW.
- **Pitch de uma linha:** *"Opere seu S/4HANA Cloud sem medo do upgrade, com o core limpo e o fiscal em dia — com prova de valor em R$."*
- **Empacotamento:** add-on premium "SAPLINK for S/4HANA Cloud" sobre os planos atuais.

---

## Fase 0 — Fundação: Conector S/4HANA Cloud (habilitador)
Sem isso nada roda. Substitui o agente on-premise por um **conector cloud**.
- **0.1 Conexão via Communication Arrangement** — registro de Communication User + scopes de leitura; suporte a OAuth 2.0 e certificado de cliente.
- **0.2 Catálogo de APIs liberadas consumidas** — descobre quais Communication Scenarios/APIs (SAP_COM_xxxx) estão ativos e quais APIs liberadas o tenant usa (base do Radar de Upgrade e do Clean Core).
- **0.3 Coletor por OData/SOAP** — ingestão agendada (pull) das APIs de monitoramento/negócio liberadas; normaliza no modelo atual (Integration/CloudItem/MetricSample).
- **0.4 Multi-tenant cloud** — uma Communication Arrangement por cliente; segredos cifrados (reaproveita o que já existe).
- **Esforço:** alto · **Depende de:** nada · **Entrega:** "tempo até valor" de horas, sem instalar nada no cliente.

---

## Fase S1 — Upgrade & Clean Core  ★ CARRO-CHEFE
A dor nº 1 do S/4HANA Cloud. É aqui que o sistema vira "obrigatório".

- **S1.1 Radar de Upgrade / Release Impact** ⭐
  Antes de cada release (2×/ano), cruza **as APIs e extensões que o cliente realmente usa** com o "What's New"/deprecações da SAP e mostra o que vai quebrar (API depreciada, CDS custom, extensão side-by-side, campo in-app).
  - *Gatilho:* elimina o medo do upgrade. Evitar 1 regressão em PRD paga o ano.
  - *Fonte:* catálogo de APIs consumidas (0.2) + base de releases/deprecações da SAP.
- **S1.2 Clean Core Score & Advisor** ⭐
  Nota de "limpeza do core": uso de APIs depreciadas, in-app vs side-by-side, CDS/objetos custom, modificações. Plano de remediação priorizado.
  - *Gatilho:* surfa a mensagem oficial da SAP; a consultoria vende projeto de Clean Core em cima.
- **S1.3 API Consumption & Deprecation Watch**
  Inventário vivo de APIs consumidas; alerta de versão depreciada (v2→v4), volume por API, candidatas a substituir código custom por API liberada.
- **S1.4 Regression smoke-test pós-upgrade**
  Bateria de testes de fumaça contra as APIs liberadas após cada release/upgrade; relatório de "passou/quebrou".
  - *Gatilho:* prova automatizada de que o upgrade não quebrou nada.

---

## Fase S2 — Encanamento do S/4HANA Cloud
O que mantém a integração de pé no dia a dia do Cloud.

- **S2.1 Saúde de Communication Arrangements & certificados**
  Cada arrangement, communication user, **certificado expirando**, scenario inbound/outbound num painel único (estende o Radar de Validade que já existe).
  - *Gatilho:* a falha mais comum e mais boba do Cloud é cert/arrangement vencido.
- **S2.2 Monitor de Application Jobs (background)**
  Sem SM37: jobs agendados que falham, atrasam ou se sobrepõem, com alerta e histórico.
- **S2.3 Output Management & eDocument (visão técnica)**
  Status de saídas (BRF+) e da fila de e-Documents — ponte para a Fase S3 (fiscal).

---

## Fase S3 — Fiscal Brasil: DRC / eDocument  ★ MATADOR LOCAL
Onde a SAP é fraca e o Brasil sente na veia. Fecha contrato sozinho.

- **S3.1 Cockpit DRC (Document and Reporting Compliance)** ⭐⭐
  NF-e, NFS-e, CT-e: **rejeições da SEFAZ, lote travado, contingência, fila de e-Documents**, com causa e ação.
  - *Gatilho:* nota fiscal parada = faturamento parado. Prioridade máxima do cliente.
- **S3.2 Reporting & SPED status**
  Acompanhamento das obrigações/relatórios via DRC (geração, submissão, pendências).
- **S3.3 Remediação fiscal com aprovação**
  Reenvio/reprocesso de e-Documents direto da plataforma (com aprovação e log) — usa o motor de remediação que já existe.

---

## Fase S4 — Event-driven & Integration Suite (Cloud)
Oceano azul: integração moderna quase sem observabilidade.

- **S4.1 Observabilidade de Event Mesh / Advanced Event Mesh**
  Entrega de eventos de negócio, **dead-letter**, lag, assinantes ociosos, retentativas.
- **S4.2 CPI/Integration Suite + Master Data Integration (MDI)**
  Estende o módulo CPI/AIF atual ao mundo Cloud: MPL, IFlows e sincronização de dados mestre (MDI).
- **S4.3 Side-by-side BTP — saúde das extensões**
  Apps CAP/RAP no BTP consumindo o S/4: destinos, quotas, saúde dos serviços.

---

## Fase S5 — Inteligência & valor (reaproveita o que já temos)
- **S5.1 Copiloto S/4HANA Cloud** — linguagem natural ciente do mundo Cloud (Communication Arrangements, APIs, DRC); de pergunta a ação via APIs liberadas.
- **S5.2 SLA & Impacto em R$ por processo** — O2C/P2P/fiscal no contexto Cloud (estende D1/D2).
- **S5.3 Benchmark de Clean Core cross-cliente** — índice anônimo de mercado: "seu core está mais limpo que X% da base" (moat de dados, estende E2).
- **S5.4 Post-mortem & runbook automáticos por IA** — RCA e atualização de runbook a cada incidente.

---

## Sequência recomendada (e por quê)
1. **Fase 0** (conector) — sem ela nada roda.
2. **S1.1 Radar de Upgrade + S1.2 Clean Core Score** — os dois maiores motivos de compra; demonstráveis cedo.
3. **S3.1 Cockpit DRC** — fecha o mercado brasileiro.
4. **S2.1 Communication Arrangements/certs** — quick win de credibilidade (reaproveita Radar de Validade).
5. **S4.1 Event Mesh** + **S5.x** — diferenciação e moat.

## Notas de implementação
- O conector usa **APIs liberadas** (SAP Business Accelerator Hub); confirmar os Communication Scenarios (SAP_COM_xxxx) e endpoints OData/SOAP na implementação de cada feature.
- Onde a SAP não expõe API de monitoramento, usar os dados de negócio (volumes, status de documentos) para inferir saúde — inclusive a **detecção de anomalia de negócio** (queda de volume vs padrão).
- Reaproveita a base atual: Integration, CloudItem, MetricSample, RemediationAction, Alert, SLA/Impacto, IA, billing/white-label.

> Carro-chefe = **S1 (Upgrade & Clean Core) + S3 (DRC fiscal)**. É o par que ninguém entrega junto e que o cliente de S/4HANA Cloud no Brasil mais precisa.
