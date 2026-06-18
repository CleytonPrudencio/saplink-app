# SAPLINK — Roadmap "Unicórnio"

Tese: deixar de ser **monitor** e virar a **plataforma autônoma de operação de integrações SAP**
para consultorias — que **prevê, corrige e prova valor em R$**, com moat de dados cross-cliente.

Ordem por valor × esforço × dependência. Marcar `[x]` ao concluir.

## Fase A — Quick wins de IA & proatividade (reaproveita IA/Resend)
- [x] A1. **Pergunte ao SAPLINK** — chat em linguagem natural sobre toda a carteira (`/ask` + POST /api/ask).
- [x] A2. **Digest semanal por IA** — relatório de saúde white-label, agendado por e-mail (Resend). Scheduler 6h + janela 7d; preview/send-now/toggle em Configurações. Falta RESEND_API_KEY na VM para envio real.
- [x] A3. **SAP Notes sugeridas** — diagnóstico mapeia o sintoma → área/componente SAP, transações e busca oficial da Note/KBA (determinístico, sem fabricar número).
- [ ] A4. **Radar de validade** — certificados SSL/SNC, senha de usuário RFC, token OAuth expirando.

## Fase B — Operação SAP (cockpit + remediação) — o salto "monitor → resolve"
- [ ] B1. **Cockpit de IDoc/filas multi-cliente** — BD87 + SMQ1/2 + SM58 num painel, reprocesso em massa.
- [ ] B2. **Remediação autônoma** — o agente AGE (reprocessa IDoc, destrava fila, reativa RFC) com aprovação + log.
- [ ] B3. **Catálogo vivo de interfaces** — auto-descoberta e documentação do landscape.

## Fase C — Alerta & integração de operação
- [ ] C1. **On-call multicanal + escalonamento** — WhatsApp/Teams/Slack, plantão, política de escalonamento.
- [ ] C2. **Ticket sync** — alerta vira chamado (Jira/ServiceNow) e sincroniza status.
- [ ] C3. **Portal do cliente final** — white-label, read-only: o cliente da consultoria vê a própria saúde/SLA.

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
