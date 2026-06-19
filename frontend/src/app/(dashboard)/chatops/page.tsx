"use client";

import { useEffect, useRef, useState } from "react";
import { getChatops, rotateChatopsToken, runChatops, getMe } from "@/lib/api";

const SUGGEST = ["O que está falhando agora?", "Resumo da carteira", "Saúde do cliente Agro", "Reprocessa os itens do cliente Agro"];

export default function ChatOpsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cfg, setCfg] = useState<{ enabled: boolean; hasToken: boolean; token?: string } | null>(null);
  const [msgs, setMsgs] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatops().then(setCfg).catch(() => {});
    getMe().then((u) => setIsAdmin(u.role === "CONSULTANCY_ADMIN" || u.role === "PLATFORM_ADMIN")).catch(() => {});
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setMsgs((m) => [...m, { role: "user", text }]); setInput(""); setBusy(true);
    try { const r = await runChatops(text); setMsgs((m) => [...m, { role: "bot", text: r.reply }]); }
    catch { setMsgs((m) => [...m, { role: "bot", text: "Erro ao processar o comando." }]); }
    finally { setBusy(false); }
  }
  async function genToken() { const r = await rotateChatopsToken("whatsapp"); setCfg((c) => ({ ...(c || { enabled: true, hasToken: true }), hasToken: true, token: r.token })); }

  const base = typeof window !== "undefined" ? window.location.origin.replace(":3000", "") : "";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">💬 ChatOps</h1>
        <p className="text-[#9b95ad] text-sm mt-1">Opere o SAP por mensagem (WhatsApp/Telegram). Comandos que mexem no SAP criam pedido com aprovação — nada destrutivo roda direto.</p>
      </div>

      {/* Console */}
      <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl flex flex-col h-[440px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.length === 0 && <p className="text-sm text-[#9b95ad]">Teste aqui como se fosse o WhatsApp. Ex.: &quot;o que está falhando agora?&quot;</p>}
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "bg-gradient-to-r from-emerald-600 to-cyan-500 text-white" : "bg-[#0f0b1a] border border-white/[0.08] text-[#e2e0ea]"}`}>{m.text}</div>
            </div>
          ))}
          {busy && <div className="text-xs text-[#9b95ad]">processando…</div>}
          <div ref={endRef} />
        </div>
        <div className="p-3 border-t border-white/[0.08]">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SUGGEST.map((s) => <button key={s} onClick={() => send(s)} className="text-[11px] px-2 py-1 rounded-full bg-white/[0.06] text-[#9b95ad] hover:text-white cursor-pointer">{s}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite um comando…" className="flex-1 bg-[#0f0b1a] border border-white/[0.1] rounded-lg px-3 py-2 text-sm" />
            <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40 cursor-pointer">Enviar</button>
          </form>
        </div>
      </div>

      {/* Conexão de canal (admin) */}
      {isAdmin && (
        <div className="bg-[#1a1527] border border-white/[0.08] rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-1">🔌 Conectar WhatsApp / Telegram</h2>
          <p className="text-[#9b95ad] text-sm mb-3">Gere um token e aponte o webhook do seu provedor (WhatsApp Cloud API, Twilio, Telegram) para o endpoint abaixo. As mensagens passam a ser respondidas automaticamente.</p>
          {cfg?.token ? (
            <div className="space-y-2 text-sm">
              <div className="bg-[#0f0b1a] rounded-lg p-3 font-mono text-xs break-all">
                <div className="text-[#9b95ad]">Endpoint (POST):</div>
                <div className="text-cyan-300">{base}/api/chatops/in</div>
                <div className="text-[#9b95ad] mt-2">Header:</div>
                <div className="text-emerald-300">x-chatops-token: {cfg.token}</div>
                <div className="text-[#9b95ad] mt-2">Body:</div>
                <div className="text-[#e2e0ea]">{`{ "text": "o que está falhando?" }`}</div>
              </div>
              <button onClick={genToken} className="text-xs text-[#9b95ad] underline hover:text-white">Gerar novo token (invalida o anterior)</button>
            </div>
          ) : (
            <button onClick={genToken} className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-semibold cursor-pointer">Gerar token de canal</button>
          )}
        </div>
      )}
    </div>
  );
}
