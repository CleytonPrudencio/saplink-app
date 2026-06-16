# SAPLINK — Roadmap para Produção (SaaS B2B)

Auditoria de back, front e infra para transformar o protótipo num produto vendável.
Severidades: **BLOQUEADOR** (sem isso não vende / perde dados) · **IMPORTANTE** · **POLISH**.

> Estado atual (honesto): casca completa e bonita (auth, multi-tenant, dashboard, IA),
> mas **miolo de demo** — dados simulados (`Math.random`), sem cobrança, sem conector SAP
> real, e o banco é apagado a cada restart. Multi-tenant está bem isolado (mérito real).

---

## 0. Bloqueadores absolutos (resolver antes de QUALQUER cliente)

1. **O banco é apagado a cada restart** — `backend/Dockerfile:15` roda `npm run seed` no
   start, e `backend/src/seed.ts:10-16` faz `deleteMany()` em todas as tabelas. Cada deploy/
   crash/scale apaga TODOS os dados dos clientes pagantes. → Tirar seed do CMD; seed manual e
   idempotente (upsert + guard por contagem).
2. **Não conecta em SAP real** — `services/simulator.ts` gera tudo com `Math.random()`. RFC/
   IDoc/SOAP são `setTimeout`+`success=true` (`integrations.ts:240-257`). É o **core do
   produto** e não existe. (ver §4)
3. **Sem cobrança nem corte de acesso** — `Consultancy.plan` existe mas só é exibido; não
   limita nada. (ver §1 — o que você perguntou)
4. **Auth furada** — `JWT_SECRET` com fallback hardcoded `'saplink-jwt-secret'`
   (`middleware/auth.ts:30`, `routes/auth.ts:45,103`) **e** commitado no `.env.example:7` e no
   `docker-compose.yml:33`. Qualquer um forja token de qualquer tenant. Sem rate-limit no
   login, sem verificação de email, sem reset de senha.
5. **Sem RBAC** — `User.role` nunca é checado. Usuário comum apaga cliente inteiro
   (`clients.ts:116`). Auto-registro sempre vira admin (`auth.ts:40`). Não há super-admin de
   plataforma (você) sem mexer no banco.
6. **`POST /api/simulate` é público** (`server.ts:31`) — escreve nas integrações de TODOS os
   tenants sem auth. Vetor de corrupção/DoS.
7. **Credenciais SAP em texto plano** — `config Json` (`schema.prisma:51`) guarda senha de
   RFC/DB/SFTP sem criptografia, e é devolvida em GETs. Vazou o banco, vazou tudo.
8. **CORS aberto** — `app.use(cors())` sem origin (`server.ts:15`).
9. **Frontend em modo dev** — `frontend/Dockerfile:10` usa `next dev` (não-produção) e
   `NEXT_PUBLIC_API_URL` hardcoded em `localhost` (`docker-compose.yml:53`).
10. **Não dá pra cadastrar cliente pela UI** — `lib/api.ts` só tem GET de clientes; sem
    create/edit/delete. Produto inutilizável out-of-the-box.

---

## 1. Controle de acesso e cobrança (o que você pediu)

Hoje: **zero**. Desenho mínimo para vender e cortar inadimplente:

### Modelo de dados (Prisma)
- `Plan` — `id, name, priceCents, interval (MONTH/YEAR), maxClients, maxIntegrations,
  maxAiDiagnosticsPerMonth, maxUsers`.
- `Subscription` — `consultancyId, planId, status, currentPeriodEnd, trialEndsAt,
  gatewayCustomerId, gatewaySubscriptionId, cancelAtPeriodEnd`.
  - `status`: `TRIALING | ACTIVE | PAST_DUE | SUSPENDED | CANCELED`.
- `Invoice` — `consultancyId, amountCents, status (PAID/OPEN/FAILED), gatewayInvoiceId,
  paidAt`.
- `UsageCounter` — `consultancyId, period (YYYY-MM), aiDiagnostics, ...` (reset mensal).
- `WebhookEvent` — `gatewayEventId UNIQUE, processedAt` (idempotência — lição do DeliveryPoint).

