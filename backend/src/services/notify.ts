import prisma from '../lib/prisma';
import { logger } from '../lib/logger';
import { sendEmail } from './email';

const APP_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

const SEV_RANK: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
export function sevRank(s?: string | null): number {
  return SEV_RANK[(s || 'MEDIUM').toUpperCase()] ?? 1;
}

export interface AlertLike {
  id: string; severity: string; message: string; type: string;
  client?: { name?: string | null } | null;
}

function text(alert: AlertLike, prefix = ''): string {
  const sev = (alert.severity || '').toUpperCase();
  const cli = alert.client?.name ? ` · ${alert.client.name}` : '';
  return `${prefix}[SAPLINK${cli}] ${sev}: ${alert.message}`;
}

/** Envia um alerta para um canal. Retorna true se entregou. */
export async function sendToChannel(
  channel: { type: string; target: string; name: string },
  alert: AlertLike,
  escalated = false,
): Promise<boolean> {
  const prefix = escalated ? '⏫ ESCALONADO — ' : '';
  const body = text(alert, prefix);
  try {
    if (channel.type === 'EMAIL') {
      return await sendEmail({
        to: channel.target,
        subject: `${escalated ? '[ESCALONADO] ' : ''}Alerta SAPLINK — ${alert.severity}`,
        html: `<p style="font-family:sans-serif">${body}</p><p><a href="${APP_URL}/alerts">Ver alertas</a></p>`,
      });
    }
    // SLACK / TEAMS aceitam {text}; WEBHOOK recebe o payload do alerta
    const payload = channel.type === 'WEBHOOK'
      ? { source: 'saplink', event: 'alert', escalated, alert: { id: alert.id, type: alert.type, severity: alert.severity, message: alert.message, client: alert.client?.name } }
      : { text: body };
    const res = await fetch(channel.target, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch (e) {
    logger.warn({ channel: channel.name, err: (e as Error).message }, '[notify] falha ao enviar');
    return false;
  }
}

/** Dispara um alerta para os canais de um nível da consultoria (respeitando minSeverity). */
export async function dispatch(consultancyId: string, alert: AlertLike, level: number, escalated = false): Promise<number> {
  const channels = await prisma.notificationChannel.findMany({
    where: { consultancyId, level, enabled: true },
  });
  let sent = 0;
  for (const ch of channels) {
    if (sevRank(alert.severity) < sevRank(ch.minSeverity)) continue;
    if (await sendToChannel(ch, alert, escalated)) sent++;
  }
  return sent;
}
