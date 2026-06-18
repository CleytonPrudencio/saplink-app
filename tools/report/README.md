# Gerador de apresentação & relatório — SAPLINK

Puxa os dados reais da API do SAPLINK e gera:
- `out/SAPLINK-apresentacao-vendas.pptx` — deck comercial (PowerPoint editável)
- `out/SAPLINK-relatorio-comercial.pdf` — relatório estilizado (PDF)

## Uso

```bash
cd tools/report
npm install
node generate.mjs                       # produção (https://saplink.com.br/api)
# ou apontando para outro ambiente / tenant:
API=http://localhost:8080/api EMAIL=admin@empresa.com PASSWORD=... node generate.mjs
```

Os arquivos saem em `tools/report/out/`.

## Notas

- O deck/relatório refletem **os números reais do tenant** no momento da geração
  (carteira, cockpit, SLA, impacto em R$, CPI/AIF, previsão). Rode de novo para atualizar.
- A carteira demo roda em modo **erro forçado** (agente `MOCK_FORCE=error`) — ótimo para
  mostrar o produto detectando problemas, mas para um prospect específico vale gerar
  contra um tenant com dados mais saudáveis.
- O slide/seção de **CPI/AIF** tem um espaço marcado para colar o **print do SAP BTP**
  (Integration Suite — Message Monitoring — e AIF) como evidência do trial gratuito.
- Cores e marca seguem o tema do SAPLINK (roxo/ciano sobre fundo escuro).
