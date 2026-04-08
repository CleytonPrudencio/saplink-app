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
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  consultancyName: string;
}) {
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

export async function getPresets() {
  const { data } = await api.get('/diagnostics/presets');
  return data;
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
