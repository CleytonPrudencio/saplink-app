import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  newProcess: string;
  cancel: string;
  clientPlaceholder: string;
  processNamePlaceholder: string;
  stagesHint: string;
  stagePlaceholder: (n: number) => string;
  artifactPlaceholder: string;
  addStage: string;
  save: string;
  saveError: string;
  emptyNoProcess: string;
  selectProcess: string;
  statCompletion: string;
  statBiggestLoss: string;
  lastHours: (h: number | string) => string;
  okSuffix: string;
  failSuffix: string;
  advanced: (rate: number | string) => string;
  lostHere: (n: number | string) => string;
  gapBefore: string;
  gapDocs: (n: number | string) => string;
  gapAfter: string;
}> = {
  pt: {
    title: "Reconciliação ponta-a-ponta",
    subtitle: "“Entregue” não é “virou negócio”. Rastreia o documento pela jornada e mostra onde o volume se perde no caminho.",
    newProcess: "+ Novo processo",
    cancel: "Cancelar",
    clientPlaceholder: "Cliente...",
    processNamePlaceholder: "Nome do processo (ex.: Pedido → Faturamento)",
    stagesHint: "Estágios na ordem esperada (label + fonte + artefato/IFlow):",
    stagePlaceholder: (n) => `Estágio ${n} (ex.: Pedido)`,
    artifactPlaceholder: "Artefato/IFlow exato",
    addStage: "+ estágio",
    save: "Salvar",
    saveError: "Erro ao salvar.",
    emptyNoProcess: "Nenhum processo definido ainda. Crie um para mapear a jornada (ex.: Pedido CPI → Ordem → Fatura).",
    selectProcess: "Selecione um processo.",
    statCompletion: "Conclusão ponta-a-ponta",
    statBiggestLoss: "Maior perda",
    lastHours: (h) => `últimas ${h}h`,
    okSuffix: "ok",
    failSuffix: "falha",
    advanced: (rate) => `${rate}% avançou`,
    lostHere: (n) => `${n} perdido(s) aqui`,
    gapBefore: "Maior vazamento entre",
    gapDocs: (n) => `${n} documento(s) não avançaram.`,
    gapAfter: "Investigue esse trecho primeiro.",
  },
  en: {
    title: "End-to-end reconciliation",
    subtitle: "“Delivered” is not “became business”. It tracks the document through its journey and shows where volume is lost along the way.",
    newProcess: "+ New process",
    cancel: "Cancel",
    clientPlaceholder: "Client...",
    processNamePlaceholder: "Process name (e.g. Order → Billing)",
    stagesHint: "Stages in the expected order (label + source + artifact/IFlow):",
    stagePlaceholder: (n) => `Stage ${n} (e.g. Order)`,
    artifactPlaceholder: "Exact artifact/IFlow",
    addStage: "+ stage",
    save: "Save",
    saveError: "Failed to save.",
    emptyNoProcess: "No process defined yet. Create one to map the journey (e.g. Order CPI → Order → Invoice).",
    selectProcess: "Select a process.",
    statCompletion: "End-to-end completion",
    statBiggestLoss: "Biggest loss",
    lastHours: (h) => `last ${h}h`,
    okSuffix: "ok",
    failSuffix: "failed",
    advanced: (rate) => `${rate}% advanced`,
    lostHere: (n) => `${n} lost here`,
    gapBefore: "Biggest leak between",
    gapDocs: (n) => `${n} document(s) did not advance.`,
    gapAfter: "Investigate this segment first.",
  },
  es: {
    title: "Reconciliación de punta a punta",
    subtitle: "“Entregado” no es “se convirtió en negocio”. Rastrea el documento por su recorrido y muestra dónde se pierde el volumen en el camino.",
    newProcess: "+ Nuevo proceso",
    cancel: "Cancelar",
    clientPlaceholder: "Cliente...",
    processNamePlaceholder: "Nombre del proceso (ej.: Pedido → Facturación)",
    stagesHint: "Etapas en el orden esperado (label + fuente + artefacto/IFlow):",
    stagePlaceholder: (n) => `Etapa ${n} (ej.: Pedido)`,
    artifactPlaceholder: "Artefacto/IFlow exacto",
    addStage: "+ etapa",
    save: "Guardar",
    saveError: "Error al guardar.",
    emptyNoProcess: "Ningún proceso definido aún. Crea uno para mapear el recorrido (ej.: Pedido CPI → Orden → Factura).",
    selectProcess: "Selecciona un proceso.",
    statCompletion: "Finalización de punta a punta",
    statBiggestLoss: "Mayor pérdida",
    lastHours: (h) => `últimas ${h}h`,
    okSuffix: "ok",
    failSuffix: "falla",
    advanced: (rate) => `${rate}% avanzó`,
    lostHere: (n) => `${n} perdido(s) aquí`,
    gapBefore: "Mayor fuga entre",
    gapDocs: (n) => `${n} documento(s) no avanzaron.`,
    gapAfter: "Investiga este tramo primero.",
  },
};
