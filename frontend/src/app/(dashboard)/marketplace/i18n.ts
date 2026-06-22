import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  cancel: string;
  publishRunbook: string;
  namePlaceholder: string;
  descriptionPlaceholder: string;
  keywordsPlaceholder: string;
  stepsLabel: string;
  stepTitlePlaceholder: string;
  stepDetailPlaceholder: string;
  addStep: string;
  publishCheckbox: string;
  saveRunbook: string;
  saveError: string;
  tabExplore: string;
  tabMine: string;
  searchPlaceholder: string;
  allCategories: string;
  yours: string;
  byAuthor: (author: string) => string;
  stepsCount: (n: number | string) => string;
  installed: string;
  installedRemove: string;
  install: string;
  emptyExplore: string;
  emptyExplorePublishFirst: string;
  authoredTitle: string;
  unpublish: string;
  publish: string;
  delete: string;
  confirmDelete: string;
  publishedTag: string;
  draftTag: string;
  noAuthored: string;
  installedTitle: string;
  remove: string;
  noInstalled: string;
  byAuthorShort: (author: string) => string;
  installRunbook: string;
  yourRating: string;
  kindDiagnose: string;
  kindAction: string;
  kindValidate: string;
}> = {
  pt: {
    title: "Marketplace de Runbooks",
    subtitle: "Playbooks de correção SAP prontos: instale os da comunidade ou publique os seus. Cada runbook é um passo-a-passo (diagnóstico → ação → validação).",
    cancel: "Cancelar",
    publishRunbook: "+ Publicar runbook",
    namePlaceholder: "Nome do runbook",
    descriptionPlaceholder: "Descrição curta",
    keywordsPlaceholder: "Palavras-gatilho p/ recomendação (ex.: sold-to party, status 51) — separadas por vírgula",
    stepsLabel: "Passos:",
    stepTitlePlaceholder: "Título do passo",
    stepDetailPlaceholder: "Detalhe (transação/comando)",
    addStep: "+ passo",
    publishCheckbox: "Publicar no marketplace",
    saveRunbook: "Salvar runbook",
    saveError: "Erro ao salvar.",
    tabExplore: "Explorar",
    tabMine: "Meus runbooks",
    searchPlaceholder: "Buscar runbook…",
    allCategories: "Todas categorias",
    yours: "seu",
    byAuthor: (author) => `por ${author}`,
    stepsCount: (n) => `${n} passos`,
    installed: "Instalado",
    installedRemove: "✓ Instalado (remover)",
    install: "Instalar",
    emptyExplore: "Nenhum runbook publicado ainda.",
    emptyExplorePublishFirst: "Publique o primeiro!",
    authoredTitle: "Publicados/criados por você",
    unpublish: "Despublicar",
    publish: "Publicar",
    delete: "Excluir",
    confirmDelete: "Excluir runbook?",
    publishedTag: "publicado",
    draftTag: "rascunho",
    noAuthored: "Você ainda não criou runbooks.",
    installedTitle: "Instalados",
    remove: "Remover",
    noInstalled: "Nenhum runbook instalado. Vá em Explorar.",
    byAuthorShort: (author) => `por ${author}`,
    installRunbook: "Instalar runbook",
    yourRating: "Sua avaliação:",
    kindDiagnose: "Diagnóstico",
    kindAction: "Ação",
    kindValidate: "Validação",
  },
  en: {
    title: "Runbooks Marketplace",
    subtitle: "Ready-made SAP fix playbooks: install community ones or publish your own. Each runbook is a step-by-step (diagnose → action → validation).",
    cancel: "Cancel",
    publishRunbook: "+ Publish runbook",
    namePlaceholder: "Runbook name",
    descriptionPlaceholder: "Short description",
    keywordsPlaceholder: "Trigger keywords for recommendation (e.g. sold-to party, status 51) — comma-separated",
    stepsLabel: "Steps:",
    stepTitlePlaceholder: "Step title",
    stepDetailPlaceholder: "Detail (transaction/command)",
    addStep: "+ step",
    publishCheckbox: "Publish to the marketplace",
    saveRunbook: "Save runbook",
    saveError: "Failed to save.",
    tabExplore: "Explore",
    tabMine: "My runbooks",
    searchPlaceholder: "Search runbook…",
    allCategories: "All categories",
    yours: "yours",
    byAuthor: (author) => `by ${author}`,
    stepsCount: (n) => `${n} steps`,
    installed: "Installed",
    installedRemove: "✓ Installed (remove)",
    install: "Install",
    emptyExplore: "No runbook published yet.",
    emptyExplorePublishFirst: "Publish the first one!",
    authoredTitle: "Published/created by you",
    unpublish: "Unpublish",
    publish: "Publish",
    delete: "Delete",
    confirmDelete: "Delete runbook?",
    publishedTag: "published",
    draftTag: "draft",
    noAuthored: "You haven't created any runbooks yet.",
    installedTitle: "Installed",
    remove: "Remove",
    noInstalled: "No runbook installed. Go to Explore.",
    byAuthorShort: (author) => `by ${author}`,
    installRunbook: "Install runbook",
    yourRating: "Your rating:",
    kindDiagnose: "Diagnosis",
    kindAction: "Action",
    kindValidate: "Validation",
  },
  es: {
    title: "Marketplace de Runbooks",
    subtitle: "Playbooks de corrección SAP listos: instala los de la comunidad o publica los tuyos. Cada runbook es un paso a paso (diagnóstico → acción → validación).",
    cancel: "Cancelar",
    publishRunbook: "+ Publicar runbook",
    namePlaceholder: "Nombre del runbook",
    descriptionPlaceholder: "Descripción corta",
    keywordsPlaceholder: "Palabras clave para recomendación (ej.: sold-to party, status 51) — separadas por coma",
    stepsLabel: "Pasos:",
    stepTitlePlaceholder: "Título del paso",
    stepDetailPlaceholder: "Detalle (transacción/comando)",
    addStep: "+ paso",
    publishCheckbox: "Publicar en el marketplace",
    saveRunbook: "Guardar runbook",
    saveError: "Error al guardar.",
    tabExplore: "Explorar",
    tabMine: "Mis runbooks",
    searchPlaceholder: "Buscar runbook…",
    allCategories: "Todas las categorías",
    yours: "tuyo",
    byAuthor: (author) => `por ${author}`,
    stepsCount: (n) => `${n} pasos`,
    installed: "Instalado",
    installedRemove: "✓ Instalado (quitar)",
    install: "Instalar",
    emptyExplore: "Ningún runbook publicado aún.",
    emptyExplorePublishFirst: "¡Publica el primero!",
    authoredTitle: "Publicados/creados por ti",
    unpublish: "Despublicar",
    publish: "Publicar",
    delete: "Eliminar",
    confirmDelete: "¿Eliminar runbook?",
    publishedTag: "publicado",
    draftTag: "borrador",
    noAuthored: "Aún no has creado runbooks.",
    installedTitle: "Instalados",
    remove: "Quitar",
    noInstalled: "Ningún runbook instalado. Ve a Explorar.",
    byAuthorShort: (author) => `por ${author}`,
    installRunbook: "Instalar runbook",
    yourRating: "Tu valoración:",
    kindDiagnose: "Diagnóstico",
    kindAction: "Acción",
    kindValidate: "Validación",
  },
};
