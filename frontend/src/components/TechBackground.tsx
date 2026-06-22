"use client";

import { useEffect, useRef } from "react";

// Fundo global animado: rede de sistemas SAP com pacotes de dados (cometas) fluindo,
// nós que cintilam e constelação que reage ao cursor. fixed + -z-10 + pointer-events-none.
export default function TechBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let raf = 0; let w = 0, h = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    type Node = { x: number; y: number; vx: number; vy: number; label: string; hub: boolean; tw: number };
    type Packet = { a: number; b: number; t: number; speed: number; color: string };
    const LABELS = ["S/4HANA", "CPI", "Ariba", "BTP", "SuccessFactors", "Event Mesh", "HANA", "NF-e", "AIF"];
    let nodes: Node[] = [];
    let packets: Packet[] = [];
    const COLORS = ["#a78bfa", "#22d3ee", "#34d399"];
    const mouse = { x: -9999, y: -9999, on: false };

    const count = () => Math.max(20, Math.min(70, Math.round((w * h) / 28000)));

    const seed = () => {
      const n = count();
      let hubs = 0;
      nodes = Array.from({ length: n }, (_, i) => {
        const hub = hubs < 7 && Math.random() < 0.16; if (hub) hubs++;
        return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32, label: LABELS[hubs % LABELS.length], hub, tw: Math.random() * Math.PI * 2 };
      });
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

    const LINK = 180, MOUSE_R = 220;
    const at = (pk: Packet, t: number) => { const a = nodes[pk.a], b = nodes[pk.b]; return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; };

    let frame = 0; let last = 0; const FPS = 30, MIN_DT = 1000 / FPS;
    const draw = (ts?: number) => {
      if (!reduce) raf = requestAnimationFrame(draw);
      const now = ts || 0;
      if (now - last < MIN_DT) return; // throttle ~30fps
      last = now;
      frame++;
      ctx.clearRect(0, 0, w, h);

      for (const p of nodes) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.05;
        if (mouse.on) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130) { const d = Math.sqrt(d2) || 1, f = (1 - d / 130) * 0.7; p.x += (dx / d) * f; p.y += (dy / d) * f; }
        }
        if (p.x < 0) { p.x = 0; p.vx *= -1; } if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; } if (p.y > h) { p.y = h; p.vy *= -1; }
      }

      // links entre nós
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]; const dx = a.x - b.x, dy = a.y - b.y; const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const o = (1 - Math.sqrt(d2) / LINK) * 0.5;
          ctx.strokeStyle = `rgba(124,58,237,${o})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      // constelação no cursor
      if (mouse.on) {
        for (const p of nodes) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 > MOUSE_R * MOUSE_R) continue;
          const o = (1 - Math.sqrt(d2) / MOUSE_R) * 0.75;
          ctx.strokeStyle = `rgba(34,211,238,${o})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
      }

      // pacotes (cometa: cauda + cabeça brilhante)
      if (!reduce && packets.length < count() * 1.6 && frame % 6 === 0) {
        const i = (Math.random() * nodes.length) | 0; const opts: number[] = [];
        for (let j = 0; j < nodes.length; j++) { if (j === i) continue; const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y; if (dx * dx + dy * dy < LINK * LINK) opts.push(j); }
        if (opts.length) packets.push({ a: i, b: opts[(Math.random() * opts.length) | 0], t: 0, speed: 0.012 + Math.random() * 0.02, color: COLORS[(Math.random() * COLORS.length) | 0] });
      }
      packets = packets.filter((pk) => pk.t <= 1);
      for (const pk of packets) {
        if (!nodes[pk.a] || !nodes[pk.b]) { pk.t = 2; continue; }
        pk.t += pk.speed;
        const head = at(pk, Math.min(1, pk.t)); const tail = at(pk, Math.max(0, pk.t - 0.12));
        const g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, pk.color);
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(head.x, head.y); ctx.stroke();
        ctx.fillStyle = pk.color; ctx.shadowColor = pk.color; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(head.x, head.y, 2.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;

      // nós cintilando
      for (const p of nodes) {
        const tw = 0.55 + Math.sin(p.tw) * 0.35;
        if (p.hub) {
          ctx.fillStyle = `rgba(167,139,250,${0.9 * tw + 0.1})`; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(226,224,234,0.32)"; ctx.font = "9px ui-sans-serif, system-ui";
          ctx.fillText(p.label, p.x + 7, p.y - 6);
        } else {
          ctx.fillStyle = `rgba(34,211,238,${0.7 * tw})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, 1.7, 0, Math.PI * 2); ctx.fill();
        }
      }
    };

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; };
    const onLeave = () => { mouse.on = false; };

    const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); } else if (!reduce) { last = 0; raf = requestAnimationFrame(draw); } };
    if (reduce) draw(1e9); else raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseout", onLeave); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // sem máscara vertical (evita a faixa de gradiente forte no topo) — canvas uniforme e sutil
  return <canvas ref={ref} aria-hidden className="fixed inset-0 -z-10 pointer-events-none" style={{ opacity: 0.5 }} />;
}
