import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  // steps
  stepChooseType: string;
  stepBasicData: string;
  stepConfig: string;
  stepTestConnection: string;
  // navegação
  next: string;
  back: string;
  // step 1
  step1Title: string;
  step1Subtitle: string;
  loadingTypes: string;
  selected: string;
  // step 2
  step2Title: string;
  step2Subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  clientLabel: string;
  loadingClients: string;
  selectClient: string;
  environmentLabel: string;
  envDev: string;
  envHml: string;
  envPrd: string;
  environmentHint: string;
  // step 3
  step3Title: string;
  step3SubtitlePrefix: string;
  selectPlaceholder: string;
  noConfigFields: string;
  // step 4
  step4Title: string;
  step4Subtitle: string;
  summaryType: string;
  summaryName: string;
  summaryClient: string;
  summaryDescription: string;
  summaryConfig: string;
  testBannerTitle: string;
  testBannerText: string;
  testConnectionBtn: string;
  testingTitle: string;
  testingSubtitle: string;
  successTitle: string;
  successSubtitle: string;
  failTitle: string;
  failSubtitle: string;
  saveIntegration: string;
  fixConfig: string;
  testAgain: string;
  saveAnyway: string;
  // erros
  testError: string;
  createError: string;
}> = {
  pt: {
    stepChooseType: "Escolher Tipo",
    stepBasicData: "Dados Basicos",
    stepConfig: "Configuracao",
    stepTestConnection: "Testar Conexao",
    next: "Proximo",
    back: "Voltar",
    step1Title: "Escolha o tipo de integracao",
    step1Subtitle: "Selecione o tipo de sistema que deseja integrar",
    loadingTypes: "Carregando tipos...",
    selected: "Selecionado",
    step2Title: "Dados da integracao",
    step2Subtitle: "Preencha as informacoes basicas",
    nameLabel: "Nome da integracao",
    namePlaceholder: "Ex: SAP ECC Producao",
    descriptionLabel: "Descricao",
    descriptionPlaceholder: "Descricao opcional da integracao",
    clientLabel: "Cliente vinculado",
    loadingClients: "Carregando clientes...",
    selectClient: "Selecione um cliente",
    environmentLabel: "Ambiente",
    envDev: "Desenvolvimento",
    envHml: "Homologação",
    envPrd: "Produção",
    environmentHint: "Separa dev/homologação/produção do mesmo cliente — cada ambiente tem suas próprias integrações, credenciais e alertas.",
    step3Title: "Configuracao de conexao",
    step3SubtitlePrefix: "Configure os parametros para",
    selectPlaceholder: "Selecione...",
    noConfigFields: "Nenhum campo de configuracao necessario para este tipo.",
    step4Title: "Revisar e testar",
    step4Subtitle: "Confira os dados e teste a conexao",
    summaryType: "Tipo",
    summaryName: "Nome",
    summaryClient: "Cliente",
    summaryDescription: "Descricao",
    summaryConfig: "Configuracao",
    testBannerTitle: "🔌 Testar antes de salvar",
    testBannerText: "Vamos verificar se a conexão funciona antes de criar a integração.",
    testConnectionBtn: "Testar Conexão",
    testingTitle: "Testando conexão...",
    testingSubtitle: "Verificando configuração e conectividade",
    successTitle: "Conexão bem-sucedida!",
    successSubtitle: "Tudo pronto para salvar a integração.",
    failTitle: "Falha na conexão",
    failSubtitle: "Verifique as configurações e tente novamente.",
    saveIntegration: "✅ Salvar Integração",
    fixConfig: "← Corrigir Configuração",
    testAgain: "🔄 Testar Novamente",
    saveAnyway: "Salvar mesmo assim (a integração será criada com status de erro)",
    testError: "Erro ao testar conexão",
    createError: "Erro ao criar integração. Tente novamente.",
  },
  en: {
    stepChooseType: "Choose Type",
    stepBasicData: "Basic Data",
    stepConfig: "Configuration",
    stepTestConnection: "Test Connection",
    next: "Next",
    back: "Back",
    step1Title: "Choose the integration type",
    step1Subtitle: "Select the type of system you want to integrate",
    loadingTypes: "Loading types...",
    selected: "Selected",
    step2Title: "Integration data",
    step2Subtitle: "Fill in the basic information",
    nameLabel: "Integration name",
    namePlaceholder: "e.g. SAP ECC Production",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Optional integration description",
    clientLabel: "Linked client",
    loadingClients: "Loading clients...",
    selectClient: "Select a client",
    environmentLabel: "Environment",
    envDev: "Development",
    envHml: "Staging",
    envPrd: "Production",
    environmentHint: "Separates dev/staging/production for the same client — each environment has its own integrations, credentials, and alerts.",
    step3Title: "Connection configuration",
    step3SubtitlePrefix: "Configure the parameters for",
    selectPlaceholder: "Select...",
    noConfigFields: "No configuration field required for this type.",
    step4Title: "Review and test",
    step4Subtitle: "Review the data and test the connection",
    summaryType: "Type",
    summaryName: "Name",
    summaryClient: "Client",
    summaryDescription: "Description",
    summaryConfig: "Configuration",
    testBannerTitle: "🔌 Test before saving",
    testBannerText: "Let's check whether the connection works before creating the integration.",
    testConnectionBtn: "Test Connection",
    testingTitle: "Testing connection...",
    testingSubtitle: "Checking configuration and connectivity",
    successTitle: "Connection successful!",
    successSubtitle: "Everything is ready to save the integration.",
    failTitle: "Connection failed",
    failSubtitle: "Check the settings and try again.",
    saveIntegration: "✅ Save Integration",
    fixConfig: "← Fix Configuration",
    testAgain: "🔄 Test Again",
    saveAnyway: "Save anyway (the integration will be created with an error status)",
    testError: "Failed to test connection",
    createError: "Failed to create integration. Please try again.",
  },
  es: {
    stepChooseType: "Elegir Tipo",
    stepBasicData: "Datos Básicos",
    stepConfig: "Configuración",
    stepTestConnection: "Probar Conexión",
    next: "Siguiente",
    back: "Volver",
    step1Title: "Elija el tipo de integración",
    step1Subtitle: "Seleccione el tipo de sistema que desea integrar",
    loadingTypes: "Cargando tipos...",
    selected: "Seleccionado",
    step2Title: "Datos de la integración",
    step2Subtitle: "Complete la información básica",
    nameLabel: "Nombre de la integración",
    namePlaceholder: "Ej: SAP ECC Producción",
    descriptionLabel: "Descripción",
    descriptionPlaceholder: "Descripción opcional de la integración",
    clientLabel: "Cliente vinculado",
    loadingClients: "Cargando clientes...",
    selectClient: "Seleccione un cliente",
    environmentLabel: "Ambiente",
    envDev: "Desarrollo",
    envHml: "Homologación",
    envPrd: "Producción",
    environmentHint: "Separa dev/homologación/producción del mismo cliente — cada ambiente tiene sus propias integraciones, credenciales y alertas.",
    step3Title: "Configuración de conexión",
    step3SubtitlePrefix: "Configure los parámetros para",
    selectPlaceholder: "Seleccione...",
    noConfigFields: "Ningún campo de configuración necesario para este tipo.",
    step4Title: "Revisar y probar",
    step4Subtitle: "Revise los datos y pruebe la conexión",
    summaryType: "Tipo",
    summaryName: "Nombre",
    summaryClient: "Cliente",
    summaryDescription: "Descripción",
    summaryConfig: "Configuración",
    testBannerTitle: "🔌 Probar antes de guardar",
    testBannerText: "Vamos a verificar si la conexión funciona antes de crear la integración.",
    testConnectionBtn: "Probar Conexión",
    testingTitle: "Probando conexión...",
    testingSubtitle: "Verificando configuración y conectividad",
    successTitle: "¡Conexión exitosa!",
    successSubtitle: "Todo listo para guardar la integración.",
    failTitle: "Falla en la conexión",
    failSubtitle: "Verifique la configuración e intente nuevamente.",
    saveIntegration: "✅ Guardar Integración",
    fixConfig: "← Corregir Configuración",
    testAgain: "🔄 Probar Nuevamente",
    saveAnyway: "Guardar de todos modos (la integración se creará con estado de error)",
    testError: "Error al probar la conexión",
    createError: "Error al crear la integración. Intente nuevamente.",
  },
};
