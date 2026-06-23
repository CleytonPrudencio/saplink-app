# Fluxo de deploy SAPLINK (dev → prod)

Dois ambientes na mesma VM, cada um na sua branch:

| Ambiente | Branch | URL | Stack |
|---|---|---|---|
| **DEV** (teste) | `dev` | https://dev.saplink.com.br | `/opt/saplink-dev` · `docker-compose.dev.yml` (projeto `saplink-dev`) · banco/dados próprios, e-mail log, Stripe teste, Ollama compartilhado |
| **PROD** | `main` | https://saplink.com.br | `/opt/saplink` · `docker-compose.yml` |

## Regra de ouro
- Todo trabalho vai **primeiro pra `dev`**. Nunca commitar direto em `main`.
- `main` só recebe via **Pull Request** `dev → main`, com **OK do dono** antes do merge.
- Deploy em prod **só com OK**.

## 1. Mandar pra DEV (livre)
```bash
# local
git checkout dev
git pull --ff-only            # sincroniza com origin/dev
# ... trabalha, commita ...
git add <arquivos>
git commit -m "feat(scope): ..."
git push origin dev

# na VM — rebuild + deploy do DEV
ssh -i /c/Users/ritad/.ssh/saplink_hetzner root@77.42.120.142
bash /opt/saplink-dev/deploy-dev.sh
```
Testar em https://dev.saplink.com.br (faixa "DEV" aparece fixa no rodapé).

## 2. Subir pra PROD (em pacote, com OK)
```bash
# abre o PR juntando tudo que está em dev e ainda não foi pra prod
gh pr create --base main --head dev --title "release: <resumo>" --body "..."
```
Depois do **OK** do dono e do merge na `main`:
```bash
# na VM — deploy de PROD
ssh -i /c/Users/ritad/.ssh/saplink_hetzner root@77.42.120.142
cd /opt/saplink && git pull --ff-only && \
  docker compose up -d --build backend frontend
```
Readiness: `curl -s -o /dev/null -w "%{http_code}" https://saplink.com.br/api/plans` (não há `/health`).

## Notas
- Migrations Prisma rodam no boot do container (`prisma migrate deploy`).
- Re-seed do DEV (1x, zera demo): `docker exec saplink-dev-backend npm run seed`.
- Caddy: 1 container serve os dois domínios (`/opt/saplink/deploy/Caddyfile`). Após editar o Caddyfile, recriar o container do Caddy (bind-mount de arquivo único não reflete `git pull` sozinho).
- A faixa "DEV" só renderiza quando o hostname é `dev.saplink.com.br` (gated; no-op em prod).
