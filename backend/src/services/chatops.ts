import crypto from 'node:crypto';
import prisma from '../lib/prisma';
import { parseIntent } from './ai';
import { getCloud } from './cloud';
import { createAction } from './remediation';

// ChatOps: operar o SAP por mensagem (WhatsApp/Telegram/console), com aprovação.
// Comandos destrutivos NÃO executam direto — criam pedido PENDING_APPROVAL.

export async function getConfig(consultancyId: string) {
  const c = await prisma.chatOpsConfig.findUnique({ where: { consultancyId } });
  return c ? { enabled: c.enabled, channel: c.channel, hasToken: true, token: c.token } : { enabled: false, hasToken: false };
}

export async function rotateToken(consultancyId: string, channel?: string) {
  const token = 'cops_' + crypto.randomBytes(18).toString('base64url');
  await prisma.chatOpsConfig.upsert({
    where: { consultancyId },
    update: { token, enabled: true, channel: channel ?? 'generic' },
    create: { consultancyId, token, enabled: true, channel: channel ?? 'generic' },
  });
  return { token };
}

export async function resolveByToken(token: string) {
  const c = await prisma.chatOpsConfig.findUnique({ where: { token } });
  return c && c.enabled ? c.consultancyId : null;
}

interface Intent { action: string; clientName?: string; filter?: string }

function keywordIntent(text: string): Intent {
  const t = text.toLowerCase();
  const m = /(cliente|client)\s+([a-zà-ú0-9 ]{2,40})/i.exec(text);
  const clientName = m ? m[2].trim() : undefined;
  if (/reprocess|corrig|remedi|destrav|retry/.test(t)) return { action: 'request_remediation', clientName };
  if (/falh|erro|quebr|down|offline|fail/.test(t)) return { action: 'list_failures', clientName };
  if (/sa[uú]de|health|status/.test(t) && clientName) return { action: 'client_health', clientName };
  if (/resumo|carteira|geral|panorama/.test(t)) return { action: 'portfolio_summary' };
  return { action: 'unknown' };
}

async function findClient(consultancyId: string, name?: string) {
  if (!name) return null;
  return prisma.client.findFirst({ where: { consultancyId, name: { contains: name.trim(), mode: 'insensitive' } } });
}

/** Processa um comando e devolve a resposta em texto (pronta pra mandar no chat). */
export async function run(consultancyId: string, text: string, userId?: string): Promise<{ reply: string; action: string }> {
  if (!text?.trim()) return { reply: 'Manda um comando. Ex.: "o que está falhando?" ou "saúde do cliente Agro".', action: 'unknown' };

  const clients = await prisma.client.findMany({ where: { consultancyId }, select: { name: true } });
  let intent: Intent;
  try {
    const raw = await parseIntent(text, clients.map((c) => c.name));
    const json = raw.replace(/```json?|```/g, '').trim();
    intent = JSON.parse(json);
    if (!intent?.action) throw new Error('no action');
  } catch {
    intent = keywordIntent(text);
  }

  if (intent.action === 'list_failures') {
    const cloud = await getCloud(consultancyId, { status: 'FAILED' });
    const top = cloud.items.slice(0, 5);
    if (!cloud.summary.failed) return { reply: '✅ Nenhuma integração com falha agora. Tudo verde.', action: intent.action };
    const lines = top.map((i) => `• ${i.source} · ${i.artifact}${i.error ? ` — ${String(i.error).slice(0, 60)}` : ''}`);
    return { reply: `⚠️ ${cloud.summary.failed} mensagem(ns) com falha:\n${lines.join('\n')}${cloud.summary.failed > 5 ? `\n…e mais ${cloud.summary.failed - 5}.` : ''}`, action: intent.action };
  }

  if (intent.action === 'client_health') {
    const c = await findClient(consultancyId, intent.clientName);
    if (!c) return { reply: `Não achei o cliente "${intent.clientName || ''}". Tente o nome exato.`, action: intent.action };
    const open = await prisma.alert.count({ where: { clientId: c.id, resolved: false } });
    return { reply: `🏥 ${c.name}: health ${c.healthScore}/100 · ${open} alerta(s) aberto(s).`, action: intent.action };
  }

  if (intent.action === 'request_remediation') {
    const c = await findClient(consultancyId, intent.clientName);
    if (!c) return { reply: `Para qual cliente? Não identifiquei o nome.`, action: intent.action };
    const items = await prisma.sapItem.findMany({ where: { clientId: c.id, resolved: false, remediable: true }, take: 20 });
    if (!items.length) return { reply: `Nada remediável em aberto para ${c.name} agora.`, action: intent.action };
    let created = 0;
    for (const it of items) { const r = await createAction(consultancyId, userId, it.id); if (r.action && !r.duplicate) created++; }
    return { reply: `📝 Criei ${created} pedido(s) de correção para ${c.name}. Aprove no painel (Remediação) para o agente executar.`, action: intent.action };
  }

  if (intent.action === 'portfolio_summary') {
    const clientIds = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
    const [nClients, openAlerts, failed] = await Promise.all([
      clientIds.length,
      prisma.alert.count({ where: { clientId: { in: clientIds }, resolved: false } }),
      prisma.cloudItem.count({ where: { clientId: { in: clientIds }, resolved: false } }),
    ]);
    return { reply: `📊 Carteira: ${nClients} cliente(s) · ${openAlerts} alerta(s) aberto(s) · ${failed} mensagem(ns) com falha.`, action: intent.action };
  }

  return { reply: 'Comandos: "o que está falhando?", "saúde do cliente X", "reprocessa os itens do cliente X", "resumo da carteira".', action: 'unknown' };
}
