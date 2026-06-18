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
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
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

// Copiloto "Pergunte ao SAPLINK"
export async function askPortfolio(question: string) {
  const { data } = await api.post('/ask', { question });
  return data as { answer: string };
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

export async function cancelSubscription() {
  const { data } = await api.post('/billing/cancel');
  return data;
}

export async function updateAddons(payload: { extraIntegrations?: number; extraUsers?: number }) {
  const { data } = await api.post('/billing/addons', payload);
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

// Usuários do tenant
export async function getUsers() {
  const { data } = await api.get('/users');
  return data;
}

export async function createUser(payload: { name: string; email: string; role?: string }) {
  const { data } = await api.post('/users', payload);
  return data;
}

export async function deleteUser(id: string) {
  const { data } = await api.delete(`/users/${id}`);
  return data;
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
export async function getAllIntegrations() {
  const { data } = await api.get('/integrations/all');
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

export default api;
