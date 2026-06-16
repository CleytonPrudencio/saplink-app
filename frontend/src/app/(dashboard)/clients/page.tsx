"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClients, createClient, deleteClient } from "@/lib/api";
import HealthScoreRing from "@/components/HealthScoreRing";

interface Client {
  id: string;
  name: string;
  healthScore: number;
  integrationCount: number;
  alertCount: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(Array.isArray(data) ? data : data.data || []);
      setError("");
    } catch {
      setError("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await createClient({ name: name.trim(), cnpj: cnpj.trim() || undefined });
      setName("");
      setCnpj("");
      setShowForm(false);
      await load();
    } catch (err: any) {
      setFormError(err?.response?.data?.error || "Não foi possível criar o cliente.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string, clientName: string) {
    if (!window.confirm(`Excluir o cliente "${clientName}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteClient(id);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Não foi possível excluir.");
    }
  }

  function scoreColor(score: number) {
    if (score >= 80) return "border-l-emerald-500";
    if (score >= 50) return "border-l-amber-500";
    return "border-l-rose-500";
  }

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold"
        >
          {showForm ? "Cancelar" : "+ Novo cliente"}
        </button>
      </div>

      {error && <div className="text-rose-400">{error}</div>}

      {showForm && (
        <form onSubmit={onCreate} className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08] max-w-xl space-y-3">
          <div>
            <label htmlFor="cli-name" className="block text-sm text-[#9b95ad] mb-1">Nome do cliente *</label>
            <input
              id="cli-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
              placeholder="Ex.: Indústria Acme"
            />
          </div>
          <div>
            <label htmlFor="cli-cnpj" className="block text-sm text-[#9b95ad] mb-1">CNPJ (opcional)</label>
            <input
              id="cli-cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              className="w-full bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm"
              placeholder="00.000.000/0001-00"
            />
          </div>
          {formError && <p className="text-rose-400 text-sm">{formError}</p>}
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold disabled:opacity-40"
          >
            {saving ? "Salvando..." : "Criar cliente"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            className={`bg-[#1a1527] rounded-xl p-5 border border-white/[0.08] border-l-4 ${scoreColor(
              client.healthScore
            )} hover:bg-[#231d35] transition-colors`}
          >
            <div className="flex items-center gap-4">
              <div
                onClick={() => router.push(`/clients/${client.id}`)}
                className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
              >
                <HealthScoreRing score={client.healthScore || 0} size={64} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{client.name}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-[#9b95ad]">
                    <span>{client.integrationCount || 0} integracoes</span>
                    <span>{client.alertCount || 0} alertas</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDelete(client.id, client.name)}
                aria-label={`Excluir ${client.name}`}
                className="text-[#9b95ad] hover:text-rose-400 text-lg px-1"
                title="Excluir cliente"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-[#9b95ad] mb-3">Nenhum cliente cadastrado ainda.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold"
          >
            + Cadastrar primeiro cliente
          </button>
        </div>
      )}
    </div>
  );
}
