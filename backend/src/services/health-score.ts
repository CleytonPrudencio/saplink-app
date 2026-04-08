interface IntegrationData {
  status: string;
  latency: number;
  errorRate: number;
  uptime: number;
}

interface ClientData {
  integrations: IntegrationData[];
}

interface HealthBreakdown {
  availability: number;
  performance: number;
  errors: number;
  compliance: number;
}

interface HealthResult {
  score: number;
  breakdown: HealthBreakdown;
}

export function calculateHealthScore(client: ClientData): HealthResult {
  const integrations = client.integrations;

  if (integrations.length === 0) {
    return {
      score: 0,
      breakdown: { availability: 0, performance: 0, errors: 0, compliance: 0 },
    };
  }

  // Availability (30%): based on uptime of integrations
  const avgUptime = integrations.reduce((sum, i) => sum + i.uptime, 0) / integrations.length;
  const availability = Math.min(100, avgUptime);

  // Performance (25%): based on latency (lower is better, 0-500ms scale)
  const avgLatency = integrations.reduce((sum, i) => sum + i.latency, 0) / integrations.length;
  const performance = Math.max(0, Math.min(100, 100 - (avgLatency / 500) * 100));

  // Errors (25%): based on error rate (lower is better, 0-10% scale)
  const avgErrorRate = integrations.reduce((sum, i) => sum + i.errorRate, 0) / integrations.length;
  const errors = Math.max(0, Math.min(100, 100 - (avgErrorRate / 10) * 100));

  // Compliance (20%): based on active vs inactive integrations
  const activeCount = integrations.filter((i) => i.status === 'ACTIVE').length;
  const compliance = (activeCount / integrations.length) * 100;

  const score = Math.round(
    availability * 0.3 + performance * 0.25 + errors * 0.25 + compliance * 0.2
  );

  return {
    score,
    breakdown: {
      availability: Math.round(availability),
      performance: Math.round(performance),
      errors: Math.round(errors),
      compliance: Math.round(compliance),
    },
  };
}
