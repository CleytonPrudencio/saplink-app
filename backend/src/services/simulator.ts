import prisma from '../lib/prisma';

// Simula variações realistas nos dados das integrações
export async function simulateIntegrationData() {
  const integrations = await prisma.integration.findMany();

  for (const integration of integrations) {
    const statusRoll = Math.random();
    let newStatus = integration.status;
    let newLatency = integration.latency;
    let newErrorRate = integration.errorRate;
    let newUptime = integration.uptime;

    // 5% chance de erro, 3% chance de offline, 92% ativo
    if (statusRoll < 0.05) {
      newStatus = 'ERROR';
      newErrorRate = Math.min(100, newErrorRate + Math.random() * 15);
      newLatency = integration.latency + Math.floor(Math.random() * 500);
      newUptime = Math.max(85, newUptime - Math.random() * 3);
    } else if (statusRoll < 0.08) {
      newStatus = 'OFFLINE';
      newErrorRate = 100;
      newLatency = 0;
      newUptime = Math.max(80, newUptime - Math.random() * 5);
    } else {
      newStatus = 'ACTIVE';
      // Variação natural de latência (±20%)
      const variation = 1 + (Math.random() - 0.5) * 0.4;
      newLatency = Math.max(10, Math.floor(integration.latency * variation));
      // Error rate tende a diminuir quando ativo
      newErrorRate = Math.max(0, newErrorRate - Math.random() * 2);
      // Uptime sobe lentamente
      newUptime = Math.min(100, newUptime + Math.random() * 0.5);
    }

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: newStatus,
        latency: Math.round(newLatency),
        errorRate: parseFloat(newErrorRate.toFixed(2)),
        uptime: parseFloat(newUptime.toFixed(2)),
      },
    });

    // Se status mudou para ERROR, cria alerta automático
    if (newStatus === 'ERROR' && integration.status !== 'ERROR') {
      const alertTypes = ['ERROR_SPIKE', 'LATENCY_HIGH', 'INTEGRATION_FAILURE', 'DATA_SYNC_ERROR'];
      const messages = [
        `Pico de erros detectado na integração ${integration.name}. Taxa de erro: ${newErrorRate.toFixed(1)}%`,
        `Latência alta na integração ${integration.name}: ${newLatency}ms (limite: 500ms)`,
        `Falha de conexão na integração ${integration.name}. Última resposta: timeout`,
        `Erro de sincronização de dados na integração ${integration.name}. IDoc travado na fila`,
      ];
      const idx = Math.floor(Math.random() * alertTypes.length);

      await prisma.alert.create({
        data: {
          type: alertTypes[idx],
          severity: Math.random() < 0.3 ? 'CRITICAL' : 'HIGH',
          message: messages[idx],
          clientId: integration.clientId,
          integrationId: integration.id,
        },
      });
    }

    // Se voltou a ACTIVE após erro, resolve alertas pendentes
    if (newStatus === 'ACTIVE' && integration.status === 'ERROR') {
      await prisma.alert.updateMany({
        where: {
          integrationId: integration.id,
          resolved: false,
        },
        data: {
          resolved: true,
          resolvedAt: new Date(),
        },
      });
    }
  }

  // Recalcula health score dos clientes
  const clients = await prisma.client.findMany({
    include: { integrations: true, alerts: { where: { resolved: false } } },
  });

  for (const client of clients) {
    const intgs = client.integrations;
    if (intgs.length === 0) continue;

    // Disponibilidade: % de integrações ativas
    const activeCount = intgs.filter(i => i.status === 'ACTIVE').length;
    const availability = (activeCount / intgs.length) * 100;

    // Performance: baseado em latência média (quanto menor, melhor)
    const avgLatency = intgs.reduce((sum, i) => sum + i.latency, 0) / intgs.length;
    const performance = Math.max(0, 100 - (avgLatency / 10));

    // Erros: baseado em error rate médio
    const avgErrorRate = intgs.reduce((sum, i) => sum + i.errorRate, 0) / intgs.length;
    const errors = Math.max(0, 100 - avgErrorRate * 2);

    // Compliance: baseado em alertas não resolvidos
    const unresolvedAlerts = client.alerts.length;
    const compliance = Math.max(0, 100 - unresolvedAlerts * 10);

    const score = Math.round(
      availability * 0.3 + performance * 0.25 + errors * 0.25 + compliance * 0.2
    );

    await prisma.client.update({
      where: { id: client.id },
      data: { healthScore: Math.min(100, Math.max(0, score)) },
    });
  }

  return { updated: integrations.length, timestamp: new Date().toISOString() };
}
