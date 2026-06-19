import prisma from '../lib/prisma';

// Auditoria/Compliance autônoma: trilha unificada de mudanças (transports) e ações de
// remediação (quem pediu/aprovou), com checagem de segregação de função (SoD).

export async function auditLedger(consultancyId: string) {
  const ids = (await prisma.client.findMany({ where: { consultancyId }, select: { id: true } })).map((c) => c.id);
  const names = new Map((await prisma.client.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })).map((c) => [c.id, c.name]));

  const [transports, actions, users] = await Promise.all([
    prisma.transport.findMany({ where: { clientId: { in: ids } }, orderBy: { importedAt: 'desc' }, take: 100 }),
    prisma.remediationAction.findMany({ where: { clientId: { in: ids } }, orderBy: { requestedAt: 'desc' }, take: 100 }),
    prisma.user.findMany({ where: { consultancyId }, select: { id: true, name: true } }),
  ]);
  const uname = new Map(users.map((u) => [u.id, u.name]));

  const ledger: { at: Date | null; kind: string; who: string; what: string; client?: string; flag?: string }[] = [];
  for (const t of transports) ledger.push({ at: t.importedAt, kind: 'MUDANÇA (STMS)', who: t.owner || '—', what: `${t.trNumber}${t.description ? ` — ${t.description}` : ''} → ${t.target || '?'}`, client: names.get(t.clientId) });

  let sod = 0;
  for (const a of actions) {
    const req = a.requestedById ? uname.get(a.requestedById) : (a.autoExecuted ? 'AMS (auto)' : '—');
    const apr = a.approvedById ? uname.get(a.approvedById) : (a.autoExecuted ? 'AMS (auto)' : '—');
    const violation = a.requestedById && a.approvedById && a.requestedById === a.approvedById;
    if (violation) sod++;
    ledger.push({
      at: a.requestedAt, kind: 'REMEDIAÇÃO', who: `${req} → aprov: ${apr}`,
      what: `${a.actionType} em ${a.target} (${a.status})`, client: names.get(a.clientId),
      flag: violation ? 'SoD: mesma pessoa pediu e aprovou' : undefined,
    });
  }
  ledger.sort((a, b) => (b.at?.getTime() || 0) - (a.at?.getTime() || 0));

  return {
    summary: { changes: transports.length, remediations: actions.length, sodViolations: sod },
    ledger: ledger.slice(0, 120),
  };
}
