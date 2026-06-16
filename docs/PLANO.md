# SAPLINK — Plano de Execução por Fases

Checklist vivo. Marcar `[x]` ao concluir. Detalhe técnico de cada item em
[ROADMAP-PRODUCAO.md](./ROADMAP-PRODUCAO.md).

---

## Fase 0 — Não perder dados / segurança mínima  (CRÍTICO, rápido)
Objetivo: parar de apagar o banco, fechar buracos óbvios. Pré-requisito pra tudo.

- [x] 0.1 Seed idempotente — não apagar dados; rodar só em banco vazio (`seed.ts`, `Dockerfile`)
- [x] 0.2 `JWT_SECRET` fail-fast (sem fallback hardcoded) + tirar segredo do `.env.example` (`config.ts`)
- [x] 0.3 CORS restrito à origem do frontend (`server.ts` + `config.ts`)
- [x] 0.4 Remover `POST /api/simulate` público (`server.ts`)
- [x] 0.5 Frontend build de produção (`Dockerfile.prod` standalone + `next.config.ts`)
- [x] 0.6 Error-handler global + body size limit no Express (`server.ts`)
- [x] 0.7 Validar stack no Docker (login OK, /simulate=404, CORS, dados persistem após restart)

## Fase 1 — MVP vendável  (semanas)
Objetivo: dá pra cadastrar empresa, cobrar, cortar quem não paga, operar o tenant.

### 1A. RBAC + gestão de usuários
- [x] 1.1 Papéis `PLATFORM_ADMIN | CONSULTANCY_ADMIN | CONSULTANCY_USER` + middleware `requireRole` (`middleware/roles.ts`)
- [x] 1.2 Gating das rotas mutáveis de cliente (criar/editar/deletar só admin) — testado 403
- [x] 1.3 Gestão de usuários do tenant (`routes/users.ts` + UI em Settings): criar/listar/remover, senha temporária, limite de plano, RBAC
- [x] 1.4 Painel super-admin backend (`routes/platform.ts`: listar/suspender/reativar) — testado; UI PENDENTE

### 1B. Billing + corte de acesso  — CONCLUÍDO e testado e2e
- [x] 1.5 Modelos `Plan`, `Subscription`, `Invoice`, `UsageCounter`, `WebhookEvent` (migration aplicada)
- [x] 1.6 Checkout (provider `manual` plugável; Stripe/Asaas/Iugu entram depois)
- [x] 1.7 Webhooks idempotentes (secret + `WebhookEvent.providerEventId` único) — testado
- [x] 1.8 Estados TRIALING→ACTIVE→PAST_DUE(+grace)→SUSPENDED→CANCELED (`services/billing.ts`)
- [x] 1.9 Middleware `requireActiveSubscription` (corte do inadimplente) — testado 403
- [x] 1.10 Limites por plano nos POST (clients + diagnósticos IA) (`assertWithinLimit`)
- [x] 1.11 UI de billing (status, planos, checkout, aviso de suspensão) — `app/(dashboard)/billing`

### 1C. Núcleo operacional + UX
- [x] 1.12 CRUD de clientes na UI — criar/excluir + empty-state com CTA (`clients/page.tsx`); editar PENDENTE
- [x] 1.13 White-label real — rota `/api/consultancy/branding` + logo/cor/nome no Sidebar + form em Settings
- [ ] 1.14 Export de relatório em PDF (white-label) — PENDENTE
- [x] 1.15 Diagnóstico de IA assíncrono — job PENDING→DONE/FAILED, POST 202 + polling `GET /diagnostics/:id` (não trava a tela)
- [~] 1.16 Validação com `zod` (billing/webhook/branding prontos; demais rotas PENDENTE)
- [x] 1.17 Auth: rate-limit no login + reset de senha (forgot/reset endpoints); verificação de e-mail PENDENTE
- [~] 1.18 Feedback de erro visível — 403 de assinatura redireciona p/ billing; toasts globais PENDENTE

## Fase 2 — Core real: conector SAP  (substitui o simulado)
- [ ] 2.1 Agente on-premise (Docker no cliente) p/ RFC/IDoc via HTTPS outbound
- [ ] 2.2 Conector OData/S4HANA Cloud (CSRF + OAuth2)
- [ ] 2.3 Conector CPI/Integration Suite (Message Processing Logs)
- [ ] 2.4 Conector AIF (status de mensagens)
- [ ] 2.5 Ingestão real substituindo `simulator.ts`
- [ ] 2.6 Cofre/criptografia das credenciais SAP em repouso

## Fase 3 — Escala / operação
- [ ] 3.1 Postgres gerenciado com backup + PITR
- [ ] 3.2 Scheduler do simulador/ingestão em worker único (lock)
- [ ] 3.3 `/health` com check de DB; logger estruturado (pino) + Sentry + métricas
- [ ] 3.4 CI/CD (lint, typecheck, build, migrate-check) + testes (auth, tenancy, billing)
- [ ] 3.5 IA gerenciada (Claude) ou Ollama GPU com fila
- [ ] 3.6 Dockerfiles multi-stage, non-root, NODE_ENV=production
- [ ] 3.7 LGPD: aceite de termos, export/exclusão de dados, DPA, auditoria

## Fase 4 — Diferenciais (valor percebido)
- [ ] 4.1 Relatório white-label agendado por e-mail mensal
- [ ] 4.2 Histórico de health score (tendência)
- [ ] 4.3 Central de alertas multicanal (e-mail/Slack/Teams/WhatsApp) + regras
- [ ] 4.4 Visão de portfólio (ranking de clientes)
- [ ] 4.5 Onboarding guiado + calculadora de ROI exposta
- [ ] 4.6 API pública + webhooks pro cliente; command palette
