"use client";

import { useEffect, useState } from "react";
import { getMe, updateBranding, getUsers, createUser, deleteUser, getDigestStatus, toggleDigest, getDigestPreview, sendDigestNow } from "@/lib/api";
import { useLang } from "@/i18n/I18n";
import { T } from "./i18n";

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Consultancy {
  id: string;
  name: string;
  plan?: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  consultancy?: Consultancy;
}

export default function SettingsPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#a855f7");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const [team, setTeam] = useState<TeamUser[]>([]);
  const [nu, setNu] = useState({ name: "", email: "", role: "CONSULTANCY_USER" });
  const [addingUser, setAddingUser] = useState(false);
  const [userMsg, setUserMsg] = useState("");

  // Digest semanal
  const [digest, setDigest] = useState<{ weeklyDigest: boolean; lastDigestAt: string | null; emailEnabled: boolean; aiEnabled: boolean } | null>(null);
  const [digestMsg, setDigestMsg] = useState("");
  const [digestBusy, setDigestBusy] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [previewBusy, setPreviewBusy] = useState(false);

  async function loadTeam() {
    try {
      setTeam(await getUsers());
    } catch {
      /* sem permissão ou erro: ignora */
    }
  }

  useEffect(() => {
    getMe()
      .then((data) => {
        setUser(data);
        setName(data.consultancy?.name || "");
        setLogoUrl(data.consultancy?.logoUrl || "");
        setPrimaryColor(data.consultancy?.primaryColor || "#a855f7");
        if (data.role === "CONSULTANCY_ADMIN" || data.role === "PLATFORM_ADMIN") {
          loadTeam();
          getDigestStatus().then(setDigest).catch(() => {});
        }
      })
      .catch(() => setError(t.loadError))
      .finally(() => setLoading(false));
  }, []);

  async function onAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddingUser(true);
    setUserMsg("");
    try {
      const created = await createUser({ name: nu.name.trim(), email: nu.email.trim(), role: nu.role });
      setUserMsg(t.userCreated(created.tempPassword));
      setNu({ name: "", email: "", role: "CONSULTANCY_USER" });
      await loadTeam();
    } catch (err: any) {
      setUserMsg(err?.response?.data?.error || t.createUserError);
    } finally {
      setAddingUser(false);
    }
  }

  async function onRemoveUser(id: string, nm: string) {
    if (!window.confirm(t.removeConfirm(nm))) return;
    try {
      await deleteUser(id);
      await loadTeam();
    } catch (err: any) {
      alert(err?.response?.data?.error || t.removeError);
    }
  }

  async function onToggleDigest() {
    if (!digest) return;
    const next = !digest.weeklyDigest;
    setDigest({ ...digest, weeklyDigest: next });
    try {
      await toggleDigest(next);
    } catch {
      setDigest({ ...digest, weeklyDigest: !next });
    }
  }

  async function onPreviewDigest() {
    setPreviewBusy(true);
    setPreview("");
    try {
      const r = await getDigestPreview();
      setPreview(r.narrative || t.previewUnavailable);
    } catch {
      setPreview(t.previewError);
    } finally {
      setPreviewBusy(false);
    }
  }

  async function onSendDigest() {
    setDigestBusy(true);
    setDigestMsg("");
    try {
      const r = await sendDigestNow();
      setDigestMsg(
        r.sent
          ? t.sentTo(r.to.join(", "))
          : r.reason || t.notSent
      );
      getDigestStatus().then(setDigest).catch(() => {});
    } catch {
      setDigestMsg(t.sendError);
    } finally {
      setDigestBusy(false);
    }
  }

  async function onSaveBranding(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    setError("");
    try {
      await updateBranding({
        name: name.trim() || undefined,
        logoUrl: logoUrl.trim() || null,
        primaryColor: primaryColor || null,
      });
      setSavedMsg(t.brandSaved);
    } catch (err: any) {
      setError(err?.response?.data?.error || t.brandSaveError);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-[#9b95ad]">{t.loading}</div>;
  if (!user) return <div className="text-rose-400">{error || t.genericError}</div>;

  const isAdmin = user.role === "CONSULTANCY_ADMIN" || user.role === "PLATFORM_ADMIN";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      {error && <div className="text-rose-400">{error}</div>}

      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">{t.profile}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-sm text-[#9b95ad]">{t.name}</p><p className="font-medium mt-0.5">{user.name}</p></div>
          <div><p className="text-sm text-[#9b95ad]">{t.email}</p><p className="font-medium mt-0.5">{user.email}</p></div>
          <div><p className="text-sm text-[#9b95ad]">{t.consultancy}</p><p className="font-medium mt-0.5">{user.consultancy?.name || "-"}</p></div>
          <div><p className="text-sm text-[#9b95ad]">{t.role}</p><p className="font-medium mt-0.5">{user.role}</p></div>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={onSaveBranding} className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl space-y-4">
          <h2 className="text-lg font-semibold">{t.branding}</h2>
          <div>
            <label htmlFor="brand-name" className="block text-sm text-[#9b95ad] mb-1">{t.displayName}</label>
            <input id="brand-name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="brand-logo" className="block text-sm text-[#9b95ad] mb-1">{t.logoUrl}</label>
            <input id="brand-logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..."
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="brand-color" className="block text-sm text-[#9b95ad] mb-1">{t.primaryColor}</label>
            <input id="brand-color" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-20 bg-[#0f0b1a] border border-white/[0.1] rounded-lg" />
          </div>
          {savedMsg && <p className="text-emerald-400 text-sm">{savedMsg}</p>}
          <button type="submit" disabled={saving}
            className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40">
            {saving ? t.saving : t.saveBrand}
          </button>
        </form>
      )}

      {isAdmin && digest && (
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{t.digestTitle}</h2>
              <p className="text-sm text-[#9b95ad] mt-1">
                {t.digestDesc}
              </p>
            </div>
            <button onClick={onToggleDigest} role="switch" aria-checked={digest.weeklyDigest}
              className={`relative shrink-0 w-12 h-7 rounded-full transition-colors cursor-pointer ${digest.weeklyDigest ? "bg-purple-500" : "bg-white/[0.15]"}`}>
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${digest.weeklyDigest ? "translate-x-5" : ""}`} />
            </button>
          </div>

          <div className="text-xs text-[#9b95ad] space-y-1">
            <p>{t.lastSent} {digest.lastDigestAt ? new Date(digest.lastDigestAt).toLocaleString("pt-BR") : t.never}</p>
            {!digest.emailEnabled && <p className="text-amber-300">{t.emailNotConfigured}</p>}
            {!digest.aiEnabled && <p className="text-amber-300">{t.aiUnavailable}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={onPreviewDigest} disabled={previewBusy}
              className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-sm font-semibold disabled:opacity-40 cursor-pointer">
              {previewBusy ? t.previewing : t.previewAi}
            </button>
            <button onClick={onSendDigest} disabled={digestBusy}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer">
              {digestBusy ? t.sending : t.sendNow}
            </button>
          </div>

          {preview && (
            <div className="bg-[#0f0b1a] border border-white/[0.08] rounded-lg p-4 text-sm text-[#c9c5d6] whitespace-pre-wrap leading-relaxed">
              {preview}
            </div>
          )}
          {digestMsg && <p className="text-sm text-emerald-400 break-all">{digestMsg}</p>}
        </div>
      )}

      {isAdmin && (
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl space-y-4">
          <h2 className="text-lg font-semibold">{t.teamUsers}</h2>
          <div className="space-y-2">
            {team.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name} <span className="text-[#9b95ad]">· {u.email}</span></p>
                  <p className="text-xs text-[#9b95ad]">{u.role}</p>
                </div>
                {u.id !== user.id && (
                  <button onClick={() => onRemoveUser(u.id, u.name)} aria-label={t.removeUserAria(u.name)}
                    className="text-[#9b95ad] hover:text-rose-400 px-2">✕</button>
                )}
              </div>
            ))}
            {team.length === 0 && <p className="text-sm text-[#9b95ad]">{t.noUsers}</p>}
          </div>

          <form onSubmit={onAddUser} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
            <input value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} required placeholder={t.namePlaceholder}
              className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            <input value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} required type="email" placeholder={t.emailPlaceholder}
              className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-1" />
            <select value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}
              className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
              <option value="CONSULTANCY_USER">{t.roleUser}</option>
              <option value="CONSULTANCY_ADMIN">{t.roleAdmin}</option>
            </select>
            <button type="submit" disabled={addingUser}
              className="px-3 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40">
              {addingUser ? t.adding : t.addUser}
            </button>
          </form>
          {userMsg && <p className="text-sm text-amber-300 break-all">{userMsg}</p>}
        </div>
      )}
    </div>
  );
}
