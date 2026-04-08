"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getClients } from "@/lib/api";
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

  useEffect(() => {
    getClients()
      .then((data) => setClients(Array.isArray(data) ? data : data.data || []))
      .catch(() => setError("Erro ao carregar clientes."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[#9b95ad]">Carregando...</div>;
  if (error) return <div className="text-rose-400">{error}</div>;

  function scoreColor(score: number) {
    if (score >= 80) return "border-l-emerald-500";
    if (score >= 50) return "border-l-amber-500";
    return "border-l-rose-500";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => router.push(`/clients/${client.id}`)}
            className={`bg-[#1a1527] rounded-xl p-5 border border-white/[0.08] border-l-4 ${scoreColor(
              client.healthScore
            )} hover:bg-[#231d35] transition-colors cursor-pointer`}
          >
            <div className="flex items-center gap-4">
              <HealthScoreRing score={client.healthScore || 0} size={64} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{client.name}</h3>
                <div className="flex gap-4 mt-1 text-sm text-[#9b95ad]">
                  <span>{client.integrationCount || 0} integracoes</span>
                  <span>{client.alertCount || 0} alertas</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <p className="text-[#9b95ad]">Nenhum cliente cadastrado.</p>
      )}
    </div>
  );
}
