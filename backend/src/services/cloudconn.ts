import prisma from '../lib/prisma';
import { encryptValue, decryptValue } from '../lib/crypto';

// Conectores SAP Cloud BYO (Ariba / SuccessFactors). Mesmo modelo do S/4: 1 chave por cliente,
// sync ao vivo via SAP Business Accelerator Hub (sandbox, header APIKey) ou tenant do cliente.

type Product = 'ARIBA' | 'SUCCESSFACTORS' | 'CONCUR' | 'FIELDGLASS' | 'CX' | 'COMMERCE' | 'APIM' | 'TPM';

const DEFAULTS: Record<Product, { base: string; probes: { apiName: string; path: string; count: boolean }[] }> = {
  SUCCESSFACTORS: {
    base: 'https://sandbox.api.sap.com/successfactors',
    probes: [
      { apiName: 'SF_User', path: '/odata/v2/User', count: true },
      { apiName: 'SF_EmpJob', path: '/odata/v2/EmpJob', count: true },
      { apiName: 'SF_PerPersonal', path: '/odata/v2/PerPersonal', count: true },
    ],
  },
  ARIBA: {
    base: 'https://sandbox.api.sap.com/ariba',
    probes: [
      { apiName: 'Ariba_SupplierData', path: '/supplierdatapagination/v4/prod/suppliers', count: false },
      { apiName: 'Ariba_OperationalReporting', path: '/reporting/v4/prod/views', count: false },
    ],
  },
  CONCUR: {
    base: 'https://us.api.concursolutions.com',
    probes: [
      { apiName: 'Concur_Users', path: '/api/v3.0/common/users', count: false },
      { apiName: 'Concur_Reports', path: '/api/v3.0/expense/reports', count: false },
    ],
  },
  FIELDGLASS: {
    base: 'https://api.fieldglass.net',
    probes: [
      { apiName: 'FG_Workers', path: '/api/v1/connectors/workerData', count: false },
    ],
  },
  CX: {
    // SAP Sales/Service Cloud (Cloud for Customer) — OData v2 do tenant do cliente.
    base: 'https://my000000.crm.ondemand.com/sap/c4c/odata/v1/c4codataapi',
    probes: [
      { apiName: 'C4C_ServiceRequest', path: '/ServiceRequestCollection', count: true },
      { apiName: 'C4C_Account', path: '/AccountCollection', count: true },
    ],
  },
  COMMERCE: {
    // SAP Commerce Cloud — OCC API do tenant do cliente.
    base: 'https://api.commerce.cloud',
    probes: [
      { apiName: 'Commerce_Orders', path: '/occ/v2/electronics/orders', count: false },
    ],
  },
  APIM: {
    // SAP API Management (Integration Suite) — inventário de API proxies publicadas.
    base: 'https://sandbox.api.sap.com',
    probes: [
      { apiName: 'APIM_Proxies', path: '/apiportal/api/1.0/Management.svc/APIProxies', count: false },
    ],
  },
  TPM: {
    // Trading Partner Management (Integration Suite B2B/EDI) — acordos e parceiros comerciais.
    base: 'https://sandbox.api.sap.com',
    probes: [
      { apiName: 'TPM_TradingPartners', path: '/itspaces/api/1.0/tpm/tradingpartners', count: false },
      { apiName: 'TPM_Agreements', path: '/itspaces/api/1.0/tpm/agreements', count: false },
    ],
  },
};

export const PRODUCTS = Object.keys(DEFAULTS) as Product[];
export function isProduct(p: string): p is Product { return (PRODUCTS as string[]).includes(p); }
export function defaultBase(product: string) { return DEFAULTS[product as Product]?.base || ''; }

export async function listConnectors(consultancyId: string) {
  const clients = await prisma.client.findMany({ where: { consultancyId }, select: { id: true, name: true } });
  const conns = await prisma.cloudConnector.findMany({ where: { clientId: { in: clients.map((c) => c.id) } } });
  return clients.map((c) => ({
    clientId: c.id, client: c.name,
    connectors: PRODUCTS.map((p) => {
      const x = conns.find((k) => k.clientId === c.id && k.product === p);
      return { product: p, baseUrl: x?.baseUrl || DEFAULTS[p].base, status: x?.status || 'PENDING', hasKey: !!x?.apiKey, lastSyncAt: x?.lastSyncAt || null, lastResult: x?.lastResult || null };
    }),
  }));
}

export async function saveConnector(consultancyId: string, clientId: string, product: string, input: { baseUrl?: string; apiKey?: string }) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client || client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  if (!isProduct(product)) return { error: 'INVALID' as const };
  const ex = await prisma.cloudConnector.findUnique({ where: { clientId_product: { clientId, product } } });
  const apiKey = input.apiKey ? encryptValue(input.apiKey) : ex?.apiKey;
  if (!apiKey) return { error: 'NO_KEY' as const };
  const data = { baseUrl: (input.baseUrl || ex?.baseUrl || DEFAULTS[product as Product].base).replace(/\/$/, ''), apiKey, status: 'CONNECTED' };
  await prisma.cloudConnector.upsert({ where: { clientId_product: { clientId, product } }, update: data, create: { clientId, product, ...data } });
  return { ok: true };
}

export async function sync(consultancyId: string, clientId: string, product: string) {
  const conn = await prisma.cloudConnector.findUnique({ where: { clientId_product: { clientId, product } }, include: { client: true } });
  if (!conn || conn.client.consultancyId !== consultancyId) return { error: 'NOT_FOUND' as const };
  const apiKey = String(decryptValue(conn.apiKey) ?? '');
  if (!apiKey) return { error: 'NO_KEY' as const };
  const base = (conn.baseUrl || DEFAULTS[product as Product].base).replace(/\/$/, '');
  const cfg = DEFAULTS[product as Product];

  let reachable = 0;
  const results: { apiName: string; ok: boolean; count: number | null; httpStatus: number }[] = [];
  for (const p of cfg.probes) {
    const sep = p.count ? `?${encodeURIComponent('$top')}=1&${encodeURIComponent('$inlinecount')}=allpages&${encodeURIComponent('$format')}=json` : '';
    let ok = false, count: number | null = null, httpStatus = 0;
    try {
      const res = await fetch(`${base}${p.path}${sep}`, { headers: { APIKey: apiKey, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
      httpStatus = res.status;
      if (res.ok) {
        ok = true; reachable++;
        if (p.count) { const j = (await res.json()) as { d?: { __count?: string; results?: any[] } }; const c = j?.d?.__count; count = c != null && !isNaN(Number(c)) ? Number(c) : (j?.d?.results?.length ?? 0); }
      }
    } catch { /* inalcançável */ }
    results.push({ apiName: p.apiName, ok, count, httpStatus });
    // inventário unificado (aparece no Catálogo vivo junto com S/4)
    if (ok) {
      await prisma.apiUsage.upsert({
        where: { clientId_apiName_version: { clientId, apiName: p.apiName, version: 'v1' } },
        update: { scenario: product, calls30d: count ?? 0, deprecated: false, lastSeenAt: new Date() },
        create: { clientId, apiName: p.apiName, version: 'v1', scenario: product, calls30d: count ?? 0, deprecated: false },
      });
    }
  }
  const status = reachable > 0 ? 'CONNECTED' : 'ERROR';
  await prisma.cloudConnector.update({ where: { clientId_product: { clientId, product } }, data: { status, lastSyncAt: new Date(), lastResult: { reachable, total: cfg.probes.length, results } } });
  return { ok: true, status, reachable, total: cfg.probes.length, results };
}
