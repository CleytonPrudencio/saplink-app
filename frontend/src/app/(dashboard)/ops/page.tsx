"use client";

import { useEffect, useState, useCallback } from "react";
import { getOps, resolveOps, getMe } from "@/lib/api";
import { usePaginate, Pagination } from "@/components/Pagination";
import ExplainData from "@/components/ExplainData";
import DetailSheet from "@/components/DetailSheet";
import { useLang, type Lang } from "@/i18n/I18n";
import { T } from "./i18n";

// "O que fazer" por categoria (passos + transação SAP), trilíngue.
const OPS_GUIDE: Record<string, Record<Lang, { steps: string[]; tx: string }>> = {
  PIPO: { pt: { steps: ["Abra a mensagem no monitor de integração (SXMB_MONI).", "Reprocesse a fila travada e cheque o canal de comunicação.", "Se recorrer, valide o mapeamento/endpoint do iFlow."], tx: "SXMB_MONI · SMQ2 · RWB" }, en: { steps: ["Open the message in the integration monitor (SXMB_MONI).", "Reprocess the stuck queue and check the comm channel.", "If it recurs, validate the iFlow mapping/endpoint."], tx: "SXMB_MONI · SMQ2 · RWB" }, es: { steps: ["Abre el mensaje en el monitor de integración (SXMB_MONI).", "Reprocesa la cola trabada y revisa el canal de comunicación.", "Si reincide, valida el mapeo/endpoint del iFlow."], tx: "SXMB_MONI · SMQ2 · RWB" } },
  JOB: { pt: { steps: ["Abra o job em SM37 e leia o log.", "Reagende ou reinicie o job conforme a causa.", "Cheque dependências (variantes, locks, dados)."], tx: "SM37" }, en: { steps: ["Open the job in SM37 and read the log.", "Reschedule or restart the job per the cause.", "Check dependencies (variants, locks, data)."], tx: "SM37" }, es: { steps: ["Abre el job en SM37 y lee el log.", "Reprograma o reinicia el job según la causa.", "Revisa dependencias (variantes, locks, datos)."], tx: "SM37" } },
  DUMP: { pt: { steps: ["Abra o dump em ST22 e identifique programa/exceção.", "Corrija o dado/customizing ou abra SAP Note.", "Monitore se o erro reincide."], tx: "ST22" }, en: { steps: ["Open the dump in ST22 and identify program/exception.", "Fix the data/customizing or raise a SAP Note.", "Monitor whether the error recurs."], tx: "ST22" }, es: { steps: ["Abre el dump en ST22 e identifica programa/excepción.", "Corrige el dato/customizing o abre una SAP Note.", "Monitorea si el error reincide."], tx: "ST22" } },
  UPDATE_ERR: { pt: { steps: ["Abra SM13 e analise a atualização cancelada.", "Repita a atualização ou elimine o registro órfão.", "Investigue a causa (lock, dump, customizing)."], tx: "SM13" }, en: { steps: ["Open SM13 and analyze the failed update.", "Repeat the update or delete the orphan record.", "Investigate the cause (lock, dump, customizing)."], tx: "SM13" }, es: { steps: ["Abre SM13 y analiza la actualización cancelada.", "Repite la actualización o elimina el registro huérfano.", "Investiga la causa (lock, dump, customizing)."], tx: "SM13" } },
  LOCK: { pt: { steps: ["Abra SM12 e confira o lock e o usuário/processo dono.", "Confirme que é um lock preso (sessão morta).", "Libere com cautela após validar."], tx: "SM12" }, en: { steps: ["Open SM12 and check the lock and its owner.", "Confirm it's a stale lock (dead session).", "Release carefully after validating."], tx: "SM12" }, es: { steps: ["Abre SM12 y revisa el lock y su dueño.", "Confirma que es un lock atascado (sesión muerta).", "Libéralo con cuidado tras validar."], tx: "SM12" } },
  GATEWAY: { pt: { steps: ["Veja o erro em /IWFND/ERROR_LOG.", "Limpe o cache (/IWFND/CACHE_CLEANUP) se aplicável.", "Cheque o serviço em /IWFND/MAINT_SERVICE."], tx: "/IWFND/ERROR_LOG" }, en: { steps: ["Check the error in /IWFND/ERROR_LOG.", "Clear the cache (/IWFND/CACHE_CLEANUP) if applicable.", "Check the service in /IWFND/MAINT_SERVICE."], tx: "/IWFND/ERROR_LOG" }, es: { steps: ["Mira el error en /IWFND/ERROR_LOG.", "Limpia el caché (/IWFND/CACHE_CLEANUP) si aplica.", "Revisa el servicio en /IWFND/MAINT_SERVICE."], tx: "/IWFND/ERROR_LOG" } },
  HANA: { pt: { steps: ["Abra o DBACOCKPIT e veja alertas/espaço.", "Investigue SQL longa e uso de memória (ST04).", "Acione o time de Basis se for capacidade."], tx: "DBACOCKPIT · ST04" }, en: { steps: ["Open DBACOCKPIT and check alerts/space.", "Investigate long-running SQL and memory (ST04).", "Engage Basis if it's a capacity issue."], tx: "DBACOCKPIT · ST04" }, es: { steps: ["Abre DBACOCKPIT y revisa alertas/espacio.", "Investiga SQL larga y uso de memoria (ST04).", "Involucra a Basis si es capacidad."], tx: "DBACOCKPIT · ST04" } },
  SECURITY: { pt: { steps: ["Revise a SAP Note / HotNews indicada.", "Aplique a correção via SNOTE e planeje a janela.", "Confirme com System Recommendations."], tx: "SNOTE" }, en: { steps: ["Review the referenced SAP Note / HotNews.", "Apply the fix via SNOTE and plan the window.", "Confirm with System Recommendations."], tx: "SNOTE" }, es: { steps: ["Revisa la SAP Note / HotNews indicada.", "Aplica la corrección vía SNOTE y planifica la ventana.", "Confirma con System Recommendations."], tx: "SNOTE" } },
  PAYMENT: { pt: { steps: ["Abra F110 e veja o log da proposta/execução.", "Corrija a causa (banco, conta, bloqueio) e reprocesse.", "Valide o arquivo de remessa gerado."], tx: "F110" }, en: { steps: ["Open F110 and check the proposal/run log.", "Fix the cause (bank, account, block) and reprocess.", "Validate the generated payment file."], tx: "F110" }, es: { steps: ["Abre F110 y revisa el log de propuesta/ejecución.", "Corrige la causa (banco, cuenta, bloqueo) y reprocesa.", "Valida el archivo de remesa generado."], tx: "F110" } },
  BANK: { pt: { steps: ["Reimporte o extrato do dia (FF_5 / FEBAN).", "Cheque o formato/layout do arquivo (MT940).", "Concilie e poste as partidas pendentes."], tx: "FF_5 · FEBAN" }, en: { steps: ["Re-import the day's statement (FF_5 / FEBAN).", "Check the file format/layout (MT940).", "Reconcile and post pending items."], tx: "FF_5 · FEBAN" }, es: { steps: ["Reimporta el extracto del día (FF_5 / FEBAN).", "Revisa el formato/layout del archivo (MT940).", "Concilia y contabiliza las partidas pendientes."], tx: "FF_5 · FEBAN" } },
  MASTERDATA: { pt: { steps: ["Veja a divergência do Business Partner (BP).", "Ressincronize pelo DRF (DRFOUT) se for replicação.", "Corrija o cadastro na transação BP."], tx: "BP · DRFOUT" }, en: { steps: ["Check the Business Partner (BP) divergence.", "Resync via DRF (DRFOUT) if it's replication.", "Fix the master record in transaction BP."], tx: "BP · DRFOUT" }, es: { steps: ["Revisa la divergencia del Business Partner (BP).", "Resincroniza por DRF (DRFOUT) si es replicación.", "Corrige el maestro en la transacción BP."], tx: "BP · DRFOUT" } },
};
const SHEET_T: Record<Lang, { whatToDo: string; object: string; detail: string; env: string; status: string; open: string; resolved: string }> = {
  pt: { whatToDo: "O que fazer", object: "Objeto", detail: "Detalhe", env: "Ambiente", status: "Status", open: "Aberto", resolved: "Resolvido" },
  en: { whatToDo: "What to do", object: "Object", detail: "Detail", env: "Environment", status: "Status", open: "Open", resolved: "Resolved" },
  es: { whatToDo: "Qué hacer", object: "Objeto", detail: "Detalle", env: "Entorno", status: "Status", open: "Abierto", resolved: "Resuelto" },
};

