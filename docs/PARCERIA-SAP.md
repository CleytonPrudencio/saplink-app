# Parceria SAP — Playbook GTM (SAPLINK)

Objetivo: tornar o SAPLINK um **parceiro SAP reconhecido** e listar/certificar a solução, ganhando
credibilidade enterprise, co-venda e acesso a leads. Este documento é o passo-a-passo acionável.
Valores e nomes de programa mudam — **confirmar no PartnerEdge antes de pagar**.

> ⚠️ **Regra de marca:** NÃO usar logo SAP, "SAP Certified" ou "SAP Partner" no site/material
> enquanto não houver o contrato/cert emitido. Uso indevido da marca SAP quebra o processo.
> Hoje o material fala "monitora integrações SAP" (descritivo) — isso é permitido.

---

## 1. Qual programa serve pro SAPLINK

O SAPLINK é um **ISV** (software de terceiro que se integra ao SAP). Trilha correta:

| Programa | O que é | Serve? |
|---|---|---|
| **PartnerEdge — Open Ecosystem** | Porta de entrada gratuita; acesso a docs, comunidade, SAP Store (listagem básica) | ✅ começar aqui |
| **PartnerEdge — Build** | Trilha paga para ISV que constrói solução que se integra/roda com SAP. Dá licenças de teste, direito de listar/vender na SAP Store, suporte técnico, uso da marca "Partner" | ✅ alvo principal |
| **Built on SAP BTP** | Designação para solução **rodando na BTP** (CF/Kyma) | ⚠️ só se subirmos o app na BTP (hoje roda em VM Hetzner) |
| **SAP Endorsed Apps** | Tier premium: "premium certified", curadoria da SAP, co-venda forte | 🎯 meta futura (exige Build + ICC + tração) |
| **Sell / Service** | Revenda de licença SAP / implementação | ❌ não é o nosso modelo |

**Decisão:** Open Ecosystem → **Build** → (depois) ICC cert → (futuro) Endorsed App.

---

## 2. Certificação técnica (ICC) — o selo que vale ouro

O **SAP ICC (Integration & Certification Center)** emite os selos "SAP Certified – Integration with …".
Para o SAPLINK, os cenários que casam com o que já fazemos (APIs liberadas, sem add-on, sem S-user):

- **SAP Certified – Integration with SAP S/4HANA Cloud** — usa Communication Scenarios / APIs OData
  liberadas (exatamente nosso conector S/4). **Melhor fit.**
- **SAP Certified – Integration with SAP S/4HANA** (on-prem) — via interfaces liberadas (OData/SOAP/RFC liberada).
- **Integration with SAP BTP / Integration Suite** — se certificarmos o consumo de CPI/Event Mesh.

O que o SAPLINK já tem a favor da certificação:
- Conecta **sem instalar nada** no cliente (Communication Arrangement / API Key) — cenário "cloud-friendly".
- Usa **APIs públicas liberadas** (Business Accelerator Hub / OData released) — não toca em API não-liberada.
- Agente on-premise só com **tráfego de saída** — não abre portas.

> Custo/tempo ICC variam por cenário (tipicamente algumas semanas + taxa). O ICC fornece um test kit;
> a gente roda os casos e submete evidências. Já temos sync real contra o sandbox S/4 — base pronta.

---

## 3. SAP Store (listagem)

Depois de Build partner, dá pra **listar o SAPLINK na SAP Store**:
- Página da solução (descrição, screenshots, vídeo, casos, pricing/lead).
- Tipo de listagem: "lead generation" (gera lead) ou transacional.
- Requer textos + assets de marca (temos a landing e o deck — reaproveitar).

---

## 4. Roadmap acionável (ordem)

1. **Criar conta no SAP for Me / PartnerEdge** com o CNPJ da empresa → entrar no **Open Ecosystem** (grátis).
   - Site: partneredge.sap.com → "Become a Partner".
2. **Subir para Build** (trilha paga) quando quiser licenças de teste + direito de SAP Store.
3. **Montar o pacote técnico** (já temos quase tudo):
   - Arquitetura (como conecta: Communication Arrangement, OData liberada, agente saída-only).
   - Lista de APIs/cenários consumidos (temos no Catálogo vivo + conector S/4).
   - Segurança (credenciais cifradas, multi-tenant, aprovação humana, trava de produção).
4. **Abrir o processo no ICC** para "Integration with SAP S/4HANA Cloud" → rodar o test kit → submeter.
5. **Listar na SAP Store** (página + assets).
6. **(Futuro) Endorsed App** quando houver clientes de referência + a cert.

---

## 5. Checklist do pacote (o que preparar)

- [ ] Dados da empresa (razão social, CNPJ, DUNS — o D-U-N-S Number é exigido pela SAP; pedir gratuito na Dun & Bradstreet).
- [ ] One-pager técnico de integração (arquitetura + cenários SAP usados).
- [ ] Lista de APIs/Communication Scenarios consumidos (S/4HANA Cloud, CPI, Event Mesh, Ariba/SF…).
- [ ] Evidência de segurança (cifragem, isolamento por tenant, aprovação humana, trava PRD).
- [ ] Deck de vendas (já gerado: `tools/report/sales-deck.mjs` → PDF) e landing.
- [ ] Assets de marca SAPLINK (logo Pulse Node, og, screenshots) — já temos.
- [ ] Contato comercial + e-mail corporativo no domínio da empresa.

---

## 6. O que depende de você (não dá pra automatizar)

- Inscrição no PartnerEdge e pagamento da trilha Build (conta SAP + cartão/contrato).
- Obtenção do **D-U-N-S Number** (gratuito, ~dias).
- Decisão de **subir o app na BTP** (se quiser a designação "Built on SAP BTP").
- Assinatura de termos/marca da SAP.

O resto (pacote técnico, evidências, textos da SAP Store, rodar o test kit do ICC contra o sandbox)
o SAPLINK já tem a base — eu preparo os artefatos quando você abrir as contas.

---

## 7. Próximos passos sugeridos

1. Pedir o **D-U-N-S** (grátis) — é pré-requisito de tudo.
2. Criar conta **PartnerEdge Open Ecosystem** (grátis) pra explorar requisitos atuais e taxas reais.
3. Me pedir o **one-pager técnico de integração** + a **lista de cenários SAP** formatada pro ICC — eu gero a partir do que já está no sistema.
