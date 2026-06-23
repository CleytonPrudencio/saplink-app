"use client";

import { useMemo } from "react";
import { useLang } from "@/i18n/I18n";
import { UI, tUI } from "@/i18n/ui";

// Renderizador de markdown leve (sem deps) para os diagnósticos de IA.
// Suporta: ## / ### títulos, **negrito**, `código`, listas - / * e 1., parágrafos.

function renderInline(text: string, keyBase: string) {
  // **bold** e `code`
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={`${keyBase}-b${i}`} className="font-semibold text-white">{tok.slice(2, -2)}</strong>);
    else parts.push(<code key={`${keyBase}-c${i}`} className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-200 font-mono text-[0.85em]">{tok.slice(1, -1)}</code>);
    last = m.index + tok.length; i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function MarkdownLite({ text }: { text: string }) {
  const blocks = useMemo(() => {
    const lines = (text || "").replace(/\r/g, "").split("\n");
    const out: React.ReactNode[] = [];
    let list: { ordered: boolean; items: string[] } | null = null;
    const flush = () => {
      if (!list) return;
      const L = list;
      out.push(
        L.ordered ? (
          <ol key={`ol${out.length}`} className="list-decimal pl-6 space-y-1.5 my-2 marker:text-purple-300">
            {L.items.map((it, i) => <li key={i} className="text-[#d6d3e0] leading-relaxed">{renderInline(it, `oli${out.length}-${i}`)}</li>)}
          </ol>
        ) : (
          <ul key={`ul${out.length}`} className="space-y-1.5 my-2">
            {L.items.map((it, i) => (
              <li key={i} className="text-[#d6d3e0] leading-relaxed flex gap-2"><span className="text-purple-400 mt-0.5">•</span><span>{renderInline(it, `uli${out.length}-${i}`)}</span></li>
            ))}
          </ul>
        )
      );
      list = null;
    };
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, "");
      if (!line.trim()) { flush(); continue; }
      const h = /^(#{1,4})\s+(.*)$/.exec(line);
      if (h) {
        flush();
        const lvl = h[1].length; const content = h[2].replace(/\*\*/g, "");
        out.push(
          <div key={`h${out.length}`} className={lvl <= 2 ? "mt-4 mb-1.5" : "mt-3 mb-1"}>
            <h3 className={`font-bold ${lvl <= 2 ? "text-base text-white" : "text-sm text-purple-200"}`}>{content}</h3>
            {lvl <= 2 && <div className="h-px bg-gradient-to-r from-purple-500/40 to-transparent mt-1.5" />}
          </div>
        );
        continue;
      }
      const ol = /^\s*(\d+)[.)]\s+(.*)$/.exec(line);
      const ul = /^\s*[-*]\s+(.*)$/.exec(line);
      if (ol) { if (!list || !list.ordered) { flush(); list = { ordered: true, items: [] }; } list.items.push(ol[2]); continue; }
      if (ul) { if (!list || list.ordered) { flush(); list = { ordered: false, items: [] }; } list.items.push(ul[1]); continue; }
      flush();
      out.push(<p key={`p${out.length}`} className="text-[#d6d3e0] leading-relaxed my-1.5">{renderInline(line, `p${out.length}`)}</p>);
    }
    flush();
    return out;
  }, [text]);

  return <div className="text-sm">{blocks}</div>;
}

