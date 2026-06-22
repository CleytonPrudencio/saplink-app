"use client";

import { useEffect, useState } from "react";

/** Paginação client-side: pagina uma lista já carregada. */
export function usePaginate<T>(items: T[], pageSize = 20) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [page, totalPages]);
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  return { page, setPage, totalPages, total, pageItems, start, pageSize };
}

export function Pagination({ page, setPage, totalPages, total, pageSize, start }: { page: number; setPage: (n: number) => void; totalPages: number; total: number; pageSize: number; start: number }) {
  if (total <= pageSize) return null;
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(total, start + pageSize);
  // janela de páginas
  const win = 5;
  let a = Math.max(1, page - Math.floor(win / 2));
  const b = Math.min(totalPages, a + win - 1);
  a = Math.max(1, b - win + 1);
  const nums: number[] = [];
  for (let i = a; i <= b; i++) nums.push(i);
  const btn = "min-w-[34px] h-[34px] px-2 rounded-lg text-sm cursor-pointer disabled:opacity-40 disabled:cursor-default";
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mt-3">
      <span className="text-xs text-[#9b95ad]">{from}–{to} de {total}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className={`${btn} bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.12]`}>‹</button>
        {a > 1 && <span className="text-[#6b6580] px-1">…</span>}
        {nums.map((n) => (
          <button key={n} onClick={() => setPage(n)} className={`${btn} ${n === page ? "bg-purple-500/30 text-purple-200" : "bg-white/[0.06] text-[#9b95ad] hover:bg-white/[0.12]"}`}>{n}</button>
        ))}
        {b < totalPages && <span className="text-[#6b6580] px-1">…</span>}
        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className={`${btn} bg-white/[0.06] text-[#e2e0ea] hover:bg-white/[0.12]`}>›</button>
      </div>
    </div>
  );
}
