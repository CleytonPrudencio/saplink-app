import type { Lang } from "@/i18n/I18n";

export const T: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    adminOnly: string;
    planTitle: string;
    primary: string;
    fallback: string;
    none: string;
    learnLabelPrefix: string;
    learnLabelBold: string;
    learnLabelSuffix: string;
    connected: string;
    testing: string;
    testConnection: string;
    apiKey: string;
    apiKeySavedKeep: string;
    apiKeySaved: string;
    modelAnthropicPh: string;
    modelOpenaiPh: string;
    endpointPh: string;
    deploymentPh: string;
    connOk: (ms: number) => string;
    connFail: (err: string) => string;
    testError: string;
    saving: string;
    saveConfig: string;
    saved: string;
    saveError: string;
    keysNote: string;
    providers: { id: string; label: string; note: string }[];
  }
> = {
  pt: {
    title: "IA — sua própria inteligência",
    subtitle:
      "Conecte a IA da sua empresa (Claude, ChatGPT, Copilot), defina a ordem de uso e deixe o SAPLINK aprender com ela. A IA inclusa (Ollama) é sempre a reserva.",
    adminOnly: "Apenas o administrador da conta configura a IA.",
    planTitle: "Plano de uso (ordem)",
    primary: "Principal",
    fallback: "Reserva (fallback)",
    none: "(nenhuma)",
    learnLabelPrefix: "Deixar o SAPLINK ",
    learnLabelBold: "aprender",
    learnLabelSuffix:
      " com a IA externa (as respostas dela ensinam a IA inclusa — fica mais esperta com o tempo).",
    connected: "conectado",
    testing: "Testando…",
    testConnection: "Testar conexão",
    apiKey: "API key",
    apiKeySavedKeep: "API key (•••• salva — deixe em branco p/ manter)",
    apiKeySaved: "API key (•••• salva)",
    modelAnthropicPh: "modelo (ex.: claude-sonnet-4-20250514)",
    modelOpenaiPh: "modelo (ex.: gpt-4o-mini)",
    endpointPh: "endpoint (https://...openai.azure.com)",
    deploymentPh: "deployment (nome do modelo no Azure)",
    connOk: (ms) => `✓ Conexão OK (${ms}ms)`,
    connFail: (err) => `✗ ${err}`,
    testError: "Erro no teste.",
    saving: "Salvando…",
    saveConfig: "Salvar configuração",
    saved: "Configuração salva.",
    saveError: "Erro ao salvar.",
    keysNote:
      "As chaves são cifradas em repouso e usadas só para as chamadas de IA do seu tenant. Cada cliente usa a própria IA e arca com o próprio custo de uso.",
    providers: [
      { id: "ollama", label: "SAPLINK (IA inclusa)", note: "Ollama local, grátis. Sempre disponível como reserva." },
      { id: "anthropic", label: "Claude (Anthropic)", note: "Cole sua API key do console.anthropic.com." },
      { id: "openai", label: "ChatGPT (OpenAI)", note: "Cole sua API key do platform.openai.com." },
      { id: "azure", label: "Copilot (Azure OpenAI)", note: "Endpoint + deployment + chave do seu recurso Azure OpenAI." },
    ],
  },
  en: {
    title: "AI — your own intelligence",
    subtitle:
      "Connect your company's AI (Claude, ChatGPT, Copilot), set the order of use and let SAPLINK learn from it. The included AI (Ollama) is always the fallback.",
    adminOnly: "Only the account administrator configures the AI.",
    planTitle: "Usage plan (order)",
    primary: "Primary",
    fallback: "Fallback",
    none: "(none)",
    learnLabelPrefix: "Let SAPLINK ",
    learnLabelBold: "learn",
    learnLabelSuffix:
      " from the external AI (its answers teach the included AI — it gets smarter over time).",
    connected: "connected",
    testing: "Testing…",
    testConnection: "Test connection",
    apiKey: "API key",
    apiKeySavedKeep: "API key (•••• saved — leave blank to keep)",
    apiKeySaved: "API key (•••• saved)",
    modelAnthropicPh: "model (e.g.: claude-sonnet-4-20250514)",
    modelOpenaiPh: "model (e.g.: gpt-4o-mini)",
    endpointPh: "endpoint (https://...openai.azure.com)",
    deploymentPh: "deployment (model name in Azure)",
    connOk: (ms) => `✓ Connection OK (${ms}ms)`,
    connFail: (err) => `✗ ${err}`,
    testError: "Test error.",
    saving: "Saving…",
    saveConfig: "Save configuration",
    saved: "Configuration saved.",
    saveError: "Error saving.",
    keysNote:
      "Keys are encrypted at rest and used only for your tenant's AI calls. Each client uses its own AI and bears its own usage cost.",
    providers: [
      { id: "ollama", label: "SAPLINK (included AI)", note: "Local Ollama, free. Always available as fallback." },
      { id: "anthropic", label: "Claude (Anthropic)", note: "Paste your API key from console.anthropic.com." },
      { id: "openai", label: "ChatGPT (OpenAI)", note: "Paste your API key from platform.openai.com." },
      { id: "azure", label: "Copilot (Azure OpenAI)", note: "Endpoint + deployment + key from your Azure OpenAI resource." },
    ],
  },
  es: {
    title: "IA — tu propia inteligencia",
    subtitle:
      "Conecta la IA de tu empresa (Claude, ChatGPT, Copilot), define el orden de uso y deja que SAPLINK aprenda de ella. La IA incluida (Ollama) es siempre la reserva.",
    adminOnly: "Solo el administrador de la cuenta configura la IA.",
    planTitle: "Plan de uso (orden)",
    primary: "Principal",
    fallback: "Reserva (fallback)",
    none: "(ninguna)",
    learnLabelPrefix: "Dejar que SAPLINK ",
    learnLabelBold: "aprenda",
    learnLabelSuffix:
      " de la IA externa (sus respuestas enseñan a la IA incluida — se vuelve más inteligente con el tiempo).",
    connected: "conectado",
    testing: "Probando…",
    testConnection: "Probar conexión",
    apiKey: "API key",
    apiKeySavedKeep: "API key (•••• guardada — déjala en blanco para mantenerla)",
    apiKeySaved: "API key (•••• guardada)",
    modelAnthropicPh: "modelo (ej.: claude-sonnet-4-20250514)",
    modelOpenaiPh: "modelo (ej.: gpt-4o-mini)",
    endpointPh: "endpoint (https://...openai.azure.com)",
    deploymentPh: "deployment (nombre del modelo en Azure)",
    connOk: (ms) => `✓ Conexión OK (${ms}ms)`,
    connFail: (err) => `✗ ${err}`,
    testError: "Error en la prueba.",
    saving: "Guardando…",
    saveConfig: "Guardar configuración",
    saved: "Configuración guardada.",
    saveError: "Error al guardar.",
    keysNote:
      "Las claves se cifran en reposo y se usan solo para las llamadas de IA de tu tenant. Cada cliente usa su propia IA y asume su propio costo de uso.",
    providers: [
      { id: "ollama", label: "SAPLINK (IA incluida)", note: "Ollama local, gratis. Siempre disponible como reserva." },
      { id: "anthropic", label: "Claude (Anthropic)", note: "Pega tu API key de console.anthropic.com." },
      { id: "openai", label: "ChatGPT (OpenAI)", note: "Pega tu API key de platform.openai.com." },
      { id: "azure", label: "Copilot (Azure OpenAI)", note: "Endpoint + deployment + clave de tu recurso Azure OpenAI." },
    ],
  },
};
