// A3 — SAP Notes sugeridas no diagnóstico.
// Mapeia o sintoma da integração para a ÁREA/COMPONENTE SAP, transações e uma busca
// oficial pronta. NUNCA fabrica número de Note (isso seria perigoso): entrega o caminho
// para o consultor achar a Note/KBA real no SAP ONE Support Launchpad.

export interface SapNoteHint {
  area: string;            // área legível, ex.: "IDoc / ALE"
  component: string;       // componente SAP, ex.: "BC-MID-ALE"
  why: string;             // por que é relevante
  transactions: string[];  // transações SAP úteis
  searchTerms: string;     // termos de busca sugeridos
  searchUrl: string;       // busca escopada no suporte SAP (clicável)
}

const NOTES_APP_URL = 'https://launchpad.support.sap.com/#/notes';

function searchUrl(terms: string): string {
  // Busca escopada no domínio oficial de suporte — funciona sem login e leva às Notes/KBAs reais.
  return `https://www.google.com/search?q=${encodeURIComponent(`SAP Note ${terms} site:support.sap.com`)}`;
}

function card(area: string, component: string, why: string, transactions: string[], searchTerms: string): SapNoteHint {
  return { area, component, why, transactions, searchTerms, searchUrl: searchUrl(searchTerms) };
}

export interface NotesContext {
  type?: string | null;
  status?: string | null;
  httpStatus?: number | null;
  isAgent?: boolean;
  problem?: string;
  highLatency?: boolean;
}

/** Sugere áreas/Notes SAP relevantes para o sintoma. Vazio quando não há problema claro. */
export function suggestSapNotes(ctx: NotesContext): SapNoteHint[] {
  const problem = (ctx.problem || '').toLowerCase();
  if (problem.startsWith('nenhum problema') || problem.startsWith('recuperação')) return [];

  const type = (ctx.type || '').toUpperCase();
  const out: SapNoteHint[] = [];

  // ── Integrações RFC/IDoc via Agente on-premise ──
  if (ctx.isAgent || type === 'IDOC' || type === 'RFC') {
    if (type === 'IDOC' || /idoc/.test(problem)) {
      out.push(card(
        'IDoc / ALE', 'BC-MID-ALE',
        'IDocs em erro (status 51/56/64) ou parados na fila exigem reprocessamento e análise da causa no parceiro/segmento.',
        ['BD87', 'WE02', 'WE05', 'WE19', 'BD20'],
        'IDoc status 51 reprocessing error',
      ));
    }
    out.push(card(
      'tRFC / qRFC', 'BC-MID-RFC',
      'Falhas de RFC costumam travar tRFC (SM58) ou filas qRFC (SMQ1/SMQ2). Verifique LUWs presas e destino RFC.',
      ['SM58', 'SMQ1', 'SMQ2', 'SM59'],
      'tRFC SM58 outbound queue stuck error',
    ));
    if (out.length) return out.slice(0, 3);
  }

  // ── HTTP-based (OData/REST/SOAP/CPI) ──
  const code = ctx.httpStatus || 0;

  if (type === 'CPI' || /cpi|integration suite/.test(problem)) {
    out.push(card(
      'SAP Cloud Integration (CPI)', 'LOD-HCI-PI-RT',
      'Mensagem com falha no IFlow — analise o Message Processing Log e o status do artefato implantado.',
      ['Monitor de Mensagens (MPL)', 'Manage Integration Content'],
      'CPI message processing log failed iflow',
    ));
  }

  if (code === 401 || code === 403) {
    out.push(card(
      'Autenticação / Segurança', 'BC-SEC',
      `O serviço recusou a chamada (HTTP ${code}). Causa típica: credencial/OAuth/SNC/certificado inválido ou expirado, ou falta de autorização (S_SERVICE).`,
      ['STRUST', 'SU53', '/IWFND/ERROR_LOG', 'OA2C_CONFIG'],
      `OData ${code} unauthorized authentication gateway`,
    ));
  } else if (code === 404 || code === 400) {
    out.push(card(
      'SAP Gateway / OData', 'OPU-GW-COR',
      `Recurso não encontrado (HTTP ${code}): serviço não publicado/ativado ou EntitySet incorreto. Verifique a publicação e o $metadata.`,
      ['/IWFND/MAINT_SERVICE', '/IWFND/GW_CLIENT', '/IWFND/ERROR_LOG'],
      `OData service ${code} not found maint_service activate`,
    ));
  } else if (code >= 500) {
    out.push(card(
      'SAP Gateway / Runtime', 'OPU-GW',
      `Erro do lado SAP (HTTP ${code}). Analise o log de erros do Gateway e dumps ABAP correlatos.`,
      ['/IWFND/ERROR_LOG', 'ST22', 'SM21', 'SICF'],
      `SAP Gateway ${code} internal server error /IWFND/ERROR_LOG`,
    ));
  } else if (/não respondeu|offline|timeout|endpoint/.test(problem) || (ctx.status || '').toUpperCase() === 'OFFLINE') {
    out.push(card(
      'Conectividade / ICF', 'BC-CST',
      'Sem resposta do endpoint: serviço ICF inativo (SICF), firewall/VPN, ou host/porta incorretos.',
      ['SICF', 'SMICM', 'STRUST'],
      'SICF service inactive ICF node activate connectivity',
    ));
  }

  if (ctx.highLatency) {
    out.push(card(
      'Performance', 'BC-CCM-MON',
      'Latência alta pode indicar gargalo de banco/ABAP no serviço. Avalie traces de SQL e runtime.',
      ['ST05', 'SAT', 'STAD', 'ST03N'],
      'OData performance slow latency trace ST05',
    ));
  }

  return out.slice(0, 3);
}

export { NOTES_APP_URL };