/** Bloco de relatório de IA estilizado, com cabeçalho, metadados e botão de PDF. */
export function AiReport({
  text, title, subtitle, meta, onRefresh, refreshing,
}: {
  text: string; title?: string; subtitle?: string; meta?: { label: string; value: string }[];
  onRefresh?: () => void; refreshing?: boolean;
}) {
  const { lang } = useLang();
  const ttl = title ?? tUI(UI.comp.aiReportTitle, lang);
  function downloadPdf() {
    const safe = (s: string) => String(s || "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
    const bodyHtml = safe(text)
      .replace(/^(#{1,4})\s+(.*)$/gm, (_m, h, t) => `<h${Math.min(4, h.length + 1)}>${t.replace(/\*\*/g, "")}</h${Math.min(4, h.length + 1)}>`)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/^\s*[-*]\s+(.*)$/gm, "<li>$1</li>")
      .replace(/^\s*\d+[.)]\s+(.*)$/gm, "<li class='ol'>$1</li>")
      .split(/\n{2,}/).map((b) => (b.includes("<li") ? `<ul>${b}</ul>` : b.includes("<h") ? b : `<p>${b.replace(/\n/g, "<br/>")}</p>`)).join("\n");
    const metaHtml = (meta || []).map((m) => `<span class="m"><b>${safe(m.label)}:</b> ${safe(m.value)}</span>`).join("");
    const now = new Date().toLocaleString(tUI(UI.comp.aiLocale, lang));
    const w = window.open("", "_blank", "width=820,height=1000");
    if (!w) return;
    w.document.write(`<!doctype html><html lang="${tUI(UI.comp.aiLocale, lang)}"><head><meta charset="utf-8"><title>${safe(ttl)} — SAPLINK</title>
    <style>
      *{box-sizing:border-box} body{font-family:Arial,Helvetica,sans-serif;color:#1a1527;margin:0;padding:48px 56px;line-height:1.55}
      .brand{display:flex;align-items:center;gap:10px;border-bottom:3px solid #7c3aed;padding-bottom:14px;margin-bottom:8px}
      .brand .logo{font-size:26px;font-weight:800;background:linear-gradient(90deg,#7c3aed,#06b6d4);-webkit-background-clip:text;background-clip:text;color:transparent}
      .brand .tag{margin-left:auto;font-size:11px;color:#6b6580}
      h1{font-size:20px;margin:18px 0 4px} .sub{color:#6b6580;font-size:13px;margin:0 0 12px}
      .meta{display:flex;flex-wrap:wrap;gap:14px;background:#f5f3fb;border:1px solid #e6e1f5;border-radius:10px;padding:10px 14px;margin:14px 0;font-size:12px;color:#3a3550}
      h2,h3,h4{color:#4c2c91;margin:18px 0 6px} h3{font-size:15px} h4{font-size:13px}
      p{margin:8px 0} ul{margin:8px 0;padding-left:22px} li{margin:4px 0} li.ol{list-style:decimal}
      code{background:#efeafd;color:#5b21b6;padding:1px 5px;border-radius:4px;font-family:Consolas,monospace;font-size:12px}
      strong{color:#1a1527}
      .foot{margin-top:36px;border-top:1px solid #e6e1f5;padding-top:10px;font-size:10px;color:#9b95ad;display:flex;justify-content:space-between}
    </style></head><body>
      <div class="brand"><span class="logo">◆ SAPLINK</span><span class="tag">${tUI(UI.comp.aiByAi, lang)}</span></div>
      <h1>${safe(ttl)}</h1>${subtitle ? `<p class="sub">${safe(subtitle)}</p>` : ""}
      ${metaHtml ? `<div class="meta">${metaHtml}</div>` : ""}
      <div class="content">${bodyHtml}</div>
      <div class="foot"><span>SAPLINK · saplink.com.br</span><span>${tUI(UI.comp.aiIssuedOn, lang)} ${now}</span></div>
      <script>window.onload=function(){setTimeout(function(){window.print()},300)}</script>
    </body></html>`);
    w.document.close();
  }

  return (
    <div className="rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-500/[0.06] to-transparent overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-purple-500/15 bg-purple-500/[0.06] flex-wrap">
        <span className="text-base">🤖</span>
        <span className="text-sm font-semibold text-purple-200">{ttl}</span>
        {meta?.map((m) => <span key={m.label} className="text-[11px] text-[#9b95ad]">· {m.value}</span>)}
        <div className="ml-auto flex items-center gap-2">
          {onRefresh && <button onClick={onRefresh} className="text-xs text-[#9b95ad] hover:text-purple-300 underline">{refreshing ? tUI(UI.comp.aiAnalyzing, lang) : tUI(UI.comp.aiRedo, lang)}</button>}
          <button onClick={downloadPdf} className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-100 hover:bg-purple-500/30 flex items-center gap-1 cursor-pointer">⬇ PDF</button>
        </div>
      </div>
      <div className="px-4 py-3">
        <MarkdownLite text={text} />
      </div>
    </div>
  );
}
