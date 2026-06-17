import prisma from '../lib/prisma';

export interface AgentReport {
  ok?: boolean; // saúde geral do SAP segundo o agente
  status?: string; // ACTIVE | ERROR | OFFLINE (opcional; derivado se ausente)
  latency?: number; // ms do ping RFC
  message?: string;
  metrics?: {
    rfcPing?: boolean;
    idocErrorCount?: number;
    idocTotal?: number;
    dumps?: number; // dumps ABAP (ST22)
    queueBacklog?: number; // qRFC/tRFC presos (SMQ1/SMQ2)
  };
}

/**
 * Ingere um relatório do Agente on-premise: deriva status/métricas (média móvel),
 * grava lastAgentReportAt e cria/resolve alertas — espelha syncIntegration, mas a
 * fonte é o push do agente (RFC/IDoc), não um probe HTTP.
 */
export async function ingestAgentReport(integrationId: string, report: AgentReport) {
  const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
  if (!integration) return null;

  const m = report.metrics || {};
  // saúde: ok explícito, senão deriva de rfcPing + erros de IDoc
  const idocErrorRate = m.idocTotal && m.idocTotal > 0 ? (m.idocErrorCount ?? 0) / m.idocTotal * 100 : undefined;
  const ok = report.ok ?? (
    (m.rfcPing ?? true) && (idocErrorRate === undefined || idocErrorRate < 10) && (m.dumps ?? 0) === 0
  );

  // status: respeita o que o agente mandou; senão deriva
  let status = (report.status || '').toUpperCase();
  if (!['ACTIVE', 'ERROR', 'OFFLINE'].includes(status)) status = ok ? 'ACTIVE' : 'ERROR';

  const firstReading = integration.status === 'PENDING';
  const okVal = ok ? 100 : 0;
  const errVal = idocErrorRate ?? (ok ? 0 : 100);
  const newErrorRate = firstReading
    ? parseFloat(errVal.toFixed(2))
    : parseFloat((integration.errorRate * 0.7 + errVal * 0.3).toFixed(2));
  const newUptime = firstReading
    ? okVal
    : parseFloat((integration.uptime * 0.9 + okVal * 0.1).toFixed(2));
  const latency = typeof report.latency === 'number' ? Math.round(report.latency) : integration.latency;

  await prisma.integration.update({
    where: { id: integration.id },
    data: { status, latency, errorRate: newErrorRate, uptime: newUptime, lastAgentReportAt: new Date() },
  });

  // Alertas (mesma política do probe HTTP): dispara ao entrar em estado ruim, resolve ao voltar
  if (status !== 'ACTIVE' && integration.status !== status) {
    const detalhe = report.message
      || (m.dumps ? `${m.dumps} dump(s) ABAP detectado(s) (ST22).`
        : m.idocErrorCount ? `${m.idocErrorCount} IDoc(s) com erro.`
        : m.rfcPing === false ? 'Ping RFC falhou.'
        : 'Falha reportada pelo agente.');
    await prisma.alert.create({
      data: {
        type: status === 'OFFLINE' ? 'INTEGRATION_OFFLINE' : 'INTEGRATION_ERROR',
        severity: status === 'OFFLINE' ? 'CRITICAL' : 'HIGH',
        message: `Integração ${integration.name} (agente): ${detalhe}`,
        clientId: integration.clientId,
        integrationId: integration.id,
      },
    });
  } else if (status === 'ACTIVE' && integration.status !== 'ACTIVE') {
    await prisma.alert.updateMany({
      where: { integrationId: integration.id, resolved: false },
      data: { resolved: true, resolvedAt: new Date() },
    });
  }

  return { status, errorRate: newErrorRate, uptime: newUptime, latency };
}

/**
 * Heartbeat: integrações monitoradas por agente que pararam de reportar viram OFFLINE.
 * Retorna quantas foram marcadas.
 */
export async function markStaleAgents(staleMs: number): Promise<number> {
  const cutoff = new Date(Date.now() - staleMs);
  const stale = await prisma.integration.findMany({
    where: {
      agentTokenHash: { not: null },
      lastAgentReportAt: { not: null, lt: cutoff },
      status: { not: 'OFFLINE' },
    },
  });
  for (const i of stale) {
    await prisma.integration.update({ where: { id: i.id }, data: { status: 'OFFLINE' } });
    if (i.status !== 'OFFLINE') {
      await prisma.alert.create({
        data: {
          type: 'INTEGRATION_OFFLINE',
          severity: 'CRITICAL',
          message: `Integração ${i.name} (agente): sem relatório do agente há mais de ${Math.round(staleMs / 60000)} min — agente offline?`,
          clientId: i.clientId,
          integrationId: i.id,
        },
      });
    }
  }
  return stale.length;
}
