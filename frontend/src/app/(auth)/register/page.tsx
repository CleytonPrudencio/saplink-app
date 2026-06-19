"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Cadastro temporariamente FECHADO. Quem quiser entrar manifesta interesse na landing.
export default function RegisterClosedPage() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace("/"), 4000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#1a1527] rounded-2xl p-8 border border-white/[0.08] shadow-2xl text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-xl font-bold text-[#e2e0ea] mb-2">Cadastro indisponível no momento</h1>
        <p className="text-[#9b95ad] leading-relaxed mb-6">
          As inscrições estão temporariamente fechadas. Deixe seu interesse e o nosso time entra em contato.
        </p>
        <Link href="/" className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold cursor-pointer">
          Tenho interesse
        </Link>
        <p className="text-xs text-[#6b6580] mt-4">Redirecionando para a página inicial…</p>
      </div>
    </div>
  );
}
