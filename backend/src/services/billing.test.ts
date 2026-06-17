import { describe, it, expect } from 'vitest';
import { decideAccess } from './billing';

const now = new Date('2026-06-16T12:00:00Z');
const past = new Date('2026-06-10T12:00:00Z');
const future = new Date('2026-06-20T12:00:00Z');

describe('decideAccess — corte de acesso por assinatura', () => {
  it('sem assinatura → cortado', () => {
    const r = decideAccess(null, now);
    expect(r.allowed).toBe(false);
    expect(r.status).toBe('NONE');
  });

  it('trial vigente → liberado', () => {
    const r = decideAccess({ status: 'TRIALING', trialEndsAt: future }, now);
    expect(r.allowed).toBe(true);
    expect(r.status).toBe('TRIALING');
  });

  it('trial expirado → cortado', () => {
    const r = decideAccess({ status: 'TRIALING', trialEndsAt: past }, now);
    expect(r.allowed).toBe(false);
  });

  it('ativa → liberado', () => {
    expect(decideAccess({ status: 'ACTIVE' }, now).allowed).toBe(true);
  });

  it('past_due dentro da carência → liberado', () => {
    const r = decideAccess({ status: 'PAST_DUE', graceUntil: future }, now);
    expect(r.allowed).toBe(true);
    expect(r.status).toBe('PAST_DUE');
  });

  it('past_due com carência expirada → cortado (suspenso)', () => {
    const r = decideAccess({ status: 'PAST_DUE', graceUntil: past }, now);
    expect(r.allowed).toBe(false);
    expect(r.status).toBe('SUSPENDED');
  });

  it('suspensa → cortado', () => {
    expect(decideAccess({ status: 'SUSPENDED' }, now).allowed).toBe(false);
  });

  it('cancelada → cortado', () => {
    const r = decideAccess({ status: 'CANCELED' }, now);
    expect(r.allowed).toBe(false);
    expect(r.status).toBe('CANCELED');
  });
});