const CAT_ICONS: [string, string][] = [
  ["", "🗂️"],
  ["PIPO", "🔁"],
  ["JOB", "⏱️"],
  ["DUMP", "💥"],
  ["UPDATE_ERR", "✖️"],
  ["LOCK", "🔒"],
  ["GATEWAY", "🚪"],
  ["HANA", "🗄️"],
  ["SECURITY", "🛡️"],
  ["PAYMENT", "💳"],
  ["BANK", "🏦"],
  ["MASTERDATA", "🗃️"],
];
const sevCls: Record<string, string> = { CRITICAL: "bg-rose-500/15 text-rose-300", HIGH: "bg-orange-500/15 text-orange-300", MEDIUM: "bg-amber-500/15 text-amber-300", LOW: "bg-white/[0.06] text-[#9b95ad]" };

export default function OpsPage() {
  const { lang } = useLang();
  const t = T[lang];
  const CAT_LABEL: Record<string, string> = {
    "": t.catAll,
    PIPO: t.catPipo,
    JOB: t.catJob,
    DUMP: t.catDump,
    UPDATE_ERR: t.catUpdateErr,
    LOCK: t.catLock,
    GATEWAY: t.catGateway,
    HANA: t.catHana,
    SECURITY: t.catSecurity,
    PAYMENT: t.catPayment,
    BANK: t.catBank,
    MASTERDATA: t.catMasterdata,
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("");
  const [sel, setSel] = useState<any>(null);
  const st = SHEET_T[lang];

  const load = useCallback(async () => { try { setData(await getOps(cat ? { category: cat } : {})); } finally { setLoading(false); } }, [cat]);
  useEffect(() => { getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  const pag = usePaginate<any>(data?.items || [], 20);

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  const s = data?.summary;
  const counts: Record<string, number> = Object.fromEntries((s?.byCategory || []).map((b: any) => [b.category, b.count]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">{t.title}</h1>
        <p className="text-[#9b95ad] text-sm mt-1">{t.subtitle}</p>
        <ExplainData screen="Basis & Operações" data={{ resumo: s, itens: (data?.items || []).slice(0, 15) }} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card label={t.openSignals} value={s?.total ?? 0} />
        <Card label={t.critical} value={s?.critical ?? 0} tone="rose" />
        <Card label={t.high} value={s?.high ?? 0} tone="orange" />
      </div>

      <div className="flex flex-wrap gap-2">
        {CAT_ICONS.map(([k, ic]) => (
          <button key={k} onClick={() => setCat(k)} className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer ${cat === k ? "bg-purple-500/20 text-purple-300" : "bg-[#1a1527] text-[#9b95ad] hover:text-white"}`}>
            {ic} {CAT_LABEL[k]}{k && counts[k] ? ` (${counts[k]})` : ""}
          </button>
        ))}
      </div>

      <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[#9b95ad] text-xs"><tr><th className="text-left px-3 py-2">{t.thClient}</th><th className="text-left px-3 py-2">{t.thCategory}</th><th className="text-left px-3 py-2">{t.thSignal}</th><th className="text-left px-3 py-2">{t.thWhen}</th><th className="text-left px-3 py-2">{t.thSev}</th>{isAdmin && <th></th>}</tr></thead>
          <tbody>
            {pag.pageItems.map((i: any) => (
              <tr key={i.id} onClick={() => setSel(i)} className="border-t border-white/[0.05] cursor-pointer hover:bg-white/[0.03] transition-colors">
                <td className="px-3 py-2">{i.client}</td>
                <td className="px-3 py-2 text-[#9b95ad]">{CAT_LABEL[i.category] || i.category}</td>
                <td className="px-3 py-2"><span className="text-[#e2e0ea]">{i.title}</span>{i.object && <span className="text-xs text-[#6b6580] font-mono"> · {i.object}</span>}{i.detail && <div className="text-xs text-[#9b95ad]">{i.detail}</div>}</td>
                <td className="px-3 py-2 text-[#9b95ad] whitespace-nowrap">{i.occurredAt ? new Date(i.occurredAt).toLocaleString(lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR") : "—"}</td>
                <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded ${sevCls[i.severity] || ""}`}>{i.severity}</span></td>
                {isAdmin && <td className="px-3 py-2 text-right"><button onClick={(e) => { e.stopPropagation(); resolveOps(i.id).then(load); }} className="text-xs px-2 py-1 rounded bg-emerald-500/15 text-emerald-300 cursor-pointer">{t.resolve}</button></td>}
              </tr>
            ))}
            {(!data?.items || data.items.length === 0) && <tr><td colSpan={isAdmin ? 6 : 5} className="px-3 py-6 text-center text-[#9b95ad]">{t.empty}</td></tr>}
          </tbody>
        </table>
        <div className="px-3 pb-3"><Pagination {...pag} /></div>
      </div>

      {sel && (() => {
        const g = OPS_GUIDE[sel.category]?.[lang];
        const icon = CAT_ICONS.find((c) => c[0] === sel.category)?.[1] || "🗂️";
        return (
          <DetailSheet
            open={!!sel}
            onClose={() => setSel(null)}
            icon={icon}
            title={sel.title}
            subtitle={`${sel.client} · ${CAT_LABEL[sel.category] || sel.category}`}
            badge={<span className={`text-xs px-2 py-0.5 rounded h-fit ${sevCls[sel.severity] || ""}`}>{sel.severity}</span>}
            fields={[
              { label: t.thClient, value: sel.client },
              { label: t.thCategory, value: CAT_LABEL[sel.category] || sel.category },
              { label: st.object, value: sel.object ? <span className="font-mono text-xs">{sel.object}</span> : "" },
              { label: st.detail, value: sel.detail },
              { label: st.env, value: sel.environment },
              { label: t.thWhen, value: sel.occurredAt ? new Date(sel.occurredAt).toLocaleString(lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR") : "" },
              { label: st.status, value: sel.resolved ? st.resolved : st.open },
            ]}
            guideTitle={st.whatToDo}
            guideSteps={g?.steps}
            guideTx={g?.tx}
            actions={isAdmin && !sel.resolved ? (
              <button onClick={() => { resolveOps(sel.id).then(() => { setSel(null); load(); }); }} className="px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 text-sm font-semibold cursor-pointer">{t.resolve}</button>
            ) : undefined}
          >
            <ExplainData screen="Basis & Operações — sinal" data={{ cliente: sel.client, categoria: sel.category, sinal: sel.title, objeto: sel.object, detalhe: sel.detail, severidade: sel.severity, ambiente: sel.environment }} />
          </DetailSheet>
        );
      })()}
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: number; tone?: string }) {
  const c = tone === "rose" ? "text-rose-300" : tone === "orange" ? "text-orange-300" : "text-[#e2e0ea]";
  return <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-3"><div className={`text-2xl font-bold ${c}`}>{value}</div><div className="text-xs text-[#9b95ad]">{label}</div></div>;
}
