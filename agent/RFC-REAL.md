# Teste RFC REAL — passo a passo (SAP gratuito/barato)

RFC não tem "simulado real": precisa de um SAP ABAP que fale RFC. Abaixo, o caminho mais
barato para subir um e testar o agente de verdade.

## Visão geral de custo

| Opção | Custo | RFC real? | Observação |
|---|---|---|---|
| ABAP Platform Trial (Docker) **local** | Grátis | ✅ | Precisa **16GB+ RAM** (sua máquina tem ~10GB no Docker → não roda bem) |
| ABAP Platform Trial em **Hetzner CX52** | **~€0,05/h (~€1/dia)** | ✅ | 16 vCPU, 32GB RAM, 320GB disco. Suspende/deleta quando não usar |
| SAP hospedado (provedores de treino) | ~US$30–100/mês | ✅ | Sem infra, mas mais caro |

**Recomendado:** ABAP Platform Trial num Hetzner **CX52** por hora. Some o SAP NW RFC SDK
(download grátis, mas exige **S-user**) e o agente fala RFC de verdade.

> ⚠️ O único portão real é o **S-user** para baixar o SAP NW RFC SDK. Se você não tem,
> dá para testar execução de Function Module **via SOAP/HTTP** no Trial (sem SDK) — peça que
> eu ligo essa variante no agente.

## 1. Subir o SAP (Hetzner + ABAP Trial)

1. Crie um servidor **CX52** (Ubuntu 22.04) no [Hetzner Cloud](https://www.hetzner.com/cloud).
2. No servidor, instale o Docker e suba o Trial (aceite a licença):

```bash
# requisitos do host
sudo sysctl -w vm.max_map_count=2000000
docker pull sapse/abap-platform-trial:latest
docker run --stop-timeout 3600 -i --name a4h -h vhcala4hci \
  -p 3200:3200 -p 3300:3300 -p 8443:8443 -p 50000:50000 -p 50001:50001 \
  sapse/abap-platform-trial:latest -agree-to-sap-license
```

Espere o boot (vários minutos). Anote o IP público do servidor.
Dados padrão do Trial: **sysnr 00**, **client 001**, usuário **DEVELOPER** (a senha é definida
no primeiro start — veja os logs/README do container).

3. Crie um usuário de monitoramento **somente leitura** no SAP (transação SU01), com
   autorização ao objeto `S_RFC` (ex.: para `RFC_PING` e os FMs de IDoc/dump).

## 2. Baixar o SAP NW RFC SDK

No [SAP for Me → Software Downloads](https://me.sap.com/softwarecenter), baixe
**SAP NW RFC SDK 7.50** (Linux on x86_64). Coloque o `.zip` em `agent/sdk/`.

## 3. Buildar e rodar o agente em modo RFC

```bash
cd agent
docker build -f Dockerfile.rfc -t saplink/agent-rfc .

docker run -d --name saplink-agent-rfc --restart unless-stopped \
  -e SAPLINK_URL=https://SEU_BACKEND \
  -e AGENT_TOKEN=<token gerado na integração RFC do SAPLINK> \
  -e SAP_MODE=rfc \
  -e SAP_ASHOST=<IP do SAP> -e SAP_SYSNR=00 -e SAP_CLIENT=001 \
  -e SAP_USER=SAPLINK_MON -e SAP_PASSWD=<senha> -e SAP_LANG=EN \
  saplink/agent-rfc
```

O agente faz `RFC_PING` real, lê IDocs em erro/dumps quando os FMs existem, e empurra a
saúde pro SAPLINK. No painel, a integração RFC fica **ACTIVE** com a latência real do ping.

## 4. Encerrar (controlar custo)

Pare/exclua o servidor Hetzner quando terminar — você paga só pelas horas usadas.
