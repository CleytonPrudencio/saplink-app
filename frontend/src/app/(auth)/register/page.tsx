"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/api";

const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");

function maskCnpj(v: string) {
  const c = onlyDigits(v).slice(0, 14);
  return c
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
function maskCep(v: string) {
  const c = onlyDigits(v).slice(0, 8);
  return c.replace(/^(\d{5})(\d)/, "$1-$2");
}
function isValidCnpj(input: string) {
  const c = onlyDigits(input);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const calc = (base: string, w: number[]) => {
    const s = base.split("").reduce((a, d, i) => a + +d * w[i], 0);
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(c.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(c.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === +c[12] && d2 === +c[13];
}

const empty = {
  razaoSocial: "", nomeFantasia: "", cnpj: "", ie: "", phone: "", billingEmail: "",
  cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
  name: "", email: "", password: "",
};

const inputCls = "w-full px-3 py-2 bg-[#0f0b1a] border border-white/[0.1] rounded-lg text-sm text-[#e2e0ea] placeholder-[#9b95ad]/40 focus:outline-none focus:border-purple-500/50 transition";

export default function RegisterPage() {
  const router = useRouter();
  const [f, setF] = useState({ ...empty });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookup, setLookup] = useState("");

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function lookupCnpj() {
    if (!isValidCnpj(f.cnpj)) return;
    setLookup("Buscando dados do CNPJ...");
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${onlyDigits(f.cnpj)}`);
      if (!r.ok) throw new Error();
      const d = await r.json();
      setF((p) => ({
        ...p,
        razaoSocial: p.razaoSocial || d.razao_social || "",
        nomeFantasia: p.nomeFantasia || d.nome_fantasia || "",
        cep: p.cep || maskCep(d.cep || ""),
        logradouro: p.logradouro || d.logradouro || "",
        numero: p.numero || d.numero || "",
        complemento: p.complemento || d.complemento || "",
        bairro: p.bairro || d.bairro || "",
        cidade: p.cidade || d.municipio || "",
        uf: p.uf || d.uf || "",
        phone: p.phone || (d.ddd_telefone_1 ? d.ddd_telefone_1 : ""),
      }));
      setLookup("✓ Dados preenchidos pelo CNPJ — confira e ajuste.");
    } catch {
      setLookup("Não achamos os dados automaticamente — preencha manualmente.");
    }
  }

  async function lookupCep() {
    const cep = onlyDigits(f.cep);
    if (cep.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) return;
      setF((p) => ({ ...p, logradouro: d.logradouro || p.logradouro, bairro: d.bairro || p.bairro, cidade: d.localidade || p.cidade, uf: d.uf || p.uf }));
    } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidCnpj(f.cnpj)) { setError("CNPJ inválido. Aceitamos apenas empresas (CNPJ)."); return; }
    if (f.password.length < 8) { setError("A senha precisa de ao menos 8 caracteres."); return; }
    if (!accepted) { setError("Você precisa aceitar os Termos de Uso."); return; }
    setLoading(true);
    try {
      const data = await register({ ...f, acceptedTerms: true });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        router.push("/billing"); // entra e escolhe o plano
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  const Label = ({ children, req }: { children: React.ReactNode; req?: boolean }) => (
    <label className="block text-xs font-medium text-[#9b95ad] mb-1">{children}{req && <span className="text-rose-400"> *</span>}</label>
  );

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-[#1a1527] rounded-2xl p-8 border border-white/[0.08] shadow-2xl">
        <div className="text-center mb-6">
          <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">◆ SAPLINK</Link>
          <p className="text-[#9b95ad] mt-2">Criar conta da empresa (apenas CNPJ)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg p-3">{error}</div>}

          {/* Empresa */}
          <div>
            <h2 className="text-sm font-semibold text-[#e2e0ea] mb-3 uppercase tracking-wider">Empresa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-1">
                <Label req>CNPJ</Label>
                <input className={inputCls} value={f.cnpj} onChange={(e) => set("cnpj", maskCnpj(e.target.value))} onBlur={lookupCnpj} placeholder="00.000.000/0000-00" inputMode="numeric" />
                {lookup && <p className="text-[11px] text-[#9b95ad] mt-1">{lookup}</p>}
              </div>
              <div><Label>Inscrição Estadual</Label><input className={inputCls} value={f.ie} onChange={(e) => set("ie", e.target.value)} placeholder="Isento ou número" /></div>
              <div><Label req>Razão Social</Label><input className={inputCls} value={f.razaoSocial} onChange={(e) => set("razaoSocial", e.target.value)} placeholder="Razão social (para a nota)" /></div>
              <div><Label>Nome Fantasia</Label><input className={inputCls} value={f.nomeFantasia} onChange={(e) => set("nomeFantasia", e.target.value)} placeholder="Nome fantasia" /></div>
              <div><Label>Telefone</Label><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(11) 99999-9999" /></div>
              <div><Label>E-mail financeiro (nota)</Label><input type="email" className={inputCls} value={f.billingEmail} onChange={(e) => set("billingEmail", e.target.value)} placeholder="financeiro@empresa.com" /></div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h2 className="text-sm font-semibold text-[#e2e0ea] mb-3 uppercase tracking-wider">Endereço (nota fiscal)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div className="col-span-2 sm:col-span-2"><Label>CEP</Label><input className={inputCls} value={f.cep} onChange={(e) => set("cep", maskCep(e.target.value))} onBlur={lookupCep} placeholder="00000-000" inputMode="numeric" /></div>
              <div className="col-span-2 sm:col-span-3"><Label>Logradouro</Label><input className={inputCls} value={f.logradouro} onChange={(e) => set("logradouro", e.target.value)} placeholder="Rua / Av." /></div>
              <div className="col-span-2 sm:col-span-1"><Label>Número</Label><input className={inputCls} value={f.numero} onChange={(e) => set("numero", e.target.value)} placeholder="123" /></div>
              <div className="col-span-2 sm:col-span-2"><Label>Complemento</Label><input className={inputCls} value={f.complemento} onChange={(e) => set("complemento", e.target.value)} placeholder="Sala / andar" /></div>
              <div className="col-span-2 sm:col-span-2"><Label>Bairro</Label><input className={inputCls} value={f.bairro} onChange={(e) => set("bairro", e.target.value)} /></div>
              <div className="col-span-1 sm:col-span-1"><Label>Cidade</Label><input className={inputCls} value={f.cidade} onChange={(e) => set("cidade", e.target.value)} /></div>
              <div className="col-span-1 sm:col-span-1"><Label>UF</Label><input className={inputCls} value={f.uf} maxLength={2} onChange={(e) => set("uf", e.target.value.toUpperCase())} placeholder="SP" /></div>
            </div>
          </div>

          {/* Administrador */}
          <div>
            <h2 className="text-sm font-semibold text-[#e2e0ea] mb-3 uppercase tracking-wider">Administrador da conta</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><Label req>Seu nome</Label><input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Nome completo" /></div>
              <div><Label req>E-mail (login)</Label><input type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="voce@empresa.com" /></div>
              <div><Label req>Senha</Label><input type="password" className={inputCls} value={f.password} onChange={(e) => set("password", e.target.value)} placeholder="mín. 8 caracteres" /></div>
            </div>
          </div>

          {/* Termos */}
          <label className="flex items-start gap-3 text-sm text-[#9b95ad] cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 accent-purple-500" />
            <span>Li e aceito os <Link href="/termos" target="_blank" className="text-purple-400 hover:text-purple-300 underline">Termos de Uso</Link> do SAPLINK.</span>
          </label>

          <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50 cursor-pointer">
            {loading ? "Criando conta..." : "Criar conta e escolher plano →"}
          </button>
        </form>

        <p className="text-center text-sm text-[#9b95ad] mt-6">
          Já tem conta? <Link href="/login" className="text-purple-400 hover:text-purple-300">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
