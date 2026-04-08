"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getIntegrationTypes,
  getClients,
  createIntegration,
  testIntegration,
} from "@/lib/api";

interface TypeField {
  key: string;
  name?: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface IntegrationType {
  type: string;
  name: string;
  description: string;
  icon?: string;
  fields: TypeField[];
}

interface Client {
  id: string;
  name: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

const typeIcons: Record<string, string> = {
  SAP_RFC: "RF",
  SAP_ODATA: "OD",
  SAP_BAPI: "BA",
  SAP_IDOC: "ID",
  SAP_HANA: "HN",
  REST_API: "AP",
  DATABASE: "DB",
  FILE_SFTP: "SF",
};

const steps = [
  "Escolher Tipo",
  "Dados Basicos",
  "Configuracao",
  "Testar Conexao",
];

export default function NewIntegrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1
  const [types, setTypes] = useState<IntegrationType[]>([]);
  const [selectedType, setSelectedType] = useState<IntegrationType | null>(null);
  const [typesLoading, setTypesLoading] = useState(true);

  // Step 2
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientsLoading, setClientsLoading] = useState(false);

  // Step 3
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  // Step 4
  const [creating, setCreating] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    getIntegrationTypes()
      .then((data) => setTypes(Array.isArray(data) ? data : data.data || []))
      .catch(() => {})
      .finally(() => setTypesLoading(false));
  }, []);

  useEffect(() => {
    if (step === 1 && clients.length === 0) {
      setClientsLoading(true);
      getClients()
        .then((data) => setClients(Array.isArray(data) ? data : data.data || []))
        .catch(() => {})
        .finally(() => setClientsLoading(false));
    }
  }, [step, clients.length]);

  function canAdvance(): boolean {
    if (step === 0) return selectedType !== null;
    if (step === 1) return name.trim() !== "" && selectedClientId !== "";
    if (step === 2) {
      if (!selectedType) return false;
      return selectedType.fields
        .filter((f) => f.required)
        .every((f) => configValues[f.key]?.trim());
    }
    return false;
  }

  function handleConfigChange(fieldName: string, value: string) {
    setConfigValues((prev) => ({ ...prev, [fieldName]: value }));
  }

  async function handleCreate() {
    if (!selectedType) return;
    setCreating(true);
    setCreateError("");
    try {
      const payload = {
        name,
        description,
        type: selectedType.type,
        clientId: selectedClientId,
        config: configValues,
      };
      const result = await createIntegration(payload);
      setCreatedId(result.id || result.data?.id);
    } catch {
      setCreateError("Erro ao criar integracao. Tente novamente.");
    } finally {
      setCreating(false);
    }
  }

  async function handleTest() {
    if (!createdId) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testIntegration(createdId);
      setTestResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao testar conexao";
      setTestResult({ success: false, message, details: {} });
    } finally {
      setTesting(false);
    }
  }

  const selectedClientName = clients.find((c) => c.id === selectedClientId)?.name || "";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        {steps.map((label, idx) => (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  idx < step
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : idx === step
                    ? "bg-purple-500 border-purple-500 text-white"
                    : "bg-transparent border-white/20 text-[#9b95ad]"
                }`}
              >
                {idx < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap ${idx === step ? "text-purple-400" : "text-[#9b95ad]"}`}>
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mt-[-1rem] ${idx < step ? "bg-emerald-500" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 - Choose Type */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Escolha o tipo de integracao</h2>
            <p className="text-[#9b95ad] text-sm mt-1">Selecione o tipo de sistema que deseja integrar</p>
          </div>

          {typesLoading ? (
            <p className="text-[#9b95ad]">Carregando tipos...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {types.map((t) => {
                const isSelected = selectedType?.type === t.type;
                return (
                  <div
                    key={t.type}
                    onClick={() => setSelectedType(t)}
                    className={`bg-[#1a1527] rounded-xl p-4 border-2 cursor-pointer transition-all hover:bg-[#231d35] ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/5"
                        : "border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                        {t.icon || typeIcons[t.type] || t.type.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{t.name}</p>
                          {isSelected && (
                            <span className="text-xs text-purple-400 font-medium">Selecionado</span>
                          )}
                        </div>
                        <p className="text-xs text-[#9b95ad] mt-0.5">{t.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setStep(1)}
              disabled={!canAdvance()}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proximo
            </button>
          </div>
        </div>
      )}

      {/* Step 2 - Basic Data */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Dados da integracao</h2>
            <p className="text-[#9b95ad] text-sm mt-1">Preencha as informacoes basicas</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#e2e0ea] mb-1.5">
                Nome da integracao <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: SAP ECC Producao"
                className="w-full px-4 py-2.5 bg-[#0f0b1a] border border-white/[0.08] rounded-lg text-sm text-[#e2e0ea] placeholder-[#9b95ad]/50 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e2e0ea] mb-1.5">
                Descricao
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descricao opcional da integracao"
                rows={3}
                className="w-full px-4 py-2.5 bg-[#0f0b1a] border border-white/[0.08] rounded-lg text-sm text-[#e2e0ea] placeholder-[#9b95ad]/50 focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#e2e0ea] mb-1.5">
                Cliente vinculado <span className="text-rose-400">*</span>
              </label>
              {clientsLoading ? (
                <p className="text-[#9b95ad] text-sm">Carregando clientes...</p>
              ) : (
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0f0b1a] border border-white/[0.08] rounded-lg text-sm text-[#e2e0ea] focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(0)}
              className="px-6 py-2.5 bg-white/[0.06] text-[#e2e0ea] text-sm font-medium rounded-lg hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!canAdvance()}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proximo
            </button>
          </div>
        </div>
      )}

      {/* Step 3 - Technical Config */}
      {step === 2 && selectedType && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Configuracao de conexao</h2>
            <p className="text-[#9b95ad] text-sm mt-1">
              Configure os parametros para <span className="text-purple-400">{selectedType.name}</span>
            </p>
          </div>

          <div className="space-y-4">
            {selectedType.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-[#e2e0ea] mb-1.5">
                  {field.label}
                  {field.required && <span className="text-rose-400"> *</span>}
                </label>
                {field.options ? (
                  <select
                    value={configValues[field.key] || ""}
                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0f0b1a] border border-white/[0.08] rounded-lg text-sm text-[#e2e0ea] focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">Selecione...</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "password" ? "password" : "text"}
                    value={configValues[field.key] || ""}
                    onChange={(e) => handleConfigChange(field.key, e.target.value)}
                    placeholder={field.placeholder || ""}
                    className="w-full px-4 py-2.5 bg-[#0f0b1a] border border-white/[0.08] rounded-lg text-sm text-[#e2e0ea] placeholder-[#9b95ad]/50 focus:outline-none focus:border-purple-500/50"
                  />
                )}
              </div>
            ))}

            {selectedType.fields.length === 0 && (
              <p className="text-[#9b95ad] text-sm">Nenhum campo de configuracao necessario para este tipo.</p>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 bg-white/[0.06] text-[#e2e0ea] text-sm font-medium rounded-lg hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canAdvance()}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proximo
            </button>
          </div>
        </div>
      )}

      {/* Step 4 - Review & Test */}
      {step === 3 && selectedType && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Revisar e testar</h2>
            <p className="text-[#9b95ad] text-sm mt-1">Confira os dados e teste a conexao</p>
          </div>

          {/* Summary Card */}
          <div className="bg-[#1a1527] rounded-xl p-5 border border-white/[0.08] space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#9b95ad] text-xs">Tipo</p>
                <p className="text-[#e2e0ea] font-medium">{selectedType.name}</p>
              </div>
              <div>
                <p className="text-[#9b95ad] text-xs">Nome</p>
                <p className="text-[#e2e0ea] font-medium">{name}</p>
              </div>
              <div>
                <p className="text-[#9b95ad] text-xs">Cliente</p>
                <p className="text-[#e2e0ea] font-medium">{selectedClientName}</p>
              </div>
              {description && (
                <div>
                  <p className="text-[#9b95ad] text-xs">Descricao</p>
                  <p className="text-[#e2e0ea] font-medium">{description}</p>
                </div>
              )}
            </div>

            {Object.keys(configValues).length > 0 && (
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-xs text-[#9b95ad] mb-2">Configuracao</p>
                <div className="space-y-1 text-sm">
                  {Object.entries(configValues).map(([key, val]) => {
                    const field = selectedType.fields.find((f) => f.key === key);
                    const isSecret = field?.type === "password" || key.toLowerCase().includes("password") || key.toLowerCase().includes("secret");
                    return (
                      <div key={key} className="flex gap-2">
                        <span className="text-purple-400 text-xs">{field?.label || key}:</span>
                        <span className="text-[#e2e0ea] text-xs">{isSecret ? "***" : val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Create / Test */}
          {!createdId ? (
            <div className="space-y-3">
              {createError && (
                <p className="text-rose-400 text-sm">{createError}</p>
              )}
              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-purple-400 transition-all cursor-pointer disabled:opacity-50"
              >
                {creating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Criando...
                  </span>
                ) : (
                  "Criar Integracao"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-400">
                Integracao criada com sucesso!
              </div>

              {/* Test Button */}
              {!testResult && (
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-cyan-500 hover:to-cyan-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  {testing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Testando conexao...
                    </span>
                  ) : (
                    "Testar Conexao"
                  )}
                </button>
              )}

              {/* Test Result */}
              {testResult && (
                <div
                  className={`rounded-xl p-5 border ${
                    testResult.success
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-rose-500/10 border-rose-500/20"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {testResult.success ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-emerald-400 font-medium">Conexao bem-sucedida</span>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-rose-400 font-medium">Falha na conexao</span>
                      </>
                    )}
                  </div>
                  <p className={`text-sm ${testResult.success ? "text-emerald-400/70" : "text-rose-400/70"}`}>
                    {testResult.message}
                  </p>
                  {testResult.details && Object.keys(testResult.details).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1">
                      {Object.entries(testResult.details).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-xs">
                          <span className="text-[#9b95ad]">{k}:</span>
                          <span className="text-[#e2e0ea]">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Go to Integrations */}
              <button
                onClick={() => router.push("/integrations")}
                className="w-full px-6 py-3 bg-white/[0.06] text-[#e2e0ea] text-sm font-medium rounded-lg hover:bg-white/[0.1] transition-colors cursor-pointer"
              >
                Ir para Integracoes
              </button>
            </div>
          )}

          {/* Back button (only before creation) */}
          {!createdId && (
            <div className="flex justify-start">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-white/[0.06] text-[#e2e0ea] text-sm font-medium rounded-lg hover:bg-white/[0.1] transition-colors cursor-pointer"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
