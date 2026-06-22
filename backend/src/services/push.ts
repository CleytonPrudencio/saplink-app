// Web Push (PWA): inscrições + envio de notificações de alerta.
// eslint-disable-next-line @typescript-eslint/no-var-requires
import webpush from 'web-push';
import prisma from '../lib/prisma';

let configured = false;
function ensure(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:ops@saplink.com.br', pub, priv);
  configured = true;
  return true;
}

export function vapidPublicKey(): string { return process.env.VAPID_PUBLIC_KEY || ''; }

export async function saveSubscription(consultancyId: string, userId: string | undefined, sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  if (!sub?.endpoint || !sub?.keys) return { error: 'INVALID' as const };
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: { consultancyId, userId: userId ?? null, keys: sub.keys as any },
    create: { consultancyId, userId: userId ?? null, endpoint: sub.endpoint, keys: sub.keys as any },
  });
  return { ok: true };
}

export async function sendToConsultancy(consultancyId: string, payload: { title: string; body: string; url?: string; tag?: string }): Promise<number> {
  if (!ensure()) return 0;
  const subs = await prisma.pushSubscription.findMany({ where: { consultancyId } });
  let sent = 0;
  const data = JSON.stringify(payload);
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys as any }, data);
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await prisma.pushSubscription.delete({ where: { endpoint: s.endpoint } }).catch(() => {});
    }
  }
  return sent;
}

export function pushEnabled(): boolean { return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY); }
