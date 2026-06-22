"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, ssoProviderForEmail, API_BASE } from "@/lib/api";
import Logo from "@/components/Logo";
import LangSwitcher from "@/components/LangSwitcher";
import { useLang } from "@/i18n/I18n";
import { UI, tUI } from "@/i18n/ui";

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sso, setSso] = useState<{ consultancyId: string; provider: string } | null>(null);

  // Retorno do SSO: token na URL ou erro
  useEffect(() => {
    const u = new URLSearchParams(window.location.search);
    const tok = u.get("ssoToken");
    if (tok) { localStorage.setItem("token", tok); router.replace("/dashboard"); return; }
    const err = u.get("ssoError");
    if (err) setError(decodeURIComponent(err));
  }, [router]);

  // Detecta SSO pelo domínio do e-mail digitado
  useEffect(() => {
    if (!email.includes("@") || email.split("@")[1].length < 3) { setSso(null); return; }
    const t = setTimeout(() => { ssoProviderForEmail(email).then((r) => setSso(r.provider)).catch(() => setSso(null)); }, 400);
    return () => clearTimeout(t);
  }, [email]);

  function goSso() { if (sso) window.location.href = `${API_BASE}/auth/sso/start?consultancyId=${encodeURIComponent(sso.consultancyId)}`; }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      setError(msg || tUI(UI.auth.loginError, lang));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-end mb-3"><LangSwitcher /></div>
      <div className="bg-[#1a1527] rounded-2xl p-8 border border-white/[0.08] shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <Logo size={44} />
          <p className="text-[#9b95ad] mt-3">{tUI(UI.auth.subtitle, lang)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#9b95ad] mb-1.5">
              {tUI(UI.auth.email, lang)}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#0f0b1a] border border-white/[0.08] rounded-lg text-[#e2e0ea] placeholder-[#9b95ad]/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9b95ad] mb-1.5">
              {tUI(UI.auth.password, lang)}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#0f0b1a] border border-white/[0.08] rounded-lg text-[#e2e0ea] placeholder-[#9b95ad]/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-colors"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {loading ? tUI(UI.auth.signingIn, lang) : tUI(UI.auth.signIn, lang)}
          </button>

          {sso && (
            <button
              type="button"
              onClick={goSso}
              className="w-full py-2.5 bg-[#0f0b1a] border border-purple-500/40 text-purple-200 font-semibold rounded-lg hover:bg-purple-500/10 transition-colors cursor-pointer"
            >
              🔐 {tUI(UI.auth.ssoWith, lang)} ({sso.provider === "azure" ? "Microsoft" : sso.provider === "google" ? "Google" : "Okta"})
            </button>
          )}
        </form>

        <p className="text-center text-sm text-[#9b95ad] mt-6">
          {tUI(UI.auth.interestQ, lang)}{" "}
          <Link
            href="/"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {tUI(UI.auth.interest, lang)}
          </Link>
        </p>
      </div>
    </div>
  );
}
