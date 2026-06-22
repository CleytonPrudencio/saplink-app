import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import prisma from '../lib/prisma';
import { encryptValue, decryptValue } from '../lib/crypto';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';

// SSO OIDC BYO. Fluxo authorization code: start -> IdP -> callback -> nosso JWT.
// Validação via userinfo (token vem do token_endpoint sobre TLS com nosso client_secret).

const FRONTEND = (process.env.FRONTEND_URL || 'https://saplink.com.br').replace(/\/$/, '');
const REDIRECT_URI = `${FRONTEND}/api/auth/sso/callback`;

export function redirectUri() { return REDIRECT_URI; }

async function discovery(issuer: string) {
  const url = `${issuer.replace(/\/$/, '')}/.well-known/openid-configuration`;
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`discovery ${r.status}`);
  return (await r.json()) as { authorization_endpoint: string; token_endpoint: string; userinfo_endpoint: string };
}

export async function getConfig(consultancyId: string) {
  const c = await prisma.ssoConfig.findUnique({ where: { consultancyId } });
  return {
    provider: c?.provider || 'azure', enabled: c?.enabled || false,
    clientId: c?.clientId || '', issuer: c?.issuer || '', emailDomain: c?.emailDomain || '',
    hasSecret: !!c?.clientSecret, redirectUri: REDIRECT_URI,
  };
}

export async function saveConfig(consultancyId: string, input: { provider?: string; enabled?: boolean; clientId?: string; clientSecret?: string; issuer?: string; emailDomain?: string }) {
  const ex = await prisma.ssoConfig.findUnique({ where: { consultancyId } });
  const secret = input.clientSecret ? encryptValue(input.clientSecret) : ex?.clientSecret;
  if (!input.clientId || !input.issuer) return { error: 'INVALID' as const };
  if (!secret) return { error: 'NO_SECRET' as const };
  const data = { provider: input.provider || 'azure', enabled: input.enabled ?? false, clientId: input.clientId, clientSecret: secret, issuer: input.issuer.replace(/\/$/, ''), emailDomain: input.emailDomain?.toLowerCase().trim() || null };
  await prisma.ssoConfig.upsert({ where: { consultancyId }, update: data, create: { consultancyId, ...data } });
  return { ok: true };
}

/** Login page: encontra SSO habilitado pelo domínio do e-mail. */
export async function providerForEmail(email: string) {
  const domain = (email.split('@')[1] || '').toLowerCase().trim();
  if (!domain) return null;
  const c = await prisma.ssoConfig.findFirst({ where: { emailDomain: domain, enabled: true } });
  return c ? { consultancyId: c.consultancyId, provider: c.provider } : null;
}

export async function startUrl(consultancyId: string): Promise<{ error: 'NOT_FOUND' } | { url: string }> {
  const c = await prisma.ssoConfig.findUnique({ where: { consultancyId } });
  if (!c || !c.enabled) return { error: 'NOT_FOUND' };
  const disc = await discovery(c.issuer);
  const state = jwt.sign({ cid: consultancyId, n: crypto.randomBytes(8).toString('hex') }, JWT_SECRET, { expiresIn: '10m' });
  const u = new URL(disc.authorization_endpoint);
  u.searchParams.set('client_id', c.clientId);
  u.searchParams.set('redirect_uri', REDIRECT_URI);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', 'openid email profile');
  u.searchParams.set('state', state);
  return { url: u.toString() };
}

export async function handleCallback(code: string, state: string): Promise<{ error: string } | { token: string; redirect: string }> {
  let cid: string;
  try { cid = (jwt.verify(state, JWT_SECRET) as { cid: string }).cid; } catch { return { error: 'state inválido/expirado' }; }
  const c = await prisma.ssoConfig.findUnique({ where: { consultancyId: cid } });
  if (!c) return { error: 'config não encontrada' };
  const disc = await discovery(c.issuer);
  const secret = String(decryptValue(c.clientSecret) ?? '');
  const body = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, client_id: c.clientId, client_secret: secret });
  const tr = await fetch(disc.token_endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, signal: AbortSignal.timeout(10000) });
  if (!tr.ok) return { error: 'falha na troca do código' };
  const tok = (await tr.json()) as { access_token?: string };
  if (!tok.access_token) return { error: 'sem access_token' };
  const ur = await fetch(disc.userinfo_endpoint, { headers: { Authorization: `Bearer ${tok.access_token}` }, signal: AbortSignal.timeout(10000) });
  if (!ur.ok) return { error: 'falha ao obter o usuário' };
  const info = (await ur.json()) as { email?: string; preferred_username?: string };
  const email = (info.email || info.preferred_username || '').toLowerCase();
  if (!email) return { error: 'IdP não retornou e-mail' };
  const user = await prisma.user.findFirst({ where: { email, consultancyId: cid } });
  if (!user) return { error: `usuário ${email} não cadastrado nesta conta` };
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role, consultancyId: user.consultancyId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  return { token, redirect: `${FRONTEND}/login?ssoToken=${encodeURIComponent(token)}` };
}
