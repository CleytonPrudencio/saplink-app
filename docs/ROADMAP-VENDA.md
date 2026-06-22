# Roadmap — fechar 100% e vender

> Status em jun/2026. Produto rico em features (13 diferenciais únicos no ar). O que falta é **prontidão de produção** e **munição de venda**.

## ✅ Concluído (junho/2026)
- **Health score automático** — recálculo real a cada 3 min (`services/health.ts` + scheduler).
- **Sessão de 2 dias com sliding refresh** — inatividade > 2d cai no login; atividade renova (JWT + `x-refresh-token`).
- **Rate-limit** no login e no forgot-password.
- **/api/health** — endpoint público para uptime externo.
- **Legal/LGPD** — `/termos`, `/privacidade` (LGPD), `/contrato` (Contrato + SLA 99,5% + fidelidade 3 meses).
- **Onboarding/ebook in-app** — `/guia` (manual completo, com "Baixar como PDF").
- **Pricing** — preços de mercado + promo (1ª mensalidade grátis em Business/Enterprise, Pro 50% OFF) + fidelidade 3 meses (na landing, nos planos e no contrato).
- **Deck de vendas (PDF)** — `tools/report/sales-deck.mjs` → `out/SAPLINK-deck-vendas.pdf`.
- **IA** — `qwen2.5:7b` (mais inteligente; teto saudável da VM CPU-only).

## ⏳ Pendente — depende de você (chaves/contas)
- **Stripe LIVE** — hoje em chaves de teste. Gerar chaves live + `STRIPE_WEBHOOK_SECRET` e colocar no `.env` da VM. *Bloqueia faturar de verdade.*
- **E-mail real (Resend)** — setar `RESEND_API_KEY` + remetente verificado (digest/alertas saem do modo log).
- **Uptime externo** — criar conta no UptimeRobot (grátis) apontando para `https://saplink.com.br/api/health` → alerta por e-mail/SMS se cair.
- **Watchdog + backup automático** — script pronto p/ instalar via cron (auto-restart de container + `pg_dump` diário). *Precisa da sua autorização (persistência na VM).*
- **Rotacionar segredos** que passaram por chat: senha demo (se for ampliar acesso) e API Key do sandbox (regenerar em api.sap.com).
- **IA premium (opcional)** — `ANTHROPIC_API_KEY` → IA nível Claude, rápida, sem pesar o servidor.

## 🧩 Próximos (decisão de produto)
- **Onboarding de cliente** — definir fluxo: venda assistida (você cria o tenant) vs self-serve com aprovação (hoje o cadastro está travado, só captura lead).
- **Piloto** — 1 consultoria real + 1 cliente com ABAP on-prem real (fecha o "100% real").
- **Case com R$** — usar a Time Machine pra documentar economia e vender pros próximos.

## 🚀 Fase 4 (a discutir)
Marketplace de runbooks · Claude na nuvem (IA premium) · apps móveis · mais conectores (Ariba/SuccessFactors) · parceria SAP (Business Accelerator Hub / Store).
