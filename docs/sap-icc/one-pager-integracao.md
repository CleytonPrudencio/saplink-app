# SAPLINK — One-pager técnico de integração (para SAP ICC / PartnerEdge)

**Produto:** SAPLINK — plataforma de monitoramento, prevenção, remediação e prova de valor (R$)
das integrações SAP de consultorias (multi-cliente, white-label).
**Modelo:** SaaS (web). **Tipo de parceiro:** ISV.
**Cenário de certificação alvo:** *SAP Certified – Integration with SAP S/4HANA Cloud*.

> Documento pronto para anexar à submissão. Onde houver "[preencher]", completar com dados da empresa.

---

## 1. Como o SAPLINK se integra ao SAP (visão geral)

O SAPLINK **não instala nada dentro do SAP** e **não usa APIs não-liberadas**. Há dois caminhos,
ambos com o **dado fluindo de saída** do ambiente do cliente para o SAPLINK:

1. **Cloud (S/4HANA Cloud / BTP)** — conexão direta via **Communication Arrangement** (OAuth 2.0 /
   Basic / certificado) consumindo **APIs OData liberadas** (whitelisted) e Event Mesh. Sem agente.
2. **On-premise (ECC / S/4 on-prem / PI-PO)** — **Agente Docker** rodando na rede do cliente, com
   **somente tráfego de saída HTTPS** (não abre portas de entrada). Lê via RFC liberada / IDoc status
   e empurra snapshots para o SAPLINK.

```
[ SAP do cliente ] --(OData/Event Mesh liberados | RFC liberada via agente)--> [ SAPLINK SaaS ]
   S/4HANA Cloud                                                                 (multi-tenant)
   ECC / S/4 on-prem  --- Agente Docker (saída-only) --------------------------->
   Integration Suite (CPI) --- OData MessageProcessingLogs ---------------------->
```

---

## 2. Interfaces / protocolos usados

| Camada SAP | Protocolo | Acesso | Direção |
|---|---|---|---|
| S/4HANA Cloud | OData v2/v4 (APIs liberadas) | Communication Arrangement (OAuth/Basic) | leitura |
| S/4HANA Cloud | Event Mesh (eventos de negócio) | subscription | leitura |
| Integration Suite (CPI) | OData `MessageProcessingLogs` | OAuth client-credentials | leitura |
| ECC / S/4 on-prem | RFC liberada / IDoc status (WE02/BD87) | Agente Docker (saída-only) | leitura + remediação aprovada |
| LoB Cloud (Ariba, SuccessFactors, Concur, Fieldglass, CX, Commerce) | REST/OData públicos | API Key / OAuth do tenant do cliente | leitura |

---

## 3. Segurança (pontos de avaliação)

- **Sem porta de entrada no cliente:** OData/REST é puxado direto; on-prem usa agente com **tráfego só de saída**.
- **Sem S-user, sem add-on:** conexão por Communication Arrangement / API Key; nada instalado no SAP.
- **Credenciais cifradas em repouso** (AES) e nunca expostas em logs/URLs.
- **Isolamento multi-tenant** por consultoria (RBAC: PLATFORM_ADMIN / CONSULTANCY_ADMIN / USER).
- **Nenhuma ação muda o SAP sem aprovação humana** (remediação com fluxo aprovar→executar→log).
- **Trava de produção:** em ambientes **PRD**, remediação e auto-heal exigem **aprovação explícita**
  (nada é executado automaticamente em produção).
- **Separação por ambiente (DEV/HML/PRD):** dados, conexões e métricas isolados por ambiente.
- **Autenticação:** JWT com expiração deslizante; reset de senha com rate-limit.

---

## 4. O que o SAPLINK lê/faz (escopo funcional)

- **Lê (read-only):** status de IDoc/filas (qRFC/tRFC), Message Processing Logs (CPI), uso de APIs
  OData liberadas, Communication Arrangements (validade de certificado), eventos (Event Mesh),
  documentos fiscais (DRC/Billing), jobs/dumps/locks (Basis, via agente).
- **Escreve (somente com aprovação humana e log):** reprocesso de IDoc (BD87/RBDMANI2), destrava de
  fila (SMQ2), reexecução tRFC (SM58) — sempre via agente, no ambiente do cliente, com rastro.

---

## 5. Deploy / arquitetura do produto

- Frontend Next.js + Backend Node/Express + PostgreSQL; HTTPS (Caddy).
- Hospedagem atual: VM dedicada (Hetzner). *Opção futura:* empacotar na **SAP BTP (Kyma/CF)** para a
  designação "Built on SAP BTP".
- Agente: container Docker leve, distribuído ao cliente; autentica por token próprio (saída-only).

---

## 6. Evidência de integração real já existente

O conector S/4HANA Cloud do SAPLINK **já sincroniza dados reais** do ambiente de demonstração da SAP
(SAP Business Accelerator Hub, via APIKey) — APIs OData liberadas, contagem real de registros e
documentos de billing. Isso serve de base para rodar o **test kit do ICC** do cenário S/4HANA Cloud.

---

## 7. Dados da empresa (preencher para a submissão)

- Razão social / CNPJ: **[preencher]**
- D-U-N-S Number: **[preencher — solicitar grátis na Dun & Bradstreet]**
- Contato técnico / e-mail corporativo: **[preencher]**
- Site: https://saplink.com.br
