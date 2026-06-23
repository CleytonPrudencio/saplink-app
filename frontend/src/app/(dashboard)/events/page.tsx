"use client";

import { useEffect, useState } from "react";
import { getS4Events } from "@/lib/api";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { usePaginate, Pagination } from "@/components/Pagination";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

const ST: Record<string, string> = {
  DELIVERED: "bg-emerald-500/15 text-emerald-300", DEAD_LETTER: "bg-rose-500/15 text-rose-300",
  RETRY: "bg-amber-500/15 text-amber-300", PENDING: "bg-white/[0.06] text-[#9b95ad]",
};

const SHEET_T: Record<Lang, {
  fTopic: string; fStatus: string; fSubscriber: string; fLag: string; fClient: string;
  fWhen: string; fEventId: string; fPayload: string; fAttempts: string; fError: string;
  guideTitle: string; reprocess: string; deadLetterSteps: string[]; retrySteps: string[]; lagSteps: string[];
}> = {
  pt: {
    fTopic: "Tópico", fStatus: "Status", fSubscriber: "Assinante", fLag: "Lag", fClient: "Cliente",
    fWhen: "Quando", fEventId: "ID do evento", fPayload: "Payload", fAttempts: "Tentativas", fError: "Erro",
    guideTitle: "O que fazer",
    reprocess: "Reenfileirar evento",
    deadLetterSteps: [
      "Inspecione o payload e o erro para entender por que o assinante rejeitou o evento.",
      "Corrija o assinante ou o contrato do evento; reenfileire a partir da dead-letter queue.",
      "Confirme a entrega no monitor de subscriptions do Event Mesh.",
    ],
    retrySteps: [
      "Verifique se o assinante está disponível (health/endpoint).",
      "Acompanhe as tentativas — se estourar o limite, vai para dead-letter.",
      "Investigue o lag e a causa raiz da falha temporária.",
    ],
    lagSteps: [
      "Lag alto indica assinante lento ou fila acumulada.",
      "Verifique a capacidade do consumidor e escale se necessário.",
      "Monitore se o lag se estabiliza após a normalização do consumidor.",
    ],
  },
  en: {
    fTopic: "Topic", fStatus: "Status", fSubscriber: "Subscriber", fLag: "Lag", fClient: "Client",
    fWhen: "When", fEventId: "Event ID", fPayload: "Payload", fAttempts: "Attempts", fError: "Error",
    guideTitle: "What to do",
    reprocess: "Re-enqueue event",
    deadLetterSteps: [
      "Inspect the payload and error to understand why the subscriber rejected the event.",
      "Fix the subscriber or the event contract; re-enqueue from the dead-letter queue.",
      "Confirm delivery in the Event Mesh subscriptions monitor.",
    ],
    retrySteps: [
      "Check whether the subscriber is available (health/endpoint).",
      "Track the attempts — if it exceeds the limit it goes to dead-letter.",
      "Investigate the lag and root cause of the temporary failure.",
    ],
    lagSteps: [
      "High lag indicates a slow subscriber or a backed-up queue.",
      "Check consumer capacity and scale out if needed.",
      "Monitor whether the lag stabilizes after the consumer recovers.",
    ],
  },
  es: {
    fTopic: "Tópico", fStatus: "Status", fSubscriber: "Suscriptor", fLag: "Lag", fClient: "Cliente",
    fWhen: "Cuándo", fEventId: "ID del evento", fPayload: "Payload", fAttempts: "Intentos", fError: "Error",
    guideTitle: "Qué hacer",
    reprocess: "Reencolar evento",
    deadLetterSteps: [
      "Inspecciona el payload y el error para entender por qué el suscriptor rechazó el evento.",
      "Corrige el suscriptor o el contrato del evento; reencola desde la dead-letter queue.",
      "Confirma la entrega en el monitor de subscriptions del Event Mesh.",
    ],
    retrySteps: [
      "Verifica si el suscriptor está disponible (health/endpoint).",
      "Sigue los intentos — si supera el límite pasa a dead-letter.",
      "Investiga el lag y la causa raíz del fallo temporal.",
    ],
    lagSteps: [
      "Un lag alto indica un suscriptor lento o una cola acumulada.",
      "Verifica la capacidad del consumidor y escala si es necesario.",
      "Monitorea si el lag se estabiliza tras la recuperación del consumidor.",
    ],
  },
};

