import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ambiente global selecionado (DEV/HML/PRD); vazio = Todos
    const env = localStorage.getItem('slk_env');
    if (env) config.headers['x-environment'] = env;
    // Idioma do usuário (pt/en/es) — faz a IA responder no idioma certo
    const lang = localStorage.getItem('slk_lang');
    if (lang) config.headers['x-lang'] = lang;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Sliding session: o backend renova o token quando perto de expirar
    if (typeof window !== "undefined") {
      const fresh = response.headers?.["x-refresh-token"];
      if (fresh) localStorage.setItem("token", fresh);
    }
    return response;
  },
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // 403 (assinatura inativa / sem tenant): o gate no layout do dashboard cuida da UX
      // por papel (admin vê CTA de pagamento; usuário vê 'contate o admin'). Sem redirect aqui.
    }
    return Promise.reject(error);
  }
);

// Auth
export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(payload: Record<string, unknown>) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

// Clients
export async function getClients() {
  const { data } = await api.get('/clients');
  return data;
}

export async function getClient(id: string) {
  const { data } = await api.get(`/clients/${id}`);
  return data;
}

export async function createClient(payload: { name: string; cnpj?: string }) {
  const { data } = await api.post('/clients', payload);
  return data;
}

export async function updateClient(id: string, payload: { name?: string; cnpj?: string }) {
  const { data } = await api.put(`/clients/${id}`, payload);
  return data;
}

export async function deleteClient(id: string) {
  const { data } = await api.delete(`/clients/${id}`);
  return data;
}

// Billing
export async function getBilling() {
  const { data } = await api.get('/billing');
  return data;
}

export async function getPlans() {
  const { data } = await api.get('/billing/plans');
  return data;
}

// Catálogo público (landing page, sem auth)
export async function getPublicPlans() {
  const { data } = await api.get('/plans');
  return data;
}

// Lead / manifestação de interesse (cadastro fechado por enquanto)
export async function submitLead(payload: Record<string, unknown>) {
  const { data } = await api.post('/leads', payload);
  return data;
}
export async function getLeads(status?: string) {
  const { data } = await api.get('/leads', { params: status ? { status } : {} });
  return data as { leads: any[]; counts: Record<string, number> };
}
export async function updateLeadStatus(id: string, status: string) {
  const { data } = await api.patch(`/leads/${id}`, { status });
  return data;
}

// Copiloto "Pergunte ao SAPLINK"
export async function askPortfolio(question: string) {
  const { data } = await api.post('/ask', { question });
  return data as { answer: string };
}

