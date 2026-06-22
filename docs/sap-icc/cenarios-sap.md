# SAPLINK — Cenários e APIs SAP consumidos (para o SAP ICC)

Lista dos cenários de integração e APIs **liberadas (released)** que o SAPLINK consome, extraída do
produto (conectores + catálogo vivo). Todas são interfaces públicas/whitelisted — nenhuma API
não-liberada é usada. Colunas em PT/EN para facilitar a submissão.

---

## A. SAP S/4HANA Cloud — Communication Scenarios + OData APIs (cenário de cert alvo)

| Communication Scenario | API (OData) | Entidade | Versão | Uso | Status |
|---|---|---|---|---|---|
| SAP_COM_0008 | API_BUSINESS_PARTNER | A_BusinessPartner | v2 | leitura de parceiros de negócio | released |
| SAP_COM_0109 | API_SALES_ORDER_SRV | A_SalesOrder | v2 → **v4** | pedidos de venda | v2 em descontinuação → migrar v4 |
| SAP_COM_0009 | API_PRODUCT_SRV | A_Product | v2 | mestre de produto | released |
| SAP_COM_0157 | API_BILLING_DOCUMENT_SRV | A_BillingDocument | v2 | faturas (cockpit fiscal/DRC) | released |

- Autenticação: **Communication Arrangement** (OAuth 2.0 / Basic).
- Operação: **leitura** (GET, `$inlinecount`, `$select`, `$top`).
- Evidência: o SAPLINK já puxa contagem real e documentos de billing do sandbox S/4 (api.sap.com).

> O SAPLINK também **detecta uso de OData v2 em descontinuação** e recomenda a migração para v4
> (Radar de Upgrade / Clean Core) — alinhado às boas práticas que a própria SAP cobra.

---

## B. SAP Integration Suite (Cloud Integration / CPI)

| Recurso | API | Auth | Uso |
|---|---|---|---|
| Message Processing Logs | OData `/MessageProcessingLogs` (+ `ErrorInformation`) | OAuth client-credentials (service key) | leitura de status/erros de iFlow |

## C. SAP S/4HANA Cloud — Event Mesh

| Recurso | Mecanismo | Uso |
|---|---|---|
| Eventos de negócio (ex.: SalesOrder.Created, BusinessPartner.Changed) | subscription / dead-letter, lag | monitoramento de entrega de eventos |

---

## D. SAP LoB Cloud (BYO — chave/credencial do tenant do cliente)

| Produto | Endpoint(s) | Auth | Uso |
|---|---|---|---|
| SAP SuccessFactors | OData v2: `/User`, `/EmpJob`, `/PerPersonal` | APIKey/OAuth do tenant | inventário/saúde |
| SAP Ariba | `/supplierdatapagination/v4`, `/reporting/v4` | APIKey do tenant | suppliers / reporting |
| SAP Concur | `/api/v3.0/common/users`, `/expense/reports` | OAuth do tenant | despesas/relatórios |
| SAP Fieldglass | `/api/v1/connectors/workerData` | APIKey do tenant | força de trabalho externa |
| SAP CX (Sales/Service Cloud / C4C) | OData: `/ServiceRequestCollection`, `/AccountCollection` | Basic/OAuth do tenant | tickets/contas |
| SAP Commerce Cloud | OCC `/occ/v2/.../orders` | OAuth do tenant | pedidos |
| SAP API Management | `/apiportal/api/1.0/Management.svc/APIProxies` | APIKey | inventário de API proxies |
| SAP Integration Suite — Trading Partner Mgmt (B2B/EDI) | `/itspaces/api/1.0/tpm/tradingpartners`, `/agreements` | APIKey | parceiros/acordos EDI |

---

## E. On-premise (ECC / S/4 on-prem / PI-PO) — via Agente Docker (saída-only)

| Objeto SAP | Interface | Uso | Escrita? |
|---|---|---|---|
| IDoc (status WE02/WE05) | RFC liberada / leitura de status | monitorar IDocs em erro (51, etc.) | reprocesso BD87/RBDMANI2 **com aprovação** |
| Filas qRFC/tRFC (SMQ2/SM58) | RFC liberada | filas travadas/SYSFAIL | destrava/reexecução **com aprovação** |
| Jobs (SM37), dumps (ST22), update errors (SM13), locks (SM12), Gateway log | leitura | Basis & Operações | não |
| Transports (STMS) | leitura | correlação com incidentes | não |

- O agente usa **somente tráfego de saída HTTPS**; nenhuma porta é aberta no cliente.
- Toda escrita no SAP é **aprovada por humano** e registrada (trava extra em PRD).

---

## Notas para o ICC

- Cenário de certificação recomendado: **Integration with SAP S/4HANA Cloud** (seção A) — é onde
  temos integração real e test kit aplicável.
- Nenhuma interface não-liberada é consumida.
- Pacote técnico complementar: ver `docs/sap-icc/one-pager-integracao.md`.
