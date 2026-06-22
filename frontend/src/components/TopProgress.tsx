"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Barra de progresso no topo: começa ao clicar num link interno e completa ao trocar de rota.
export default function TopProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [w, setW] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };

  const start = () => {
    clear();
    setActive(true); setW(8);
    let cur = 8;
    timer.current = setInterval(() => { cur = Math.min(90, cur + Math.random() * 12); setW(cur); }, 180);
  };

  const done = () => {
    clear(); setW(100);
    const t = setTimeout(() => { setActive(false); setW(0); }, 280);
    return () => clearTimeout(t);
  };

  // completa quando a rota muda (chegou no destino)
  useEffect(() => { return done(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [pathname]);

  // inicia ao clicar num link interno
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || !href.startsWith("/") || href.startsWith("/api") || target === "_blank") return;
      if (href === pathname || href === pathname + "/") return;
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); clear(); };
  }, [pathname]);

  if (!active) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-[3px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-[width] duration-200 ease-out shadow-[0_0_12px_rgba(124,58,237,0.8)]"
        style={{ width: `${w}%` }}
      />
    </div>
  );
}
