"use client";

import { useEffect, useState } from "react";
import {
  getMe, getUsers, getClients, createUser, updateUser, deleteUser,
  getSsoConfig, resetUserPassword,
  type TenantUser,
} from "@/lib/api";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

const ROLES = ["CONSULTANCY_ADMIN", "CONSULTANCY_ANALYST", "CONSULTANCY_VIEWER"] as const;
type Role = (typeof ROLES)[number];

interface ClientOpt { id: string; name: string }

// Estado do formulário (criação e edição compartilham o shape)
interface FormState {
  name: string;
  email: string;
  role: Role;
  allClients: boolean;
  clientIds: string[];
}

const EMPTY_FORM: FormState = { name: "", email: "", role: "CONSULTANCY_ANALYST", allClients: true, clientIds: [] };

export default function UsersPage() {
  const { lang } = useLang();
  const t = T[lang];

  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState<TenantUser[]>([]);
  const [clients, setClients] = useState<ClientOpt[]>([]);

  // criação
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [created, setCreated] = useState<{ invited?: boolean; tempPassword?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // edição inline
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // reset de senha
  const [meId, setMeId] = useState<string | null>(null);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ invited?: boolean; tempPassword?: string } | null>(null);
  const [resetCopied, setResetCopied] = useState(false);

  const roleLabel = (r: string) =>
    r === "CONSULTANCY_ADMIN" ? t.roleAdmin : r === "CONSULTANCY_VIEWER" ? t.roleViewer : t.roleAnalyst;
  const roleBadge = (r: string) =>
    r === "CONSULTANCY_ADMIN"
      ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
      : r === "CONSULTANCY_VIEWER"
        ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

  async function load() {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([getUsers(), getClients()]);
      setUsers(Array.isArray(u) ? u : []);
      const list = Array.isArray(c) ? c : (c?.data || []);
      setClients(list.map((x: any) => ({ id: x.id, name: x.name })));
      setError("");
    } catch {
      setError(t.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getMe()
      .then((me) => {
        const admin = me?.role === "CONSULTANCY_ADMIN";
        setMeId(me?.id ?? null);
        setIsAdmin(admin);
        setAuthReady(true);
        if (admin) {
          load();
          // SSO ativo → reset de senha é feito pelo provedor; esconde o botão
          getSsoConfig().then((s) => setSsoEnabled(!!s?.enabled)).catch(() => {});
        } else setLoading(false);
      })
      .catch(() => {
        setAuthReady(true);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onResetPassword(u: TenantUser) {
    if (!window.confirm(t.confirmReset(u.name))) return;
    setResettingId(u.id);
    try {
      const res = await resetUserPassword(u.id);
      setResetResult({ invited: res?.invited, tempPassword: res?.tempPassword });
      setResetCopied(false);
    } catch (err: any) {
      alert(err?.response?.data?.error || t.resetError);
    } finally {
      setResettingId(null);
    }
  }

  function toggleClient(state: FormState, set: (f: FormState) => void, id: string) {
    const has = state.clientIds.includes(id);
    set({ ...state, clientIds: has ? state.clientIds.filter((x) => x !== id) : [...state.clientIds, id] });
  }

  // Admin sempre vê todos; ao escolher Admin força allClients=true e limpa seleção
  function applyRole(state: FormState, set: (f: FormState) => void, role: Role) {
    if (role === "CONSULTANCY_ADMIN") set({ ...state, role, allClients: true, clientIds: [] });
    else set({ ...state, role });
  }

  function payloadFrom(f: FormState) {
    const allClients = f.role === "CONSULTANCY_ADMIN" ? true : f.allClients;
    return {
      role: f.role,
      allClients,
      clientIds: allClients ? [] : f.clientIds,
    };
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const res = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        ...payloadFrom(form),
      });
      setCreated({ invited: res?.invited, tempPassword: res?.tempPassword });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || t.createError);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(u: TenantUser) {
    setEditError("");
    setEditId(u.id);
    setEditForm({
      name: u.name,
      email: u.email,
      role: (ROLES.includes(u.role as Role) ? u.role : "CONSULTANCY_ANALYST") as Role,
      allClients: u.allClients,
      clientIds: u.clientIds || [],
    });
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditSaving(true);
    setEditError("");
    try {
      await updateUser(editId, payloadFrom(editForm));
      setEditId(null);
      await load();
    } catch (err: any) {
      setEditError(err?.response?.data?.error || t.updateError);
    } finally {
      setEditSaving(false);
    }
  }

  async function onDelete(u: TenantUser) {
    if (!window.confirm(t.confirmDelete(u.name))) return;
    try {
      await deleteUser(u.id);
      if (editId === u.id) setEditId(null);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error || t.deleteError);
    }
  }

  if (!authReady || loading) return <div className="text-[#9b95ad]">{t.loading}</div>;

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-[#1a1527] border border-white/[0.08] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-xl font-bold text-[#e2e0ea] mb-2">{t.adminOnlyTitle}</h1>
        <p className="text-[#9b95ad] leading-relaxed">{t.adminOnlyText}</p>
      </div>
    );
  }

  // Sub-componente: seletor de escopo (reutilizado em criação e edição)
  function ScopeFields(state: FormState, set: (f: FormState) => void, idPrefix: string) {
    const isAdminRole = state.role === "CONSULTANCY_ADMIN";
    return (
      <>
        <div>
          <span className="block text-sm text-[#9b95ad] mb-1">{t.roleLabel}</span>
          <select
            value={state.role}
            onChange={(e) => applyRole(state, set, e.target.value as Role)}
            className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
          >
            <option value="CONSULTANCY_ADMIN">{t.roleAdmin}</option>
            <option value="CONSULTANCY_ANALYST">{t.roleAnalyst}</option>
            <option value="CONSULTANCY_VIEWER">{t.roleViewer}</option>
          </select>
        </div>

        {!isAdminRole && (
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={state.allClients}
                onChange={(e) => set({ ...state, allClients: e.target.checked })}
                className="h-4 w-4 accent-purple-500"
              />
              <span className="text-sm text-[#e2e0ea]">{t.allClientsToggle}</span>
            </label>
            <p className="text-xs text-[#6b6580] mt-1">{t.allClientsHint}</p>
          </div>
        )}

        {!isAdminRole && !state.allClients && (
          <div>
            <span className="block text-sm text-[#9b95ad] mb-1.5">{t.clientsLabel}</span>
            {clients.length === 0 ? (
              <p className="text-xs text-[#6b6580]">{t.noClients}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {clients.map((c) => (
                  <label
                    key={c.id}
                    htmlFor={`${idPrefix}-cli-${c.id}`}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#0f0b1a] border border-white/[0.06] cursor-pointer hover:border-white/[0.15]"
                  >
                    <input
                      id={`${idPrefix}-cli-${c.id}`}
                      type="checkbox"
                      checked={state.clientIds.includes(c.id)}
                      onChange={() => toggleClient(state, set, c.id)}
                      className="h-4 w-4 accent-purple-500"
                    />
                    <span className="text-sm text-[#e2e0ea] truncate">{c.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-sm text-[#9b95ad] mt-1 max-w-2xl">{t.subtitle}</p>
        </div>
        <button
          onClick={() => { setShowForm((s) => !s); setFormError(""); }}
          className="shrink-0 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold"
        >
          {showForm ? t.cancel : t.newUser}
        </button>
      </div>

      {error && <div className="text-rose-400">{error}</div>}

      {showForm && (
        <form onSubmit={onCreate} className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08] max-w-xl space-y-4">
          <div>
            <label htmlFor="u-name" className="block text-sm text-[#9b95ad] mb-1">{t.nameLabel}</label>
            <input
              id="u-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
              placeholder={t.namePlaceholder}
            />
          </div>
          <div>
            <label htmlFor="u-email" className="block text-sm text-[#9b95ad] mb-1">{t.emailLabel}</label>
            <input
              id="u-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
              placeholder={t.emailPlaceholder}
            />
          </div>
          {ScopeFields(form, setForm, "new")}
          {formError && <p className="text-rose-400 text-sm">{formError}</p>}
          <button
            type="submit"
            disabled={saving || !form.name.trim() || !form.email.trim()}
            className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40"
          >
            {saving ? t.saving : t.create}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="bg-[#1a1527] rounded-xl border border-white/[0.08]">
            <div className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#e2e0ea] truncate">{u.name}</p>
                <p className="text-xs text-[#9b95ad] truncate">{u.email}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border ${roleBadge(u.role)}`}>
                {roleLabel(u.role)}
              </span>
              <span className="text-xs text-[#9b95ad] hidden sm:inline min-w-[110px] text-right">
                {u.allClients ? t.scopeAll : t.scopeN((u.clientIds || []).length)}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {ssoEnabled ? (
                  <span className="text-xs text-[#6b6580] hidden sm:inline" title={t.ssoManaged}>
                    🔐 {t.ssoManaged}
                  </span>
                ) : u.id !== meId ? (
                  <button
                    onClick={() => onResetPassword(u)}
                    disabled={resettingId === u.id}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#9b95ad] hover:text-white hover:bg-white/[0.1] cursor-pointer transition disabled:opacity-40"
                  >
                    {resettingId === u.id ? t.resetting : t.resetPassword}
                  </button>
                ) : null}
                <button
                  onClick={() => (editId === u.id ? setEditId(null) : startEdit(u))}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#9b95ad] hover:text-white hover:bg-white/[0.1] cursor-pointer transition"
                >
                  {t.edit}
                </button>
                <button
                  onClick={() => onDelete(u)}
                  aria-label={t.remove}
                  title={t.remove}
                  className="text-[#9b95ad] hover:text-rose-400 hover:bg-white/[0.06] text-base px-2 py-1.5 rounded-lg cursor-pointer transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {editId === u.id && (
              <form onSubmit={onSaveEdit} className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-4">
                {ScopeFields(editForm, setEditForm, `edit-${u.id}`)}
                {editError && <p className="text-rose-400 text-sm">{editError}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40"
                  >
                    {editSaving ? t.saving : t.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditId(null)}
                    className="px-4 py-2 rounded-lg bg-white/[0.06] text-[#e2e0ea] text-sm hover:bg-white/[0.12] cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}

        {users.length === 0 && !showForm && (
          <div className="text-center py-12">
            <p className="text-[#9b95ad]">{t.emptyTitle}</p>
          </div>
        )}
      </div>

      {/* Resultado da criação: convite ou senha temporária */}
      {created && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={() => setCreated(null)}>
          <div
            className="max-w-md w-full bg-[#1a1527] border border-white/[0.1] rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {created.tempPassword ? (
              <>
                <h2 className="text-lg font-bold text-[#e2e0ea] mb-1">{t.tempPasswordTitle}</h2>
                <p className="text-sm text-[#9b95ad] mb-4">{t.tempPasswordText}</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={created.tempPassword}
                    className="flex-1 bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm font-mono text-[#e2e0ea]"
                  />
                  <button
                    onClick={() => { navigator.clipboard?.writeText(created.tempPassword!); setCopied(true); }}
                    className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sm cursor-pointer whitespace-nowrap"
                  >
                    {copied ? t.copied : t.copy}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">📨</div>
                <h2 className="text-lg font-bold text-[#e2e0ea] mb-1">{t.invitedTitle}</h2>
                <p className="text-sm text-[#9b95ad]">{t.invitedText}</p>
              </>
            )}
            <button
              onClick={() => { setCreated(null); setCopied(false); }}
              className="mt-5 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold cursor-pointer"
            >
              {t.done}
            </button>
          </div>
        </div>
      )}

      {/* Resultado do reset de senha: convite/redefinição ou nova senha temporária */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={() => setResetResult(null)}>
          <div
            className="max-w-md w-full bg-[#1a1527] border border-white/[0.1] rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {resetResult.tempPassword ? (
              <>
                <h2 className="text-lg font-bold text-[#e2e0ea] mb-1">{t.resetTempTitle}</h2>
                <p className="text-sm text-[#9b95ad] mb-4">{t.resetTempText}</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={resetResult.tempPassword}
                    className="flex-1 bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm font-mono text-[#e2e0ea]"
                  />
                  <button
                    onClick={() => { navigator.clipboard?.writeText(resetResult.tempPassword!); setResetCopied(true); }}
                    className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-sm cursor-pointer whitespace-nowrap"
                  >
                    {resetCopied ? t.copied : t.copy}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">📨</div>
                <h2 className="text-lg font-bold text-[#e2e0ea] mb-1">{t.resetInvitedTitle}</h2>
                <p className="text-sm text-[#9b95ad]">{t.resetInvitedText}</p>
              </>
            )}
            <button
              onClick={() => { setResetResult(null); setResetCopied(false); }}
              className="mt-5 w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold cursor-pointer"
            >
              {t.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
