"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/api";
import { useLang, type Lang } from "@/i18n/I18n";

const TXT: Record<Lang, {
  title: string; sub: string;
  name: string; email: string; password: string; passwordHint: string;
  razaoSocial: string; nomeFantasia: string; cnpj: string; phone: string;
  optional: string; terms1: string; termsLink: string; terms2: string; privacyLink: string;
  submit: string; sending: string; haveAccount: string; login: string; trial: string;
}> = {
  pt: {
    title: "Criar conta", sub: "Comece o teste grátis. Sem cartão. Leva 1 minuto.",
    name: "Seu nome", email: "E-mail corporativo", password: "Senha", passwordHint: "mínimo 8 caracteres",
    razaoSocial: "Razão social", nomeFantasia: "Nome fantasia", cnpj: "CNPJ", phone: "Telefone",
    optional: "opcional", terms1: "Li e aceito os ", termsLink: "Termos de Uso", terms2: " e a ", privacyLink: "Política de Privacidade",
    submit: "Criar conta e começar", sending: "Criando…", haveAccount: "Já tem conta?", login: "Entrar", trial: "✓ Teste grátis · plano Starter · sem cartão de crédito",
  },
  en: {
    title: "Create account", sub: "Start your free trial. No card. Takes 1 minute.",
    name: "Your name", email: "Work email", password: "Password", passwordHint: "minimum 8 characters",
    razaoSocial: "Legal company name", nomeFantasia: "Trade name", cnpj: "Tax ID (CNPJ)", phone: "Phone",
    optional: "optional", terms1: "I read and accept the ", termsLink: "Terms of Use", terms2: " and the ", privacyLink: "Privacy Policy",
    submit: "Create account & start", sending: "Creating…", haveAccount: "Already have an account?", login: "Sign in", trial: "✓ Free trial · Starter plan · no credit card",
  },
  es: {
    title: "Crear cuenta", sub: "Empieza la prueba gratis. Sin tarjeta. Toma 1 minuto.",
    name: "Tu nombre", email: "Correo corporativo", password: "Contraseña", passwordHint: "mínimo 8 caracteres",
    razaoSocial: "Razón social", nomeFantasia: "Nombre comercial", cnpj: "CNPJ", phone: "Teléfono",
    optional: "opcional", terms1: "Leí y acepto los ", termsLink: "Términos de Uso", terms2: " y la ", privacyLink: "Política de Privacidad",
    submit: "Crear cuenta y empezar", sending: "Creando…", haveAccount: "¿Ya tienes cuenta?", login: "Entrar", trial: "✓ Prueba gratis · plan Starter · sin tarjeta",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = TXT[lang];

  const [f, setF] = useState({ name: "", email: "", password: "", razaoSocial: "", nomeFantasia: "", cnpj: "", phone: "" });
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await register({ ...f, acceptedTerms: accepted });
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Falha ao criar a conta. Tente novamente.");
      setBusy(false);
    }
  }

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-[#0f0b1a] border border-white/[0.1] text-[#e2e0ea] placeholder:text-[#6b6580] focus:border-purple-500/60 focus:outline-none";

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1a1527] rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl">
        <h1 className="text-2xl font-bold text-[#e2e0ea]">{t.title}</h1>
        <p className="text-sm text-[#9b95ad] mt-1 mb-5">{t.sub}</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <input className={inputCls} placeholder={t.name} value={f.name} onChange={set("name")} required autoComplete="name" />
          <input className={inputCls} type="email" placeholder={t.email} value={f.email} onChange={set("email")} required autoComplete="email" />
          <div>
            <input className={inputCls} type="password" placeholder={t.password} value={f.password} onChange={set("password")} required minLength={8} autoComplete="new-password" />
            <p className="text-xs text-[#6b6580] mt-1 ml-1">{t.passwordHint}</p>
          </div>
          <input className={inputCls} placeholder={t.razaoSocial} value={f.razaoSocial} onChange={set("razaoSocial")} required />
          <input className={inputCls} placeholder={`${t.nomeFantasia} (${t.optional})`} value={f.nomeFantasia} onChange={set("nomeFantasia")} />
          <input className={inputCls} placeholder={t.cnpj} value={f.cnpj} onChange={set("cnpj")} required inputMode="numeric" />
          <input className={inputCls} placeholder={`${t.phone} (${t.optional})`} value={f.phone} onChange={set("phone")} autoComplete="tel" />

          <label className="flex items-start gap-2 text-xs text-[#9b95ad] pt-1 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required className="mt-0.5 accent-purple-500 cursor-pointer" />
            <span>
              {t.terms1}<Link href="/termos" target="_blank" className="text-purple-300 underline">{t.termsLink}</Link>{t.terms2}<Link href="/privacidade" target="_blank" className="text-purple-300 underline">{t.privacyLink}</Link>.
            </span>
          </label>

          {error && <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={busy} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold cursor-pointer disabled:opacity-50">
            {busy ? t.sending : t.submit}
          </button>
        </form>

        <p className="text-xs text-emerald-400/90 text-center mt-4">{t.trial}</p>
        <p className="text-sm text-[#9b95ad] text-center mt-3">
          {t.haveAccount} <Link href="/login" className="text-purple-300 hover:text-purple-200 underline">{t.login}</Link>
        </p>
      </div>
    </div>
  );
}
