#!/usr/bin/env bash
# Atualiza e re-deploya o ambiente DEV (dev.saplink.com.br) na VM.
# Uso:  bash /opt/saplink-dev/deploy-dev.sh
# Stack DEV isolada do prod: banco/dados próprios, e-mail em modo log, Stripe de teste, Ollama compartilhado.
set -euo pipefail
cd /opt/saplink-dev

echo "==> Atualizando código a partir de origin/staging..."
# Fetch EXPLÍCITO da staging (o clone da VM é single-branch; fetch normal só traz main).
git fetch origin "+refs/heads/staging:refs/remotes/origin/staging" --quiet
# O ambiente DEV (dev.saplink.com.br) roda a branch de integração 'staging'.
git checkout staging 2>/dev/null || git checkout -b staging origin/staging
git reset --hard origin/staging

echo "==> Rebuild + up da stack DEV..."
docker compose -p saplink-dev -f docker-compose.dev.yml --env-file .env up -d --build backend frontend

echo "==> Containers DEV:"
docker compose -p saplink-dev -f docker-compose.dev.yml ps

echo ""
echo "OK -> https://dev.saplink.com.br"
echo "Dica: re-seed (1x, zera dados demo):  docker exec saplink-dev-backend npm run seed"