// Copiloto com streaming de tokens (SSE). Cai pro askPortfolio quando lança.
// API_BASE é exportado mais abaixo; usamos a mesma const local.
const ASK_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
export async function askPortfolioStream(question: string, onToken: (t: string) => void): Promise<string> {
  const res = await fetch(`${ASK_API_BASE}/ask/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
      ...(localStorage.getItem('slk_env') ? { 'x-environment': localStorage.getItem('slk_env')! } : {}),
      ...(localStorage.getItem('slk_lang') ? { 'x-lang': localStorage.getItem('slk_lang')! } : {}),
    },
    body: JSON.stringify({ question }),
  });
  if (!res.ok || !res.body) throw new Error('stream falhou');
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', full = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, nl); buf = buf.slice(nl + 2);
      if (chunk.startsWith('event: done')) continue; // fim do stream
      // pega só "data: <json>"; ignora demais linhas de evento
      const line = chunk.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      try {
        const tok = JSON.parse(line.slice(6));
        if (typeof tok === 'string') { full += tok; onToken(tok); }
      } catch { /* ignora linhas que não são token */ }
    }
  }
  return full;
}

// Digest semanal por IA
export async function getDigestStatus() {
  const { data } = await api.get('/digest');
  return data as { weeklyDigest: boolean; lastDigestAt: string | null; emailEnabled: boolean; aiEnabled: boolean };
}

export async function toggleDigest(enabled: boolean) {
  const { data } = await api.post('/digest/toggle', { enabled });
  return data as { weeklyDigest: boolean };
}

export async function getDigestPreview() {
  const { data } = await api.get('/digest/preview');
  return data as { data: Record<string, unknown>; narrative: string };
}

export async function sendDigestNow() {
  const { data } = await api.post('/digest/send-now');
  return data as { sent: boolean; to: string[]; reason?: string };
}

export async function checkoutPlan(planKey: string, mode: 'auto' | 'now' = 'auto') {
  const { data } = await api.post('/billing/checkout', { planKey, mode });
  return data;
}

export async function payInvoice(invoiceId: string) {
  const { data } = await api.post(`/billing/invoices/${invoiceId}/pay`);
  return data;
}

export async function setAutoRenew(autoRenew: boolean) {
  const { data } = await api.post('/billing/autorenew', { autoRenew });
  return data;
}

export async function payNow() {
  const { data } = await api.post('/billing/pay-now');
  return data as { status: string; url?: string; message?: string };
}

export async function billingPortal() {
  const { data } = await api.post('/billing/portal');
  return data as { status: string; url?: string };
}

export async function cancelSubscription() {
  const { data } = await api.post('/billing/cancel');
  return data;
}

export async function updateAddons(payload: { extraIntegrations?: number; extraUsers?: number }) {
  const { data } = await api.post('/billing/addons', payload);
  return data;
}

// E1 — Previsão de falha
export interface Prediction {
  integrationId: string; integration: string; client: string; status: string;
  riskScore: number; level: "LOW" | "MEDIUM" | "HIGH"; forecast: string;
  signals: string[]; samples: number; errorRate: number; uptime: number; latency: number; queueDepth: number;
}
export async function getPredict() {
  const { data } = await api.get('/predict');
  return data as { predictions: Prediction[]; summary: { high: number; medium: number; low: number } };
}
// E2 — Benchmark cross-cliente
export interface BenchmarkRow {
  type: string; count: number; marketCount: number; myUptime: number; marketUptime: number; uptimePercentile: number;
  myErrorRate: number; marketErrorRate: number; myLatency: number; marketLatency: number;
}
export async function getBenchmark() {
  const { data } = await api.get('/predict/benchmark');
  return data as { rows: BenchmarkRow[]; marketTenants: number };
}

// F1/F2 — CPI / AIF
export interface CloudItem {
  id: string; source: string; artifact: string; messageId: string; direction?: string | null;
  status?: string | null; error?: string | null; occurredAt?: string | null; resolved: boolean;
  aiDiagnosis?: string | null; aiDiagnosedAt?: string | null; aiFix?: string | null;
}
export async function getCloud(filters: { source?: string; status?: string; q?: string; clientId?: string } = {}) {
  const params: Record<string, string> = {};
  for (const k of ["source", "status", "q", "clientId"] as const) if (filters[k]) params[k] = filters[k]!;
  const { data } = await api.get('/cloud', { params });
  return data as { items: CloudItem[]; summary: { total: number; failed: number; bySource: Record<string, number> } };
}
export async function diagnoseCloud(id: string, force = false) {
  const { data } = await api.post(`/cloud/${id}/diagnose`, null, { params: force ? { force: "1" } : {} });
  return data as { ok: boolean; diagnosis: string; diagnosedAt?: string | null; cached?: boolean };
}

// D1 — SLA por cliente
export interface SlaClient {
  clientId: string; client: string; uptimeTarget: number; maxLatencyMs: number;
  avgUptime: number; avgLatency: number; integrations: number; meeting: number; compliance: number;
  breaches: { name: string; type: string; uptime: number; latency: number; reason: string }[];
}
export async function getSla() {
  const { data } = await api.get('/sla');
  return data as { clients: SlaClient[]; overall: number };
}
export async function setSlaTargets(clientId: string, payload: { uptimeTarget?: number; maxLatencyMs?: number }) {
  const { data } = await api.put(`/sla/${clientId}`, payload);
  return data;
}
export async function getSlaReport(clientId: string) {
  const { data } = await api.get(`/sla/${clientId}/report`);
  return data as { data: SlaClient; narrative: string };
}

// D2 — Impacto em R$
export interface ImpactItem {
  integrationId: string; integration: string; client: string; status: string; businessProcess: string | null;
  costPerHourCents: number; atRisk: boolean; hoursDown: number; accumulatedCents: number;
}
export async function getImpact() {
  const { data } = await api.get('/sla/impact/all');
  return data as { items: ImpactItem[]; totals: { monitoredWithCost: number; atRisk: number; riskPerHourCents: number; accumulatedCents: number } };
}
export async function getImpactIntegrations() {
  const { data } = await api.get('/sla/impact/integrations');
  return data as { integrations: { id: string; name: string; type: string; client?: string; costPerHourCents: number; businessProcess: string | null }[] };
}
export async function setIntegrationCost(integrationId: string, payload: { costPerHourCents?: number; businessProcess?: string }) {
  const { data } = await api.put(`/sla/impact/${integrationId}`, payload);
  return data;
}

// D3 — Radar de transports
export async function getTransports(clientId?: string) {
  const { data } = await api.get('/transports', { params: clientId ? { clientId } : {} });
  return data as {
    transports: { id: string; trNumber: string; description?: string | null; owner?: string | null; status?: string | null; target?: string | null; importedAt?: string | null; client?: string }[];
    correlations: { alert: { id: string; severity: string; message: string; createdAt: string; client?: string }; suspects: { trNumber: string; description?: string | null; owner?: string | null; importedAt?: string | null; target?: string | null }[] }[];
    summary: { transports: number; openIncidents: number; correlated: number };
  };
}

// S/4HANA Cloud
export async function getS4Overview() { const { data } = await api.get('/s4/overview'); return data as Record<string, number>; }
export async function getS4Upgrade(clientId?: string) { const { data } = await api.get('/s4/upgrade', { params: clientId ? { clientId } : {} }); return data as { release: string; findings: any[]; summary: { total: number; byImpact: Record<string, number> } }; }
export async function getS4CleanCore() { const { data } = await api.get('/s4/cleancore'); return data as { overall: number; perClient: any[]; byCategory: Record<string, number>; items: any[] }; }
export async function getS4Apis() { const { data } = await api.get('/s4/apis'); return data as { items: any[]; summary: { total: number; deprecated: number } }; }
export async function getS4Comm() { const { data } = await api.get('/s4/comm'); return data as { items: any[]; summary: { total: number; errors: number; expiring: number } }; }
export async function getS4Events() { const { data } = await api.get('/s4/events'); return data as { items: any[]; summary: { total: number; byStatus: Record<string, number>; deadLetter: number } }; }
export async function getS4Fiscal(params: { clientId?: string; family?: string } = {}) { const { data } = await api.get('/s4/fiscal', { params }); return data as { items: any[]; summary: { total: number; byStatus: Record<string, number>; byFamily?: { family: string; count: number }[]; atRiskCents: number; blocked: number } }; }
export async function reprocessFiscal(id: string) { const { data } = await api.post(`/s4/fiscal/${id}/reprocess`); return data; }
export async function getS4Connections() { const { data } = await api.get('/s4/connections'); return data as { connections: any[] }; }
export async function saveS4Connection(clientId: string, payload: Record<string, unknown>) { const { data } = await api.put(`/s4/connections/${clientId}`, payload); return data; }
export async function syncS4Connection(clientId: string) { const { data } = await api.post(`/s4/connections/${clientId}/sync`); return data as { ok: boolean; probed: number; reachable: number; deprecated: number; results: { apiName: string; ok: boolean; count: number | null; deprecated: boolean }[] }; }
// Conector real CPI (Integration Suite)
export async function getCpiConfigs() { const { data } = await api.get('/s4/cpi'); return data as { configs: any[] }; }
export async function saveCpiConfig(clientId: string, payload: Record<string, unknown>) { const { data } = await api.put(`/s4/cpi/${clientId}`, payload); return data; }
export async function syncCpi(clientId: string) { const { data } = await api.post(`/s4/cpi/${clientId}/sync`); return data; }

// 🦄 Inovações
export async function getFederated() { const { data } = await api.get('/innovate/federated'); return data as { summary: { signatures: number; occurrences: number }; items: any[] }; }
export async function lookupFederated(source: string, message: string) { const { data } = await api.get('/innovate/federated/lookup', { params: { source, message } }); return data as { occurrences: number; clientsCount?: number; bestFix?: any; fixes?: any[]; sampleMessage?: string }; }
export async function getCausal(clientId?: string) { const { data } = await api.get('/innovate/causal', { params: clientId ? { clientId } : {} }); return data as { window: number; summary: { correlated: number }; items: any[] }; }
export async function getAutoheal() { const { data } = await api.get('/innovate/autoheal'); return data as { policy: { enabled: boolean; minConfidence: number; allowedActions: string[] }; scoreboard: any }; }
export async function saveAutohealPolicy(payload: { enabled?: boolean; minConfidence?: number; allowedActions?: string[] }) { const { data } = await api.put('/innovate/autoheal/policy', payload); return data as { policy: any }; }
export async function getMoneyGraph() { const { data } = await api.get('/innovate/money'); return data as { summary: { totalAtRiskCents: number; downtimeAtRiskCents: number; fiscalAtRiskCents: number; integrationsDown: number }; byProcess: any[]; nodes: any[] }; }
// Inovações v2
export async function fixCloud(id: string, force = false) { const { data } = await api.post(`/cloud/${id}/fix`, null, { params: force ? { force: "1" } : {} }); return data as { ok: boolean; fix: string; cached?: boolean }; }
export async function getReconProcesses() { const { data } = await api.get('/innovate/recon'); return data as { processes: any[] }; }
export async function saveReconProcess(payload: { clientId: string; name: string; stages: { label: string; source: string; artifact: string }[] }) { const { data } = await api.post('/innovate/recon', payload); return data; }
export async function deleteReconProcess(id: string) { const { data } = await api.delete(`/innovate/recon/${id}`); return data; }
export async function reconcile(id: string, h = 24) { const { data } = await api.get(`/innovate/recon/${id}`, { params: { h } }); return data as { ok: boolean; process: string; windowHours: number; stages: any[]; links: any[]; completion: number; biggestGap: any }; }
export async function getAnomalies() { const { data } = await api.get('/innovate/anomaly'); return data as { summary: { tracked: number; anomalies: number }; items: any[] }; }
export async function getChatops() { const { data } = await api.get('/innovate/chatops'); return data as { enabled: boolean; hasToken: boolean; token?: string; channel?: string }; }
export async function rotateChatopsToken(channel?: string) { const { data } = await api.post('/innovate/chatops/token', { channel }); return data as { token: string }; }
export async function runChatops(text: string) { const { data } = await api.post('/innovate/chatops/run', { text }); return data as { reply: string; action: string }; }
export async function explainScreen(screen: string, data: unknown) { const { data: r } = await api.post('/innovate/explain', { screen, data }); return r as { text: string }; }
// Inovações v3
export async function getPreflightList() { const { data } = await api.get('/innovate/preflight'); return data as { transports: any[] }; }
export async function getBlastRadius(id: string) { const { data } = await api.get(`/innovate/preflight/${id}`); return data as any; }
export async function getIncidents() { const { data } = await api.get('/innovate/timemachine'); return data as { incidents: any[] }; }
export async function getTimeline(id: string) { const { data } = await api.get(`/innovate/timemachine/${id}`); return data as any; }
export async function getAudit() { const { data } = await api.get('/innovate/audit'); return data as { summary: { changes: number; remediations: number; sodViolations: number }; ledger: any[] }; }
export async function getPartners() { const { data } = await api.get('/innovate/partners'); return data as { partners: any[]; summary: any; finops: { flows: any[]; summary: any } }; }
// IA BYO (config de provedores)
export async function getAiConfig() { const { data } = await api.get('/ai-config'); return data as any; }
export async function saveAiConfig(payload: Record<string, unknown>) { const { data } = await api.put('/ai-config', payload); return data as any; }
export async function testAiProvider(payload: { provider: string; key?: string; model?: string; endpoint?: string; deployment?: string }) { const { data } = await api.post('/ai-config/test', payload); return data as { ok: boolean; ms?: number; error?: string }; }
// Web Push (PWA)
export async function getVapidKey() { const { data } = await api.get('/push/vapid'); return data as { key: string }; }
export async function subscribePush(subscription: unknown) { const { data } = await api.post('/push/subscribe', { subscription }); return data as { ok: boolean }; }
// Marketplace de runbooks
export async function getMarketplace(params: { q?: string; category?: string } = {}) { const { data } = await api.get('/runbooks', { params }); return data as { runbooks: any[] }; }
export async function getMyRunbooks() { const { data } = await api.get('/runbooks/mine'); return data as { authored: any[]; installed: any[] }; }
export async function getRunbook(id: string) { const { data } = await api.get(`/runbooks/${id}`); return data as { ok: boolean; runbook: any }; }
export async function createRunbook(payload: Record<string, unknown>) { const { data } = await api.post('/runbooks', payload); return data; }
export async function updateRunbook(id: string, payload: Record<string, unknown>) { const { data } = await api.put(`/runbooks/${id}`, payload); return data; }
export async function publishRunbook(id: string, published: boolean) { const { data } = await api.post(`/runbooks/${id}/publish`, { published }); return data; }
export async function deleteRunbook(id: string) { const { data } = await api.delete(`/runbooks/${id}`); return data; }
export async function installRunbook(id: string) { const { data } = await api.post(`/runbooks/${id}/install`); return data; }
export async function uninstallRunbook(id: string) { const { data } = await api.delete(`/runbooks/${id}/install`); return data; }
export async function rateRunbook(id: string, rating: number) { const { data } = await api.post(`/runbooks/${id}/rate`, { rating }); return data; }
export async function recommendRunbooks(source: string, message: string) { const { data } = await api.get('/runbooks/recommend', { params: { source, message } }); return data as { runbooks: any[] }; }
// SSO (OIDC) BYO
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
export async function getSsoConfig() { const { data } = await api.get('/sso'); return data as { provider: string; enabled: boolean; clientId: string; issuer: string; emailDomain: string; hasSecret: boolean; redirectUri: string }; }
export async function saveSsoConfig(payload: Record<string, unknown>) { const { data } = await api.post('/sso', payload); return data; }
export async function ssoProviderForEmail(email: string) { const { data } = await api.get('/auth/sso/providers', { params: { email } }); return data as { provider: { consultancyId: string; provider: string } | null }; }
// Conectores SAP Cloud (Ariba / SuccessFactors)
export async function getConnectors() { const { data } = await api.get('/connectors'); return data as { clients: any[] }; }
export async function saveConnector(clientId: string, product: string, payload: Record<string, unknown>) { const { data } = await api.post(`/connectors/${clientId}/${product}`, payload); return data; }
export async function syncConnector(clientId: string, product: string) { const { data } = await api.post(`/connectors/${clientId}/${product}/sync`); return data; }
// BTP Cockpit
export async function getBtp(clientId?: string) { const { data } = await api.get('/btp', { params: clientId ? { clientId } : {} }); return data as { clients: any[]; summary: any; items: any[] }; }
export async function createBtp(payload: Record<string, unknown>) { const { data } = await api.post('/btp', payload); return data; }
export async function updateBtp(id: string, payload: Record<string, unknown>) { const { data } = await api.put(`/btp/${id}`, payload); return data; }
export async function deleteBtp(id: string) { const { data } = await api.delete(`/btp/${id}`); return data; }
// Basis & Operações
export async function getOps(params: { clientId?: string; category?: string } = {}) { const { data } = await api.get('/ops', { params }); return data as { clients: any[]; summary: any; items: any[] }; }
export async function resolveOps(id: string) { const { data } = await api.post(`/ops/${id}/resolve`); return data; }

// C1 — Canais de notificação / on-call
export interface NotificationChannel {
  id: string; type: string; name: string; target: string; minSeverity: string; level: number; enabled: boolean;
}
export async function getChannels() {
  const { data } = await api.get('/channels');
  return data as { channels: NotificationChannel[]; escalateAfterMin: number };
}
export async function createChannel(payload: { type: string; name: string; target: string; minSeverity?: string; level?: number }) {
  const { data } = await api.post('/channels', payload);
  return data;
}
export async function updateChannel(id: string, payload: Partial<NotificationChannel>) {
  const { data } = await api.put(`/channels/${id}`, payload);
  return data;
}
export async function deleteChannel(id: string) {
  const { data } = await api.delete(`/channels/${id}`);
  return data;
}
export async function testChannel(id: string) {
  const { data } = await api.post(`/channels/${id}/test`);
  return data as { ok: boolean };
}
export async function setEscalation(escalateAfterMin: number) {
  const { data } = await api.put('/channels/settings/escalation', { escalateAfterMin });
  return data;
}

// C2 — Ticket sync
export interface TicketConfigView {
  provider: string; baseUrl: string; authUser: string; projectKey?: string | null; minSeverity: string; enabled: boolean; hasToken: boolean;
}
export async function getTicketConfig() {
  const { data } = await api.get('/tickets/config');
  return data as { config: TicketConfigView | null };
}
export async function saveTicketConfig(payload: Record<string, unknown>) {
  const { data } = await api.put('/tickets/config', payload);
  return data;
}
export async function testTicketConfig() {
  const { data } = await api.post('/tickets/config/test');
  return data as { ok: boolean; key?: string; url?: string; reason?: string };
}
export async function getLinkedTickets() {
  const { data } = await api.get('/tickets/linked');
  return data as { alerts: { id: string; message: string; severity: string; ticketKey: string; ticketUrl: string; resolved: boolean; ticketClosedAt: string | null }[] };
}

// C3 — Portal do cliente final
export async function getPortalStatus(clientId: string) {
  const { data } = await api.get(`/clients/${clientId}/portal`);
  return data as { portalEnabled: boolean; url: string | null };
}
export async function enableClientPortal(clientId: string) {
  const { data } = await api.post(`/clients/${clientId}/portal/enable`);
  return data as { portalEnabled: boolean; token: string; url: string };
}
export async function disableClientPortal(clientId: string) {
  const { data } = await api.post(`/clients/${clientId}/portal/disable`);
  return data as { portalEnabled: boolean };
}
export async function regenerateClientPortal(clientId: string) {
  const { data } = await api.post(`/clients/${clientId}/portal/regenerate`);
  return data as { portalEnabled: boolean; token: string; url: string };
}
export async function getPortal(token: string) {
  const { data } = await api.get(`/portal/${token}`);
  return data;
}

// B1 — Cockpit de IDoc/filas
export interface SapItemView {
  id: string; kind: string; direction?: string | null; ref: string; messageType?: string | null;
  partner?: string | null; statusCode?: string | null; statusText?: string | null; depth: number;
  remediable: boolean; lastSeenAt: string; client?: string; clientId: string; integration?: string; integrationId?: string;
}
export interface CockpitData {
  items: SapItemView[];
  summary: { total: number; byKind: Record<string, number>; byStatus: Record<string, number>; byClient: Record<string, number>; queueDepth: number; remediable: number };
}

export async function getCockpit(filters: { clientId?: string; kind?: string; status?: string; q?: string } = {}) {
  const params: Record<string, string> = {};
  if (filters.clientId) params.clientId = filters.clientId;
  if (filters.kind) params.kind = filters.kind;
  if (filters.status) params.status = filters.status;
  if (filters.q) params.q = filters.q;
  const { data } = await api.get('/cockpit', { params });
  return data as CockpitData;
}

// B2 — Remediação autônoma
export interface RemediationAction {
  id: string; clientId: string; integrationId?: string | null; sapItemId?: string | null;
  actionType: string; target: string; status: string; resultText?: string | null;
  beforeText?: string | null; afterText?: string | null; requestedAt: string; executedAt?: string | null;
  sapItem?: { kind: string; ref: string } | null;
}

export async function requestRemediation(sapItemId: string, actionType?: string) {
  const { data } = await api.post('/remediation', { sapItemId, actionType });
  return data as { action: RemediationAction; duplicate: boolean };
}

export async function listRemediations(status?: string) {
  const { data } = await api.get('/remediation', { params: status ? { status } : {} });
  return data as { actions: RemediationAction[]; labels: Record<string, string> };
}

export async function approveRemediation(id: string, confirmProd = false) {
  const { data } = await api.post(`/remediation/${id}/approve`, { confirmProd });
  return data;
}

export async function rejectRemediation(id: string) {
  const { data } = await api.post(`/remediation/${id}/reject`);
  return data;
}

// B3 — Catálogo vivo de interfaces
export interface CatalogItem {
  id: string; kind: string; name: string; detail?: string | null; attributes?: Record<string, unknown> | null;
  active: boolean; lastSeenAt: string; client?: string; clientId: string; integration?: string;
}
export async function getCatalog(filters: { clientId?: string; kind?: string; q?: string } = {}) {
  const params: Record<string, string> = {};
  if (filters.clientId) params.clientId = filters.clientId;
  if (filters.kind) params.kind = filters.kind;
  if (filters.q) params.q = filters.q;
  const { data } = await api.get('/catalog', { params });
  return data as { items: CatalogItem[]; summary: { total: number; active: number; byKind: Record<string, number> } };
}

// A4 — Radar de validade
export interface ValidityItem {
  integrationId: string; integration: string; client: string; type: string;
  kind: "CERT" | "SECRET"; label: string; expiresAt: string; daysLeft: number;
  severity: "EXPIRED" | "CRITICAL" | "WARN" | "OK"; host?: string | null; checkedAt?: string | null;
}

export async function getValidityRadar() {
  const { data } = await api.get('/validity');
  return data as { items: ValidityItem[] };
}

export async function refreshCert(integrationId: string) {
  const { data } = await api.post(`/validity/${integrationId}/refresh`);
  return data;
}

export async function refreshAllCerts() {
  const { data } = await api.post('/validity/refresh-all');
  return data as { checked: number; expiring: number; items: ValidityItem[] };
}

export async function setSecretExpiry(integrationId: string, payload: { secretExpiresAt: string | null; secretLabel?: string }) {
  const { data } = await api.put(`/validity/${integrationId}/secret`, payload);
  return data;
}

// Plataforma (super-admin) — gerencia tenants
export async function getConsultancies() {
  const { data } = await api.get('/platform/consultancies');
  return data;
}

export async function suspendConsultancy(id: string) {
  const { data } = await api.post(`/platform/consultancies/${id}/suspend`);
  return data;
}

export async function activateConsultancy(id: string) {
  const { data } = await api.post(`/platform/consultancies/${id}/activate`);
  return data;
}

export async function getPlatformStats() {
  const { data } = await api.get('/platform/stats');
  return data;
}

export async function getConsultancyDetail(id: string) {
  const { data } = await api.get(`/platform/consultancies/${id}`);
  return data;
}

export async function getRevenue() {
  const { data } = await api.get('/platform/revenue');
  return data;
}

export async function platformResetPassword(userId: string) {
  const { data } = await api.post(`/platform/users/${userId}/reset-password`);
  return data;
}

export async function platformUpdateUser(userId: string, payload: { name?: string; role?: string; email?: string }) {
  const { data } = await api.put(`/platform/users/${userId}`, payload);
  return data;
}

export async function getPlatformClientDetail(id: string) {
  const { data } = await api.get(`/platform/clients/${id}`);
  return data;
}

export async function platformUpdateConsultancy(id: string, payload: { name?: string; cnpj?: string }) {
  const { data } = await api.put(`/platform/consultancies/${id}`, payload);
  return data;
}

// Consultancy / white-label
export async function getConsultancy() {
  const { data } = await api.get('/consultancy');
  return data;
}

export async function updateBranding(payload: { name?: string; logoUrl?: string | null; primaryColor?: string | null }) {
  const { data } = await api.put('/consultancy/branding', payload);
  return data;
}

// Usuários do tenant (gestão de perfis/escopo por cliente)
export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  allClients: boolean;
  clientIds: string[];
  createdAt: string;
}
export interface UserUpsertPayload {
  name?: string;
  email?: string;
  role?: string;
  allClients?: boolean;
  clientIds?: string[];
}
export async function getUsers() {
  const { data } = await api.get('/users');
  return data as TenantUser[];
}

export async function createUser(payload: UserUpsertPayload) {
  const { data } = await api.post('/users', payload);
  return data as TenantUser & { invited?: boolean; tempPassword?: string };
}

export async function updateUser(id: string, payload: UserUpsertPayload) {
  const { data } = await api.patch(`/users/${id}`, payload);
  return data as TenantUser;
}

export async function deleteUser(id: string) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
}

// Log de atividade (admin) + beacon de página
export interface ActivityItem {
  id: string;
  action: "view" | "create" | "edit" | "delete" | "other";
  method: string;
  path: string;
  detail?: string | null;
  status: number;
  userEmail?: string | null;
  userName?: string | null;
  createdAt: string;
}
export async function getActivity(
  params: { page?: number; pageSize?: number; action?: string; userId?: string; from?: string; to?: string } = {},
) {
  const query: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") query[k] = v;
  }
  const { data } = await api.get('/activity', { params: query });
  return data as { items: ActivityItem[]; total: number; page: number; pageSize: number; totalPages: number };
}
// Beacon de acesso a página — fire-and-forget, nunca relança
export async function logPageView(path: string, label?: string) {
  try {
    await api.post('/activity/page', { path, label });
  } catch {
    // silencioso de propósito: telemetria não pode quebrar a navegação
  }
}
export async function resetUserPassword(id: string) {
  const { data } = await api.post(`/users/${id}/reset-password`);
  return data as { reset: boolean; invited?: boolean; tempPassword?: string };
}

// Password reset
export async function forgotPassword(email: string) {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token: string, password: string) {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
}

// Integrations
export async function getIntegrations(clientId: string) {
  const { data } = await api.get(`/integrations/client/${clientId}`);
  return data;
}

// Alerts
export async function getAlerts(params?: Record<string, string>) {
  const { data } = await api.get('/alerts', { params });
  return data;
}

export async function getAlertStats() {
  const { data } = await api.get('/alerts/stats');
  return data;
}

export async function resolveAlert(id: string) {
  const { data } = await api.put(`/alerts/${id}/resolve`);
  return data;
}
export async function resolveAlertGroup(payload: { integrationId?: string | null; type?: string; message?: string }) {
  const { data } = await api.post('/alerts/resolve-group', payload);
  return data as { resolved: number };
}
export async function diagnoseAlert(id: string) {
  const { data } = await api.post(`/alerts/${id}/diagnose`);
  return data as { text: string };
}

export async function createAlert(payload: Record<string, unknown>) {
  const { data } = await api.post('/alerts', payload);
  return data;
}

// Diagnostics
export async function createDiagnostic(payload: {
  clientId: string;
  query: string;
  presetId?: string;
}) {
  const { data } = await api.post('/diagnostics', payload);
  return data;
}

export async function getDiagnosticHistory(clientId: string) {
  const { data } = await api.get(`/diagnostics/client/${clientId}`);
  return data;
}

export async function getDiagnostic(id: string) {
  const { data } = await api.get(`/diagnostics/${id}`);
  return data;
}

export async function getPresets() {
  const { data } = await api.get('/diagnostics/presets');
  return data;
}

// Integrations (all)
export async function getAllIntegrations(environment?: string) {
  const { data } = await api.get('/integrations/all', { params: environment ? { environment } : {} });
  return data;
}

export async function getIntegrationTypes() {
  const { data } = await api.get('/integrations/types');
  return data;
}

export async function createIntegration(payload: Record<string, unknown>) {
  const { data } = await api.post('/integrations', payload);
  return data;
}

export async function testIntegration(id: string) {
  const { data } = await api.post(`/integrations/${id}/test`);
  return data;
}

export async function deleteIntegration(id: string) {
  const { data } = await api.delete(`/integrations/${id}`);
  return data;
}

export async function syncIntegration(id: string) {
  const { data } = await api.post(`/integrations/${id}/sync`);
  return data;
}

export async function syncAllIntegrations() {
  const { data } = await api.post('/integrations/sync-all');
  return data;
}

export async function updateIntegration(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/integrations/${id}`, payload);
  return data;
}