### Gateway de pagamento
- **Cartão internacional/USD →** Stripe (assinaturas recorrentes prontas).
- **Brasil (boleto + PIX + cartão recorrente) →** **Asaas**, **Iugu** ou **Pagar.me**.
  Recomendo **Asaas/Iugu** se o público é consultoria BR (boleto/PIX recorrente nativo).

### Ciclo de vida e CORTE por inadimplência
1. Cadastro → `TRIALING` por 14 dias (sem cartão).
2. Fim do trial / assina → checkout no gateway → `ACTIVE`, salva `currentPeriodEnd`.
3. Cobrança falha → **webhook** `invoice.payment_failed` → `PAST_DUE` + inicia *dunning*
   (e-mails dia 1/3/7) — acesso **ainda liberado** durante o *grace period* (ex.: 7 dias).
4. Grace period expira sem pagar → `SUSPENDED` → **acesso cortado**: middleware bloqueia tudo
   (403 "assinatura suspensa") **exceto** as telas de billing/pagamento.
5. Pagou → webhook `invoice.paid` → volta a `ACTIVE`, libera acesso.
6. Cancelou → `cancelAtPeriodEnd=true`; ao fim do período → `CANCELED`.

### Enforcement (no código)
- **Middleware `requireActiveSubscription`** após o auth: lê a `Subscription` do tenant; se
  `SUSPENDED/CANCELED` (ou `PAST_DUE` além do grace) → 403, liberando só `/api/billing/*`.
- **Limites por plano** nos `POST` de clients/integrations/diagnostics: checa `UsageCounter`
  e `Plan.max*`; estourou → 402 "limite do plano atingido, faça upgrade".
- **Webhooks idempotentes**: validar assinatura do gateway + `WebhookEvent.gatewayEventId`
  único antes de processar (nunca processar o mesmo evento 2x).
- **Painel super-admin** (PLATFORM_ADMIN): listar tenants, ver status/uso, **suspender/
  reativar manualmente**, dar cortesia/estender trial — sem tocar no banco.

---

## 2. Segurança e multi-tenant
- **RBAC** — papéis `PLATFORM_ADMIN` (você), `CONSULTANCY_ADMIN`, `CONSULTANCY_USER`;
  middleware `requireRole` nas rotas mutáveis; fluxo de **convite** de usuários (hoje só dá
  pra ter 1 admin por auto-registro).
- **JWT** — fail-fast se `JWT_SECRET` ausente (sem fallback); refresh token + revogação/logout;
  `express-rate-limit` no login; verificação de e-mail; reset de senha; 2FA opcional.
- **Credenciais SAP** — criptografar `config` em repouso (KMS/cofre); nunca retornar senha em
  GET; mascarar.
- **Validação** — `zod` em todos os bodies/params; enums para status/severity/role/plan;
  impedir override de `healthScore`/métricas (`clients.ts:97`, `integrations.ts:287`).
- **Hardening** — `helmet`, body size limit, error-handler global, scrub de logs, FK de
  `DeadCode` (`schema.prisma:85`).
- **LGPD** — termos/privacidade versionados com aceite, export e exclusão de dados do titular,
  DPA com clientes, trilha de auditoria.

## 3. Frontend / UX / layout
- **BLOQUEADOR:** CRUD de clientes na UI; gestão de usuários do tenant (`settings:80` é
  placeholder); telas de billing/upgrade; **white-label real** (usar `consultancy.logoUrl` +
  cor primária no Sidebar/auth/relatórios — hoje 0 uso, marca SAPLINK hardcoded); **exportar
  relatório** em PDF/print (hoje `reports` não exporta nada); **diagnóstico IA assíncrono**
  (polling/streaming com progresso — hoje POST síncrono que trava ~2min); parar de **engolir
  erros** (resolver-alerta falha em silêncio: `alerts:43`, `clients/[id]:92`).
- **IMPORTANTE:** proteção de rota via `middleware.ts` (hoje só client-side, há flash de
  conteúdo); token fora do `localStorage` (cookie httpOnly) ou mitigar XSS; perfil editável +
  trocar senha; a11y mínima (`htmlFor`/`id`, `aria-label`, cards focáveis); mensagens de erro
  específicas; design system (badges/cores duplicados em 4+ arquivos).
