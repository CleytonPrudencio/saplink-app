"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getConsultancyDetail, suspendConsultancy, activateConsultancy,
  platformResetPassword, platformUpdateUser, platformUpdateConsultancy,
  getPlatformClientDetail,
} from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Modal, Field, inputClass } from "@/components/Modal";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

function statusPill(s: string) {
  const map: Record<string, string> = {
    ACTIVE: "text-emerald-300 bg-emerald-500/15", OFFLINE: "text-rose-300 bg-rose-500/15",
    ERROR: "text-rose-300 bg-rose-500/15", PENDING: "text-amber-300 bg-amber-500/15",
  };
  return map[s] || "text-[#9b95ad] bg-white/[0.06]";
}

export default function ConsultancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const t = T[lang];
  const id = String(params.id);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();

  // modais
  const [editCons, setEditCons] = useState(false);
  const [consForm, setConsForm] = useState({ name: "", cnpj: "" });
  const [editUser, setEditUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "CONSULTANCY_USER" });
  const [clientId, setClientId] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);
  const [openIntg, setOpenIntg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setData(await getConsultancyDetail(id));
    } catch {
      notify(t.loadError, "error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [id]);

  // abrir cliente
  useEffect(() => {
    if (!clientId) { setClient(null); return; }
    setClient(null);
    getPlatformClientDetail(clientId).then(setClient).catch(() => notify(t.clientLoadError, "error"));
  }, [clientId]);

  async function saveConsultancy() {
    setBusy(true);
    try {
      await platformUpdateConsultancy(id, { name: consForm.name.trim() || undefined, cnpj: consForm.cnpj.trim() });
      notify(t.consSaved, "success"); setEditCons(false); await load();
    } catch { notify(t.saveFail, "error"); } finally { setBusy(false); }
  }

  async function saveUser() {
    setBusy(true);
    try {
      await platformUpdateUser(editUser.id, { name: userForm.name.trim(), email: userForm.email.trim(), role: userForm.role });
      notify(t.userSaved, "success"); setEditUser(null); await load();
    } catch (e: any) { notify(e?.response?.data?.error || t.saveFail, "error"); } finally { setBusy(false); }
  }

  async function resetPwd(userId: string, email: string) {
    try {
      const r = await platformResetPassword(userId);
      notify(t.tempPasswordMsg(email, r.tempPassword), "success");
    } catch { notify(t.resetPwdFail, "error"); }
  }

  async function toggleAccess(suspend: boolean) {
    setBusy(true);
    try {
      if (suspend) await suspendConsultancy(id); else await activateConsultancy(id);
      notify(suspend ? t.accessSuspended : t.accessReactivated, "success"); await load();
    } catch { notify(t.accessOpFail, "error"); } finally { setBusy(false); }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  if (!data) return <div className="text-rose-400">{t.notFound}</div>;

  const c = data.consultancy;
  const sub = c.subscription;
  const eff = data.effectiveStatus;
  const cut = eff && !eff.allowed;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/platform")} className="text-sm text-[#9b95ad] hover:text-white">{t.back}</button>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{c.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setConsForm({ name: c.name, cnpj: c.cnpj || "" }); setEditCons(true); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-white/[0.06] hover:bg-white/[0.1]"
          >{t.editProfile}</button>
          <button disabled={busy} onClick={() => toggleAccess(!cut)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 ${cut ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
            {cut ? t.reactivateAccess : t.suspendAccess}
          </button>
        </div>
      </div>

      {/* Assinatura */}
      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">{t.subscription}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-[#9b95ad]">{t.status}</p><p className="font-medium mt-0.5">{t.statusLabel[eff?.status as keyof typeof t.statusLabel] || eff?.status || t.dash}</p></div>
          <div><p className="text-[#9b95ad]">{t.plan}</p><p className="font-medium mt-0.5">{sub?.plan?.name || sub?.planKey || t.dash}</p></div>
          <div><p className="text-[#9b95ad]">{t.monthlyFee}</p><p className="font-medium mt-0.5">{sub?.plan ? `R$ ${(sub.plan.priceCents / 100).toFixed(2)}` : t.dash}</p></div>
          <div><p className="text-[#9b95ad]">{t.cnpj}</p><p className="font-medium mt-0.5">{c.cnpj || t.dash}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuários */}
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-4">{t.users(c.users.length)}</h2>
          <div className="space-y-2">
            {c.users.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between gap-2 text-sm bg-[#0f0b1a] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-[#9b95ad] text-xs truncate">{u.email} · {u.role}</p>
                </div>
                <button
                  onClick={() => { setUserForm({ name: u.name, email: u.email, role: u.role }); setEditUser(u); }}
                  className="text-xs px-3 py-1.5 rounded bg-white/[0.06] hover:bg-white/[0.12] shrink-0"
                >{t.manage}</button>
              </div>
            ))}
            {c.users.length === 0 && <p className="text-sm text-[#9b95ad]">{t.noUsers}</p>}
          </div>
        </div>

        {/* Clientes (clicáveis) */}
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08]">
          <h2 className="text-lg font-semibold mb-4">{t.clients(c.clients.length, data.integrationsCount)}</h2>
          <div className="space-y-2">
            {c.clients.map((cl: any) => (
              <button
                key={cl.id}
                onClick={() => { setOpenIntg(null); setClientId(cl.id); }}
                className="w-full flex justify-between items-center text-sm bg-[#0f0b1a] rounded-lg px-3 py-2 hover:bg-[#231d35] text-left"
              >
                <span className="font-medium">{cl.name}</span>
                <span className="text-[#9b95ad]">{t.health} {cl.healthScore} →</span>
              </button>
            ))}
            {c.clients.length === 0 && <p className="text-sm text-[#9b95ad]">{t.noClients}</p>}
          </div>
        </div>
      </div>

      {/* Faturas */}
      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">{t.invoices}</h2>
        <div className="space-y-2">
          {c.invoices.map((inv: any) => (
            <div key={inv.id} className="grid grid-cols-3 text-sm bg-[#0f0b1a] rounded-lg px-3 py-2">
              <span>{new Date(inv.createdAt).toLocaleDateString(t.locale)}</span>
              <span className="text-center">R$ {(inv.amountCents / 100).toFixed(2)}</span>
              <span className={`text-right ${inv.status === "PAID" ? "text-emerald-400" : "text-amber-400"}`}>{inv.status}</span>
            </div>
          ))}
          {c.invoices.length === 0 && <p className="text-sm text-[#9b95ad]">{t.noInvoices}</p>}
        </div>
      </div>

      {/* ===== MODAL: editar consultoria ===== */}
      <Modal open={editCons} onClose={() => setEditCons(false)} title={t.editConsTitle}>
        <div className="space-y-4">
          <Field label={t.name}><input className={inputClass} value={consForm.name} onChange={(e) => setConsForm({ ...consForm, name: e.target.value })} /></Field>
          <Field label={t.cnpj}><input className={inputClass} value={consForm.cnpj} onChange={(e) => setConsForm({ ...consForm, cnpj: e.target.value })} placeholder={t.cnpjPlaceholder} /></Field>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditCons(false)} className="px-4 py-2 rounded-lg text-sm bg-white/[0.06]">{t.cancel}</button>
            <button disabled={busy} onClick={saveConsultancy} className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-500 text-white disabled:opacity-40">{t.save}</button>
          </div>
        </div>
      </Modal>

      {/* ===== MODAL: editar usuário ===== */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={t.editUserTitle}>
        {editUser && (
          <div className="space-y-4">
            <Field label={t.name}><input className={inputClass} value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></Field>
            <Field label={t.email}><input className={inputClass} value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></Field>
            <Field label={t.role}>
              <select className={inputClass} value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                <option value="CONSULTANCY_ADMIN">{t.roleConsAdmin}</option>
                <option value="CONSULTANCY_USER">{t.roleConsUser}</option>
              </select>
            </Field>
            <div className="flex justify-between items-center pt-2">
              <button onClick={() => resetPwd(editUser.id, editUser.email)} className="px-3 py-2 rounded-lg text-sm bg-amber-500/15 text-amber-300 hover:bg-amber-500/25">{t.resetPassword}</button>
              <div className="flex gap-2">
                <button onClick={() => setEditUser(null)} className="px-4 py-2 rounded-lg text-sm bg-white/[0.06]">{t.cancel}</button>
                <button disabled={busy} onClick={saveUser} className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-500 text-white disabled:opacity-40">{t.save}</button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== MODAL: detalhe do cliente (drill-down de integrações) ===== */}
      <Modal open={!!clientId} onClose={() => setClientId(null)} title={client ? client.name : t.loading} size="lg">
        {!client ? (
          <div className="text-[#9b95ad]">{t.loading}</div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><p className="text-[#9b95ad]">{t.healthScore}</p><p className="font-medium">{client.healthScore}</p></div>
              <div><p className="text-[#9b95ad]">{t.cnpj}</p><p className="font-medium">{client.cnpj || t.dash}</p></div>
              <div><p className="text-[#9b95ad]">{t.integrationsLabel}</p><p className="font-medium">{client.integrations.length}</p></div>
              <div><p className="text-[#9b95ad]">{t.openAlerts}</p><p className="font-medium">{client.openAlerts.length}</p></div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#9b95ad] mb-2">{t.integrationsHeading}</h4>
              <div className="space-y-2">
                {client.integrations.map((i: any) => (
                  <div key={i.id} className="bg-[#0f0b1a] rounded-lg border border-white/[0.06]">
                    <button onClick={() => setOpenIntg(openIntg === i.id ? null : i.id)} className="w-full flex items-center justify-between px-3 py-2 text-left">
                      <div className="min-w-0">
                        <span className="font-medium">{i.name}</span>
                        <span className="ml-2 text-xs text-[#9b95ad]">{i.type}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusPill(i.status)}`}>{i.status}</span>
                        <span className="text-[#9b95ad] text-xs">{openIntg === i.id ? "−" : "+"}</span>
                      </div>
                    </button>
                    {openIntg === i.id && (
                      <div className="px-3 pb-3 border-t border-white/[0.05] text-sm space-y-3">
                        {i.description && <p className="text-[#9b95ad] mt-2">{i.description}</p>}
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div><p className="text-[#9b95ad] text-xs">{t.latency}</p><p>{i.latency} ms</p></div>
                          <div><p className="text-[#9b95ad] text-xs">{t.error}</p><p>{i.errorRate}%</p></div>
                          <div><p className="text-[#9b95ad] text-xs">{t.uptime}</p><p>{i.uptime}%</p></div>
                        </div>
                        {i.config && (
                          <div>
                            <p className="text-[#9b95ad] text-xs mb-1">{t.config}</p>
                            <div className="bg-[#1a1527] rounded p-2 space-y-0.5">
                              {Object.entries(i.config).map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3 text-xs">
                                  <span className="text-[#9b95ad]">{k}</span>
                                  <span className="font-mono truncate max-w-[60%]">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {client.integrations.length === 0 && <p className="text-sm text-[#9b95ad]">{t.noIntegrations}</p>}
              </div>
            </div>

            {client.openAlerts.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#9b95ad] mb-2">{t.openAlertsHeading}</h4>
                <div className="space-y-2">
                  {client.openAlerts.map((a: any) => (
                    <div key={a.id} className="bg-[#0f0b1a] rounded-lg px-3 py-2 text-sm">
                      <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${a.severity === "CRITICAL" ? "bg-rose-500/15 text-rose-300" : "bg-amber-500/15 text-amber-300"}`}>{a.severity}</span>
                      {a.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
