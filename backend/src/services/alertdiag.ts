import prisma from '../lib/prisma';
import { diagnose, type Lang } from './ai';

// Diagnóstico de IA do alerta: usa o guardado (instantâneo) se houver pro mesmo idioma;
// senão gera, GUARDA no alerta e retorna. `fresh` força regenerar.
export async function diagnoseAlert(alertId: string, consultancyId: string, lang: Lang = 'pt', fresh = false): Promise<string | null> {
  const alert = await prisma.alert.findUnique({ where: { id: alertId }, include: { client: true, integration: true } });
  if (!alert || alert.client.consultancyId !== consultancyId) return null;
  if (!fresh && alert.aiDiagnosis && alert.aiDiagnosisLang === lang) return alert.aiDiagnosis;

  const sameOpen = await prisma.alert.count({ where: { resolved: false, type: alert.type, integrationId: alert.integrationId, clientId: alert.clientId } });
  const context = {
    cliente: alert.client.name,
    integracao: alert.integration?.name, tipo_integracao: alert.integration?.type,
    tipo_alerta: alert.type, severidade: alert.severity, mensagem: alert.message,
    ocorrencias_abertas_iguais: sameOpen, desde: alert.createdAt,
  };
  const text = await diagnose(`Explique este alerta e diga o que fazer para resolver: ${alert.message}`, context, consultancyId, lang);
  if (text) await prisma.alert.update({ where: { id: alert.id }, data: { aiDiagnosis: text, aiDiagnosisLang: lang } }).catch(() => {});
  return text;
}

// Worker de pré-geração: pega os N alertas críticos/altos abertos SEM diagnóstico e gera+guarda.
// Serial (um de cada vez) pra não saturar a CPU; chamado por um intervalo no server.
export async function pregeneratePending(limit = 2): Promise<number> {
  const pend = await prisma.alert.findMany({
    where: { resolved: false, aiDiagnosis: null, severity: { in: ['CRITICAL', 'HIGH'] } },
    orderBy: { createdAt: 'desc' }, take: limit,
    include: { client: { select: { consultancyId: true } } },
  });
  let n = 0;
  for (const a of pend) {
    try { await diagnoseAlert(a.id, a.client.consultancyId, 'pt'); n++; } catch { /* segue */ }
  }
  return n;
}
