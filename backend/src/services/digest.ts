import prisma from '../lib/prisma';
import { logger } from '../lib/logger';
import { narrateDigest, aiEnabled } from './ai';
import { sendEmail, emailEnabled } from './email';

const APP_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface DigestData {
  clientes: number;
  integracoes: number;
  porStatus: Record<string, number>;
  healthMedio: number;
  alertasSemana: number;
  problemas: { cliente?: string; integracao: string; tipo: string; status: string; erro: string; uptime: string; latencia: string }[];
  alertasCriticos: { cliente?: string; severidade: string; mensagem: string }[];
}

/** Coleta o snapshot de saúde da carteira para o digest. */
export async function gatherDigestData(consultancyId: string): Promise<DigestData> {
  const since = new Date(Date.now() - WEEK_MS);
  const [clients, integrations, alerts] = await Promise.all([
    prisma.client.findMany({ where: { consultancyId }, select: { healthScore: true } }),
    prisma.integration.findMany({
      where: { client: { consultancyId } },
      select: { name: true, type: true, status: true, errorRate: true, uptime: true, latency: true, client: { select: { name: true } } },
    }),
    prisma.alert.findMany({
      where: { client: { consultancyId }, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      select: { severity: true, message: true, resolved: true, client: { select: { name: true } } },
    }),
  ]);

  const porStatus = integrations.reduce((acc: Record<string, number>, i) => {
    const s = (i.status || 'PENDING').toUpperCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const healthMedio = clients.length
    ? Math.round(clients.reduce((s, c) => s + (c.healthScore ?? 0), 0) / clients.length)
    : 0;

  const problemas = integrations
    .filter((i) => (i.status || '').toUpperCase() !== 'ACTIVE' || (i.errorRate ?? 0) > 5 || (i.uptime ?? 100) < 95)
    .slice(0, 15)
    .map((i) => ({ cliente: i.client?.name, integracao: i.name, tipo: i.type, status: i.status, erro: `${i.errorRate}%`, uptime: `${i.uptime}%`, latencia: `${i.latency}ms` }));

  const alertasCriticos = alerts
    .filter((a) => !a.resolved && /CRITICAL|HIGH|ERROR/i.test(a.severity || ''))
    .slice(0, 10)
    .map((a) => ({ cliente: a.client?.name, severidade: a.severity, mensagem: a.message }));

  return {
    clientes: clients.length,
    integracoes: integrations.length,
    porStatus,
    healthMedio,
    alertasSemana: alerts.length,
    problemas,
    alertasCriticos,
  };
}

function statusColor(s: string): string {
  const u = s.toUpperCase();
  if (u === 'ACTIVE') return '#34d399';
  if (u === 'ERROR' || u === 'OFFLINE') return '#f87171';
  return '#fbbf24';
}

/** Monta o HTML do e-mail do digest (white-label pelo nome/cor da consultoria). */
export function renderDigestHtml(name: string, primaryColor: string | null, data: DigestData, narrative: string): string {
  const accent = primaryColor || '#a78bfa';
  const statusBadges = Object.entries(data.porStatus)
    .map(([s, n]) => `<span style="display:inline-block;background:#1a1527;border:1px solid #2a2440;border-radius:8px;padding:4px 10px;margin:0 6px 6px 0;font-size:13px;color:${statusColor(s)}">${s}: <b>${n}</b></span>`)
    .join('');

  const problemasHtml = data.problemas.length
    ? `<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:13px">
        ${data.problemas.map((p) => `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #2a2440;color:#c9c5d6">${p.cliente || '-'}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #2a2440;color:#e2e0ea">${p.integracao}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #2a2440;color:${statusColor(p.status)};text-align:right">${p.status}</td>
        </tr>`).join('')}
      </table>`
    : `<p style="color:#34d399;font-size:13px">Nenhuma integração crítica. 🎉</p>`;

  const narrativeHtml = narrative
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => `<p style="color:#c9c5d6;line-height:1.6;margin:6px 0">${l.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`)
    .join('');

  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f0b1a;color:#e2e0ea;border-radius:16px;overflow:hidden;border:1px solid #2a2440">
    <div style="padding:20px 24px;border-bottom:1px solid #2a2440;font-size:18px;font-weight:700;color:${accent}">◆ ${name}</div>
    <div style="padding:24px">
      <h2 style="margin:0 0 4px;font-size:18px;color:#fff">Resumo semanal de saúde</h2>
      <p style="color:#9b95ad;font-size:13px;margin:0 0 16px">Carteira de integrações SAP — últimos 7 dias</p>

      <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
        <div style="flex:1;min-width:90px;background:#1a1527;border:1px solid #2a2440;border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:${accent}">${data.healthMedio}</div>
          <div style="font-size:11px;color:#9b95ad">Health médio</div>
        </div>
        <div style="flex:1;min-width:90px;background:#1a1527;border:1px solid #2a2440;border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:#fff">${data.clientes}</div>
          <div style="font-size:11px;color:#9b95ad">Clientes</div>
        </div>
        <div style="flex:1;min-width:90px;background:#1a1527;border:1px solid #2a2440;border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:#fff">${data.integracoes}</div>
          <div style="font-size:11px;color:#9b95ad">Integrações</div>
        </div>
        <div style="flex:1;min-width:90px;background:#1a1527;border:1px solid #2a2440;border-radius:12px;padding:12px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:${data.alertasSemana ? '#f87171' : '#34d399'}">${data.alertasSemana}</div>
          <div style="font-size:11px;color:#9b95ad">Alertas/semana</div>
        </div>
      </div>

      <div style="margin-bottom:16px">${statusBadges}</div>

      <div style="background:#15101f;border:1px solid #2a2440;border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="font-size:13px;font-weight:600;color:${accent};margin-bottom:6px">🤖 Análise da IA</div>
        ${narrativeHtml || '<p style="color:#9b95ad;font-size:13px">Análise indisponível nesta edição.</p>'}
      </div>

      <h3 style="font-size:14px;color:#fff;margin:0 0 4px">Pontos de atenção</h3>
      ${problemasHtml}

      <p style="margin-top:20px"><a href="${APP_URL}/dashboard" style="display:inline-block;background:linear-gradient(90deg,#7c3aed,#06b6d4);color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600">Abrir o painel</a></p>
    </div>
    <div style="padding:16px 24px;border-top:1px solid #2a2440;font-size:12px;color:#9b95ad">
      Enviado pelo SAPLINK · digest semanal. Para desativar, acesse Configurações.
    </div>
  </div>`;
}

/** Destinatários do digest: admins da consultoria + e-mail financeiro (dedupe). */
async function digestRecipients(consultancyId: string, billingEmail?: string | null): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { consultancyId, role: 'CONSULTANCY_ADMIN' },
    select: { email: true },
  });
  const set = new Set<string>();
  admins.forEach((a) => a.email && set.add(a.email.toLowerCase()));
  if (billingEmail) set.add(billingEmail.toLowerCase());
  return [...set];
}

/** Gera e envia o digest de uma consultoria. force=true ignora a janela de 7 dias. */
export async function sendDigest(consultancyId: string, opts: { force?: boolean } = {}): Promise<{ sent: boolean; to: string[]; reason?: string }> {
  const consultancy = await prisma.consultancy.findUnique({ where: { id: consultancyId } });
  if (!consultancy) return { sent: false, to: [], reason: 'consultoria não encontrada' };

  const recipients = await digestRecipients(consultancyId, consultancy.billingEmail);
  if (!recipients.length) return { sent: false, to: [], reason: 'sem destinatários' };

  const data = await gatherDigestData(consultancyId);
  const narrative = aiEnabled() ? await narrateDigest(data) : '';
  const html = renderDigestHtml(consultancy.name, consultancy.primaryColor, data, narrative);

  let anySent = false;
  for (const to of recipients) {
    const ok = await sendEmail({ to, subject: `Resumo semanal — ${consultancy.name} · SAPLINK`, html });
    anySent = anySent || ok;
  }

  await prisma.consultancy.update({ where: { id: consultancyId }, data: { lastDigestAt: new Date() } });
  return { sent: anySent, to: recipients, reason: anySent ? undefined : 'envio em modo log (sem RESEND_API_KEY)' };
}

/** Roda os digests pendentes: consultorias com digest ligado, assinatura ativa e janela vencida. */
export async function runDueDigests(): Promise<number> {
  if (!emailEnabled()) {
    logger.warn('[digest] RESEND_API_KEY ausente — digest semanal pulado');
    return 0;
  }
  const cutoff = new Date(Date.now() - WEEK_MS);
  const due = await prisma.consultancy.findMany({
    where: {
      weeklyDigest: true,
      OR: [{ lastDigestAt: null }, { lastDigestAt: { lt: cutoff } }],
      subscription: { status: { in: ['ACTIVE', 'TRIALING'] } },
    },
    select: { id: true, name: true },
  });

  let sent = 0;
  for (const c of due) {
    try {
      const r = await sendDigest(c.id);
      if (r.sent) sent++;
      logger.info({ consultancy: c.name, to: r.to.length, sent: r.sent }, '[digest] enviado');
    } catch (e) {
      logger.error({ consultancy: c.name, err: (e as Error).message }, '[digest] falha');
    }
  }
  return sent;
}
