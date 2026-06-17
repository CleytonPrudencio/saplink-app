import { logger } from '../lib/logger';

// Envio de e-mail via Resend (https://resend.com). Sem RESEND_API_KEY, cai em modo log
// (não quebra o fluxo em dev). FROM precisa ser de domínio verificado no Resend
// (em testes, use "SAPLINK <onboarding@resend.dev>").
const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'SAPLINK <onboarding@resend.dev>';
const APP_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

export function emailEnabled(): boolean {
  return !!API_KEY;
}

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  if (!API_KEY) {
    logger.warn({ to: opts.to, subject: opts.subject }, '[email] RESEND_API_KEY ausente — e-mail NÃO enviado (modo log)');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.error({ status: res.status, body }, '[email] falha no envio via Resend');
      return false;
    }
    logger.info({ to: opts.to, subject: opts.subject }, '[email] enviado');
    return true;
  } catch (e) {
    logger.error({ err: (e as Error).message }, '[email] erro ao enviar');
    return false;
  }
}

// ───────────────── Layout base ─────────────────
function layout(title: string, bodyHtml: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f0b1a;color:#e2e0ea;border-radius:16px;overflow:hidden;border:1px solid #2a2440">
    <div style="padding:20px 24px;border-bottom:1px solid #2a2440;font-size:18px;font-weight:700;color:#a78bfa">◆ SAPLINK</div>
    <div style="padding:24px">
      <h2 style="margin:0 0 12px;font-size:18px;color:#fff">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding:16px 24px;border-top:1px solid #2a2440;font-size:12px;color:#9b95ad">SAPLINK — monitoramento de integrações SAP</div>
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(90deg,#7c3aed,#06b6d4);color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;margin:8px 0">${label}</a>`;
}

// ───────────────── Templates ─────────────────
export function sendPasswordReset(to: string, token: string) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: 'Redefinição de senha — SAPLINK',
    html: layout('Redefinir sua senha', `
      <p style="color:#c9c5d6;line-height:1.6">Recebemos um pedido para redefinir sua senha. O link expira em 1 hora.</p>
      <p>${button(link, 'Redefinir senha')}</p>
      <p style="color:#9b95ad;font-size:13px">Se você não solicitou, ignore este e-mail. Sua senha continua a mesma.</p>`),
  });
}

export function sendUserInvite(to: string, name: string, tempPassword: string) {
  return sendEmail({
    to,
    subject: 'Seu acesso ao SAPLINK',
    html: layout(`Bem-vindo(a), ${name}`, `
      <p style="color:#c9c5d6;line-height:1.6">Uma conta foi criada para você no SAPLINK. Use a senha temporária abaixo e troque-a no primeiro acesso.</p>
      <p style="background:#1a1527;border:1px solid #2a2440;border-radius:10px;padding:12px;font-family:monospace;font-size:15px;color:#a78bfa">${tempPassword}</p>
      <p>${button(APP_URL + '/login', 'Acessar o SAPLINK')}</p>`),
  });
}

export function sendPaymentConfirmed(to: string, planName: string) {
  return sendEmail({
    to,
    subject: 'Pagamento confirmado — SAPLINK',
    html: layout('Pagamento confirmado', `
      <p style="color:#c9c5d6;line-height:1.6">Recebemos seu pagamento e o plano <b>${planName}</b> está ativo. Obrigado!</p>
      <p>${button(APP_URL + '/billing', 'Ver assinatura')}</p>`),
  });
}

export function sendPaymentOverdue(to: string) {
  return sendEmail({
    to,
    subject: 'Pagamento pendente — SAPLINK',
    html: layout('Pagamento pendente', `
      <p style="color:#c9c5d6;line-height:1.6">Seu pagamento está em atraso. Regularize para não perder o acesso ao SAPLINK.</p>
      <p>${button(APP_URL + '/billing', 'Regularizar agora')}</p>`),
  });
}
