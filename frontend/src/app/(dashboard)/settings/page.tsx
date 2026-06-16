"use client";

import { useEffect, useState } from "react";
import { getMe, updateBranding, getUsers, createUser, deleteUser } from "@/lib/api";

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
        if (data.role === "CONSULTANCY_ADMIN" || data.role === "PLATFORM_ADMIN") loadTeam();
      })
      .catch(() => setError("Erro ao carregar dados do usuario."))
      .finally(() => setLoading(false));
  }, []);

  async function onAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddingUser(true);
    setUserMsg("");
    try {
      const created = await createUser({ name: nu.name.trim(), email: nu.email.trim(), role: nu.role });
      setUserMsg(`Usuário criado. Senha temporária: ${created.tempPassword}`);
      setNu({ name: "", email: "", role: "CONSULTANCY_USER" });
      await loadTeam();
    } catch (err: any) {
      setUserMsg(err?.response?.data?.error || "Não foi possível criar o usuário.");
    } finally {
      setAddingUser(false);
    }
  }

  async function onRemoveUser(id: string, nm: string) {
    if (!window.confirm(`Remover ${nm}?`)) return;
    try {
      await deleteUser(id);
      await loadTeam();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Não foi possível remover.");
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
      setSavedMsg("Marca atualizada. Recarregue para ver no menu.");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Não foi possível salvar a marca.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  if (!user) return <div className="text-rose-400">{error || "Erro."}</div>;

  const isAdmin = user.role === "CONSULTANCY_ADMIN" || user.role === "PLATFORM_ADMIN";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuracoes</h1>
      {error && <div className="text-rose-400">{error}</div>}

      <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Perfil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="text-sm text-[#9b95ad]">Nome</p><p className="font-medium mt-0.5">{user.name}</p></div>
          <div><p className="text-sm text-[#9b95ad]">Email</p><p className="font-medium mt-0.5">{user.email}</p></div>
          <div><p className="text-sm text-[#9b95ad]">Consultoria</p><p className="font-medium mt-0.5">{user.consultancy?.name || "-"}</p></div>
          <div><p className="text-sm text-[#9b95ad]">Papel</p><p className="font-medium mt-0.5">{user.role}</p></div>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={onSaveBranding} className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl space-y-4">
          <h2 className="text-lg font-semibold">Marca (white-label)</h2>
          <div>
            <label htmlFor="brand-name" className="block text-sm text-[#9b95ad] mb-1">Nome exibido</label>
            <input id="brand-name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="brand-logo" className="block text-sm text-[#9b95ad] mb-1">URL do logo (PNG/SVG)</label>
            <input id="brand-logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..."
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="brand-color" className="block text-sm text-[#9b95ad] mb-1">Cor primária</label>
            <input id="brand-color" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-20 bg-[#0f0b1a] border border-white/[0.1] rounded-lg" />
          </div>
          {savedMsg && <p className="text-emerald-400 text-sm">{savedMsg}</p>}
          <button type="submit" disabled={saving}
            className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40">
            {saving ? "Salvando..." : "Salvar marca"}
          </button>
        </form>
      )}

      {isAdmin && (
        <div className="bg-[#1a1527] rounded-xl p-6 border border-white/[0.08] max-w-2xl space-y-4">
          <h2 className="text-lg font-semibold">Usuários da equipe</h2>
          <div className="space-y-2">
            {team.map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-[#0f0b1a] rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.name} <span className="text-[#9b95ad]">· {u.email}</span></p>
                  <p className="text-xs text-[#9b95ad]">{u.role}</p>
                </div>
                {u.id !== user.id && (
                  <button onClick={() => onRemoveUser(u.id, u.name)} aria-label={`Remover ${u.name}`}
                    className="text-[#9b95ad] hover:text-rose-400 px-2">✕</button>
                )}
              </div>
            ))}
            {team.length === 0 && <p className="text-sm text-[#9b95ad]">Nenhum usuário ainda.</p>}
          </div>

          <form onSubmit={onAddUser} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-white/[0.06]">
            <input value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} required placeholder="Nome"
              className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            <input value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} required type="email" placeholder="email@empresa.com"
              className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm sm:col-span-1" />
            <select value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}
              className="bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm">
              <option value="CONSULTANCY_USER">Usuário</option>
              <option value="CONSULTANCY_ADMIN">Admin</option>
            </select>
            <button type="submit" disabled={addingUser}
              className="px-3 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40">
              {addingUser ? "..." : "Adicionar"}
            </button>
          </form>
          {userMsg && <p className="text-sm text-amber-300 break-all">{userMsg}</p>}
        </div>
      )}
    </div>
  );
}