export default function EventsPage() {
  const { lang } = useLang();
  const t = T[lang];
  const st = SHEET_T[lang];
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<any>(null);
  useEffect(() => { getS4Events().then(setData).catch(() => {}).finally(() => setLoading(false)); }, []);
  const pag = usePaginate<any>(data?.items || [], 20);
  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  const s = data?.summary?.byStatus || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">📨 {t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <div className="mt-3"><ExplainData screen={t.explainScreen} data={{ summary: data?.summary, amostra: data?.items?.slice(0, 12) }} /></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["DELIVERED", t.statDelivered, "text-emerald-400"], ["DEAD_LETTER", t.statDeadLetter, "text-rose-400"], ["RETRY", t.statRetry, "text-amber-300"], ["PENDING", t.statPending, "text-[#9b95ad]"]].map(([k, l, c]) => (
          <div key={k} className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${c}`}>{s[k] || 0}</div>
            <div className="text-[11px] text-[#9b95ad] mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[#9b95ad] border-b border-white/[0.08] bg-white/[0.02]">
            <th className="px-3 py-2 font-medium">{t.colTopic}</th><th className="px-3 py-2 font-medium">{t.colStatus}</th>
            <th className="px-3 py-2 font-medium">{t.colSubscriber}</th><th className="px-3 py-2 font-medium text-right">{t.colLag}</th>
            <th className="px-3 py-2 font-medium">{t.colClient}</th><th className="px-3 py-2 font-medium">{t.colWhen}</th>
          </tr></thead>
          <tbody>
            {pag.pageItems.map((e: any, i: number) => (
              <tr key={i} onClick={() => setSel(e)} className="border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors">
                <td className="px-3 py-2 font-mono text-xs text-[#e2e0ea]">{e.topic}</td>
                <td className="px-3 py-2"><span className={`text-xs px-1.5 py-0.5 rounded ${ST[e.status] || ""}`}>{e.status}</span></td>
                <td className="px-3 py-2 text-[#9b95ad]">{e.subscriber || "—"}</td>
                <td className="px-3 py-2 text-right text-[#9b95ad]">{e.lagMs}ms</td>
                <td className="px-3 py-2 text-[#9b95ad]">{e.client}</td>
                <td className="px-3 py-2 text-xs text-[#9b95ad]">{e.occurredAt ? new Date(e.occurredAt).toLocaleString("pt-BR") : "—"}</td>
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && <tr><td colSpan={6} className="px-3 py-6 text-center text-[#9b95ad]">{t.emptyTable}</td></tr>}
          </tbody>
        </table>
        <div className="px-3 pb-3"><Pagination {...pag} /></div>
      </div>

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          icon="📨"
          title={sel.topic}
          subtitle={sel.subscriber || undefined}
          badge={<span className={`text-xs px-1.5 py-0.5 rounded ${ST[sel.status] || ""}`}>{sel.status}</span>}
          fields={[
            { label: st.fTopic, value: <span className="font-mono text-xs">{sel.topic}</span> },
            { label: st.fStatus, value: sel.status },
            { label: st.fSubscriber, value: sel.subscriber },
            { label: st.fClient, value: sel.client },
            { label: st.fLag, value: sel.lagMs != null ? `${sel.lagMs}ms` : undefined },
            { label: st.fAttempts, value: sel.attempts != null ? String(sel.attempts) : undefined },
            { label: st.fEventId, value: sel.eventId ? <span className="font-mono text-xs">{sel.eventId}</span> : (sel.id ? <span className="font-mono text-xs">{sel.id}</span> : undefined) },
            { label: st.fWhen, value: sel.occurredAt ? new Date(sel.occurredAt).toLocaleString("pt-BR") : undefined },
            { label: st.fError, value: sel.error ? <span className="text-rose-300">{sel.error}</span> : undefined },
            { label: st.fPayload, value: sel.payload ? <span className="font-mono text-xs break-all">{typeof sel.payload === "string" ? sel.payload : JSON.stringify(sel.payload)}</span> : undefined },
          ]}
          guideTitle={st.guideTitle}
          guideSteps={sel.status === "DEAD_LETTER" ? st.deadLetterSteps : sel.status === "RETRY" ? st.retrySteps : (sel.lagMs > 1000 ? st.lagSteps : undefined)}
          guideTx={sel.status === "DEAD_LETTER" || sel.status === "RETRY" ? "Event Mesh › Subscriptions" : undefined}
          actions={(sel.status === "DEAD_LETTER" || sel.status === "RETRY") ? (
            <button className="text-sm px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 cursor-pointer">🔁 {st.reprocess}</button>
          ) : undefined}
        >
          <ExplainData screen={`${t.explainScreen} — item`} data={{ topic: sel.topic, status: sel.status, subscriber: sel.subscriber, client: sel.client, lagMs: sel.lagMs, attempts: sel.attempts, error: sel.error, occurredAt: sel.occurredAt }} />
        </DetailSheet>
      )}
    </div>
  );
}
