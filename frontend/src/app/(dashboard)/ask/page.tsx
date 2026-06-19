"use client";

import { useState, useRef, useEffect } from "react";
import { askPortfolio } from "@/lib/api";
import { MarkdownLite } from "@/components/AiReport";

interface Msg { role: "user" | "ai"; text: string }

const SUGGESTIONS = [
  "Quais clientes têm integração com erro agora?",
  "Resumo da saúde da minha carteira",
  "Quais integrações estão com uptime abaixo do SLA?",
  "Onde estão os alertas mais críticos?",
  "Qual cliente precisa de atenção urgente?",
];

export default function AskPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  async function send(question: string) {
    const text = question.trim();
    if (!text || loading) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setQ("");
    setLoading(true);
    try {
      const r = await askPortfolio(text);
      setMsgs((m) => [...m, { role: "ai", text: r.answer || "Sem resposta." }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "ai", text: e?.response?.data?.error || "Erro ao consultar o copiloto." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-160px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">🤖 Pergunte ao SAPLINK</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Copiloto de operação — pergunte em linguagem natural sobre toda a sua carteira.</p>
      </div>

      {/* Conversa */}
      <div className="flex-1 overflow-auto space-y-3 pr-1">
        {msgs.length === 0 && (
          <div className="text-center text-[#9b95ad] mt-10">
            <p className="mb-4">Comece com uma pergunta:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="px-3 py-2 text-sm rounded-lg bg-[#1a1527] border border-white/[0.08] hover:border-purple-500/40 hover:text-white transition cursor-pointer text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white whitespace-pre-wrap" : "bg-[#1a1527] border border-white/[0.08] text-[#e2e0ea]"}`}>
              {m.role === "ai" ? <MarkdownLite text={m.text} /> : m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1527] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#9b95ad] flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              Analisando a carteira... pode levar até ~1 min.
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); send(q); }} className="mt-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pergunte sobre clientes, integrações, alertas..."
          className="flex-1 px-4 py-3 bg-[#1a1527] border border-white/[0.1] rounded-xl text-sm focus:outline-none focus:border-purple-500/50"
        />
        <button type="submit" disabled={loading || !q.trim()} className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold disabled:opacity-40 cursor-pointer">
          Enviar
        </button>
      </form>
    </div>
  );
}