export async function diagnoseIntegration(id: string) {
  const { data } = await api.post(`/integrations/${id}/diagnose`);
  return data;
}

export async function autoFixIntegration(id: string) {
  const { data } = await api.post(`/integrations/${id}/auto-fix`);
  return data;
}

export async function generateAgentToken(id: string) {
  const { data } = await api.post(`/integrations/${id}/agent-token`);
  return data as { token: string; hint: string; agentUrl: string };
}

// Dead Code
export async function getDeadCode(clientId: string) {
  const { data } = await api.get(`/dead-code/client/${clientId}`);
  return data;
}

export async function getDeadCodeStats(clientId: string) {
  const { data } = await api.get(`/dead-code/stats/${clientId}`);
  return data;
}

// Reform Readiness Radar — prontidão CBS/IBS
export async function getReform(clientId?: string) {
  const { data } = await api.get('/reform', { params: clientId ? { clientId } : {} });
  return data as {
    items: { id: string; area: string; areaLabel: string; title: string; status: string; phase?: string | null; detail?: string | null; client?: string; environment?: string }[];
    summary: { total: number; ok: number; risk: number; pending: number; readiness: number; byClient: { client: string; ok: number; total: number; readiness: number }[] };
  };
}

// Indirect Access / Licensing Radar
export async function getLicense(clientId?: string) {
  const { data } = await api.get('/license', { params: clientId ? { clientId } : {} });
  return data as {
    items: { id: string; metric: string; used: number; entitled: number; unit?: string | null; riskLevel: string; estCostBrl: number; detail?: string | null; client?: string; environment?: string; pct: number }[];
    summary: { total: number; atRisk: number; warn: number; totalExposure: number };
  };
}

// Status page white-label — ativar/desativar por cliente (admin)
export async function setStatusPage(clientId: string, enable: boolean) {
  const { data } = await api.post(`/status-admin/${clientId}`, { enable });
  return data as { enabled: boolean; token: string | null };
}

export default api;
