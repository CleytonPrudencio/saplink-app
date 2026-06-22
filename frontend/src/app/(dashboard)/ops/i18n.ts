import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  // categorias (CATS)
  catAll: string;
  catPipo: string;
  catJob: string;
  catDump: string;
  catUpdateErr: string;
  catLock: string;
  catGateway: string;
  catHana: string;
  catSecurity: string;
  catPayment: string;
  catBank: string;
  catMasterdata: string;
  // header
  loading: string;
  title: string;
  subtitle: string;
  // cards
  openSignals: string;
  critical: string;
  high: string;
  // tabela
  thClient: string;
  thCategory: string;
  thSignal: string;
  thWhen: string;
  thSev: string;
  resolve: string;
  empty: string;
}> = {
  pt: {
    catAll: "Tudo",
    catPipo: "PI/PO",
    catJob: "Jobs (SM37)",
    catDump: "Dumps (ST22)",
    catUpdateErr: "Update (SM13)",
    catLock: "Locks (SM12)",
    catGateway: "Gateway/OData",
    catHana: "HANA",
    catSecurity: "Segurança/Patch",
    catPayment: "Pagamentos (F110)",
    catBank: "Extrato (MT940)",
    catMasterdata: "Dados mestre (BP)",
    loading: "Carregando...",
    title: "🩺 Basis & Operações",
    subtitle: "Saúde do landscape SAP coletada pelo agente: PI/PO, jobs, dumps ABAP, update errors, locks, Gateway/OData, HANA e segurança/patch — multi-cliente, numa tela só.",
    openSignals: "Sinais abertos",
    critical: "Críticos",
    high: "Altos",
    thClient: "Cliente",
    thCategory: "Categoria",
    thSignal: "Sinal",
    thWhen: "Quando",
    thSev: "Sev.",
    resolve: "Resolver",
    empty: "Sem sinais abertos. O agente envia estes dados via /api/agent/ops-signals.",
  },
  en: {
    catAll: "All",
    catPipo: "PI/PO",
    catJob: "Jobs (SM37)",
    catDump: "Dumps (ST22)",
    catUpdateErr: "Update (SM13)",
    catLock: "Locks (SM12)",
    catGateway: "Gateway/OData",
    catHana: "HANA",
    catSecurity: "Security/Patch",
    catPayment: "Payments (F110)",
    catBank: "Statement (MT940)",
    catMasterdata: "Master data (BP)",
    loading: "Loading...",
    title: "🩺 Basis & Operations",
    subtitle: "SAP landscape health collected by the agent: PI/PO, jobs, ABAP dumps, update errors, locks, Gateway/OData, HANA and security/patch — multi-client, on a single screen.",
    openSignals: "Open signals",
    critical: "Critical",
    high: "High",
    thClient: "Client",
    thCategory: "Category",
    thSignal: "Signal",
    thWhen: "When",
    thSev: "Sev.",
    resolve: "Resolve",
    empty: "No open signals. The agent sends this data via /api/agent/ops-signals.",
  },
  es: {
    catAll: "Todo",
    catPipo: "PI/PO",
    catJob: "Jobs (SM37)",
    catDump: "Dumps (ST22)",
    catUpdateErr: "Update (SM13)",
    catLock: "Locks (SM12)",
    catGateway: "Gateway/OData",
    catHana: "HANA",
    catSecurity: "Seguridad/Patch",
    catPayment: "Pagos (F110)",
    catBank: "Extracto (MT940)",
    catMasterdata: "Datos maestros (BP)",
    loading: "Cargando...",
    title: "🩺 Basis & Operaciones",
    subtitle: "Salud del landscape SAP recolectada por el agente: PI/PO, jobs, dumps ABAP, update errors, locks, Gateway/OData, HANA y seguridad/patch — multicliente, en una sola pantalla.",
    openSignals: "Señales abiertas",
    critical: "Críticos",
    high: "Altos",
    thClient: "Cliente",
    thCategory: "Categoría",
    thSignal: "Señal",
    thWhen: "Cuándo",
    thSev: "Sev.",
    resolve: "Resolver",
    empty: "Sin señales abiertas. El agente envía estos datos vía /api/agent/ops-signals.",
  },
};
