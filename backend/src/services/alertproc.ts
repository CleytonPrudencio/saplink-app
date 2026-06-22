import prisma from '../lib/prisma';
import { logger } from '../lib/logger';
import { dispatch, sevRank } from './notify';
import { createTicket, closeTicket } from './tickets';
import { sendToConsultancy } from './push';

/** Processa alertas: notifica novos (nível 1) + abre ticket; escala não resolvidos;
 *  fecha tickets de alertas resolvidos. Idempotente — guiado por flags no Alert. */
export async function processAlerts(): Promise<{ notified: number; escalated: number; closed: number }> {
  let notified = 0, escalated = 0, closed = 0;

  // 1) Novos alertas não notificados
  const fresh = await prisma.alert.findMany({
    where: { notifiedAt: null, resolved: false },
    take: 50,
    include: { client: { select: { name: true, consultancyId: true } } },
  });
  for (const a of fresh) {
    const consultancyId = a.client?.consultancyId;
    if (!consultancyId) { await prisma.alert.update({ where: { id: a.id }, data: { notifiedAt: new Date() } }); continue; }
    const alertLike = { id: a.id, severity: a.severity, message: a.message, type: a.type, client: a.client };
    try {
      const n = await dispatch(consultancyId, alertLike, 1);
      if (n) notified += n;
    } catch (e) { logger.warn({ err: (e as Error).message }, '[alertproc] dispatch L1'); }

    // Web Push (PWA) — notifica no celular/desktop instalado
    try {
      await sendToConsultancy(consultancyId, { title: `SAPLINK · ${a.severity}`, body: a.message.slice(0, 140), url: '/alerts', tag: a.id });
    } catch (e) { logger.warn({ err: (e as Error).message }, '[alertproc] push'); }

    // ticket (respeita minSeverity da config)
    let ticketKey: string | null = null, ticketUrl: string | null = null;
    try {
      const cfg = await prisma.ticketConfig.findUnique({ where: { consultancyId }, select: { enabled: true, minSeverity: true } });
      if (cfg?.enabled && sevRank(a.severity) >= sevRank(cfg.minSeverity)) {
        const t = await createTicket(consultancyId, alertLike);
        if (t) { ticketKey = t.key; ticketUrl = t.url; }
      }
    } catch (e) { logger.warn({ err: (e as Error).message }, '[alertproc] ticket create'); }

    await prisma.alert.update({ where: { id: a.id }, data: { notifiedAt: new Date(), ticketKey, ticketUrl } });
  }

  // 2) Escalonamento de não resolvidos
  const consultancies = await prisma.consultancy.findMany({ select: { id: true, escalateAfterMin: true } });
  const escMap = new Map(consultancies.map((c) => [c.id, c.escalateAfterMin]));
  const candidates = await prisma.alert.findMany({
    where: { resolved: false, escalationLevel: { lt: 2 }, notifiedAt: { not: null } },
    take: 100,
    include: { client: { select: { name: true, consultancyId: true } } },
  });
  for (const a of candidates) {
    const consultancyId = a.client?.consultancyId;
    if (!consultancyId || !a.notifiedAt) continue;
    const mins = escMap.get(consultancyId) ?? 30;
    if (Date.now() - new Date(a.notifiedAt).getTime() < mins * 60000) continue;
    try {
      const n = await dispatch(consultancyId, { id: a.id, severity: a.severity, message: a.message, type: a.type, client: a.client }, 2, true);
      escalated += n;
    } catch (e) { logger.warn({ err: (e as Error).message }, '[alertproc] dispatch L2'); }
    await prisma.alert.update({ where: { id: a.id }, data: { escalationLevel: 2 } });
  }

  // 3) Fecha tickets de alertas resolvidos
  const toClose = await prisma.alert.findMany({
    where: { resolved: true, ticketKey: { not: null }, ticketClosedAt: null },
    take: 50,
    include: { client: { select: { consultancyId: true } } },
  });
  for (const a of toClose) {
    const consultancyId = a.client?.consultancyId;
    if (!consultancyId || !a.ticketKey) continue;
    try {
      const ok = await closeTicket(consultancyId, a.ticketKey);
      if (ok) closed++;
    } catch (e) { logger.warn({ err: (e as Error).message }, '[alertproc] ticket close'); }
    await prisma.alert.update({ where: { id: a.id }, data: { ticketClosedAt: new Date() } });
  }

  return { notified, escalated, closed };
}
