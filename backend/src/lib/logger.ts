import pino from 'pino';

// Logger estruturado (JSON) — pronto para ingestão (Datadog/Loki) e Sentry.
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    // Nunca logar credenciais/segredos
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token', '*.api_secret'],
    remove: true,
  },
});
