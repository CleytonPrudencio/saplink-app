import type { Lang } from "@/i18n/I18n";

export const T: Record<Lang, {
  title: string;
  subtitle: string;
  explainScreen: string;
  loading: string;
  cardCleanCore: string;
  cardUpgradeBreaking: string;
  cardUpgradeFindings: string;
  cardFiscalBlocked: string;
  cardFiscalAtRisk: string;
  cardCommExpiring: string;
  cardEventsDeadLetter: string;
  cardApisDeprecated: string;
  commTitle: string;
  certPrefix: string;
  noArrangements: string;
  apisTitle: string;
  apisDeprecatedSuffix: (n: number) => string;
  calls30d: (n: string) => string;
  deprecatesIn: (release: string) => string;
  apiOk: string;
  noInventory: string;
  s4ConnectTitle: string;
  configuring: string;
  s4ConnectDesc1: string;
  s4ConnectMid: string;
  s4ConnectHub: string;
  s4ConnectDesc2: string;
  lastSync: string;
  never: string;
  keySaved: string;
  noKey: string;
  syncNow: string;
  clientPlaceholder: string;
  apiKeyPlaceholder: string;
  connectAndSync: string;
  connecting: string;
  cpiConnectTitle: string;
  cpiConnectDesc: string;
  baseUrlPlaceholder: string;
  tokenUrlPlaceholder: string;
  saveConnection: string;
  saving: string;
  footer: string;
  msgSaved: string;
  errSave: string;
  syncOk: (fetched: number) => string;
  syncFail: (reason: string) => string;
  errSync: string;
  s4SyncOk: (reachable: number, probed: number, deprecated: number) => string;
  s4SyncSaved: string;
  errConnect: string;
  s4ResyncOk: (reachable: number, probed: number) => string;
  s4ResyncNone: string;
}> = {
  pt: {
    title: "S/4HANA Cloud",
    subtitle: "Operação, governança de Clean Core e fiscal do seu S/4HANA Cloud — sem agente, via Communication Arrangement.",
    explainScreen: "Visão geral S/4HANA Cloud",
    loading: "Carregando...",
    cardCleanCore: "Clean Core Score",
    cardUpgradeBreaking: "Quebras no próximo upgrade",
    cardUpgradeFindings: "Achados de upgrade",
    cardFiscalBlocked: "Docs fiscais bloqueados",
    cardFiscalAtRisk: "R$ fiscal em risco",
    cardCommExpiring: "Certs/arranjos expirando",
    cardEventsDeadLetter: "Eventos em dead-letter",
    cardApisDeprecated: "APIs depreciadas em uso",
    commTitle: "Communication Arrangements",
    certPrefix: "cert",
    noArrangements: "Nenhum arranjo ainda.",
    apisTitle: "APIs liberadas consumidas",
    apisDeprecatedSuffix: (n) => `(${n} depreciadas)`,
    calls30d: (n) => `${n} chamadas/30d`,
    deprecatesIn: (release) => `depreca ${release}`,
    apiOk: "ok",
    noInventory: "Sem inventário ainda.",
    s4ConnectTitle: "Conectar S/4HANA Cloud (sandbox SAP) — dados reais sem S-user",
    configuring: "Configurando",
    s4ConnectDesc1: "Cole a ",
    s4ConnectMid: " do ",
    s4ConnectHub: "SAP Business Accelerator Hub",
    s4ConnectDesc2: " (api.sap.com → qualquer API S/4HANA Cloud → \"Show API Key\"). O SAPLINK chama as APIs OData reais do S/4 de demonstração e inventaria o uso.",
    lastSync: "último sync",
    never: "nunca",
    keySaved: "chave salva",
    noKey: "sem chave",
    syncNow: "Sincronizar agora",
    clientPlaceholder: "Cliente...",
    apiKeyPlaceholder: "API Key do api.sap.com",
    connectAndSync: "Conectar e sincronizar",
    connecting: "Conectando...",
    cpiConnectTitle: "Conectar SAP Integration Suite (BTP) — dados reais",
    cpiConnectDesc: "Cole o service key (OAuth client-credentials) do Process Integration Runtime. O SAPLINK puxa os Message Processing Logs reais.",
    baseUrlPlaceholder: "URL da API (…/api/v1)",
    tokenUrlPlaceholder: "tokenurl (…/oauth/token)",
    saveConnection: "Salvar conexão",
    saving: "Salvando...",
    footer: "No S/4HANA Cloud o SAPLINK conecta via Communication Arrangement (OAuth/cert) e puxa por OData — sem instalar nada no cliente.",
    msgSaved: "Conexão salva. Clique em Sincronizar.",
    errSave: "Erro ao salvar.",
    syncOk: (fetched) => `Sincronizado: ${fetched} MPL.`,
    syncFail: (reason) => `Falhou: ${reason}`,
    errSync: "Erro ao sincronizar.",
    s4SyncOk: (reachable, probed, deprecated) => `Conectado ao S/4 sandbox: ${reachable}/${probed} APIs reais, ${deprecated} depreciada(s).`,
    s4SyncSaved: "Salvo, mas nenhuma API respondeu — confira a API Key.",
    errConnect: "Erro ao conectar.",
    s4ResyncOk: (reachable, probed) => `Sincronizado: ${reachable}/${probed} APIs reais.`,
    s4ResyncNone: "Nenhuma API respondeu — confira a API Key.",
  },
  en: {
    title: "S/4HANA Cloud",
    subtitle: "Operations, Clean Core governance and tax compliance for your S/4HANA Cloud — agentless, via Communication Arrangement.",
    explainScreen: "S/4HANA Cloud overview",
    loading: "Loading...",
    cardCleanCore: "Clean Core Score",
    cardUpgradeBreaking: "Breaking changes in next upgrade",
    cardUpgradeFindings: "Upgrade findings",
    cardFiscalBlocked: "Blocked tax documents",
    cardFiscalAtRisk: "Tax value at risk",
    cardCommExpiring: "Certs/arrangements expiring",
    cardEventsDeadLetter: "Events in dead-letter",
    cardApisDeprecated: "Deprecated APIs in use",
    commTitle: "Communication Arrangements",
    certPrefix: "cert",
    noArrangements: "No arrangements yet.",
    apisTitle: "Released APIs consumed",
    apisDeprecatedSuffix: (n) => `(${n} deprecated)`,
    calls30d: (n) => `${n} calls/30d`,
    deprecatesIn: (release) => `deprecated ${release}`,
    apiOk: "ok",
    noInventory: "No inventory yet.",
    s4ConnectTitle: "Connect S/4HANA Cloud (SAP sandbox) — real data without S-user",
    configuring: "Configuring",
    s4ConnectDesc1: "Paste the ",
    s4ConnectMid: " from the ",
    s4ConnectHub: "SAP Business Accelerator Hub",
    s4ConnectDesc2: " (api.sap.com → any S/4HANA Cloud API → \"Show API Key\"). SAPLINK calls the real OData APIs of the demo S/4 and inventories usage.",
    lastSync: "last sync",
    never: "never",
    keySaved: "key saved",
    noKey: "no key",
    syncNow: "Sync now",
    clientPlaceholder: "Client...",
    apiKeyPlaceholder: "API Key from api.sap.com",
    connectAndSync: "Connect and sync",
    connecting: "Connecting...",
    cpiConnectTitle: "Connect SAP Integration Suite (BTP) — real data",
    cpiConnectDesc: "Paste the service key (OAuth client-credentials) from the Process Integration Runtime. SAPLINK pulls the real Message Processing Logs.",
    baseUrlPlaceholder: "API URL (…/api/v1)",
    tokenUrlPlaceholder: "tokenurl (…/oauth/token)",
    saveConnection: "Save connection",
    saving: "Saving...",
    footer: "On S/4HANA Cloud, SAPLINK connects via Communication Arrangement (OAuth/cert) and pulls over OData — with nothing installed on the client.",
    msgSaved: "Connection saved. Click Sync.",
    errSave: "Error saving.",
    syncOk: (fetched) => `Synced: ${fetched} MPL.`,
    syncFail: (reason) => `Failed: ${reason}`,
    errSync: "Error syncing.",
    s4SyncOk: (reachable, probed, deprecated) => `Connected to S/4 sandbox: ${reachable}/${probed} real APIs, ${deprecated} deprecated.`,
    s4SyncSaved: "Saved, but no API responded — check the API Key.",
    errConnect: "Error connecting.",
    s4ResyncOk: (reachable, probed) => `Synced: ${reachable}/${probed} real APIs.`,
    s4ResyncNone: "No API responded — check the API Key.",
  },
  es: {
    title: "S/4HANA Cloud",
    subtitle: "Operación, gobernanza de Clean Core y fiscal de tu S/4HANA Cloud — sin agente, vía Communication Arrangement.",
    explainScreen: "Visión general S/4HANA Cloud",
    loading: "Cargando...",
    cardCleanCore: "Clean Core Score",
    cardUpgradeBreaking: "Rupturas en el próximo upgrade",
    cardUpgradeFindings: "Hallazgos de upgrade",
    cardFiscalBlocked: "Documentos fiscales bloqueados",
    cardFiscalAtRisk: "Valor fiscal en riesgo",
    cardCommExpiring: "Certs/arreglos por vencer",
    cardEventsDeadLetter: "Eventos en dead-letter",
    cardApisDeprecated: "APIs obsoletas en uso",
    commTitle: "Communication Arrangements",
    certPrefix: "cert",
    noArrangements: "Aún no hay arreglos.",
    apisTitle: "APIs liberadas consumidas",
    apisDeprecatedSuffix: (n) => `(${n} obsoletas)`,
    calls30d: (n) => `${n} llamadas/30d`,
    deprecatesIn: (release) => `obsoleta ${release}`,
    apiOk: "ok",
    noInventory: "Aún no hay inventario.",
    s4ConnectTitle: "Conectar S/4HANA Cloud (sandbox SAP) — datos reales sin S-user",
    configuring: "Configurando",
    s4ConnectDesc1: "Pega la ",
    s4ConnectMid: " del ",
    s4ConnectHub: "SAP Business Accelerator Hub",
    s4ConnectDesc2: " (api.sap.com → cualquier API S/4HANA Cloud → \"Show API Key\"). SAPLINK llama a las APIs OData reales del S/4 de demostración e inventaria el uso.",
    lastSync: "último sync",
    never: "nunca",
    keySaved: "clave guardada",
    noKey: "sin clave",
    syncNow: "Sincronizar ahora",
    clientPlaceholder: "Cliente...",
    apiKeyPlaceholder: "API Key de api.sap.com",
    connectAndSync: "Conectar y sincronizar",
    connecting: "Conectando...",
    cpiConnectTitle: "Conectar SAP Integration Suite (BTP) — datos reales",
    cpiConnectDesc: "Pega el service key (OAuth client-credentials) del Process Integration Runtime. SAPLINK extrae los Message Processing Logs reales.",
    baseUrlPlaceholder: "URL de la API (…/api/v1)",
    tokenUrlPlaceholder: "tokenurl (…/oauth/token)",
    saveConnection: "Guardar conexión",
    saving: "Guardando...",
    footer: "En S/4HANA Cloud, SAPLINK conecta vía Communication Arrangement (OAuth/cert) y extrae por OData — sin instalar nada en el cliente.",
    msgSaved: "Conexión guardada. Haz clic en Sincronizar.",
    errSave: "Error al guardar.",
    syncOk: (fetched) => `Sincronizado: ${fetched} MPL.`,
    syncFail: (reason) => `Falló: ${reason}`,
    errSync: "Error al sincronizar.",
    s4SyncOk: (reachable, probed, deprecated) => `Conectado al S/4 sandbox: ${reachable}/${probed} APIs reales, ${deprecated} obsoleta(s).`,
    s4SyncSaved: "Guardado, pero ninguna API respondió — revisa la API Key.",
    errConnect: "Error al conectar.",
    s4ResyncOk: (reachable, probed) => `Sincronizado: ${reachable}/${probed} APIs reales.`,
    s4ResyncNone: "Ninguna API respondió — revisa la API Key.",
  },
};
