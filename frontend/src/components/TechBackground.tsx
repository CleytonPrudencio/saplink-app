"use client";

import { useEffect, useRef } from "react";

// Fundo global animado: rede de sistemas SAP com pacotes de dados fluindo entre os nós.
// fixed + pointer-events-none + -z-10 → fica atrás de todo o conteúdo, em todas as páginas.
export default function TechBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0; let w = 0, h = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    type Node = { x: number; y: number; vx: number; vy: number; label: string; hub: boolean; pulse: number };
    type Packet = { a: number; b: number; t: number; speed: number; color: string };
    const LABELS = ["S/4HANA", "CPI", "IDoc", "Ariba", "SF", "BTP", "RFC", "AIF", "Event Mesh", "NF-e", "PI/PO", "HANA", "Concur", "OData", "API", "EDI", "SuccessFactors", "Commerce"];
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    const COLORS = ["#a78bfa", "#22d3ee", "#34d399"];
    const mouse = { x: -9999, y: -9999 };

    const count = () => Math.max(18, Math.min(64, Math.round((w * h) / 30000)));

    const seed = () => {
      const n = count();
      nodes = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        label: LABELS[i % LABELS.length], hub: Math.random() < 0.26, pulse: Math.random() * Math.PI * 2,
      }));
      packets = [];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();

    const LINK = 185;
    const linked = (i: number, j: number) => {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy < LINK * LINK;
    };

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // mover nós + repulsão suave do mouse
      for (const p of nodes) {
        p.x += p.vx; p.y += p.vy;
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y; const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 140 * 140) { const f = (1 - Math.sqrt(md2) / 140) * 0.6; p.x += (mdx / (Math.sqrt(md2) || 1)) * f; p.y += (mdy / (Math.sqrt(md2) || 1)) * f; }
        if (p.x < 0) { p.x = 0; p.vx *= -1; } if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; } if (p.y > h) { p.y = h; p.vy *= -1; }
        p.pulse += 0.04;
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (!linked(i, j)) continue;
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const o = (1 - d / LINK) * 0.5;
          ctx.strokeStyle = `rgba(124,58,237,${o})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      // pacotes (dados fluindo entre sistemas)
      if (!reduce && packets.length < count() * 1.4 && frame % 8 === 0) {
        const i = (Math.random() * nodes.length) | 0;
        const opts: number[] = [];
        for (let j = 0; j < nodes.length; j++) if (j !== i && linked(i, j)) opts.push(j);
        if (opts.length) packets.push({ a: i, b: opts[(Math.random() * opts.length) | 0], t: 0, speed: 0.01 + Math.random() * 0.016, color: COLORS[(Math.random() * COLORS.length) | 0] });
      }
      packets = packets.filter((pk) => pk.t <= 1);
      for (const pk of packets) {
        const a = nodes[pk.a], b = nodes[pk.b];
        if (!a || !b) { pk.t = 2; continue; }
        pk.t += pk.speed;
        const x = a.x + (b.x - a.x) * pk.t, y = a.y + (b.y - a.y) * pk.t;
        ctx.fillStyle = pk.color; ctx.shadowColor = pk.color; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;

      // nós (hubs pulsam + rótulo)
      for (const p of nodes) {
        if (p.hub) {
          const r = 3 + Math.sin(p.pulse) * 0.8;
          ctx.fillStyle = "rgba(167,139,250,0.95)"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(226,224,234,0.5)"; ctx.font = "10px ui-sans-serif, system-ui";
          ctx.fillText(p.label, p.x + 7, p.y - 6);
        } else {
          ctx.fillStyle = "rgba(34,211,238,0.7)";
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    if (reduce) draw(); else raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseout", onLeave); };
  }, []);

  // máscara vertical: desvanece no topo (atrás do header) e na base — some o "corte" estranho
  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.55, maskImage: "linear-gradient(to bottom, transparent 0, #000 110px, #000 88%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 110px, #000 88%, transparent 100%)" }}
    />
  );
}
