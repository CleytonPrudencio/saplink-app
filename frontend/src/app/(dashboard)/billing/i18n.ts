import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  // chrome / estados
  title: string;
  loading: string;
  loadError: string;
  loadErrorShort: string;
  // status labels (assinatura)
  statusTrialing: string;
  statusActive: string;
  statusPastDue: string;
  statusSuspended: string;
  statusCanceled: string;
  statusNone: string;
  // banners
  paidBanner: string;
  suspendedTitle: string;
  suspendedHint: string;
  // erros de ação
  checkoutError: string;
  payInvoiceError: string;
  autoRenewError: string;
  payNowError: string;
  portalError: string;
  addonsError: string;
  // resumo da assinatura
  subscription: string;
  plan: string;
  monthly: string;
  nextCharge: string;
  trialUntil: (date: string) => string;
  addons: string;
  addonsSummary: (int: number, users: number) => string;
  autoBilling: string;
  cardTag: string;
  autoBillingOnWithCard: string;
  autoBillingOnNoCard: string;
  autoBillingOff: string;
  turnOffAutoBilling: string;
  turnOnAddCard: string;
  openInvoiceLabel: string;
  payAnytimeHint: string;
  opening: string;
  manageCard: string;
  manageCardTitle: string;
  payNow: string;
  // uso
  usageClients: string;
  usageIntegrations: string;
  usageUsers: string;
  usageAiDiagnostics: string;
  // gastos
  spending: string;
  totalPaid: string;
  noPaidInvoices: string;
  // add-ons
  addonsTitle: string;
  addonsSubtitle: string;
  extraIntegrations: string;
  extraUsers: string;
  addonPriceEach: (price: string, base: number) => string;
  addonsCost: string;
  perMonth: (price: string) => string;
  monthSuffix: string;
  saving: string;
  saveAddons: string;
  // planos
  plans: string;
  subscribeRecurring: string;
  payOneTime: string;
  modeAutoHint: string;
  modeNowHint: string;
  mostPopular: string;
  unlimitedClients: string;
  clientsN: (n: number) => string;
  unlimitedIntegrations: string;
  integrationsN: (n: number) => string;
  aiDiagnosticsN: (n: number) => string;
  usersN: (n: number) => string;
  addonLine: (intPrice: string, userPrice: string) => string;
  processing: string;
  currentPlan: string;
  switchToThis: string;
  subscribe: string;
  // histórico de faturas
  invoiceHistory: string;
  noInvoices: string;
  colDate: string;
  colAmount: string;
  colStatus: string;
  colPdf: string;
  invPaid: string;
  invOpen: string;
  invFailed: string;
  payInvoiceNow: string;
  // gateway nota
  gatewayNote: string;
  // PDF da fatura (printInvoice)
  pdfInvoice: string;
  pdfNumber: string;
  pdfBilledTo: string;
  pdfItems: string;
  pdfDescription: string;
  pdfValue: string;
  pdfTotal: string;
  pdfStatusLabel: string;
  pdfStatusPaid: string;
  pdfStatusOpen: string;
  pdfStatusFailed: string;
  pdfSubscriptionItem: (planName: string | null) => string;
  pdfTagline: string;
  pdfFooter: string;
  pdfHtmlLang: string;
  dateLocale: string;
}> = {
  pt: {
    title: "Cobrança",
    loading: "Carregando...",
    loadError: "Erro ao carregar dados de cobrança.",
    loadErrorShort: "Erro ao carregar.",
    statusTrialing: "Em teste",
    statusActive: "Ativa",
    statusPastDue: "Pagamento pendente",
    statusSuspended: "Suspensa",
    statusCanceled: "Cancelada",
    statusNone: "Sem assinatura",
    paidBanner: "✓ Pagamento recebido! A assinatura é ativada assim que o gateway confirmar (alguns segundos).",
    suspendedTitle: "Assinatura inativa.",
    suspendedHint: "Escolha um plano abaixo para reativar o acesso.",
    checkoutError: "Não foi possível iniciar o pagamento.",
    payInvoiceError: "Não foi possível gerar o pagamento.",
    autoRenewError: "Não foi possível alterar a renovação.",
    payNowError: "Não foi possível abrir o pagamento.",
    portalError: "Não foi possível abrir o portal de cobrança.",
    addonsError: "Não foi possível atualizar os add-ons.",
    subscription: "Assinatura",
    plan: "Plano",
    monthly: "Mensalidade",
    nextCharge: "Próxima cobrança",
    trialUntil: (date) => `Teste até ${date}`,
    addons: "Add-ons",
    addonsSummary: (int, users) => `${int} int · ${users} user`,
    autoBilling: "Cobrança automática",
    cardTag: "cartão ✓",
    autoBillingOnWithCard: "Cobra sozinho no cartão cadastrado todo mês.",
    autoBillingOnNoCard: "Ative para cadastrar e validar o cartão no Stripe.",
    autoBillingOff: "Você paga manualmente cada fatura.",
    turnOffAutoBilling: "Desligar cobrança automática",
    turnOnAddCard: "Ligar e cadastrar cartão",
    openInvoiceLabel: "Fatura em aberto:",
    payAnytimeHint: "Pague a mensalidade atual quando quiser — na hora, sem esperar a data.",
    opening: "Abrindo…",
    manageCard: "💳 Gerenciar cartão",
    manageCardTitle: "Adicionar ou trocar o cartão no Stripe",
    payNow: "⚡ Pagar agora",
    usageClients: "Clientes",
    usageIntegrations: "Integrações",
    usageUsers: "Usuários",
    usageAiDiagnostics: "Diagnósticos IA (mês)",
    spending: "Gastos",
    totalPaid: "total pago",
    noPaidInvoices: "Sem faturas pagas ainda.",
    addonsTitle: "Add-ons",
    addonsSubtitle: "Estourou o limite do plano? Adicione capacidade sem trocar de plano.",
    extraIntegrations: "Integrações extras",
    extraUsers: "Usuários extras",
    addonPriceEach: (price, base) => `${price}/mês cada · plano inclui ${base}`,
    addonsCost: "Custo dos add-ons:",
    perMonth: (price) => `${price}/mês`,
    monthSuffix: "/mês",
    saving: "Salvando...",
    saveAddons: "Salvar add-ons",
    plans: "Planos",
    subscribeRecurring: "⟳ Assinar recorrente",
    payOneTime: "⚡ Pagar avulso",
    modeAutoHint: "Assinatura recorrente — cadastra o cartão no Stripe e cobra automático todo mês.",
    modeNowHint: "Pagamento avulso — paga a mensalidade na hora, sem renovação automática.",
    mostPopular: "MAIS POPULAR",
    unlimitedClients: "Clientes ilimitados",
    clientsN: (n) => `${n} clientes`,
    unlimitedIntegrations: "Integrações ilimitadas",
    integrationsN: (n) => `${n} integrações`,
    aiDiagnosticsN: (n) => `${n} diagnósticos IA/mês`,
    usersN: (n) => `${n} usuários`,
    addonLine: (intPrice, userPrice) => `add-on: ${intPrice}/int · ${userPrice}/user`,
    processing: "Processando...",
    currentPlan: "Plano atual",
    switchToThis: "Mudar para este",
    subscribe: "Assinar",
    invoiceHistory: "Histórico de faturas",
    noInvoices: "Nenhuma fatura ainda.",
    colDate: "Data",
    colAmount: "Valor",
    colStatus: "Status",
    colPdf: "PDF",
    invPaid: "Paga",
    invOpen: "Em aberto",
    invFailed: "Falhou",
    payInvoiceNow: "Pagar agora",
    gatewayNote: "Pagamento via Asaas (PIX, boleto, cartão) quando configurado. Sem gateway, o ambiente de teste ativa o plano direto.",
    pdfInvoice: "FATURA",
    pdfNumber: "Nº",
    pdfBilledTo: "Cobrado de",
    pdfItems: "Itens",
    pdfDescription: "Descrição",
    pdfValue: "Valor",
    pdfTotal: "Total",
    pdfStatusLabel: "Status",
    pdfStatusPaid: "PAGA",
    pdfStatusOpen: "EM ABERTO",
    pdfStatusFailed: "FALHOU",
    pdfSubscriptionItem: (planName) => `Assinatura SAPLINK${planName ? " — Plano " + planName : ""}`,
    pdfTagline: "Monitoramento de integrações SAP",
    pdfFooter: "SAPLINK · Documento gerado eletronicamente. Não possui valor fiscal.",
    pdfHtmlLang: "pt-BR",
    dateLocale: "pt-BR",
  },
  en: {
    title: "Billing",
    loading: "Loading...",
    loadError: "Failed to load billing data.",
    loadErrorShort: "Failed to load.",
    statusTrialing: "Trialing",
    statusActive: "Active",
    statusPastDue: "Payment due",
    statusSuspended: "Suspended",
    statusCanceled: "Canceled",
    statusNone: "No subscription",
    paidBanner: "✓ Payment received! The subscription activates as soon as the gateway confirms (a few seconds).",
    suspendedTitle: "Subscription inactive.",
    suspendedHint: "Choose a plan below to reactivate access.",
    checkoutError: "Could not start the payment.",
    payInvoiceError: "Could not generate the payment.",
    autoRenewError: "Could not change auto-renewal.",
    payNowError: "Could not open the payment.",
    portalError: "Could not open the billing portal.",
    addonsError: "Could not update the add-ons.",
    subscription: "Subscription",
    plan: "Plan",
    monthly: "Monthly fee",
    nextCharge: "Next charge",
    trialUntil: (date) => `Trial until ${date}`,
    addons: "Add-ons",
    addonsSummary: (int, users) => `${int} int · ${users} user`,
    autoBilling: "Automatic billing",
    cardTag: "card ✓",
    autoBillingOnWithCard: "Charges the saved card automatically every month.",
    autoBillingOnNoCard: "Enable it to register and validate the card on Stripe.",
    autoBillingOff: "You pay each invoice manually.",
    turnOffAutoBilling: "Turn off automatic billing",
    turnOnAddCard: "Turn on and register card",
    openInvoiceLabel: "Open invoice:",
    payAnytimeHint: "Pay the current monthly fee whenever you want — right away, without waiting for the due date.",
    opening: "Opening…",
    manageCard: "💳 Manage card",
    manageCardTitle: "Add or change the card on Stripe",
    payNow: "⚡ Pay now",
    usageClients: "Clients",
    usageIntegrations: "Integrations",
    usageUsers: "Users",
    usageAiDiagnostics: "AI diagnostics (month)",
    spending: "Spending",
    totalPaid: "total paid",
    noPaidInvoices: "No paid invoices yet.",
    addonsTitle: "Add-ons",
    addonsSubtitle: "Hit the plan limit? Add capacity without switching plans.",
    extraIntegrations: "Extra integrations",
    extraUsers: "Extra users",
    addonPriceEach: (price, base) => `${price}/mo each · plan includes ${base}`,
    addonsCost: "Add-ons cost:",
    perMonth: (price) => `${price}/mo`,
    monthSuffix: "/mo",
    saving: "Saving...",
    saveAddons: "Save add-ons",
    plans: "Plans",
    subscribeRecurring: "⟳ Subscribe recurring",
    payOneTime: "⚡ Pay one-time",
    modeAutoHint: "Recurring subscription — registers the card on Stripe and charges automatically every month.",
    modeNowHint: "One-time payment — pay the monthly fee right away, no automatic renewal.",
    mostPopular: "MOST POPULAR",
    unlimitedClients: "Unlimited clients",
    clientsN: (n) => `${n} clients`,
    unlimitedIntegrations: "Unlimited integrations",
    integrationsN: (n) => `${n} integrations`,
    aiDiagnosticsN: (n) => `${n} AI diagnostics/mo`,
    usersN: (n) => `${n} users`,
    addonLine: (intPrice, userPrice) => `add-on: ${intPrice}/int · ${userPrice}/user`,
    processing: "Processing...",
    currentPlan: "Current plan",
    switchToThis: "Switch to this",
    subscribe: "Subscribe",
    invoiceHistory: "Invoice history",
    noInvoices: "No invoices yet.",
    colDate: "Date",
    colAmount: "Amount",
    colStatus: "Status",
    colPdf: "PDF",
    invPaid: "Paid",
    invOpen: "Open",
    invFailed: "Failed",
    payInvoiceNow: "Pay now",
    gatewayNote: "Payment via Asaas (PIX, boleto, card) when configured. Without a gateway, the test environment activates the plan directly.",
    pdfInvoice: "INVOICE",
    pdfNumber: "No.",
    pdfBilledTo: "Billed to",
    pdfItems: "Items",
    pdfDescription: "Description",
    pdfValue: "Amount",
    pdfTotal: "Total",
    pdfStatusLabel: "Status",
    pdfStatusPaid: "PAID",
    pdfStatusOpen: "OPEN",
    pdfStatusFailed: "FAILED",
    pdfSubscriptionItem: (planName) => `SAPLINK subscription${planName ? " — " + planName + " plan" : ""}`,
    pdfTagline: "SAP integration monitoring",
    pdfFooter: "SAPLINK · Electronically generated document. Not a fiscal document.",
    pdfHtmlLang: "en",
    dateLocale: "en-US",
  },
  es: {
    title: "Facturación",
    loading: "Cargando...",
    loadError: "Error al cargar los datos de facturación.",
    loadErrorShort: "Error al cargar.",
    statusTrialing: "En prueba",
    statusActive: "Activa",
    statusPastDue: "Pago pendiente",
    statusSuspended: "Suspendida",
    statusCanceled: "Cancelada",
    statusNone: "Sin suscripción",
    paidBanner: "✓ ¡Pago recibido! La suscripción se activa en cuanto el gateway confirme (unos segundos).",
    suspendedTitle: "Suscripción inactiva.",
    suspendedHint: "Elige un plan abajo para reactivar el acceso.",
    checkoutError: "No se pudo iniciar el pago.",
    payInvoiceError: "No se pudo generar el pago.",
    autoRenewError: "No se pudo cambiar la renovación.",
    payNowError: "No se pudo abrir el pago.",
    portalError: "No se pudo abrir el portal de facturación.",
    addonsError: "No se pudieron actualizar los add-ons.",
    subscription: "Suscripción",
    plan: "Plan",
    monthly: "Mensualidad",
    nextCharge: "Próximo cobro",
    trialUntil: (date) => `Prueba hasta ${date}`,
    addons: "Add-ons",
    addonsSummary: (int, users) => `${int} int · ${users} user`,
    autoBilling: "Cobro automático",
    cardTag: "tarjeta ✓",
    autoBillingOnWithCard: "Cobra solo en la tarjeta registrada todos los meses.",
    autoBillingOnNoCard: "Actívalo para registrar y validar la tarjeta en Stripe.",
    autoBillingOff: "Pagas manualmente cada factura.",
    turnOffAutoBilling: "Desactivar cobro automático",
    turnOnAddCard: "Activar y registrar tarjeta",
    openInvoiceLabel: "Factura abierta:",
    payAnytimeHint: "Paga la mensualidad actual cuando quieras — al instante, sin esperar la fecha.",
    opening: "Abriendo…",
    manageCard: "💳 Gestionar tarjeta",
    manageCardTitle: "Agregar o cambiar la tarjeta en Stripe",
    payNow: "⚡ Pagar ahora",
    usageClients: "Clientes",
    usageIntegrations: "Integraciones",
    usageUsers: "Usuarios",
    usageAiDiagnostics: "Diagnósticos IA (mes)",
    spending: "Gastos",
    totalPaid: "total pagado",
    noPaidInvoices: "Sin facturas pagadas todavía.",
    addonsTitle: "Add-ons",
    addonsSubtitle: "¿Superaste el límite del plan? Agrega capacidad sin cambiar de plan.",
    extraIntegrations: "Integraciones extra",
    extraUsers: "Usuarios extra",
    addonPriceEach: (price, base) => `${price}/mes cada uno · el plan incluye ${base}`,
    addonsCost: "Costo de los add-ons:",
    perMonth: (price) => `${price}/mes`,
    monthSuffix: "/mes",
    saving: "Guardando...",
    saveAddons: "Guardar add-ons",
    plans: "Planes",
    subscribeRecurring: "⟳ Suscribir recurrente",
    payOneTime: "⚡ Pago único",
    modeAutoHint: "Suscripción recurrente — registra la tarjeta en Stripe y cobra automático todos los meses.",
    modeNowHint: "Pago único — paga la mensualidad al instante, sin renovación automática.",
    mostPopular: "MÁS POPULAR",
    unlimitedClients: "Clientes ilimitados",
    clientsN: (n) => `${n} clientes`,
    unlimitedIntegrations: "Integraciones ilimitadas",
    integrationsN: (n) => `${n} integraciones`,
    aiDiagnosticsN: (n) => `${n} diagnósticos IA/mes`,
    usersN: (n) => `${n} usuarios`,
    addonLine: (intPrice, userPrice) => `add-on: ${intPrice}/int · ${userPrice}/user`,
    processing: "Procesando...",
    currentPlan: "Plan actual",
    switchToThis: "Cambiar a este",
    subscribe: "Suscribir",
    invoiceHistory: "Historial de facturas",
    noInvoices: "Ninguna factura todavía.",
    colDate: "Fecha",
    colAmount: "Valor",
    colStatus: "Estado",
    colPdf: "PDF",
    invPaid: "Pagada",
    invOpen: "Abierta",
    invFailed: "Falló",
    payInvoiceNow: "Pagar ahora",
    gatewayNote: "Pago vía Asaas (PIX, boleto, tarjeta) cuando está configurado. Sin gateway, el entorno de prueba activa el plan directamente.",
    pdfInvoice: "FACTURA",
    pdfNumber: "N.º",
    pdfBilledTo: "Facturado a",
    pdfItems: "Ítems",
    pdfDescription: "Descripción",
    pdfValue: "Valor",
    pdfTotal: "Total",
    pdfStatusLabel: "Estado",
    pdfStatusPaid: "PAGADA",
    pdfStatusOpen: "ABIERTA",
    pdfStatusFailed: "FALLÓ",
    pdfSubscriptionItem: (planName) => `Suscripción SAPLINK${planName ? " — Plan " + planName : ""}`,
    pdfTagline: "Monitoreo de integraciones SAP",
    pdfFooter: "SAPLINK · Documento generado electrónicamente. No tiene valor fiscal.",
    pdfHtmlLang: "es",
    dateLocale: "es-419",
  },
};
