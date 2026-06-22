import tls from 'node:tls';
import prisma from '../lib/prisma';
import { logger } from '../lib/logger';
import { decryptConfig } from '../lib/crypto';
import { probeUrl } from './connectors';

type Cfg = Record<string, string>;

const DAY_MS = 24 * 60 * 60 * 1000;
export const WARN_DAYS = 30;
export const CRITICAL_DAYS = 7;

export type ValiditySeverity = 'EXPIRED' | 'CRITICAL' | 'WARN' | 'OK';

export function severityFor(daysLeft: number): ValiditySeverity {
  if (daysLeft < 0) return 'EXPIRED';
  if (daysLeft <= CRITICAL_DAYS) return 'CRITICAL';
  if (daysLeft <= WARN_DAYS) return 'WARN';
  return 'OK';
}

function daysUntil(date: Date): number {
  return Math.floor((date.getTime() - Date.now()) / DAY_MS);
}

/** Extrai host (e porta) HTTPS de uma integração monitorável, ou null. */
export function httpsHost(type: string | null, config: Cfg): { host: string; port: number } | null {
  const url = probeUrl(type, config);
  if (!url || !url.startsWith('https://')) return null;
  try {
    const u = new URL(url);
    return { host: u.hostname, port: u.port ? Number(u.port) : 443 };
  } catch {
    return null;
  }
}

export interface CertInfo {
  validTo: Date;
  subject: string | null;
  issuer: string | null;
}

/** Lê o certificado TLS do host (handshake real) e retorna o notAfter. */
export function probeCert(host: string, port = 443, timeoutMs = 8000): Promise<CertInfo | null> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v: CertInfo | null) => { if (!done) { done = true; try { socket.destroy(); } catch { /* noop */ } resolve(v); } };
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: false, timeout: timeoutMs }, () => {
      const cert = socket.getPeerCertificate();
      if (!cert || !cert.valid_to) return finish(null);
      const validTo = new Date(cert.valid_to);
      if (isNaN(validTo.getTime())) return finish(null);
      finish({
        validTo,
        subject: cert.subject?.CN || null,
        issuer: cert.issuer?.O || cert.issuer?.CN || null,
      });
    });
    socket.on('error', () => finish(null));
    socket.on('timeout', () => finish(null));
  });
}

/** Reavalia o cert TLS de UMA integração e persiste o resultado. */
export async function refreshCert(integrationId: string): Promise<CertInfo | null> {
  const integration = await prisma.integration.findUnique({ where: { id: integrationId } });
  if (!integration) return null;
  const config = (decryptConfig(integration.config) || {}) as Cfg;
  const target = httpsHost(integration.type, config);
  if (!target) return null;

  const info = await probeCert(target.host, target.port);
  await prisma.integration.update({
    where: { id: integrationId },
    data: {
      certCheckedAt: new Date(),
      certHost: target.host,
      certExpiresAt: info?.validTo ?? null,
    },
  });
  return info;
}

/** Reavalia o cert das integrações HTTPS e abre/atualiza alertas de expiração.
 *  Sem consultancyId, varre todas (scheduler). Com, restringe à consultoria (ação do admin). */
export async function refreshAllCerts(consultancyId?: string): Promise<{ checked: number; expiring: number }> {
  const list = await prisma.integration.findMany(
    consultancyId ? { where: { client: { consultancyId } } } : undefined
  );
  let checked = 0;
  let expiring = 0;
  for (const integ of list) {
    const config = (decryptConfig(integ.config) || {}) as Cfg;
    if (!httpsHost(integ.type, config)) continue;
    const info = await refreshCert(integ.id);
    checked++;
    if (info) {
      const d = daysUntil(info.validTo);
      if (d <= WARN_DAYS) {
        expiring++;
        await upsertExpiryAlert(integ.id, integ.clientId, integ.name, 'certificado TLS', d);
      }
    }
  }
  return { checked, expiring };
}

/** Cria um alerta de expiração (idempotente por integração+tipo, enquanto não resolvido). */
async function upsertExpiryAlert(integrationId: string, clientId: string, name: string, kind: string, daysLeft: number) {
  const severity = daysLeft < 0 ? 'CRITICAL' : daysLeft <= CRITICAL_DAYS ? 'HIGH' : 'MEDIUM';
  const message = daysLeft < 0
    ? `${kind} de "${name}" EXPIROU há ${Math.abs(daysLeft)} dia(s).`
    : `${kind} de "${name}" expira em ${daysLeft} dia(s).`;

  const existing = await prisma.alert.findFirst({
    where: { integrationId, type: 'VALIDITY', resolved: false },
  });
  if (existing) {
    await prisma.alert.update({ where: { id: existing.id }, data: { severity, message } });
  } else {
    await prisma.alert.create({
      data: { type: 'VALIDITY', severity, message, clientId, integrationId },
    });
  }
}

export interface ValidityItem {
  integrationId: string;
  integration: string;
  client: string;
  type: string;
  kind: 'CERT' | 'SECRET';
  label: string;
  expiresAt: string;
  daysLeft: number;
  severity: ValiditySeverity;
  host?: string | null;
  checkedAt?: string | null;
}

/** Monta o radar de validade da consultoria (cert + segredos), ordenado por urgência. */
export async function scanValidity(consultancyId: string, env?: string): Promise<ValidityItem[]> {
  const integrations = await prisma.integration.findMany({
    where: { client: { consultancyId }, ...(env ? { environment: env } : {}) },
    select: {
      id: true, name: true, type: true, certExpiresAt: true, certCheckedAt: true, certHost: true,
      secretExpiresAt: true, secretLabel: true, client: { select: { name: true } },
    },
  });

  const items: ValidityItem[] = [];
  for (const i of integrations) {
    if (i.certExpiresAt) {
      const daysLeft = daysUntil(i.certExpiresAt);
      items.push({
        integrationId: i.id, integration: i.name, client: i.client?.name || '-', type: i.type,
        kind: 'CERT', label: 'Certificado TLS', expiresAt: i.certExpiresAt.toISOString(),
        daysLeft, severity: severityFor(daysLeft), host: i.certHost, checkedAt: i.certCheckedAt?.toISOString() ?? null,
      });
    }
    if (i.secretExpiresAt) {
      const daysLeft = daysUntil(i.secretExpiresAt);
      items.push({
        integrationId: i.id, integration: i.name, client: i.client?.name || '-', type: i.type,
        kind: 'SECRET', label: i.secretLabel || 'Segredo / credencial', expiresAt: i.secretExpiresAt.toISOString(),
        daysLeft, severity: severityFor(daysLeft),
      });
    }
  }
  return items.sort((a, b) => a.daysLeft - b.daysLeft);
}

logger.debug('validity service carregado');
