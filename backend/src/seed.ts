import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SAPLINK database...');

  // Clean existing data
  await prisma.diagnostic.deleteMany();
  await prisma.deadCode.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.consultancy.deleteMany();

  // 1. Create consultancy
  const consultancy = await prisma.consultancy.create({
    data: {
      name: 'SAP Solutions Brasil',
      cnpj: '12.345.678/0001-90',
      plan: 'STARTER',
    },
  });
  console.log('Consultancy created:', consultancy.name);

  // 2. Create admin user
  const hashedPassword = await bcrypt.hash('Saplink@2026', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@saplink.com',
      password: hashedPassword,
      name: 'Cleyton Admin',
      role: 'CONSULTANT_ADMIN',
      consultancyId: consultancy.id,
    },
  });
  console.log('Admin user created:', admin.email);

  // 3. Create clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Indústria Metalúrgica São Paulo',
      cnpj: '11.222.333/0001-44',
      consultancyId: consultancy.id,
      healthScore: 87,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Distribuidora Nacional Alimentos',
      cnpj: '55.666.777/0001-88',
      consultancyId: consultancy.id,
      healthScore: 62,
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Agro Nordeste Exportação',
      cnpj: '99.888.777/0001-11',
      consultancyId: consultancy.id,
      healthScore: 94,
    },
  });
  console.log('Clients created: 3');

  // 4. Create integrations
  // Client 1 - Metalúrgica: 3 integrations
  const int1a = await prisma.integration.create({
    data: {
      name: 'SAP ECC → Protheus (Pedidos de Venda)',
      type: 'IDoc',
      status: 'ACTIVE',
      latency: 120,
      errorRate: 1.2,
      uptime: 99.5,
      clientId: client1.id,
    },
  });

  const int1b = await prisma.integration.create({
    data: {
      name: 'BAPI_MATERIAL_GETLIST (Consulta Materiais)',
      type: 'RFC',
      status: 'ACTIVE',
      latency: 85,
      errorRate: 0.3,
      uptime: 99.9,
      clientId: client1.id,
    },
  });

  const int1c = await prisma.integration.create({
    data: {
      name: 'SAP PI/PO → WMS (Movimentação Estoque)',
      type: 'SOAP',
      status: 'WARNING',
      latency: 340,
      errorRate: 4.5,
      uptime: 96.2,
      clientId: client1.id,
    },
  });

  // Client 2 - Distribuidora: 3 integrations
  const int2a = await prisma.integration.create({
    data: {
      name: 'IDoc ORDERS05 (Pedidos de Compra)',
      type: 'IDoc',
      status: 'ERROR',
      latency: 890,
      errorRate: 12.3,
      uptime: 85.1,
      clientId: client2.id,
    },
  });

  const int2b = await prisma.integration.create({
    data: {
      name: 'SAP CPI → Salesforce (Clientes)',
      type: 'REST',
      status: 'ACTIVE',
      latency: 200,
      errorRate: 2.1,
      uptime: 98.7,
      clientId: client2.id,
    },
  });

  const int2c = await prisma.integration.create({
    data: {
      name: 'RFC BAPI_ACC_DOCUMENT_POST (Lançamentos FI)',
      type: 'RFC',
      status: 'WARNING',
      latency: 450,
      errorRate: 5.8,
      uptime: 93.4,
      clientId: client2.id,
    },
  });

  // Client 3 - Agro: 2 integrations
  const int3a = await prisma.integration.create({
    data: {
      name: 'IDoc DESADV (Aviso de Expedição)',
      type: 'IDoc',
      status: 'ACTIVE',
      latency: 65,
      errorRate: 0.1,
      uptime: 99.98,
      clientId: client3.id,
    },
  });

  const int3b = await prisma.integration.create({
    data: {
      name: 'SAP S/4HANA → EDI ANTT (Exportação)',
      type: 'REST',
      status: 'ACTIVE',
      latency: 110,
      errorRate: 0.5,
      uptime: 99.8,
      clientId: client3.id,
    },
  });
  console.log('Integrations created: 8');

  // 5. Create alerts (15 total)
  const alerts = [
    // Client 1 alerts (5)
    {
      type: 'LATENCY',
      severity: 'MEDIUM',
      message: 'Latência na integração SAP PI/PO → WMS acima de 300ms. Tempo médio: 340ms. Verificar configuração do canal de comunicação no Integration Directory.',
      clientId: client1.id,
      integrationId: int1c.id,
      resolved: false,
    },
    {
      type: 'ERROR_RATE',
      severity: 'HIGH',
      message: 'Taxa de erro da integração SAP PI/PO → WMS atingiu 4.5%. IDocs tipo WMMBID01 falhando na conversão de unidades de medida (UoM).',
      clientId: client1.id,
      integrationId: int1c.id,
      resolved: false,
    },
    {
      type: 'CERTIFICATE',
      severity: 'LOW',
      message: 'Certificado SSL do canal RFC para BAPI_MATERIAL_GETLIST expira em 45 dias. Renovar via transação STRUST.',
      clientId: client1.id,
      integrationId: int1b.id,
      resolved: false,
    },
    {
      type: 'PERFORMANCE',
      severity: 'LOW',
      message: 'Job de reconciliação SM37 (RMMR1MRS) executou em 45 minutos, acima do SLA de 30 minutos.',
      clientId: client1.id,
      resolved: true,
      resolvedAt: new Date('2026-04-05T14:30:00'),
    },
    {
      type: 'IDOC_ERROR',
      severity: 'MEDIUM',
      message: 'Lote de 23 IDocs MATMAS05 em status 51 (erro aplicação). Segmento E1MARAM com campo MATKL inválido.',
      clientId: client1.id,
      integrationId: int1a.id,
      resolved: true,
      resolvedAt: new Date('2026-04-03T09:15:00'),
    },
    // Client 2 alerts (6)
    {
      type: 'DOWNTIME',
      severity: 'CRITICAL',
      message: 'Integração IDoc ORDERS05 fora do ar há 2 horas. Fila qRFC QOUT bloqueada. Erro: SYSTEM_FAILURE no destino RFC PROT_DIST_100.',
      clientId: client2.id,
      integrationId: int2a.id,
      resolved: false,
    },
    {
      type: 'ERROR_RATE',
      severity: 'CRITICAL',
      message: 'Taxa de erro em 12.3% na integração ORDERS05. 47 pedidos de compra não processados. Impacto em MM: falta de materiais no centro 1000.',
      clientId: client2.id,
      integrationId: int2a.id,
      resolved: false,
    },
    {
      type: 'LATENCY',
      severity: 'HIGH',
      message: 'Latência RFC BAPI_ACC_DOCUMENT_POST em 450ms (SLA: 200ms). Possível lock na tabela BSEG. Verificar transação SM12.',
      clientId: client2.id,
      integrationId: int2c.id,
      resolved: false,
    },
    {
      type: 'SYNC_FAILURE',
      severity: 'MEDIUM',
      message: 'Sincronização SAP CPI → Salesforce falhou para 12 registros de clientes. Erro de mapeamento no campo KUNNR para Account ID.',
      clientId: client2.id,
      integrationId: int2b.id,
      resolved: false,
    },
    {
      type: 'DUMP',
      severity: 'HIGH',
      message: 'Dump ABAP: DBIF_RSQL_SQL_ERROR no programa SAPMM07M durante entrada de mercadoria (MIGO). Tabela MSEG com overflow no campo MENGE.',
      clientId: client2.id,
      resolved: false,
    },
    {
      type: 'AUTHORIZATION',
      severity: 'MEDIUM',
      message: 'Falha de autorização objeto S_RFC para usuário INTUSER_CPI. Perfil SAP_ALL removido conforme auditoria. Ajustar via transação SU01.',
      clientId: client2.id,
      resolved: true,
      resolvedAt: new Date('2026-04-06T16:45:00'),
    },
    // Client 3 alerts (4)
    {
      type: 'PERFORMANCE',
      severity: 'LOW',
      message: 'Tempo de processamento do IDoc DESADV aumentou 15% na última semana. Ainda dentro do SLA, mas tendência de degradação.',
      clientId: client3.id,
      integrationId: int3a.id,
      resolved: false,
    },
    {
      type: 'CERTIFICATE',
      severity: 'LOW',
      message: 'Certificado digital e-CPF para assinatura de NF-e expira em 60 dias. Providenciar renovação junto à certificadora.',
      clientId: client3.id,
      resolved: false,
    },
    {
      type: 'COMPLIANCE',
      severity: 'LOW',
      message: 'Atualização da tabela de NCM (SKAT) pendente para adequação à TIPI 2026. Executar nota SAP 3345678.',
      clientId: client3.id,
      resolved: true,
      resolvedAt: new Date('2026-04-01T11:00:00'),
    },
    {
      type: 'MONITORING',
      severity: 'LOW',
      message: 'Job periódico de verificação de EDI ANTT executado com sucesso. Todos os 156 CTe processados sem erros.',
      clientId: client3.id,
      integrationId: int3b.id,
      resolved: true,
      resolvedAt: new Date('2026-04-07T06:00:00'),
    },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert });
  }
  console.log('Alerts created: 15');

  // 6. Create diagnostics (5 entries)
  const diagnostics = [
    {
      query: 'Analisar erros de IDoc ORDERS05 nos últimos 7 dias',
      response: `**Causa Raiz:** Os IDocs ORDERS05 estão falhando devido a inconsistência no mapeamento do campo BSTNK (nº pedido cliente) entre SAP ECC e Protheus. O parceiro lógico PROT_DIST não está configurado para o tipo de mensagem ORDERS no modelo de distribuição.

**Correção:**
1. Acesse a transação BD64 e verifique o modelo de distribuição para ORDERS/ORDERS05
2. Na WE20, valide o perfil do parceiro lógico PROT_DIST tipo LS
3. Execute BD87 para reprocessar IDocs em status 51
4. Corrija o mapeamento na transação WE57 para o tipo de mensagem ORDERS

**Prevenção:**
- Implemente monitoramento via transação WE05 com filtro por status 51 e 56
- Configure alerta no CCMS (RZ20) para volume de IDocs com erro > 10/hora
- Agende job de reconciliação diário via SM36`,
      clientId: client2.id,
    },
    {
      query: 'Diagnosticar dump ABAP DBIF_RSQL_SQL_ERROR no programa SAPMM07M',
      response: `**Causa Raiz:** O dump DBIF_RSQL_SQL_ERROR ocorre quando o programa SAPMM07M tenta inserir um registro na tabela MSEG com valor decimal no campo MENGE que excede a precisão definida (13 posições inteiras, 3 decimais). Isso acontece quando a unidade de medida alternativa está configurada com fator de conversão incorreto na transação MM02.

**Correção:**
1. Acesse ST22 e analise o dump - identifique o número do documento de material
2. Verifique o material via MM03 > aba Unidades de Medida
3. Corrija o fator de conversão na transação CUNI se necessário
4. Reprocesse a entrada de mercadoria via MIGO com quantidade corrigida
5. Verifique se há entradas bloqueadas na tabela MKPF via SE16

**Prevenção:**
- Implemente validação BAdI MB_MIGO_BADI para verificar overflow antes do posting
- Configure User Exit EXIT_SAPMM07M_001 para validação de quantidade
- Revise todas as UoM alternativas dos materiais críticos via relatório RMMR1MRS`,
      clientId: client2.id,
    },
    {
      query: 'Verificar status das integrações com Protheus',
      response: `**Causa Raiz:** A integração SAP ECC → Protheus via IDoc está apresentando lentidão e erros intermitentes. O destino RFC PROT_METAL_100 está com pool de conexões esgotado (máximo 10 conexões configuradas, 10 em uso). A fila qRFC de saída (QOUT) tem 156 registros pendentes.

**Correção:**
1. Na SM59, aumente o pool de conexões do destino PROT_METAL_100 para 25
2. Execute SMQ1 para verificar e liberar a fila de saída qRFC
3. Na SMQS, registre o scheduler de destino se estiver parado
4. Verifique o status do serviço Protheus via SM59 > Connection Test
5. Limpe entradas órfãs na tabela TRFCQOUT via programa RSQOWKEX

**Prevenção:**
- Configure monitoramento proativo da fila qRFC via SMQR
- Implemente balanceamento de carga RFC com grupo de logon (SMLG)
- Agende verificação automática de conectividade via job SM36`,
      clientId: client1.id,
    },
    {
      query: 'Relatório de saúde geral do ambiente SAP',
      response: `**Resumo do Ambiente:**
O ambiente SAP apresenta saúde geral EXCELENTE (score 94/100).

**Disponibilidade:** 99.89% (meta: 99.5%) - DENTRO DO SLA
- IDoc DESADV: 99.98% uptime
- EDI ANTT: 99.80% uptime

**Performance:** Latência média 87ms (meta: 200ms) - EXCELENTE
- Nenhum gargalo identificado nas conexões RFC
- Tempos de resposta do SAP Gateway dentro do esperado

**Erros:** Taxa média 0.3% (meta: 2%) - EXCELENTE
- Apenas 2 IDocs com erro no período (ambos reprocessados)

**Conformidade:** 100% das integrações ativas e monitoradas

**Recomendações:**
1. Manter rotina de monitoramento via SOLMAN
2. Planejar atualização do kernel SAP para versão 7.93
3. Revisar sizing do application server antes do pico de safra (agosto)`,
      clientId: client3.id,
    },
    {
      query: 'Analisar latência das conexões RFC',
      response: `**Causa Raiz:** A latência elevada nas conexões RFC está relacionada a dois fatores: (1) O application server SAP está com uso de CPU em 78% durante horário de pico (9h-12h), impactando o throughput das chamadas RFC; (2) A rede entre o data center SAP e o servidor Protheus apresenta latência de 45ms (normal: 5ms), indicando possível congestionamento no link MPLS.

**Correção:**
1. Acesse SM66 para verificar processos de trabalho durante horário de pico
2. Na ST06, analise o uso de CPU e memória do servidor
3. Execute ST05 (SQL Trace) para identificar queries lentas nas BAPIs
4. Verifique na SM59 os tempos de resposta de cada destino RFC
5. Solicite à equipe de rede análise do link MPLS (traceroute e latência)

**Prevenção:**
- Configure logon groups (SMLG) para balancear carga RFC
- Implemente connection pooling adequado (mínimo 15 conexões por destino)
- Agende análise de performance semanal via Early Watch Alert (SOLMAN)
- Considere migração para SAP CPI para integrações REST/OData`,
      clientId: client1.id,
    },
  ];

  for (const diag of diagnostics) {
    await prisma.diagnostic.create({ data: diag });
  }
  console.log('Diagnostics created: 5');

  // 7. Create dead code objects (20 entries)
  const deadCodeEntries = [
    // Client 1 - Metalúrgica (7 entries)
    { objectName: 'Z_MM_LEGACY_STOCK_REPORT', objectType: 'PROGRAM', lastUsed: new Date('2023-01-15'), usageCount: 0, recommendation: 'RETIRE', clientId: client1.id },
    { objectName: 'Z_SD_OLD_PRICING_CALC', objectType: 'PROGRAM', lastUsed: new Date('2022-06-20'), usageCount: 0, recommendation: 'RETIRE', clientId: client1.id },
    { objectName: 'ZCL_FI_LEGACY_POSTING', objectType: 'CLASS', lastUsed: new Date('2024-03-10'), usageCount: 2, recommendation: 'REVIEW', clientId: client1.id },
    { objectName: 'Z_BAPI_MATERIAL_CUSTOM', objectType: 'FUNCTION', lastUsed: new Date('2024-11-01'), usageCount: 15, recommendation: 'KEEP', clientId: client1.id },
    { objectName: 'Z_PP_ROUTING_MIGRATION', objectType: 'PROGRAM', lastUsed: new Date('2021-12-01'), usageCount: 0, recommendation: 'RETIRE', clientId: client1.id },
    { objectName: 'Z_WM_TRANSFER_ORDER_V1', objectType: 'FUNCTION', lastUsed: new Date('2023-08-15'), usageCount: 0, recommendation: 'RETIRE', clientId: client1.id },
    { objectName: 'ZCL_MM_VENDOR_EVAL_OLD', objectType: 'CLASS', lastUsed: new Date('2024-06-01'), usageCount: 5, recommendation: 'REVIEW', clientId: client1.id },

    // Client 2 - Distribuidora (7 entries)
    { objectName: 'Z_FI_LEGACY_BALANCE_RPT', objectType: 'PROGRAM', lastUsed: new Date('2022-12-31'), usageCount: 0, recommendation: 'RETIRE', clientId: client2.id },
    { objectName: 'Z_SD_DELIVERY_SPLIT_V1', objectType: 'FUNCTION', lastUsed: new Date('2023-04-10'), usageCount: 0, recommendation: 'RETIRE', clientId: client2.id },
    { objectName: 'ZCL_CO_COST_CENTER_OLD', objectType: 'CLASS', lastUsed: new Date('2024-01-15'), usageCount: 3, recommendation: 'REVIEW', clientId: client2.id },
    { objectName: 'Z_MM_PO_APPROVAL_LEGACY', objectType: 'PROGRAM', lastUsed: new Date('2024-09-01'), usageCount: 8, recommendation: 'REVIEW', clientId: client2.id },
    { objectName: 'Z_IDOC_ORDERS_CUSTOM_V1', objectType: 'FUNCTION', lastUsed: new Date('2024-12-01'), usageCount: 45, recommendation: 'KEEP', clientId: client2.id },
    { objectName: 'Z_FI_TAX_CALC_2023', objectType: 'PROGRAM', lastUsed: new Date('2023-12-31'), usageCount: 0, recommendation: 'RETIRE', clientId: client2.id },
    { objectName: 'ZCL_SD_PRICING_ENGINE_V2', objectType: 'CLASS', lastUsed: new Date('2025-01-10'), usageCount: 120, recommendation: 'KEEP', clientId: client2.id },

    // Client 3 - Agro (6 entries)
    { objectName: 'Z_LE_SHIPMENT_LEGACY', objectType: 'PROGRAM', lastUsed: new Date('2022-03-01'), usageCount: 0, recommendation: 'RETIRE', clientId: client3.id },
    { objectName: 'Z_MM_BATCH_MGMT_V1', objectType: 'FUNCTION', lastUsed: new Date('2023-09-15'), usageCount: 0, recommendation: 'RETIRE', clientId: client3.id },
    { objectName: 'ZCL_SD_EXPORT_DOCS', objectType: 'CLASS', lastUsed: new Date('2025-02-01'), usageCount: 89, recommendation: 'KEEP', clientId: client3.id },
    { objectName: 'Z_FI_SPED_FISCAL_2024', objectType: 'PROGRAM', lastUsed: new Date('2024-12-31'), usageCount: 12, recommendation: 'REVIEW', clientId: client3.id },
    { objectName: 'Z_CO_PRODUCT_COSTING_OLD', objectType: 'FUNCTION', lastUsed: new Date('2023-05-20'), usageCount: 0, recommendation: 'RETIRE', clientId: client3.id },
    { objectName: 'Z_PP_MRP_CUSTOM_LOGIC', objectType: 'PROGRAM', lastUsed: null, usageCount: 0, recommendation: 'RETIRE', clientId: client3.id },
  ];

  for (const dc of deadCodeEntries) {
    await prisma.deadCode.create({ data: dc });
  }
  console.log('Dead code entries created: 20');

  console.log('\nSeed completed successfully!');
  console.log('Login: admin@saplink.com / Saplink@2026');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
