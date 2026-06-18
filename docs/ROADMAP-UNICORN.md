# SAPLINK — Roadmap "Unicórnio"

Tese: deixar de ser **monitor** e virar a **plataforma autônoma de operação de integrações SAP**
para consultorias — que **prevê, corrige e prova valor em R$**, com moat de dados cross-cliente.

Ordem por valor × esforço × dependência. Marcar `[x]` ao concluir.

## Fase A — Quick wins de IA & proatividade (reaproveita IA/Resend)
- [x] A1. **Pergunte ao SAPLINK** — chat em linguagem natural sobre toda a carteira (`/ask` + POST /api/ask).
- [x] A2. **Digest semanal por IA** — relatório de saúde white-label, agendado por e-mail (Resend). Scheduler 6h + janela 7d; preview/send-now/toggle em Configurações. Falta RESEND_API_KEY na VM para envio real.
- [x] A3. **SAP Notes sugeridas** — diagnóstico mapeia o sintoma → área/componente SAP, transações e busca oficial da Note/KBA (determinístico, sem fabricar número).
- [x] A4. **Radar de validade** — cert TLS auto-detectado (handshake), + expiração manual de segredos (senha RFC/OAuth/SNC); alertas automáticos e scheduler 12h. Página /validity.

**Fase A concluída.** Próximo: Fase B.

## Fase B — Operação SAP (cockpit + remediação) — o salto "monitor → resolve"
- [x] B1. **Cockpit de IDoc/filas multi-cliente** — SapItem + ingest do agente, página /cockpit com filtros e contadores (IDoc 51/56/64, qRFC/tRFC).
- [x] B2. **Remediação autônoma** — RemediationAction (PENDING→APPROVED→DONE), agente pull de comandos + execução + log; aprovação no cockpit.
- [x] B3. **Catálogo vivo de interfaces** — InterfaceCatalogItem, auto-descoberta pelo agente (WE20/SM59/msg types/OData), página /catalog buscável.

## Fase C — Alerta & integração de operação
- [x] C1. **On-call multicanal + escalonamento** — NotificationChannel (Slack/Teams/Webhook/Email) c/ níveis; dispatcher; escalonamento por tempo; /notifications.
- [x] C2. **Ticket sync** — TicketConfig (Jira/ServiceNow); alerta abre chamado via REST e fecha ao resolver; token cifrado; teste de conexão.
- [x] C3. **Portal do cliente final** — Client.portalToken; rota pública /api/portal/:token; página /portal/[token] white-label read-only; admin ativa/gera link nos clientes.

## Fase D — SLA & valor de negócio (vender pra C-level)
- [ ] D1. **SLA por cliente** — define SLA, mede compliance, relatório mensal narrado por IA.
- [ ] D2. **Impacto em R$** — integração → processo de negócio → custo/hora parada.
- [ ] D3. **Radar de transports (STMS)** — correlaciona incidente com transporte recente.

## Fase E — Inteligência preditiva & moat de dados
- [ ] E1. **Previsão de falha** — anomalia em latência/erro/fila antes de quebrar.
- [ ] E2. **Benchmark cross-cliente** — saúde vs. percentil de mercado (anônimo agregado).

## Fase F — Stack moderno SAP
- [ ] F1. **CPI / Integration Suite** — Message Processing Logs e status de IFlows.
- [ ] F2. **AIF** — status de mensagens do Application Interface Framework.

> Nota: features que dependem de SAP real (B2, B1, D3, F1/F2) são construídas contra o modelo de
> dados e demonstráveis com dados de exemplo; teste pleno exige um SAP conectado via Agente.
