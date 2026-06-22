"use client";

import { useEffect, useState } from "react";
import { getVapidKey, subscribePush } from "@/lib/api";

function urlB64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushSetup() {
  const [state, setState] = useState<"idle" | "unsupported" | "granted" | "denied" | "loading">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) { setState("unsupported"); return; }
    navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (Notification.permission === "granted") setState("granted");
    else if (Notification.permission === "denied") setState("denied");
  }, []);

  async function enable() {
    setState("loading");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setState("denied"); return; }
      const reg = await navigator.serviceWorker.ready;
      const { key } = await getVapidKey();
      if (!key) { setState("idle"); return; }
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(key) });
      await subscribePush(sub);
      setState("granted");
    } catch { setState("idle"); }
  }

  if (state === "unsupported" || state === "granted") return null;
  return (
    <button
      onClick={enable}
      disabled={state === "loading"}
      className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 cursor-pointer disabled:opacity-50 no-print"
      title="Receber alertas no celular/desktop"
    >
      {state === "loading" ? "Ativando…" : state === "denied" ? "🔔 Notificações bloqueadas" : "🔔 Ativar alertas"}
    </button>
  );
}
