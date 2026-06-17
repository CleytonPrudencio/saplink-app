# SAPLINK — Agente on-premise

Monitora sistemas SAP que **não têm endpoint HTTP público** (RFC, IDoc, BAPI). Roda
dentro da rede do cliente, lê a saúde do SAP **localmente** e empurra os dados para o
SAPLINK via **HTTPS de saída** — o cliente **não abre nenhuma porta de entrada**.

```
[ Rede do cliente ]                         [ SAPLINK (nuvem) ]
  SAP ABAP ──RFC/IDoc──► Agente ──HTTPS out──► POST /api/agent/report
```

## Como usar

1. No SAPLINK, abra a integração (tipo RFC/IDoc) e clique em **Gerar token do agente**.
2. Copie o token (mostrado **uma vez**).
3. Rode o agente no servidor do cliente:

```bash
docker run -d --name saplink-agent --restart unless-stopped \
  -e SAPLINK_URL=https://api.saplink.app \
  -e AGENT_TOKEN=<token-gerado> \
  -e SAP_MODE=mock \
  saplink/agent:latest
```

Ou via Docker Compose (`docker compose up -d`):

```yaml
services:
  saplink-agent:
    build: .            # ou image: saplink/agent:latest
    restart: unless-stopped
    env_file: .env
```

## Modos

| Modo | Para quê | Requisitos |
|---|---|---|
| `mock` | Testar o pipeline ponta a ponta sem SAP | Nenhum |
| `rfc` | Conexão RFC real | SAP NW RFC SDK + `npm i node-rfc` na imagem |

No modo `mock`, use `MOCK_FORCE=error` (ou `offline`/`healthy`) para forçar um estado e
ver o SAPLINK detectar erro + abrir alerta.

## Variáveis

Veja [`.env.example`](.env.example). Obrigatórias: `SAPLINK_URL`, `AGENT_TOKEN`.

## Modo rfc (RFC real)

O `node-rfc` depende do **SAP NW RFC SDK** (proprietário; baixe com um S-user na SAP).
Inclua o SDK na imagem e rode `npm i node-rfc` antes do build. Ajuste, em
`src/sap.js`, o Function Module de contagem de IDocs em erro conforme o ambiente do
cliente (muitos expõem um FM/CDS próprio). Recomendado um usuário SAP **somente leitura**
dedicado ao monitoramento.
