"use client";

import { useState } from "react";
import { explainScreen } from "@/lib/api";
import { AiReport } from "@/components/AiReport";

// Botão reutilizável "Explique e recomende": manda os dados da tela para a IA
// e mostra leitura + pontos de atenção + o que fazer. Torna qualquer tela acionável.
export default function ExplainData({ screen, data, label = "Explique e recomende (IA)" }: { screen: string; data: unknown; label?: string }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  async function run() {
    setLoading(true); setErr(false);
    try { const r = await explainScreen(screen, data); setText(r.text); }
    catch { setErr(true); } finally { setLoading(false); }
  }

  if (!text && !loading && !err) {
    return (
      <button onClick={run} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-purple-500/15 text-purple-200 hover:bg-purple-500/25 cursor-pointer">
        🤖 {label}
      </button>
    );
  }
  return (
    <div className="space-y-2">
      {loading ? (
        <div className="text-sm text-purple-300 flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin inline-block" /> A IA está lendo esta tela…
        </div>
      ) : err ? (
        <div className="text-sm text-rose-300">Não foi possível analisar agora. <button onClick={run} className="underline cursor-pointer">Tentar de novo</button></div>
      ) : (
        <AiReport text={text as string} title="O que estes dados dizem" subtitle="Leitura, pontos de atenção e próximas ações" onRefresh={run} refreshing={loading} />
      )}
    </div>
  );
}