- **POLISH:** skeletons no lugar de "Carregando…"; trocar `confirm()/alert()` por modal/toast;
  dark/light (relatório impresso); menos emoji-como-ícone; corrigir classes Tailwind dinâmicas
  (`clients/[id]:282`).

## 4. Conector SAP real (o core do produto)
- **RFC/IDoc** exigem rede interna do cliente → **agente on-premise** (container Docker no
  ambiente do cliente) que fala RFC/`node-rfc` localmente e reporta via **HTTPS outbound** pro
  SAPLINK. É o padrão do mercado (não dá pra conectar RFC direto da nuvem).
- **OData / S/4HANA Cloud** — dá pra cloud-side: HTTP real + `X-CSRF-Token` + OAuth2/SAML
  (hoje só Basic, `integrations.ts:227`).
- **CPI / Integration Suite** — API de Message Processing Logs (OData `/MessageProcessingLogs`)
  via OAuth2 client credentials.
- **AIF** — status de mensagens de erro via OData/RFC.
- Substituir o `simulator.ts` (Math.random) por ingestão real desses conectores.

## 5. Infra / produção
- Tirar seed do `Dockerfile`; **Postgres gerenciado** (Render/Neon/Supabase/RDS) com backup +
  PITR (sair do container self-hosted); frontend `next build`+`next start`; injetar
  `NEXT_PUBLIC_API_URL` real em build-time; segredos no secret manager (rotacionar os expostos).
- `/health` com check de DB; logger estruturado (pino) + **Sentry** + métricas; error-handler
  global.
- **Scheduler do simulador** num worker único (1 réplica) com lock — hoje o `setInterval`
  (`server.ts:54`) roda em toda réplica → alertas duplicados ao escalar.
- **CI/CD** (`.github/workflows`): lint → typecheck → build → migrate-check; **testes** mínimos
  (auth, tenancy, billing); migration como step de release separado.
- Dockerfiles multi-stage, `NODE_ENV=production`, `npm ci --omit=dev`, non-root.

## 6. IA em produção
- Ollama em CPU (~2min/diagnóstico) **não serve** pra UX de produto. Opções:
  - **Claude API** (rápido, pago, gerenciado) — caminho primário recomendado; `ANTHROPIC_API_KEY`
    já está cabeado.
  - **Ollama em GPU dedicada** + fila (se quiser custo zero de API / dado on-prem).
  - **Híbrido**: streaming token-a-token + cache de diagnósticos + job assíncrono (melhora a
    percepção mesmo no modelo lento).

## 7. Novidades / diferenciais (valor percebido)
- Diagnóstico IA em **streaming** ("a IA está escrevendo…") com botão "gerar ticket/alerta".
- **Relatório white-label** exportável (PDF com logo+cores) agendado por e-mail mensal ao
  cliente final — é literalmente o que se vende.
- **Health score histórico** (tendência/sparkline) em vez do número estático.
- **Central de alertas** multicanal (e-mail/Slack/Teams/WhatsApp) com regras.
- **Visão de portfólio** (ranking de clientes por score/alertas) pra consultoria priorizar.
- **Onboarding guiado** (conectar 1ª integração em 3 passos com teste ao vivo).
- **Calculadora de ROI** exposta ao cliente (lógica já existe em `reports`).
- **API pública + webhooks** pro cliente integrar; **command palette** (Ctrl-K).

---

## Sequência sugerida (fases)

- **Fase 0 — Não perder dados / segurança mínima:** seed fora do CMD, JWT fail-fast, CORS
  restrito, proteger `/api/simulate`, `next build`. (dias)
- **Fase 1 — MVP vendável:** billing + corte por inadimplência, RBAC + convites, CRUD cliente
  na UI, white-label real, export de relatório PDF, IA assíncrona. (semanas)
- **Fase 2 — Core real:** conector SAP (agente on-prem + OData/CPI), substituir simulador.
- **Fase 3 — Escala/operação:** Postgres gerenciado, observabilidade, CI/CD, testes, worker
  isolado, IA gerenciada/GPU.
